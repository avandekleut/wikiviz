import { useEffect, useState } from 'react'
import { WikipediaSearchApiResponse } from '../../../backend/api/v1/search/GET'
import { config } from '../env'

interface Props {
  value: string
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
  onResultSelect: (title: string) => void
  minimumSearchLength: number
}

function WikipediaSearch(props: Props): JSX.Element {
  // const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      if (props.value.length < props.minimumSearchLength) {
        setSearchResults([])
        return
      }

      const url =
        config.API_BASEURL +
        `/api/v1/search?term=${encodeURIComponent(props.value)}`

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
  }, [props.value, props.minimumSearchLength])

  function handleResultClick(title: string) {
    props.onResultSelect(title)
  }

  return (
    <>
      <input type="text" value={props.value} onChange={props.onChange} />
      <ul>
        {searchResults.map((result) => (
          <li key={result} onClick={() => handleResultClick(result)}>
            {result}
          </li>
        ))}
      </ul>
    </>
  )
}

export default WikipediaSearch
