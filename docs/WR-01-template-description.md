# Draft weekly client reports with human approval

## Creator Hub listing description

Agencies and consultants can use this template to prepare weekly client updates from Google Sheets without sending an unchecked AI draft. It joins each active client's performance rows and work notes for the exact reporting period, validates the data, and calculates KPI changes in code.

Gemini drafts a short summary without numbers. The numeric table is generated directly from verified metrics, keeping spend, clicks, conversions, conversion rate and cost per conversion attached to their correct labels. The full email, including recipient and subject, is shown to a reviewer before Gmail delivery.

The default fictional demo works without credentials or external calls. Live mode uses your own spreadsheet and Google Sheets, Gemini and Gmail credentials. Reports are keyed by client and period. The workflow records SENDING before attempting delivery, then stores the returned Gmail message ID and SENT status. Interrupted or uncertain sends require operator review rather than automatic resend.

### How it works

Validate data → calculate changes → draft summary → review complete email → approve → record SENDING → send → record SENT.

### Setup

Run Try Demo first. Create the documented spreadsheet tabs, configure the spreadsheet ID and sender name, and bind credentials. Test one controlled client before enabling live mode and the disabled weekly schedule.

## Files

- Workflows/WR-01-Weekly-Client-Report.json: the third use-case template.
- Workflows/WR-99-Report-Error-Handler.json: optional companion for execution failures; not a fourth business use case.
- fixtures/WR-01-demo-dataset.json: fictional dataset also embedded in the demo node.
- [Spreadsheet setup](WR-01-spreadsheet-setup.md).
- [Acceptance checklist](WR-01-submission-checklist.md).

## Requirements and setup

1. Import WR-01 into an n8n version supporting its exported node versions. Keep it inactive.
2. Run Try Demo with Configure Report Template unchanged. The output contains a rendered-email HTML string and subject. Demo uses no Sheets/Gemini/Gmail calls or credentials, including on validation errors.
3. Create five tabs using WR-01-spreadsheet-setup.md. This workflow reads manually maintained Ads Data; it does not connect to Google Ads directly.
4. In Configure Report Template, set spreadsheet_id and sender_name. Leave test_mode true until controlled setup is complete.
5. Bind your own Google Sheets credential to the read/write nodes, Gemini credential to Generate AI Draft, and Gmail credential to Request Human Approval and Send Client Email. No credential IDs are embedded in the export.
6. For a live integration test, use a separate test spreadsheet, fictional client data and mailboxes you control. Set test_mode false. This enables real Sheet access, Gemini data transfer, approval email and approved client delivery.
7. Optionally import WR-99, replace its spreadsheet ID and operator mailbox, bind Sheets/Gmail credentials, and select it under WR-01's error-workflow setting. Test a synthetic error. It is not prelinked to a private workflow ID.
8. After the acceptance checklist passes, enable Schedule Trigger and activate WR-01. It schedules Tuesday at 09:00 in the n8n workflow/instance timezone; configure that timezone deliberately.

## Reporting periods

Blank Clients.period_end uses the previous completed Monday–Sunday week in that client's timezone. A supplied period_end must be a real ISO calendar date (YYYY-MM-DD). It selects a seven-day period ending on that date, plus the immediately preceding seven days.

Explicit overrides remain fixed until changed or cleared. The weekly schedule does not update advertising data: prepare matching rows for each new period before the run. Missing rows become DATA_ERROR rather than being guessed.

## Metrics and AI boundaries

Metrics must be numeric. Conversion rate is a fraction between zero and one. Clicks and conversions are nonnegative integers, with conversions no greater than clicks. Cost per conversion and conversion rate must agree with the source figures. Zero denominators use zero values as a template convention; the resulting percentage change can be labeled New activity.

Code generates the numeric table. AI is limited to a nonempty summary of at most 100 words without digits or common number words. Malformed JSON, missing/extra fields and numeric summaries are rejected. This constraint prevents the earlier metric-number swapping issue; it does not prove every qualitative claim. The reviewer remains responsible for meaning and accuracy. Report text is HTML-escaped.

The serialized verified facts include client name, metrics and selected work/context notes. Live mode transfers these to Gemini. Do not include confidential context without permission. Internal notes and recipient emails are not included in the AI facts.

## States and recovery

| State | Meaning / next action |
| --- | --- |
| PENDING_APPROVAL | Review requested or execution interrupted before/during review; inspect before reset |
| SENDING | Delivery attempted or about to be attempted; check Gmail before retry |
| SENT | Gmail returned a message ID and final log completed; this confirms API acceptance, not inbox receipt |
| REJECTED | No client email; revise and explicitly reset if a new attempt is intended |
| APPROVAL_TIMEOUT | No approved delivery; inspect and explicitly reset |
| DATA_ERROR | Invalid dataset/AI output; correct the cause before retry |

SENT, SENDING, PENDING_APPROVAL, REJECTED and APPROVAL_TIMEOUT are protected from automatic reruns. Legacy APPROVED rows are also protected. Only absent rows or corrected DATA_ERROR rows automatically re-enter processing. There is no permanent APPROVED status in the new live path: approval is recorded with its timestamp in SENDING.

If Gmail succeeds but the final Sheet write fails, the row stays SENDING. Inspect Gmail and the n8n execution; record SENT and its message ID manually if delivery was accepted. Do not blindly reset and resend. An operator must review stuck PENDING_APPROVAL/SENDING rows. No automatic age-based reset is implemented.

## Limitations

- One live execution at a time; Google Sheets check/upsert is not an atomic lock. Overlapping runs may duplicate approvals or sends.
- Approvals are sequential and can wait up to 24 hours each; later clients wait. This template is suited to a small controlled batch, not high-volume parallel reporting.
- Client reads are bounded to 1,000 rows plus headers. Duplicate client/period rows are unsupported; ensure uniqueness.
- Sheet/AI reads have bounded retries; Gmail sends have no automatic retry.
- WR-99 alerts execution failures. DATA_ERROR rows require report-sheet review and do not automatically raise execution errors.
- Default demo mode cannot certify live n8n import, OAuth, approval callbacks or Gemini behavior. Complete controlled integration tests before submission or activation.

Official reference: [n8n Gmail message operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations/). Check the current [Creator Hub](https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f) submission and sticky-note requirements before upload.

## Verification record

On 8 October 2026, node scripts/check-report-template.mjs passed 20 local checks. They include export structure, sticky placement bounds, the actual default demo path, malformed/numeric AI rejection, date validation, HTML escaping, approval decisions, protected states, and uncertain Gmail responses. No external services were called. n8n import, visual canvas inspection and live Sheets/Gemini/Gmail acceptance are still pending.
