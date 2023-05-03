import {
  Avatar,
  Button,
  ClickAwayListener,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { WikipediaSearchApiResponse } from '../../../backend/api/v1/search/GET'
import { config } from '../env'

interface Props {
  value: string
  handleChange:
    | React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
    | undefined
  handleResultSelect: (title: string) => void
  handleSubmit: () => void
  submitDisabled?: boolean
  minimumSearchLength: number
}

interface Cache<T> {
  [key: string]: T
}

function WikipediaSearch(props: Props): JSX.Element {
  const searchResultsCache = useRef<Cache<WikipediaSearchApiResponse>>({})

  const [searchResults, setSearchResults] =
    useState<WikipediaSearchApiResponse>()
  const [searchResultsOpen, setSearchResultsOpen] = useState(false)

  // handle search
  useEffect(() => {
    async function fetchData() {
      if (props.value.length < props.minimumSearchLength) {
        setSearchResults(undefined)
        return
      }

      const cachedData = searchResultsCache.current[props.value]
      if (cachedData) {
        console.debug(`Resolved ${props.value} from cache`)
        console.debug({ cachedData })
        setSearchResults(cachedData)
        return Promise.resolve(cachedData)
      }

      const url =
        config.WEBSOCKET_API_BASEURL +
        `/api/v1/search?term=${encodeURIComponent(props.value)}`

      try {
        const response = await fetch(url)
        const data = (await response.json()) as WikipediaSearchApiResponse
        searchResultsCache.current[props.value] = data
        setSearchResults(data)
      } catch (error) {
        console.log(error)
        setSearchResults(undefined)
      }
    }

    fetchData()
  }, [props.value, props.minimumSearchLength])

  function handleResultClick(title: string) {
    props.handleResultSelect(title)
    setSearchResultsOpen(false)
  }

  const handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    props.handleChange?.(event)
    setSearchResultsOpen(true)
  }

  const handleClickAway = () => {
    setSearchResultsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      props.handleSubmit()
      setSearchResultsOpen(false)
    }
  }

  const handleCrawlClick = () => {
    props.handleSubmit()
    setSearchResultsOpen(false)
  }

  const skeletonListItem = (key: number) => (
    <ListItemButton
      key={key}
      sx={{
        position: 'relative',
        width: '100%',
        flexGrow: 1,
      }}
    >
      <ListItemAvatar>
        <Skeleton
          variant="rectangular"
          width={48}
          height={48}
          animation="wave"
        />
      </ListItemAvatar>
      <ListItemText primary={<Skeleton variant="text" animation="wave" />} />
    </ListItemButton>
  )

  return (
    <Grid container spacing={2} alignItems="center" sx={{ padding: 2 }}>
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
          onClick={handleCrawlClick}
          fullWidth
          disabled={props.submitDisabled ?? false}
        >
          Crawl
        </Button>
      </Grid>
      {searchResultsOpen && props.value && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <Grid item xs={8}>
            <List
              style={{
                zIndex: 9999,
              }}
            >
              {searchResults
                ? searchResults.pages.map((page) => (
                    <ListItemButton
                      key={page.id}
                      onClick={() => handleResultClick(page.title)}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        flexGrow: 1,
                      }}
                    >
                      <ListItemAvatar>
                        {page.thumbnail?.url && (
                          <Avatar
                            alt={page.title}
                            src={page.thumbnail.url}
                            variant="square"
                          ></Avatar>
                        )}
                      </ListItemAvatar>
                      <ListItemText primary={page.title} />
                    </ListItemButton>
                  ))
                : [1, 2, 3].map((key) => skeletonListItem(key))}
            </List>
          </Grid>
        </ClickAwayListener>
      )}
    </Grid>
  )
}

export default WikipediaSearch
