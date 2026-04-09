import { useEffect, useRef, useState } from 'react'
import { problemSets } from './problems'

function pickRandom5(links: string[]): string[] {
  const copy = [...links]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, 5)
}

const allLinks = problemSets.flatMap(s => s.problemLinks)
const LS_KEY = 'activeSet'
const LS_TURBO_KEY = 'turboMode'

function initActiveSet(): { name: string | null; pool: string[] } {
  const stored = localStorage.getItem(LS_KEY)
  const match = problemSets.find(s => s.name === stored)
  if (stored !== null && !match) {
    localStorage.removeItem(LS_KEY)
  }
  return match ? { name: match.name, pool: match.problemLinks } : { name: null, pool: allLinks }
}

function App() {
  const [activeSet, setActiveSet] = useState<string | null>(() => initActiveSet().name)
  const [links, setLinks] = useState(() => pickRandom5(initActiveSet().pool))
  const [clicked, setClicked] = useState<Set<string>>(() => new Set())
  const [turboMode, setTurboMode] = useState(() => localStorage.getItem(LS_TURBO_KEY) === 'true')

  const linksRef = useRef(links)
  linksRef.current = links
  const clickedRef = useRef(clicked)
  clickedRef.current = clicked
  const pendingTurbo = useRef(false)
  const lastFocusTime = useRef<number | null>(null)

  useEffect(() => {
    if (!turboMode) {
      pendingTurbo.current = false
      return
    }

    function handleVisibility() {
      if (document.visibilityState !== 'visible') return

      const now = Date.now()
      const last = lastFocusTime.current
      lastFocusTime.current = now

      // Two focuses within 300ms = user is trying to escape turbo mode
      // (rapid tab switching signals intent to stop, vs. normal return after reading a problem)
      if (last !== null && now - last < 300) {
        handleTurboChange(false)
        return
      }

      if (pendingTurbo.current) {
        const next = linksRef.current.find(url => !clickedRef.current.has(url))
        if (next) {
          window.open(next, '_blank')
          setClicked(prev => new Set(prev).add(next))
          // keep pendingTurbo true so the chain continues on the next focus
        } else {
          pendingTurbo.current = false
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [turboMode])

  // Warn before closing the window while turbo mode is active. Without this,
  // the user could easily close the main window by accident: turbo opens links
  // quickly and the user may misclick the main tab's close button while rapidly
  // closing problem tabs.
  useEffect(() => {
    if (!turboMode) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [turboMode])

  function selectSet(name: string | null, pool: string[]) {
    setActiveSet(name)
    setLinks(pickRandom5(pool))
    pendingTurbo.current = false
    if (name === null) {
      localStorage.removeItem(LS_KEY)
    } else {
      localStorage.setItem(LS_KEY, name)
    }
  }

  function handleLinkClick(url: string) {
    setClicked(prev => new Set(prev).add(url))
    if (turboMode) {
      pendingTurbo.current = true
    }
  }

  function handleTurboChange(checked: boolean) {
    setTurboMode(checked)
    localStorage.setItem(LS_TURBO_KEY, String(checked))
    if (!checked) pendingTurbo.current = false
  }

  return (
    <>
      <p>5 random problems from:</p>
      {problemSets.map(set => (
        <button
          key={set.name}
          onClick={() => selectSet(set.name, set.problemLinks)}
          style={{ fontWeight: activeSet === set.name ? 'bold' : 'normal' }}
        >
          {set.name}
        </button>
      ))}
      <button
        onClick={() => selectSet(null, allLinks)}
        style={{ fontWeight: activeSet === null ? 'bold' : 'normal' }}
      >
        Everything
      </button>
      <div>
        <label>
          <input
            type="checkbox"
            checked={turboMode}
            onChange={e => handleTurboChange(e.target.checked)}
          />
          {' '}Turbo mode
        </label>
      </div>
      <ol>
        {links.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: clicked.has(url) ? 'gray' : 'blue' }}
              onClick={() => handleLinkClick(url)}
            >{url}</a>
          </li>
        ))}
      </ol>
    </>
  )
}

export default App
