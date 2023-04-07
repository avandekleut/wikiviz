import { createTheme, Theme, ThemeProvider } from '@mui/material/styles'
import { ReactNode } from 'react'

interface ThemeProviderWrapperProps {
  children: ReactNode
  theme?: Theme
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // primary: blue,
    // secondary: pink,
  },
})

const ThemeProviderWrapper = ({
  children,
  theme = darkTheme,
}: ThemeProviderWrapperProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default ThemeProviderWrapper
