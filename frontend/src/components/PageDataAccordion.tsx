import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from '@mui/material'
import { PageData } from '../../../backend'

import parse from 'html-react-parser'

import { Link } from '@mui/material'

interface Props {
  title: string
  pageData: PageData
}

function renderWikipediaLinks(htmlString: string) {
  const options = {
    replace: (node: any) => {
      if (node.type === 'tag' && node.name === 'a') {
        const href = node.attribs.href
        const updatedHref = href.startsWith('/')
          ? `https://en.wikipedia.org${href}`
          : href
        return (
          <Link
            href={updatedHref}
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            underline="always"
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
  console.log({ pageData })

  const parsed = renderWikipediaLinks(pageData.summary)

  const caption = <Typography variant="caption">{parsed}</Typography>

  const captionWithImage = (
    <Grid container>
      <Grid item xs={4}>
        <img
          src={pageData.mainImage}
          alt={title}
          style={{ maxWidth: '90%' }}
        ></img>
      </Grid>
      <Grid item xs={8}>
        {caption}
      </Grid>
    </Grid>
  )

  return (
    <Accordion sx={{ mb: 1, mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {pageData.mainImage ? captionWithImage : caption}
      </AccordionDetails>
    </Accordion>
  )
}

export default PageDataAccordion
