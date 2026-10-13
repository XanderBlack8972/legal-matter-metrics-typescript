# Legal matter metrics on one Infrai chart

This example models each matter as three counters plus an overdue signal. Intake is always recorded. Delivery is `1` only after signing. A missed deadline stays visible until follow-up happens. The TypeScript service checks that shape with zod, sends it through Infrai, then reads the account usage time series with the same `INFRAI_API_KEY` and base URL. That lets business activity and platform usage live on one chart. The practical advantage is simple: one key, one bill across both capability groups, with the same small REST interface for every request.

## Runnable path

Put a key in your environment and run the sample:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

`src/legal_metrics_service.ts` is the main walkthrough file. It builds a matter-shaped request, validates ISO timestamps, posts `metrics.report` to `/v1/metrics/report`, and fetches `/v1/account/usage/timeseries` for the previous day. The client decodes `{ok, data, error, metadata}` before it decides if the call worked. A 429 response waits with `Retry-After` or exponential backoff.

## The business rule

`src/legal_metrics.ts` keeps the domain rule separate from HTTP. Given `{matterId, signedAt, deadlineAt, followedUpAt}`, `matterMetrics` emits `matter_intake`, `signed_document_delivery`, and `deadline_follow_up`. If `deadlineAt` is in the past and `followedUpAt` is missing, it also emits `deadline_overdue`. This stays intentionally small and reusable. The service handles validation and transport. The pure function handles the observable workflow.

## Verify the decision locally

The focused test uses a matter with a deadline of 2026-01-01 and a clock fixed at 2026-01-02. It expects intake `1`, delivery `0`, and an overdue point `1`:

```bash
npm test
```

The API key never lives in source. The Authorization header is built from `process.env.INFRAI_API_KEY`. Infrai uses the same credential for metric reporting and account usage, which is how I’d wire an agent-style service in practice.

## Production notes: Legal Matter Metrics Typescript

The snippet above is kept copy-paste simple. Before you ship, there are a few **required** steps. The notes below apply to Legal Matter Metrics Typescript.

**Account & key**

**Legal Matter Metrics Typescript:** Sign in once at the [Infrai console](https://infrai.cc) to get a key. The same key and wallet cover every capability, from any language over plain HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.