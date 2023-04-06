import { useEffect, useState } from 'react'

function WikipediaSearch(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [searchResults, setSearchResults] = useState<string[]>([])

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([])
      return
    }

    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
      searchTerm,
    )}`

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(
          data.query.search.map((result: { title: string }) => result.title),
        )
      })
      .catch((error) => console.log(error))
  }, [searchTerm])

  function handleSearchTermChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
  }

  function handleResultClick(title: string) {
    // set your stateful variable here
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
