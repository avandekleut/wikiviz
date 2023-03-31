import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { ConvertiblePrimitive, get } from './get-with-default'
import { HttpError } from './http-error'

export type StringRecord = Record<string, string | undefined>

export interface HttpEvent {
  get body(): string

  get headers(): StringRecord

  getHeader<T extends ConvertiblePrimitive = string>(
    name: string,
    defaultValue?: T,
  ): T

  get queryStringParameters(): StringRecord

  getQueryStringParameter<T extends ConvertiblePrimitive = string>(
    name: string,
    defaultValue?: T,
  ): T

  get pathParameters(): StringRecord

  getPathParameter<T extends ConvertiblePrimitive = string>(
    name: string,
    defaultValue?: T,
  ): T

  get cookies(): Array<string>
}

/**
 * Provides clean access to base properties of APIGatewayProxyEventV2,
 * throwing `HttpError(400, message)` along the way if a property is inaccessible.
 */
export class ApiGatewayHttpEvent implements HttpEvent {
  constructor(private readonly event: APIGatewayProxyEventV2) {}
  get pathParameters(): StringRecord {
    const pathParameters = this.event.pathParameters
    if (pathParameters === undefined) {
      throw new HttpError(400, `Missing path parameters`)
    }
    return pathParameters
  }
  getPathParameter<T extends ConvertiblePrimitive>(
    name: string,
    defaultValue?: T,
  ): T {
    const pathParameter = this.pathParameters[name]
    return get<T>(pathParameter, defaultValue)
  }

  getHeader<T extends ConvertiblePrimitive>(name: string, defaultValue?: T): T {
    const header = this.headers[name]
    return get<T>(header, defaultValue)
  }

  getQueryStringParameter<T extends ConvertiblePrimitive>(
    name: string,
    defaultValue?: T,
  ): T {
    const queryStringParameter = this.queryStringParameters[name]
    return get<T>(queryStringParameter, defaultValue)
  }

  get cookies(): Array<string> {
    if (this.event.cookies === undefined) {
      throw new HttpError(400, `Missing request cookies.`)
    }
    return this.event.cookies
  }

  get body(): string {
    if (this.event.body === undefined) {
      throw new HttpError(400, `Missing request body.`)
    }
    return this.event.body
  }

  get headers() {
    const headers = this.event.headers
    if (headers === undefined) {
      throw new HttpError(400, `Missing request headers.`)
    }
    return headers
  }

  get queryStringParameters(): StringRecord {
    const queryStringParameters = this.event.queryStringParameters
    if (queryStringParameters === undefined) {
      throw new HttpError(400, `Missing query string parameters.`)
    }
    return queryStringParameters
  }
}

export function getHttpEvent(event: any): HttpEvent {
  return new ApiGatewayHttpEvent(event)
}
