import Settings from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'

interface SettingsButtonProps {
  onClick: () => void
}

const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <IconButton onClick={onClick}>
      <Settings />
    </IconButton>
  )
}

export default SettingsButton
