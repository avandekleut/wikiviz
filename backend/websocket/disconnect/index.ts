import {
  APIGatewayProxyResultV2,
  APIGatewayProxyWebsocketEventV2,
} from 'aws-lambda'

export async function disconnectHandler(
  event: APIGatewayProxyWebsocketEventV2,
): Promise<APIGatewayProxyResultV2> {
  console.log(
    `Connection closed for connectionId: ${event.requestContext.connectionId}`,
  )
  return {
    statusCode: 200,
    body: 'Disconnected',
  }
}
