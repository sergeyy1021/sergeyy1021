//
// STAND: two records for one quantity, and the load order decides.
//
// This reproduces the mechanism behind the 2026 incident in which the face
// width of a gear rim came out as 60 mm instead of 64: the engine used to pick
// a knowledge record by matching the name of the quantity, and a tie between
// two applicable records was broken by the order in which they had loaded.
//
// The stand fixes nothing and tunes nothing. It takes the EKC2 knowledge base
// as it is, puts into the space the inputs that satisfy BOTH records, and
// prints what came out, whose number it is, and where the other answer is.
//
// Run:  npx tsx ../profile/stand/order-decides.ts   (from EKC2/Compiler)
//
import { loadKnowledge } from "../../EKC2/Compiler/src/index.js";
import { closeSpace } from "../../EKC2/Compiler/src/eval/derive.js";
import { evaluateDerivation } from "../../EKC2/Compiler/src/eval/derivation.js";
import { startTrace } from "../../EKC2/Compiler/src/eval/trace.js";
import type { Derivation } from "../../EKC2/Compiler/src/eval/derivation.js";
import type { Quantity } from "../../EKC2/Compiler/src/core/units.js";

const QUANTITY = "b_w_mm"; // working face width of a gear rim
const BASE = "/home/sergey/EKC2/Knowledge";

const mm = (x: number): string => `${x.toFixed(2)} mm`;
const show = (q: Quantity): string => `${q.value.toFixed(4)} ${q.unit}`;

const knowledge = loadKnowledge(BASE);

// ── 1. Who claims this quantity at all ─────────────────────────────────────

const all = [...knowledge.derivations.values()];
const claimants = all.filter(
  (d) => d.output.name === QUANTITY && d.status === "normative"
);

console.log(
  `Base: ${all.length} derivation records; normative ones producing «${QUANTITY}»: ${claimants.length}\n`
);

for (const [i, d] of claimants.entries()) {
  const place = all.findIndex((x) => x.id === d.id);
  console.log(`  ${i + 1}) ${d.id}`);
  console.log(`     expression:  ${d.expression ?? "(table lookup)"}`);
  console.log(`     inputs:      ${d.inputs.map((x) => x.name).join(", ")}`);
  console.log(`     source:      ${d.source.split("\n")[0].trim()}`);
  console.log(`     position in load order: ${place + 1} of ${all.length}\n`);
}

if (claimants.length < 2) {
  console.log("Fewer than two claimants — nothing to show.");
  process.exit(0);
}

// ── 2. Inputs that satisfy both ────────────────────────────────────────────
//
// psi_ba and aw_mm come from the self-check of gear.face-width (gear wheel
// placed symmetrically, centre distance 175.205 mm).
// b_mm and mate.b_mm are the defaults of the `toothed_wheel` kind in the
// library: numbers nobody entered, yet already present on the body.
//
const inputs = new Map<string, Quantity>([
  ["psi_ba", { value: 0.315, unit: "1" }],
  ["aw_mm", { value: 175.205, unit: "mm" }],
  ["b_mm", { value: 40, unit: "mm" }],
  ["mate.b_mm", { value: 40, unit: "mm" }],
]);

console.log("Inputs of the stand:");
for (const [name, q] of inputs) console.log(`  ${name} = ${show(q)}`);
console.log();

// ── 3. What each record answers on its own ─────────────────────────────────

console.log("What each one answers when asked alone:");
const answers = new Map<string, Quantity>();
for (const d of claimants) {
  const outcome = evaluateDerivation(d, inputs);
  if (outcome.kind === "value") {
    answers.set(d.id, outcome.value);
    console.log(`  ${d.id.padEnd(22)} ${show(outcome.value)}`);
  } else {
    console.log(`  ${d.id.padEnd(22)} did not evaluate: ${outcome.kind}`);
  }
}
const values = [...answers.values()].map((q) => q.value);
const spread = Math.max(...values) - Math.min(...values);
console.log(
  `\n  Both legitimate, both normative, ${mm(spread)} apart ` +
    `(${((spread / Math.min(...values)) * 100).toFixed(0)} %).\n`
);

// ── 4. What the closure does with that ─────────────────────────────────────

const run = (order: readonly Derivation[]): void => {
  const records = new Map(order.map((d) => [d.id, d]));
  const space = new Map(inputs);
  const trace = startTrace();
  closeSpace(space, records, new Map(), trace);

  const result = space.get(QUANTITY);
  const step = trace.steps.find(
    (s) => s.kind === "derived" && s.quantity === QUANTITY
  );
  const mentioned = trace.steps
    .filter((s) => s.quantity === QUANTITY)
    .map((s) => `${s.recordId} (${s.kind})`);

  console.log(`  load order:        ${order.map((d) => d.id).join("  →  ")}`);
  console.log(`  entered the calc:  ${QUANTITY} = ${result ? show(result) : "—"}`);
  console.log(
    `  whose number:      ${step && step.kind === "derived" ? step.recordId : "—"}`
  );
  console.log(`  named in trace:    ${mentioned.join(", ")}`);
  const silent = claimants
    .map((d) => d.id)
    .filter((id) => !mentioned.some((m) => m.startsWith(id)));
  console.log(
    `  not named at all:  ${silent.length ? silent.join(", ") : "—"}` +
      (silent.length ? "   ← neither derived nor refused" : "")
  );
  console.log();
};

console.log("── Closure, order as it is in the base ─────────────────────────\n");
run(claimants);

console.log("── The same, the two records swapped ───────────────────────────\n");
run([...claimants].reverse());

// ── 5. What follows ────────────────────────────────────────────────────────

const [first, second] = claimants;
const a = answers.get(first.id);
const b = answers.get(second.id);
if (a && b) {
  console.log("── Result ───────────────────────────────────────────────────────\n");
  console.log(
    `  One base, one set of inputs, two different answers:\n` +
      `  ${mm(a.value)} or ${mm(b.value)}, depending on which record happened\n` +
      `  to load first. The tie was broken by order, not by an engineer.\n`
  );
  console.log(
    `  The displaced record appears neither among the derivations nor among\n` +
      `  the refusals: as far as the trace is concerned, no choice was made.\n`
  );
}
