import { PageData } from './pagedata'
import { wikipediaSummaryAndLinks } from './wiki'

export type CrawlerCallback = (data: PageData) => void | Promise<void>

type CrawlerParams = {
  depth?: number
  branchingFactor?: number
  callback?: CrawlerCallback
}

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

    const pageData = await wikipediaSummaryAndLinks(wikid)

    if (callback) {
      callback(pageData)
    }

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
