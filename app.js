const commands = [
  { name: "!commands", usage: "!commands", aliases: [], category: "General", description: "Opens this public command guide." },
  { name: "!animatium", usage: "!animatium [user]", aliases: [], category: "Links", description: "Links the targeted viewer to the Animatium mod page.", availability: "Sweatgod only" },
  { name: "!binds", usage: "!binds", aliases: [], category: "General", description: "Shows Sweatgod's current keybinds.", availability: "Sweatgod only" },
  { name: "!birthday", usage: "!birthday", aliases: [], category: "Fun", description: "Counts down to Sweatgod's birthday on July 17th, rolling into next year when needed.", availability: "Sweatgod only" },
  { name: "!bob", usage: "!bob", aliases: [], category: "Lore", description: "Explains the story behind Sweatgod's bob750 joke account.", availability: "Sweatgod only" },
  { name: "!coinflip", usage: "!coinflip", aliases: [], category: "Fun", description: "Flips a fair coin and returns Heads or Tails.", availability: "Sweatgod only" },
  { name: "!end", usage: "!end", aliases: ["!eventend"], category: "General", description: "Shows the live countdown until the PVPHQ Event closes at 5 PM EST on July 12th.", availability: "Sweatgod only · Temporary", expiresAt: "2026-07-12T22:00:00Z" },
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
  { name: "!a timeout", usage: "!a timeout <user> <seconds>", aliases: [], category: "Moderation", audience: "Moderator", description: "Times out a Twitch user for the specified number of seconds.", availability: "Authorized mods · Sweatgod" },
  { name: "!a untimeout", usage: "!a untimeout <user>", aliases: [], category: "Moderation", audience: "Moderator", description: "Removes an active timeout or ban from a Twitch user.", availability: "Authorized mods · Sweatgod" },
  { name: "!a ban", usage: "!a ban <user> [reason]", aliases: [], category: "Moderation", audience: "Moderator", description: "Bans a Twitch user with an optional moderation reason.", availability: "Authorized mods · Sweatgod" },
  { name: "!a unban", usage: "!a unban <user>", aliases: [], category: "Moderation", audience: "Moderator", description: "Removes an active ban or timeout from a Twitch user.", availability: "Authorized mods · Sweatgod" },
  { name: "!a sr", usage: "!a sr <song URL>", aliases: [], category: "Queue", audience: "Moderator", description: "Adds a supported YouTube, Spotify, SoundCloud, Twitch, or clip URL to the song queue.", availability: "Authorized mods · Sweatgod" },
  { name: "!a skip", usage: "!a skip", aliases: [], category: "Queue", audience: "Moderator", description: "Skips the current song through the configured queue bot.", availability: "Authorized mods · Sweatgod" },
  { name: "!a pin", usage: "Reply to a message, then type !a pin", aliases: [], category: "Chat", audience: "Moderator", description: "Pins the replied-to message, or the most recent eligible message.", availability: "Authorized mods · Sweatgod" },
  { name: "!a cmd", usage: "!a cmd <message>", aliases: [], category: "Chat", audience: "Moderator", description: "Makes the bot send a plain chat message.", availability: "Authorized mods · Sweatgod" },
  { name: "!editcom", usage: "!editcom <command> <response>", aliases: [], category: "Commands", audience: "Moderator", description: "Updates !animatium, !binds, !bob, or !teamsize. Supports $(touser), $(user), and $(channel).", availability: "Sweatgod mods only" },
];

const grid = document.querySelector("#command-grid");
const moderatorGrid = document.querySelector("#moderator-grid");
const search = document.querySelector("#search");
const filters = document.querySelector("#filters");
const empty = document.querySelector("#empty-state");
const summary = document.querySelector("#result-summary");
let activeCategory = "All";

const activeCommands = () => commands.filter((command) => !command.expiresAt || Date.now() < Date.parse(command.expiresAt));
document.querySelector("#command-count").textContent = activeCommands().length;

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

const nextExpiry = Math.min(...commands.filter((command) => command.expiresAt).map((command) => Date.parse(command.expiresAt)));
if (Number.isFinite(nextExpiry) && nextExpiry > Date.now()) {
  setTimeout(() => {
    document.querySelector("#command-count").textContent = activeCommands().length;
    render();
  }, nextExpiry - Date.now() + 1_000);
}

search.addEventListener("input", render);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});
render();
