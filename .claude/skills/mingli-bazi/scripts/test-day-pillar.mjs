import assert from 'node:assert/strict'
import { calculateDayPillar, parseCivilDate } from './calculate-day-pillar.mjs'

assert.equal(calculateDayPillar('2000-01-01').pillar, '戊午')
assert.equal(calculateDayPillar('2002-01-01').pillar, '己巳')
assert.equal(calculateDayPillar('1999-12-31').pillar, '丁巳')
assert.equal(calculateDayPillar('2000-01-01', { time: '23:30', dayBoundary: 'zi-hour' }).pillar, '己未')
assert.throws(() => parseCivilDate('2025-02-29'), /invalid Gregorian date/)
assert.throws(() => calculateDayPillar('2000-01-01', { dayBoundary: 'zi-hour' }), /requires time/)

console.log('bazi day-pillar tests: PASS')
