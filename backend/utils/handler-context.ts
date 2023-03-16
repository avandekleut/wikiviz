import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { HttpError } from "./http-error";
import { getHttpEvent, HttpEvent } from "./http-event";
import { JsonObject } from "./json-types";

export type APIGatewayProxyStructuredResultV2Headers =
  | {
      [header: string]: string | number | boolean;
    }
  | undefined;

export type ContentType = "application/json";

export type HttpEventHandler = (event: HttpEvent) => Promise<JsonObject>;

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
export function createHandlerContext(
  eventHandler: HttpEventHandler,
  successStatusCode = 200,
  headers: APIGatewayProxyStructuredResultV2Headers = {},
  contentType: ContentType = "application/json"
) {
  const contentTypeHeader: Record<string, ContentType> = {
    "content-type": contentType,
  };

  const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
      const httpEvent = getHttpEvent(event);
      const result = await eventHandler(httpEvent);

      return {
        statusCode: successStatusCode,
        body: JSON.stringify(result),
        headers: {
          ...headers,
          ...contentTypeHeader,
        },
      };
    } catch (err) {
      if (err instanceof HttpError) {
        return {
          statusCode: err.status,
          body: JSON.stringify({ message: err.message }),
          headers: {
            "content-type": "application/json",
          },
        };
      }

      throw err;
    }
  };
  return handler;
}
