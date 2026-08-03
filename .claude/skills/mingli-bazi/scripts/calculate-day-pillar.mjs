import path from 'node:path'
import { fileURLToPath } from 'node:url'

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const DAY_MS = 86_400_000
const ANCHOR_UTC = Date.UTC(2000, 0, 1)
const ANCHOR_INDEX = 54 // 2000-01-01 = 戊午

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

export function parseCivilDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) throw new Error('date must use YYYY-MM-DD')
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utc = Date.UTC(year, month - 1, day)
  const check = new Date(utc)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error(`invalid Gregorian date: ${value}`)
  }
  return { year, month, day, utc }
}

function formatDate({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function calculateDayPillar(dateValue, options = {}) {
  const boundary = options.dayBoundary || 'midnight'
  if (!['midnight', 'zi-hour'].includes(boundary)) {
    throw new Error('dayBoundary must be midnight or zi-hour')
  }
  const parsed = parseCivilDate(dateValue)
  let effectiveUtc = parsed.utc
  if (boundary === 'zi-hour') {
    if (!/^\d{2}:\d{2}$/.test(options.time || '')) throw new Error('zi-hour boundary requires time in HH:MM')
    const [hour, minute] = options.time.split(':').map(Number)
    if (hour > 23 || minute > 59) throw new Error(`invalid time: ${options.time}`)
    if (hour === 23) effectiveUtc += DAY_MS
  }
  const daysFromAnchor = Math.round((effectiveUtc - ANCHOR_UTC) / DAY_MS)
  const index = positiveModulo(ANCHOR_INDEX + daysFromAnchor, 60)
  const pillar = STEMS[index % 10] + BRANCHES[index % 12]
  const effective = new Date(effectiveUtc)
  return {
    inputDate: dateValue,
    effectiveDate: formatDate({
      year: effective.getUTCFullYear(),
      month: effective.getUTCMonth() + 1,
      day: effective.getUTCDate(),
    }),
    dayBoundary: boundary,
    time: options.time || null,
    daysFromAnchor,
    sexagenaryIndex: index,
    pillar,
    anchor: '2000-01-01=戊午(index 54)',
    limitation: '只校验公历日柱；不计算节气月柱、真太阳时或起运岁数。',
  }
}

function parseCli(argv) {
  const date = argv.find((arg) => !arg.startsWith('--'))
  const timeArg = argv.find((arg) => arg.startsWith('--time='))
  const boundaryArg = argv.find((arg) => arg.startsWith('--day-boundary='))
  if (!date) throw new Error('usage: calculate-day-pillar.mjs YYYY-MM-DD [--time=HH:MM] [--day-boundary=midnight|zi-hour]')
  return {
    date,
    time: timeArg?.slice('--time='.length),
    dayBoundary: boundaryArg?.slice('--day-boundary='.length) || 'midnight',
  }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isCli) {
  try {
    const options = parseCli(process.argv.slice(2))
    console.log(JSON.stringify(calculateDayPillar(options.date, options), null, 2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
