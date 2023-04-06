import { useState } from 'react'
import Slider from '../components/Slider'
import WebsocketGraph from '../components/WebsocketGraph'
import WikipediaSearch from '../components/WikipediaSearch'
import { useCrawlParameters } from '../hooks/useCrawlParameters'

export function SearchAndNetwork() {
  const { depth, breadth, handleDepthChange, handleBreadthChange } =
    useCrawlParameters()

  const [wikid, setWikid] = useState('')

  return (
    <>
      <WikipediaSearch
        minimumSearchLength={3}
        onResultSelect={(title) => {
          console.log(`Selected ${title}`)
          setWikid(title)
        }}
      />
      <Slider
        depth={depth}
        breadth={breadth}
        handleDepthChange={handleDepthChange}
        handleBreadthChange={handleBreadthChange}
      />
      <WebsocketGraph depth={depth} breadth={breadth} />
    </>
  )
}
