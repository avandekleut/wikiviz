import { ConvertiblePrimitive } from '../get-with-default'
import { ApiGatewayHttpEvent } from './ApiGatewayHttpEvent'

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

export function getHttpEvent(event: any): HttpEvent {
  return new ApiGatewayHttpEvent(event)
}
