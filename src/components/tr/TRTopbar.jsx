// Component library: MUI
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import {
  ContentPaste as ContentPasteIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  NotificationsNone as BellIcon,
  KeyboardArrowDown as ChevronIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';

export default function TRTopbar() {
  return (
    <Box sx={{
      height: 52, flexShrink: 0,
      background: '#fff',
      borderBottom: `1px solid ${DL.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      px: '20px', gap: '4px',
    }}>
      <Tooltip title="Documentos">
        <IconButton size="small" sx={{ color: DL.tS }}>
          <ContentPasteIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Mensajes">
        <IconButton size="small" sx={{ color: DL.tS }}>
          <ChatIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Notificaciones">
        <IconButton size="small" sx={{ color: DL.tS }}>
          <BellIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '8px',
        ml: '8px', pl: '12px',
        borderLeft: `1px solid ${DL.border}`,
        cursor: 'pointer',
        '&:hover': { opacity: 0.8 },
      }}>
        <Avatar sx={{ width: 28, height: 28, fontSize: 11, fontWeight: 500, background: DL.blue }}>
          JD
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, lineHeight: 1 }}>
            Jorge Daura
          </Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS, lineHeight: 1.4 }}>
            Administrador
          </Typography>
        </Box>
        <ChevronIcon sx={{ fontSize: 16, color: DL.tS }} />
      </Box>
    </Box>
  );
}
