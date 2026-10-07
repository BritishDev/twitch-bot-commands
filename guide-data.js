(function (root) {
  "use strict";
  const LIVE_URL = "https://moderation.sweatgod.cc/commands.json";
  const MAX_BYTES = 1024 * 1024;
  function validateGuide(data) {
    if (data?.version !== 1 || !Number.isFinite(Date.parse(data.generatedAt)) ||
        !Array.isArray(data.commands) || data.commands.length > 30_000) throw new Error("Invalid command guide");
    const commands = data.commands.map((item) => {
      const result = {};
      for (const field of ["name", "usage", "category", "description", "audience", "availability"]) {
        if (typeof item?.[field] !== "string" || item[field].length > 8192) throw new Error("Invalid command entry");
        result[field] = item[field];
      }
      if (!Array.isArray(item.aliases) || item.aliases.length > 100 || item.aliases.some((alias) => typeof alias !== "string" || alias.length > 100)) {
        throw new Error("Invalid command aliases");
      }
      result.aliases = [...item.aliases];
      return result;
    });
    return { version: 1, generatedAt: data.generatedAt, commands };
  }
  async function fetchGuide(url = LIVE_URL) {
    const response = await fetch(url, { cache: "no-store", credentials: "omit", redirect: "error", signal: AbortSignal.timeout(10_000) });
    if (!response.ok) { await response.body?.cancel(); throw new Error("Command guide unavailable"); }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error("Command guide too large"); }
        text += decoder.decode(value, { stream: true });
      }
      return validateGuide(JSON.parse(text + decoder.decode()));
    } finally { reader.releaseLock(); }
  }
  const api = { LIVE_URL, validateGuide, fetchGuide };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CommandGuideData = api;
})(globalThis);
