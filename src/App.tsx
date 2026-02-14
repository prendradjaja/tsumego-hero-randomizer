import { problems } from './problems'

function openRandomProblems() {
  const copy = [...problems]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  for (const url of copy.slice(0, 5)) {
    window.open(url, '_blank')
  }
}

function App() {
  return (
    <>
      <button onClick={openRandomProblems}>Open 5 random problems</button>
    </>
  )
}

export default App
