import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const claudeDir = path.resolve(here, '..')
const workflowPath = path.join(claudeDir, 'workflows', 'cross-check.js')
const checkOnly = process.argv.includes('--check')

const systems = [
  { folder: 'mingli-bazi', prefix: 'BAZI' },
  { folder: 'mingli-ziwei', prefix: 'ZIWEI' },
  { folder: 'mingli-vedic', prefix: 'VEDIC' },
  { folder: 'mingli-modern', prefix: 'MODERN' },
]

function readReference(skillFolder, refName) {
  const refPath = path.join(claudeDir, 'skills', skillFolder, 'references', `${refName}.md`)
  if (!fs.existsSync(refPath)) {
    throw new Error(`${refPath}: reference file not found`)
  }
  const content = fs.readFileSync(refPath, 'utf8').trim()
  if (!content) throw new Error(`${refPath}: reference file is empty`)
  return content
}

function escapeForTemplateLiteral(text) {
  return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
}

function buildConstant(prefix, suffix, content) {
  return `const ${prefix}_${suffix} = \`\n${escapeForTemplateLiteral(content)}\n\`;`
}

// Read all references and build constants
const constantBlocks = []
for (const { folder, prefix } of systems) {
  const standard = readReference(folder, 'workflow-standard')
  const deep = readReference(folder, 'workflow-deep')
  constantBlocks.push(buildConstant(prefix, 'STANDARD', standard))
  constantBlocks.push(buildConstant(prefix, 'DEEP', deep))
}

const source = fs.readFileSync(workflowPath, 'utf8')

// Check if constants are already in sync
const allSynced = constantBlocks.every(block => source.includes(block))
if (checkOnly) {
  if (allSynced) {
    console.log('workflow methods are in sync')
    process.exit(0)
  } else {
    console.error('workflow methods are out of sync; run sync-workflow-methods.mjs')
    process.exit(1)
  }
}

// Replace TO_BE_SYNCED placeholder block with synced constants
const marker = 'const BAZI_STANDARD = `TO_BE_SYNCED`'
const markerIndex = source.indexOf(marker)
if (markerIndex < 0) {
  // Try to find existing constants to replace
  const firstConst = source.indexOf('const BAZI_STANDARD = `')
  const lastConstEnd = source.lastIndexOf('const MODERN_DEEP = `')
  if (firstConst < 0 || lastConstEnd < 0) {
    console.error('Could not find method constants in cross-check.js')
    process.exit(1)
  }
  // Find the end of the last constant block (closing backtick)
  let endIndex = lastConstEnd
  let depth = 0
  let inTemplate = false
  for (let i = lastConstEnd; i < source.length; i++) {
    if (source[i] === '`' && source[i-1] !== '\\') {
      if (!inTemplate) { inTemplate = true; depth++ }
      else { depth--; if (depth === 0) { endIndex = i + 1; break } }
    }
  }
  // Replace all constant blocks
  const before = source.slice(0, firstConst)
  const after = source.slice(endIndex)
  const newSource = before + constantBlocks.join('\n\n') + after
  fs.writeFileSync(workflowPath, newSource, 'utf8')
} else {
  // Replace TO_BE_SYNCED block
  // Find the block of all 8 TO_BE_SYNCED constants
  const blockEnd = source.indexOf('const METHODS = {', markerIndex)
  if (blockEnd < 0) {
    console.error('Could not find METHODS block after TO_BE_SYNCED constants')
    process.exit(1)
  }
  const before = source.slice(0, markerIndex)
  const after = source.slice(blockEnd)
  // Remove trailing empty line before METHODS
  const cleanAfter = after.replace(/^\n+/, '\n\n')
  const newSource = before + constantBlocks.join('\n\n') + cleanAfter
  fs.writeFileSync(workflowPath, newSource, 'utf8')
}

console.log('workflow methods synchronized from references/*.md')
