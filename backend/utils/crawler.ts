import { PageData } from './pagedata'
import { wikipediaSummaryAndLinks as getWikipediaSummaryAndLinks } from './wiki'

export type CrawlerCallback = (data: PageData) => void | Promise<void>

type CrawlerParams = {
  depth?: number
  branchingFactor?: number
  callback?: CrawlerCallback
}

const visitedWikids: Record<string, PageData> = {}

export class Crawler {
  async crawl(
    wikid: string,
    {
      depth = 6,
      branchingFactor = 4,
      callback = (data) => console.log(data),
    }: CrawlerParams = {},
  ): Promise<void> {
    if (depth === 0) {
      return
    }

    let pageData: PageData

    if (visitedWikids[wikid]) {
      // fetch pageData from in-memory cache
      console.log({ wikid, msg: 'cache hit' })
      pageData = visitedWikids[wikid]
      return
    } else {
      // fetch pageData fresh from wikipedia
      console.log({ wikid, msg: 'cache hit' })
      pageData = await getWikipediaSummaryAndLinks(wikid)
    }

    // run callback only for first visit
    if (callback) {
      callback(pageData)
    }

    visitedWikids[wikid] = pageData

    const children = pageData.children
    for (const child of children.slice(0, branchingFactor)) {
      await this.crawl(child, {
        depth: depth - 1,
        branchingFactor,
        callback,
      })
    }
  }
}
