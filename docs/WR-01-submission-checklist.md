# WR-01 Creator Submission Checklist

Leave items unchecked until actually verified. Local checks do not establish n8n import compatibility, live behavior or Creator Hub approval.

## Export and canvas

- [ ] Both JSON exports parse, all connections reference existing nodes, and Code nodes compile.
- [ ] No credentials, private workflow IDs, webhook IDs, pinned data or real client data remain.
- [ ] Main workflow inactive and weekly schedule disabled.
- [ ] One yellow overview sticky per export, 100–300 words, containing How it works and Setup.
- [ ] Section stickies use neutral color, stay under 50 words and do not cover nodes/edges.
- [ ] Import into the submission n8n instance; verify supported nodes, expressions and readable branch layout at normal zoom.

## Demo and validation

- [ ] Try Demo reaches Return Demo Preview without any Sheets/Gemini/Gmail node.
- [ ] Demo validation failures return a local error without external calls.
- [ ] Null/boolean/array AI output, extra fields, numeric summaries and oversized summaries are rejected.
- [ ] Impossible dates, missing rows, inconsistent metrics and wrong-client rows are rejected.
- [ ] KPI labels/values come from code; HTML from notes or AI is escaped.
- [ ] Blank period_end selects the previous completed week in the client timezone.

## Controlled live acceptance

- [ ] Configure spreadsheet and sender, bind credentials, and use controlled mailboxes.
- [ ] Gemini returns the required summary format using fictional facts.
- [ ] Reviewer sees the exact recipient, subject and body that will be sent.
- [ ] Approval sends once, stores Gmail message ID, and logs SENT only after API confirmation.
- [ ] Rejection/timeout sends no client email and stays protected on rerun.
- [ ] SENDING is written before the send; interrupted sends are inspected before reset.
- [ ] Stuck PENDING_APPROVAL recovery is documented and tested without duplicate approval/send.
- [ ] Sheet reads/upserts and workflow failure alerts behave in the target instance.
- [ ] Optional WR-99 is selected explicitly and tested using a synthetic failure.
- [ ] Sequential approval delays and single-execution restriction are acceptable for the user's batch.

## Documentation and upload

- [ ] Listing copy, setup, exact spreadsheet headers, limitations and recovery instructions are included.
- [ ] Demo and live mode effects are clearly distinguished; live Gemini data transfer is understood.
- [ ] Recorded local/live results are kept distinct; no unperformed checks marked complete.
- [ ] Re-read the current official Creator Hub template and sticky-note guidelines immediately before submission.
- [ ] Export the final imported/tested template and submit through the current Creator Hub process.
