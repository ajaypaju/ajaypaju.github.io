import { AnimatePresence, domAnimation, LazyMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Nav } from './components/Nav'
import { profile, type SectionId } from './data/profile'
import { AppActionsContext, type AppActions } from './lib/appActions'
import { shouldPlayBoot } from './lib/boot'
import { writeText } from './lib/clipboard'
import { useLazyComponent } from './lib/lazyModule'
import { download, isTypingTarget, scrollToSection } from './lib/navigate'
import { useTheme } from './lib/theme'
import { Architecture } from './sections/Architecture'
import { Awards } from './sections/Awards'
import { BootSequence } from './sections/BootSequence'
import { Contact } from './sections/Contact'
import { Experience } from './sections/Experience'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { PromptToTask } from './sections/PromptToTask'
import { Skills } from './sections/Skills'
import { WhatIDo } from './sections/WhatIDo'

// Code-split: neither overlay is in the initial bundle. Both are prefetched once the page is idle,
// so the first open is still instant.
const loadTerminal = () => import('./components/TerminalOverlay')
const loadPalette = () => import('./components/CommandPalette')

const year = new Date().getFullYear()
const TOAST_MS = 2000

type Overlay = 'terminal' | 'palette' | null

export default function App() {
  const { theme, setTheme, toggleTheme } = useTheme()
  const [booting, setBooting] = useState(shouldPlayBoot)
  const endBoot = useCallback(() => setBooting(false), [])
  const [overlay, setOverlay] = useState<Overlay>(null)
  const terminal = useLazyComponent(loadTerminal)
  const palette = useLazyComponent(loadPalette)
  const [toast, setToast] = useState('')
  // Where focus returns when an overlay closes (the element that opened the first overlay).
  const returnFocus = useRef<HTMLElement | null>(null)
  // A section to focus after closing, instead of returning focus (terminal `open`, palette Navigate).
  const navigateTo = useRef<SectionId | null>(null)

  const loadTerminalNow = terminal.load
  const loadPaletteNow = palette.load
  const open = useCallback(
    (next: Exclude<Overlay, null>) => {
      // Normally already prefetched; this covers an open before the idle prefetch has run.
      if (next === 'terminal') loadTerminalNow()
      else loadPaletteNow()
      setOverlay((current) => {
        if (!current) returnFocus.current = document.activeElement as HTMLElement | null
        return next
      })
    },
    [loadTerminalNow, loadPaletteNow],
  )
  const close = useCallback(() => setOverlay(null), [])

  // After an overlay closes: navigate, or give focus back to whatever opened it.
  useEffect(() => {
    if (overlay) return
    const target = navigateTo.current
    navigateTo.current = null
    if (target) scrollToSection(target)
    else if (returnFocus.current?.isConnected) returnFocus.current.focus()
    returnFocus.current = null
  }, [overlay])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(''), TOAST_MS)
    return () => window.clearTimeout(t)
  }, [toast])

  const actions = useMemo<AppActions>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      openTerminal: () => open('terminal'),
      openPalette: () => open('palette'),
      goTo: (id) => {
        navigateTo.current = id
        setOverlay(null)
        // Already closed (e.g. called from the page): the effect won't re-run, so go now.
        if (!overlay) {
          navigateTo.current = null
          scrollToSection(id)
        }
      },
      copyEmail: async () => setToast((await writeText(profile.email)) ? profile.ui.emailCopied : profile.ui.copyFailed),
      downloadCv: () => download(profile.cvPath),
    }),
    [theme, setTheme, toggleTheme, open, overlay],
  )

  // Global shortcuts: Ctrl/Cmd+K toggles the palette; ` opens the terminal unless typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (overlay === 'palette') close()
        else open('palette')
      } else if (e.key === '`' && !e.metaKey && !e.ctrlKey && !e.altKey && !overlay && !isTypingTarget(e.target)) {
        e.preventDefault()
        open('terminal')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlay, open, close])

  // Lock page scroll behind an open overlay.
  useEffect(() => {
    if (!overlay) return
    const html = document.documentElement
    const previous = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previous
    }
  }, [overlay])

  // Prefetch both overlay chunks once the page has loaded and the browser is idle, so they never
  // compete with the hero image.
  useEffect(() => {
    let idle = 0
    let timer = 0
    const prefetch = () => {
      loadTerminalNow()
      loadPaletteNow()
    }
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(prefetch, { timeout: 4000 })
      else timer = window.setTimeout(prefetch, 1000)
    }
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      window.removeEventListener('load', schedule)
      if (idle) window.cancelIdleCallback(idle)
      window.clearTimeout(timer)
    }
  }, [loadTerminalNow, loadPaletteNow])

  return (
    <AppActionsContext.Provider value={actions}>
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence>{booting && <BootSequence onDone={endBoot} />}</AnimatePresence>
        {/* The page is inert behind an open overlay: no focus or screen-reader access can escape. */}
        <div inert={overlay !== null}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-on-accent"
          >
            {profile.ui.skipLink}
          </a>
          <Nav theme={theme} onToggleTheme={toggleTheme} />
          <main id="main">
            <Hero ready={!booting} />
            <Metrics />
            <WhatIDo />
            <PromptToTask />
            <Architecture />
            <Experience />
            <Skills />
            <Awards />
            <Contact />
          </main>
          <footer className="border-t border-line py-8">
            <p className="mx-auto max-w-5xl px-4 font-mono text-xs text-muted sm:px-6">
              © {year} {profile.name}
            </p>
          </footer>
        </div>

        {overlay === 'terminal' && terminal.Component && <terminal.Component onClose={close} />}
        {overlay === 'palette' && palette.Component && <palette.Component onClose={close} />}

        {/* Fixed, so it never shifts layout. */}
        <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
          {toast && (
            <p className="rounded-full border border-accent/50 bg-surface px-4 py-2 font-mono text-xs text-accent shadow-lg shadow-black/30">
              {toast}
            </p>
          )}
        </div>
      </LazyMotion>
    </AppActionsContext.Provider>
  )
}
