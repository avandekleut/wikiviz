import { alpha } from '@mui/material/styles'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CrawlMessage, PageData } from '../../../backend'
import { PageDataNode, useVisNetwork } from '../hooks/useVisNetwork'
import { useWebSocket, WebSocketHandlers } from '../hooks/useWebsocket'
import FullWidth from '../utils/FullWidth'

import {
  Card,
  Container,
  Grid,
  LinearProgress,
  Slider,
  Typography,
} from '@mui/material'
import { CrawlerEvent } from '../../../backend/utils/crawler-event'
import { config } from '../env'
import useQueue from '../hooks/useQueue'
import ClearButton from './ClearButton'
import FitButton from './FitButton'
import PageDataAccordion from './PageDataAccordion'
import WikipediaSearch from './WikipediaSearch'

type ClickEvent = {
  event: MouseEvent
  edges?: string[]
  nodes?: string[]
  pointer: { canvas: { x: number; y: number }; DOM: { x: number; y: number } }
}

function sendCrawlRequest(
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

function decodeWikipediaTitle(path: string): string {
  // Replace underscores with spaces
  const titleWithSpaces = path.replace(/_/g, ' ')

  // URL-decode the title
  const decodedTitle = decodeURIComponent(titleWithSpaces)

  return decodedTitle
}

function createVisNode(pageData: PageData): PageDataNode {
  const { wikid } = pageData
  return {
    id: wikid,
    label: decodeWikipediaTitle(wikid),
    shape: 'dot',
    font: {
      color: 'white',
      strokeColor: 'white',
    },
    size: 6,
    pageData,
  }
}

function computeMaxNumNodesDAG({
  depth,
  breadth,
}: {
  depth: number
  breadth: number
}) {
  let result = 0
  for (let d = 0; d <= depth; d++) {
    result += breadth ** d
  }
  return result
}

function WebsocketGraph() {
  const [inputValue, setInputValue] = useState('')
  const [depth, setDepth] = useState(config.CRAWL_DEFAULT_DEPTH)
  const [breadth, setBreadth] = useState(config.CRAWL_DEFAULT_BREADTH)
  const [crawlInProgress, setCrawlInProgress] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [selectedPageData, setSelectedPageData] = useState<
    PageData | undefined
  >(undefined)

  const { containerRef, nodesRef, edgesRef, networkRef } = useVisNetwork({
    nodes: [],
    edges: [],
  })

  const delay =
    config.GRAPH_ADD_NODE_DELAY * Math.pow(nodesRef.current.length, 1 / 5)

  const { enqueue } = useQueue({ delay: delay })

  const maxNodes = computeMaxNumNodesDAG({ depth, breadth })

  const onMessage = useCallback<NonNullable<WebSocketHandlers['onMessage']>>(
    (event) => {
      try {
        JSON.parse(event.data)
      } catch (err) {
        console.warn(`Could not parse event.data: ${event.data}`)
      }

      const handleClose = () => {
        setCrawlProgress(maxNodes)
        setTimeout(() => {
          setCrawlInProgress(false)
        }, 1000)
      }

      const pageData: Partial<CrawlerEvent<PageData | undefined>> = JSON.parse(
        event.data,
      )

      const { type, data } = pageData

      console.log({ type, data })

      if (type === undefined) {
        console.warn(`type undefined`)
        handleClose()
        return
      }

      if (type === 'open') {
        setCrawlProgress(0)
        return
      }

      if (type === 'close') {
        handleClose()
        return
      }

      if (data === undefined) {
        console.warn(`data undefined`)
        return
      }

      const { wikid, children } = data

      if (wikid === undefined) {
        console.warn(`wikid undefined`)
        return
      }

      if (children === undefined) {
        console.warn(`children undefined`)
        return
      }

      enqueue(() => {
        console.log('onMessage', { wikid, nodesRef })

        try {
          const pageNode = createVisNode(data)

          nodesRef.current.update(pageNode)

          setCrawlProgress((crawlProgress) => crawlProgress + 1)

          // Update node sizes by number of neighbours
          nodesRef.current.forEach((node) => {
            if (node.id) {
              const connectedTo = networkRef.current?.getConnectedNodes(
                node.id,
                'from',
              )
              const numConnectedTo = connectedTo?.length ?? 0

              const size = numConnectedTo + config.GRAPH_BASE_NODE_SIZE
              nodesRef.current.update({ ...node, size })
            }
          })
        } catch (err) {
          console.warn(err)
        }

        // IMPORTANT: only add first `breadth` children to graph since more can be returned/
        // TODO: Fix this behaviour server-side by cacheing all children but only returning
        // those that were requested.
        for (const child of children.slice(0, breadth)) {
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
      })
    },
    [networkRef, nodesRef, edgesRef, breadth, maxNodes],
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

  // add network handlers
  useEffect(() => {
    const network = networkRef.current
    if (!network) {
      return
    }

    const handleDoubleClick = (event: ClickEvent) => {
      console.log({ event, msg: 'doubleClick' })
      if (crawlInProgress) {
        return
      }
      const clickedNode = event.nodes?.[0]
      if (clickedNode) {
        console.log({ clickedNode })
        setCrawlInProgress(true)
        setCrawlProgress(0)
        sendCrawlRequest(clickedNode, breadth, depth, send)
      }
    }

    const handleClick = (event: ClickEvent) => {
      const nodeId = event.nodes?.[0]
      if (!nodeId) {
        setInputValue('')
        setSelectedPageData(undefined)
        return
      }

      const clickedNode = nodesRef.current.get(nodeId)
      console.log({ clickedNode })

      if (!clickedNode) {
        return
      }

      const { label } = clickedNode

      if (!label) {
        return
      }

      setInputValue(label)
      setSelectedPageData(clickedNode.pageData)
    }

    network.on('doubleClick', handleDoubleClick)
    network.on('click', handleClick)

    return () => {
      network.off('doubleClick', handleDoubleClick)
      network.off('click', handleClick)
    }
  }, [networkRef, breadth, depth, send, crawlInProgress, nodesRef])

  const handleResultSelect = (title: string): void => {
    if (crawlInProgress) {
      return
    }
    setInputValue(title)
    sendCrawlRequest(title, breadth, depth, send)
    setCrawlInProgress(true)
    setCrawlProgress(0)
  }

  const handleSubmit = () => {
    if (crawlInProgress) {
      return
    }
    setInputValue('')
    sendCrawlRequest(inputValue, breadth, depth, send)
    setCrawlInProgress(true)
    setCrawlProgress(0)
  }

  const handleClear = () => {
    nodesRef.current.clear()
  }

  const handleFit = () => {
    networkRef.current?.fit()
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

  const networkButtons = (
    <Grid container>
      <Grid item xs={1}>
        <FitButton onClick={() => handleFit()}></FitButton>
      </Grid>
      <Grid item xs={10}></Grid>
      <Grid item xs={1}>
        <ClearButton onClick={() => handleClear()}></ClearButton>
      </Grid>
    </Grid>
  )

  return (
    <FullWidth>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card sx={{ padding: 2, bgcolor: alpha('#000000', 0.9) }}>
          <WikipediaSearch
            value={inputValue}
            handleChange={(event) => setInputValue(event.target.value)}
            minimumSearchLength={config.MINIMUM_SEARCH_LENGTH}
            handleSubmit={handleSubmit}
            handleResultSelect={handleResultSelect}
            submitDisabled={crawlInProgress}
          />
          {sliders}
        </Card>
        <LinearProgress
          variant={crawlProgress === 0 ? 'indeterminate' : 'determinate'}
          value={(100 * crawlProgress) / maxNodes}
          color="primary"
          sx={{ position: 'relative', left: 0 }}
          style={{ visibility: crawlInProgress ? 'visible' : 'hidden' }}
        />
        {selectedPageData && (
          <PageDataAccordion
            title={decodeWikipediaTitle(selectedPageData.wikid)}
            pageData={selectedPageData}
          ></PageDataAccordion>
        )}
        {nodesRef.current.length > 0 && networkButtons}
      </Container>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -999,
        }}
      />
    </FullWidth>
  )
}

export default WebsocketGraph
