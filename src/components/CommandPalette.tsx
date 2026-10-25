import { m } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { profile } from '../data/profile'
import { useAppActions } from '../lib/appActions'
import { usePrefersReducedMotion } from '../lib/motion'

const P = profile.palette

type Group = keyof typeof P.groups

interface Item {
  id: string
  group: Group
  label: string
  hint?: string
  run: () => void
}

const GROUPS: Group[] = ['navigate', 'actions', 'links']

/** Subsequence match: -1 if `query` isn't in `text` in order; higher is better (runs, word starts). */
function fuzzy(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  let score = 0
  let from = 0
  let prev = -2
  for (const ch of q) {
    if (ch === ' ') continue
    const i = t.indexOf(ch, from)
    if (i < 0) return -1
    score += i === prev + 1 ? 3 : 1
    if (i === 0 || t[i - 1] === ' ') score += 2
    prev = i
    from = i + 1
  }
  return score
}

interface Props {
  onClose: () => void
}

/** Ctrl/Cmd+K palette: a combobox (input + aria-activedescendant) controlling a grouped listbox. */
export default function CommandPalette({ onClose }: Props) {
  const actions = useAppActions()
  const reducedMotion = usePrefersReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const items = useMemo<Item[]>(
    () => [
      ...profile.sections.map((s) => ({
        id: `nav-${s.id}`,
        group: 'navigate' as const,
        label: s.navLabel,
        hint: `#${s.id}`,
        run: () => actions.goTo(s.id),
      })),
      { id: 'act-cv', group: 'actions', label: P.actions.downloadCv, run: actions.downloadCv },
      { id: 'act-email', group: 'actions', label: P.actions.copyEmail, hint: profile.email, run: actions.copyEmail },
      { id: 'act-terminal', group: 'actions', label: P.actions.openTerminal, hint: '`', run: actions.openTerminal },
      { id: 'act-theme', group: 'actions', label: P.actions.toggleTheme, hint: actions.theme, run: actions.toggleTheme },
      ...(['linkedin', 'github'] as const).map((key) => ({
        id: `link-${key}`,
        group: 'links' as const,
        label: profile.links[key].label,
        hint: profile.links[key].href.replace(/^https?:\/\//, ''),
        run: () => window.open(profile.links[key].href, '_blank', 'noopener,noreferrer'),
      })),
    ],
    [actions],
  )

  // Filter (and, with a query, rank) within each group; keep the group order.
  const groups = useMemo(
    () =>
      GROUPS.map((g) => {
        const scored = items
          .filter((i) => i.group === g)
          .map((i) => ({ item: i, score: query ? fuzzy(query, `${i.label} ${i.hint ?? ''}`) : 0 }))
          .filter((x) => x.score >= 0)
        if (query) scored.sort((a, b) => b.score - a.score)
        return { group: g, items: scored.map((x) => x.item) }
      }).filter((g) => g.items.length),
    [items, query],
  )
  const flat = groups.flatMap((g) => g.items)
  const current = flat[Math.min(active, flat.length - 1)]

  useEffect(() => inputRef.current?.focus(), [])

  // Keep the active option visible while arrowing through a long list.
  useEffect(() => {
    if (current) document.getElementById(`palette-${current.id}`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const run = (item: Item | undefined) => {
    if (!item) return
    onClose()
    item.run()
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    const n = flat.length
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (n) setActive((a) => (Math.min(a, n - 1) + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      setActive(e.key === 'Home' ? 0 : Math.max(0, n - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(current)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      // The input is the only focusable element: focus stays in the palette.
      e.preventDefault()
    }
  }

  return createPortal(
    <m.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
      className="fixed inset-0 z-50 flex justify-center bg-bg/60 px-4 pt-[12vh] backdrop-blur-sm"
      // A click outside the panel closes it.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={P.label}
        className="flex h-fit max-h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-2xl shadow-black/40"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden="true" className="font-mono text-sm text-accent">
            &gt;
          </span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-autocomplete="list"
            aria-activedescendant={current ? `palette-${current.id}` : undefined}
            aria-label={P.label}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKey}
            placeholder={P.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="h-12 min-w-0 flex-1 bg-transparent text-base text-text outline-none placeholder:text-muted sm:text-sm"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
        </div>

        <div ref={listRef} id="palette-list" role="listbox" aria-label={P.label} className="overflow-y-auto p-2">
          {groups.map(({ group, items: groupItems }) => (
            <div key={group} role="group" aria-labelledby={`palette-group-${group}`} className="mb-2 last:mb-0">
              <div id={`palette-group-${group}`} role="presentation" className="px-2 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted">
                {P.groups[group]}
              </div>
              {groupItems.map((item) => {
                const isActive = item === current
                return (
                  <div
                    key={item.id}
                    id={`palette-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => setActive(flat.indexOf(item))}
                    onClick={() => run(item)}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-md border-l-2 px-2.5 py-2 text-sm ${
                      isActive ? 'border-accent bg-line/60 text-text' : 'border-transparent text-muted'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hint && <span className="truncate font-mono text-[11px] text-muted">{item.hint}</span>}
                  </div>
                )
              })}
            </div>
          ))}
          {!flat.length && <p className="px-2 py-6 text-center text-sm text-muted">{P.empty}</p>}
        </div>
      </div>
    </m.div>,
    document.body,
  )
}
