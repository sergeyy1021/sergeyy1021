## Serhii Klochko

*[Русская версия](README.ru.md)*

I design systems whose source of truth is domain knowledge rather than code, and
where every number can say where it came from.

**How I work.** I write the specification, set the rules the work has to obey, and
accept the result by measurement and by running it — not by reading the diff. The
code is written by AI agents under my direction; the architecture, the domain
knowledge, the decisions and the acceptance are mine. I keep a written decision
log, so a rejected option stays on record with the reason it was rejected.

**Domains.** Machine design — gearboxes, shafts, bearings, keys, and the
national and ISO standards a calculation has to obey. Furniture manufacturing —
cabinet standards, joinery, hardware, and the whole chain from a panel to the
machine: DXF, MPR, NC / G-code for CNC. Applied ML — NLLB fine-tuning for ru→nb,
evaluation pipelines.

---

### [Three cases](CASES.md) — how I work, shown on three failures

1. **A system gave a plausible wrong answer and could not say it had chosen.**
   Two legitimate engineering formulas produced one quantity; the tie was broken
   by load order, and the displaced formula appeared in neither the results nor
   the refusals. Includes a stand that still reproduces the mechanism today.
2. **One hour of running against one week of planned work.** A constraint derived
   by reading the code had already been written into the plan with three
   candidate designs. Assembling the smallest product that should exhibit it took
   an hour and showed all three answered a question that did not exist.
3. **A guard that silently issued permission.** Found by trying to break it, not
   by reading it. A guard with a hole in its own pattern is worse than no guard:
   the missing one does not stop you from being suspicious.

> *In Russian for now; an English version is next.*

---

### Three rules these cases produced

- **No estimate before measurement.** Measuring is cheap and almost always changes
  the question. An estimate made without it has no relation to the work.
- **No diagnosis before a run.** A conclusion drawn from reading code is not
  accepted until the smallest product that should exhibit it has been assembled
  and run. What goes into the plan is the output of that run, not a retelling.
- **No trust in a guard that has not been attacked.** When you write a check that
  enforces discipline, write the corruption that must make it fail, and run it.

---

### Projects

**EKC** — a system that computes mechanical assemblies from knowledge records:
a formula, a table from a standard, a check — each carrying its source, its
maturity and its limits of applicability, so an engineer can change the
knowledge without programming.

→ [**What that actually looks like**](knowledge/README.md): two exhibits copied
verbatim from the live knowledge base — one record in full, and a fragment of the
calculation template (223 steps in 19 stages, 6 declared iteration loops).

There have been three implementations. The first runs as a demo stand behind a
password — ask and I will open it. The current one takes the knowledge entirely
out of the engine and is research in progress; its repository is not published,
which is why the exhibits above are files rather than a link.

**[Workbench](https://github.com/sergeyy1021/workbench)** — a protocol and a tool
that keep an AI agent inside the structure a human approved: structure is
declared before code, approved by the names of the functions that will exist, and
enforced by a hook rather than by advice. The check then compares the declaration
with the code and reports what nobody declared.

Worth reading even if you never install it: [the protocol
itself](https://github.com/sergeyy1021/workbench/blob/main/PROTOCOL.md) — seven
rules, each with the reason it exists, including the one that requires the agent
to report the places it could not honestly name.

---

Written in collaboration with AI agents, under the protocol above.
Reach me at the address on my GitHub profile.
