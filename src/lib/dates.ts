// Role durations, computed at runtime from "Mon YYYY" strings so they never go stale.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Month index since year 0 for "Apr 2026"; "Present" is the current month. */
function monthIndex(value: string, now: Date): number {
  if (value === 'Present') return now.getFullYear() * 12 + now.getMonth()
  const [mon, year] = value.split(' ')
  const m = MONTHS.indexOf(mon)
  if (m < 0 || !year) throw new Error(`Unparseable date: ${value}`)
  return Number(year) * 12 + m
}

/** Inclusive month count, as LinkedIn shows it: Apr 2026 – Oct 2026 is 7 months. */
export const monthsBetween = (start: string, end: string, now = new Date()) =>
  monthIndex(end, now) - monthIndex(start, now) + 1

/** 7 → "7 mos", 54 → "4 yrs 6 mos", 12 → "1 yr". */
export function formatDuration(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  const parts = [y ? `${y} ${y === 1 ? 'yr' : 'yrs'}` : '', m ? `${m} ${m === 1 ? 'mo' : 'mos'}` : '']
  return parts.filter(Boolean).join(' ') || '1 mo'
}

export const duration = (start: string, end: string) => formatDuration(monthsBetween(start, end))
