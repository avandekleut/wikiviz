import React from 'react'
import { CrawlParameters } from '../hooks/useCrawlParameters'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div>
      <label>
        {label}: {value}
      </label>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </div>
  )
}

function App({
  depth,
  breadth,
  handleDepthChange,
  handleBreadthChange,
}: CrawlParameters) {
  return (
    <div>
      <Slider
        label="Depth"
        value={depth}
        min={1}
        max={6}
        step={1}
        onChange={handleDepthChange}
      />
      <Slider
        label="Breadth"
        value={breadth}
        min={1}
        max={6}
        step={1}
        onChange={handleBreadthChange}
      />
    </div>
  )
}

export default App
