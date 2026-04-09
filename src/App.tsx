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

function App() {
  const [links, setLinks] = useState(() => pickRandom5(allLinks))
  const [activeSet, setActiveSet] = useState<string | null>(null)
  const [clicked, setClicked] = useState<Set<string>>(() => new Set())

  function selectSet(name: string | null, pool: string[]) {
    setActiveSet(name)
    setLinks(pickRandom5(pool))
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
