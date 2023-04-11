import Clear from '@mui/icons-material/Clear'
import IconButton from '@mui/material/IconButton'

interface ClearButtonProps {
  onClick: () => void
}

const ClearButton = ({ onClick }: ClearButtonProps) => {
  return (
    <IconButton onClick={onClick}>
      <Clear />
    </IconButton>
  )
}

export default ClearButton
