import React, { useCallback, useMemo, useState } from 'react'
import { PageData } from '../../../backend'
import { config } from '../env'
import { useVisNetwork } from '../hooks/useVisNetwork'
import { useWebSocket, WebSocketHandlers } from '../hooks/useWebsocket'

const Graph: React.FC = () => {
  const [inputValue, setInputValue] = useState('')

  const { containerRef, networkRef, nodesRef, edgesRef } = useVisNetwork({
    nodes: [],
    edges: [],
  })

  const onMessage = useCallback<NonNullable<WebSocketHandlers['onMessage']>>(
    (event) => {
      const { wikid }: PageData = JSON.parse(event.data)
      console.log('onMessage', { wikid, nodesRef, networkRef })
      try {
        nodesRef.current.add({ id: wikid, label: wikid })
        networkRef.current?.fit()
      } catch (err) {
        console.warn(err)
      }
      networkRef.current?.fit()
      networkRef.current?.redraw()
    },
    [networkRef, nodesRef],
  )

  const handlers = useMemo<WebSocketHandlers>(() => {
    return {
      onMessage: onMessage,
    }
  }, [onMessage])

  const { messages, send } = useWebSocket({
    url: 'wss://flvn62nuq8.execute-api.us-east-1.amazonaws.com/dev',
    handlers,
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    console.log('sendmessage', {
      wikid: inputValue,
      branchingFactor: config.CRAWL_DEFAULT_BRANCHING_FACTOR,
      depth: config.CRAWL_DEFAULT_DEPTH,
    })

    send({
      action: 'sendmessage',
      data: {
        wikid: inputValue,
        branchingFactor: config.CRAWL_DEFAULT_BRANCHING_FACTOR,
        depth: config.CRAWL_DEFAULT_DEPTH,
      },
    })

    setInputValue('')
  }

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

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     if (Math.random() < 0.2) {
  //       addRandomEdge()
  //     } else {
  //       addRandomNode()
  //     }
  //   }, 500)

  //   setTimeout(() => {
  //     clearInterval(intervalId)
  //   }, 20_000)

  //   return () => {
  //     clearInterval(intervalId)
  //   }
  // }, [])

  return (
    <div>
      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
      <div>
        <button onClick={addRandomNode}>Add Node</button>
        <button onClick={addRandomEdge}>Add Edge</button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.reverse().map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  )
}

export default Graph
