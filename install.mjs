#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))
const sourceClaude = path.join(repoRoot, '.claude')
const skillNames = [
  'mingli-bazi',
  'mingli-ziwei',
  'mingli-vedic',
  'mingli-modern',
  'mingli-cross-check',
]

function usage(exitCode = 0) {
  console.log(`
四体系命理 Skill 安装器

用法:
  node install.mjs --target claude [--project <项目目录>]
  node install.mjs --target codex
  node install.mjs --target agents [--project <项目目录>]
  node install.mjs --target all [--project <项目目录>]

目标:
  claude  安装到 <项目>/.claude，供 Claude Code 使用 Workflow 与 Skills
  codex   安装到 CODEX_HOME/skills（未设置时为 ~/.codex/skills）
  agents  安装到 <项目>/.agents/skills，供兼容 SKILL.md 的 Agent 使用
  all     同时安装 claude、codex 和 agents

选项:
  --project <路径>  项目目录；默认当前目录
  --dry-run         只显示将执行的操作
  --help            显示帮助

安装器只覆盖 mingli-* 相关文件，不删除或改动其他 Skills。
`)
  process.exit(exitCode)
}

function parseArgs(argv) {
  const result = { target: '', project: process.cwd(), dryRun: false }
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i]
    if (value === '--help' || value === '-h') usage(0)
    if (value === '--dry-run') {
      result.dryRun = true
    } else if (value === '--target') {
      result.target = argv[++i] || ''
    } else if (value === '--project') {
      result.project = argv[++i] || ''
    } else if (!value.startsWith('-') && !result.target) {
      result.target = value
    } else {
      console.error(`无法识别的参数：${value}`)
      usage(1)
    }
  }
  if (!['claude', 'codex', 'agents', 'all'].includes(result.target)) {
    console.error('请使用 --target 指定 claude、codex、agents 或 all。')
    usage(1)
  }
  result.project = path.resolve(result.project)
  return result
}

function ensureSources() {
  for (const skill of skillNames) {
    const skillFile = path.join(sourceClaude, 'skills', skill, 'SKILL.md')
    if (!fs.existsSync(skillFile)) throw new Error(`缺少源 Skill：${skillFile}`)
  }
}

function copyItem(source, destination, dryRun) {
  const display = `${path.relative(repoRoot, source)} -> ${destination}`
  if (path.resolve(source) === path.resolve(destination)) {
    console.log(`已存在：${display}`)
    return
  }
  if (dryRun) {
    console.log(`[dry-run] ${display}`)
    return
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.cpSync(source, destination, { recursive: true, force: true })
  console.log(`已安装：${display}`)
}

function installSkills(destinationRoot, dryRun, bundleAnywhereScript = false) {
  for (const skill of skillNames) {
    const destination = path.join(destinationRoot, skill)
    copyItem(path.join(sourceClaude, 'skills', skill), destination, dryRun)
    if (bundleAnywhereScript && skill === 'mingli-cross-check') {
      copyItem(
        path.join(sourceClaude, 'scripts', 'cross_check_anywhere.py'),
        path.join(destination, 'scripts', 'cross_check_anywhere.py'),
        dryRun,
      )
    }
  }
}

function installClaude(project, dryRun) {
  const destination = path.join(project, '.claude')
  installSkills(path.join(destination, 'skills'), dryRun)
  copyItem(
    path.join(sourceClaude, 'workflows', 'cross-check.js'),
    path.join(destination, 'workflows', 'cross-check.js'),
    dryRun,
  )
  for (const script of ['assemble-results.mjs', 'cross_check_anywhere.py', 'sync-workflow-methods.mjs']) {
    copyItem(path.join(sourceClaude, 'scripts', script), path.join(destination, 'scripts', script), dryRun)
  }
}

function installCodex(dryRun) {
  const codexHome = process.env.CODEX_HOME
    ? path.resolve(process.env.CODEX_HOME)
    : path.join(os.homedir(), '.codex')
  installSkills(path.join(codexHome, 'skills'), dryRun, true)
}

function installAgents(project, dryRun) {
  installSkills(path.join(project, '.agents', 'skills'), dryRun, true)
}

const options = parseArgs(process.argv.slice(2))
ensureSources()

if (options.target === 'claude' || options.target === 'all') installClaude(options.project, options.dryRun)
if (options.target === 'codex' || options.target === 'all') installCodex(options.dryRun)
if (options.target === 'agents' || options.target === 'all') installAgents(options.project, options.dryRun)

console.log(options.dryRun
  ? '检查完成：未写入文件。'
  : '安装完成。请重启或重新打开对应 Agent，使其重新发现 Skills。')
