import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
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
// TODO: use HttpEventHandler
// const eventHandler: HttpEventHandler<{}> = async (event: HttpEvent) => {

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const searchTerm = event.queryStringParameters?.term

  if (!searchTerm) {
    return {
      statusCode: 400,
      body: 'Missing search term',
    }
  }

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
        searchTerm,
      )}`,
    )
    const data: WikipediaSearchResponse = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: 'Internal server error',
    }
  }
}
