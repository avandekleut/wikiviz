import { LoggerFactory } from './logger'
import { PageData } from './pagedata'
import { wikipediaSummaryAndLinks as getWikipediaSummaryAndLinks } from './wiki'

export type CrawlerCallback = (data: PageData) => void | Promise<void>

type CrawlerParams = {
  depth: number
  branchingFactor: number
  callback?: CrawlerCallback
}

const visitedWikids: Record<string, PageData> = {}

export class Crawler {
  constructor(public numVisited = 0) {}

  async crawl(
    wikid: string,
    { depth, branchingFactor, callback }: CrawlerParams,
  ): Promise<void> {
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
        return
      }
    }

    if (callback) {
      await callback(pageData)
      LoggerFactory.logger.debug({ pageData, msg: 'callback executed' })
    }

    this.numVisited += 1

    if (depth > 0) {
      const children = pageData.children.slice(0, branchingFactor)
      for (const child of children) {
        await this.crawl(child, { depth: depth - 1, branchingFactor, callback })
      }
    }
  }
}
