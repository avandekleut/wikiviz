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
  async crawl(
    wikid: string,
    { depth, branchingFactor, callback }: CrawlerParams,
  ): Promise<void> {
    let pageData: PageData

    if (visitedWikids[wikid]) {
      console.log({ wikid, msg: 'cache hit' })
      pageData = visitedWikids[wikid]
    } else {
      console.log({ wikid, msg: 'cache miss' })
      try {
        const wikipediaSummaryAndLinks = await getWikipediaSummaryAndLinks(
          wikid,
        )
        pageData = { ...wikipediaSummaryAndLinks, crawlInfo: { depth } }
        visitedWikids[wikid] = pageData
      } catch (err) {
        console.warn({ err, msg: 'could not fetch data from wikipedia' })
        return
      }
    }

    if (callback) {
      await callback(pageData)
      console.log({ wikid, msg: 'callback executed' })
    }

    if (depth > 0) {
      const children = pageData.children.slice(0, branchingFactor)
      for (const child of children) {
        await this.crawl(child, { depth: depth - 1, branchingFactor, callback })
      }
    }
  }
}
