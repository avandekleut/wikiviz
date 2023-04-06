import React, { useCallback, useMemo, useState } from 'react'
import { Node } from 'vis'
import { PageData } from '../../../backend'
import { CrawlParameters } from '../hooks/useCrawlParameters'
import { useVisNetwork } from '../hooks/useVisNetwork'
import { useWebSocket, WebSocketHandlers } from '../hooks/useWebsocket'

const decodeWikipediaTitle = (path: string): string => {
  // Replace underscores with spaces
  const titleWithSpaces = path.replace(/_/g, ' ')

  // URL-decode the title
  const decodedTitle = decodeURIComponent(titleWithSpaces)

  return decodedTitle
}

function createVisNode({ wikid, crawlInfo }: Partial<PageData>): Node {
  return {
    id: wikid,
    // label: decodeWikipediaTitle(wikid),
    label: wikid,
    shape: 'dot',
    group: crawlInfo?.depth.toString(),
    font: {
      color: 'white',
      strokeColor: 'white',
    },
    size: 6,
  }
}

export interface GraphProps {
  breadth: CrawlParameters['breadth']
  depth: CrawlParameters['depth']
}

function Graph({ breadth, depth }: GraphProps) {
  const [inputValue, setInputValue] = useState('')

  const { containerRef, nodesRef, edgesRef, networkRef } = useVisNetwork({
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

      const pageData: Partial<PageData> = JSON.parse(event.data)
      const { wikid, children } = pageData
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
        nodesRef.current.add(createVisNode(pageData))
        networkRef.current?.fit()
      } catch (err) {
        // node already exists and was added from the children array but now we have all of the pageData
        nodesRef.current.update(createVisNode(pageData))
        console.warn(err)
      }

      // IMPORTANT: only add first `breadth` children to graph since more can be returned/
      // TODO: Fix this behaviour server-side by cacheing all children but only returning
      // those that were requested.
      for (const child of children.slice(0, breadth)) {
        try {
          // nodesRef.current.add(createVisNode({ wikid: child }))
        } catch (err) {
          console.warn(err)
        }
        try {
          edgesRef.current.add({
            from: wikid,
            to: child,
            id: `${wikid} -> ${child}`,
          })
        } catch (error) {
          console.warn(error)
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
      branchingFactor: breadth,
      depth: depth,
    })

    send({
      action: 'sendmessage',
      data: {
        wikid: inputValue,
        branchingFactor: breadth,
        depth: depth,
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
