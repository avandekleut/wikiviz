import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { ReactNode, useState } from 'react'

interface CollapsibleSectionProps {
  text?: string
  children: ReactNode
}

function CollapsibleSection({ text, children }: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  return (
    <Accordion expanded={expanded} onChange={handleToggle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        {text && <Typography variant="h6">{text}</Typography>}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

export default CollapsibleSection
