"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { fetchGuide, validateGuide } = require("../guide-data");

async function main() {
  const destination = path.join(__dirname, "../commands.json");
  const guide = await fetchGuide();
  let previous;
  try { previous = validateGuide(JSON.parse(fs.readFileSync(destination, "utf8"))); } catch {}
  if (JSON.stringify(previous?.commands) === JSON.stringify(guide.commands)) {
    console.log("Saved command guide already matches the live bot.");
    return;
  }
  fs.writeFileSync(destination, JSON.stringify(guide, null, 2) + "\n");
  console.log(`Saved ${guide.commands.length} live command entries.`);
}
main().catch(() => { console.error("Command refresh failed; the previous saved copy was preserved."); process.exitCode = 1; });
