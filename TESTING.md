# Testing COS

Canonical setup and validation instructions live in [development setup](docs/development/setup.md).

```powershell
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build
npm.cmd run test:e2e
```

Vitest covers authorization helpers, provisioning policy/client behavior, shared UI, Sales & Marketing capabilities, Content & Social rules, app routing, naming conversion, and data-error classification.

Playwright runs desktop and mobile projects. Employee workspace tests require an approved account in `COS_E2E_EMAIL` and `COS_E2E_PASSWORD`; they skip when credentials are absent. The public client-approval route test requires no employee account. Never hard-code test identities or passwords in source.
