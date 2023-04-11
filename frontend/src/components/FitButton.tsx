import FitIcon from '@mui/icons-material/FitScreen'
import IconButton from '@mui/material/IconButton'

interface FitButtonProps {
  onClick: () => void
}

const FitButton = ({ onClick }: FitButtonProps) => {
  return (
    <IconButton onClick={onClick}>
      <FitIcon />
    </IconButton>
  )
}

export default FitButton
