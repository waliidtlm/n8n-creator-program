# Monitor HubSpot lead response SLAs

## What it does

This n8n template helps sales and RevOps teams track response deadlines for inbound enquiries stored as HubSpot Deals. It complements LI-01, which delivers the enquiry and initializes its tracking fields.

After activation, it checks every five minutes for delivered Deals awaiting a response, plus breached Deals still missing their first response. It checks Deal-associated emails, calls, and meetings attributed to the currently assigned owner. The earliest qualifying timestamp is compared with a fixed 30-calendar-minute deadline.

It records the response time and SLA status in HubSpot. It sends no notifications and does not create Contacts or Deals.

## Response rules

The deadline is `lead_received_at + 30 minutes`. A qualifying activity must belong to the Deal and its current owner, and occur between receipt of the enquiry and the start of the monitoring run.

- Email: outbound CRM email with direction `EMAIL`, excluding `BOUNCED`, `FAILED`, `SCHEDULED`, and `SENDING` statuses. Empty status is accepted.
- Call: status `COMPLETED`.
- Meeting: a valid start time, falling back to its activity timestamp, excluding `CANCELED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED`, and `SCHEDULED` outcomes. Empty outcome is accepted.

| Situation | HubSpot result |
| --- | --- |
| Response at or before the deadline | Save response timestamp; set `RESPONDED_IN_SLA` |
| Response after the deadline | Save response timestamp; set or keep `BREACHED` |
| No response after the deadline | Set `BREACHED` |
| No response before or at the deadline | Keep `AWAITING_RESPONSE`; no write |
| Already breached, still no response | Keep `BREACHED`; no repeated write |

## Requirements

- An n8n instance supporting the exported nodes.
- A HubSpot credential with Deal read/write access and read access to email, call, and meeting activity.
- Delivered enquiry Deals with an assigned `hubspot_owner_id`.
- The following custom Deal properties, initialized by LI-01 or an equivalent intake workflow:

| Property | Type / values |
| --- | --- |
| `lead_received_at` | Date/time |
| `first_human_response_at` | Date/time; empty until a response is recorded |
| `lead_response_sla_status` | Dropdown: `AWAITING_RESPONSE`, `RESPONDED_IN_SLA`, `BREACHED`, `NOT_APPLICABLE` |
| `delivery_status` | Dropdown: `PENDING`, `DELIVERED`, `FAILED` |

LI-02 uses these exact property names. It does not create properties or assign owners.

## Setup

1. Import `Workflows/LI-02-Lead-SLA-Monitor.json` into n8n.
2. Confirm the required properties and prepare fictional test Deals in a controlled HubSpot environment.
3. Connect the same HubSpot credential to all five HTTP Request nodes: Deal search, email search, call search, meeting search, and Deal update.
4. Keep the workflow inactive and **Every 5 Minutes (Disabled Until Publish)** disabled.
5. Run **Manual Test Trigger** and check the results in HubSpot using the acceptance checklist.
6. Enable the schedule and activate the workflow only after the controlled tests pass.

Manual tests can write to HubSpot. Use test records, not real client enquiries.

## Limits and safe failures

- The SLA uses calendar minutes, including nights and weekends. Business hours are not implemented.
- Five-minute checks can delay detection; the recorded response timestamp determines whether the deadline was met.
- Only the current owner's Deal-associated activity qualifies. Owner changes can affect the result.
- Owner-attributed email metadata cannot always prove an email was manually sent rather than automated.
- HubSpot search indexing may delay activity visibility.
- Searches stop safely when results exceed the reviewed 200-record limit; pagination is not implemented.
- Missing or invalid record data returns `manual_review_required`. API/search failures return a failure outcome instead of making an unsupported SLA decision.
- Outcomes are workflow results, not an automatic alert or human-review queue.

Keep credentials in n8n Credentials. Do not include secrets or real lead data in public exports. Re-test the actual template in the target HubSpot portal; the separate pilot's results do not certify this copy.
