import assert from "node:assert/strict";
import { matterMetrics } from "../src/legal_metrics.js";

const now = new Date("2026-01-02T00:00:00.000Z");
const points = matterMetrics({ matterId: "m-1", deadlineAt: "2026-01-01T00:00:00.000Z" }, now);
assert.equal(points.find((point) => point.name === "matter_intake")?.value, 1);
assert.equal(points.find((point) => point.name === "deadline_overdue")?.value, 1);
assert.equal(points.find((point) => point.name === "signed_document_delivery")?.value, 0);
console.log("legal metric decision test passed");
