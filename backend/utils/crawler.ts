import { CrawlerEvent, CrawlerEventData } from './crawler-event'
import { LoggerFactory } from './logger'
import { PageData } from './pagedata'
import { wikipediaSummaryAndLinks as getWikipediaSummaryAndLinks } from './wiki'

export interface CrawlerEventPageData extends CrawlerEventData<PageData> {}

export type CrawlerCallback = (
  event: CrawlerEvent<PageData | undefined>,
) => void | Promise<void>

type CrawlerParams = {
  depth: number
  branchingFactor: number
  callback?: CrawlerCallback
}

const visitedWikids: Record<string, PageData> = {}

export class Crawler {
  async crawl(
    wikid: string,
    { depth, branchingFactor, callback }: CrawlerParams,
  ): Promise<void> {
    const queue: { wikid: string; depth: number }[] = [{ wikid, depth }]

    while (queue.length > 0) {
      const { wikid, depth } = queue.shift()!
      let pageData: PageData

      const crawlData = { wikid, depth, branchingFactor }

      if (visitedWikids[wikid]) {
        LoggerFactory.logger.debug({ crawlData, msg: 'cache hit' })
        pageData = visitedWikids[wikid]
      } else {
        LoggerFactory.logger.debug({ crawlData, msg: 'cache miss' })
        try {
          pageData = await getWikipediaSummaryAndLinks(wikid)
          visitedWikids[wikid] = pageData
        } catch (err) {
          console.warn({ err, msg: 'could not fetch data from wikipedia' })
          continue
        }
      }

      if (callback) {
        await callback({
          type: 'data',
          data: pageData,
        })
        LoggerFactory.logger.debug({ pageData, msg: 'callback executed' })
      }

      if (depth > 0) {
        const children = pageData.children.slice(0, branchingFactor)
        for (const child of children) {
          queue.push({ wikid: child, depth: depth - 1 })
        }
      }
    }
  }
}
