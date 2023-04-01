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
    branchingFactor = 4,
    callback?: CrawlerCallback,
  ): Promise<void> {
    if (depth === 0) {
      return
    }

    console.time('pageData')
    const pageData = await getPageData(wikid)
    console.timeEnd('pageData')

    console.time('add nodes')
    this.graph.nodes.add(this.pageDataToNode(pageData))
    console.timeEnd('add nodes')

    console.time('callback')
    if (callback) {
      callback(this.graph)
    }
    console.timeEnd('callback')

    const links = pageData.links
    for (const link of links.slice(0, branchingFactor)) {
      console.time('add edges')
      this.graph.edges.add({ from: wikid, to: link, id: `${wikid} -> ${link}` })
      console.timeEnd('add edges')

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
