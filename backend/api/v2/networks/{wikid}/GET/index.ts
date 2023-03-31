import { APIGatewayProxyWebsocketHandlerV2 } from 'aws-lambda'
import { ApiGatewayManagementApi } from 'aws-sdk'

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (
  event,
  context,
) => {
  // Extract the WebSocket connection ID from the event

  const endpoint =
    event.requestContext.domainName + '/' + event.requestContext.stage
  const connectionId = event.requestContext.connectionId

  const apiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: endpoint,
  })

  try {
    // Send multiple messages back to the client
    for (let i = 1; i <= 10; i++) {
      // Construct the message payload
      const payload = {
        message: `Message ${i}`,
      }

      // Send the message to the client
      await apiGatewayManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({ message: 'Hello, client!' }),
        })
        .promise()

      // Sleep for a short time to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Return a successful response to the client
    return {
      statusCode: 200,
      body: 'Messages sent successfully.',
    }
  } catch (error) {
    console.error(`Failed to send messages to client: ${error}`)

    // Return an error response to the client
    return {
      statusCode: 500,
      body: 'Failed to send messages to client.',
    }
  }
}
