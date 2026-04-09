import { useEffect, useRef, useState } from 'react'
import { problemSets } from './problems'

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function shuffleKey(setName: string | null): string {
  return `shuffle:${setName ?? '__everything__'}`
}

function indexKey(setName: string | null): string {
  return `shuffleIdx:${setName ?? '__everything__'}`
}

function pickFromShuffle(setName: string | null, pool: string[], n: number) {
  const sKey = shuffleKey(setName)
  const iKey = indexKey(setName)

  let shuffled: string[] | null = null
  const stored = localStorage.getItem(sKey)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Validate: must be same length and same elements as current pool
      if (Array.isArray(parsed) && parsed.length === pool.length) {
        shuffled = parsed
      }
    } catch { /* ignore */ }
  }

  if (!shuffled) {
    shuffled = shuffle(pool)
    localStorage.setItem(sKey, JSON.stringify(shuffled))
    localStorage.setItem(iKey, '0')
  }

  let idx = parseInt(localStorage.getItem(iKey) ?? '0', 10)
  if (isNaN(idx) || idx < 0) idx = 0

  // If not enough items left, reshuffle
  if (idx + n > shuffled.length) {
    shuffled = shuffle(pool)
    localStorage.setItem(sKey, JSON.stringify(shuffled))
    idx = 0
  }

  const result = shuffled.slice(idx, idx + n)
  localStorage.setItem(iKey, String(idx + n))
  return { items: result, index: idx + n, total: shuffled.length }
}

const allLinks = problemSets.flatMap(s => s.problemLinks)
const LS_KEY = 'activeSet'
const LS_TURBO_KEY = 'turboMode'
const LS_COUNT_KEY = 'count'
const DEFAULT_COUNT = 5

function initActiveSet(): { name: string | null; pool: string[] } {
  const stored = localStorage.getItem(LS_KEY)
  const match = problemSets.find(s => s.name === stored)
  if (stored !== null && !match) {
    localStorage.removeItem(LS_KEY)
  }
  return match ? { name: match.name, pool: match.problemLinks } : { name: null, pool: allLinks }
}

function App() {
  const [count, setCount] = useState(() => {
    const stored = parseInt(localStorage.getItem(LS_COUNT_KEY) ?? '', 10)
    return isNaN(stored) || stored < 1 ? DEFAULT_COUNT : stored
  })
  const [activeSet, setActiveSet] = useState<string | null>(() => initActiveSet().name)
  const [initResult] = useState(() => {
    const init = initActiveSet()
    return pickFromShuffle(init.name, init.pool, count)
  })
  const [shuffleProgress, setShuffleProgress] = useState({ index: initResult.index, total: initResult.total })
  const [links, setLinks] = useState(initResult.items)
  const [clicked, setClicked] = useState<Set<string>>(() => new Set())
  const [turboMode, setTurboMode] = useState(() => localStorage.getItem(LS_TURBO_KEY) === 'true')
  const countRef = useRef(count)
  countRef.current = count

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
    if (clicked.size === 0) return
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [clicked])

  function selectSet(name: string | null, pool: string[]) {
    setActiveSet(name)
    const result = pickFromShuffle(name, pool, countRef.current)
    setLinks(result.items)
    setShuffleProgress({ index: result.index, total: result.total })
    pendingTurbo.current = false
    if (name === null) {
      localStorage.removeItem(LS_KEY)
    } else {
      localStorage.setItem(LS_KEY, name)
    }
  }

  function promptCount() {
    const input = prompt('How many problems?')
    if (input === null || input.trim() === '') return
    const value = Number(input)
    if (!Number.isInteger(value) || value < 1) return
    setCount(value)
    localStorage.setItem(LS_COUNT_KEY, String(value))
    const pool = activeSet ? problemSets.find(s => s.name === activeSet)!.problemLinks : allLinks
    const result = pickFromShuffle(activeSet, pool, value)
    setLinks(result.items)
    setShuffleProgress({ index: result.index, total: result.total })
    setClicked(new Set())
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
      <p>
        <button onClick={promptCount}>{count}</button>
        {' '}random problems from set: ({shuffleProgress.index}/{shuffleProgress.total})
      </p>
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
