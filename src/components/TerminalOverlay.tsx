import { m } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { profile, type SectionId } from '../data/profile'
import { useAppActions } from '../lib/appActions'
import { duration } from '../lib/dates'
import { ajayTs, skillsJson } from '../lib/files'
import { trapTab } from '../lib/focusTrap'
import { HighlightedCode } from '../lib/highlight'
import { usePrefersReducedMotion } from '../lib/motion'
import { openMailto } from '../lib/navigate'

// Full-screen terminal mode. Every command's output is generated from profile.ts.

const T = profile.terminal
const FILES = ['ajay.ts', 'skills.json', 'cv.pdf']
const SECTION_IDS = profile.sections.map((s) => s.id)
const COMMAND_NAMES = T.commands.flatMap((c) => [c.name, ...(c.aliases ?? [])])
const ARG_COMPLETIONS: Record<string, string[]> = {
  open: SECTION_IDS,
  cd: SECTION_IDS,
  cat: FILES,
  theme: ['dark', 'light'],
  skills: ['--json'],
}
const SUDO_DELAY = 700
const MAILTO_DELAY = 500

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '')

const commonPrefix = (words: string[]) =>
  words.reduce((prefix, w) => {
    let i = 0
    while (i < prefix.length && prefix[i] === w[i]) i++
    return prefix.slice(0, i)
  })

/** Section by id or nav label ("impact", "what-i-do", "AI"…). */
const findSection = (arg: string): SectionId | undefined =>
  profile.sections.find((s) => s.id === arg.toLowerCase() || s.navLabel.toLowerCase() === arg.toLowerCase())?.id

const Muted = ({ children }: { children: ReactNode }) => <span className="text-muted">{children}</span>
const Key = ({ children }: { children: ReactNode }) => <span className="text-accent-2">{children}</span>
const ExtLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline-offset-4 hover:underline">
    {children}
  </a>
)

interface Entry {
  id: number
  /** An echoed command line… */
  input?: string
  /** …or its output. */
  out?: ReactNode
}

interface Props {
  onClose: () => void
}

export default function TerminalOverlay({ onClose }: Props) {
  const { theme, setTheme, toggleTheme, goTo, downloadCv } = useAppActions()
  const reducedMotion = usePrefersReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextId = useRef(1)
  const history = useRef<string[]>([])
  const historyIndex = useRef(0)
  const timers = useRef<number[]>([])
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, out: T.welcome }])
  const [value, setValue] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  // Keep the newest output in view.
  useLayoutEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [entries])

  const print = (out: ReactNode) => setEntries((e) => [...e, { id: nextId.current++, out }])
  const later = (ms: number, fn: () => void) => {
    if (reducedMotion) fn()
    else timers.current.push(window.setTimeout(fn, ms))
  }

  function execute(raw: string) {
    const line = raw.trim()
    setEntries((e) => [...e, { id: nextId.current++, input: raw }])
    if (!line) return
    history.current.push(line)
    historyIndex.current = history.current.length

    const [cmd, ...rest] = line.split(/\s+/)
    const arg = rest.join(' ')
    const notFound = (what = cmd) => print(fill(T.notFound, { cmd: what }))

    switch (cmd) {
      case 'help':
        return print(
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
            {T.commands.map((c) => (
              <div key={c.name} className="contents">
                <span className="whitespace-nowrap">
                  <Key>{c.name}</Key>
                  {c.usage && <Muted> {c.usage}</Muted>}
                </span>
                <Muted>
                  {c.description}
                  {c.aliases && ` (alias: ${c.aliases.join(', ')})`}
                </Muted>
              </div>
            ))}
          </div>,
        )
      case 'whoami':
        return print(
          <>
            <p>{profile.name}</p>
            <p>{profile.title}</p>
            <Muted>{profile.location}</Muted>
          </>,
        )
      case 'about':
        return print(<p className="max-w-[72ch]">{profile.summary}</p>)
      case 'experience':
        return print(
          <>
            {profile.experience.map((company) => (
              <div key={company.name}>
                <p>
                  {company.name} <Muted>· {company.location}</Muted>
                </p>
                {company.roles.map((role) => (
                  <div key={role.title} className="mt-2 border-l border-line pl-3">
                    <p>
                      <Key>{role.title}</Key>
                    </p>
                    <Muted>
                      {role.start} – {role.end} · {duration(role.start, role.end)}
                    </Muted>
                    <p className="text-muted">[{role.tags.join(', ')}]</p>
                  </div>
                ))}
              </div>
            ))}
          </>,
        )
      case 'skills':
        if (arg === '--json') return print(<HighlightedCode code={skillsJson} />)
        return print(
          <>
            {profile.skills.map((g) => (
              <p key={g.group}>
                <Key>{g.group}</Key>
                <Muted>: </Muted>
                {g.items.join(' · ')}
              </p>
            ))}
          </>,
        )
      case 'capabilities':
      case 'projects':
        return print(
          <>
            {profile.capabilities.map((c, i) => (
              <p key={c.title} className="max-w-[72ch]">
                <Muted>{String(i + 1).padStart(2, '0')} </Muted>
                <Key>{c.title}</Key> <Muted>— {c.description}</Muted>
              </p>
            ))}
          </>,
        )
      case 'awards':
        return print(
          <>
            {profile.awards.map((a) => (
              <p key={a.title}>
                <Muted>- </Muted>
                {a.title}
                {a.year && <Muted> ({a.year})</Muted>}
              </p>
            ))}
            {profile.education.map((e) => (
              <p key={e.degree} className="mt-2">
                <Key>{e.degree}</Key>
                <Muted>
                  {' '}
                  — {e.institution}, {e.year}
                </Muted>
              </p>
            ))}
          </>,
        )
      case 'contact':
        return print(
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4">
            <Muted>email</Muted>
            <a href={`mailto:${profile.email}`} className="break-words text-accent underline-offset-4 hover:underline">
              {profile.email}
            </a>
            <Muted>linkedin</Muted>
            <span className="break-words">
              <ExtLink href={profile.links.linkedin.href}>{profile.links.linkedin.href.replace(/^https?:\/\//, '')}</ExtLink>
            </span>
            <Muted>github</Muted>
            <span className="break-words">
              <ExtLink href={profile.links.github.href}>{profile.links.github.href.replace(/^https?:\/\//, '')}</ExtLink>
            </span>
            <Muted>location</Muted>
            <span>{profile.location}</span>
          </div>,
        )
      case 'cv':
        downloadCv()
        return print(T.cvDownloading)
      case 'ls':
        return print(<Key>{FILES.join('   ')}</Key>)
      case 'cat':
        if (arg === 'ajay.ts') return print(<HighlightedCode code={ajayTs(48)} />)
        if (arg === 'skills.json') return print(<HighlightedCode code={skillsJson} />)
        if (arg === 'cv.pdf') return print(T.catBinary)
        return print(fill(T.catMissing, { file: arg }))
      case 'open':
      case 'cd': {
        const id = findSection(arg)
        if (id) return goTo(id)
        return print(
          <>
            <p>{T.openUsage}</p>
            <p className="text-accent-2">{SECTION_IDS.join('  ')}</p>
          </>,
        )
      }
      case 'theme': {
        if (arg && arg !== 'dark' && arg !== 'light') return notFound(line)
        const next = arg === 'dark' || arg === 'light' ? arg : theme === 'dark' ? 'light' : 'dark'
        if (arg) setTheme(next)
        else toggleTheme()
        return print(fill(T.themeSet, { theme: next }))
      }
      case 'history':
        return print(
          <>
            {history.current.map((h, i) => (
              <p key={i}>
                <Muted>{String(i + 1).padStart(3, ' ')} </Muted>
                {h}
              </p>
            ))}
          </>,
        )
      case 'clear':
        return setEntries([])
      case 'exit':
        return onClose()
      case 'sudo':
        if (arg !== 'hire-ajay') return notFound(line)
        print(T.sudoPassword)
        later(SUDO_DELAY, () => {
          print(T.sudoGranted)
          later(MAILTO_DELAY, () => {
            openMailto(`mailto:${profile.email}?subject=${encodeURIComponent(T.hireSubject)}&body=${encodeURIComponent(T.hireBody)}`)
          })
        })
        return
      case 'rm':
        return arg === '-rf /' ? print(T.rmrf) : notFound(line)
      default:
        return notFound()
    }
  }

  function complete() {
    const words = value.trimStart().split(/\s+/)
    const typingArg = words.length > 1 || /\s$/.test(value)
    const prefix = typingArg ? (/\s$/.test(value) ? '' : words[words.length - 1]) : words[0]
    const candidates = typingArg ? (ARG_COMPLETIONS[words[0]] ?? []) : COMMAND_NAMES
    const matches = candidates.filter((c) => c.startsWith(prefix))
    if (!matches.length) return
    const base = value.slice(0, value.length - prefix.length)
    if (matches.length === 1) return setValue(`${base}${matches[0]} `)
    const shared = commonPrefix(matches)
    if (shared.length > prefix.length) return setValue(base + shared)
    print(<p className="text-muted">{matches.join('  ')}</p>)
  }

  function onInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      execute(value)
      setValue('')
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab completes here; Shift+Tab still moves focus (to the chips and close button).
      e.preventDefault()
      complete()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const h = history.current
      if (!h.length) return
      historyIndex.current = Math.max(0, Math.min(h.length, historyIndex.current + (e.key === 'ArrowUp' ? -1 : 1)))
      setValue(h[historyIndex.current] ?? '')
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault()
      setEntries([])
    }
  }

  function onDialogKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.target !== inputRef.current || e.shiftKey) trapTab(e, dialogRef.current)
  }

  // Clicking empty space in the log returns focus to the input (but never steals a text selection
  // or a link click).
  function focusInput(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('a, button')) return
    if (window.getSelection()?.toString()) return
    inputRef.current?.focus()
  }

  return createPortal(
    <m.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={T.title}
        onKeyDown={onDialogKey}
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden bg-surface shadow-2xl shadow-black/40 sm:h-[min(80vh,46rem)] sm:rounded-lg sm:border sm:border-line"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          <div aria-hidden="true" className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <p className="min-w-0 truncate font-mono text-xs text-muted">{T.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={T.close}
            className="ml-auto rounded border border-line px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-text"
          >
            esc ✕
          </button>
        </div>

        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          onMouseUp={focusInput}
          className="flex-1 space-y-1 overflow-y-auto p-4 font-mono text-[13px] leading-6 sm:text-sm"
        >
          {entries.map((entry) =>
            entry.input !== undefined ? (
              <p key={entry.id} className="mt-3 first:mt-0">
                <span className="text-accent">{T.prompt}</span> {entry.input}
              </p>
            ) : (
              <div key={entry.id} className="break-words">
                {entry.out}
              </div>
            ),
          )}
        </div>

        {/* Tappable commands, so nobody has to type on a phone. */}
        <div className="flex gap-2 overflow-x-auto border-t border-line px-4 py-2 [scrollbar-width:none]">
          {T.chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                execute(chip)
                inputRef.current?.focus()
              }}
              className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-text"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-line px-4 py-3 font-mono focus-within:bg-line/30">
          <label htmlFor="terminal-input" className="shrink-0 text-[13px] text-accent sm:text-sm">
            <span aria-hidden="true">{T.prompt}</span>
            <span className="sr-only">{T.inputLabel}</span>
          </label>
          <input
            ref={inputRef}
            id="terminal-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onInputKey}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            // 16px on phones so iOS doesn't zoom into the field.
            className="min-w-0 flex-1 bg-transparent text-base text-text caret-accent outline-none sm:text-sm"
          />
        </div>
      </div>
    </m.div>,
    document.body,
  )
}
