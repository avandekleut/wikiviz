import Slider from '../components/Slider'
import WebsocketGraph from '../components/WebsocketGraph'
import { useCrawlParameters } from '../hooks/useCrawlParameters'

export function SearchAndNetwork() {
  const { depth, breadth, handleDepthChange, handleBreadthChange } =
    useCrawlParameters()

  return (
    <>
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
