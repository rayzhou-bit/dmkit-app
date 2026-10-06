# GenAI card — design

**Status:** planned, not implemented. This records the decisions and the reasoning
behind them so the next person (or session) doesn't re-litigate them.

Last updated: 2026-10-05.

## Goal

Type a prompt, get a finished card. "Normal goblin but harder" produces a stat
card built from the SRD goblin with coherently scaled numbers.

## Decisions already made

| Question | Decision |
|---|---|
| Where the API key lives | Hybrid: a weaker model server-side by default, user's own key optional via settings |
| Grounding | Send the user's relevant existing cards as context |
| v1 scope | Monster cards only; note/custom extend later |
| Content licensing | SRD 5.1 statblocks and original prose, never Monster Manual text |

## Why not self-host a small model

Considered and rejected. Two separate reasons, both decisive:

**Utilization, not GPU access.** Renting a GPU is easy; the problem is that this
app would use it for a few seconds a day while paying for all 720 hours in the
month. An always-on L4 is roughly $0.70/hr (~$500/mo). An API is the same
hardware shared across many users' bursts — you rent milliseconds at high
utilization instead of months at near-zero. There is no option where the compute
is free, only a choice about who absorbs the idle time.

**Capability is a separate axis.** A free GPU wouldn't fix it. The task is not
"write D&D flavour text" — it is emitting schema-conforming JSON whose numbers
are mutually consistent (CR against HP against AC against attack bonus against
damage dice). Small quantized models are weakest at exactly that. TTRPG
fine-tunes on HuggingFace optimise for narrative voice, which is the wrong
target and often *worse* at schema adherence than their base model.

Browser-side WebGPU is the only genuinely free-to-us option (the user's machine
does the work), at the cost of a multi-GB download and weak output. Viable only
as an explicitly-labelled "free, lower quality" tier.

## Architecture

```
                    ┌─ default ─────────────────────────────┐
  prompt box ──┬───▶│ /api/generate-card  (Hosting rewrite) │
               │    │   → Function: our key, Haiku 4.5      │
               │    │     metered, requires sign-in         │
               │    └───────────────────────────────────────┘
               │    ┌─ if user set a key in settings ───────┐
               └───▶│ api.anthropic.com direct from browser │
                    │   → their key, Sonnet 5, they pay     │
                    └───────────────────────────────────────┘
                                   │
                    both return the same emit_card tool payload
                                   ▼
                    buildMonsterContent → createCard (one undo step)
```

**BYOK goes direct from the browser, never through our function.** A user's API
key must not touch our server. The consequence is that `firebase.json`'s CSP
needs `connect-src += https://api.anthropic.com` for that path, plus the
`anthropic-dangerous-direct-browser-access` header. The default path stays
same-origin through the Hosting rewrite, so it needs no CSP change and no CORS.

Cloud Functions require the **Blaze plan** — an open prerequisite (see below).

## The contract

One tool, `emit_card`, with `tool_choice` forced to it. Its schema mirrors the
existing card shapes, so the response feeds straight into `buildMonsterContent`
/ `buildNoteContent` / `buildCustomContent`.

That reuse is the main safety property: those builders already coerce every
field and drop anything unrecognised, so **malformed model output cannot corrupt
the store**. The validation layer exists; this feature just routes through it.

### The hazard that layer does *not* cover

`buildMonsterContent` checks types, not semantics. It cannot tell that
"CR 1/4, 80 HP, +9 to hit" is nonsense. The failure mode here is not an error we
can surface — it is a confidently wrong stat block that passes every check and
lands on the canvas looking plausible. That is worse than no feature, because it
quietly poisons someone's prep.

Mitigation: shrink the model's job. Feed the real Goblin card as context and ask
for a **delta** against it rather than a creature invented from scratch. This is
also why v1 is monster-only — the numbers are checkable.

## UX

A prompt box positioned on the canvas where the card will land.

**Keep it in `session` state and dispatch `createCard` exactly once, on success.**
The undo allowlist auto-includes every `project/*` reducer, so creating a
placeholder card and then filling it would cost the user two undos to remove one
card.

Spinner rather than streaming for v1 — a few seconds doesn't justify the
complexity.

## Settings

New `POPUP_KEYS.settings`, opened from `UserOptions` in the header.

- API key stored in `localStorage` **only**. Never Firestore — it is a
  credential, and project documents sync.
- Surface which mode is active: "Using your key (Sonnet 5)" vs "Using the
  built-in model (N/day)".

## Context selection

Match prompt words against card titles using the same search the `#` reference
picker already does; send the top 2–3 whole cards, capped. "Normal goblin but
harder" then builds on *their* goblin — AC 15, HP 7 — not a generic one.

## Cost

Published rates (Oct 2026): **Haiku 4.5 is $1/MTok input, $5/MTok output**;
Sonnet 5 is $2/$10. Forced `tool_choice` adds **588 system-prompt tokens** on
Haiku 4.5.

Estimated per generation:

| Component | Tokens |
|---|---|
| System prompt + SRD guidance | ~500 |
| `emit_card` tool schema | ~700 |
| Tool-use overhead (sourced) | 588 |
| 2–3 context cards as JSON | ~1,200 |
| User prompt | ~20 |
| **Input** | **~3,000** → $0.003 |
| **Output** (stat block as tool JSON) | **~800** → $0.004 |

**≈ $0.007 per card.** Anthropic's own worked example on the pricing page
(~3,700 tokens/conversation on Haiku 4.5 ≈ $37 per 10,000) is the sanity check;
ours runs slightly higher because stat blocks are output-heavy and output costs
5×.

Implications:

- A 10/day meter = 300/month per maxed-out user ≈ **$2/month each**
- 100 users all maxing it ≈ **$210/month**, and realistically almost nobody maxes a meter
- **Break-even against a ~$500/mo always-on GPU: ~71,000 generations/month** (~2,400/day)

The prices are sourced; **the token counts are an estimate of our workload**. The
tool schema and context-card sizes are the uncertain part and they dominate the
input. Measure with the token-counting endpoint once the contract exists, before
setting the meter.

Prompt caching would cut the ~1,800 fixed tokens to 10% on a hit, but the cache
TTL is 5 minutes — at low volume it would almost never hit. Not worth the
complexity until usage is steady.

## Metering

Per-uid daily counter in Firestore, checked and incremented transactionally in
the function. Plus a `max_tokens` cap and a prompt-length limit. Without this,
one person with a loop spends our money.

## Failure modes

Each maps onto the existing `session.error` pattern; copy the `requireFirebase`
guard style in `data/api/database.js`.

- Not signed in → "Sign in to generate", consistent with saving needing an account
- Firebase unconfigured (offline dev) → degrade, don't throw
- Timeout / network
- Model returns something unusable → show an error rather than creating an empty card

## Open questions

1. **Is the project on the Blaze plan?** PR 4 can't deploy otherwise.
2. **Meter values** — start at Haiku 4.5 / 10 per day, then measure real token
   counts and loosen.
3. **Delta vs. full generation** — asking for only the changed fields against a
   context card is a meaningfully smaller ask and changes the tool schema.
   Better decided before PR 1 than retrofitted.
4. **Non-LLM path for the common case** — D&D has real rules for scaling a
   creature. A deterministic "make this harder" transform on an existing card
   would be more reliable than any model, instant, and free. It may cover most
   of what we actually want, leaving generation for "invent something new".

## PR plan

1. **Contract + validation** — pure, no network, fully testable. Tool schema,
   mapping to the builders, adversarial payload tests (missing fields, wrong
   types, 500-entry arrays, prose where a number belongs).
2. **Settings popup + key storage** — no generation yet.
3. **Prompt UX + BYOK transport** — CSP change lands here. Feature works
   end-to-end for anyone holding a key, with no billing dependency.
4. **Cloud Function + metering** — becomes the default. The only PR needing Blaze.

This order gives a working feature at PR 3 without touching billing, and makes
PR 4 purely additive.

## Testing

Pure mapping tests from tool output → builders, including adversarial payloads.
Mock the SDK in the function's tests. **No live API calls in CI.**

## Sources

- [Anthropic — Pricing](https://platform.claude.com/docs/en/docs/about-claude/pricing)
  (model rates, tool-use token overhead, worked Haiku example)
