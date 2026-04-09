This is a React/TypeScript web app that serves as a practice session picker for Go (baduk) tsumego puzzles from tsumego.com. You pick a problem set (e.g. "Easy Life", "Easy Kill") or "Everything", and it presents N random links to open and solve. It uses a persistent shuffle per set stored in localStorage so problems are visited in a non-repeating order across sessions. There's a turbo mode that auto-opens the next problem each time you return to the tab. The entry point is src/App.tsx.

- If you are making a commit for me, don't include your default attribution (e.g. Co-Authored-By and email). Instead, write: (no indentation)
    Co-authored by an LLM coding tool
- Don't run typechecking after every change. Wait for me to tell you when to do it, or for me to tell you there's a type error.
