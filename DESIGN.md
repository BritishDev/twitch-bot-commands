# Command guide design

This is a frequently used reference for Twitch viewers, moderators and configured
administrators. The first task is finding a command; the second is copying its
syntax or checking where and by whom it can be used. The running bot owns the
content. This repository owns presentation and the saved fallback.

## Direction

A compact index: category navigation, one search field, access and channel
filters, and separated command rows. Keep complete descriptions and syntax in
native disclosures. Use an off-white paper-like surface or quiet charcoal theme,
system sans-serif for navigation, and monospace for literal commands. There are
no marketing sections, decorative cards, background effects or entrance motion.

The alternatives considered were a two-column command-card layout and a dense
spreadsheet. Rows give more useful descriptions per screen than cards, while
disclosures keep the full metadata available without a wide scrolling table.

## Reference ledger

Reviewed on 2026-10-07. The user supplied [this tweet](https://x.com/eptwts/status/2092298910190448727),
whose [quoted post](https://x.com/EXM7777/status/2092250905655812121) adds five resources.
All ten are accounted for below. They inform the design; they are not installed
as ten competing component libraries. No third-party component source or paid
assets are copied. The implementation remains dependency-free vanilla HTML/CSS/JS.

| Resource | Evidence reviewed | Application |
| --- | --- | --- |
| [UI Skills](https://www.ui-skills.com/) | Public craft catalog and baseline-ui skill | Clear hierarchy, practical empty states, named controls, 44px targets, reduced motion. |
| [coss ui](https://coss.com/ui/docs/components/accordion) | Accordion and input-group documentation; accordion visually inspected | Separated disclosure rows, aligned input icon, small radii and quiet controls; implemented with native details and inputs. |
| [Design System Checklist](https://www.designsystemchecklist.com/) | Public site's shell and official [Foundations source](https://github.com/ardakaracizmeli/design-system-checklist/blob/master/src/translations/en/designFoundations.js) | Semantic colors, AA text contrast, four-point spacing, system fonts, dark palette, named icons, documented ownership and states. |
| [ReUI](https://reui.io/components/filters) | Public filter catalog and page layout; interactive previews remained loading | Combine search with clearly scoped category, access and channel filters; avoid a framework or premium-grid dependency. |
| [Emil Kowalski](https://emilkowal.ski/ui/you-dont-need-animations) | Complete public article | Immediate keyboard, search, filtering and disclosure actions; no repeated animations during automatic refreshes. |
| [Beautiful UI](https://www.beautifului.dev/) | Public examples including sidebar navigation, task rows, filter table and code-copy controls; visually inspected | Compact sidebar with counts, flat rows, one copy action per command, low visual noise. |
| [beUI](https://beui.dev/) | Public catalog and theme/control examples | Consistent small controls and light/dark theme switch; no React/Motion dependency for a static reference. |
| [Rare UI](https://www.rareui.com/) | Public catalog of expressive animated components | Considered the interaction emphasis, but orbs, gravity letters and animated folders do not help command lookup; keep focused hover and success states instead. |
| [Transitions](https://transitions.dev/) | Public transition catalog, including copy/success/disclosure patterns | Copy icon changes to a check on success. State changes are immediate; no paid transitions or continuous effects. |
| [shadcn/ui](https://ui.shadcn.com/docs/components/base/native-select) | Native-select and item documentation | Native channel/category selectors and a consistent command-row anatomy; retain mobile OS selection and keyboard behavior. |

## Tokens and layout

`styles.css` is the token and component owner. All values are specific to this
site rather than measurements of the reference sites.

| Contract | Values |
| --- | --- |
| Surface | `--bg`, `--surface`, `--hover`, `--selected` in each theme |
| Content | `--text`, `--muted`; body 14px, descriptions and command names 13px, metadata 12px |
| Meaning | `--live` for successful live/copy status; `--focus` for keyboard outlines; text/icon also convey state |
| Lines | `--line` for separators; `--control-line` for input/select/action boundaries |
| Spacing | Predominantly 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px |
| Shape | 4–8px radii; no decorative shadows or elevated command panels |
| Width | 1224px outer maximum including 32px padding; desktop category rail 184px; 64px gutter |
| Responsive | Rail narrows at 1000px; below 760px it becomes a native category select and rows stack name/description |
| Layering | Normal document flow; sticky desktop rail; only the keyboard skip link has z-index 20 |
| Motion | No timed layout or interaction animation; reduced-motion override also protects future additions |

## Component states and behavior

- Search: labelled, immediate, `/` shortcut outside editable controls, clear
  button when populated. Focus stays in the field during live updates.
- Categories: text, total counts and pressed state; native selector on phones.
  Counts describe the whole guide, independently of other filters.
- Access: native radio group (All / Viewer / Moderator), arrow-key support and
  focus ring. Configured-administrator restrictions remain explicit in details.
- Channel: native select populated from exact public channel names.
- Rows: collapsed, hover, keyboard focus and expanded; Enter/Space use native
  disclosure behavior. Full description, wrapping syntax, aliases, category,
  access and channels remain available when expanded.
- Copy: separate 44px button outside the disclosure summary; check and screen
  reader confirmation after success. On clipboard denial, open and select the
  syntax and explain keyboard copying. One bounded reset timer per row.
- Feed: static pending placeholders; live indicator and checked-time tooltip;
  dated saved-copy notice with retry; explicit unavailable notice if both feeds
  fail. Preserve the latest data through outages and retry every visible minute.
- Empty: show only after successful loading with zero matches; reset clears all
  four filters and focuses search. A loading failure uses the retry notice.
- Theme: OS preference initially, explicit choice stored when possible; storage
  denial does not prevent switching. Early script prevents a theme flash.

Unchanged DOM rows are reused during feed refreshes. Changed rows retain open
state and focus; deleted focused rows return focus to search. Missing categories
and channels reset to All. Removed rows release their copy timers. Feed values
are inserted as text, never interpreted as markup.

## Maintenance and review

`index.html` owns page structure, `app.js` owns view state and reconciliation,
`theme.js` owns initial theme selection, and `guide-data.js` owns the bounded
public-feed contract. `commands.json` and the hourly workflow remain the fallback
path. Command metadata belongs in the bot repository, not in this UI.

Open `design/showcase.html` locally to review component states and long content
without the live feed. Review actual site behavior at desktop, 760px, 390px and
320px; both themes; 200% zoom; keyboard; reduced motion; clipboard success and
denial; live additions, changes and removals; initial and mid-visit feed failures.
Use the existing feed validation tests as well as real browser checks. A visual
change must preserve this lookup/copy/update contract.
