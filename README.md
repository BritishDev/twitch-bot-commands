# Twitch Bot Commands

Public viewer and moderator command guide for Twitch Bot.

Hosted with GitHub Pages at <https://britishdev.github.io/twitch-bot-commands/>.

The page loads `https://moderation.sweatgod.cc/commands.json` and refreshes every
minute while visible. The bot generates this feed from its own command catalog,
saved command/recap names, aliases, and current channel availability. There is no
separate command list in `app.js` to maintain. Add new built-in command metadata
in the bot repository; its catalog coverage test rejects undocumented handlers.

If the live feed is unavailable, the page uses the most recent successful data
from this visit or the bundled `commands.json`, and labels it as a saved copy.
The `Refresh command guide` workflow checks hourly and can also run manually.
It commits a new saved copy only when the command data changes and requests a
GitHub Pages build. Failed refreshes preserve the previous copy.

Local validation: `node --test test/guide-data.test.cjs`.
Manual refresh: `node scripts/refresh-commands.cjs`.

The redesigned guide uses compact expandable rows, category navigation, access
and channel filters, and a persistent light/dark theme. `/` focuses search.
Copy buttons copy full syntax; if clipboard access is denied the syntax is
selected for keyboard copying. Live refreshes preserve filters and open rows.

Design references, tokens, component states and review guidance are in
[`DESIGN.md`](DESIGN.md). A local [`component showcase`](design/showcase.html)
covers expanded rows, long syntax, copy success, saved data and empty states.
Serve locally with `python -m http.server 8769 --bind 127.0.0.1`.
The live endpoint permits the GitHub Pages origin; a local preview will use the
saved fallback unless the browser's test harness supplies the live response.
