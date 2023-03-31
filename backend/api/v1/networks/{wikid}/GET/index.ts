import { Crawler } from '../../../../../utils/crawl'
import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../../utils/handler-context'
import { HttpEvent } from '../../../../../utils/http-event'
import { LoggerFactory } from '../../../../../utils/logger'

const eventHandler: HttpEventHandler<{}> = async (event: HttpEvent) => {
  const wikid = event.getPathParameter('wikid')
  const depth = event.getQueryStringParameter<number>('depth')

  try {
    const crawler = new Crawler()
    await crawler.crawl(wikid, depth)

    LoggerFactory.logger.info(`Finished crawling ${wikid} with depth ${depth}`)
  } catch (err) {
    LoggerFactory.logger.error({
      err,
      depth,
      msg: `Error while crawling ${wikid} with depth ${depth}:`,
    })
  }

  return {}
}

export const handler = createHandlerContext(eventHandler)
