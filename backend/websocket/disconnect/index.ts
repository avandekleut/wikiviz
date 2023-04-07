import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda'
import { CORS_HEADERS } from '../cors'

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log(
    `Connection closed for connectionId: ${event.requestContext.connectionId}`,
  )
  return {
    statusCode: 200,
    body: 'Disconnected',
    headers: CORS_HEADERS,
  }
}
