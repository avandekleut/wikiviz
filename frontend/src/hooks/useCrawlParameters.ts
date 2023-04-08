import { useState } from 'react'
import { config } from '../env'

export interface CrawlParameters {
  depth: number
  breadth: number
  handleDepthChange: (value: number) => void
  handleBreadthChange: (value: number) => void
}

export function useCrawlParameters(): CrawlParameters {
  const [depth, setDepth] = useState<number>(config.CRAWL_DEFAULT_DEPTH)
  const [breadth, setBreadth] = useState<number>(config.CRAWL_DEFAULT_BREADTH)

  const handleDepthChange = (value: number) => {
    setDepth(value)
  }

  const handleBreadthChange = (value: number) => {
    setBreadth(value)
  }

  return { depth, handleDepthChange, breadth, handleBreadthChange }
}
