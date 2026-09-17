// Run: node src/components/sites/eagenda-com-br-a1f95f96/painel-6812d580/periods.test.mjs
// Expected values captured from the live site on 17/09/2026.
import assert from "node:assert/strict";
import { periodLabels } from "./periods.ts";

const today = new Date(2026, 8, 17);
const d30 = periodLabels("30d", today);
assert.equal(d30.length, 30);
assert.equal(d30[0], "19/08");
assert.equal(d30.at(-1), "17/09");
assert.deepEqual(periodLabels("90d", today), ["19/06", "26/06", "03/07", "10/07", "17/07", "24/07", "31/07", "07/08", "14/08", "21/08", "28/08", "04/09", "11/09"]);
assert.deepEqual(periodLabels("12m", today), ["Out/25", "Nov/25", "Dez/25", "Jan/26", "Fev/26", "Mar/26", "Abr/26", "Mai/26", "Jun/26", "Jul/26", "Ago/26", "Set/26"]);
console.log("periods ok");
