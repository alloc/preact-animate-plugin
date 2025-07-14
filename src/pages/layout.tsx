import type { ComponentChildren } from 'preact'

export default (props: { children: ComponentChildren }) => {
  return (
    <main>
      <div class="row" style={{ justifyContent: 'space-between' }}>
        <h1>Preact In Motion</h1>
        <nav class="row">
          <a href="/">Basic</a>
          <a href="/animate-presence">AnimatePresence</a>
          <a href="/options">Options</a>
        </nav>
      </div>
      {props.children}
    </main>
  )
}
