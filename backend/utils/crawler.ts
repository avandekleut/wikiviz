import * as vis from 'vis'
import { Graph } from './graph'
import { getPageData, PageData } from './pagedata'
import { wikipediaSummaryAndLinks } from './wiki'

export type CrawlerCallback = (graph: Graph) => void | Promise<void>

type CrawlerStrategy = 'wikijs' | 'cheerio'

export class Crawler {
  public readonly graph: Graph
  constructor(private readonly strategy: CrawlerStrategy = 'cheerio') {
    this.graph = new Graph()
  }

  async crawl(
    wikid: string,
    depth: number,
    branchingFactor = 4,
    callback?: CrawlerCallback,
  ): Promise<void> {
    if (depth === 0) {
      return
    }

    console.time('pageData')
    const pageData =
      this.strategy === 'wikijs'
        ? await getPageData(wikid)
        : await wikipediaSummaryAndLinks({
            title: wikid,
            numLinks: branchingFactor,
          })
    console.log(pageData)
    console.timeEnd('pageData')

    this.graph.nodes.add(this.pageDataToNode(pageData))

    if (callback) {
      callback(this.graph)
    }

    const links = pageData.links
    for (const link of links.slice(0, branchingFactor)) {
      this.graph.edges.add({ from: wikid, to: link, id: `${wikid} -> ${link}` })

      await this.crawl(link, depth - 1, branchingFactor, callback)
    }
  }

  private pageDataToNode(pageData: PageData): vis.Node {
    return {
      id: pageData.wikid,
      label: `
          <div>
            <img src="${pageData.mainImage}" width="50" height="50">
            <p>${pageData.summary}</p>
          </div>
        `,
      shape: 'image',
      image: pageData.mainImage,
    }
  }
}
