Vyapaar: Phase-by-Phase Build Control

Paste each phase prompt into Antigravity in order. Don’t start a phase until the previous one passes its tests. After each phase, paste back the status report so I can check it.

Time: it’s 20:16 now. The phases below total about 4 hours 15 minutes, which leaves about 45 minutes for testing and fixes before your deadline. If you fall behind, cut from the bottom of the list (see “If time runs short” at the end).

Scope honesty: Module I (Lead Qualification and Sales Automation) in your README is not in this 5-hour plan. It’s a full second product mode. I’ve placed it as a stretch phase (P13) that you’ll only attempt if everything above is green. If you want it fully built, we’ll schedule it as a separate session.

Part 1: Rules for working with Antigravity
Give Antigravity only the variable names, never the secret values in chat. You fill .env yourself. Antigravity checks that a value exists without printing it.
Antigravity must stop and ask when it needs an input. It must not invent keys, URLs or IDs.
After each phase, Antigravity updates STATUS.md and you paste the status report back to me.
Each phase ends with tests. A phase is not done until its tests pass.
Commit after each green phase, with the message P<number>: <name>.
Part 2: Master status tracker

Keep this in STATUS.md in the repo root. Update the Status column as you go: ⬜ not started, 🟨 in progress, ✅ done and tested, ⛔ blocked on input.

#	Phase	Time	Status	Live in demo?
P0	Inputs and environment	10 min	⬜	n/a
P1	Project skeleton and Twilio webhook	15 min	⬜	Yes
P2	Database schema and seed data	15 min	⬜	Yes
P3	AI understanding (text, voice, image)	25 min	⬜	Yes
P4	Catalog search and cart	25 min	⬜	Yes
P5	Confirm, orders and atomic stock	25 min	⬜	Yes
P6	Razorpay payments and verified webhook	20 min	⬜	Yes (test mode)
P7	My Usual, Wishlist, consent and STOP	20 min	⬜	Yes
P8	Human handover and RTO Shield	20 min	⬜	Yes
P9	Abandonment follow-up engine	15 min	⬜	Code and tests only
P10	n8n automations (CRM sheet, alerts)	15 min	⬜	Yes
P11	Merchant dashboard	30 min	⬜	Yes (minimal)
P12	End-to-end tests and demo script	20 min	⬜	n/a
P13	Lead mode (README Module I)	stretch	⬜	Only if time allows