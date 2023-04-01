import * as vis from 'vis'
import { Graph } from './graph'
import { getPageData, PageData } from './pagedata'

export type CrawlerCallback = (graph: Graph) => void | Promise<void>

export class Crawler {
  public readonly graph: Graph
  constructor() {
    this.graph = new Graph()
  }

  async crawl(
    wikid: string,
    depth: number,
    callback?: CrawlerCallback,
  ): Promise<void> {
    if (depth === 0) {
      return
    }

    const pageData = await getPageData(wikid)
    console.log(`Page data for "${wikid}":`, pageData)

    this.graph.nodes.add(this.pageDataToNode(pageData))

    if (callback) {
      await callback(this.graph)
    }

    const links = pageData.links
    for (const link of links) {
      this.graph.edges.add(wikid, link)
      await this.crawl(link, depth - 1)
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
