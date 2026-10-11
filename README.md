# Workday calendar / Arbejdsdagskalender

A free, bilingual working-day calculator for planning in Denmark. Visible English/Danish selector. Dates are processed locally. No account, date upload, ads, analytics, Functions, database or paid APIs.

## Development

Node 20 or newer. No runtime dependencies.

```
npm test
npm run build
```

Serve `dist/` with a static HTTP server. `SITE_URL=https://your-project.pages.dev npm run build` sets canonical/hreflang links and sitemap.

## Features

- Count working days between dates with explicit endpoint inclusion.
- Add/subtract working days, excluding the start date.
- Choose working weekdays and optional Danish public holidays.
- Add company/personal days off; optional 1 May, 5 June, 24/31 December.
- CSV and all-day calendar export of counted working dates.
- Method, privacy and terms pages in both languages.

## Rules and limitations

Gregorian Easter and Danish holidays. Great Prayer Day is included only before 2024. Years 1900–2099 use this current planning model, not a full historical legal calendar; future laws may change. Maximum counting period 3,660 days; maximum offset 2,600 working days. Not legal, tax or payroll advice.

Sources are linked on the method pages. Borger.dk holiday rules and the Ministry of Employment's Great Prayer Day change were checked 11 October 2026.

## Free deployment

Deploy `dist/` as **Cloudflare Pages static assets only**. Do not add Functions, Workers, D1, R2, AI or a paid plan. Static asset requests are free and unlimited per Cloudflare documentation. CI targets a self-hosted Linux x64 runner only, never paid hosted minutes. Do not run workflows against untrusted pull-request code on a privileged runner.

## Monetization readiness, not activation

There is a labeled empty ad placement, but no ad code or affiliate tracking. No consent banner is needed for inactive marketing; do not add a fake banner. Before activation: confirm publisher identity/contact and applicable privacy disclosures, obtain program approval, review placement and implement a working reject/accept/revoke consent control that keeps optional scripts unloaded by default. The current restrictive CSP blocks remote scripts and connections. Revenue is not guaranteed.
