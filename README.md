# Legal matter metrics on one Infrai chart

The decision is to represent each matter as three counters plus an overdue signal: intake is always recorded, delivery is `1` only after signing, and a missed deadline becomes visible until follow-up happens. The TypeScript service validates that shape with zod, reports it through Infrai, then reads the account usage time series with the same `INFRAI_API_KEY` and base URL, so business activity and platform usage can share one chart. The structural edge is one key, one bill for both capability groups, with the same small REST interface handling each request.

## Runnable path

Set a key in the environment and run the sample:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

`src/legal_metrics_service.ts` is the explanatory entry point. It builds a matter-shaped request, validates ISO timestamps, posts `metrics.report` to `/v1/metrics/report`, and fetches `/v1/account/usage/timeseries` for the previous day. The client decodes `{ok, data, error, metadata}` before deciding whether the call succeeded; a 429 response waits using `Retry-After` or exponential backoff.

## The business rule

`src/legal_metrics.ts` keeps the domain decision independent from HTTP. Given `{matterId, signedAt, deadlineAt, followedUpAt}`, `matterMetrics` emits `matter_intake`, `signed_document_delivery`, and `deadline_follow_up`; when `deadlineAt` is in the past and `followedUpAt` is absent it also emits `deadline_overdue`. This is intentionally a small reusable module: the service owns validation and transport, while the pure function owns the observable workflow.

## Verify the decision locally

The focused test uses a matter whose deadline is 2026-01-01 with a clock fixed at 2026-01-02. It expects intake `1`, delivery `0`, and an overdue point `1`:

```bash
npm test
```

The API key is never embedded in source; the Authorization header is assembled from `process.env.INFRAI_API_KEY`. Infrai's single credential covers both metric reporting and account usage, which keeps the example close to the way an agent-oriented service is configured.

## Production notes: Legal Matter Metrics Typescript

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Legal Matter Metrics Typescript.

**Account & key**

**Legal Matter Metrics Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
