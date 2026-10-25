import type { ReactNode } from 'react'

// Minimal syntax highlighting for the site's own generated files (JSON and the ajay.ts object).
// Keys/keywords in cyan, strings in mint, punctuation muted.

const TOKENS = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(const)\b|([[\]{},:;=])/g

function highlightLine(line: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  let k = 0
  for (const match of line.matchAll(TOKENS)) {
    if (match.index > last) parts.push(line.slice(last, match.index))
    const [, str, colon, keyword, punct] = match
    if (str) {
      parts.push(
        <span key={k++} className={colon ? 'text-accent-2' : 'text-accent'}>
          {str}
        </span>,
      )
      if (colon) parts.push(<span key={k++} className="text-muted">{colon}</span>)
    } else if (keyword) {
      parts.push(<span key={k++} className="text-accent-2">{keyword}</span>)
    } else {
      parts.push(<span key={k++} className="text-muted">{punct}</span>)
    }
    last = match.index + match[0].length
  }
  parts.push(line.slice(last))
  return parts
}

/** One block per line, with optional line numbers. */
export function HighlightedCode({ code, numbered = false }: { code: string; numbered?: boolean }) {
  return (
    <>
      {code.split('\n').map((line, i) => (
        <div key={i} className="flex">
          {numbered && (
            <span aria-hidden="true" className="w-8 shrink-0 select-none pr-3 text-right text-muted/50">
              {i + 1}
            </span>
          )}
          <span className="whitespace-pre-wrap break-words">{highlightLine(line)}</span>
        </div>
      ))}
    </>
  )
}
