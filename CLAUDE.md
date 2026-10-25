# Ajay P — Portfolio

Static single-page **Technical Lead** portfolio that feels like a **developer tool, not a template**.
Recruiters must understand the value in 10 seconds; engineers should find depth and easter eggs.
**Every visual effect must carry real content** (a real metric, a real system Ajay built) — never decoration alone.

## Positioning (applies to every step)
- This is a Technical Lead portfolio, **not a showcase of the employer's product**. Ajay is a Technical Lead
  who builds scalable systems and AI automation; the SaaS platform is proof, not the label.
- **Never show the product name "Desklog" / "Desklog.io"** anywhere visible: hero, status line, boot sequence,
  metrics, section text, terminal output, page title, meta tags. Say "the platform" or
  "a multi-tenant SaaS platform" instead.
- The employer, **Infinite Open Source Solutions LLP**, appears **only in the Experience section**.
- **Keep every real number and achievement** (500+ organizations, 5+ years, ~900 ms → ~300 ms, 60%, the MCP
  server, Claude Code integration, AI bot users, awards). Only the product name goes.
- Check before every commit: `grep -rli desklog dist/` must find nothing (the CV PDF is exempt).

## Stack (fixed — do not change without asking)
- Vite + React + TypeScript (`strict: true`), Tailwind CSS v4 (`@tailwindcss/vite`), Framer Motion.
- No backend, no API keys, no tracking/analytics scripts. Output is a static build in `dist/`.
- Minimal dependencies. **No 3D libraries.** Ask before adding any new dependency.

## Commands
- `npm run dev` — dev server
- `npm run build` — `tsc -b && vite build`; must pass with zero TypeScript errors
- `npm run lint` — oxlint
- `npm run preview` — serve `dist/`

## Non-negotiable rules
1. **Facts come only from `src/data/profile.ts`.** Never invent skills, metrics, companies, testimonials or projects.
   If something seems missing, ask Ajay instead of filling it in.
2. **Never show the phone number anywhere on the site.**
3. Every animation respects `prefers-reduced-motion` — show the final state instead.
4. Mobile-first, responsive down to **360px** wide.
5. Accessible: semantic HTML, full keyboard navigation, visible focus states, good contrast (4.5:1+ for text).
6. Fast: Lighthouse **90+ performance**, **95+ accessibility**.
7. **All content lives in `src/data/profile.ts`.** Components read from it; no hard-coded copy in components.
8. `localStorage` / `sessionStorage` access is always wrapped in try/catch; the site must work without storage.

## Design direction
- Engineering console / developer tool. Precise, calm, high-contrast. **Not** a generic purple AI gradient.
- Dark by default, light theme via toggle (saved in localStorage key `theme`; applied pre-paint by an inline
  script in `index.html`, read back by `src/lib/theme.ts`).
- Tokens are CSS variables in `src/index.css`, mapped to Tailwind colors via `@theme inline`.
  Use the Tailwind names, never raw hex in components:

  | Tailwind     | Dark      | Light     | Role                     |
  |--------------|-----------|-----------|--------------------------|
  | `bg`         | `#0A0B0D` | `#F7F8FA` | page background          |
  | `surface`    | `#121419` | `#FFFFFF` | cards, panels            |
  | `line`       | `#1F232B` | `#DDE1E7` | borders                  |
  | `text`       | `#E6E8EB` | `#0F1115` | body text                |
  | `muted`      | `#8A93A3` | `#586170` | secondary text           |
  | `accent`     | `#7CFFB2` | `#047857` | primary — terminal mint  |
  | `accent-2`   | `#5CC8FF` | `#0369A1` | secondary — data-flow cyan |
  | `on-accent`  | `#0A0B0D` | `#FFFFFF` | text on accent fills     |

  (Light accents are darkened so they pass contrast as text.)
- Fonts: **Inter** (`font-sans`) for text; **JetBrains Mono** (`font-mono`) for technical labels, numbers and
  terminal UI. Loaded from Google Fonts with `display=swap`.

## Layout
- `src/data/profile.ts` — all content + types, including `sections` (id, nav label, heading, placeholder;
  their order is page order and drives the `01 / …` labels), `capabilities`, `codeCard`, `photo`, `architecture`
  (map nodes, details, hop labels, screen-reader flow lists), `terminal` (commands, help text, easter-egg
  lines, chips), `palette` and `meta`. Metrics use `caption` in the strip.
  Derived lines (`heroStatus`, `bootLines`, `codeCardEntries`, `photoChips`) are composed there from the facts,
  never retyped.
- `index.html` gets `<title>` and the meta description from `profile.meta` via the `profile-meta` plugin in
  `vite.config.ts` (`%PROFILE_TITLE%`, `%PROFILE_DESCRIPTION%`). The same plugin injects the desktop hero
  cutout preload (AVIF, `media="(min-width: 1024px)"`), built from `profile.photo.cutout` with `lib/images.ts`.
- `src/components/` — `Nav`, `ThemeToggle`, `Section` (shared section shell, auto-numbered), `NetworkCanvas`,
  `RoleTyper`, `HeroCutout` (hero, 1024 px+ only), `PromptTerminal` + `FlowDiagram` (Prompt → Task),
  `FlowMap` (architecture map: SVG edges/packets + HTML node buttons + animation engine), `CopyButton`,
  `CommandPalette` and `TerminalOverlay` (both code-split, default exports).
- `src/sections/` — one component per section.
- `src/lib/` — `theme.ts`, `storage.ts` (the only place storage is touched), `motion.ts`
  (`usePrefersReducedMotion`), `media.ts` (`useMediaQuery`), `parallax.ts` (`useHeroParallax`), `images.ts` (srcset helpers, photo sizes),
  `archLayout.ts` (map geometry per view and breakpoint), `dates.ts` (role durations, computed at runtime),
  `clipboard.ts` (`useCopy`, with a textarea fallback), `files.ts` (generated `skills.json` and `ajay.ts`),
  `highlight.tsx` (JSON/TS highlighting), `appActions.ts` (context: theme, open terminal/palette, goTo,
  copy email, download CV), `navigate.ts`, `focusTrap.ts`, `lazyModule.ts` (code-split components), `boot.ts` (once-per-session check), `promptTimeline.ts` (the Prompt → Task
  timeline: one clock `t` drives terminal, diagram and controls).
- `public/Ajay_P_CV.pdf` — the Download CV target (`profile.cvPath`).
- `public/images/` — hero photos, used as supplied (don't re-encode): `ajay-cutout-{600,1200}.{avif,webp}`
  (transparent, 600:1028 and 1200:2055) for desktop, `ajay-avatar-{192,384}.{avif,webp}` (1:1) below 1024 px.

## Implementation notes
- Framer Motion is used through `LazyMotion` + `m.*` (strict mode, set in `App.tsx`) to keep the bundle small.
  Use `m.div`, not `motion.div`.
- Hero LCP elements (name, tagline) must never start at opacity 0; they only slide.
- Google Fonts load non-blocking (`media="print"` swap in `index.html`); don't make them render-blocking again.
- The boot overlay covers the page but the page renders underneath from the first frame.
- Zero layout shift: typing carets move with `transform` (see `RoleTyper`), never by reflowing after the text.
  Reserve space for changing text with an invisible copy of the longest value in the same grid cell.
- Large text blocks that aren't the intended LCP (e.g. the code card) render as many small line blocks.
- Typed text: render the full line in transparent ink (reserves height, readable by screen readers) with a
  visible overlay that grows; keep the untyped remainder `invisible` in the overlay so wrapping never changes.
- Hero images: exactly one is mounted per viewport (`useMediaQuery`), never hidden with CSS — a hidden
  `<img>` still downloads. The desktop photo is the LCP element: eager, `fetchpriority="high"`, preloaded,
  and it slides in but never starts at opacity 0.
- Hero ambient animations pause off-screen via `[data-offscreen] [class*='animate-']` (unlayered CSS so the
  `animate-*` utilities' shorthand can't reset the play state). Parallax uses one rAF loop, transforms only.
- Architecture map: node positions are viewBox units in `lib/archLayout.ts`; buttons are HTML laid over the
  SVG in percentages, so both scale together. Both views share one viewBox per breakpoint (no height change on
  toggle). Packets move imperatively in one rAF loop; node highlights only change opacity. Check label fit
  after `document.fonts.ready` (the fallback font is narrower than Inter).
- Overlays (terminal, palette) are code-split with `useLazyComponent` (dynamic import, prefetched after the
  `load` event when idle), not React.lazy: Suspense's reveal throttle added ~300 ms to the first open.
  While one is open the page wrapper is `inert`; focus returns to the opener, or moves to the section on
  navigation. Single-key shortcuts must check `isTypingTarget`.
- The only console output is the DevTools greeting in `main.tsx`.
- Keep numbers and units together with a non-breaking space (`'~300\u00a0ms'`).

## Section plan (built step by step — only build the step currently asked for)
1. **Boot sequence** — 1–1.5 s of terminal boot lines on first visit only (sessionStorage), skippable with any
   key or click, skipped entirely under reduced motion.
2. **Hero** — name, cycling role line, tagline, status line, buttons (Download CV, Contact, Open Terminal),
   canvas network background. 1024 px+: transparent cutout, bottom-aligned at 85% of hero height (max 480 px
   wide), bottom faded with mask-image, soft mint→cyan glow behind it (`--hero-glow`, softer in light), two
   glass chips clear of the face (stats, stack), glow brightens on hover. Depth (none under reduced motion):
   static silhouette drop-shadow (`--cutout-glow`, on the figure wrapper, never on the <img>; kept under reduced
   motion since it doesn't move), breathing glow,
   floating chips, pointer parallax (glow −12 / figure 6 / chips 10 px). No zoom/scan/glitch on the photo.
   Below 1024 px: 88 px avatar above the location.
3. **Metrics strip (built in Step 4)** — 500+ organizations, 5+ years, reporting latency ~900 ms → ~300 ms
   (before/after bars), 60% faster report generation. Counts up once on scroll-in (~1.2 s); final values under
   reduced motion.
3b. **What I do** (built in Step 2.5) — the 6 `capabilities` as cards (3 / 2 / 1 columns), hover lift on desktop.
4. **Prompt → Task (centerpiece, section id `ai`, built in Step 3)** — content in `profile.promptToTask`.
   Terminal (left / top) + 4-node flow diagram (right / below), one ~9 s autoplay when scrolled into view,
   paused off-screen, Replay + step dots, finished state under reduced motion, "Illustrative example" label.
5. **Architecture map (built in Step 4)** — "How a request flows": Request flow / Deploy flow toggle, ambient
   packets (~1 request / 2 s, varied data node), "Trace a request" with hop labels, deploy stages with checks,
   details panel (hover / focus previews, click pins). Generic only — no confidential internals.
6. **Experience timeline (built in Step 5)** — company header, roles newest first with runtime durations
   (inclusive months, e.g. "7 mos"), "Promoted to Technical Lead" marker, bullets + `tags` per role.
7. **Skills (built in Step 5)** — group cards (3 / 2 / 1 columns) with a Grid / JSON toggle; skills.json is
   generated from `profile.skills`. Both views share one grid cell (the grid sets the height), the hidden one
   is `inert`. No proficiency bars, percentages or ratings — ever.
8. **Awards and education (built in Step 5)** — `awards` are `{ title, year?, note?, highlight? }`; a missing
   year is left out, never guessed.
9. **Contact (built in Step 5)** — "Get in touch": `$ ajay --contact` block (email with copy + mailto,
   LinkedIn/GitHub in new tabs with rel="noopener noreferrer", location), Email me / Download CV. No form.
   Footer: "© {year} Ajay P" only.
10. **Global (built in Step 6)** — Ctrl/Cmd+K palette (Navigate / Actions / Links, fuzzy filter, combobox
    + listbox) with a ⌘K / Ctrl K chip in the nav; terminal overlay (` key, hero button, palette): help,
    whoami, about, experience, skills [--json], capabilities (alias projects), awards, contact, cv, ls,
    cat ajay.ts | skills.json, open/cd <section>, theme [dark|light], history, clear (Ctrl+L), exit. Tab
    completion, in-memory history, tappable chips. **Exactly two easter eggs:** `sudo hire-ajay` (pre-filled
    mailto) and `rm -rf /`. Don't add more.

## Progress
- [x] Step 1 — scaffold, CLAUDE.md, profile data, tokens/fonts/theme toggle, page skeleton with section stubs.
- [x] Step 2 — data updates (skills, projects, openToWork), boot sequence, hero, network canvas.
- [x] Step 2.5 — repositioned as a Technical Lead portfolio (no product name), capabilities + "What I do",
  hero code card, meta from profile.ts, zero-CLS caret. CV PDF still missing: the copy in Downloads has the
  phone number, so it was not copied.
- [x] Step 3 — CV added (`Ajay_P_CV_Web.pdf`, checked: no phone, no product name), broader positioning copy,
  Prompt → Task centerpiece.
- [x] Step 3.5 — hero photo card (desktop) + avatar (mobile), Cloud & DevOps content.
- [x] Step 3.6 — hero photo card replaced by a cutout composition; old portrait files removed.
- [x] Step 3.7 — cleaner cutout (v2), stack chip + new status line, hero depth (silhouette glow, breathing
  glow, floating chips, pointer parallax).
- [x] Step 4 — metrics strip, request-flow architecture map; silhouette glow kept under reduced motion.
- [x] Step 5 — experience, skills, awards, contact, footer; architecture details panel moved below the map.
- [x] Step 6 — terminal mode, command palette, DevTools greeting; footer trimmed, skills merged into
  "Architecture & Security", mobile map re-routed as a trunk with branches, map/panel trimmed.
