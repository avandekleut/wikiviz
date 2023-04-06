import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda'
import { LoggerFactory } from '../../utils/logger'
import { CORS_HEADERS } from '../cors'

export async function handler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  LoggerFactory.logger.debug(
    `Connection established for connectionId: ${event.requestContext.connectionId}`,
  )
  return {
    statusCode: 200,
    body: 'Connected',
    headers: CORS_HEADERS,
  }
}
