import Slider from '../components/Slider'
import WebsocketGraph from '../components/WebsocketGraph'
import WikipediaSearch from '../components/WIkipediaSearch'
import { useCrawlParameters } from '../hooks/useCrawlParameters'

export function SearchAndNetwork() {
  const { depth, breadth, handleDepthChange, handleBreadthChange } =
    useCrawlParameters()

  return (
    <>
      <WikipediaSearch />
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
