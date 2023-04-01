import * as vis from 'vis'
import { Graph } from './graph'
import { PageData } from './pagedata'
import { wikipediaSummaryAndLinks } from './wiki'

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

    const pageData = await wikipediaSummaryAndLinks(wikid)
    console.log(pageData)

    this.graph.nodes.add(this.pageDataToNode(pageData))

    if (callback) {
      callback(this.graph)
    }

    const children = pageData.children
    for (const child of children.slice(0, branchingFactor)) {
      this.graph.edges.add({
        from: wikid,
        to: child,
        id: `${wikid} -> ${child}`,
      })

      await this.crawl(child, depth - 1, branchingFactor, callback)
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
