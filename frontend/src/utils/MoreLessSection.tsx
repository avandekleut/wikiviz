import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { IconButton } from '@mui/material'
import React, { useState } from 'react'

interface Props {
  initialExpanded?: boolean
  children: React.ReactNode
}

export const MoreLessSection: React.FC<Props> = ({
  initialExpanded = false,
  children,
}) => {
  const [expanded, setExpanded] = useState(initialExpanded)

  // Content to show when expanded
  const expandedContent = <div>{children}</div>

  // Content to show when collapsed
  const collapsedContent = <div>{React.Children.toArray(children)[0]}</div>

  return (
    <div>
      {expanded ? expandedContent : collapsedContent}
      <IconButton onClick={() => setExpanded(!expanded)}>
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </div>
  )
}

export default MoreLessSection
