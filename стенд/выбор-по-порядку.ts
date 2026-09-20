//
// СТЕНД: две записи на одну величину, выбор по порядку загрузки.
//
// Показывает механизм, из-за которого ширина венца в расчёте 2026 года вышла
// 60 мм вместо 64: ядро умело подбирать запись по совпадению имени величины,
// а ничью между двумя подходящими разрешал порядок, в котором они загрузились.
//
// Стенд ничего не чинит и ничего не подгоняет. Он берёт базу знаний EKC2 как
// она есть, кладёт в пространство входы, которых хватает ОБЕИМ записям, и
// печатает: что вышло, чьё это число и где в следе второй ответ.
//
// Запуск:  npx tsx ../cases/стенд/выбор-по-порядку.ts   (из EKC2/Compiler)
//
import { loadKnowledge } from "../../EKC2/Compiler/src/index.js";
import { closeSpace } from "../../EKC2/Compiler/src/eval/derive.js";
import { evaluateDerivation } from "../../EKC2/Compiler/src/eval/derivation.js";
import { startTrace } from "../../EKC2/Compiler/src/eval/trace.js";
import type { Derivation } from "../../EKC2/Compiler/src/eval/derivation.js";
import type { Quantity } from "../../EKC2/Compiler/src/core/units.js";

const ВЕЛИЧИНА = "b_w_mm"; // рабочая ширина зубчатого венца
const БАЗА = "/home/sergey/EKC2/Knowledge";

const мм = (x: number): string => `${x.toFixed(2)} мм`;
const строка = (q: Quantity): string => `${q.value.toFixed(4)} ${q.unit}`;

const knowledge = loadKnowledge(БАЗА);

// ── 1. Кто вообще даёт эту величину ────────────────────────────────────────

const все = [...knowledge.derivations.values()];
const претенденты = все.filter(
  (d) => d.output.name === ВЕЛИЧИНА && d.status === "normative"
);

console.log(`База: ${все.length} записей-выводов, из них нормативных дают «${ВЕЛИЧИНА}»: ${претенденты.length}\n`);

for (const [i, d] of претенденты.entries()) {
  const место = все.findIndex((x) => x.id === d.id);
  console.log(`  ${i + 1}) ${d.id}`);
  console.log(`     выражение: ${d.expression ?? "(таблица)"}`);
  console.log(`     входы:     ${d.inputs.map((x) => x.name).join(", ")}`);
  console.log(`     источник:  ${d.source.split("\n")[0].trim()}`);
  console.log(`     место в порядке загрузки: ${место + 1} из ${все.length}\n`);
}

if (претенденты.length < 2) {
  console.log("Меньше двух претендентов — показывать нечего.");
  process.exit(0);
}

// ── 2. Входы, которых хватает обеим ────────────────────────────────────────
//
// psi_ba и aw_mm — из самопроверки записи gear.face-width (симметричное
// расположение колеса, межосевое 175,205 мм).
// b_mm и mate.b_mm — умолчания рода `toothed_wheel` из библиотеки: числа,
// которые никто не вводил, но которые в теле уже стоят.
//
const входы = new Map<string, Quantity>([
  ["psi_ba", { value: 0.315, unit: "1" }],
  ["aw_mm", { value: 175.205, unit: "mm" }],
  ["b_mm", { value: 40, unit: "mm" }],
  ["mate.b_mm", { value: 40, unit: "mm" }],
]);

console.log("Входы стенда:");
for (const [имя, q] of входы) console.log(`  ${имя} = ${строка(q)}`);
console.log();

// ── 3. Что даёт каждая запись по отдельности ───────────────────────────────

console.log("Что отвечает каждая, если спросить её одну:");
const ответы = new Map<string, Quantity>();
for (const d of претенденты) {
  const исход = evaluateDerivation(d, входы);
  if (исход.kind === "value") {
    ответы.set(d.id, исход.value);
    console.log(`  ${d.id.padEnd(22)} ${строка(исход.value)}`);
  } else {
    console.log(`  ${d.id.padEnd(22)} не посчиталась: ${исход.kind}`);
  }
}
const числа = [...ответы.values()].map((q) => q.value);
const разброс = Math.max(...числа) - Math.min(...числа);
console.log(
  `\n  Обе законны, обе нормативны, расходятся на ${мм(разброс)} ` +
    `(${((разброс / Math.min(...числа)) * 100).toFixed(0)} %).\n`
);

// ── 4. Что делает с этим замыкание ─────────────────────────────────────────

const прогон = (порядок: readonly Derivation[]): void => {
  const записи = new Map(порядок.map((d) => [d.id, d]));
  const пространство = new Map(входы);
  const след = startTrace();
  closeSpace(пространство, записи, new Map(), след);

  const итог = пространство.get(ВЕЛИЧИНА);
  const шаг = след.steps.find(
    (s) => s.kind === "derived" && s.quantity === ВЕЛИЧИНА
  );
  const упомянуты = след.steps
    .filter((s) => s.quantity === ВЕЛИЧИНА)
    .map((s) => `${s.recordId} (${s.kind})`);

  console.log(`  порядок загрузки:  ${порядок.map((d) => d.id).join("  →  ")}`);
  console.log(`  в расчёт попало:   ${ВЕЛИЧИНА} = ${итог ? строка(итог) : "—"}`);
  console.log(`  чьё это число:     ${шаг && шаг.kind === "derived" ? шаг.recordId : "—"}`);
  console.log(`  в следе упомянуто: ${упомянуты.join(", ")}`);
  const молчком = претенденты
    .map((d) => d.id)
    .filter((id) => !упомянуты.some((u) => u.startsWith(id)));
  console.log(
    `  не упомянуто:      ${молчком.length ? молчком.join(", ") : "—"}` +
      (молчком.length ? "   ← ни в выводах, ни в отказах" : "")
  );
  console.log();
};

console.log("── Замыкание, порядок как в базе ───────────────────────────────\n");
прогон(претенденты);

console.log("── То же самое, записи переставлены местами ─────────────────────\n");
прогон([...претенденты].reverse());

// ── 5. Что из этого следует ────────────────────────────────────────────────

const [перв, втор] = претенденты;
const a = ответы.get(перв.id);
const b = ответы.get(втор.id);
if (a && b) {
  console.log("── Итог ─────────────────────────────────────────────────────────\n");
  console.log(
    `  Одна и та же база, одни и те же входы, два разных ответа:\n` +
      `  ${мм(a.value)} или ${мм(b.value)} — в зависимости от того, какая запись\n` +
      `  загрузилась раньше. Ничью разрешил порядок, а не инженер.\n`
  );
  console.log(
    `  Вытесненная запись не попала ни в выводы, ни в отказы: с точки зрения\n` +
      `  следа выбора не было вовсе.\n`
  );
}
