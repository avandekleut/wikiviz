import { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { HttpError } from './http-error'
import { getHttpEvent, HttpEvent } from './http-event'
import { JsonObject } from './json-types'

import * as crypto from 'crypto'
import { LoggerFactory } from './logger'

export type APIGatewayProxyStructuredResultV2Headers =
  | {
      [header: string]: string | number | boolean
    }
  | undefined

export type ContentType = 'application/json'

export type HttpEventHandler<T extends JsonObject> = (
  event: HttpEvent,
) => Promise<T>

type HandlerContext = {
  successStatusCode?: number
  headers?: APIGatewayProxyStructuredResultV2Headers
  contentType?: ContentType
  cacheDurationSeconds?: number
}

/**
 * Convenience wrapper for error handling. This logic is shared by all API Gateway
 * Lambda HTTP integrations.
 *
 * @param eventHandler Main code to run, relies on HttpEvent wrapper for simplicity
 * @param successStatusCode @default 200 In event of success.
 * @param headers Headers for response.
 * @param contentType @default 'application/json' Content type for response.
 * @returns
 */
export function createHandlerContext<T extends JsonObject>(
  eventHandler: HttpEventHandler<T>,
  {
    successStatusCode = 200,
    headers = {},
    contentType = 'application/json',
    cacheDurationSeconds = 0,
  }: HandlerContext = {}, // default argument = {} to make it "optional"
) {
  const contentTypeHeader: Record<string, ContentType> = {
    'content-type': contentType,
  }

  const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
      const httpEvent = getHttpEvent(event)

      const result = await eventHandler(httpEvent)

      const cacheHeaders =
        cacheDurationSeconds !== undefined
          ? {
              'Cache-Control': `public, max-age=${cacheDurationSeconds}`,
              ETag: crypto
                .createHash('sha256')
                .update(JSON.stringify(result))
                .digest('hex'),
            }
          : ({} as Record<string, string>)

      return {
        statusCode: successStatusCode,
        body: JSON.stringify(result),
        headers: {
          ...headers,
          ...contentTypeHeader,
          ...cacheHeaders,
        },
      }
    } catch (err) {
      LoggerFactory.logger.error({ err })
      if (err instanceof HttpError) {
        return {
          statusCode: err.status,
          body: JSON.stringify({ message: err.message }),
          headers: {
            'content-type': 'application/json',
          },
        }
      }

      throw err
    }
  }

  return handler
}
