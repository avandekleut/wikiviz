import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'
import { Crawler, CrawlerCallback } from '../../utils/crawl'
import { get } from '../../utils/get-with-default'
import { LoggerFactory } from '../../utils/logger'
import { CORS_HEADERS } from '../cors'

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  context,
) => {
  LoggerFactory.logger.debug({ event, context })

  // Extract the WebSocket connection ID from the event
  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage
  const connectionId = event.requestContext.connectionId

  const apiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  })

  try {
    const body = JSON.parse(event.body ?? '{}')
    const wikid = body['wikid']
    const depth = get(body['depth'], 3)

    const crawler = new Crawler()

    const callback: CrawlerCallback = async (graph) => {
      await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(graph),
        })
        .promise()
    }

    await crawler.crawl(wikid, depth, callback)

    LoggerFactory.logger.info(`Finished crawling ${wikid} with depth ${depth}`)

    // Return a successful response to the client
    return {
      statusCode: 200,
      body: 'Messages sent successfully.',
      headers: CORS_HEADERS,
    }
  } catch (error) {
    console.error(`Failed to send messages to client: ${error}`)

    // Return an error response to the client
    return {
      statusCode: 500,
      body: 'Failed to send messages to client.',
      headers: CORS_HEADERS,
    }
  }
}
