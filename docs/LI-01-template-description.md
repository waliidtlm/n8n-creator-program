# Route inbound leads to HubSpot with contact reuse and duplicate protection

## Creator Hub listing description

Teams using n8n and HubSpot can use this template to process inbound enquiries without confusing repeat customers with duplicate events. It validates and normalizes each enquiry, builds a stable source event key, checks whether HubSpot already contains that event, resolves the Contact, and creates one associated Deal for every valid new enquiry.

### How it works

1. Accept a fake manual test enquiry or an authenticated webhook request.
2. Normalize and validate the source, Contact identity and enquiry content.
3. search Deals using the unique source event key.
4. Return a duplicate no-op when the same event is replayed.
5. Reuse one matching Contact or safely create a new Contact.
6. Create and associate a Deal with the configured pipeline, stage and owner.
7. Initialize delivery and response-SLA fields.
8. Verify uncertain writes before returning success.

### Setup

Connect your own HubSpot credential, create the six required custom Deal properties, and replace the pipeline, Deal stage and owner placeholders in **Configure HubSpot**. Test the included fake enquiry and its duplicate replay before configuring Header Auth and enabling the webhook.

The workflow treats a Contact as a person and a Deal as an enquiry: an existing Contact with a new event gets a new Deal, while replaying the same source event creates nothing.

## Who is this for?

- Agencies and consultants handling inbound enquiries
- SMB sales teams
- RevOps and sales operations teams
- HubSpot users who use n8n for lead intake

## What problem does this solve?

Webhook retries and ambiguous CRM writes can create duplicate Contacts or Deals. This workflow treats a Contact as a person and a Deal as one enquiry, so repeat enquiries from an existing person remain distinct while replays of the same source event become safe no-ops.

## What does this workflow do?

- Accepts a manual test payload or an authenticated webhook request
- Normalizes and validates source, Contact and enquiry fields
- Builds a globally unique source event key
- Searches for a Deal with the same event key
- Reuses one exact Contact match or creates a new Contact
- Creates a new Deal for every valid new enquiry and associates the Contact
- Assigns the configured pipeline, stage and owner
- Initializes delivery and SLA properties
- Verifies uncertain Contact and Deal writes before reporting success
- Returns explicit success, duplicate, rejection, failure or manual-review outcomes

## How it works

1. **Normalize Lead Payload** converts supported payload shapes to one internal structure and normalizes strings, email and phone.
2. **Validate Inbound Enquiry** requires a valid source identity, a usable Contact email or international phone, and enquiry content.
3. **Search Existing Event** searches Deals through `POST /crm/objects/2026-03/deals/search` using the configured unique event-key property.
4. A matching event returns `duplicate_event_no_op`; uncertain or multiple results stop safely.
5. **Search Contact by Identity** searches through `POST /crm/objects/2026-03/contacts/search`, by email when present and otherwise by phone.
6. One Contact is reused. Zero matches create a Contact. Multiple matches require manual review.
7. Uncertain Contact writes are recovered by searching the same identity.
8. **Prepare HubSpot Deal** and **Create HubSpot Deal** create one Deal, associate the Contact and set owner, delivery and SLA fields.
9. **Verify Deal by Event Key** verifies identity, association and required properties before returning `enquiry_delivered`.

## Requirements

- An n8n instance that supports the included node versions
- A HubSpot account with permission to read and write Contacts and Deals
- A HubSpot Service Key or supported equivalent credential stored in n8n Credentials
- A separate Header Auth credential for the inbound webhook when it is enabled
- The custom Deal properties listed below

## HubSpot setup

Create or confirm the required Deal properties. Configure `source_event_key` as a unique property suitable for exact equality lookup. Confirm the target pipeline, stage and owner are active and compatible. Give the HubSpot credential the minimum scopes needed to read and write Contacts and Deals.

Never paste a token, Service Key, Authorization header or webhook secret into a node field or exported JSON.

## Required custom properties

| Property | Type | Required options |
| --- | --- | --- |
| `lead_received_at` | Date/time | — |
| `first_human_response_at` | Date/time | — |
| `lead_response_sla_status` | Dropdown | `AWAITING_RESPONSE`, `RESPONDED_IN_SLA`, `BREACHED`, `NOT_APPLICABLE` |
| `delivery_status` | Dropdown | `PENDING`, `DELIVERED`, `FAILED` |
| `source_event_id` | Single-line text | — |
| `source_event_key` | Single-line text | Unique idempotency key |

Configure `source_event_key` as unique in HubSpot. The workflow generates values such as `website:event_123` from `source_system + ":" + source_event_id`.

## Setup

1. Import `Workflows/LI-01-Inbound-Lead.json` into n8n.
2. Open **Configure HubSpot**.
3. Replace `YOUR_PIPELINE_ID`, `YOUR_DEAL_STAGE_ID` and `YOUR_OWNER_ID`.
4. Keep `hubspot_event_key_property` as `source_event_key`, or set the exact internal name of your equivalent unique Deal property.
5. Bind the same HubSpot credential to all six HubSpot HTTP Request nodes.
6. Leave **Receive Inbound Lead** disabled while testing.
7. When ready for inbound traffic, bind a Header Auth credential to the webhook, confirm its path and enable the node/workflow.

If a required `YOUR_...` placeholder remains, the workflow returns `configuration_error` before making any HubSpot request.

## Testing

1. Run **Start with Demo Lead** with the included fake payload.
2. Verify one Contact and one associated Deal in HubSpot.
3. Check pipeline, stage, owner, source IDs, delivery state and SLA state.
4. Run the same event again and confirm `duplicate_event_no_op` with no new records.
5. Change only `source_event_id` and test an existing Contact; confirm a new Deal is created.
6. Test an invalid enquiry and confirm that no HubSpot records are created.
7. Test the webhook only after adding Header Auth.

## How to customize

- Pipeline ID, Deal stage ID and owner ID in **Configure HubSpot**
- Event-key Deal property internal name in **Configure HubSpot**
- Manual example payload in **Load Demo Enquiry**
- Webhook path and Header Auth credential in **Receive Inbound Lead**
- Validation rules in **Validate Inbound Enquiry**, only when your source contract requires different fields

## Safe failure and duplicate protection

The workflow derives `source_event_key` as `source_system + ":" + source_event_id`. Zero Deal matches continue. One match returns `duplicate_event_no_op`. Multiple, malformed or uncertain results stop processing before Contact or Deal creation. Retry an uncertain delivery with the same source event ID; generating a new ID defeats replay protection.

An existing Contact is not a duplicate enquiry. A new source event for that Contact reuses the Contact and creates a new Deal.

### Write recovery

Validation runs before HubSpot writes. Ambiguous Contact identity stops for manual review. Automatic POST retries are disabled. After an uncertain Contact or Deal write, the workflow searches and verifies the expected record rather than blindly creating again. It reports success only after the Deal identity, Contact association, owner, pipeline, stage, delivery and SLA fields verify.

## Limitations

- The workflow searches by email when both email and phone are present; it does not reconcile conflicting matches across both fields.
- It expects one exact Contact match and requires manual cleanup when HubSpot contains duplicates.
- It initializes SLA state but does not monitor human responses; use a separate SLA Monitor workflow.
- It does not create HubSpot custom properties, pipelines, stages, owners or credentials.
- Live behavior depends on HubSpot API compatibility, scopes, rate limits and the target portal's property definitions.

## Security

- Store all HubSpot and webhook secrets only in n8n Credentials.
- Apply least-privilege HubSpot scopes.
- Keep the webhook disabled until Header Auth and payload validation are tested.
- Treat inbound message fields as untrusted data in any downstream workflow.
- Do not log or publish real lead payloads.
- Rotate any credential that is accidentally included in an export, even if the export is later deleted.
