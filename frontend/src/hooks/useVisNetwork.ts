import { useEffect, useRef } from 'react'
import { DataSet, Edge, Network, Node } from 'vis'

type Props = {
  nodes: Node[]
  edges: Edge[]
}

export const useVisNetwork = ({ nodes, edges }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network>()
  const nodesRef = useRef<DataSet<Node>>(new DataSet<Node>(nodes))
  const edgesRef = useRef<DataSet<Edge>>(new DataSet<Edge>(edges))

  useEffect(() => {
    if (containerRef.current && !networkRef.current) {
      const options = {}
      networkRef.current = new Network(
        containerRef.current,
        { nodes: nodesRef.current, edges: edgesRef.current },
        options,
      )
    }

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = undefined
      }
    }
  }, [containerRef])

  return { containerRef, networkRef, nodesRef, edgesRef }
}
