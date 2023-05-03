import FitIcon from '@mui/icons-material/FitScreen'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

interface FitButtonProps {
  onClick: () => void
}

const FitButton = ({ onClick }: FitButtonProps) => {
  return (
    <Tooltip title="Fit">
      <IconButton onClick={onClick}>
        <FitIcon />
      </IconButton>
    </Tooltip>
  )
}

export default FitButton
