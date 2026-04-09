import { useState } from 'react'
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

  function selectSet(name: string | null, pool: string[]) {
    setActiveSet(name)
    setLinks(pickRandom5(pool))
    if (name === null) {
      localStorage.removeItem(LS_KEY)
    } else {
      localStorage.setItem(LS_KEY, name)
    }
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
      <ol>
        {links.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: clicked.has(url) ? 'gray' : 'blue' }}
              onClick={() => setClicked(prev => new Set(prev).add(url))}
            >{url}</a>
          </li>
        ))}
      </ol>
    </>
  )
}

export default App
