const test = require('node:test');
const assert = require('node:assert');
const { countWorkingDays } = require('../lib/dates');

test('semaine complète lundi–vendredi = 5 jours', () => assert.strictEqual(countWorkingDays('2026-11-09', '2026-11-13'), 5));
test('les week-ends sont exclus', () => assert.strictEqual(countWorkingDays('2026-11-09', '2026-11-15'), 5));
test('un jour férié est exclu', () => assert.strictEqual(countWorkingDays('2026-11-02', '2026-11-06', new Set(['2026-11-06'])), 4));
test('un seul jour ouvrable', () => assert.strictEqual(countWorkingDays('2026-11-10', '2026-11-10'), 1));
test('un samedi seul = 0', () => assert.strictEqual(countWorkingDays('2026-11-14', '2026-11-14'), 0));
test('période inversée = 0', () => assert.strictEqual(countWorkingDays('2026-11-13', '2026-11-09'), 0));
