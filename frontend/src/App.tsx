import './App.css'
import WebsocketGraph from './components/WebsocketGraph'
import ThemeProviderWrapper from './providers/ThemeProviderWrapper'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ThemeProviderWrapper>
          <WebsocketGraph />
        </ThemeProviderWrapper>
      </header>
    </div>
  )
}

export default App
