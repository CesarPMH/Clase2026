// Component library: MUI (Box, Typography)
import { Box, Typography } from '@mui/material';
import { DL } from '../theme';

export default function ComingSoon({ title, description }) {
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '12px',
    }}>
      <Box sx={{
        width: 64, height: 64, borderRadius: '16px',
        background: `linear-gradient(135deg, ${DL.blue}20, ${DL.navy}20)`,
        border: `2px solid ${DL.border2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        🚧
      </Box>
      <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, letterSpacing: '-.02em' }}>
        {title || 'En construcción'}
      </Typography>
      <Typography sx={{ fontSize: 12, color: DL.tS, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
        {description || 'Este dashboard está siendo desarrollado. Estará disponible próximamente.'}
      </Typography>
      <Box sx={{
        mt: '8px', px: '16px', py: '8px', borderRadius: '4px',
        background: `${DL.blue}15`,
        border: `1px solid ${DL.blue}40`,
        fontSize: 11, fontWeight: 500, color: DL.blue,
      }}>
        Próximamente
      </Box>
    </Box>
  );
}
