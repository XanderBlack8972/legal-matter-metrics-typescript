export type Matter = { matterId: string; signedAt?: string; deadlineAt?: string; followedUpAt?: string };
export type MetricPoint = { name: string; value: number; timestamp: string; tags: { matter_id: string } };

export function matterMetrics(matter: Matter, now = new Date()): MetricPoint[] {
  const timestamp = now.toISOString();
  const points: MetricPoint[] = [
    { name: "matter_intake", value: 1, timestamp, tags: { matter_id: matter.matterId } },
    { name: "signed_document_delivery", value: matter.signedAt ? 1 : 0, timestamp, tags: { matter_id: matter.matterId } },
    { name: "deadline_follow_up", value: matter.followedUpAt ? 1 : 0, timestamp, tags: { matter_id: matter.matterId } }
  ];
  if (matter.deadlineAt && !matter.followedUpAt && new Date(matter.deadlineAt) <= now) {
    points.push({ name: "deadline_overdue", value: 1, timestamp, tags: { matter_id: matter.matterId } });
  }
  return points;
}
