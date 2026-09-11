# LI-01 Creator Program Submission Checklist

## Automated repository checks

- [ ] Workflow JSON parses successfully.
- [ ] Every connection source and target references an existing node.
- [ ] Every connection output index has a valid connection array.
- [ ] Every Code node compiles as JavaScript.
- [ ] No secrets, Service Keys, bearer tokens or Authorization headers are embedded.
- [ ] No credential IDs or credential objects are embedded.
- [ ] Test names, emails, phones, companies and event IDs are fake.
- [ ] No legacy `/crm/v3/objects/deals/search` or `/crm/v3/objects/contacts/search` endpoint exists.
- [ ] Deal and Contact search nodes use `/crm/objects/2026-03/.../search`.
- [ ] No obsolete debug node or pinned execution data remains.
- [ ] No private portal, owner, instance, workflow or webhook ID remains.
- [ ] No unnecessary CobaltHand-specific wording remains.
- [ ] Configuration placeholders are obvious and consistent.
- [ ] Required expressions still reference existing node names.

## Workflow canvas checks

- [ ] Import the JSON into a clean/current n8n instance.
- [ ] Confirm the workflow imports without migration warnings that affect behavior.
- [ ] Confirm all nodes are supported by the submission environment.
- [ ] Confirm exactly one main overview sticky is yellow, top-left and 100–300 words.
- [ ] Confirm section stickies are white/grey, group multiple nodes and remain under 50 words.
- [ ] Confirm the overview sticky contains `How it works` and `Setup` sections.
- [ ] Confirm the left-to-right graph is readable at normal zoom.
- [ ] Confirm sticky notes do not cover nodes or important connection lines.
- [ ] Confirm sticky-note text is readable and setup instructions are near the relevant logic.
- [ ] Confirm branch labels and business-oriented node names are understandable.
- [ ] Confirm no broken or unresolved expressions appear in the editor.
- [ ] Confirm all six HubSpot HTTP Request nodes prompt for credentials rather than containing one.
- [ ] Confirm **Receive Inbound Lead** is disabled in the exported submission copy.
- [ ] Confirm the overall workflow is inactive before export.

## HubSpot setup checks

- [ ] Required Deal properties are documented.
- [ ] `source_event_key` is configured as a unique Deal property.
- [ ] Pipeline, Deal stage, owner and event-key property configuration points are obvious.
- [ ] Placeholder values are replaced only in the user's imported copy, not with private values in the public template.
- [ ] Credential scopes follow least privilege for Contact and Deal read/write operations.

## Functional acceptance checks

- [ ] New Contact + new event creates one Contact and one associated Deal.
- [ ] Same event replay returns `duplicate_event_no_op` and creates no records.
- [ ] Existing Contact + new event reuses the Contact and creates a new Deal.
- [ ] Invalid enquiry is rejected before HubSpot writes.
- [ ] Unchanged `YOUR_...` configuration placeholders return `configuration_error` before HubSpot writes.
- [ ] Multiple Contact matches stop for manual review.
- [ ] Uncertain duplicate lookup creates no records.
- [ ] Uncertain Contact write follows identity recovery.
- [ ] Uncertain Deal write follows event-key verification.
- [ ] Created Deal has owner, pipeline, stage, source IDs, delivery status and initial SLA state.
- [ ] `first_human_response_at` remains empty at intake.

## Documentation checks

- [ ] Public title uses an action-oriented, sentence-style description of the use case.
- [ ] Creator Hub listing copy is approximately 200 words and uses clear Markdown without HTML.
- [ ] Template title and short summary are clear.
- [ ] Target users and problem solved are stated.
- [ ] Setup, HubSpot prerequisites and required properties are documented.
- [ ] Testing and customization instructions are complete.
- [ ] Duplicate behavior and the Contact-versus-Deal model are explicit.
- [ ] Failure-safety behavior, limitations and security notes are explicit.
- [ ] Description can be copied or adapted into the Creator Hub submission form.

## Latest official n8n checks before submission

The Creator Hub changes its review and submission process. Immediately before upload:

- [ ] Open the official [n8n Creator Hub](https://n8n.notion.site/n8n-Creator-hub-7bd2cbe0fce0449198ecb23ff4a2f76f).
- [ ] Re-read its current **Template submission guidelines**.
- [ ] Re-read its current **Sticky note guidelines for templates**.
- [ ] Use its current workflow-template description structure and required form fields.
- [ ] Confirm the Creator account's current submission limits and review workflow.
- [ ] Export again from the n8n version used for the final import test.
- [ ] Upload the final JSON and detailed description through the current Creator Hub flow.
- [ ] Treat this checklist as preparation, not a guarantee of approval; the n8n review team makes the final decision.
