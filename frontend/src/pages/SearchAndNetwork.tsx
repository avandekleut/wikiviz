import { useState } from 'react'

import Slider from '../components/Slider'
import WebsocketGraph from '../components/WebsocketGraph'
import { useCrawlParameters } from '../hooks/useCrawlParameters'
import CollapsibleSection from '../utils/CollapsibleSection'

export function SearchAndNetwork() {
  const { depth, breadth, handleDepthChange, handleBreadthChange } =
    useCrawlParameters()

  const [wikid, setWikid] = useState('')

  return (
    <>
      <CollapsibleSection>
        <Slider
          depth={depth}
          breadth={breadth}
          handleDepthChange={handleDepthChange}
          handleBreadthChange={handleBreadthChange}
        />
      </CollapsibleSection>
      <WebsocketGraph depth={depth} breadth={breadth} />
    </>
  )
}
