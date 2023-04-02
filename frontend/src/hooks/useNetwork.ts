import { useEffect, useRef } from 'react'
import { DataSet, Edge, Network, Node } from 'vis'

type Props = {
  nodes: Node[]
  edges: Edge[]
}

const useVisNetwork = ({ nodes, edges }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network>()
  const nodesRef = useRef<DataSet<Node>>(new DataSet<Node>())
  const edgesRef = useRef<DataSet<Edge>>(new DataSet<Edge>())

  useEffect(() => {
    if (containerRef.current) {
      const options = {}
      networkRef.current = new Network(
        containerRef.current,
        { nodes, edges },
        options,
      )
      nodesRef.current.add(nodes)
      edgesRef.current.add(edges)
    }
  }, [containerRef, nodes, edges])

  const addNode = (node: Node) => {
    nodesRef.current.add(node)
  }

  const addEdge = (edge: Edge) => {
    edgesRef.current.add(edge)
  }

  return { containerRef, addNode, addEdge, nodesRef, edgesRef }
}

export default useVisNetwork
