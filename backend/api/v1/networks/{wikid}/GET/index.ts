import { Crawler, CrawlerCallback } from '../../../../../utils/crawler'
import { Graph } from '../../../../../utils/graph'
import {
  createHandlerContext,
  HttpEventHandler,
} from '../../../../../utils/handler-context'
import { HttpEvent } from '../../../../../utils/http-event'
import { LoggerFactory } from '../../../../../utils/logger'

const eventHandler: HttpEventHandler<{}> = async (event: HttpEvent) => {
  const wikid = event.getPathParameter('wikid')
  const depth = event.getQueryStringParameter('depth', 2)
  const branchingFactor = event.getQueryStringParameter('branching_factor', 4)

  const graph = new Graph()
  const crawler = new Crawler()

  try {
    const callback: CrawlerCallback = (pageData) => {
      graph.nodes.add(graph.pageDataToNode(pageData))

      for (const child of pageData.children) {
        graph.edges.add({
          from: wikid,
          to: child,
          id: `${wikid} -> ${child}`,
        })
      }
    }

    await crawler.crawl(wikid, { callback, depth, branchingFactor })

    LoggerFactory.logger.info(`Finished crawling ${wikid} with depth ${depth}`)
  } catch (err) {
    LoggerFactory.logger.error({
      err,
      depth,
      msg: `Error while crawling ${wikid} with depth ${depth}:`,
    })
  }

  return {
    graph,
  }
}

export const handler = createHandlerContext(eventHandler)
