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
    const queue: { wikid: string; depth: number }[] = []

    queue.push({ wikid, depth })

    while (queue.length > 0) {
      const { wikid, depth } = queue.shift()!

      let pageData: PageData

      if (visitedWikids[wikid]) {
        console.log({ wikid, msg: 'cache hit' })
        pageData = visitedWikids[wikid]
      } else {
        console.log({ wikid, msg: 'cache miss' })
        try {
          pageData = await getWikipediaSummaryAndLinks(wikid)
          visitedWikids[wikid] = pageData
        } catch (err) {
          console.warn({ err, msg: 'could not fetch data from wikipedia' })
          continue
        }
      }

      if (callback) {
        await callback(pageData)
        console.log({ wikid, msg: 'callback executed' })
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
