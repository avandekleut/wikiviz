import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'
import { Crawler, CrawlerCallback } from '../../utils/crawler'
import { Graph } from '../../utils/graph'
import { HttpError } from '../../utils/http-error'
import { LoggerFactory } from '../../utils/logger'
import { CORS_HEADERS } from '../cors'

// type OptionalProperties<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type CrawlParams = {
  wikid: string
  depth: number
  branchingFactor: number
}

// export type CrawlRequest = OptionalProperties<
//   CrawlParams,
//   'depth' | 'branchingFactor'
// >

type WebSocketMessage<T = string> = {
  action: 'sendmessage' // TODO: pull this out into a type or const
  data: T
}

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

  if (event.body === undefined) {
    throw new HttpError(400, `Missing body.`)
  }
  const { data }: WebSocketMessage<Partial<CrawlParams>> = JSON.parse(
    event.body,
  )

  const { wikid, depth, branchingFactor } = data
  if (wikid === undefined) {
    throw new HttpError(400, `Body missing required property: wikid.`)
  }

  const graph = new Graph()
  const crawler = new Crawler()

  try {
    const callback: CrawlerCallback = async (pageData) => {
      graph.nodes.add(graph.pageDataToNode(pageData))

      await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify(pageData),
        })
        .promise()

      for (const child of pageData.children) {
        graph.edges.add({
          from: wikid,
          to: child,
          id: `${wikid} -> ${child}`,
        })
      }
    }

    await crawler.crawl(wikid, { callback, depth, branchingFactor })

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
