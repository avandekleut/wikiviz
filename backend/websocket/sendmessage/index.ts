import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'
import { Crawler, CrawlerCallback } from '../../utils/crawler'
import { CrawlerEvent } from '../../utils/crawler-event'
import { HttpError } from '../../utils/http-error'
import { LoggerFactory } from '../../utils/logger'
import { CORS_HEADERS } from '../cors'

// type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type CrawlParams = {
  wikid: string
  depth: number
  branchingFactor: number
}

export type WebSocketMessage<T> = {
  action: 'sendmessage' // TODO: pull this out into a type or const
  data: T // must validate all properties
}

export type CrawlMessage = WebSocketMessage<CrawlParams>

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

  // TODO: Extract schema validation
  if (event.body === undefined) {
    throw new HttpError(400, `missing: body.`)
  }
  const { data }: Partial<CrawlMessage> = JSON.parse(event.body)

  if (data === undefined) {
    throw new HttpError(400, `body missing required property: data`)
  }

  const { wikid, depth, branchingFactor } = data
  if (wikid === undefined) {
    throw new HttpError(400, `data missing required property: wikid`)
  }

  const crawler = new Crawler()

  try {
    const callback: CrawlerCallback = async (event) => {
      await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(event),
        })
        .promise()
    }

    const openEvent: CrawlerEvent = {
      type: 'open',
    }
    await apiGatewayManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(openEvent),
      })
      .promise()

    await crawler.crawl(wikid, { callback, depth, branchingFactor })

    const closeEvent: CrawlerEvent = {
      type: 'close',
    }
    await apiGatewayManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(closeEvent),
      })
      .promise()

    LoggerFactory.logger.info(`Finished crawling ${wikid} with depth ${depth}`)

    return {
      statusCode: 200,
      body: 'Messages sent successfully.',
      headers: CORS_HEADERS,
    }
  } catch (error) {
    LoggerFactory.logger.error({
      error,
      depth,
      msg: `Error while crawling ${wikid} with depth ${depth}:`,
    })

    // Return an error response to the client
    return {
      statusCode: 500,
      body: 'Failed to send messages to client.',
      headers: CORS_HEADERS,
    }
  }
}
