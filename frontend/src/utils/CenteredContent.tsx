import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface CenteredContentProps {
  children: ReactNode
}

function CenteredContent({ children }: CenteredContentProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      {children}
    </Box>
  )
}

export default CenteredContent
