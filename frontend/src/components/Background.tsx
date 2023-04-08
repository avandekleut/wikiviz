import { Box } from '@mui/material'

function App() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: (theme) => theme.palette.background.default,
        zIndex: -999,
      }}
    />
    // rest of your app code
  )
}

export default App
