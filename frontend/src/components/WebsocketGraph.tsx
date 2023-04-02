import React, { useCallback, useMemo, useState } from 'react'
import { PageData } from '../../../backend'
import { config } from '../env'
import { useVisNetwork } from '../hooks/useVisNetwork'
import { useWebSocket, WebSocketHandlers } from '../hooks/useWebsocket'

const Graph: React.FC = () => {
  const [inputValue, setInputValue] = useState('')

  const { containerRef, nodesRef, edgesRef } = useVisNetwork({
    nodes: [],
    edges: [],
  })

  const onMessage = useCallback<NonNullable<WebSocketHandlers['onMessage']>>(
    (event) => {
      try {
        const data = JSON.parse(event.data)
      } catch (err) {
        console.warn(`Could not parse event.data: ${event.data}`)
      }

      const { wikid, children }: Partial<PageData> = JSON.parse(event.data)
      if (wikid === undefined) {
        console.warn(`wikid undefined`)
        return
      }

      if (children === undefined) {
        console.warn(`children undefined`)
        return
      }

      console.log('onMessage', { wikid, nodesRef })
      try {
        nodesRef.current.add({ id: wikid, label: wikid })
      } catch (err) {
        console.warn(err)
      }
      for (const child of children.slice(
        0,
        config.CRAWL_DEFAULT_BRANCHING_FACTOR,
      )) {
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
    },
    [nodesRef, edgesRef],
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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <div ref={containerRef} style={{ width: '800px', height: '600px' }} />
    </div>
  )
}

export default Graph
