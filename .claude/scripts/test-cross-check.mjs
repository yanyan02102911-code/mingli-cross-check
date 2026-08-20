import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const workflowPath = path.join(here, '..', 'workflows', 'cross-check.js')
const source = fs.readFileSync(workflowPath, 'utf8').replace(/^export const meta\s*=/m, 'const meta =')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const execute = new AsyncFunction('args', 'phase', 'log', 'agent', 'parallel', source)

const analystReport = (system) => `# ${system}模拟报告

## 核心结构
正文。

<!-- CROSS_DIGEST_START -->
{"system":"${system}","dimensions":[{"dimension":"事业方向与职业路径","claim":"模拟主张","direction":"mixed","data_quality":"complete","evidence_strength":"medium","basis":["依据A"],"limitations":["限制A"],"time_window":null}]}
<!-- CROSS_DIGEST_END -->`

async function run(args, testOptions = {}) {
  const calls = []
  const agent = async (prompt, options) => {
    calls.push({ prompt, options })
    if (testOptions.failLabel && options.label === testOptions.failLabel) throw new Error('模拟失败')
    if (prompt.includes('跨方法比较者')) {
      return '## 总览\n\n模拟总览。\n\n## 逐维度比较\n\n模拟交叉结果。\n\n## 数据与方法限制\n\n模拟。'
    }
    if (prompt.includes('总览')) return '## 总览\n\n模拟深度总览。'
    // Return appropriate report per system
    const sys = options.label
    const map = { '八字': 'bazi', '紫微斗数': 'ziwei', '印度占星': 'vedic', '现代占星': 'modern' }
    return analystReport(map[sys] || 'bazi')
  }
  const parallel = async (tasks) => Promise.all(tasks.map(t => t()))
  const result = await execute(args, () => {}, () => {}, agent, parallel)
  return { result, calls }
}

const completeCharts = {
  name: '虚构命主',
  birth: '1990-01-01 12:00',
  birthplace: '某地',
  gender: '女',
  bazi: '年柱甲子 月柱丙寅 日柱戊辰 时柱庚申',
  ziwei: '命宫寅紫微天府 兄弟卯天机 夫妻辰太阳 子女巳武曲 财帛午天同 疾厄未廉贞 迁移申破军 交友酉文昌 官禄戌左辅 田宅亥右弼 福德子天魁 父母丑天钺。命主文曲身主火星金四局',
  vedic: 'Lagna 15° Aries Mula Nakshatra. Sun 10° Taurus Krittika. Moon 20° Gemini Ardra. Mars 5° Leo. D-1 Rasi. Ayanamsa Lahiri. Vimshottari Dasha: Moon 2010-2020.',
  modern: 'ASC 15°43 Capricorn. Sun 10°22 Libra 9H. Moon 20°55 Sagittarius 12H. Mercury 29° Virgo 8H. Venus 15° Scorpio 10H Rx. Mars 27° Virgo 8H. Jupiter 13° Leo 7H. Saturn 29° Gemini 6H. Tropical Placidus.',
  goals: ['事业'],
  dateStr: '2026-08-03',
  confirmed: true,
}

// Test 1: Standard mode with 4 systems
const standard = await run({ ...completeCharts, mode: 'standard' })
assert.equal(standard.result.activeSystems.length, 4)
assert.equal(standard.result.mode, 'standard')
assert.equal(standard.result.schemaVersion, 2)
assert.equal(standard.result.confirmed, true)
assert.ok(standard.result.files['00-总览.md'])
assert.ok(standard.result.files['05-交叉验证.md'])
console.log('  PASS: Standard 四体系')

// Test 2: Deep mode
const deep = await run({ ...completeCharts, mode: 'deep' })
assert.equal(deep.result.mode, 'deep')
assert.equal(deep.result.activeSystems.length, 4)
console.log('  PASS: Deep 四体系')

// Test 3: Birth-only (no charts) — only bazi survives
const birthOnly = await run({
  name: '虚构命主',
  birth: '1990-01-01 12:00',
  birthplace: '某地',
  gender: '女',
  bazi: '年柱甲子 月柱丙寅 日柱戊辰 时柱庚申',
  systems: ['bazi', 'ziwei', 'vedic', 'modern'],
  goals: ['事业'],
  dateStr: '2026-08-03',
  confirmed: true,
})
assert.deepEqual(birthOnly.result.activeSystems, ['bazi'])
assert.deepEqual(birthOnly.result.skippedSystems, ['ziwei', 'vedic', 'modern'])
console.log('  PASS: 仅八字有盘，其余跳过')

// Test 4: Reject quick mode
const quick = await run({ ...completeCharts, mode: 'quick' })
assert.match(quick.result.error, /quick/)
console.log('  PASS: quick 模式拒绝')

// Test 5: Chinese aliases
const aliases = await run({
  ...completeCharts,
  systems: ['八字', '紫微斗数', '八字'],
  goals: ['工作', '事业'],
})
assert.deepEqual(aliases.result.activeSystems, ['bazi', 'ziwei'])
assert.deepEqual(aliases.result.goals, ['事业方向与职业路径'])
console.log('  PASS: 中文别名归一化')

// Test 6: Partial failure isolation
const partialFailure = await run(completeCharts, { failLabel: '紫微斗数' })
assert.deepEqual(partialFailure.result.completedSystems.sort(), ['bazi', 'modern', 'vedic'].sort())
assert.deepEqual(partialFailure.result.failedSystems, ['ziwei'])
assert.equal(partialFailure.result.analysisErrors.ziwei, '模拟失败')
console.log('  PASS: 单体系失败隔离')

// Test 7: Invalid goal rejection
const invalidGoal = await run({ ...completeCharts, goals: ['不存在的维度'] })
assert.match(invalidGoal.result.error, /无法匹配维度/)
console.log('  PASS: 无效维度拒绝')

// Test 8: Model override ignored
const ignoredModel = await run({ ...completeCharts, model: 'external-model' })
assert.equal(ignoredModel.result.executionModel, 'inherit-current-session')
console.log('  PASS: 模型覆盖忽略')

// Test 9: Reject without confirmed
const noConfirm = await run({
  name: '虚构命主',
  birth: '1990-01-01 12:00',
  dateStr: '2026-08-03',
  systems: ['bazi'],
  goals: ['事业'],
  bazi: '年柱甲子 月柱丙寅 日柱戊辰 时柱庚申',
})
assert.match(noConfirm.result.error, /尚未获得运行确认/)
console.log('  PASS: 缺少 confirmed 拒绝')

// Test 10: Reject invalid dateStr
const badDate = await run({
  ...completeCharts,
  dateStr: 'today',
})
assert.match(badDate.result.error, /dateStr/)
console.log('  PASS: 无效 dateStr 拒绝')

// Test 11: Chart data validation — bazi without ganzhi
const badBazi = await run({
  ...completeCharts,
  bazi: '这是一段没有干支的文本，长度需要够80个字符以上才能通过hasText的基本长度检查但是内容里确实没有任何天干地支的组合',
})
assert.ok(badBazi.result.skippedSystems.includes('bazi') || badBazi.result.dataIssues.bazi.length > 0)
console.log('  PASS: 八字数据门槛校验')

// Test 12: Schema version 2 with files object
assert.equal(standard.result.schemaVersion, 2)
const fileKeys = Object.keys(standard.result.files).sort()
assert.deepEqual(fileKeys, ['00-总览.md', '01-八字分析.md', '02-紫微斗数分析.md', '03-印度占星分析.md', '04-现代占星分析.md', '05-交叉验证.md'])
console.log('  PASS: schemaVersion 2 六文件映射')

// Test 13: Digest parse failure doesn't block
const badDigestReport = `# 报告\n\n<!-- CROSS_DIGEST_START -->\n这不是JSON\n<!-- CROSS_DIGEST_END -->`
const badRun = await execute(
  { ...completeCharts },
  () => {}, () => {},
  async (prompt, options) => {
    if (options.label === '八字') return badDigestReport
    return analystReport('ziwei')
  },
  async (tasks) => Promise.all(tasks.map(t => t()))
)
assert.ok(badRun.digestErrors.bazi)
console.log('  PASS: JSON 摘要解析失败不阻断')

// Test 14: Detailed reasoning contract and specific questions reach analysts/cross-check
const withQuestions = await run({
  ...completeCharts,
  questions: ['候选方案甲和候选方案乙，哪一个更符合盘面？'],
})
assert.deepEqual(withQuestions.result.questions, ['候选方案甲和候选方案乙，哪一个更符合盘面？'])
const analystPrompts = withQuestions.calls.filter(call => ['八字', '紫微斗数', '印度占星', '现代占星'].includes(call.options.label))
assert.equal(analystPrompts.length, 4)
for (const call of analystPrompts) {
  assert.match(call.prompt, /原始盘面/)
  assert.match(call.prompt, /对应解释/)
  assert.match(call.prompt, /得出结论/)
  assert.match(call.prompt, /只比较用户实际给出的候选项/)
  assert.match(call.prompt, /Q1\. 候选方案甲和候选方案乙/)
}
const crossPrompt = withQuestions.calls.find(call => call.options.label === '交叉比较')?.prompt || ''
assert.match(crossPrompt, /共同语义与推理审计/)
assert.match(crossPrompt, /不使用星级/)
assert.match(crossPrompt, /Q1\. 候选方案甲和候选方案乙/)
console.log('  PASS: 可追溯推理、通用候选项比较与问题清单')

console.log('\ncross-check workflow smoke tests: PASS')
