import { useState } from 'react'
import { PageData } from '../../../backend'
import { config } from '../env'
import { useWebSocket } from '../hooks/useWebsocket'
import { Graph } from '../utils/graph'

import 'vis-network/styles/vis-network.css'
import useVisNetwork from '../hooks/useNetwork'

function validatePageData(pageData: Partial<PageData>): pageData is PageData {
  if (pageData.children === undefined) {
    return false
  }
  if (pageData.wikid === undefined) {
    return false
  }
  if (pageData.summary === undefined) {
    return false
  }
  return true
}

export const WebsocketDebugger = () => {
  const [inputValue, setInputValue] = useState('')
  const { containerRef, nodesRef, edgesRef } = useVisNetwork({ nodes: [], edges: [] })
  const { messages, send } = useWebSocket({
    url: 'wss://flvn62nuq8.execute-api.us-east-1.amazonaws.com/dev',
    handlers: {
      onMessage: (event) => {
        const pageData: Partial<PageData> = JSON.parse(event.data)
        if (validatePageData(pageData)) {
          const { wikid, children } = pageData
          const node = Graph.pageDataToNode(pageData)
          console.log(`Added to nodes`, node)

          try {
            nodesRef.current.add(node)
          } catch (error) {
            console.error(`Encountered error while adding node to graph`, error)
          }
          for (const child of children) {
            try {
              const edge = {
                from: wikid,
                to: child,
                id: `${wikid} -> ${child}`,
              }
              edgesRef.current.add(edge)
            } catch (error) {
              console.error(
                `Encountered error while adding edge to graph`,
                error,
              )
            }
          }
        } else {
          console.warn(`pageData failed validation`, pageData)
        }
      },
    },
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
      {networkContainer}
      <ul>
        {messages.reverse().map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
