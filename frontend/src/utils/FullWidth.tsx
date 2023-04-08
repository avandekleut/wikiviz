import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface FullWidthProps {
  children: ReactNode
}

function FullWidth({ children }: FullWidthProps) {
  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      {children}
    </Box>
  )
}

export default FullWidth
