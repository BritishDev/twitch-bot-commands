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
