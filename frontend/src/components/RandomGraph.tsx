import React, { useEffect } from 'react'
import { useVisNetwork } from '../hooks/useVisNetwork'

const Graph: React.FC = () => {
  const { containerRef, networkRef, nodesRef, edgesRef } = useVisNetwork({
    nodes: [],
    edges: [],
  })

  const addRandomNode = () => {
    console.log(`handleAddNode`, nodesRef)
    const numNodes = nodesRef.current.length
    const newNodeId = numNodes + 1
    nodesRef.current.add({ id: newNodeId, label: `Node ${newNodeId}` })

    if (numNodes === 0) {
      networkRef.current?.fit()
    } else {
      const nodeIds = nodesRef.current.getIds()
      const fromNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]

      edgesRef.current.add({
        id: `${fromNodeId} -> ${newNodeId}`,
        from: fromNodeId,
        to: newNodeId,
      })
    }
  }

  const addRandomEdge = () => {
    const numEdges = edgesRef.current.length
    const newEdgeId = numEdges + 1

    // Choose two random nodes to connect with a new edge
    const nodeIds = nodesRef.current.getIds()
    const fromNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
    const toNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]

    edgesRef.current.add({ id: newEdgeId, from: fromNodeId, to: toNodeId })
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Math.random() < 0.2) {
        addRandomEdge()
      } else {
        addRandomNode()
      }
    }, 500)

    setTimeout(() => {
      clearInterval(intervalId)
    }, 20_000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div>
      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
      <div>
        <button onClick={addRandomNode}>Add Node</button>
        <button onClick={addRandomEdge}>Add Edge</button>
      </div>
    </div>
  )
}

export default Graph
