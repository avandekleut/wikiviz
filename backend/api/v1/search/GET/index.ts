import NodeCache from 'node-cache'
import fetch from 'node-fetch'
import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../utils/handler-context'
import { HttpEvent } from '../../../../utils/http-event/HttpEvent'
import { LoggerFactory } from '../../../../utils/logger'

type WikipediaSearchPreview = {
  id: number
  key: string
  title: string
  excerpt: string
  matched_title: null | string
  description: null | string
  thumbnail: null | {
    mimetype: string
    size: null | number
    width: number
    height: number
    duration: null | number
    url: string
  }
}

export type WikipediaSearchApiResponse = {
  pages: WikipediaSearchPreview[]
}

// Create a cache with a TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

function getSearchUrl(searchTerm: string, limit = 10) {
  return `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(
    searchTerm,
  )}&limit=${limit}`
}

async function search(searchTerm: string): Promise<WikipediaSearchApiResponse> {
  const url = getSearchUrl(searchTerm)
  const response = await fetch(url)
  let data: WikipediaSearchApiResponse = await response.json()
  return data
}

const eventHandler: HttpEventHandler<{}> = async (event: HttpEvent) => {
  const searchTerm = event.getQueryStringParameter('term')

  const cachedResults = cache.get(searchTerm)
  if (cachedResults) {
    LoggerFactory.logger.debug({ msg: 'cache hit', results: cachedResults })
    return cachedResults
  }

  const searchResponse = await search(searchTerm)
  LoggerFactory.logger.debug({ searchResponse })

  // Store the search results in the cache for 1 hour
  cache.set(searchTerm, searchResponse)

  LoggerFactory.logger.debug({ msg: 'cache miss', searchResponse })
  return searchResponse
}

export const handler = createHandlerContext(eventHandler)
