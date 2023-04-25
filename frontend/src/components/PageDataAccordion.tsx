import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from '@mui/material'
import { PageData } from '../../../backend'

interface Props {
  title: string
  pageData: PageData
}

const PageDataAccordion = ({ title, pageData }: Props) => {
  console.log({ pageData })

  const caption = (
    <Typography
      variant="caption"
      dangerouslySetInnerHTML={{
        __html: pageData.summary,
      }}
    ></Typography>
  )

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
