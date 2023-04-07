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
      const options = {
        configure: {
          enabled: false,
        },
        edges: {
          color: {
            inherit: true,
          },
          smooth: {
            enabled: true,
            type: 'dynamic',
          },
        },
        interaction: {
          dragNodes: true,
          hideEdgesOnDrag: false,
          hideNodesOnDrag: false,
        },
        physics: {
          enabled: true,
          stabilization: {
            enabled: true,
            fit: true,
            iterations: 1000,
            onlyDynamicEdges: false,
            updateInterval: 50,
          },
        },
      }
      networkRef.current = new Network(
        containerRef.current,
        { nodes: nodesRef.current, edges: edgesRef.current },
        {
          configure: {
            enabled: false,
          },
          edges: {
            color: {
              inherit: true,
            },
          },
          interaction: {
            dragNodes: true,
            hideEdgesOnDrag: false,
            hideNodesOnDrag: false,
          },
          physics: {
            enabled: true,
            stabilization: {
              enabled: true,
              fit: true,
              iterations: 1000,
              onlyDynamicEdges: false,
              updateInterval: 50,
            },
          },
        },
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
