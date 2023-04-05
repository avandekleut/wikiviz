import React, { useState } from 'react'

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

function App() {
  const [depth, setDepth] = useState<number>(1)
  const [breadth, setBreadth] = useState<number>(1)

  const handleDepthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDepth(parseInt(event.target.value))
  }

  const handleBreadthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBreadth(parseInt(event.target.value))
  }

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
