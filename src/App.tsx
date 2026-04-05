import { easyLife, easyKill, koreanProblemAcademy1, problems } from './problems'

function openRandomProblems(problemSet: string[]) {
  const copy = [...problemSet]
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
      <p>
      Open 5 random problems from:
      </p>
      <div>
        <button onClick={() => openRandomProblems(easyLife)}>Easy Life</button>
      </div>
      <div>
        <button onClick={() => openRandomProblems(easyKill)}>Easy Kill</button>
      </div>
      <div>
        <button onClick={() => openRandomProblems(koreanProblemAcademy1)}>Korean Problem Academy 1</button>
      </div>
      <div>
        <button onClick={() => openRandomProblems(problems)}>Everything</button>
      </div>
    </>
  )
}

export default App
