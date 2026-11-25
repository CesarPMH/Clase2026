// Component library: MUI (Box, Typography, Chip)
import { Box, Typography, Chip } from '@mui/material';
import { DL } from '../../theme';

const ALERTS = [
  { type: 'r', text: 'Margen bruto 18.1% — por debajo del umbral mín. 25%' },
  { type: 'y', text: 'E-Commerce cayó 17% vs. período anterior' },
  { type: 'y', text: 'Clientes Nuevos: 8 de 10 meta (80%)' },
  { type: 'g', text: 'Ventas totales +4.1% sobre presupuesto' },
  { type: 'g', text: 'Clientes activos: 127 (+16.5% YoY)' },
];

const COLOR_MAP = {
  r: { bg: DL.redBg,    color: DL.red,    dot: DL.red,    border: DL.redBd },
  y: { bg: DL.yellowBg, color: DL.yellow, dot: DL.yellow, border: DL.yellowBd },
  g: { bg: DL.greenBg,  color: DL.green,  dot: DL.green,  border: DL.greenBd },
};

export default function AlertStrip() {
  return (
    <Box sx={{
      height: 34,
      background: '#fff',
      borderBottom: `1px solid ${DL.border}`,
      display: 'flex', alignItems: 'center',
      px: '16px', gap: '8px',
      flexShrink: 0, overflow: 'hidden',
    }}>
      <Typography sx={{
        fontSize: 8, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: DL.tS, whiteSpace: 'nowrap',
        borderRight: `1px solid ${DL.border2}`,
        pr: '8px', mr: '2px', flexShrink: 0,
      }}>
        Alertas
      </Typography>

      <Box sx={{
        display: 'flex', alignItems: 'center', gap: '6px',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}>
        {ALERTS.map((alert, i) => {
          const c = COLOR_MAP[alert.type];
          return (
            <Box
              key={i}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                px: '8px', py: '2px',
                borderRadius: '10px',
                fontSize: 9, fontWeight: 500,
                whiteSpace: 'nowrap', flexShrink: 0,
                background: c.bg,
                color: c.color,
                border: `1px solid ${c.border}`,
              }}
            >
              <Box sx={{
                width: 5, height: 5, borderRadius: '50%',
                background: c.dot, flexShrink: 0,
              }} />
              {alert.text}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
