import type { SectionId } from '../data/profile'
import { prefersReducedMotion } from './motion'

/** Scroll to a section and move focus to it (sections are focusable with tabIndex -1). */
export function scrollToSection(id: SectionId) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
  history.replaceState(null, '', `#${id}`)
}

/** Follow a link via a temporary anchor: downloads (`download: true`) and mailto: links. */
function clickLink(href: string, isDownload = false) {
  const a = document.createElement('a')
  a.href = href
  if (isDownload) a.download = ''
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Download a file without leaving the page. */
export const download = (href: string) => clickLink(href, true)

/** Open the visitor's mail client. */
export const openMailto = (href: string) => clickLink(href)

/** Is the user typing into a text field (where single-key shortcuts must not fire)? */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'radio', 'submit', 'reset', 'range', 'color', 'file'].includes(target.type)
  }
  return false
}
