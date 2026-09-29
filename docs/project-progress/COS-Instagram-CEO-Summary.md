# COS - Instagram integration: CEO summary

Prepared: 29 September 2026

Scope: Content & Social > Social Publisher | Development/staging only

## Executive status

Instagram integration has been added to COS Social Publisher in staging. The account-connection controls and governed publishing workflow are implemented, and initial server configuration and access checks have passed. The final brand-account connection and first successful Instagram publication have **not yet been verified**. This is not a production-launch announcement.

## How Instagram works in COS

**Company > Brand > Instagram account > Approved content > Queue or schedule > Confirm result**

1. **Choose the right business context.** Select the company and brand. COS shows the accounts and content the user is authorized to access.
2. **Connect the account.** Choose **Connect Instagram**. The account owner signs in on Instagram and grants COS access. This sign-in is expected; COS does not collect the Instagram password. Return to COS and refresh results to confirm the account is connected under the intended brand.
3. **Prepare and approve content.** Select an approved brief, provide the image and caption, confirm usage rights, and obtain the required approval for that exact content version.
4. **Queue or schedule, then verify.** Authorized users submit the approved version for immediate processing or a chosen date and time. The backend worker must be activated before queued jobs are processed. COS tracks results and errors; a queued job is not evidence of a published post. Confirm success using the final status and published-post link.

### What is ready, and what remains

| Area | Current position |
| --- | --- |
| Instagram integration | Added in staging; final account connection and first publication still need end-to-end verification. |
| Media | Current implementation supports one JPEG image per post. Video/Reels support is requested but is not yet implemented. |
| Scheduled publishing | Queue/schedule controls exist. The background scheduler remains inactive during connection testing. |
| Hosted web access | Supported by the code. The exact staging website origin still needs to be configured and verified for login return and browser access. |
| Access protection | Existing Content & Social memberships and database row-level security remain the authorization boundary. Seeing a company or brand does not automatically grant data access. |

### Why delivery took longer

The work encountered developer-account verification delays, professional-account and tester setup, permission configuration, and missing server settings. These required coordination across COS, Meta and the account owner. Initial configuration checks now pass; full account-connection and publishing validation remains outstanding.

## How other companies and brands are added

1. **Create the company.** An appropriately authorized user adds a company through the existing governed setup. Companies are separate records, not hardcoded names.
2. **Create its brand.** Select that company, add the brand and set its publishing timezone. Additional brands can be onboarded without changing application code.
3. **Assign scoped access.** Grant the appropriate Content & Social memberships through the approved process. Company visibility is not a substitute for permission to view, approve or publish content.
4. **Prepare the Instagram account.** Use a Business or Creator account. The Instagram Login integration does not require a linked Facebook Page. During staging, add the account as an authorized tester and accept the invitation. [Meta's Instagram API documentation](https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00)
5. **Authorize and verify.** Select the company and brand in Social Publisher, connect the intended Instagram account, complete the owner's consent and refresh results. Verify the account is attached to the correct brand before testing a post.

A central Meta application can serve multiple brands; a new developer application is not normally required for every company. Each account still needs its own authorization. Wider onboarding must meet Meta's applicable access, business-verification and app-review requirements.

## Next delivery steps and management input

- Verify the staging website address and complete the first brand-account connection.
- With approval, activate the background worker and verify a controlled image post and scheduled post. Do not treat the integration as live before these checks pass.
- Implement and test video/Reels support, then additional social-platform integrations. Priorities and delivery dates are not yet committed.
- Confirm account ownership, who may approve and publish, brand timezones, approved test content and the next platform priority.

Evidence basis: implementation review, staging checks and user-provided setup information available on 29 September 2026. No production configuration or launch is represented by this report.

## Short CEO update

Apologies for the delay caused by account verification, permission setup and server-configuration issues. Instagram integration has now been added to COS Social Publisher in staging, with final account-connection and publishing tests still pending. Other social media integrations are planned next, subject to testing and the required platform approvals.
