import fetch, { RequestInit, Response } from 'node-fetch'
import { LoggerFactory } from './logger'

type FetchDataWithRetriesParams = {
  retries?: number
  retryDelay?: number
  factor?: number
}

export async function fetchDataWithRetries(
  url: string,
  options: RequestInit | undefined = undefined,
  {
    retries = 3,
    retryDelay = 200,
    factor = 2,
  }: FetchDataWithRetriesParams = {},
): Promise<Response> {
  const response = await fetch(url, options)

  if (response.status === 429 && retries > 0) {
    LoggerFactory.logger.warn({
      url,
      remainingRetries: retries,
      msg: `Rate limit exceeded`,
    })
    const retryAfter =
      parseInt(response.headers.get('Retry-After') ?? '0') * 1000 || retryDelay
    await new Promise((resolve) => setTimeout(resolve, retryAfter))

    return fetchDataWithRetries(url, options, {
      retries: retries - 1,
      retryDelay: retryDelay * factor,
      factor,
    })
  }

  return response
}
