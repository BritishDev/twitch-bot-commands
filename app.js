"use strict";

const $ = (selector) => document.querySelector(selector);
const search = $("#search");
const filters = $("#filters");
const categorySelect = $("#category-select");
const channelSelect = $("#channel-select");
const status = $("#sync-status");
const notice = $("#feed-notice");
const rows = new Map();
const categoryButtons = new Map();
let commands = [];
let currentGuide = null;
let activeCategory = "All";
let activeChannel = "All";
let activeAudience = "All";
let refreshRunning = false;

const iconPaths = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>',
};
function icon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.5");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);
  svg.innerHTML = iconPaths[name]; // Only the fixed, local icon paths above.
  return svg;
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
const commandChannels = (command) => [...new Set(command.availability.match(/#[a-z0-9_]+/gi) || [])];
// Channel scope and metadata can change without changing the command identity.
const commandKey = (command) => JSON.stringify([command.name, command.audience]);

// Reconcile in place: unchanged rows keep focus, disclosure state and copy feedback.
function reconcile(parent, children) {
  const keep = new Set(children);
  for (const node of [...parent.children]) if (!keep.has(node)) node.remove();
  children.forEach((node, index) => {
    if (parent.children[index] !== node) parent.insertBefore(node, parent.children[index] || null);
  });
}
function setOptions(select, values, allLabel) {
  const previous = select.value;
  const names = ["All", ...values];
  if (JSON.stringify([...select.options].map((option) => option.value)) !== JSON.stringify(names)) {
    select.replaceChildren(...names.map((name) => {
      const option = element("option", "", name === "All" ? allLabel : name);
      option.value = name;
      return option;
    }));
  }
  select.value = names.includes(previous) ? previous : "All";
}
function rebuildFilters() {
  const categories = [...new Set(commands.map((command) => command.category))].sort((a, b) => a.localeCompare(b));
  if (!categories.includes(activeCategory)) activeCategory = "All";
  const names = ["All", ...categories];
  for (const name of [...categoryButtons.keys()]) if (!names.includes(name)) {
    if (categoryButtons.get(name) === document.activeElement) search.focus({preventScroll:true});
    categoryButtons.delete(name);
  }
  const buttons = names.map((name) => {
    let button = categoryButtons.get(name);
    if (!button) {
      button = element("button", "category-button");
      button.type = "button";
      button.append(element("span", "", name === "All" ? "All commands" : name), element("span", "category-count"));
      button.addEventListener("click", () => { activeCategory = name; render(); });
      categoryButtons.set(name, button);
    }
    button.lastElementChild.textContent = name === "All" ? commands.length : commands.filter((command) => command.category === name).length;
    return button;
  });
  reconcile(filters, buttons);
  setOptions(categorySelect, categories, "All categories");
  categorySelect.value = activeCategory;
  const channels = [...new Set(commands.flatMap(commandChannels))].sort();
  setOptions(channelSelect, channels, "All channels");
  activeChannel = channelSelect.value;
}

function commandRow(command) {
  const row = element("article", "command-row");
  const details = element("details");
  const summary = element("summary");
  summary.append(element("span", "command-name", command.name), element("span", "command-preview", command.description), icon("chevron", "chevron"));
  const body = element("div", "command-detail");
  const usage = element("code", "syntax", command.usage);
  body.append(element("p", "command-description", command.description), usage);
  const meta = element("dl", "command-meta");
  const adminOnly = /configured administrator only/i.test(command.availability);
  const fields = [["Category", command.category], ["Access", adminOnly ? "Configured administrator only" : command.audience], ["Channels", commandChannels(command).join(" · ") || command.availability || "See description"]];
  if (command.aliases.length) fields.unshift(["Aliases", command.aliases.join(" · ")]);
  for (const [label, value] of fields) {
    const content = element("dd");
    if (label === "Aliases") content.append(element("code", "", value));
    else content.textContent = value;
    meta.append(element("dt", "", label), content);
  }
  body.append(meta);
  details.append(summary, body);
  const copy = element("button", "icon-button copy");
  copy.type = "button";
  const copyLabel = `Copy syntax for ${command.name}`;
  copy.setAttribute("aria-label", copyLabel);
  copy.title = copyLabel;
  copy.append(icon("copy"));
  row.copyTimer = null;
  copy.addEventListener("click", async () => {
    clearTimeout(row.copyTimer);
    try {
      await navigator.clipboard.writeText(command.usage);
      copy.replaceChildren(icon("check"));
      copy.dataset.copied = "true";
      copy.setAttribute("aria-label", `Copied syntax for ${command.name}`);
      $("#copy-status").textContent = `Copied ${command.usage}`;
    } catch {
      details.open = true;
      const range = document.createRange();
      range.selectNodeContents(usage);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      usage.scrollIntoView({block: "nearest"});
      copy.setAttribute("aria-label", `Syntax selected for ${command.name}. Copy with your keyboard.`);
      copy.title = "Syntax selected. Press Ctrl+C or Command+C to copy.";
      $("#copy-status").textContent = "Clipboard access unavailable. Syntax selected; press Ctrl+C or Command+C to copy.";
    }
    row.copyTimer = setTimeout(() => {
      copy.replaceChildren(icon("copy"));
      delete copy.dataset.copied;
      copy.setAttribute("aria-label", copyLabel);
      copy.title = copyLabel;
      row.copyTimer = null;
    }, 1800);
  });
  row.append(details, copy);
  return row;
}
function updateRows() {
  const keys = new Set();
  const viewer = [], moderator = [];
  for (const command of commands) {
    const key = commandKey(command);
    keys.add(key);
    const signature = JSON.stringify(command);
    let record = rows.get(key);
    if (!record || record.signature !== signature) {
      const open = record?.node.querySelector("details").open;
      const focused = record?.node.contains(document.activeElement);
      const focusCopy = record?.node.lastElementChild === document.activeElement;
      if (record) clearTimeout(record.node.copyTimer);
      const node = commandRow(command);
      node.querySelector("details").open = Boolean(open);
      if (record) record.node.replaceWith(node);
      record = {node, signature};
      rows.set(key, record);
      if (focused) node.querySelector(focusCopy ? "button" : "summary").focus({preventScroll:true});
    }
    (command.audience === "Moderator" ? moderator : viewer).push(record.node);
  }
  for (const [key, record] of rows) if (!keys.has(key)) {
    clearTimeout(record.node.copyTimer);
    if (record.node.contains(document.activeElement)) search.focus({preventScroll:true});
    record.node.remove();
    rows.delete(key);
  }
  reconcile($("#command-grid"), viewer);
  reconcile($("#moderator-grid"), moderator);
}
function render() {
  const query = search.value.trim().toLowerCase();
  let viewer = 0, moderator = 0;
  for (const command of commands) {
    const channels = commandChannels(command);
    const text = [command.name, command.usage, command.description, command.category, command.availability, ...command.aliases].join(" ").toLowerCase();
    const visible = (activeCategory === "All" || command.category === activeCategory)
      && (activeAudience === "All" || command.audience === activeAudience)
      && (activeChannel === "All" || channels.includes(activeChannel)) && text.includes(query);
    const row = rows.get(commandKey(command)).node;
    row.hidden = !visible;
    if (visible) command.audience === "Moderator" ? moderator++ : viewer++;
  }
  for (const [name, button] of categoryButtons) button.setAttribute("aria-pressed", String(name === activeCategory));
  categorySelect.value = activeCategory;
  $("#clear-search").hidden = search.value.length === 0;
  $("#viewer-section").hidden = viewer === 0;
  $("#moderator-section").hidden = moderator === 0;
  $("#viewer-count").textContent = viewer;
  $("#moderator-count").textContent = moderator;
  const count = viewer + moderator;
  $("#empty-state").hidden = !currentGuide || count !== 0;
  $("#result-summary").textContent = currentGuide ? `${count} of ${commands.length} commands` : "Loading commands…";
}
function feedState(source, guide) {
  status.dataset.source = source;
  status.textContent = source === "live" ? "Live updates" : source === "saved" ? "Saved copy" : "Unavailable";
  const date = guide ? new Date(guide.generatedAt).toLocaleString("en-GB", {dateStyle:"medium", timeStyle:"short"}) : "";
  status.title = source === "live" ? `Checked ${date}. Refreshes every minute.` : date ? `Saved ${date}. Retrying automatically.` : "Retrying automatically.";
  notice.hidden = source === "live";
  notice.querySelector("span").textContent = source === "saved" ? `Live updates unavailable. Showing a saved copy from ${date}.` : "The command guide is temporarily unavailable. Retrying automatically.";
}
function applyGuide(guide, source) {
  const changed = !currentGuide || JSON.stringify(guide.commands) !== JSON.stringify(commands);
  currentGuide = guide;
  commands = guide.commands;
  $("#command-count").textContent = commands.length;
  $("#loading").hidden = true;
  feedState(source, guide);
  if (changed) { rebuildFilters(); updateRows(); render(); }
}
async function refreshGuide() {
  if (refreshRunning) return;
  refreshRunning = true;
  $("#retry").disabled = true;
  try { applyGuide(await CommandGuideData.fetchGuide(), "live"); }
  catch {
    if (currentGuide) feedState("saved", currentGuide);
    else {
      try { applyGuide(await CommandGuideData.fetchGuide("commands.json"), "saved"); }
      catch {
        $("#loading").hidden = true;
        $("#result-summary").textContent = "Commands couldn't be loaded";
        feedState("unavailable");
      }
    }
  } finally { refreshRunning = false; $("#retry").disabled = false; }
}

function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === "dark";
  const button = $("#theme-toggle");
  button.replaceChildren(icon(dark ? "sun" : "moon"));
  button.setAttribute("aria-label", `Switch to ${dark ? "light" : "dark"} theme`);
  $("meta[name='theme-color']").content = dark ? "#191a19" : "#faf9f6";
}
$("#theme-toggle").addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem("command-guide-theme", theme); } catch { /* Theme still works without storage. */ }
  updateThemeButton();
});
updateThemeButton();
search.addEventListener("input", render);
$("#clear-search").addEventListener("click", () => { search.value = ""; render(); search.focus(); });
categorySelect.addEventListener("change", () => { activeCategory = categorySelect.value; render(); });
channelSelect.addEventListener("change", () => { activeChannel = channelSelect.value; render(); });
for (const radio of document.querySelectorAll("input[name='audience']")) radio.addEventListener("change", () => { activeAudience = radio.value; render(); });
$("#reset-filters").addEventListener("click", () => {
  activeCategory = activeChannel = activeAudience = "All";
  search.value = "";
  channelSelect.value = "All";
  $("input[name='audience'][value='All']").checked = true;
  render(); search.focus();
});
$("#retry").addEventListener("click", refreshGuide);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey
    && !event.target.closest("input, textarea, select, [contenteditable='true']")) {
    event.preventDefault(); search.focus();
  }
});
setInterval(() => { if (!document.hidden) refreshGuide(); }, 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshGuide(); });
window.addEventListener("online", refreshGuide);
refreshGuide();
