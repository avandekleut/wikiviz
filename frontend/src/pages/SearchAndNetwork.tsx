import { useState } from 'react'

import WebsocketGraph from '../components/WebsocketGraph'
import { useCrawlParameters } from '../hooks/useCrawlParameters'

export function SearchAndNetwork() {
  const { depth, breadth, handleDepthChange, handleBreadthChange } =
    useCrawlParameters()

  const [wikid, setWikid] = useState('')

  return (
    <>
      <WebsocketGraph />
    </>
  )
}
