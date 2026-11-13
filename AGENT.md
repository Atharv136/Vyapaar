# AGENTS.md

## Read first, every session
- docs/01-ARCHITECTURE.md, docs/03-IMPLEMENTATION.md, docs/04-VALIDATION.md
- STATUS.md (current phase and inputs still needed)

## Golden rules (never break)
1. The AI never sets prices, stock, totals or payment status. Code does.
2. An order is created only after an explicit Confirm (button or clear "yes"), with a valid token.
3. An order is marked paid only from a verified Razorpay webhook. Never from a customer message.
4. Money is integer paise. No floats.
5. Every business table has tenant_id. Every query is tenant-scoped.
6. Agents may only call registered tools.
7. Never log full phone numbers, tokens or addresses. Mask them.
8. Escalated customers (mode = human) get no AI replies.
9. Abandonment and RTO outputs are labelled "probable" or "illustrative heuristic". Never auto-reject a customer.

## Input protocol (IMPORTANT)
If you need a value you do not have (API key, URL, ID, file path, account decision):
1. Do NOT invent it, and do NOT use a placeholder that looks real.
2. Add it to STATUS.md under "Inputs needed" with: name, where the user gets it, where it goes (.env key or file).
3. Stop the current task, finish any part that does not need the input, and tell the user in this exact format:

INPUT NEEDED
- Name: <VARIABLE_NAME or description>
- Where to get it: <steps>
- Where to put it: <.env key or file path>
- Blocks: <what cannot be tested until this exists>

4. Never print secret values in logs or chat. Check presence only, e.g. "TWILIO_AUTH_TOKEN: set".

## Working method
- One phase at a time. Implement, write tests, run them, fix until green.
- After each phase: update STATUS.md (done, tested, remaining, inputs needed), commit as "P<n>: <name>", and output the status report (Part 5 format).
- Do not start the next phase until the user says "go".
- Add no new paid service and no new dependency without asking.