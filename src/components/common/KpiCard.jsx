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

// Tonos suaves por estado (fondo del chip, texto)
const TONOS = {
  ok:   { bg: 'rgba(84,126,105,.12)',  fg: '#3f6552' },
  warn: { bg: 'rgba(176,138,74,.15)',  fg: '#7d5f26' },
  bad:  { bg: 'rgba(181,89,79,.12)',   fg: '#9a4339' },
};

export default function KpiCard({
  lbl, val, pct, meta, metaLbl, diff, diffUp,
  yoyPrev, yoyDelta, yoyUp,
  onInfo,
  valHighlight, barSplit, diff2, diff2Up,
}) {
  const nivel  = pct >= 100 ? 'ok' : pct >= 80 ? 'warn' : 'bad';
  const tono   = TONOS[nivel];
  const barW   = Math.min(pct, 100);
  const estado = pct >= 100 ? 'En meta' : pct >= 80 ? 'Atención' : 'Crítico';
  const isDiffUp = diffUp !== undefined ? diffUp : (diff && String(diff).startsWith('+'));
  const trend = (txt, up) => (
    <Typography component="span" sx={{ fontSize: 10, fontWeight: 500, color: up ? TONOS.ok.fg : TONOS.bad.fg, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
      {String(txt).startsWith('-') ? '↓' : '↑'} {String(txt).replace(/^[+-]/, '')}
    </Typography>
  );

  return (
    <Box sx={{
      background: '#fff',
      borderRadius: '12px',
      border: `1px solid ${DL.border}`,
      p: '16px 18px 14px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow .2s, transform .2s',
      cursor: 'default',
      '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,.06)', transform: 'translateY(-1px)' },
    }}>
      {/* Etiqueta + detalle */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
        <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: DL.tS, lineHeight: 1.3 }}>
          {lbl}
        </Typography>
        {onInfo && (
          <Box component="button" onClick={e => { e.stopPropagation(); onInfo(); }} title="Ver contexto"
            sx={{ background: 'none', border: 'none', p: 0, cursor: 'pointer', fontFamily: "'Inter',sans-serif",
              fontSize: 10, color: DL.tS, '&:hover': { color: DL.tH, textDecoration: 'underline' } }}>
            detalle
          </Box>
        )}
      </Box>

      {/* Valor en serif */}
      <Typography sx={{
        fontFamily: SERIF, fontSize: 36, fontWeight: 300, lineHeight: 1,
        color: valHighlight ? tono.fg : DL.tH, letterSpacing: '-0.01em', mb: '10px',
      }}>
        {val}
      </Typography>

      {/* Estado (chip suave) + meta */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 8px', mb: '10px' }}>
        <Box sx={{ display: 'inline-flex', px: '8px', py: '2px', borderRadius: '10px', background: tono.bg }}>
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: tono.fg, whiteSpace: 'nowrap' }}>{estado} · {pct.toFixed(0)}%</Typography>
        </Box>
        <Typography sx={{ fontSize: 10, color: DL.tS }}>
          {metaLbl} <Box component="span" sx={{ color: DL.tM, fontWeight: 500 }}>{meta}</Box>
        </Typography>
      </Box>

      {/* Barra de progreso */}
      {barSplit ? (
        <Box sx={{ height: 4, display: 'flex', borderRadius: 2, overflow: 'hidden', mb: '10px' }}>
          <Box sx={{ width: `${barSplit}%`, background: '#547e69' }} />
          <Box sx={{ flex: 1, background: '#c98f87' }} />
        </Box>
      ) : (
        <Box sx={{ height: 4, borderRadius: 2, background: '#eeeeec', overflow: 'hidden', mb: '10px' }}>
          <Box sx={{ height: '100%', width: `${barW}%`, background: DL.tH, opacity: 0.78, borderRadius: 2, transition: 'width .6s ease' }} />
        </Box>
      )}

      {/* Diferencias vs meta */}
      {(diff || diff2) && (
        <Box sx={{ display: 'flex', gap: '10px', mb: '10px' }}>
          {diff && trend(diff, isDiffUp)}
          {diff2 && trend(diff2, diff2Up)}
        </Box>
      )}

      {/* Año anterior */}
      <Box sx={{
        mt: 'auto', pt: '10px', borderTop: `1px solid ${DL.border}`,
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
