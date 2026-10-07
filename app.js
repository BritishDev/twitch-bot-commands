let commands = [];

const grid = document.querySelector("#command-grid");
const moderatorGrid = document.querySelector("#moderator-grid");
const search = document.querySelector("#search");
const filters = document.querySelector("#filters");
const empty = document.querySelector("#empty-state");
const summary = document.querySelector("#result-summary");
let activeCategory = "All";

const status = document.querySelector("#sync-status");
let refreshRunning = false;
let currentGuide = null;
const activeCommands = () => commands;

function rebuildFilters() {
  const categories = ["All", ...new Set(commands.map((command) => command.category))];
  if (!categories.includes(activeCategory)) activeCategory = "All";
  const existing = [...filters.querySelectorAll("button")].map((button) => button.textContent);
  if (JSON.stringify(existing) === JSON.stringify(categories)) return;
  filters.replaceChildren();
  for (const category of categories) {
    const button = document.createElement("button");
    button.className = `filter${category === activeCategory ? " active" : ""}`;
    button.type = "button";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      for (const item of filters.querySelectorAll("button")) {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      }
      render();
    });
    filters.append(button);
  }
}

function applyGuide(guide, source) {
  const changed = JSON.stringify(guide.commands) !== JSON.stringify(commands);
  currentGuide = guide;
  commands = guide.commands;
  document.querySelector("#command-count").textContent = commands.length;
  const date = new Date(guide.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  status.textContent = source === "live"
    ? `Live command guide - refreshes every minute - checked ${date}`
    : `Saved command guide from ${date} - live updates temporarily unavailable`;
  if (changed) { rebuildFilters(); render(); }
}

async function refreshGuide() {
  if (refreshRunning) return;
  refreshRunning = true;
  try {
    applyGuide(await CommandGuideData.fetchGuide(), "live");
  } catch {
    if (currentGuide) {
      applyGuide(currentGuide, "saved");
    } else {
      try { applyGuide(await CommandGuideData.fetchGuide("commands.json"), "saved"); }
      catch { status.textContent = "The command guide is temporarily unavailable. Retrying automatically."; }
    }
  } finally { refreshRunning = false; }
}

function commandCard(command) {
  const article = document.createElement("article");
  article.className = "card";

  const top = document.createElement("div");
  top.className = "card-top";
  const heading = document.createElement("h2");
  heading.className = "command";
  heading.textContent = command.name;
  const category = document.createElement("span");
  category.className = "category";
  category.textContent = command.category;
  top.append(heading, category);

  const description = document.createElement("p");
  description.className = "description";
  description.textContent = command.description;

  const usageRow = document.createElement("div");
  usageRow.className = "usage-row";
  const usage = document.createElement("code");
  usage.className = "usage";
  usage.textContent = command.usage;
  const copy = document.createElement("button");
  copy.className = "copy";
  copy.type = "button";
  copy.textContent = "COPY";
  copy.setAttribute("aria-label", `Copy ${command.usage}`);
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(command.usage);
      copy.textContent = "COPIED";
      setTimeout(() => { copy.textContent = "COPY"; }, 1200);
    } catch { copy.textContent = "SELECT"; }
  });
  usageRow.append(usage, copy);

  const meta = document.createElement("div");
  meta.className = "meta";
  for (const alias of command.aliases) {
    const tag = document.createElement("span");
    tag.textContent = alias;
    meta.append(tag);
  }
  if (command.availability) {
    const tag = document.createElement("span");
    tag.className = "limited";
    tag.textContent = command.availability;
    meta.append(tag);
  }
  article.append(top, description, usageRow, meta);
  return article;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const visible = activeCommands().filter((command) => {
    const categoryMatches = activeCategory === "All" || command.category === activeCategory;
    const text = [command.name, command.usage, command.description, command.category, command.availability, ...command.aliases].join(" ").toLowerCase();
    return categoryMatches && text.includes(query);
  });
  const viewerCommands = visible.filter((command) => command.audience !== "Moderator");
  const moderatorCommands = visible.filter((command) => command.audience === "Moderator");
  grid.replaceChildren(...viewerCommands.map(commandCard));
  moderatorGrid.replaceChildren(...moderatorCommands.map(commandCard));
  document.querySelector("#viewer-section").hidden = viewerCommands.length === 0;
  document.querySelector("#moderator-section").hidden = moderatorCommands.length === 0;
  empty.hidden = visible.length !== 0;
  summary.textContent = `${visible.length} ${visible.length === 1 ? "command" : "commands"} shown`;
}

setInterval(() => { if (!document.hidden) refreshGuide(); }, 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshGuide(); });
window.addEventListener("online", refreshGuide);

search.addEventListener("input", render);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});
render();
refreshGuide();
