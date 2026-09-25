import { z } from "zod";
import { account, metrics } from "./infrai_client.js";
import { matterMetrics } from "./legal_metrics.js";

export const matterRequest = z.object({ matterId: z.string().min(1), signedAt: z.string().datetime().optional(), deadlineAt: z.string().datetime().optional(), followedUpAt: z.string().datetime().optional() });

export async function reportMatter(input: unknown) {
  const matter = matterRequest.parse(input);
  const points = matterMetrics(matter);
  for (const point of points) {
    await metrics.report({ ...point, type: "counter" });
  }
  const query = new URLSearchParams({ from: new Date(Date.now() - 86400000).toISOString(), to: new Date().toISOString() });
  const usage = await account.usageTimeseries(query);
  return { matterId: matter.matterId, points, usage };
}

if (process.argv[1]?.endsWith("legal_metrics_service.ts")) {
  const sample = { matterId: "matter-42", signedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() - 3600000).toISOString() };
  reportMatter(sample).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
