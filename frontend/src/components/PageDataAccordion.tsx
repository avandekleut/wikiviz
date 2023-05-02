import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from '@mui/material'
import { PageData } from '../../../backend'

import ReadMoreIcon from '@mui/icons-material/ReadMore'

import parse from 'html-react-parser'

import { Link } from '@mui/material'

interface Props {
  title: string
  pageData: PageData
}

function renderWikipediaLinks(htmlString: string, baseUrl: string) {
  const options = {
    replace: (node: any) => {
      if (node.type === 'tag' && node.name === 'a') {
        const href = node.attribs.href
        const updatedHref = href.startsWith('/')
          ? `https://en.wikipedia.org${href}`
          : href.startsWith('#')
          ? `${baseUrl}${href}`
          : href
        return (
          <Link
            href={updatedHref}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 'bold' }}
          >
            {node.children[0].data}
          </Link>
        )
      }
    },
  }
  return parse(htmlString, options)
}

const PageDataAccordion = ({ title, pageData }: Props) => {
  const baseUrl = `https://en.wikipedia.org/wiki/${pageData.wikid}`

  const readMoreLink = (
    <Typography variant="caption" sx={{ textAlign: 'right' }}>
      <Link
        href={baseUrl}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ fontWeight: 'bold' }}
      >
        Read more
        <ReadMoreIcon
          fontSize="small"
          sx={{ alignSelf: 'baseline', mb: '-0.3em' }}
        />
      </Link>
    </Typography>
  )

  const parsed = renderWikipediaLinks(pageData.summary, baseUrl)

  const summary = (
    <Typography variant="caption">
      {parsed}
      <br />
      <br />
      {readMoreLink}
    </Typography>
  )

  const image = (
    <>
      <img
        src={pageData.mainImage}
        alt={pageData.mainImageCaption ?? title}
        style={{ maxWidth: '90%' }}
      ></img>
      {pageData.mainImageCaption && (
        <Typography variant="caption">{pageData.mainImageCaption}</Typography>
      )}
    </>
  )

  const summaryWithImage = (
    <Grid container spacing={1} justifyContent="center">
      <Grid item xs={8}>
        {summary}
      </Grid>
      <Grid item xs={4}>
        {image}
      </Grid>
    </Grid>
  )

  return (
    <Accordion sx={{ mb: 1, mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {pageData.mainImage ? summaryWithImage : summary}
      </AccordionDetails>
    </Accordion>
  )
}

export default PageDataAccordion
