# LI-02 Submission Checklist

Use this checklist before sharing the SLA-monitor template. Leave items unchecked until verified. These checks do not guarantee n8n acceptance.

## Export and setup

- [ ] Workflow JSON imports into the target n8n version without broken nodes or expressions.
- [ ] Connections are valid and Code nodes compile.
- [ ] No secrets, credentials, private IDs, real lead data, or pinned execution data are included.
- [ ] Workflow is inactive and the five-minute schedule is disabled in the export.
- [ ] All five HTTP Request nodes can use the user's own HubSpot credential.
- [ ] Required Deal properties, owner field, and permissions are documented.
- [ ] Canvas notes are readable and explain setup and workflow behavior.

## Controlled functional tests

Use fictional HubSpot Deals and activities. Manual runs may update those Deals.

- [ ] No eligible Deals returns `no_deals_to_monitor`.
- [ ] An unanswered Deal before its deadline remains `AWAITING_RESPONSE` without a write.
- [ ] A qualifying response at or before the deadline sets `RESPONDED_IN_SLA` and saves its timestamp.
- [ ] An unanswered Deal after its deadline becomes `BREACHED` without a response timestamp.
- [ ] A late response saves its timestamp while keeping the Deal `BREACHED`.
- [ ] A previously breached Deal is checked again and a later response is recorded.
- [ ] A breached Deal with no new response causes no repeated update.
- [ ] Multiple qualifying activities select the earliest timestamp.
- [ ] Email, completed call, and meeting rules behave as documented, including empty email status and meeting outcome.
- [ ] Wrong-owner, pre-enquiry, future, and explicitly disqualified activities do not count.
- [ ] Missing owner or invalid receipt time returns `manual_review_required` without updating the Deal.
- [ ] Failed/malformed API responses and search results beyond the 200-record limit stop the affected processing safely.
- [ ] A successful Deal update is verified against the returned ID, status, and response timestamp.

## Documentation and submission

- [ ] Description explains the 30-calendar-minute SLA and five-minute monitoring schedule.
- [ ] Setup explains the relationship to LI-01 and lists required properties and permissions.
- [ ] Limitations cover current-owner activity, uncertain human attribution, indexing delays, and search limits.
- [ ] Description states that no notifications or human-review queue are included.
- [ ] Test results are recorded separately; no unperformed test is presented as passed.
- [ ] Review the current official n8n Creator Hub submission and sticky-note guidelines before upload.
- [ ] Export the reviewed workflow again and submit using the current Creator Hub process.
