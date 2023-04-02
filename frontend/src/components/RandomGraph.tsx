import React from 'react'
import { useVisNetwork } from '../hooks/useVisNetwork'


const Graph: React.FC = () => {
  const { containerRef, nodesRef, edgesRef } = useVisNetwork({
    nodes: [],
    edges: [],
  })

  const handleAddNode = () => {
    const numNodes = nodesRef.current.length
    const newNodeId = numNodes + 1
    nodesRef.current.add({ id: newNodeId, label: `Node ${newNodeId}` })
  }

  const handleAddEdge = () => {
    const numEdges = edgesRef.current.length
    const newEdgeId = numEdges + 1

    // Choose two random nodes to connect with a new edge
    const nodeIds = nodesRef.current.getIds()
    const fromNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]
    const toNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]

    edgesRef.current.add({ id: newEdgeId, from: fromNodeId, to: toNodeId })
  }

  return (
    <div>
      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
      <div>
        <button onClick={handleAddNode}>Add Node</button>
        <button onClick={handleAddEdge}>Add Edge</button>
      </div>
    </div>
  )
}

export default Graph
