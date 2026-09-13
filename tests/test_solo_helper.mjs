import assert from "node:assert/strict";
import { createHash, webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

let listener = null;
globalThis.chrome = {
  runtime: {
    onMessage: {
      addListener(callback) {
        listener = callback;
      },
    },
  },
  tabs: {
    async query() {
      return [{ id: 42, active: true, url: "https://solo2.jzxhnh.com/app/submissions" }];
    },
  },
  scripting: {
    async executeScript({ func, args }) {
      const previousDocument = globalThis.document;
      globalThis.document = { cookie: "solo_qa_csrf=csrf-test" };
      try {
        return [{ result: await func(...args) }];
      } finally {
        globalThis.document = previousDocument;
      }
    },
  },
};

const trace = new Blob(['{"type":"result","result":"done"}\n'], { type: "application/x-ndjson" });
const traceBytes = Buffer.from(await trace.arrayBuffer());
const traceDigest = createHash("sha256").update(traceBytes).digest("hex");
const localStates = [];
const localSyncs = [];
const requests = [];
const submissionBodies = [];
const repairBodies = [];
let createdCount = 0;
let transientRemoteReadFailures = 0;

function shanghaiDayKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const fields = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${fields.year}-${fields.month}-${fields.day}`;
}

const todayKey = shanghaiDayKey();
const yesterdayKey = shanghaiDayKey(
  new Date(new Date(`${todayKey}T12:00:00+08:00`).getTime() - 24 * 60 * 60 * 1000),
);
const todayUtcTimestamp = new Date(`${todayKey}T00:30:00+08:00`).toISOString();

const payloads = {
  "abc123abc123:1": { session: "session-one", turn: "turn-one-1", round: 1, prompt: "完成真实提交链路 one-1", taskType: "Bug修复" },
  "abc123abc123:2": { session: "session-one", turn: "turn-one-2", round: 2, prompt: "完成真实提交链路 one-2", taskType: "Bug修复" },
  "def456def456:1": { session: "session-two", turn: "turn-two-1", round: 1, prompt: "完成真实提交链路 two-1", taskType: "Bug修复" },
  "cafebabecafe:2": { session: "session-missing", turn: "turn-missing-2", round: 2, prompt: "缺少前序轮次", taskType: "Bug修复" },
  "facefeedcafe:1": { session: "session-choice", turn: "turn-choice-1", round: 1, prompt: "触发枚举错误", taskType: "未知类型" },
  "feedfacecafe:1": { session: "session-validation", turn: "turn-validation-1", round: 1, prompt: "触发远端字段错误", taskType: "Bug修复" },
  "feedfacecafe:2": { session: "session-validation", turn: "turn-validation-2", round: 2, prompt: "同会话后续轮次不应越过失败前序", taskType: "Bug修复" },
  "deadbeefcafe:1": {
    session: "session-repair",
    turn: "turn-repair-1",
    round: 1,
    prompt: "使用本地确认内容返修",
    taskType: "Bug修复",
    soloQa: { state: "local_changed", remote_id: "7001", remote_status: "PENDING_FIX" },
  },
  "decafbadcafe:1": {
    session: "session-remote-moved",
    turn: "turn-remote-moved-1",
    round: 1,
    prompt: "远端状态已经变化",
    taskType: "Bug修复",
    soloQa: { state: "needs_fix", remote_id: "7002", remote_status: "PENDING_FIX" },
  },
  "badc0ffee000:1": {
    session: "session-not-repairable",
    turn: "turn-not-repairable-1",
    round: 1,
    prompt: "本地状态不允许返修",
    taskType: "Bug修复",
    soloQa: { state: "not_submitted", remote_id: "7003", remote_status: "PENDING_FIX" },
  },
};

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

globalThis.fetch = async (url, options = {}) => {
  const href = String(url);
  requests.push({
    href,
    method: options.method || "GET",
    credentials: options.credentials || "",
    headers: Object.fromEntries(new Headers(options.headers || {}).entries()),
  });
  const payloadMatch = href.match(/\/api\/solo-qa\/turns\/([a-f0-9]{12})\/([1-9]\d*)\/payload$/);
  if (payloadMatch) {
    const runId = payloadMatch[1];
    const round = Number(payloadMatch[2]);
    const config = payloads[`${runId}:${round}`];
    if (!config) throw new Error(`unexpected local payload: ${runId}:${round}`);
    return jsonResponse({
      key: `${runId}:${round}`,
      ready: config.ready ?? true,
      issues: config.issues || [],
      values: {
        "任务类型": config.taskType,
        "User Prompt": config.prompt,
        "SessionID": config.session,
        "TurnID/PromptID": config.turn,
        "当前对话轮次排序": config.round,
      },
      payload_sha256: "a".repeat(64),
      trajectory: {
        name: "trace.jsonl",
        size: trace.size,
        sha256: traceDigest,
        url: `http://127.0.0.1:8765/api/solo-qa/turns/${runId}/${round}/trajectory`,
      },
      solo_qa: config.soloQa || { state: "not_submitted", remote_id: "", remote_status: "" },
    });
  }
  if (/\/api\/solo-qa\/turns\/[a-f0-9]{12}\/[1-9]\d*\/trajectory$/.test(href)) {
    return new Response(trace, { status: 200 });
  }
  if (href.endsWith("/api/solo-qa/state")) {
    localStates.push(JSON.parse(options.body));
    return jsonResponse({ state: localStates.at(-1).state });
  }
  if (href.endsWith("/api/solo-qa/sync")) {
    localSyncs.push(JSON.parse(options.body));
    return jsonResponse({ matched: localSyncs.at(-1).items.length, unmatched: 0 });
  }
  if (href.includes("/api/v1/submissions?page=1&page_size=20&keyword=")) {
    return jsonResponse({ items: [], meta: { total: 0 } });
  }
  if (href.endsWith("/api/v1/submissions?page=1&page_size=20")) {
    return jsonResponse({
      items: [
        { id: 901, created_at: todayUtcTimestamp },
        ...Array.from({ length: 19 }, (_, index) => ({
          id: 800 - index,
          submitted_at: `${yesterdayKey}T23:59:00+08:00`,
        })),
      ],
    });
  }
  if (href.endsWith("/api/v1/submissions?page=2&page_size=20")) {
    return jsonResponse({
      items: [
        { id: 902, submitted_at: `${todayKey}T11:15:00` },
        ...Array.from({ length: 19 }, (_, index) => ({
          id: 780 - index,
          submitted_at: `${yesterdayKey}T20:00:00+08:00`,
        })),
      ],
    });
  }
  if (href.endsWith("/api/v1/submissions?page=3&page_size=20")) {
    return jsonResponse({
      items: Array.from({ length: 20 }, (_, index) => ({
        id: 760 - index,
        submitted_at: `${yesterdayKey}T18:00:00+08:00`,
      })),
    });
  }
  const historyMatch = href.match(/\/api\/v1\/submissions\/(901|902)$/);
  if (historyMatch) {
    const remoteId = Number(historyMatch[1]);
    return jsonResponse({
      id: remoteId,
      status: "QC_PASSED",
      submitted_at: remoteId === 901 ? todayUtcTimestamp : `${todayKey}T11:15:00`,
      session_id: "session-history",
      turn_id: `turn-history-${remoteId}`,
      round_no: 2,
    });
  }
  if (href.endsWith("/api/v1/submissions/form-schema")) {
    return jsonResponse({
      fingerprint: "schema-test",
      attachment_max_mb: 20,
      fields: [
        { field_key: "task_type", label: "任务类型", field_type: "select", is_required: true, options: ["Bug修复"] },
        { field_key: "user_prompt", label: "User Prompt", field_type: "textarea", is_required: true },
        { field_key: "session_id", label: "SessionID", field_type: "text", is_required: true },
        { field_key: "turn_id", label: "TurnID/PromptID", field_type: "text", is_required: true },
        { field_key: "round_no", label: "当前对话轮次排序", field_type: "number", is_required: true },
        { field_key: "trace_file", label: "轨迹文件", field_type: "attachment", is_required: true },
      ],
    });
  }
  if (href.endsWith("/api/v1/submissions/upload")) {
    assert.equal(options.method, "POST");
    assert.ok(options.body instanceof FormData);
    return jsonResponse({ name: "trace.jsonl", path: "uploads/trace.jsonl", size: trace.size });
  }
  const repairMatch = href.match(/\/api\/v1\/submissions\/(7001|7002)$/);
  if (repairMatch && (options.method || "GET") === "GET") {
    const remoteId = repairMatch[1];
    if (remoteId === "7001" && transientRemoteReadFailures > 0) {
      transientRemoteReadFailures -= 1;
      return jsonResponse({ detail: "502 Bad Gateway" }, 502);
    }
    const config = remoteId === "7001" ? payloads["deadbeefcafe:1"] : payloads["decafbadcafe:1"];
    return jsonResponse({
      id: Number(remoteId),
      status: remoteId === "7001" ? "PENDING_FIX" : "QC_PASSED",
      session_id: config.session,
      turn_id: config.turn,
      round_no: config.round,
      current_version: 1,
    });
  }
  if (repairMatch && options.method === "PUT") {
    assert.equal(repairMatch[1], "7001");
    const body = JSON.parse(options.body);
    repairBodies.push(body);
    return jsonResponse({ id: 7001, status: "SUBMITTED", current_version: 2 });
  }
  if (href.endsWith("/api/v1/submissions") && options.method === "POST") {
    const body = JSON.parse(options.body);
    submissionBodies.push(body);
    assert.equal(body.schema_fingerprint, "schema-test");
    assert.equal(body.data.trace_file[0].path, "uploads/trace.jsonl");
    if (body.data.user_prompt === "触发远端字段错误") {
      return jsonResponse({
        detail: "提交数据校验未通过",
        errors: [{ field: "difficulty", message: "当前轮次难度与会话不一致" }],
      }, 422);
    }
    assert.match(body.data.user_prompt, /^完成真实提交链路 (one|two)-[12]$/);
    createdCount += 1;
    return jsonResponse({ id: 122 + createdCount, status: "SUBMITTED", message: "提交成功" });
  }
  throw new Error(`unexpected request: ${href}`);
};

await import("../chrome-solo-qa-helper/background.js");
assert.equal(typeof listener, "function");

const syncResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_SYNC", payload: {} },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(syncResponse.ok, true);
assert.equal(syncResponse.data.matched, 2);
assert.equal(syncResponse.data.remote_total, 2);
assert.equal(syncResponse.data.account_total, null);
assert.equal(syncResponse.data.scope_date, todayKey);
assert.equal(syncResponse.data.partial, false);
assert.equal(localSyncs.length, 1);
assert.equal(localSyncs[0].complete, false);
assert.equal(localSyncs[0].items.length, 2);
assert.equal("remote_ids" in localSyncs[0], false);
assert.equal(
  requests.some((item) => item.href.endsWith("/api/v1/submissions/800")),
  false,
);
assert.equal(
  requests.some((item) => item.href.includes("/api/v1/submissions?page=2")),
  true,
);
assert.equal(
  requests.some((item) => item.href.includes("/api/v1/submissions?page=3")),
  true,
);
assert.equal(
  requests.some((item) => item.href.includes("/api/v1/submissions?page=4")),
  false,
);

const response = await new Promise((resolve) => {
  const asynchronous = listener(
    {
      type: "SOLO_QA_SUBMIT",
      payload: { turn_keys: ["abc123abc123:2", "def456def456:1", "abc123abc123:1"] },
    },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
  assert.equal(asynchronous, true);
});

assert.equal(response.ok, true);
assert.deepEqual(
  response.data.results.map((item) => item.turn_key),
  ["abc123abc123:1", "abc123abc123:2", "def456def456:1"],
);
assert.equal(response.data.results[0].outcome, "submitted");
assert.equal(response.data.results[0].remote_id, "123");
assert.equal(response.data.results[1].outcome, "submitted");
assert.equal(response.data.results[1].remote_id, "124");
assert.equal(response.data.results[2].outcome, "submitted");
assert.equal(response.data.results[2].remote_id, "125");
assert.deepEqual(
  localStates.map((item) => item.state),
  ["submitting", "qc_pending", "submitting", "qc_pending", "submitting", "qc_pending"],
);
assert.equal(requests.filter((item) => item.href.endsWith("/submissions/form-schema")).length, 1);
assert.equal(requests.filter((item) => item.href.endsWith("/submissions/upload")).length, 3);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions") && item.method === "POST").length,
  3,
);
assert.equal(requests.filter((item) => /\/submissions\/(123|124|125)$/.test(item.href)).length, 0);
const remoteWrites = requests.filter((item) => item.href.startsWith("/api/v1/") && item.method === "POST");
assert.ok(remoteWrites.length >= 2);
assert.ok(remoteWrites.every((item) => item.credentials === "include"));
assert.ok(remoteWrites.every((item) => item.headers["x-csrf-token"] === "csrf-test"));

const uploadCountBeforeMissingRound = requests.filter((item) => item.href.endsWith("/submissions/upload")).length;
const missingRoundResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_SUBMIT", payload: { turn_keys: ["cafebabecafe:2"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(missingRoundResponse.ok, true);
assert.equal(missingRoundResponse.data.results[0].outcome, "failed");
assert.match(missingRoundResponse.data.results[0].error, /第 2 轮提交前缺少.*第 1 轮/);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions/upload")).length,
  uploadCountBeforeMissingRound,
);
assert.equal(localStates.at(-1).state, "failed");

const uploadCountBeforeInvalidChoice = requests.filter((item) => item.href.endsWith("/submissions/upload")).length;
const invalidChoiceResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_SUBMIT", payload: { turn_keys: ["facefeedcafe:1"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(invalidChoiceResponse.ok, true);
assert.equal(invalidChoiceResponse.data.results[0].outcome, "failed");
assert.match(invalidChoiceResponse.data.results[0].error, /任务类型的值“未知类型”不被 SOLO-QA 接受/);
assert.match(invalidChoiceResponse.data.results[0].error, /当前可选：Bug修复/);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions/upload")).length,
  uploadCountBeforeInvalidChoice,
);

const validationResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_SUBMIT", payload: { turn_keys: ["feedfacecafe:1"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(validationResponse.ok, true);
assert.equal(validationResponse.data.results[0].outcome, "failed");
const validationError = validationResponse.data.results[0].error;
assert.match(validationError, /^任务难度：当前轮次难度与会话不一致/);
assert.match(validationError, /提交数据校验未通过$/);
assert.equal(submissionBodies.at(-1).data.user_prompt, "触发远端字段错误");

const continuedBatchResponse = await new Promise((resolve) => {
  listener(
    {
      type: "SOLO_QA_SUBMIT",
      payload: {
        turn_keys: ["feedfacecafe:1", "feedfacecafe:2", "def456def456:1"],
      },
    },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(continuedBatchResponse.ok, true);
assert.equal(continuedBatchResponse.data.stopped, false);
assert.equal(continuedBatchResponse.data.failed, 1);
assert.deepEqual(
  continuedBatchResponse.data.results.map((item) => item.outcome),
  ["failed", "skipped", "submitted"],
);
assert.match(
  continuedBatchResponse.data.results[1].reason,
  /同一会话的前序轮次提交失败/,
);

const uploadCountBeforeRepair = requests.filter((item) => item.href.endsWith("/submissions/upload")).length;
const createCountBeforeRepair = requests.filter(
  (item) => item.href.endsWith("/submissions") && item.method === "POST",
).length;
const repairReadCountBefore = requests.filter(
  (item) => item.href.endsWith("/submissions/7001") && item.method === "GET",
).length;
transientRemoteReadFailures = 1;
const repairResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_REPAIR", payload: { turn_keys: ["deadbeefcafe:1", "deadbeefcafe:1"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(repairResponse.ok, true);
assert.equal(repairResponse.data.stopped, false);
assert.equal(repairResponse.data.results.length, 1);
assert.equal(repairResponse.data.results[0].outcome, "repaired");
assert.equal(repairResponse.data.results[0].remote_id, "7001");
assert.equal(
  requests.filter(
    (item) => item.href.endsWith("/submissions/7001") && item.method === "GET",
  ).length,
  repairReadCountBefore + 2,
);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions/upload")).length,
  uploadCountBeforeRepair + 1,
);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions") && item.method === "POST").length,
  createCountBeforeRepair,
);
assert.equal(repairBodies.length, 1);
assert.equal(repairBodies[0].schema_fingerprint, "schema-test");
assert.equal(repairBodies[0].comment, "");
assert.equal(repairBodies[0].data.user_prompt, "使用本地确认内容返修");
assert.equal(repairBodies[0].data.trace_file[0].path, "uploads/trace.jsonl");
assert.equal(localStates.at(-1).turn_key, "deadbeefcafe:1");
assert.equal(localStates.at(-1).state, "qc_pending");
assert.equal(localStates.at(-1).remote_id, "7001");
assert.equal(localStates.at(-1).remote_status, "SUBMITTED");
assert.equal(localStates.at(-1).payload_sha256, "a".repeat(64));
const repairWrite = requests.find(
  (item) => item.href.endsWith("/submissions/7001") && item.method === "PUT",
);
assert.ok(repairWrite);
assert.equal(repairWrite.credentials, "include");
assert.equal(repairWrite.headers["x-csrf-token"], "csrf-test");

const uploadCountBeforeRemoteMoved = requests.filter((item) => item.href.endsWith("/submissions/upload")).length;
const remoteMovedResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_REPAIR", payload: { turn_keys: ["decafbadcafe:1"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(remoteMovedResponse.ok, true);
assert.equal(remoteMovedResponse.data.stopped, false);
assert.equal(remoteMovedResponse.data.failed, 1);
assert.match(remoteMovedResponse.data.results[0].error, /远端提交已不是待返修状态/);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions/upload")).length,
  uploadCountBeforeRemoteMoved,
);

const remoteReadsBeforeInvalidState = requests.filter(
  (item) => item.href.endsWith("/submissions/7003") && item.method === "GET",
).length;
const invalidRepairStateResponse = await new Promise((resolve) => {
  listener(
    { type: "SOLO_QA_REPAIR", payload: { turn_keys: ["badc0ffee000:1"] } },
    { url: "http://127.0.0.1:8765/#exports" },
    resolve,
  );
});
assert.equal(invalidRepairStateResponse.ok, true);
assert.equal(invalidRepairStateResponse.data.stopped, false);
assert.equal(invalidRepairStateResponse.data.failed, 1);
assert.match(invalidRepairStateResponse.data.results[0].error, /只有需要返修或本地数据已变化/);
assert.equal(
  requests.filter((item) => item.href.endsWith("/submissions/7003") && item.method === "GET").length,
  remoteReadsBeforeInvalidState,
);
