const commands = [
  { name: "!commands", usage: "!commands", aliases: [], category: "General", description: "Opens this public command guide." },
  { name: "!lurk", usage: "!lurk", aliases: [], category: "General", description: "Lets chat know you are stepping away and welcomes you back." },
  { name: "!clip", usage: "!clip <duration> [title]", aliases: ["-clip"], category: "Tools", description: "Creates a Twitch clip using a duration from 5 to 90 seconds." },
  { name: "!vanish", usage: "!vanish", aliases: ["-vanish"], category: "Fun", description: "Briefly vanishes you from chat with a one-second timeout.", availability: "Selected channels" },
  { name: "!fwstats", usage: "!fwstats <IGN>", aliases: ["-fwstats"], category: "Stats", description: "Shows extended Funniewars player statistics." },
  { name: "!straystats", usage: "!straystats <IGN>", aliases: ["-straystats"], category: "Stats", description: "Shows a player's Stray statistics." },
  { name: "!riftstats", usage: "!riftstats <IGN>", aliases: ["-riftstats", "!riftstasts", "-riftstasts"], category: "Stats", description: "Shows a player's Rift statistics." },
  { name: "!mcsrelo", usage: "!mcsrelo <IGN>", aliases: ["!mcsrstats", "!elo", "-mcsrelo", "-elo", "+elo"], category: "Stats", description: "Shows a player's MCSR Ranked Elo, rank, record, and recent form." },
  { name: "!pb", usage: "!pb", aliases: [], category: "Stats", description: "Shows the configured runner's MCSR Ranked personal best.", availability: "Selected channels" },
  { name: "!mctiers", usage: "!mctiers <IGN>", aliases: ["!tiers", "-mctiers", "-tiers"], category: "Tiers", description: "Shows a player's MCTiers rankings across every available mode." },
  { name: "!subtiers", usage: "!subtiers <IGN>", aliases: ["-subtiers"], category: "Tiers", description: "Shows a player's Subtiers rankings across every available mode." },
  { name: "!namehistory", usage: "!namehistory <IGN> [count]", aliases: ["!nh", "-namehistory", "-nh"], category: "Minecraft", description: "Shows previous Minecraft names, with an optional result count." },
  { name: "!nextuhc", usage: "!nextuhc", aliases: ["-nextuhc"], category: "UHC", description: "Shows the next scheduled Stray UHC match.", availability: "Stray-enabled channels" },
  { name: "!scenarios", usage: "!scenarios", aliases: ["!nextuhcscenarios", "-scenarios", "-nextuhcscenarios"], category: "UHC", description: "Shows the scenarios for the next scheduled Stray UHC.", availability: "Stray-enabled channels" },
  { name: "!teamsize", usage: "!teamsize", aliases: ["-teamsize"], category: "UHC", description: "Shows the team size for the next scheduled Stray UHC.", availability: "Stray-enabled channels" },
];

const grid = document.querySelector("#command-grid");
const search = document.querySelector("#search");
const filters = document.querySelector("#filters");
const empty = document.querySelector("#empty-state");
const summary = document.querySelector("#result-summary");
let activeCategory = "All";

document.querySelector("#command-count").textContent = commands.length;

for (const category of ["All", ...new Set(commands.map((command) => command.category))]) {
  const button = document.createElement("button");
  button.className = `filter${category === "All" ? " active" : ""}`;
  button.type = "button";
  button.textContent = category;
  button.addEventListener("click", () => {
    activeCategory = category;
    document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
  filters.append(button);
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
  const visible = commands.filter((command) => {
    const categoryMatches = activeCategory === "All" || command.category === activeCategory;
    const text = [command.name, command.usage, command.description, command.category, command.availability, ...command.aliases].join(" ").toLowerCase();
    return categoryMatches && text.includes(query);
  });
  grid.replaceChildren(...visible.map(commandCard));
  empty.hidden = visible.length !== 0;
  summary.textContent = `${visible.length} ${visible.length === 1 ? "command" : "commands"} shown`;
}

search.addEventListener("input", render);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});
render();
