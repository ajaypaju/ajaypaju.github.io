import { createContext, useContext } from 'react'
import type { SectionId } from '../data/profile'
import type { Theme } from './theme'

/** App-wide actions shared by the hero, nav, terminal and command palette. */
export interface AppActions {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  openTerminal: () => void
  openPalette: () => void
  /** Closes any overlay, then scrolls to the section and moves focus there. */
  goTo: (id: SectionId) => void
  copyEmail: () => void
  downloadCv: () => void
}

export const AppActionsContext = createContext<AppActions | null>(null)

export function useAppActions(): AppActions {
  const ctx = useContext(AppActionsContext)
  if (!ctx) throw new Error('useAppActions must be used inside AppActionsContext')
  return ctx
}
