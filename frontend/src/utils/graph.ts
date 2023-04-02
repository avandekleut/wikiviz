import * as vis from 'vis'
import { PageData } from '../../../backend'

export class Graph {
  constructor(
    readonly nodes = new vis.DataSet<vis.Node>(),
    readonly edges = new vis.DataSet<vis.Edge>(),
  ) {}

  static pageDataToNode(pageData: PageData): vis.Node {
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
