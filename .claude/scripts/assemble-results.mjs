import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REQUIRED_FILES = [
  '00-总览.md',
  '01-八字分析.md',
  '02-紫微斗数分析.md',
  '03-印度占星分析.md',
  '04-现代占星分析.md',
  '05-交叉验证.md',
]

function safeSegment(value) {
  const result = String(value).trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').replace(/[. ]+$/g, '').slice(0, 80)
  if (!result || result === '.' || result === '..') throw new Error('name cannot form a safe directory segment')
  return result
}

function inside(base, target) {
  const relative = path.relative(base, target)
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export function validateResult(result) {
  if (!result || result.schemaVersion !== 2 || result.confirmed !== true) throw new Error('result must be confirmed schemaVersion 2')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result.dateStr || '')) throw new Error('invalid dateStr')
  if (!result.files || typeof result.files !== 'object') throw new Error('files mapping missing')
  const keys = Object.keys(result.files).sort()
  if (JSON.stringify(keys) !== JSON.stringify([...REQUIRED_FILES].sort())) throw new Error('files mapping must contain exactly six required files')
  for (const file of REQUIRED_FILES) {
    if (typeof result.files[file] !== 'string' || !result.files[file].trim()) throw new Error(`${file} is empty`)
  }
}

export function assembleResult(result, options = {}) {
  validateResult(result)
  const base = path.resolve(options.baseDir || process.cwd())
  const outputRoot = path.resolve(base, options.outputDir || result.outputDir || 'output')
  if (!inside(base, outputRoot)) throw new Error('outputDir must stay inside baseDir')
  const target = path.resolve(outputRoot, `${safeSegment(result.name)}-${result.dateStr}`)
  if (!inside(outputRoot, target)) throw new Error('target directory escaped output root')
  if (fs.existsSync(target)) throw new Error(`target already exists: ${target}`)
  fs.mkdirSync(target, { recursive: true })
  for (const file of REQUIRED_FILES) fs.writeFileSync(path.join(target, file), `${result.files[file].trim()}\n`, 'utf8')
  for (const file of REQUIRED_FILES) {
    const written = path.join(target, file)
    if (!fs.existsSync(written) || fs.statSync(written).size === 0) throw new Error(`verification failed: ${file}`)
  }
  return { target, files: REQUIRED_FILES.map((file) => path.join(target, file)) }
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
if (isCli) {
  try {
    const argv = process.argv.slice(2)
    const resultPath = argv.find((arg) => !arg.startsWith('--'))
    const baseDir = argv.find((arg) => arg.startsWith('--base='))?.slice(7)
    const outputDir = argv.find((arg) => arg.startsWith('--output='))?.slice(9)
    if (!resultPath) throw new Error('usage: assemble-results.mjs result.json [--base=DIR] [--output=RELATIVE_DIR]')
    const result = JSON.parse(fs.readFileSync(path.resolve(resultPath), 'utf8'))
    const assembled = assembleResult(result, { baseDir, outputDir })
    console.log(JSON.stringify(assembled, null, 2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

export { REQUIRED_FILES }
