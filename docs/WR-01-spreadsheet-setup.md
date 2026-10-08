# WR-01 Spreadsheet Setup

Create one spreadsheet with these exact five tab names. Put headers in row 1, using the order below. Keep dates as plain YYYY-MM-DD text and metrics as actual numbers. Use one row per client/period combination; duplicate matches are unsupported.

## Clients

~~~text
client_id | client_name | active | recipient_email | reviewer_email | timezone | currency | period_end
~~~

Example: demo_client | Example Agency | TRUE | client@example.com | reviewer@example.com | UTC | USD | 2026-10-04

Replace emails with controlled mailboxes for live tests. Leave period_end blank for the previous completed Monday–Sunday week. A date override stays fixed until changed or cleared. Use a valid IANA timezone such as UTC or Africa/Casablanca. Extra columns are ignored.

## Weekly Context

~~~text
client_id | period_start | period_end | completed_work | blockers | client_requests | next_actions | internal_notes
~~~

Example: demo_client | 2026-09-28 | 2026-10-04 | Reviewed campaign targeting. | Awaiting landing page approval. | Approve the landing page draft. | Review search terms. |

Separate multiple work/notes items with semicolons. completed_work and next_actions need at least one item. internal_notes stays out of AI facts and client email. Include only notes approved for client communication in the other columns.

## Ads Data

~~~text
client_id | period_type | period_start | period_end | source | spend | conversions | clicks | conversion_rate | cost_per_conversion
~~~

Create two rows per client/report: CURRENT and PREVIOUS. Example:

| client_id | period_type | period_start | period_end | source | spend | conversions | clicks | conversion_rate | cost_per_conversion |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| demo_client | CURRENT | 2026-09-28 | 2026-10-04 | sheet | 120 | 12 | 120 | 0.1 | 10 |
| demo_client | PREVIOUS | 2026-09-21 | 2026-09-27 | sheet | 100 | 10 | 100 | 0.1 | 10 |

Use source=sheet and numeric values. Conversion rate = conversions/clicks; cost per conversion = spend/conversions. When the denominator is zero, enter zero for that derived metric. This template assumes conversions do not exceed clicks. Refresh source rows for each new reporting period; no advertising API import is included.

## Reports

~~~text
report_key | client_id | period_start | period_end | status | reviewer | approved_at | sent_at | recipient | execution_id | error_message | email_subject | email_html | gmail_message_id
~~~

Start with headers only. The workflow maintains these rows. report_key combines client_id:period_start:period_end. Stored subject/body is the exact outgoing report preview. Protect this tab from accidental edits and limit access to client information.

Do not delete PENDING_APPROVAL or SENDING rows without checking the execution and Gmail first. See the description's recovery section.

## Error Logs

~~~text
handled_at | workflow_id | workflow_name | execution_id | execution_url | mode | last_node | error_message | trigger | handler_status
~~~

Start with headers only. This tab is used by the optional WR-99 companion. Replace its spreadsheet placeholder and choose an operator mailbox before selecting it as WR-01's error workflow. RAW cell formatting is configured on writes.

## First live test

Use the fictional rows above and controlled recipient/reviewer mailboxes in a separate spreadsheet. Choose the explicit period_end example, configure the spreadsheet ID, connect credentials, then set test_mode false for the test. Approval sends the exact previewed email; rejection/timeout sends nothing. Remove the date override for normal weekly operation after testing.
