import './App.css'
import { SearchAndNetwork } from './pages/SearchAndNetwork'
import ThemeProviderWrapper from './providers/ThemeProviderWrapper'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <ThemeProviderWrapper>
          <SearchAndNetwork />
        </ThemeProviderWrapper>
      </header>
    </div>
  )
}

export default App
