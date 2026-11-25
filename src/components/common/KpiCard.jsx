// Component library: MUI (Box, Typography)
// Usage: <KpiCard lbl="Ventas Totales" val="$1.56M" pct={104.1} meta="$1.50M" metaLbl="Presupuesto"
//                diff="+$64K" diffUp yoyPrev="$1.39M" yoyDelta="+12.3%" yoyUp onInfo={() => {}} />
// Extra props for "lower-is-better" KPIs (e.g. DSO):
//   valHighlight — color the value with barColor
//   barSplit     — number (0-100): bar fills 100% but green up to N%, red after
//   diff2        — second chip text on the right of the pct row
//   diff2Up      — boolean for diff2 color
import { Box, Typography } from '@mui/material';
import { DL } from '../../theme';

const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";

export default function KpiCard({
  lbl, val, pct, meta, metaLbl, diff, diffUp,
  yoyPrev, yoyDelta, yoyUp,
  onInfo,
  valHighlight, barSplit, diff2, diff2Up,
}) {
  const barColor = pct >= 100 ? DL.green : pct >= 80 ? DL.yellow : DL.red;
  const barW     = Math.min(pct, 100);
  const estado   = pct >= 100 ? 'En meta' : pct >= 80 ? 'Atención' : 'Crítico';
  const isDiffUp = diffUp !== undefined ? diffUp : (diff && String(diff).startsWith('+'));
  const trend = (txt, up) => (
    <Typography component="span" sx={{ fontSize: 10, fontWeight: 500, color: up ? DL.green : DL.red, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      {String(txt).startsWith('-') ? '↓' : '↑'} {String(txt).replace(/^[+-]/, '')}
    </Typography>
  );

  return (
    <Box sx={{
      background: '#fff',
      borderRadius: '6px',
      border: `1px solid ${DL.border}`,
      borderLeft: `3px solid ${barColor}`,
      p: '14px 16px 12px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background .2s',
      cursor: 'default',
      '&:hover': { background: '#fcfcfc' },
    }}>
      {/* Etiqueta + estado */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: DL.tS, lineHeight: 1.3 }}>
          {lbl}
        </Typography>
        {onInfo && (
          <Box component="button" onClick={e => { e.stopPropagation(); onInfo(); }} title="Ver contexto"
            sx={{ background: 'none', border: 'none', p: 0, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              fontSize: 10, color: DL.tS, textDecoration: 'underline', textUnderlineOffset: '2px',
              '&:hover': { color: DL.tH } }}>
            detalle
          </Box>
        )}
      </Box>

      {/* Valor en serif */}
      <Typography sx={{
        fontFamily: SERIF, fontSize: 36, fontWeight: 300, lineHeight: 1,
        color: valHighlight ? barColor : DL.tH, letterSpacing: '-0.01em', mb: '4px',
      }}>
        {val}
      </Typography>

      {/* Estado + meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', mb: '2px' }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: barColor, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 10, color: DL.tM }}>{estado} · {pct.toFixed(0)}%</Typography>
      </Box>
      <Typography sx={{ fontSize: 10, color: DL.tS, mb: '8px' }}>
        {metaLbl} <Box component="span" sx={{ color: DL.tH, fontWeight: 500 }}>{meta}</Box>
      </Typography>

      {/* Línea de progreso fina */}
      {barSplit ? (
        <Box sx={{ height: 2, display: 'flex', mb: '8px' }}>
          <Box sx={{ width: `${barSplit}%`, background: DL.green }} />
          <Box sx={{ flex: 1, background: DL.red }} />
        </Box>
      ) : (
        <Box sx={{ height: 2, background: '#e3e3e3', mb: '8px' }}>
          <Box sx={{ height: '100%', width: `${barW}%`, background: barColor, transition: 'width .6s ease' }} />
        </Box>
      )}

      {/* Diferencias vs meta */}
      {(diff || diff2) && (
        <Box sx={{ display: 'flex', gap: '10px', mb: '8px' }}>
          {diff && trend(diff, isDiffUp)}
          {diff2 && trend(diff2, diff2Up)}
        </Box>
      )}

      {/* Año anterior */}
      <Box sx={{
        mt: 'auto', pt: '8px', borderTop: `1px dashed ${DL.border2}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap',
      }}>
        <Typography sx={{ fontSize: 10, color: DL.tS, whiteSpace: 'nowrap' }}>
          Año ant. <Box component="span" sx={{ color: DL.tM }}>{yoyPrev}</Box>
        </Typography>
        {trend(yoyDelta, yoyUp)}
      </Box>
    </Box>
  );
}
