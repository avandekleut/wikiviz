import { useState } from 'react'
import { config } from '../env'

export interface CrawlParameters {
  depth: number
  breadth: number
  handleDepthChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleBreadthChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function useCrawlParameters(): CrawlParameters {
  const [depth, setDepth] = useState<number>(config.CRAWL_DEFAULT_DEPTH)
  const [breadth, setBreadth] = useState<number>(
    config.CRAWL_DEFAULT_BRANCHING_FACTOR,
  )

  const handleDepthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDepth(parseInt(event.target.value))
  }

  const handleBreadthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBreadth(parseInt(event.target.value))
  }

  return { depth, handleDepthChange, breadth, handleBreadthChange }
}
