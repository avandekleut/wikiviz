import { Request } from 'express'
import * as QueryString from 'qs'
import { ConvertiblePrimitive, get } from '../get-with-default'
import { HttpError } from '../http-error'
import { HttpEvent, StringRecord } from './HttpEvent'

function isParsedQs(queryParam: any): queryParam is QueryString.ParsedQs {
  return (
    typeof queryParam === 'object' &&
    queryParam !== null &&
    !(queryParam instanceof Array)
  )
}

export class ExpressHttpEvent implements HttpEvent {
  constructor(private readonly req: Request) {}

  get cookies(): Array<string> {
    if (this.req.cookies === undefined) {
      throw new HttpError(400, `Missing request cookies.`)
    }
    return this.req.cookies
  }

  get body(): string {
    if (this.req.body === undefined) {
      throw new HttpError(400, `Missing request body.`)
    }
    return this.req.body
  }

  get headers(): StringRecord {
    const headers: StringRecord = {}
    for (const [name, value] of Object.entries(this.req.headers)) {
      if (typeof value === 'string') {
        headers[name] = value
      }
    }
    return headers
  }

  getHeader<T extends ConvertiblePrimitive>(name: string, defaultValue?: T): T {
    const header = this.req.headers[name]
    if (Array.isArray(header)) {
      return get<T>(header[0], defaultValue)
    }
    return get<T>(header, defaultValue)
  }

  get queryStringParameters(): StringRecord {
    const queryStringParameters: StringRecord = {}
    const parsedQueryString = QueryString.parse(this.req.url.split('?')[1])
    for (const [name, value] of Object.entries(parsedQueryString)) {
      if (typeof value === 'string') {
        queryStringParameters[name] = value
      }
    }
    return queryStringParameters
  }

  getQueryStringParameter<T extends ConvertiblePrimitive>(
    name: string,
    defaultValue?: T,
  ): T {
    const queryStringParameter = this.req.query[name]
    if (Array.isArray(queryStringParameter)) {
      const firstQueryStringParameter = queryStringParameter[0]
      if (isParsedQs(firstQueryStringParameter)) {
        throw new HttpError(
          400,
          `Only string-valued query strings supported, got: ${JSON.stringify(
            queryStringParameter,
          )}.`,
        )
      }
      return get<T>(firstQueryStringParameter, defaultValue)
    }
    if (isParsedQs(queryStringParameter)) {
      throw new HttpError(
        400,
        `Only string-valued query strings supported, got: ${JSON.stringify(
          queryStringParameter,
        )}.`,
      )
    }
    return get<T>(queryStringParameter, defaultValue)
  }

  get pathParameters(): StringRecord {
    const pathParameters: StringRecord = {}
    const routeParameters = this.req.params
    for (const [name, value] of Object.entries(routeParameters)) {
      if (typeof value === 'string') {
        pathParameters[name] = value
      }
    }
    return pathParameters
  }

  getPathParameter<T extends ConvertiblePrimitive>(
    name: string,
    defaultValue?: T,
  ): T {
    const pathParameter = this.req.params[name]
    if (Array.isArray(pathParameter)) {
      const firstPathParameter = pathParameter[0]
      if (isParsedQs(firstPathParameter)) {
        throw new HttpError(
          400,
          `Only string-valued path parameters supported, got: ${JSON.stringify(
            pathParameter,
          )}.`,
        )
      }
      return get<T>(firstPathParameter, defaultValue)
    }
    if (isParsedQs(pathParameter)) {
      throw new HttpError(
        400,
        `Only string-valued path parameters supported, got: ${JSON.stringify(
          pathParameter,
        )}.`,
      )
    }
    return get<T>(pathParameter, defaultValue)
  }
}
