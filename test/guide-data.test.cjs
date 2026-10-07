const test = require("node:test");
const assert = require("node:assert/strict");
const { fetchGuide, validateGuide } = require("../guide-data");
const valid = { version: 1, generatedAt: "2026-10-07T20:00:00Z", commands: [
  { name: "!example", usage: "!example", category: "Custom", description: "Custom command", audience: "Viewer", availability: "#sweatgod", aliases: ["!alias"] },
] };

test("feed validation keeps only documented public fields and rejects malformed data", () => {
  const data = validateGuide({ ...valid, secret: "secret", commands: [{ ...valid.commands[0], template: "private" }] });
  assert.deepEqual(data, valid);
  assert.throws(() => validateGuide({ ...valid, version: 2 }));
  assert.throws(() => validateGuide({ ...valid, generatedAt: "invalid" }));
  assert.throws(() => validateGuide({ ...valid, commands: [{}] }));
  assert.throws(() => validateGuide({ ...valid, commands: [{ ...valid.commands[0], aliases: [1] }] }));
});

test("bounded feed reader handles success, HTTP errors, and oversized streams", async (t) => {
  const previous = global.fetch;
  t.after(() => { global.fetch = previous; });
  global.fetch = async (_url, options) => {
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    return new Response(JSON.stringify(valid));
  };
  assert.deepEqual(await fetchGuide(), valid);
  global.fetch = async () => new Response("unavailable", { status: 503 });
  await assert.rejects(fetchGuide());
  global.fetch = async () => new Response("x".repeat(1024 * 1024 + 1));
  await assert.rejects(fetchGuide(), /too large/);
});
