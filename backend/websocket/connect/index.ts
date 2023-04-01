import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda'
import { CORS_HEADERS } from '../cors'

export async function handler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log(
    `Connection established for connectionId: ${event.requestContext.connectionId}`,
  )
  return {
    statusCode: 200,
    body: 'Connected',
    headers: CORS_HEADERS,
  }
}