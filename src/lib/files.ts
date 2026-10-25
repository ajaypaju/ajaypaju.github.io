import { codeCardEntries, profile } from '../data/profile'

// The site's virtual files, generated from profile.ts (never typed separately). Shown by the Skills
// JSON view and by the terminal's `cat`.

export const skillsJson = JSON.stringify(Object.fromEntries(profile.skills.map((g) => [g.group, g.items])), null, 2)

const quote = (s: string) => `"${s}"`

/** `const ajay = { … };` from the code card data. Arrays longer than `maxLine` characters break
 *  one item per line, like Prettier would. */
export function ajayTs(maxLine = 52): string {
  const { variable } = profile.codeCard
  const lines = [`const ${variable} = {`]
  for (const [key, value] of codeCardEntries) {
    if (!Array.isArray(value)) {
      lines.push(`  ${key}: ${quote(value)},`)
      continue
    }
    const inline = `  ${key}: [${value.map(quote).join(', ')}],`
    if (inline.length <= maxLine) lines.push(inline)
    else lines.push(`  ${key}: [`, ...value.map((v) => `    ${quote(v)},`), '  ],')
  }
  lines.push('};')
  return lines.join('\n')
}
