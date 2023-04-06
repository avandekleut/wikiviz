import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as NodeCache from 'node-cache'
import fetch from 'node-fetch'

interface WikipediaSearchResponse {
  query: {
    search: {
      ns: number
      title: string
      snippet: string
      size: number
      wordcount: number
      timestamp: string
    }[]
  }
}

// Create a cache with a TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 })

async function searchHandler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const searchTerm = event.queryStringParameters?.term
  if (!searchTerm) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Search term is missing' }),
    }
  }

  const cachedResults = cache.get(searchTerm)
  if (cachedResults) {
    return {
      statusCode: 200,
      body: JSON.stringify(cachedResults),
    }
  }

  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
    searchTerm,
  )}`

  const response = await fetch(url)
  const data: WikipediaSearchResponse = await response.json()

  const searchResults = data.query.search.map((result) => ({
    title: result.title,
    snippet: result.snippet,
  }))

  // Store the search results in the cache for 1 hour
  cache.set(searchTerm, searchResults)

  return {
    statusCode: 200,
    body: JSON.stringify(searchResults),
  }
}

export { searchHandler }
