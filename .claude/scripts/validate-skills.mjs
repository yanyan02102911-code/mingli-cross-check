import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const skillsDir = path.resolve(here, '..', 'skills')
const errors = []

const bannedPatterns = [
  { pattern: /自动估算/, reason: '印占/现代不允许估算命盘' },
  { pattern: /按子时推算/, reason: '缺时辰不得默认子时' },
  { pattern: /逐年递减/, reason: 'Ayanamsa 方向性描述错误' },
  { pattern: /默认子时/, reason: '缺时辰不得默认子时' },
]
const systemSkills = new Set(['mingli-bazi', 'mingli-ziwei', 'mingli-vedic', 'mingli-modern'])

// Required sections in each system SKILL.md
const requiredSections = ['## 开始前', '## 数据门槛', '## 路由', '## 输出规则', '## 禁止']
// Required references for system skills
const requiredRefs = ['workflow-standard.md', 'workflow-deep.md']

for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const skillPath = path.join(skillsDir, entry.name, 'SKILL.md')
  if (!fs.existsSync(skillPath)) {
    errors.push(`${entry.name}: missing SKILL.md`)
    continue
  }
  const source = fs.readFileSync(skillPath, 'utf8')
  const lines = source.split(/\r?\n/)

  // Size checks: system skills should be slim (<200 lines), cross-check can be longer
  if (systemSkills.has(entry.name) && lines.length >= 200)
    errors.push(`${entry.name}: SKILL.md should stay under 200 lines (found ${lines.length})`)

  // Frontmatter
  if (lines[0] !== '---') {
    errors.push(`${entry.name}: frontmatter must start on line 1`)
    continue
  }
  const end = lines.indexOf('---', 1)
  if (end < 0) {
    errors.push(`${entry.name}: frontmatter closing delimiter missing`)
    continue
  }
  const frontmatter = lines.slice(1, end)
  const topLevelKeys = frontmatter
    .filter(line => /^[a-zA-Z][\w-]*:/.test(line))
    .map(line => line.slice(0, line.indexOf(':')))
  if (topLevelKeys.join(',') !== 'name,description')
    errors.push(`${entry.name}: frontmatter must contain only name and description in that order`)
  const nameLine = frontmatter.find(line => line.startsWith('name:'))
  const name = nameLine?.slice('name:'.length).trim()
  if (name !== entry.name) errors.push(`${entry.name}: frontmatter name must match folder`)
  if (!/^[a-z0-9-]{1,64}$/.test(name || '')) errors.push(`${entry.name}: invalid skill name`)

  // System skill checks
  if (systemSkills.has(entry.name)) {
    for (const section of requiredSections) {
      if (!source.includes(section))
        errors.push(`${entry.name}: missing required section "${section}"`)
    }
    // Check references exist
    const refsDir = path.join(skillsDir, entry.name, 'references')
    if (!fs.existsSync(refsDir))
      errors.push(`${entry.name}: missing references/ directory`)
    else {
      for (const ref of requiredRefs) {
        if (!fs.existsSync(path.join(refsDir, ref)))
          errors.push(`${entry.name}: missing references/${ref}`)
      }
    }
    // Should NOT have old WORKFLOW markers (those are in references/ now)
    if (source.includes('WORKFLOW_STANDARD_START') || source.includes('WORKFLOW_DEEP_START'))
      errors.push(`${entry.name}: WORKFLOW markers should be removed; methodology is in references/`)
  }

  // Banned patterns
  for (const banned of bannedPatterns) {
    if (banned.pattern.test(source))
      errors.push(`${entry.name}: ${banned.reason}`)
  }
}

// mingli-cross-check specific checks
const crossCheckPath = path.join(skillsDir, 'mingli-cross-check', 'SKILL.md')
if (fs.existsSync(crossCheckPath)) {
  const ccSource = fs.readFileSync(crossCheckPath, 'utf8')
  if (!ccSource.includes('references/contracts.md'))
    errors.push('mingli-cross-check: should reference contracts.md')
  if (!ccSource.includes('confirmed'))
    errors.push('mingli-cross-check: should mention confirmed gate')
}

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('skill structure and policy checks: PASS')
}
