import * as vis from 'vis'
import { PageData } from './pagedata'

export class Graph {
  constructor(
    readonly nodes = new vis.DataSet<vis.Node>(),
    readonly edges = new vis.DataSet<vis.Edge>(),
  ) {}

  pageDataToNode(pageData: PageData): vis.Node {
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
