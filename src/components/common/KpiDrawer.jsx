// ─── KPI Intelligence Drawer ──────────────────────────────────────────────────
// Drawer lateral que muestra contexto accionable para cualquier KPI.
// Props: open, onClose, kpiId (string), kpiLabel, kpiValue, accentColor, intel (objeto de kpi_intel.js)

import { Drawer } from '@mui/material';
import { Box, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DL } from '../../theme';

// ─── Benchmark range bar ──────────────────────────────────────────────────────
function BenchmarkBar({ bm }) {
  if (!bm) return null;
  const { min, max, zonas, tuPos, tuLabel, nota, invertido } = bm;
  const range = max - min;
  const markerPct = Math.min(Math.max(((tuPos - min) / range) * 100, 1), 99);

  return (
    <Box>
      {/* Range bar */}
      <Box sx={{ position:'relative', height:14, borderRadius:7, overflow:'visible', display:'flex', mb:'18px' }}>
        {zonas.map((z, i) => {
          const w = ((z.to - z.from) / range) * 100;
          const left = ((z.from - min) / range) * 100;
          return (
            <Box key={i} sx={{
              position:'absolute', left:`${left}%`, width:`${w}%`,
              height:'100%',
              background: z.color,
              borderRadius:
                i === 0             ? '7px 0 0 7px' :
                i === zonas.length - 1 ? '0 7px 7px 0' : '0',
              opacity: 0.85,
            }} />
          );
        })}
        {/* Current value marker */}
        <Box sx={{
          position:'absolute', left:`${markerPct}%`, top:'-5px',
          transform:'translateX(-50%)',
          zIndex:10,
        }}>
          <Box sx={{
            width:6, height:24, borderRadius:3,
            background:'#1a1a1a',
            boxShadow:'0 1px 4px rgba(0,0,0,.35)',
          }} />
          <Box sx={{
            position:'absolute', top:'-20px', left:'50%', transform:'translateX(-50%)',
            background:'#1a1a1a', color:'#fff',
            fontSize:8, fontWeight: 500, fontFamily:"'Inter',sans-serif",
            px:'5px', py:'2px', borderRadius:'4px', whiteSpace:'nowrap',
          }}>
            {tuLabel}
          </Box>
        </Box>
      </Box>

      {/* Zone labels */}
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:'10px' }}>
        {zonas.map((z, i) => (
          <Box key={i} sx={{ display:'flex', alignItems:'center', gap:'3px' }}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', background:z.color, flexShrink:0 }} />
            <Typography sx={{ fontSize:8, color:DL.tS, fontWeight: 500 }}>{z.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Benchmark label */}
      <Box sx={{ display:'flex', justifyContent:'space-between', mb:'8px' }}>
        <Typography sx={{ fontSize:8, color:DL.tS, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.05em' }}>
          {bm.industria}
        </Typography>
        <Typography sx={{ fontSize:8, color:DL.tS }}>
          Saludable: <strong style={{ color: '#16a34a' }}>{bm.rango || ''}</strong>
        </Typography>
      </Box>

      {/* Narrative note */}
      <Box sx={{
        background:'rgba(26,26,26,.04)', borderRadius:'8px',
        p:'10px 12px', borderLeft:`3px solid ${DL.blue}`,
      }}>
        <Typography sx={{ fontSize:10, color:DL.tM, lineHeight:1.55 }}>{nota}</Typography>
      </Box>

      {invertido && (
        <Typography sx={{ fontSize:8, color:DL.tS, mt:'6px', fontStyle:'italic' }}>
          ⓘ En este KPI, valores menores son mejores.
        </Typography>
      )}
    </Box>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────
function Section({ icon, color, bg, title, children }) {
  return (
    <Box sx={{ mb:'12px' }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:'7px', mb:'6px' }}>
        <Box sx={{
          width:22, height:22, borderRadius:'6px', flexShrink:0,
          background: bg, color, display:'flex', alignItems:'center',
          justifyContent:'center', fontSize:11, fontWeight: 500,
        }}>
          {icon}
        </Box>
        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textTransform:'uppercase', letterSpacing:'0.06em' }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function KpiDrawer({ open, onClose, kpiLabel, kpiValue, accentColor, intel }) {
  if (!intel) return null;
  const { que, formula, porque, accion, benchmark } = intel;
  const safeZona = benchmark?.zonas?.find(z => z.label === 'Saludable');
  const benchRango = safeZona
    ? `${benchmark.min + (safeZona.from - benchmark.min)}${benchmark.unidad} – ${safeZona.to}${benchmark.unidad}`
    : '';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 380, borderRadius: '12px 0 0 12px', boxShadow: '-4px 0 32px rgba(26,26,26,.12)', display: 'flex', flexDirection: 'column' } } }}
    >
      {/* ── Header ── */}
      <Box sx={{
        borderLeft: `4px solid ${accentColor}`,
        px: '20px', pt: '20px', pb: '16px',
        borderBottom: `1px solid ${DL.border}`,
        position: 'relative',
      }}>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            position: 'absolute', top: '14px', right: '14px',
            width: 28, height: 28, borderRadius: '50%',
            border: `1px solid ${DL.border2}`, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: DL.tS,
            '&:hover': { background: DL.subtle, color: DL.tH },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </Box>

        <Typography sx={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: DL.tS, mb: '4px' }}>
          Inteligencia de KPI
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 500, color: DL.tH, mb: '2px' }}>
          {kpiLabel}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <Typography sx={{ fontSize: 28, fontWeight: 500, color: accentColor, lineHeight: 1, letterSpacing: '-.03em' }}>
            {kpiValue}
          </Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS, fontWeight: 500 }}>valor actual</Typography>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: '20px', pt: '14px', pb: '16px' }}>

        {/* ¿Qué es? */}
        <Section icon="?" color="#547e69" bg="#e8e8e8" title="¿Qué es?">
          <Typography sx={{ fontSize: 11, color: DL.tM, lineHeight: 1.6, mb: '10px' }}>
            {que}
          </Typography>
          {formula && (
            <Box sx={{
              background: 'rgba(26,26,26,.04)', borderRadius: '7px',
              p: '8px 12px', border: `1px solid rgba(26,26,26,.08)`,
            }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '3px' }}>
                Fórmula
              </Typography>
              <Typography sx={{ fontSize: 10, color: DL.tH, fontFamily: "'Courier New', monospace", fontWeight: 500, lineHeight: 1.5 }}>
                {formula}
              </Typography>
            </Box>
          )}
        </Section>

        <Box sx={{ height: '1px', background: DL.border, mb: '14px' }} />

        {/* ¿Por qué importa? */}
        <Section icon="!" color="#d97706" bg="#fef3c7" title="¿Por qué importa?">
          <Typography sx={{ fontSize: 11, color: DL.tM, lineHeight: 1.6, mb: accion ? '10px' : 0 }}>
            {porque}
          </Typography>
          {accion && (
            <Box sx={{
              background: '#f0fdf4', borderRadius: '7px',
              p: '8px 12px', border: `1px solid rgba(22,163,74,.15)`,
            }}>
              <Typography sx={{ fontSize: 8, fontWeight: 500, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', mb: '3px' }}>
                Acción recomendada
              </Typography>
              <Typography sx={{ fontSize: 10, color: '#15803d', lineHeight: 1.5 }}>
                {accion}
              </Typography>
            </Box>
          )}
        </Section>

        <Box sx={{ height: '1px', background: DL.border, mb: '14px' }} />

        {/* ¿Cómo vas? */}
        <Section icon="→" color="#16a34a" bg="#dcfce7" title="¿Cómo vas?">
          {benchmark && (
            <BenchmarkBar bm={{ ...benchmark, rango: benchRango }} />
          )}
        </Section>

      </Box>

      {/* ── Footer ── */}
      <Box sx={{
        px: '20px', py: '12px',
        borderTop: `1px solid ${DL.border}`,
        background: 'rgba(26,26,26,.02)',
      }}>
        <Typography sx={{ fontSize: 8, color: DL.tS, fontStyle: 'italic', textAlign: 'center' }}>
          Benchmarks de referencia: distribución agroindustrial · Latinoamérica · Punto Cero
        </Typography>
      </Box>
    </Drawer>
  );
}
