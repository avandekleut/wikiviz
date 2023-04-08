import { useCallback, useMemo, useState } from 'react'
import { Node } from 'vis'
import { CrawlMessage, PageData } from '../../../backend'
import { useVisNetwork } from '../hooks/useVisNetwork'
import { useWebSocket, WebSocketHandlers } from '../hooks/useWebsocket'
import FullWidth from '../utils/FullWidth'

import { Card, Container, Grid, Slider, Typography } from '@mui/material'
import { config } from '../env'
import WikipediaSearch from './WikipediaSearch'

function sendSearchRequest(
  inputValue: string,
  breadth: number,
  depth: number,
  send: (message: CrawlMessage) => void,
) {
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
}
const decodeWikipediaTitle = (path: string): string => {
  // Replace underscores with spaces
  const titleWithSpaces = path.replace(/_/g, ' ')

  // URL-decode the title
  const decodedTitle = decodeURIComponent(titleWithSpaces)

  return decodedTitle
}

function createVisNode(wikid: string): Node {
  return {
    id: wikid,
    // label: decodeWikipediaTitle(wikid),
    label: wikid,
    shape: 'dot',
    font: {
      color: 'white',
      strokeColor: 'white',
    },
    size: 6,
  }
}

function WebsocketGraph() {
  const [inputValue, setInputValue] = useState('')
  const [depth, setDepth] = useState(config.CRAWL_DEFAULT_DEPTH)
  const [breadth, setBreadth] = useState(config.CRAWL_DEFAULT_BREADTH)

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

      const { wikid, children }: Partial<PageData> = JSON.parse(event.data)
      if (wikid === undefined) {
        console.warn(`wikid undefined`)
        return
      }

      if (children === undefined) {
        console.warn(`children undefined`)
        return
      }

      try {
        nodesRef.current.add(createVisNode(wikid))
        networkRef.current?.fit()
      } catch (err) {
        console.warn(err)
      }

      // IMPORTANT: only add first `breadth` children to graph since more can be returned/
      // TODO: Fix this behaviour server-side by cacheing all children but only returning
      // those that were requested.
      for (const child of children.slice(0, breadth)) {
        try {
          nodesRef.current.add(createVisNode(child))
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

  const handleResultSelect = (title: string): void => {
    setInputValue(title)
    sendSearchRequest(title, breadth, depth, send)
  }

  const sliders = (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={10}>
        <Slider
          value={depth}
          onChange={(event, value) => {
            if (typeof value === 'number') {
              setDepth(value)
            }
          }}
          aria-label="depth"
          aria-labelledby="depth-label"
          valueLabelDisplay="auto"
          min={config.CRAWL_DEFAULT_DEPTH_RANGE[0]}
          max={config.CRAWL_DEFAULT_DEPTH_RANGE[1]}
          step={1}
        />
      </Grid>
      <Grid item xs={2}>
        <Typography id="depth-label">Depth</Typography>
      </Grid>
      <Grid item xs={10}>
        <Slider
          value={breadth}
          onChange={(event, value) => {
            if (typeof value === 'number') {
              setBreadth(value)
            }
          }}
          aria-label="breadth"
          aria-labelledby="breadth-label"
          valueLabelDisplay="auto"
          min={config.CRAWL_DEFAULT_BREADTH_RANGE[0]}
          max={config.CRAWL_DEFAULT_BREADTH_RANGE[1]}
          step={1}
        />
      </Grid>
      <Grid item xs={2}>
        <Typography id="breadth-label">Breadth</Typography>
      </Grid>
    </Grid>
  )

  return (
    <FullWidth>
      <Container maxWidth="sm" sx={{ mt: 4, width: '100%' }}>
        <Card sx={{ padding: 2 }}>
          <WikipediaSearch
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            minimumSearchLength={3}
            onButtonPress={() => {
              sendSearchRequest(inputValue, breadth, depth, send)
              setInputValue('')
            }}
            onResultSelect={handleResultSelect}
          />
          {sliders}
        </Card>
      </Container>
      <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
    </FullWidth>
  )
}

export default WebsocketGraph
