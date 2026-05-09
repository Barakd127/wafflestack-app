import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Build version — bump this string to force a fresh entry-bundle hash so
// clients with aggressively cached LandingPage / index chunks pick up new
// code on next visit. Visible in console for sanity.
const BUILD_VERSION = '2026-05-09-72fe066-cache-bust'
console.info('[wafflestack] build', BUILD_VERSION)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
