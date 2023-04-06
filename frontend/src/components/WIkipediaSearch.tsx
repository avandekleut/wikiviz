import { useEffect, useState } from 'react'
import { WikipediaSearchApiResponse } from '../../../backend/api/v1/search/GET'
import { config } from '../env'

interface Props {
  onResultSelect: (title: string) => void
  minimumSearchLength: number
}

function WikipediaSearch(props: Props): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      if (searchTerm.length < props.minimumSearchLength) {
        setSearchResults([])
        return
      }

      const url =
        config.API_BASEURL +
        `/api/v1/search?term=${encodeURIComponent(searchTerm)}`

      try {
        const response = await fetch(url)
        const data = (await response.json()) as WikipediaSearchApiResponse
        console.log(data)
        setSearchResults(data.pages.map((page) => page.title))
      } catch (error) {
        console.log(error)
        setSearchResults([])
      }
    }

    fetchData()
  }, [searchTerm, props.minimumSearchLength])

  function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
  }

  function handleResultClick(title: string) {
    props.onResultSelect(title)
  }

  return (
    <div>
      <input type="text" value={searchTerm} onChange={handleSearchTermChange} />
      <ul>
        {searchResults.map((result) => (
          <li key={result} onClick={() => handleResultClick(result)}>
            {result}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WikipediaSearch
