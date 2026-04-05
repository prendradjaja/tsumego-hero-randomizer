import { problemSets } from './problems'

function openRandomProblems(problemLinks: string[]) {
  const copy = [...problemLinks]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  for (const url of copy.slice(0, 5)) {
    window.open(url, '_blank')
  }
}

function App() {
  const allLinks = problemSets.flatMap(s => s.problemLinks)
  return (
    <>
      <p>
      Open 5 random problems from:
      </p>
      {problemSets.map(set => (
        <div key={set.name}>
          <button onClick={() => openRandomProblems(set.problemLinks)}>{set.name}</button>
        </div>
      ))}
      <div>
        <button onClick={() => openRandomProblems(allLinks)}>Everything</button>
      </div>
    </>
  )
}

export default App
