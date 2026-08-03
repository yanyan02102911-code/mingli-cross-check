import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const checks = [
  [path.join(here, 'sync-workflow-methods.mjs'), '--check'],
  [path.join(here, 'validate-skills.mjs')],
  [path.join(here, 'test-cross-check.mjs')],
  [path.join(here, '..', 'skills', 'mingli-bazi', 'scripts', 'test-day-pillar.mjs')],
]

for (const [script, ...args] of checks) {
  const result = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status || 1)
}

console.log('all local checks: PASS')
