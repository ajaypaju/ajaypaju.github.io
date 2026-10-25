import type { KeyboardEvent } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'

/** Keeps Tab / Shift+Tab cycling inside `container` (the page behind is also made inert). */
export function trapTab(e: KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return
  const els = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null)
  if (!els.length) {
    e.preventDefault()
    return
  }
  const first = els[0]
  const last = els[els.length - 1]
  const active = document.activeElement
  if (e.shiftKey && (active === first || !container.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (active === last || !container.contains(active))) {
    e.preventDefault()
    first.focus()
  }
}
