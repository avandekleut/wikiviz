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
      const { wikid, children }: PageData = JSON.parse(event.data)
      console.log('onMessage', { wikid, nodesRef, networkRef })
      try {
        nodesRef.current.add({ id: wikid, label: wikid })
      } catch (err) {
        console.warn(err)
      }
      for (const child of children) {
        try {
          nodesRef.current.add({ id: child, label: child })
        } catch (err) {
          console.warn(err)
        }
        try {
          edgesRef.current.add({
            from: wikid,
            to: child,
            id: `${wikid} -> ${child}`,
          })
        } catch (err) {
          console.warn(err)
        }
      }
      // networkRef.current?.fit()
      // networkRef.current?.redraw()
    },
    [networkRef, nodesRef],
  )

  const handlers = useMemo<WebSocketHandlers>(() => {
    return {
      onMessage: onMessage,
    }
  }, [onMessage])

  const { send } = useWebSocket({
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

  return (
    <div>
      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      {/* <ul>
        {messages.reverse().map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul> */}
    </div>
  )
}

export default Graph
