import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DAY_MS = 86_400_000

// 12 节 (not 气) — used for big luck calculation
const JIE_NAMES = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒']

// Approximate 节 dates for a standard year (month, day)
const JIE_APPROX = [
  [2, 4],   // 立春
  [3, 6],   // 惊蛰
  [4, 5],   // 清明
  [5, 6],   // 立夏
  [6, 6],   // 芒种
  [7, 7],   // 小暑
  [8, 7],   // 立秋
  [9, 8],   // 白露
  [10, 8],  // 寒露
  [11, 7],  // 立冬
  [12, 7],  // 大雪
  [1, 6],   // 小寒 (next year for months 1-2)
]

function getApproxJieDate(year, jieIndex) {
  const [m, d] = JIE_APPROX[jieIndex]
  const targetYear = (jieIndex === 11 && m === 1) ? year + 1 : year
  return new Date(Date.UTC(targetYear, m - 1, d))
}

/**
 * Extract exact solar term dates from chart data text.
 * Parses formats like: "节气:1955年02月04日" or "立春:1955-02-04"
 */
function parseSolarTerms(chartText) {
  if (!chartText || typeof chartText !== 'string') return null
  const terms = {}
  // Format 1: "节气:1955年02月04日 06:17:36 (立春)" or "上一个:节气:1955年02月04日 (立春)"
  const pattern1 = /节气.*?(\d{4})年(\d{1,2})月(\d{1,2})日.*?[(（](立春|惊蛰|清明|立夏|芒种|小暑|立秋|白露|寒露|立冬|大雪|小寒)[)）]/g
  let match
  while ((match = pattern1.exec(chartText)) !== null) {
    const name = match[4]
    const y = Number(match[1]); const mo = Number(match[2]); const d = Number(match[3])
    if (!terms[name]) terms[name] = new Date(Date.UTC(y, mo - 1, d))  // don't overwrite with later years
  }
  // Format 2: "立春: 1955-02-04"
  const pattern2 = /(立春|惊蛰|清明|立夏|芒种|小暑|立秋|白露|寒露|立冬|大雪|小寒)[:：]\s*(\d{4})[年-](\d{1,2})[月-](\d{1,2})/g
  while ((match = pattern2.exec(chartText)) !== null) {
    const name = match[1]
    if (!terms[name]) {
      terms[name] = new Date(Date.UTC(Number(match[2]), Number(match[3]) - 1, Number(match[4])))
    }
  }
  return Object.keys(terms).length >= 2 ? terms : null
}

/**
 * Calculate 起运 information for a given birth date and gender.
 *
 * @param {string} birthDate - YYYY-MM-DD
 * @param {string} gender - '男' or '女'
 * @param {object} options
 * @param {string} [options.yearGan] - override auto-detected 年干
 * @param {string} [options.chartText] - chart data text for exact solar terms
 * @returns {object}
 */
export function calculateBigLuck(birthDate, gender, options = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('birthDate must be YYYY-MM-DD')
  if (!['男', '女'].includes(gender)) throw new Error('gender must be 男 or 女')

  const [y, m, d] = birthDate.split('-').map(Number)
  const birth = new Date(Date.UTC(y, m - 1, d))
  const year = birth.getUTCFullYear()

  // Determine 年干
  const yearGan = options.yearGan || STEMS[(year - 4) % 10]
  const isYang = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan)
  const isMale = gender === '男'

  // 阳年男/阴年女 → 顺排; 阴年男/阳年女 → 逆排
  const forward = (isYang && isMale) || (!isYang && !isMale)

  // Try to get exact solar terms from chart data
  const exactTerms = options.chartText ? parseSolarTerms(options.chartText) : null
  const useExact = exactTerms !== null

  // Find which 节 the birth date is after (the 月令起点)
  let zhiMonth = -1
  for (let i = 0; i < 12; i++) {
    const jie = exactTerms
      ? exactTerms[JIE_NAMES[i]]
      : getApproxJieDate(year, i)
    if (jie && birth >= jie) zhiMonth = i
  }
  if (zhiMonth < 0 && exactTerms) {
    // Birth before first 节 — use month 12 of previous year
    zhiMonth = 11
  }

  // Find target 节
  let targetJie, targetName, days
  if (forward) {
    // Next 节
    const nextIdx = (zhiMonth + 1) % 12
    targetName = JIE_NAMES[nextIdx]
    targetJie = exactTerms
      ? exactTerms[targetName]
      : getApproxJieDate(year, nextIdx)
    if (!targetJie) {
      // Fallback: approximate
      targetJie = getApproxJieDate(year, nextIdx)
    }
    days = Math.round((targetJie.getTime() - birth.getTime()) / DAY_MS)
  } else {
    // Previous 节 (the one that defines the current month)
    targetName = JIE_NAMES[zhiMonth]
    targetJie = exactTerms
      ? exactTerms[targetName]
      : getApproxJieDate(year, zhiMonth)
    if (!targetJie) {
      targetJie = getApproxJieDate(year, zhiMonth)
    }
    days = Math.round((birth.getTime() - targetJie.getTime()) / DAY_MS)
  }

  const startAge = Math.round((days / 3) * 10) / 10

  return {
    birthDate,
    gender,
    yearGan,
    yearType: isYang ? '阳年' : '阴年',
    direction: forward ? '顺排' : '逆排',
    currentMonthJie: JIE_NAMES[zhiMonth],
    targetJie: targetName,
    days,
    startAge, // 起运岁数
    formula: '起运岁数 = 距节气天数 ÷ 3',
    precision: useExact ? 'chart-derived' : 'approximate',
    note: useExact
      ? '节气日期从命盘数据提取，起运岁数精确。'
      : '节气日期为近似值(±1天)，起运岁数误差约±0.3岁。精确计算请提供爱占星导出的八字排盘文本。',
  }
}

function parseCli(argv) {
  const date = argv.find(a => /^\d{4}-\d{2}-\d{2}$/.test(a))
  const gender = argv.includes('男') ? '男' : argv.includes('女') ? '女' : null
  const yearGanArg = argv.find(a => a.startsWith('--year-gan='))
  const chartFile = argv.find(a => a.startsWith('--chart='))
  if (!date) throw new Error('usage: calculate-big-luck.mjs YYYY-MM-DD 男|女 [--year-gan=甲] [--chart=path/to/bazi.txt]')
  if (!gender) throw new Error('must specify 男 or 女')
  const opts = {}
  if (yearGanArg) opts.yearGan = yearGanArg.slice('--year-gan='.length)
  if (chartFile) {
    const f = chartFile.slice('--chart='.length)
    if (fs.existsSync(f)) opts.chartText = fs.readFileSync(f, 'utf8')
  }
  return { date, gender, options: opts }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isCli) {
  try {
    const { date, gender, options } = parseCli(process.argv.slice(2))
    console.log(JSON.stringify(calculateBigLuck(date, gender, options), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
