# Three cases

A page for a reader who does not know me.

*[Русская версия](CASES.ru.md)*

Three episodes from work on EKC, a system for engineering calculations (2026).
They were not chosen for size — none of them is a big win — but for what is
visible in them: how a failure that does not shout gets found; at what altitude
the diagnosis is made; and what afterwards keeps it from coming back.

Numbers and quotations come from the project's working journals. Where a run
cannot be reproduced today, that is said plainly.

A word about the system, so the cases can be read. EKC computes mechanical
assemblies — a gearbox, a shaft, its bearings — not from a program but from
**knowledge records**: a formula, a table from a standard, a check — each stored
as data with its source and its limits of applicability. The promise of the system is a
simple one: no number without a provenance. All three cases are about that
promise being tested.

---

## 1. The system gave a plausible wrong answer and could not say it had chosen

**What happened.** The face width of a gear rim came out as **60 mm instead of
64**.

The engine could pick records by itself back then: for a quantity named `b_mm`
it searched the base for everything that produces that quantity and applied what
fitted. Two formulas fitted — both legitimate, from different sources. The tie
between them was broken by **the alphabetical order of file names**: the first
one won.

There was no defect in the code. The algorithm did exactly what it was written
to do.

**Why this is the worst kind of failure.** 60 mm is a plausible number. Nothing
crashed, no test went red, the calculation ran to the end and produced a result
that looked ordinary. And the displaced formula **did not even appear among the
refusals**: the system did not report a choice, because it did not consider it
one.

For a system that promises traceability, this is a failure of the promise
itself: the number formally had a provenance, while the decision that determined
it was recorded nowhere.

Face width is not a detail — contact stress and the life of the gear depend on
it. Four millimetres here is not cosmetic.

**The diagnosis.** The routine move is to fix the priority: prefer the more
precise record, or the one whose limits of applicability are declared. Half an
hour of work.

The diagnosis turned out to be a different one: **the engine has no grounds
whatsoever to choose between two correct engineering formulas.** Choosing
between methods is an engineering decision, not a consequence of the data. All
the matching mechanism did was disguise the absence of that decision as a
computation. A measurement confirmed it: the records do not declare the *kind*
of the quantity at all, and limits of applicability are declared on 2 records
out of 44 — so the system had nothing to recognise "the right formula" with, in
principle.

**The decision (8 September 2026) and its price.** Matching a record by name was
abolished completely. A formula is applied only if a human assigned it to that
step.

The price was named at once and accepted: **the system stopped computing
everything an engineer had not approved.** The counter-argument — "without
matching it will compute nothing, this is paralysis" — was rejected, in a
formulation that stayed in the project as a rule:

> A system that stays silent is more honest than a system that computes with
> something unknown.

**How it ended.** The project then swung to the opposite extreme: everything by
hand, no suggestions — and became a configurator, where a human types in even
what follows unambiguously from the facts. The return to the middle was made
deliberately, in a document that fixes the border: **facts to the machine,
choices to the human; one candidate — offer it, several — ask, none — say "there
is nothing to compute this with", silently — never.**

Both extremes turned out to be one mistake: it had never been written down what
is given to the mechanism and what is not.

**The stand: the mechanism can still be seen today.** The EKC2 base is frozen
together with its matching mechanism, and it still picks by order. The stand
takes the base as it is, puts into the space the inputs that satisfy both
records, and prints what came out and whose number it is:

```
Base: 44 derivation records; normative ones producing «b_w_mm»: 2

  1) gear.working-width
     expression:  min(b_mm, mate.b_mm)
     position in load order: 23 of 44

  2) gear.face-width
     expression:  psi_ba * aw_mm
     position in load order: 28 of 44

What each one answers when asked alone:
  gear.working-width     40.0000 mm
  gear.face-width        55.1896 mm

  Both legitimate, both normative, 15.19 mm apart (38 %).

── Closure, order as it is in the base ─────────────────────────
  load order:        gear.working-width  →  gear.face-width
  entered the calc:  b_w_mm = 40.0000 mm
  whose number:      gear.working-width
  named in trace:    gear.working-width (derived)
  not named at all:  gear.face-width   ← neither derived nor refused

── The same, the two records swapped ───────────────────────────
  load order:        gear.face-width  →  gear.working-width
  entered the calc:  b_w_mm = 55.1896 mm
  whose number:      gear.face-width
  named in trace:    gear.face-width (derived)
  not named at all:  gear.working-width   ← neither derived nor refused
```

Three things in that output are worth reading slowly.

**One base, one set of inputs, two answers.** 40 mm or 55.19 mm — the only
difference is which record loaded first. Load order carries no engineering
meaning: it is a consequence of how the records happen to lie in files.

**The displaced record is named nowhere** — neither among the derivations nor
among the refusals. The trace of the calculation looks as if no choice had been
made: one quantity, one provenance, all honest. There is nothing to ask "what
else could have applied here" of.

**Nobody entered the winning number.** The 40 mm is `b_mm` from the defaults of
the `toothed_wheel` kind in the library. It had been sitting on the body since
the body was created, and it entered the calculation as a result. Hence the
second requirement that appeared the same day: no number without a provenance,
and a default must be distinguishable from an entered and from a computed value.

**What you can check yourself without running anything.** Both disputing records
are here, copied verbatim: [`stand/two-records.yaml`](stand/two-records.yaml).
Look at the last line of each —

```yaml
  - id: gear.working-width          - id: gear.face-width
    status: normative                 status: normative
    expression: "min(b_mm, …)"        expression: "psi_ba * aw_mm"
    output: { name: b_w_mm, … }       output: { name: b_w_mm, … }
```

— the same `b_w_mm` for two different formulas from one source. As engineering
they are different quantities: the first is the working width, the part of the
rim that is actually in contact; the second is the design width, how wide to
make it. For the system they are one quantity, because a quantity is identified
by its **name**.

**How to reproduce the whole thing.** The stand is
[`stand/order-decides.ts`](stand/order-decides.ts), 130 lines, and it fixes
nothing by itself:

```
cd EKC2/Compiler && npx tsx ../../profile/stand/order-decides.ts
```

The EKC2 repository is not published — it is unfinished research — so the
command only works on my machine. The stand is here as text to read: what it
does is visible in its 130 lines, and what it printed is above, verbatim.

> A note on the numbers. The 2026 instance — 60 against 64 mm — cannot be
> reproduced in today's base: the base has since been reorganised by genre, and
> a different pair of records now collides. What reproduces is the **mechanism**,
> and it is the same one: two legitimate answers, a choice made by order,
> silence about the displaced one. The case is about the mechanism; 40 and 55.19
> are what it yields today.
>
> Sources: `СЕМАНТИКА.md` §0, `ФОРМЫ-ДАННЫХ.md` §1.4 (project journals, Russian).

---

## 2. One hour of running against one week of planned work

**What happened.** A separate piece of work had been written into the plan: "the
gear wheel does not fit onto the shaft".

The conclusion came from analysing ports and looked unassailable. The `shaft`
kind declares five ports: two rotational (`a`, `b`) and three others — two
supports and a key. Both rotational ports are taken, by the input and the
output. There is no free rotational port to seat a gear wheel on. Therefore the
main scheme of a gearbox is not expressible today, and the model needs changing.

Three candidate designs were already attached to that work — a third port, a
port of multiplicity `n`, named positions — each with its own consequences for
the library. A week of work, not counting the reshuffling of records.

**What the trial showed.** Instead of choosing a design, the smallest gearbox on
which the constraint had to appear was assembled and run. One hour.

```
СОЕДИНЕНИЯ ПРИНЯТЫ: граф собрался
ЦЕПЬ ПОТОКА: шагов 6, КПД 0.9655
   вал_б      a → b      ω 20.944 rad/s   T   76.52 N*m
   шестерня   hub → rim  ω 20.944 rad/s   T   76.52 N*m
   зацепление p → q      v  0.524 m/s     F 3060.91 N
   колесо     rim → hub  v  0.524 m/s     F 3030.30 N
   вал_т      a → b      ω  5.236 rad/s   T  303.03 N*m
   полумуфта  a → b      ω  5.236 rad/s   T  303.03 N*m
НА ИСТОЧНИКЕ: 20.94 rad/s, 77.68 N*m
ШПОНКЕ ДОЕХАЛО: d_mm = 60 mm, torque_Nm = 303.03 N*m
```

The rows are the power chain: connections accepted, the graph assembled; six
steps at an overall efficiency of 0.9655; the input shaft, the pinion, the mesh,
the wheel, the output shaft, the coupling half; then what the source has to
deliver, and what reached the key — a diameter of 60 mm and 303.03 N·m.

Not a single refusal. The ratio of 4 was derived from the diameters, the torque
grew from 76.5 to 303 N·m, the losses in the mesh and the coupling were counted,
and the key received its diameter from the shaft-to-hub joint and its torque
from the ports of that same joint.

**Where the error was.** Not in counting ports — that count is correct. **The
occupancy of both rotational ports had been taken from a different product:**
from a stand where a single shaft is driven directly by a motor. The shaft of a
gearbox has different ends to its chain — if a wheel sits on the shaft, the
torque enters through the mesh, not through the end of the shaft, and no second
free port is required.

All three candidate designs answered a question that did not exist.

**What became a rule.** Before writing down a constraint or designing a form for
it — assemble the smallest product on which it must appear, and run it. What
goes into the plan is the output of that run: the connections, the numbers, the
refusals. Not a retelling.

A refuted entry is not deleted, either: it stays, marked with what refuted it.
Otherwise the next person to open the journal cannot tell which decision is in
force.

> Source: `ПЛАН-БЭКЕНД.md`, sections 121–122.

---

## 3. The guard that issued permission

**What the guard is for.** Some of the checks in the project stood on invented
data — fixtures. That is convenient and almost always a lie: a fixture verifies
the step just before the interesting one. So a list of debtor files was created,
along with a mechanism that makes sure the debt is not quietly dissolved.

The rule: a file that stops being a debtor must name a **live witness** — a check
that runs against a real product. The guard verifies that the witness exists and
that it really reads a product.

```
run.test.ts           loop algebra          (live — loop-turns.test.ts)
word-layer.test.ts    a word and its layers (live — word-live.test.ts)
word-derived.test.ts  a word derived by the core (live — word-live.test.ts)
```

**The hole in the guard itself.** It was found by trying to break it, not by
reading it. The pattern by which the guard recognised a reference to a witness
was `[a-z-]+\.test\.ts` — which does not match a Cyrillic file name. A reference
to a **non-existent** witness passed in silence, and the deliberate corruption
that was supposed to make the guard fail did not make it fail.

> A guard with a hole in its own pattern is worse than no guard: the missing one
> does not stop you from being suspicious, the present one reassures you.

The pattern was fixed; the corruption now fails both checks.

**What the same guard did next.** When one of the checks was moved onto a real
product, the guard **failed** with the words "moved onto a live product — remove
it from the debt list": it caught the author with the second half of the work
undone. Fixture debt: 7 → 4 → 0.

And the move it demanded found a defect the fixtures could not see: the checks
had been standing one step short of the point — "the block returned" instead of
"coordinates came out of the block and reactions out of them"; "the power came
back as 25 kW" instead of the identity holding on a real chain of six bodies.

**What became rules.**

- When you create a guard, write the corruption that must make it fail, and run
  it.
- Corruption is done on a copy, not in the working tree, and is not rolled back
  with the same gesture one uses to roll back someone else's changes.
- Corruption has a counterpart — a control that says "without the corruption
  everything passes": otherwise the expected failure may come from a different
  illegitimacy.
- A corruption that passed in silence **is named, not counted as covered**.
- What a guard does not verify, it reports as a list and a number, with the
  boundary written next to the guard itself. Not by silence.

> Source: `ПЛАН-БЭКЕНД.md`, sections 158–159.

---

## What they have in common

Three cases, one way of working, and it comes down to three rules.

**Measurement before estimation.** The size of a piece of work is not stated
until it has been measured. The rule came out of five cases in one week where
measuring changed the size — three times downwards, twice upwards. The
conclusion, verbatim: it is not that estimates are too high or too low — **an
estimate made without measurement simply has no relation to the work**.

**A run before a diagnosis.** A conclusion drawn from reading the code is not
accepted without a run; what goes into the plan is the output of the run, not
the reasoning. A constraint not confirmed by a run does not go into the plan at
all.

**Corruption before trusting a guard.** A mechanism of discipline differs from a
calculation in that it is circumvented not by error but by convenience — exactly
at the moment it gets in the way. Catching that is its own job, not the job of
good intentions.

None of the three was thought up in advance. Each came out of a case that would
otherwise have repeated itself.

---

Serhii Klochko · [github.com/sergeyy1021](https://github.com/sergeyy1021)
