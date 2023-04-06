import { useEffect, useState } from 'react'
import { SearchApiResponse } from '../../../backend/api/v1/search/GET'
import { config } from '../env'

interface Props {
  onResultSelect: (title: string) => void
  minimumSearchLength: number
}

function WikipediaSearch(props: Props): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  useEffect(() => {
    if (searchTerm.length < props.minimumSearchLength) {
      setSearchResults([])
      return
    }

    const url =
      config.API_BASEURL +
      `/api/v1/search?term=${encodeURIComponent(searchTerm)}`

    fetch(url)
      .then((response) => response.json() as Promise<SearchApiResponse>)
      .then((data) => {
        setSearchResults(data.map((result) => result.title))
      })
      .catch((error) => console.log(error))
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
