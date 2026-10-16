import { useEffect, useState } from 'react'
import { VIEW_OPTIONS, type CourtViewMode } from './components/courtTypes'
import Segmented from './components/Segmented'
import FloorDefense from './sections/FloorDefense'
import RotationBasics from './sections/RotationBasics'
import ServeReceive from './sections/ServeReceive'

type Tab = 'rotation' | 'receive' | 'defense'

const TABS: { id: Tab; label: string }[] = [
  { id: 'rotation', label: 'Rotation basics' },
  { id: 'receive', label: 'Serve receive' },
  { id: 'defense', label: 'Floor defense' },
]

function tabFromHash(): Tab {
  const h = window.location.hash.replace('#', '')
  return TABS.some((t) => t.id === h) ? (h as Tab) : 'rotation'
}

const VIEW_KEY = 'sideout.view'

function loadView(): CourtViewMode {
  try {
    const v = window.localStorage.getItem(VIEW_KEY)
    if (v === 'top' || v === 'perspective') return v
  } catch {
    // Storage can be unavailable; fall through to the default.
  }
  return 'perspective'
}

export default function App() {
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [view, setView] = useState<CourtViewMode>(loadView)

  function pickView(v: CourtViewMode) {
    setView(v)
    try {
      window.localStorage.setItem(VIEW_KEY, v)
    } catch {
      // Not persisting is fine.
    }
  }

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(t: Tab) {
    setTab(t)
    window.history.replaceState(null, '', `#${t}`)
  }

  return (
    <div className="app">
      <header className="masthead">
        <div>
          <h1 className="wordmark">Sideout</h1>
          <p className="tagline">Volleyball positioning: where to stand, and why.</p>
        </div>
        <a className="masthead-link" href="https://github.com/francisphan/sideout">
          Source on GitHub
        </a>
      </header>

      <nav className="tabs" role="tablist" aria-label="Lessons">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className="tab"
            onClick={() => go(t.id)}
          >
            {t.label}
          </button>
        ))}
        <Segmented
          className="seg-compact view-switch"
          label="Court view"
          value={view}
          options={VIEW_OPTIONS}
          onChange={pickView}
        />
      </nav>

      <main>
        {tab === 'rotation' && <RotationBasics view={view} />}
        {tab === 'receive' && <ServeReceive view={view} />}
        {tab === 'defense' && <FloorDefense view={view} />}
      </main>

      <footer className="footer">
        <p>
          Positions are one common way to run each system, drawn as seen from behind your own
          endline. Your coach’s version may differ; the rules do not.
        </p>
      </footer>
    </div>
  )
}
