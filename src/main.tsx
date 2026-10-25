import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { profile } from './data/profile'
import './index.css'

// One styled greeting for developers who open DevTools (module scope, so it logs once per load).
console.log(
  `%c${profile.ui.devGreeting.replace('{email}', profile.email)}`,
  'font: 12px/1.6 ui-monospace, monospace; color: #7cffb2; background: #0a0b0d; padding: 6px 10px; border-radius: 4px;',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
