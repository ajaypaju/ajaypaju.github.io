import { useCallback, useEffect, useRef, useState } from 'react'

const CONFIRM_MS = 2000

export async function writeText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API unavailable (insecure context, permissions): fall back to a hidden textarea.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** `copy(text)` plus a status that shows "copied" / "failed" for a moment, then resets. */
export function useCopy() {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = useCallback(async (text: string) => {
    const ok = await writeText(text)
    setStatus(ok ? 'copied' : 'failed')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus('idle'), CONFIRM_MS)
  }, [])
  return { copy, status }
}
