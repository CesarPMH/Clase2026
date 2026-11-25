// Component library: MUI (Box, Typography)
import { Box, Typography } from '@mui/material';
import { DL } from '../../theme';

export default function SectionHeader({ title, subtitle, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px', gap: '12px' }}>
      {/* Left: accent bar + title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <Box sx={{
          width: 14, height: 3, borderRadius: 2,
          background: `linear-gradient(90deg, ${DL.blue}, ${DL.navy})`,
          flexShrink: 0,
        }} />
        <Typography sx={{
          fontSize: 9, fontWeight: 500,
          textTransform: 'uppercase', letterSpacing: '0.09em',
          color: DL.tS, lineHeight: 1,
        }}>
          {title}
        </Typography>
      </Box>

      {/* Right: subtitle (italic) + optional children */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        {subtitle && (
          <Typography sx={{
            fontSize: 9, color: DL.tS, fontStyle: 'italic',
            textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {subtitle}
          </Typography>
        )}
        {children && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
}
