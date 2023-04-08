import {
  Button,
  Container,
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
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined
  onResultSelect: (title: string) => void
  onButtonPress: () => void
  minimumSearchLength: number
}

function WikipediaSearch(props: Props): JSX.Element {
  const [searchResults, setSearchResults] = useState<string[]>([])

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
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, width: '100%' }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={10}>
          <TextField
            label="Search"
            variant="outlined"
            value={props.value}
            onChange={props.onChange}
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
        <Grid item xs={8}>
          <List>
            {searchResults.map((result) => (
              <ListItemButton
                key={result}
                onClick={() => handleResultClick(result)}
              >
                <ListItemText primary={result} />
              </ListItemButton>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  )
}

export default WikipediaSearch
