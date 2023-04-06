import NodeCache from 'node-cache'
import fetch from 'node-fetch'
import { createHandlerContext } from '../../../../utils/handler-context'
import { HttpEvent } from '../../../../utils/http-event'

type WikipediaSearchResult = {
  ns: number
  title: string
  snippet: string
  size: number
  wordcount: number
  timestamp: string
}

interface WikipediaSearchResponse {
  query: {
    search: WikipediaSearchResult[]
  }
}

export type SearchResult = Pick<WikipediaSearchResult, 'title' | 'snippet'>

export type SearchApiResponse = {
  results: SearchResult[]
}

// Create a cache with a TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

function getSearchUrlInTitle(searchTerm: string) {
  return `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    searchTerm,
  )}`
}

function getSearchUrlDefault(searchTerm: string) {
  return `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    searchTerm,
  )}`
}

function getSearchUrl(searchTerm: string) {
  return getSearchUrlInTitle(searchTerm)
}

async function eventHandler(event: HttpEvent) {
  const searchTerm = event.getQueryStringParameter('term')

  const cachedResults = cache.get(searchTerm)
  if (cachedResults) {
    console.log({ msg: 'cache hit', results: cachedResults })
    return cachedResults
  }

  const url = getSearchUrl(searchTerm)

  const response = await fetch(url)
  const data: WikipediaSearchResponse = await response.json()

  const searchResults: SearchApiResponse = {
    results: data.query.search.map((result) => ({
      title: result.title,
      snippet: result.snippet,
    })),
  }

  // Store the search results in the cache for 1 hour
  cache.set(searchTerm, searchResults)

  console.log({ msg: 'cache miss', results: searchResults })
  return searchResults
}

export const handler = createHandlerContext(eventHandler)
