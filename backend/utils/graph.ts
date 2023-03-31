import * as vis from 'vis'

export class Graph {
  constructor(
    readonly nodes = new vis.DataSet<vis.Node>(),
    readonly edges = new vis.DataSet<vis.Edge>(),
  ) {}
}
