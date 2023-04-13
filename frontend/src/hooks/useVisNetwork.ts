import { useEffect, useRef } from 'react'
import { DataSet, Edge, Network, Node, Options } from 'vis'
import { PageData } from '../../../backend'

type Props = {
  nodes: PageDataNode[]
  edges: Edge[]
}

export interface PageDataNode extends Node {
  pageData: PageData
}

export const useVisNetwork = ({ nodes, edges }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network>()

  const nodesRef = useRef<DataSet<PageDataNode>>(
    new DataSet<PageDataNode>(nodes),
  )
  const edgesRef = useRef<DataSet<Edge>>(new DataSet<Edge>(edges))

  useEffect(() => {
    if (containerRef.current && !networkRef.current) {
      const options: Options = {
        configure: {
          enabled: false,
        },
        edges: {
          color: {
            inherit: true,
          },
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.5, // controls the size of the arrowhead
            },
          },
          arrowStrikethrough: true,
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
