import Background from './components/Background'
import WebsocketGraph from './components/WebsocketGraph'
import ThemeProviderWrapper from './providers/ThemeProviderWrapper'

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    <ThemeProviderWrapper>
      <Background />
      <WebsocketGraph />
    </ThemeProviderWrapper>
    //   </header>
    // </div>
  )
}

export default App
