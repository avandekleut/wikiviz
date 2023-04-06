import NodeCache from 'node-cache'
import fetch from 'node-fetch'
import { createHandlerContext } from '../../../../utils/handler-context'
import { HttpEvent } from '../../../../utils/http-event'
import { LoggerFactory } from '../../../../utils/logger'

type WikipediaSearchResult = {
  ns: number
  title: string
  snippet: string
  size: number
  wordcount: number
  timestamp: string
}

type SearchInfo = {
  totalhits: number
  suggestion: string
  suggestionsnippet: string
}

interface WikipediaSearchResponse {
  batchcomplete?: string
  query: {
    search: WikipediaSearchResult[]
    searchInfo?: SearchInfo
  }
}

export type SearchResult = Pick<WikipediaSearchResult, 'title' | 'snippet'>

export type SearchApiResponse = {
  results: SearchResult[]
}

// Create a cache with a TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

function getSearchUrlInTitle(searchTerm: string) {
  return `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=intitle:${encodeURIComponent(
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

async function search(searchTerm: string): Promise<WikipediaSearchResponse> {
  const url = getSearchUrl(searchTerm)
  const response = await fetch(url)
  let data: WikipediaSearchResponse = await response.json()
  return data
}

async function eventHandler(event: HttpEvent) {
  const searchTerm = event.getQueryStringParameter('term')

  const cachedResults = cache.get(searchTerm)
  if (cachedResults) {
    LoggerFactory.logger.debug({ msg: 'cache hit', results: cachedResults })
    return cachedResults
  }

  let searchResponse = await search(searchTerm)
  LoggerFactory.logger.debug({ searchResponse })

  // handle suggestions
  if (searchResponse.query.searchInfo?.totalhits === 0) {
    const suggestion =
      searchResponse.query.searchInfo.suggestion ||
      searchResponse.query.searchInfo.suggestionsnippet
    if (suggestion) {
      LoggerFactory.logger.debug({ msg: 'following suggestion', suggestion })
      searchResponse = await search(suggestion)
      LoggerFactory.logger.debug({ msg: 'followed response', searchResponse })
    }
  }

  const searchResults: SearchApiResponse = {
    results: searchResponse.query.search.map((result) => ({
      title: result.title,
      snippet: result.snippet,
    })),
  }

  // Store the search results in the cache for 1 hour
  cache.set(searchTerm, searchResults)

  LoggerFactory.logger.debug({ msg: 'cache miss', results: searchResults })
  return searchResults
}

export const handler = createHandlerContext(eventHandler)
