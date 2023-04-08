import {
  Button,
  ClickAwayListener,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { WikipediaSearchApiResponse } from '../../../backend/api/v1/search/GET'
import { config } from '../env'

interface Props {
  value: string
  onChange:
    | React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
    | undefined
  onResultSelect: (title: string) => void
  onButtonPress: () => void
  minimumSearchLength: number
}

function WikipediaSearch(props: Props): JSX.Element {
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [searchResultsOpen, setSearchResultsOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (props.value.length < props.minimumSearchLength) {
        setSearchResults([])
        return
      }

      const url =
        config.API_BASEURL +
        `/api/v1/search?term=${encodeURIComponent(props.value)}`

      try {
        const response = await fetch(url)
        const data = (await response.json()) as WikipediaSearchApiResponse
        console.log(data)
        setSearchResults(data.pages.map((page) => page.title))
      } catch (error) {
        console.log(error)
        setSearchResults([])
      }
    }

    fetchData()
  }, [props.value, props.minimumSearchLength])

  function handleResultClick(title: string) {
    props.onResultSelect(title)
    setSearchResultsOpen(false)
  }

  const handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    props.onChange?.(event)
    setSearchResultsOpen(true)
  }

  const handleClickAway = () => {
    setSearchResultsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      props.onButtonPress()
    }
  }

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={10}>
        <TextField
          label="Search"
          variant="outlined"
          value={props.value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            props.onButtonPress()
          }}
          fullWidth
        >
          Submit
        </Button>
      </Grid>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Grid item xs={8}>
          <List style={{ position: 'absolute', zIndex: 9999 }}>
            {searchResultsOpen &&
              searchResults.map((result) => (
                <ListItemButton
                  key={result}
                  onClick={() => handleResultClick(result)}
                  sx={{
                    position: 'relative',
                  }}
                >
                  <ListItemText primary={result} />
                </ListItemButton>
              ))}
          </List>
        </Grid>
      </ClickAwayListener>
    </Grid>
  )
}

export default WikipediaSearch
