// ─── AlertStrip ────────────────────────────────────────────────────────────────
// Franja delgada con alertas en forma de "pastillas" de colores (rojo, amarillo, verde)
// que se desplazan en horizontal. Sirve para ver de un vistazo lo urgente del dashboard.
// Nota honesta: los textos de ALERTS están escritos a mano como datos de demostración
// (no se calculan a partir de pedidos ni de ventas reales). Además, por ahora este componente
// no se importa desde ninguna pantalla; queda disponible como pieza reutilizable.
// Librería de componentes: MUI (Box, Typography, Chip).
// Component library: MUI (Box, Typography, Chip)
import { Box, Typography, Chip } from '@mui/material';
import { DL } from '../../theme';

// Alertas de demostración. type: r = crítica, y = advertencia, g = positiva.
const ALERTS = [
  { type: 'r', text: 'Margen bruto 18.1% — por debajo del umbral mín. 25%' },
  { type: 'y', text: 'E-Commerce cayó 17% vs. período anterior' },
  { type: 'y', text: 'Clientes Nuevos: 8 de 10 meta (80%)' },
  { type: 'g', text: 'Ventas totales +4.1% sobre presupuesto' },
  { type: 'g', text: 'Clientes activos: 127 (+16.5% YoY)' },
];

// Colores por tipo de alerta tomados del tema (DL), para que coincidan con el resto de la aplicación.
const COLOR_MAP = {
  r: { bg: DL.redBg,    color: DL.red,    dot: DL.red,    border: DL.redBd },
  y: { bg: DL.yellowBg, color: DL.yellow, dot: DL.yellow, border: DL.yellowBd },
  g: { bg: DL.greenBg,  color: DL.green,  dot: DL.green,  border: DL.greenBd },
};

// Objetivo: mostrar la franja de alertas. No recibe props. Devuelve: una barra de 34 px con la etiqueta
// "Alertas" y las pastillas.
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
        {/* Cada alerta se dibuja con los colores de su tipo; la franja hace scroll horizontal (sin barra visible) cuando no caben todas. */}
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
