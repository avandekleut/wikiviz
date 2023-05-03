import Clear from '@mui/icons-material/Clear'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

interface ClearButtonProps {
  onClick: () => void
}

const ClearButton = ({ onClick }: ClearButtonProps) => {
  return (
    <Tooltip title="Clear">
      <IconButton onClick={onClick}>
        <Clear />
      </IconButton>
    </Tooltip>
  )
}

export default ClearButton
