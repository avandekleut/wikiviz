import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { HttpError } from './http-error';

export type StringRecord = Record<string, string | undefined>;

export interface HttpEvent {
  get body(): string;

  get headers(): StringRecord;

  getHeader(name: string, default_?: string): string;

  get queryStringParameters(): StringRecord;

  getQueryStringParameter(name: string, default_?: string): string;

  get pathParameters(): StringRecord;

  getPathParameter(name: string, default_?: string): string;

  get cookies(): Array<string>;
}

/**
 * Provides clean access to base properties of APIGatewayProxyEventV2,
 * throwing `HttpError(400, message)` along the way if a property is inaccessible.
 */
export class ApiGatewayHttpEvent implements HttpEvent {
  constructor(private readonly event: APIGatewayProxyEventV2) {}
  get pathParameters(): StringRecord {
    const pathParameters = this.event.pathParameters;
    if (pathParameters === undefined) {
      throw new HttpError(400, `Missing path parameters`);
    }
    return pathParameters;
  }
  getPathParameter(name: string, default_: string): string {
    const pathParameter = this.pathParameters[name];
    if (pathParameter === undefined) {
      if (default_) {
        return default_;
      }
      throw new HttpError(400, `Missing path parameter: ${name}`);
    }
    return pathParameter;
  }

  getHeader(name: string, default_: string): string {
    const header = this.headers[name];
    if (header === undefined) {
      if (default_) {
        return default_;
      }
      throw new HttpError(400, `Missing header: ${name}`);
    }
    return header;
  }
  getQueryStringParameter(name: string, default_: string): string {
    const queryStringParameter = this.queryStringParameters[name];
    if (queryStringParameter === undefined) {
      if (default_) {
        return default_;
      }
      throw new HttpError(400, `Missing query string parameter: ${name}`);
    }
    return queryStringParameter;
  }

  get cookies(): Array<string> {
    if (this.event.cookies === undefined) {
      throw new HttpError(400, `Missing request cookies.`);
    }
    return this.event.cookies;
  }

  get body(): string {
    if (this.event.body === undefined) {
      throw new HttpError(400, `Missing request body.`);
    }
    return this.event.body;
  }

  get headers() {
    const headers = this.event.headers;
    if (headers === undefined) {
      throw new HttpError(400, `Missing request headers.`);
    }
    return headers;
  }

  get queryStringParameters(): StringRecord {
    const queryStringParameters = this.event.queryStringParameters;
    if (queryStringParameters === undefined) {
      throw new HttpError(400, `Missing query string parameters.`);
    }
    return queryStringParameters;
  }
}

export function getHttpEvent(event: any): HttpEvent {
  return new ApiGatewayHttpEvent(event);
}
