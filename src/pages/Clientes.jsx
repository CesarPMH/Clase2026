// ─── Cartera de Clientes ──────────────────────────────────────────────────────
// Objetivo: Evaluar la salud del portafolio de clientes vs metas y períodos anteriores.
//           Identificar quién crecer, retener o recuperar.
//
// UI: MUI · Charts: Apache ECharts (echarts-for-react)

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Modal, Backdrop,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  InputBase,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as ExportIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import AlertasSistema from '../components/common/AlertasSistema';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';
import {
  CLIENTES_KPIS,
  SEGMENTO_DATA, CLIENTES_DET,
  BCG_CLIENTS,
  VENTAS_CRUZADAS, ALERTAS_SISTEMA, CXC_DATA,
  DET_ROWS_CLI,
} from '../data/clientes';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const fmt$ = v => v >= 1000 ? `$${v.toLocaleString()}` : `$${v}`;

function MgBadge({ mg }) {
  const [bg, color] =
    mg >= 25 ? ['rgba(22,163,74,.12)', DL.green]  :
    mg >= 15 ? ['rgba(180,83,9,.12)',  DL.yellow] :
               ['rgba(220,38,38,.12)', DL.red];
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:'3px', px:'6px', py:'2px', borderRadius:'4px', background:bg }}>
      <Box sx={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }} />
      <Typography sx={{ fontSize:10, fontWeight: 500, color }}>{mg}%</Typography>
    </Box>
  );
}

function DeltaBadge({ delta, size = 9 }) {
  const up = !String(delta).startsWith('-');
  return (
    <Box sx={{ display:'inline-block', px:'5px', py:'1px', borderRadius:'4px', fontSize:size, fontWeight: 500, background: up ? DL.greenBg : DL.redBg, color: up ? DL.green : DL.red }}>
      {delta}
    </Box>
  );
}

// ─── KPI Cards row (custom layout for clientes) ───────────────────────────────
function ClienteKpiCard({ k }) {
  // isRisk = lower pct is worse (e.g. CxC vencidas over limit)
  const barColor = k.isRisk
    ? (k.pct <= 50 ? DL.green : k.pct <= 80 ? DL.yellow : DL.red)
    : (k.pct >= 100 ? DL.green : k.pct >= 75 ? DL.yellow : DL.red);
  const barW     = Math.min(k.pct, 100);
  const pctColor = barColor;

  // Light tinted background for status circle (top right)
  const statusBg    = `${barColor}1a`;  // ~10% alpha
  const statusColor = barColor;

  return (
    <Box sx={{
      background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`,
      p:'12px 13px 10px', position:'relative', overflow:'hidden',
      display:'flex', flexDirection:'column', boxShadow:DL.e1,
      transition:'box-shadow .2s,transform .2s', cursor:'default',
      '&:hover':{ boxShadow:DL.e2, transform:'translateY(-1px)' },
    }}>
      {/* Top accent strip — matches barColor for at-a-glance status */}
      <Box sx={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'10px 10px 0 0', background:barColor }} />

      {/* Header: label (left) + status circle (right) */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mt:'3px', mb:'5px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS }}>
          {k.lbl}
        </Typography>
        <Box sx={{ width:18, height:18, borderRadius:'50%', background:statusBg, color:statusColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 500, flexShrink:0 }}>
          {k.icon}
        </Box>
      </Box>

      {/* Big value — divider attached as border-bottom (no gray block above the line) */}
      <Typography sx={{
        fontSize:20, fontWeight: 500, color:DL.tH, lineHeight:1.05, letterSpacing:'-.04em',
        pb:'3px', mb:'3px',
        borderBottom:'1px solid rgba(26,26,26,.08)',
      }}>
        {k.val}
      </Typography>

      {/* Meta row: label (left) + meta value (right) */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', mb:'4px' }}>
        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em' }}>{k.metaLbl}</Typography>
        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{k.meta}</Typography>
      </Box>

      {/* THICK colored progress bar */}
      <Box sx={{ height:9, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden', mb:'5px' }}>
        <Box sx={{ height:'100%', borderRadius:5, width:`${barW}%`, background:barColor, transition:'width .6s ease' }} />
      </Box>

      {/* % de meta + meta delta value */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:'8px' }}>
        <Typography sx={{ fontSize:9, fontWeight: 500, color:pctColor }}>{k.pct.toFixed(0)}% de meta</Typography>
        {k.badgeDelta && (
          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS }}>{k.badgeDelta}</Typography>
        )}
      </Box>

      {k.badge && (
        <Typography sx={{ fontSize:8, fontWeight: 500, color: k.badgeUp ? DL.green : DL.red, mb:'5px' }}>{k.badge}</Typography>
      )}

      {/* VS AÑO ANT. footer */}
      <Box sx={{ background:'rgba(26,26,26,.035)', borderRadius:'5px', p:'5px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', mt:'auto' }}>
        <Typography sx={{ fontSize:7.5, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>VS AÑO ANT.</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
          <Typography sx={{ fontSize:8, color:DL.tS }}>{k.yoyPrev}</Typography>
          <DeltaBadge delta={k.yoyDelta} />
        </Box>
      </Box>
    </Box>
  );
}

// ─── Relative circle for client counts ───────────────────────────────────────
function CircleCount({ value, maxVal, color, emptyColor = '#8d8d8d' }) {
  const MIN = 20, MAX = 40;
  const sz  = value === 0
    ? MIN
    : Math.round(MIN + (value / Math.max(maxVal, 1)) * (MAX - MIN));
  const isEmpty = value === 0;
  return (
    <Box sx={{
      width: sz, height: sz, borderRadius: '50%', mx: 'auto',
      background: isEmpty ? 'rgba(148,163,184,.1)' : `${color}18`,
      border: `1.5px solid ${isEmpty ? 'rgba(148,163,184,.25)' : color + '55'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .2s',
    }}>
      <Typography sx={{ fontSize: sz <= 24 ? 9 : 10, fontWeight: 500, color: isEmpty ? emptyColor : color, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Rendimiento por Segmento ─────────────────────────────────────────────────
function SegmentoTable() {
  // Exclude dormant2y from actuales count; compute column maxima for relative sizing
  const rows = SEGMENTO_DATA.map(r => ({ ...r, activeActuales: r.actuales - r.dormant2y }));
  const maxNuevos   = Math.max(...rows.map(r => r.nuevos));
  const maxActuales = Math.max(...rows.map(r => r.activeActuales));
  const maxAbandon  = Math.max(...rows.map(r => r.abandon));

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {['Nombre','Ventas Act.','Ventas Ant.','% Crec.','Margen $','Margen %','Ticket Prom.','Nuevos','Actuales','Abandon.','% Pop.'].map(h => (
              <TableCell key={h} sx={{
                fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS,
                borderBottom:`2px solid rgba(26,26,26,.08)`, background:'rgba(26,26,26,.025)',
                whiteSpace:'nowrap', px:'8px', py:'7px',
              }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id} hover sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
              <TableCell sx={{ px:'8px' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <Box sx={{ width:36, borderRadius:'4px', background:`${r.color}20`, border:`1px solid ${r.color}40`, px:'4px', py:'1px', textAlign:'center' }}>
                    <Typography sx={{ fontSize:7, fontWeight: 500, color:r.color, textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.id}</Typography>
                  </Box>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tB }}>{r.lbl}</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'8px' }}>{fmt$(r.ventasAct)}</TableCell>
              <TableCell sx={{ fontSize:10, color:DL.tS, textAlign:'right', px:'8px' }}>{fmt$(r.ventasAnt)}</TableCell>
              <TableCell sx={{ px:'8px' }}><DeltaBadge delta={`${r.crecPct > 0 ? '+' : ''}${r.crecPct}%`} /></TableCell>
              <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'8px' }}>{fmt$(r.margenD)}</TableCell>
              <TableCell sx={{ px:'8px' }}><MgBadge mg={r.margenPct} /></TableCell>
              <TableCell sx={{ fontSize:11, color:DL.tM, textAlign:'right', px:'8px' }}>{fmt$(r.ticketProm)}</TableCell>
              {/* Relative circles — dormant2y excluded from Actuales */}
              <TableCell sx={{ px:'8px', py:'6px' }}>
                <CircleCount value={r.nuevos} maxVal={maxNuevos} color={DL.green} />
              </TableCell>
              <TableCell sx={{ px:'8px', py:'6px' }}>
                <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
                  <CircleCount value={r.activeActuales} maxVal={maxActuales} color={r.color} />
                  {r.dormant2y > 0 && (
                    <Typography sx={{ fontSize:7, color:'#8d8d8d', lineHeight:1 }}>-{r.dormant2y} inact.</Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ px:'8px', py:'6px' }}>
                <CircleCount value={r.abandon} maxVal={maxAbandon} color={DL.red} />
              </TableCell>
              <TableCell sx={{ fontSize:10, color:DL.tM, textAlign:'right', px:'8px' }}>{r.popPct}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}



// ─── Tops de Productos panels ─────────────────────────────────────────────────
function TopProductosPanels() {
  const panels = [
    {
      icon:'▲', color:'#16a34a', bg:'#f0fdf4', brd:'rgba(22,163,74,.18)',
      title:'Top Más Vendidos', sub:'Productos con mayor volumen de ventas',
      rows: TOP_PRODUCTOS_MAS,
    },
    {
      icon:'▼', color:'#dc2626', bg:'#fff1f0', brd:'rgba(220,38,38,.18)',
      title:'Top Menos Vendidos', sub:'Productos con menor volumen — oportunidad',
      rows: TOP_PRODUCTOS_MENOS,
    },
    {
      icon:'⚠', color:'#d97706', bg:'#fffbeb', brd:'rgba(180,83,9,.18)',
      title:'Clientes en Riesgo', sub:'Sin compra reciente o métricas cayendo',
      rows: null,
    },
  ];

  const RIESGO_ROWS = [
    { name:'Agro Soluciones', detail:'45 días sin compra · 2 fact. venc.', color:'#d97706' },
    { name:'Jaine Espí',      detail:'90 días sin compra · compras ↓',      color:'#dc2626' },
    { name:'Textil Norte',    detail:'60 días sin compra · margen bajo',     color:'#d97706' },
  ];

  return (
    <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
      {panels.map(p => (
        <Paper key={p.title} elevation={1} sx={{ overflow:'hidden', border:`1px solid ${p.brd}` }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:'10px', p:'14px 16px 10px' }}>
            <Box sx={{ width:28, height:28, borderRadius:'50%', background:`${p.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight: 500, color:p.color }}>
              {p.icon}
            </Box>
            <Box>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:'#1a1a1a' }}>{p.title}</Typography>
              <Typography sx={{ fontSize:9, color:'#6a6a6a' }}>{p.sub}</Typography>
            </Box>
          </Box>
          <Box sx={{ px:'16px', pb:'12px', display:'flex', flexDirection:'column', gap:'5px' }}>
            {p.rows
              ? p.rows.map((r, i) => (
                  <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'3px', borderBottom:'1px solid rgba(26,26,26,.04)', '&:last-child':{ borderBottom:'none' } }}>
                    <Box>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:'#1a1a1a' }}>{r.name}</Typography>
                      <Typography sx={{ fontSize:8, color:'#6a6a6a' }}>{r.cat}</Typography>
                    </Box>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:'#1a1a1a' }}>{r.ventas}</Typography>
                      <Box sx={{ fontSize:8, fontWeight: 500, px:'5px', py:'1px', borderRadius:'4px', background: r.crecUp ? '#dcfce7' : '#fee2e2', color: r.crecUp ? '#16a34a' : '#dc2626' }}>
                        {r.crec}
                      </Box>
                    </Box>
                  </Box>
                ))
              : RIESGO_ROWS.map((r, i) => (
                  <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'3px', borderBottom:'1px solid rgba(26,26,26,.04)', '&:last-child':{ borderBottom:'none' } }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:'#1a1a1a' }}>{r.name}</Typography>
                    <Typography sx={{ fontSize:9, color:r.color, fontWeight: 500 }}>{r.detail}</Typography>
                  </Box>
                ))
            }
          </Box>
        </Paper>
      ))}
    </Box>
  );
}


// ─── Ventas Cruzadas por Clasificación ───────────────────────────────────────
const CHIP_CFG = {
  'Alimento Premium': { bg:'rgba(84,126,105,.1)',  color:'#1a1a1a' },
  'Vacuna Triple':    { bg:'rgba(22,163,74,.1)',   color:'#15803d' },
  'Anti Parasitario': { bg:'rgba(77,63,50,.1)',  color:'#4d3f32' },
};

function VentasCruzadasTable({ embedded = false, search = '', setSearch = null }) {
  const [clsf, setClsf] = useState('A');

  const rows = useMemo(() => {
    const data = VENTAS_CRUZADAS[clsf] || [];
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(r => r.cliente.toLowerCase().includes(q));
  }, [clsf, search]);

  const wrap = embedded
    ? { display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }
    : { border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden', background:'#fff' };

  return (
    <Box sx={wrap}>
      {/* Header — only when standalone */}
      {!embedded && (
        <Box sx={{ px:'14px', pt:'12px', pb:'0' }}>
          <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH }}>Ventas Cruzadas por Clasificación</Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mb:'8px' }}>Análisis de productos cruzados por segmento de cliente</Typography>
        </Box>
      )}

      {/* Tabs row */}
      <Box sx={{ display:'flex', alignItems:'center', px: embedded ? '14px' : '8px', borderBottom:`1px solid ${DL.border}` }}>
        {['A','B','C'].map(c => (
          <Box key={c} component="button" onClick={() => setClsf(c)} sx={{
            fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: clsf===c ? 500 : 500,
            px:'12px', py:'7px', border:'none', background:'transparent', cursor:'pointer',
            color: clsf===c ? DL.navy : DL.tS,
            borderBottom:`2px solid ${clsf===c ? DL.blue : 'transparent'}`,
            mb:'-1px', transition:'all .14s', '&:hover':{ color:DL.tH },
          }}>Clasificación {c}</Box>
        ))}
      </Box>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 260, overflow:'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['CLIENTE','VENTAS ACT.','VENTAS ANT.','CREC.%','PART.%','ARTÍCULOS','PENDIENTE','VENTA CRUZADA'].map(h => (
                <TableCell key={h} sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS, borderBottom:`2px solid rgba(26,26,26,.08)`, background:'rgba(26,26,26,.02)', whiteSpace:'nowrap', px:'8px', py:'6px' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => {
              const up = r.crec >= 0;
              return (
                <TableRow key={i} hover sx={{ '&:hover td':{ background:'rgba(84,126,105,.03)' } }}>
                  <TableCell sx={{ fontSize:10, fontWeight: 500, color:DL.tH, px:'8px', whiteSpace:'nowrap' }}>{r.cliente}</TableCell>
                  <TableCell sx={{ fontSize:10, fontWeight: 500, color:DL.tH, px:'8px', textAlign:'right', whiteSpace:'nowrap' }}>Q{r.ventasAct.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.blue, px:'8px', textAlign:'right', whiteSpace:'nowrap' }}>Q{r.ventasAnt.toLocaleString()}</TableCell>
                  <TableCell sx={{ px:'8px' }}>
                    <Box sx={{ display:'inline-block', px:'5px', py:'1px', borderRadius:'4px', fontSize:9, fontWeight: 500, background: up ? DL.greenBg : DL.redBg, color: up ? DL.green : DL.red }}>
                      {up ? '+' : ''}{r.crec}%
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, px:'8px', textAlign:'right' }}>{r.part}%</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.tM, px:'8px', textAlign:'right' }}>{r.articulos.toLocaleString()}</TableCell>
                  <TableCell sx={{ fontSize:10, color:DL.blue, px:'8px', textAlign:'right', whiteSpace:'nowrap' }}>Q{r.pendiente.toLocaleString()}</TableCell>
                  <TableCell sx={{ px:'8px' }}>
                    <Box sx={{ display:'flex', gap:'3px', flexWrap:'wrap' }}>
                      {r.cruzada.map(prod => {
                        const cc = CHIP_CFG[prod] || { bg:'rgba(26,26,26,.08)', color:DL.navy };
                        return (
                          <Box key={prod} sx={{ px:'5px', py:'1px', borderRadius:'4px', background:cc.bg }}>
                            <Typography sx={{ fontSize:8, fontWeight: 500, color:cc.color, whiteSpace:'nowrap' }}>{prod}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer */}
      <Box sx={{ px:'14px', py:'7px', borderTop:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography sx={{ fontSize:9, color:DL.tS }}>Mostrando 1–{rows.length} de {rows.length} Clientes</Typography>
        <Box sx={{ display:'flex', gap:'2px' }}>
          {['|◀','◀','1','▶','▶|'].map(b => (
            <Box key={b} component="button" sx={{ minWidth:24, height:24, borderRadius:'5px', border:`1px solid ${b==='1' ? DL.blue : DL.border}`, background: b==='1' ? DL.blue : '#fff', fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500, color: b==='1' ? '#fff' : DL.tM, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{b}</Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ALERTAS_SISTEMA data already uses { tier:'r'|'y'|'g', msg } — passed directly to shared component

// ─── BCG name → numeric ID map (for navigation to ClienteDetalle) ─────────────
const BCG_NAME_TO_ID = {
  'Textil Norte':    11287,
  'Christian B.':   15121,
  'Distribuidora K': 18934,
  'Farma Central':  30421,
  'Jaine Espi':     24181,
  'Gloria Mar':     13212,
  'Agro Soluciones': 22056,
};

// ─── BCG + Industria — tabbed panel ───────────────────────────────────────────
const Q_CFG = {
  'Interrogantes': { color:'#547e69', bg:'rgba(84,126,105,.08)', icon:'?', label:'Interrogantes' },
  'Estrellas':     { color:'#16a34a', bg:'rgba(22,163,74,.08)',  icon:'★', label:'Estrellas'     },
  'Perros':        { color:'#dc2626', bg:'rgba(220,38,38,.08)',  icon:'▼', label:'Perros'        },
  'Vacas Lecheras':{ color:'#d97706', bg:'rgba(217,119,6,.08)',  icon:'💰', label:'Vacas Lecheras' },
};
const Q_LAYOUT = ['Interrogantes','Estrellas','Perros','Vacas Lecheras'];

function AnalisisSection() {
  const navigate = useNavigate();
  const [tab,    setTab]    = useState('bcg');
  const [selQ,   setSelQ]   = useState(null);
  const [search, setSearch] = useState('');

  const qStats = useMemo(() => {
    const s = {};
    BCG_CLIENTS.forEach(c => {
      if (!s[c.quadrant]) s[c.quadrant] = { count:0, revenue:0 };
      s[c.quadrant].count++;
      s[c.quadrant].revenue += c.v;
    });
    return s;
  }, []);

  const maxRev = Math.max(...Object.values(qStats).map(q => q.revenue));

  const displayed = selQ ? BCG_CLIENTS.filter(c => c.quadrant === selQ) : BCG_CLIENTS;
  const totalRev  = displayed.reduce((s,c) => s + c.v, 0);

  return (
    <Paper elevation={1} sx={{ overflow:'hidden' }}>
      {/* ── Card header: title row ── */}
      <Box sx={{ px:'16px', pt:'10px', pb:'0', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
        <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:"'Inter',sans-serif" }}>
          Análisis de Segmentos
        </Typography>
        {/* Search — top right, only in BCG */}
        {tab === 'bcg' && (
          <Box sx={{ display:'flex', alignItems:'center', background:DL.subtle, border:`1px solid ${DL.border2}`, borderRadius:'6px', overflow:'hidden', '&:focus-within':{ borderColor:DL.blue } }}>
            <SearchIcon sx={{ fontSize:12, color:DL.tS, mx:'6px', opacity:.6 }} />
            <InputBase value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscador..." sx={{ fontFamily:"'Inter',sans-serif", fontSize:10, '& input':{ p:'4px 6px 4px 0', width:100 } }} />
          </Box>
        )}
      </Box>
      {/* ── Tabs: BCG | Industria — below title, top left ── */}
      <Box sx={{ display:'flex', borderBottom:`1px solid ${DL.border}`, px:'8px', background:'#fff' }}>
        {[{ value:'bcg', label:'BCG' }, { value:'industria', label:'Industria' }].map(t => (
          <Box key={t.value} component="button" onClick={() => setTab(t.value)} sx={{
            fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: tab===t.value ? 500 : 500,
            px:'12px', py:'7px', border:'none', background:'transparent', cursor:'pointer',
            borderBottom:`2px solid ${tab===t.value ? DL.blue : 'transparent'}`,
            mb:'-1px', color: tab===t.value ? DL.navy : DL.tS,
            transition:'all .14s', whiteSpace:'nowrap',
            '&:hover':{ color: DL.tM },
          }}>{t.label}</Box>
        ))}
      </Box>

      {/* ── BCG tab ── */}
      {tab === 'bcg' && (
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'260px 1fr' }, background:'#fff', maxHeight: 340, overflow:'hidden' }}>

        {/* ── Left: 2×2 matrix ─────────────────────────────────────────────── */}
        <Box sx={{ borderRight:`1px solid ${DL.border}`, p:'12px 16px 10px', display:'flex', flexDirection:'column' }}>
          <Box sx={{ display:'flex', gap:'6px', flex:1 }}>
            {/* Y-axis label */}
            <Box sx={{ display:'flex', flexDirection:'column', justifyContent:'space-between', alignItems:'center', width:18, pb:'4px' }}>
              <Typography sx={{ fontSize:8, color:DL.tS, writingMode:'vertical-rl', transform:'rotate(180deg)', whiteSpace:'nowrap', letterSpacing:'0.05em' }}>Alto crec. ↑</Typography>
              <Typography sx={{ fontSize:8, color:DL.tS, writingMode:'vertical-rl', transform:'rotate(180deg)', whiteSpace:'nowrap', letterSpacing:'0.05em' }}>↓ Bajo crec.</Typography>
            </Box>

            {/* 2×2 grid */}
            <Box sx={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', border:`1px solid rgba(26,26,26,.1)`, borderRadius:'6px', overflow:'hidden', minHeight:0 }}>
              {Q_LAYOUT.map((qKey, i) => {
                const cfg    = Q_CFG[qKey];
                const stats  = qStats[qKey] || { count:0, revenue:0 };
                const sz     = 56 + Math.round((stats.revenue / maxRev) * 34); // 56–90px
                const isSel  = selQ === qKey;
                return (
                  <Box key={qKey} onClick={() => setSelQ(isSel ? null : qKey)} sx={{
                    borderRight:  i % 2 === 0 ? `1px solid rgba(26,26,26,.1)` : 'none',
                    borderBottom: i < 2       ? `1px solid rgba(26,26,26,.1)` : 'none',
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    p:'14px', cursor:'pointer', transition:'background .15s',
                    background: isSel ? cfg.bg : 'transparent',
                    backgroundImage:'linear-gradient(rgba(26,26,26,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(26,26,26,.04) 1px,transparent 1px)',
                    backgroundSize:'22px 22px',
                    '&:hover':{ background: cfg.bg },
                  }}>
                    <Box sx={{
                      width:sz, height:sz, borderRadius:'50%', background:cfg.color,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow: isSel ? `0 4px 16px ${cfg.color}50` : `0 2px 8px ${cfg.color}30`,
                      mb:'8px', transition:'transform .2s, box-shadow .2s',
                      '&:hover':{ transform:'scale(1.05)' },
                    }}>
                      <Typography sx={{ fontSize: Math.round(sz * 0.38), fontWeight: 500, color:'#fff', lineHeight:1 }}>
                        {stats.count}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:cfg.color }}>{cfg.label}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* X-axis labels */}
          <Box sx={{ display:'flex', justifyContent:'space-between', mt:'6px', pl:'24px' }}>
            <Typography sx={{ fontSize:8, color:DL.tS, letterSpacing:'0.03em' }}>← Baja participación</Typography>
            <Typography sx={{ fontSize:8, color:DL.tS, letterSpacing:'0.03em' }}>Alta participación →</Typography>
          </Box>
        </Box>

        {/* ── Right: Ventas Cruzadas ───────────────────────────────────────── */}
        <Box sx={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <VentasCruzadasTable embedded search={search} setSearch={setSearch} />
        </Box>
      </Box>
      )}

      {/* ── Industria tab ── */}
      {tab === 'industria' && (
        <Box sx={{ p:'14px 16px' }}>
          <Typography sx={{ fontSize:9, color:DL.tS, mb:'10px' }}>
            Ventas, margen, ticket promedio y composición de clientes (Nuevos / Actuales / Abandonados)
          </Typography>
          <SegmentoTable />
          <Typography sx={{ fontSize:8, color:DL.tS, mt:'8px', fontStyle:'italic' }}>
            ⓘ Abandonados = clientes sin compra en los últimos 365 días. <span style={{ color:DL.blue, cursor:'pointer' }}>Parametrizar días →</span>
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

// ─── Invoice Modal ────────────────────────────────────────────────────────────
function InvoiceModalCli({ row, onClose }) {
  const { t } = useT();
  if (!row) return null;

  const fmt$m = (v) => '$' + Number(v).toLocaleString('en-US');
  const cobradoPct   = row.v > 0 ? Math.round(row.abono / row.v * 100) : 100;
  const pendientePct = 100 - cobradoPct;
  const mgColor      = row.mgPct >= 25 ? DL.green : row.mgPct >= 18 ? DL.yellow : DL.red;
  const fmtD = (d) => d ? d.split('-').reverse().join('/') : '—';

  const InfoRow = ({ label, value, valueStyle }) => (
    <Box sx={{ display:'flex', justifyContent:'space-between', py:'5px', borderBottom:'1px solid rgba(26,26,26,.05)', '&:last-child':{ borderBottom:'none' } }}>
      <Typography sx={{ fontSize:11, color:DL.tS, fontWeight:500 }}>{label}</Typography>
      <Typography sx={{ fontSize:11, color:DL.tH, fontWeight: 500, ...valueStyle }}>{value}</Typography>
    </Box>
  );

  const SecTitle = ({ children }) => (
    <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mb:'8px', mt:'4px' }}>
      <Box sx={{ width:12, height:2, borderRadius:2, background:`linear-gradient(90deg,${DL.blue},${DL.navy})` }} />
      <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.09em', color:DL.tS }}>{children}</Typography>
    </Box>
  );

  return (
    <Modal open onClose={onClose} closeAfterTransition slots={{ backdrop:Backdrop }}
      slotProps={{ backdrop:{ sx:{ background:'rgba(3,9,25,.5)' } } }}>
      <Box sx={{
        position:'absolute', top:'50%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:860, maxWidth:'96vw', maxHeight:'90vh',
        background:'#fff', borderRadius:'14px',
        boxShadow:'0 24px 64px rgba(0,0,70,.22)',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'mSlideIn .22s ease',
        '@keyframes mSlideIn':{ from:{ opacity:0, transform:'translate(-50%,calc(-50% + 12px)) scale(.98)' }, to:{ opacity:1, transform:'translate(-50%,-50%)' } },
      }}>
        {/* Header */}
        <Box sx={{ px:'24px', pt:'20px', pb:'14px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
          <Box>
            <Typography sx={{ fontSize:16, fontWeight: 500, color:DL.tH, letterSpacing:'-.02em' }}>Factura #{row.id}</Typography>
            <Typography sx={{ fontSize:11, color:DL.tS, mt:'2px' }}>{row.cli} · {fmtD(row.fecha)}</Typography>
          </Box>
          <Box component="button" onClick={onClose} sx={{ width:28, height:28, borderRadius:'7px', border:'none', background:'rgba(26,26,26,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:DL.tS, transition:'all .14s', '&:hover':{ background:DL.redBg, color:DL.red } }}>
            <CloseIcon sx={{ fontSize:16 }} />
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ flex:1, overflowY:'auto', p:'18px 24px', display:'flex', flexDirection:'column', gap:'16px', scrollbarWidth:'thin' }}>
          {/* NC banner */}
          {row.nc && (
            <Box sx={{ display:'flex', alignItems:'center', gap:'10px', p:'10px 14px', borderRadius:'8px', background:'#fff1f0', border:`1px solid ${DL.red}`, borderLeft:`4px solid ${DL.red}` }}>
              <Box sx={{ width:20, height:20, borderRadius:'50%', flexShrink:0, background:DL.redBg, color:DL.red, border:'1.5px solid #fca5a5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 500 }}>!</Box>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.red }}>Nota de Crédito aplicada: {fmt$m(Math.abs(row.nc))}</Typography>
            </Box>
          )}

          {/* Top 3 stat boxes */}
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
            {[
              { lbl:'Total Factura',    val:fmt$m(row.v),          sub:`${row.condpago} · ${row.pend===0 ? 'Pagada' : 'Pendiente'}`, valColor:DL.tH },
              { lbl:'Margen Bruto',     val:`${row.mgPct}%`,       sub:`${fmt$m(row.v - row.costo)} sobre costo`,                    valColor:mgColor },
              { lbl:'Saldo Pendiente',  val:fmt$m(row.pend),       sub:`Vence: ${fmtD(row.venc)}`,                                   valColor:row.pend>0?DL.red:DL.green },
            ].map(k => (
              <Box key={k.lbl} sx={{ background:'rgba(26,26,26,.03)', borderRadius:'10px', p:'14px 16px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.08em', color:DL.tS, mb:'6px' }}>{k.lbl}</Typography>
                <Typography sx={{ fontSize:26, fontWeight: 500, color:k.valColor, letterSpacing:'-.04em', lineHeight:1 }}>{k.val}</Typography>
                <Typography sx={{ fontSize:10, color:DL.tS, mt:'4px' }}>{k.sub}</Typography>
              </Box>
            ))}
          </Box>

          {/* 2-col info grid */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <Box>
              <SecTitle>Información del Cliente</SecTitle>
              <InfoRow label="Cliente"          value={row.cli} />
              <InfoRow label="Canal"            value={row.canal} />
              <InfoRow label="Vendedor"         value={row.vendFull} />
              <InfoRow label="Cond. de Pago"    value={row.condpago} />
            </Box>
            <Box>
              <SecTitle>Información de Factura</SecTitle>
              <InfoRow label="N° Factura"       value={row.nofac} />
              <InfoRow label="Tipo"             value={row.tipo} />
              <InfoRow label="Fecha Emisión"    value={fmtD(row.fecha)} />
              <InfoRow label="Fecha Vencimiento" value={fmtD(row.venc)} valueStyle={{ color: row.pend>0?DL.red:DL.tH }} />
            </Box>
          </Box>

          {/* Product lines */}
          <Box>
            <SecTitle>Detalle de Productos</SecTitle>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Producto','SKU','Cant.','P.U.','Total','Costo','Mg%'].map(h => (
                      <TableCell key={h} sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS, borderBottom:`2px solid rgba(26,26,26,.08)`, background:'rgba(26,26,26,.025)', px:'10px' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(row.lines || []).map((l, i) => (
                    <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                      <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, px:'10px' }}>{l.prod}</TableCell>
                      <TableCell sx={{ fontSize:10, color:DL.tS, px:'10px' }}>{l.sku}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tM, textAlign:'right', px:'10px' }}>{l.qty}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tM, textAlign:'right', px:'10px' }}>{fmt$m(l.pu)}</TableCell>
                      <TableCell sx={{ fontSize:11, fontWeight: 500, color:DL.tH, textAlign:'right', px:'10px' }}>{fmt$m(l.tot)}</TableCell>
                      <TableCell sx={{ fontSize:11, color:DL.tS, textAlign:'right', px:'10px' }}>{fmt$m(l.costo)}</TableCell>
                      <TableCell sx={{ px:'10px' }}><MgBadge mg={l.mg} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Footer: Rentabilidad + Estado de Cobro */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <Box>
              <SecTitle>Rentabilidad</SecTitle>
              <InfoRow label="Venta Neta"     value={fmt$m(row.v)} />
              <InfoRow label="Costo Total"    value={fmt$m(row.costo)} />
              <InfoRow label="Margen $"       value={fmt$m(row.v - row.costo)} />
              <InfoRow label="Margen %"       value={`${row.mgPct}%`} valueStyle={{ color:mgColor }} />
            </Box>
            <Box>
              <SecTitle>Estado de Cobro</SecTitle>
              <InfoRow label="Total Facturado" value={fmt$m(row.v)} />
              <InfoRow label="Total Abonado"   value={fmt$m(row.abono)} />
              <InfoRow label="Pendiente"       value={fmt$m(row.pend)} valueStyle={{ color: row.pend>0?DL.red:DL.green }} />
              <Box sx={{ mt:'10px' }}>
                <Box sx={{ height:10, background:DL.redBg, borderRadius:'6px', overflow:'hidden' }}>
                  <Box sx={{ height:'100%', background:DL.green, borderRadius:'6px', width:`${cobradoPct}%`, transition:'width .8s ease' }} />
                </Box>
                <Box sx={{ display:'flex', justifyContent:'space-between', mt:'4px' }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.green }}>Pagado {cobradoPct}%</Typography>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color: row.pend>0?DL.red:DL.tS }}>Pendiente {pendientePct}%</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

// ─── Detalle de Ventas table ──────────────────────────────────────────────────
const DET_COLS_CLI = [
  { key:'id',    labelKey:'col.idFactura',   fixed:true,  vis:true  },
  { key:'cli',   labelKey:'col.cliente',     fixed:true,  vis:true  },
  { key:'nofac', labelKey:'col.nofactura',   fixed:false, vis:true  },
  { key:'fecha', labelKey:'col.fecha',       fixed:false, vis:true  },
  { key:'venc',  labelKey:'col.vencimiento', fixed:false, vis:true  },
  { key:'qty',   labelKey:'col.cant',        fixed:false, vis:true  },
  { key:'v',     labelKey:'col.ventaS',      fixed:false, vis:true  },
  { key:'nc',    labelKey:'col.nc',          fixed:false, vis:true  },
  { key:'costo', labelKey:'col.costoS',      fixed:false, vis:true  },
  { key:'mgPct', labelKey:'col.margenPct',   fixed:false, vis:true  },
  { key:'abono', labelKey:'col.abono',       fixed:false, vis:true  },
  { key:'pend',  labelKey:'col.pendiente',   fixed:false, vis:true  },
];

const DET_PAGE_SIZE = 8;

function DetClientes() {
  const { t } = useT();
  const [tab,       setTab]       = useState('todas');
  const [search,    setSearch]    = useState('');
  const [page,      setPage]      = useState(0);
  const [cols,      setCols]      = useState(DET_COLS_CLI.map(c => ({ ...c })));
  const [colOpen,   setColOpen]   = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const colRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (colRef.current && !colRef.current.contains(e.target)) setColOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const today = new Date();
  const isVenc = (v) => v && new Date(v) < today;
  const fmtDate = (d) => d ? d.split('-').reverse().join('/') : '—';
  const fmt$ = (v) => '$' + Number(v).toLocaleString('en-US');

  const filtered = useMemo(() => {
    let rows = DET_ROWS_CLI;
    if (tab === 'pagadas')    rows = rows.filter(r => r.pend === 0);
    if (tab === 'pendientes') rows = rows.filter(r => r.pend > 0);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.cli.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.nofac.toLowerCase().includes(q));
    }
    return rows;
  }, [tab, search]);

  const totalPages = Math.ceil(filtered.length / DET_PAGE_SIZE);
  const slice = filtered.slice(page * DET_PAGE_SIZE, (page + 1) * DET_PAGE_SIZE);
  const visCols = cols.filter(c => c.vis);

  const handleTab = (newTab) => { setTab(newTab); setPage(0); };

  const renderCell = (r, key) => {
    const RIGHT = ['qty','v','costo','mgPct','abono','pend'];
    switch (key) {
      case 'id':    return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, whiteSpace:'nowrap' }}>{r.id}</Typography>;
      case 'cli':   return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH }}>{r.cli}</Typography>;
      case 'nofac': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{r.nofac || '—'}</Typography>;
      case 'fecha': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{fmtDate(r.fecha)}</Typography>;
      case 'venc':  return <Typography sx={{ fontSize:10, whiteSpace:'nowrap', color: r.pend>0&&isVenc(r.venc)?DL.red:DL.tS, fontWeight: r.pend>0&&isVenc(r.venc)?500:400 }}>{fmtDate(r.venc)}</Typography>;
      case 'qty':   return <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH }}>{r.qty ?? '—'}</Typography>;
      case 'v':     return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, whiteSpace:'nowrap' }}>{fmt$(r.v)}</Typography>;
      case 'nc':    return r.nc ? (
        <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:'#fef2f2', border:'1px solid #fca5a5' }}>
          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red, whiteSpace:'nowrap' }}>NC {fmt$(r.nc)}</Typography>
        </Box>
      ) : <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>;
      case 'costo': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.costo)}</Typography>;
      case 'mgPct': {
        const dot = r.mgPct >= 25 ? DL.green : r.mgPct >= 18 ? DL.yellow : DL.red;
        return (
          <Box sx={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
            <Box sx={{ width:6, height:6, borderRadius:'50%', background:dot, flexShrink:0 }} />
            <Typography sx={{ fontSize:10, fontWeight: 500, color:dot }}>{r.mgPct}%</Typography>
          </Box>
        );
      }
      case 'abono': return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.abono>0?DL.green:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.abono)}</Typography>;
      case 'pend':  return <Typography sx={{ fontSize:10, fontWeight: 500, color:r.pend>0?DL.red:DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.pend)}</Typography>;
      default: return null;
    }
  };

  const thSx = { background:'rgba(26,26,26,.025)', borderBottom:'2px solid rgba(26,26,26,.08)', px:'10px', py:'8px', whiteSpace:'nowrap', fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS };
  const RIGHT_KEYS = ['qty','v','costo','mgPct','abono','pend'];

  return (
    <Paper elevation={1} sx={{ overflow:'hidden' }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}`, gap:'8px', flexWrap:'wrap' }}>
        {/* Title + tabs */}
        <Box sx={{ display:'flex', alignItems:'center', gap:'0px' }}>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, mr:'16px' }}>Detalles de Venta</Typography>
          {['todas','pagadas','pendientes'].map(tb => (
            <Box key={tb} component="button" onClick={() => handleTab(tb)} sx={{
              fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: tab===tb ? 500 : 500,
              px:'12px', py:'6px', border:'none', background:'transparent', cursor:'pointer',
              color: tab===tb ? DL.navy : DL.tS,
              borderBottom:`2px solid ${tab===tb ? DL.blue : 'transparent'}`,
              transition:'all .14s', whiteSpace:'nowrap',
              '&:hover':{ color:DL.tM },
            }}>{tb.charAt(0).toUpperCase() + tb.slice(1)}</Box>
          ))}
        </Box>
        {/* Right: search + cols */}
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <Box sx={{ display:'flex', alignItems:'center', background:DL.subtle, border:`1px solid ${DL.border2}`, borderRadius:'7px', overflow:'hidden', '&:focus-within':{ borderColor:DL.blue } }}>
            <SearchIcon sx={{ fontSize:13, color:DL.tS, mx:'7px', opacity:.6 }} />
            <InputBase value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscador..." sx={{ fontFamily:"'Inter',sans-serif", fontSize:10, '& input':{ p:'5px 8px 5px 0', width:160 } }} />
          </Box>
          <Box ref={colRef} sx={{ position:'relative' }}>
            <Box onClick={() => setColOpen(o => !o)} sx={{ display:'flex', alignItems:'center', gap:'5px', px:'10px', py:'6px', borderRadius:'7px', border:`1px solid ${colOpen ? DL.blue : DL.border}`, background: colOpen ? 'rgba(84,126,105,.06)' : '#fff', cursor:'pointer', '&:hover':{ background:'rgba(84,126,105,.04)' } }}>
              <Typography sx={{ fontSize:10, fontWeight: 500, color: colOpen ? DL.blue : DL.tM }}>⊞ Columnas</Typography>
            </Box>
            {colOpen && (
              <Box sx={{ position:'absolute', top:'calc(100% + 4px)', right:0, zIndex:300, background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'8px', boxShadow:'0 6px 20px rgba(0,0,0,.1)', p:'10px 12px', minWidth:180 }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', mb:'8px' }}>Columnas visibles</Typography>
                {cols.filter(c => !c.fixed).map(c => (
                  <Box key={c.key} onClick={() => setCols(prev => prev.map(col => col.key===c.key ? {...col, vis:!col.vis} : col))} sx={{ display:'flex', alignItems:'center', gap:'8px', py:'4px', px:'4px', borderRadius:'5px', cursor:'pointer', '&:hover':{ background:DL.subtle } }}>
                    <Box sx={{ width:14, height:14, borderRadius:'3px', border:`2px solid ${c.vis ? DL.blue : DL.border}`, background: c.vis ? DL.blue : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {c.vis && <Typography sx={{ fontSize:9, color:'#fff', lineHeight:1, fontWeight: 500 }}>✓</Typography>}
                    </Box>
                    <Typography sx={{ fontSize:10, color: c.vis ? DL.tH : DL.tS }}>{t(c.labelKey)}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small" sx={{ minWidth:900 }}>
          <TableHead>
            <TableRow>
              {visCols.map(c => (
                <TableCell key={c.key} sx={{ ...thSx, textAlign: RIGHT_KEYS.includes(c.key) ? 'right' : 'left' }}>
                  {t(c.labelKey)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {slice.map((r, i) => (
              <TableRow key={i} onClick={() => setSelectedRow(r)} sx={{ borderBottom:'1px solid rgba(26,26,26,.05)', '&:hover td':{ background:'rgba(84,126,105,.025)' }, cursor:'pointer' }}>
                {visCols.map(c => (
                  <TableCell key={c.key} sx={{ px:'10px', py:'9px', textAlign: RIGHT_KEYS.includes(c.key) ? 'right' : 'left' }}>
                    {renderCell(r, c.key)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ px:'14px', py:'9px', borderTop:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography sx={{ fontSize:9, color:DL.tS }}>
          {filtered.length === 0 ? '0 registros' : `${page*DET_PAGE_SIZE+1}–${Math.min((page+1)*DET_PAGE_SIZE, filtered.length)} de ${filtered.length} facturas`}
        </Typography>
        <Box sx={{ display:'flex', gap:'3px', alignItems:'center' }}>
          {[
            { icon:'|◀', action:() => setPage(0),                        disabled: page===0 },
            { icon:'◀',  action:() => setPage(p => Math.max(0,p-1)),     disabled: page===0 },
            { icon: String(page+1), action: null, active: true },
            { icon:'▶',  action:() => setPage(p => Math.min(totalPages-1,p+1)), disabled: page>=totalPages-1 },
            { icon:'▶|', action:() => setPage(totalPages-1),              disabled: page>=totalPages-1 },
          ].map((b, idx) => (
            <Box key={idx} component="button" onClick={b.action || undefined} disabled={b.disabled}
              sx={{ minWidth:26, height:26, borderRadius:'5px', border:`1px solid ${b.active ? DL.blue : DL.border}`, background: b.active ? DL.blue : '#fff', fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight: 500, color: b.active ? '#fff' : DL.tM, cursor: b.disabled ? 'default' : 'pointer', opacity: b.disabled ? .4 : 1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {b.icon}
            </Box>
          ))}
        </Box>
      </Box>
      {selectedRow && <InvoiceModalCli row={selectedRow} onClose={() => setSelectedRow(null)} />}
    </Paper>
  );
}

// ─── Cuentas por Cobrar ───────────────────────────────────────────────────────
function CuentasPorCobrar() {
  const { total, facturas, deltaVsAnt, porVencer, vencidas, porVencerFacturas, vencidasFacturas, agingPorVencer, agingVencidas } = CXC_DATA;

  const fmt$  = (v) => `$${Number(v).toLocaleString()}`;
  const pvPct = Math.round((porVencer / total) * 100);
  const totalPV = agingPorVencer.reduce((s, a) => s + a.monto, 0);
  const totalVC = agingVencidas.reduce((s, a)  => s + a.monto, 0);

  return (
    <Box>
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 1.4fr' }, gap:'12px' }}>

        {/* ── Left: CxC summary ── */}
        <Paper elevation={1} sx={{ p:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
          {/* Title row + toggle */}
          <Box sx={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px' }}>
            <Box>
              <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>Cuentas Por Cobrar</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS }}>Estado de cartera del período</Typography>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
              <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.blue }}>{facturas}</Typography>
              <Typography sx={{ fontSize:10, color:DL.tS }}>Facturas</Typography>
            </Box>
          </Box>

          {/* Big value */}
          <Box>
            <Box sx={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
              <Typography sx={{ fontSize:28, fontWeight: 500, color:DL.tH, letterSpacing:'-.04em', lineHeight:1 }}>
                {fmt$(total)}
              </Typography>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tS }}>
                {facturas} facturas
              </Typography>
            </Box>
            <Box sx={{ mt:'6px', display:'inline-flex', alignItems:'center', gap:'5px', px:'8px', py:'3px', borderRadius:'6px', background:DL.redBg, border:`1px solid rgba(220,38,38,.2)` }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red }}>⚠ {deltaVsAnt} vs julio — Acción Requerida</Typography>
            </Box>
          </Box>

          {/* Split bar */}
          <Box>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:'4px' }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.green }}>Por Vencer</Typography>
              <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.red }}>Vencidas</Typography>
            </Box>
            <Box sx={{ height:8, borderRadius:4, overflow:'hidden', background:DL.redBg, display:'flex' }}>
              <Box sx={{ width:`${pvPct}%`, background:DL.green, borderRadius:'4px 0 0 4px', transition:'width .6s ease' }} />
            </Box>
          </Box>

          {/* Two mini sub-cards */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[
              { label:'Por Vencer', monto:porVencer,  nFac:porVencerFacturas, delta:'-8% vs julio', color:DL.green, bg:DL.greenBg, pct: Math.round(porVencer/total*100) },
              { label:'Vencidas',   monto:vencidas,   nFac:vencidasFacturas,  delta:'+8% vs julio', color:DL.red,   bg:DL.redBg,   pct: Math.round(vencidas/total*100)  },
            ].map(card => (
              <Box key={card.label} sx={{ p:'10px', borderRadius:'8px', background:card.bg, border:`1px solid ${card.color}25` }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS, mb:'4px' }}>{card.label}</Typography>
                <Box sx={{ display:'flex', alignItems:'baseline', gap:'5px' }}>
                  <Typography sx={{ fontSize:16, fontWeight: 500, color:card.color, letterSpacing:'-.03em', lineHeight:1 }}>{fmt$(card.monto)}</Typography>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:card.color, opacity:.7 }}>Q{card.nFac}</Typography>
                </Box>
                <Typography sx={{ fontSize:8, color:DL.tS, mt:'3px' }}>{card.delta} · Acción Requerida</Typography>
                <Box sx={{ mt:'6px', height:5, borderRadius:3, overflow:'hidden', background:`${card.color}20` }}>
                  <Box sx={{ height:'100%', borderRadius:3, width:`${card.pct}%`, background:card.color, transition:'width .6s ease' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ── Right: Aging ── */}
        {(() => {
          const grandTotal    = totalPV + totalVC;
          const vcPct         = Math.round(totalVC / grandTotal * 100);
          const totalFacPV    = agingPorVencer.reduce((s,t) => s + t.facturas, 0);
          const totalFacVC    = agingVencidas.reduce((s,t)  => s + t.facturas, 0);
          const v61plus       = agingVencidas.filter(t => t.label==='61–90 días' || t.label==='90+ días');
          const dash = <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:"'Inter',sans-serif", textAlign:'center' }}>—</Typography>;

          // Helper: render $amount + Q count together
          const AmtQ = ({ monto, nFac, color }) => (
            <Box sx={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
              <Typography sx={{ fontSize:11, fontWeight: 500, color, fontFamily:"'Inter',sans-serif", whiteSpace:'nowrap' }}>
                {fmt$(monto)}
              </Typography>
              <Typography sx={{ fontSize:8, fontWeight: 500, color, opacity:.6, fontFamily:"'Inter',sans-serif" }}>
                Q{nFac}
              </Typography>
            </Box>
          );

          const TABLE_ROWS = [
            {
              label: '1–30 días',
              vigente: { monto: totalPV, facturas: totalFacPV },
              vencido: agingVencidas.find(t=>t.label==='1–30 días') || { monto:0, facturas:0 },
            },
            {
              label: '31–60 días',
              vigente: null,
              vencido: agingVencidas.find(t=>t.label==='31–60 días') || { monto:0, facturas:0 },
            },
            {
              label: '61+ días',
              vigente: null,
              vencido: { monto: v61plus.reduce((s,t)=>s+t.monto,0), facturas: v61plus.reduce((s,t)=>s+t.facturas,0) },
            },
          ];

          const hdSx = { fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:"'Inter',sans-serif", textAlign:'right' };

          return (
            <Paper elevation={1} sx={{ borderRadius:'10px', border:`1px solid ${DL.border}`, overflow:'hidden' }}>
              {/* Header */}
              <Box sx={{ px:'14px', pt:'12px', pb:'10px' }}>
                <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:"'Inter',sans-serif" }}>Antigüedad de Facturas</Typography>
              </Box>

              {/* Big total */}
              <Box sx={{ px:'14px', pb:'10px' }}>
                <Box sx={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                  <Typography sx={{ fontSize:26, fontWeight: 500, color:DL.tH, fontFamily:"'Inter',sans-serif", letterSpacing:'-.04em', lineHeight:1 }}>
                    {fmt$(grandTotal)}
                  </Typography>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tS, fontFamily:"'Inter',sans-serif" }}>
                    Q{totalFacPV + totalFacVC}
                  </Typography>
                </Box>
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mt:'4px' }}>
                  <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:"'Inter',sans-serif" }}>
                    Vencido: <strong style={{ color:DL.red }}>{fmt$(totalVC)}</strong>
                  </Typography>
                  <Box sx={{ px:'7px', py:'2px', borderRadius:'4px', background:'#fff7ed', border:'1px solid #fed7aa' }}>
                    <Typography sx={{ fontSize:8, fontWeight: 500, color:'#c2410c', fontFamily:"'Inter',sans-serif" }}>
                      {vcPct}% vencido
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mt:'6px', height:4, borderRadius:2, background:DL.greenBg, overflow:'hidden' }}>
                  <Box sx={{ height:'100%', width:`${vcPct}%`, background:'#f97316', borderRadius:2, transition:'width .6s ease' }} />
                </Box>
              </Box>

              {/* Table */}
              <Box sx={{ mx:'14px', mb:'12px', borderRadius:'8px', border:`1px solid ${DL.border}`, overflow:'hidden' }}>
                <Box sx={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr', gap:'8px', px:'12px', py:'7px', background:'#f8fafc', borderBottom:`1px solid ${DL.border}` }}>
                  <Typography sx={{ ...hdSx, textAlign:'left' }}>PERÍODO</Typography>
                  <Typography sx={{ ...hdSx, color:DL.blue }}>VIGENTE</Typography>
                  <Typography sx={{ ...hdSx, color:DL.red }}>VENCIDO</Typography>
                  <Typography sx={{ ...hdSx }}>TOTAL</Typography>
                </Box>
                {TABLE_ROWS.map(row => {
                  const rowTotal  = (row.vigente?.monto || 0) + row.vencido.monto;
                  const rowFacTot = (row.vigente?.facturas || 0) + row.vencido.facturas;
                  return (
                    <Box key={row.label} sx={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr', gap:'8px', px:'12px', py:'9px', borderBottom:`1px solid ${DL.border}`, '&:last-child':{ borderBottom:'none' }, '&:hover':{ background:'#f6f6f6' } }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM, fontFamily:"'Inter',sans-serif" }}>{row.label}</Typography>
                      {row.vigente ? <AmtQ monto={row.vigente.monto} nFac={row.vigente.facturas} color={DL.blue} /> : dash}
                      <AmtQ monto={row.vencido.monto} nFac={row.vencido.facturas} color={DL.red} />
                      <AmtQ monto={rowTotal} nFac={rowFacTot} color={DL.tH} />
                    </Box>
                  );
                })}
                {/* Total row */}
                <Box sx={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr 1fr', gap:'8px', px:'12px', py:'9px', background:'#f8fafc', borderTop:`1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:"'Inter',sans-serif" }}>TOTAL</Typography>
                  <AmtQ monto={totalPV} nFac={totalFacPV} color={DL.blue} />
                  <AmtQ monto={totalVC} nFac={totalFacVC} color={DL.red} />
                  <AmtQ monto={grandTotal} nFac={totalFacPV + totalFacVC} color={DL.tH} />
                </Box>
              </Box>

            </Paper>
          );
        })()}
      </Box>
    </Box>
  );
}

// ─── CREDIT CAT config ────────────────────────────────────────────────────────
const CAT_CFG = {
  AA: { color:'#16a34a', bg:'rgba(22,163,74,.12)',  label:'AA' },
  A:  { color:'#547e69', bg:'rgba(84,126,105,.12)', label:'A'  },
  B:  { color:'#d97706', bg:'rgba(217,119,6,.12)',  label:'B'  },
  C:  { color:'#ea580c', bg:'rgba(234,88,12,.12)',  label:'C'  },
  D:  { color:'#dc2626', bg:'rgba(220,38,38,.12)',  label:'D'  },
};

const PAGE_SIZE_CARTERA = 5;

function CarteraClientes() {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(0);
  const [sortKey,    setSortKey]    = useState('diasVencido');
  const [sortDir,    setSortDir]    = useState('desc');
  const [colOpen,    setColOpen]    = useState(false);
  const colRef = useRef(null);

  const ALL_COLS = [
    { key: '#',            label: '#',                  sortable: false, align: 'left',  fixed: true,  vis: true  },
    { key: 'name',         label: 'Cliente',            sortable: true,  align: 'left',  fixed: true,  vis: true  },
    { key: 'seg',          label: 'Categoría',          sortable: true,  align: 'left',  fixed: false, vis: true  },
    { key: 'creditCat',    label: 'Clasificación',      sortable: true,  align: 'left',  fixed: false, vis: true  },
    { key: 'utilPct',      label: 'Crédito Utilizado',  sortable: true,  align: 'right', fixed: false, vis: true  },
    { key: 'proxCobro',    label: 'Próx. Cobro',        sortable: true,  align: 'left',  fixed: false, vis: true  },
    { key: 'diasVencido',  label: 'Días Vencido',       sortable: true,  align: 'left',  fixed: false, vis: true  },
    { key: 'cxcTotal',     label: 'CxC Total',           sortable: true,  align: 'right', fixed: false, vis: true  },
    { key: 'pend',         label: 'Pendiente CxC',      sortable: true,  align: 'right', fixed: false, vis: true  },
    { key: 'montoVenc',    label: 'Pend. CxC Vencida',  sortable: true,  align: 'right', fixed: false, vis: true  },
    { key: 'facPagadas',   label: 'Fac. Pagadas',       sortable: true,  align: 'center',fixed: false, vis: true  },
    { key: 'facPendNoVenc',label: 'Fac. Pend. (No Venc.)',sortable:true, align: 'center',fixed: false, vis: true  },
    { key: 'factVenc',     label: 'Fac. Vencidas',      sortable: true,  align: 'center',fixed: false, vis: true  },
    { key: 'ultimaCompra', label: 'Última Compra',      sortable: true,  align: 'left',  fixed: false, vis: true  },
    { key: 'ultimoPago',   label: 'Último Pago',        sortable: true,  align: 'left',  fixed: false, vis: true  },
  ];
  const [cols, setCols] = useState(ALL_COLS.map(c => ({ ...c })));
  const visCols = cols.filter(c => c.vis);

  useEffect(() => {
    const h = (e) => { if (colRef.current && !colRef.current.contains(e.target)) setColOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const filtered = useMemo(() => {
    if (!search) return CLIENTES_DET;
    const q = search.toLowerCase();
    return CLIENTES_DET.filter(r => r.name.toLowerCase().includes(q) || r.seg.toLowerCase().includes(q));
  }, [search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av, bv;
      if (sortKey === 'utilPct') {
        av = a.limiteCredito > 0 ? a.utilizadoCredito / a.limiteCredito : 0;
        bv = b.limiteCredito > 0 ? b.utilizadoCredito / b.limiteCredito : 0;
      } else if (sortKey === 'cxcTotal') {
        av = a.utilizadoCredito ?? 0;
        bv = b.utilizadoCredito ?? 0;
      } else if (['seg','name','creditCat','proxCobro','ultimaCompra','ultimoPago'].includes(sortKey)) {
        av = a[sortKey] || '';
        bv = b[sortKey] || '';
      } else {
        av = a[sortKey] ?? 0;
        bv = b[sortKey] ?? 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE_CARTERA);
  const pageRows   = sorted.slice(page * PAGE_SIZE_CARTERA, (page + 1) * PAGE_SIZE_CARTERA);

  const fmt$ = (v) => v != null ? '$' + Number(v).toLocaleString('en-US') : '—';

  const thSx = {
    background:'rgba(26,26,26,.02)', borderBottom:`1px solid ${DL.border}`,
    px:'10px', py:'8px', whiteSpace:'nowrap', fontSize:8, fontWeight: 500,
    textTransform:'uppercase', letterSpacing:'0.06em', color:DL.tS,
    userSelect:'none',
  };

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null;
    const active = sortKey === col.key;
    return (
      <Box component="span" sx={{ ml:'3px', opacity: active ? 1 : 0.3, fontSize:9, lineHeight:1 }}>
        {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </Box>
    );
  };

  return (
    <Paper elevation={1} sx={{ overflow:'hidden' }}>
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}`, gap:'8px', flexWrap:'wrap' }}>
        <Box>
          <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH }}>Cartera de Clientes</Typography>
          <Typography sx={{ fontSize:9, color:DL.tS, mt:'1px' }}>Prioridad: vencidos → mayor utilización de crédito</Typography>
        </Box>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Box sx={{ display:'flex', alignItems:'center', background:DL.subtle, border:`1px solid ${DL.border2}`, borderRadius:'7px', overflow:'hidden', '&:focus-within':{ borderColor:DL.blue } }}>
            <SearchIcon sx={{ fontSize:13, color:DL.tS, mx:'7px', opacity:.6 }} />
            <InputBase value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Buscar cliente..." sx={{ fontFamily:"'Inter',sans-serif", fontSize:10, '& input':{ p:'5px 8px 5px 0', width:160 } }} />
          </Box>
          {/* Columnas button */}
          <Box ref={colRef} sx={{ position:'relative' }}>
            <Box component="button" onClick={() => setColOpen(o => !o)} sx={{
              fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
              px:'10px', py:'5px', borderRadius:'7px',
              border:`1px solid ${DL.border2}`, background: colOpen ? 'rgba(84,126,105,.08)' : '#fff',
              color: colOpen ? DL.blue : DL.tM, cursor:'pointer',
              display:'flex', alignItems:'center', gap:'5px', transition:'all .14s', flexShrink:0,
              '&:hover':{ borderColor:DL.blue, color:DL.navy },
            }}>
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5px', width:10 }}>
                {[0,1,2,3].map(i => <Box key={i} sx={{ width:4, height:4, background:'currentColor', borderRadius:.5, opacity:.7 }} />)}
              </Box>
              Columnas
            </Box>
            {colOpen && (
              <Box sx={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:300, background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,.1)', p:'12px', minWidth:200 }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', mb:'8px' }}>Columnas visibles</Typography>
                {cols.filter(c => !c.fixed).map(col => (
                  <Box key={col.key} onClick={() => setCols(prev => prev.map(c => c.key === col.key ? { ...c, vis: !c.vis } : c))}
                    sx={{ display:'flex', alignItems:'center', gap:'7px', py:'5px', px:'4px', cursor:'pointer', borderRadius:'5px', '&:hover':{ background:DL.subtle } }}>
                    <Box sx={{ width:14, height:14, borderRadius:'4px', border:`1.5px solid ${col.vis ? DL.blue : DL.border2}`, background: col.vis ? DL.blue : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                      {col.vis && <Box sx={{ width:8, height:8, color:'#fff', fontSize:9, lineHeight:1, fontWeight: 500, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</Box>}
                    </Box>
                    <Typography sx={{ fontSize:10, fontWeight:500, color:DL.tM }}>{col.label}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table size="small" sx={{ minWidth:900 }}>
          <TableHead>
            <TableRow>
              {visCols.map(col => (
                <TableCell key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  sx={{ ...thSx, textAlign: col.align, cursor: col.sortable ? 'pointer' : 'default',
                    '&:hover': col.sortable ? { color: DL.navy } : {},
                    color: sortKey === col.key ? DL.navy : DL.tS,
                  }}>
                  {col.label}<SortIcon col={col} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((r, i) => {
              const globalIdx  = page * PAGE_SIZE_CARTERA + i + 1;
              const cat        = CAT_CFG[r.creditCat] || CAT_CFG.B;
              const utilPct    = r.limiteCredito > 0 ? Math.round((r.utilizadoCredito / r.limiteCredito) * 100) : 0;
              const barColor   = utilPct >= 90 ? DL.red : utilPct >= 70 ? DL.yellow : DL.green;
              const isOverdue  = r.diasVencido > 0;
              const vcColor    = r.diasVencido >= 60 ? DL.red : r.diasVencido >= 30 ? '#ea580c' : DL.yellow;

              const renderCell = (key) => {
                switch (key) {
                  case '#': return (
                    <Box sx={{ width:22, height:22, borderRadius:'50%', background:'rgba(26,26,26,.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS }}>{globalIdx}</Typography>
                    </Box>
                  );
                  case 'name': return <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, lineHeight:1.2 }}>{r.name}</Typography>;
                  case 'seg': return (
                    <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'5px', background:`${r.segColor}18`, border:`1px solid ${r.segColor}30` }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:r.segColor, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{r.seg}</Typography>
                    </Box>
                  );
                  case 'creditCat': return (
                    <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'6px', background:cat.bg }}>
                      <Typography sx={{ fontSize:11, fontWeight: 500, color:cat.color }}>{cat.label}</Typography>
                    </Box>
                  );
                  case 'utilPct': return (
                    <Box sx={{ display:'flex', alignItems:'center', gap:'7px', justifyContent:'flex-end' }}>
                      <Box sx={{ flex:1, maxWidth:80 }}>
                        <Box sx={{ height:5, borderRadius:3, overflow:'hidden', background:'rgba(26,26,26,.07)' }}>
                          <Box sx={{ height:'100%', width:`${Math.min(utilPct,100)}%`, background:barColor, borderRadius:3, transition:'width .5s' }} />
                        </Box>
                        <Typography sx={{ fontSize:8, color:DL.tS, mt:'2px', textAlign:'right' }}>{fmt$(r.utilizadoCredito)} / {fmt$(r.limiteCredito)}</Typography>
                      </Box>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:barColor, minWidth:30, textAlign:'right' }}>{utilPct}%</Typography>
                    </Box>
                  );
                  case 'proxCobro': return (
                    <Typography sx={{ fontSize:10, color: r.proxCobro ? DL.tM : DL.tS, fontWeight: r.proxCobro ? 500 : 400, whiteSpace:'nowrap' }}>
                      {r.proxCobro || '—'}
                    </Typography>
                  );
                  case 'diasVencido': return isOverdue ? (
                    <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'5px', background:`${vcColor}12`, border:`1px solid ${vcColor}30` }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:vcColor, whiteSpace:'nowrap' }}>+{r.diasVencido}d</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'5px', background:'rgba(22,163,74,.08)' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.green }}>Al día</Typography>
                    </Box>
                  );
                  case 'cxcTotal': return (
                    <Typography sx={{ fontSize:11, fontWeight: 500, color: DL.tH, whiteSpace:'nowrap' }}>{fmt$(r.utilizadoCredito)}</Typography>
                  );
                  case 'pend': return (
                    <Typography sx={{ fontSize:11, fontWeight: 500, color: r.pend > 0 ? DL.red : DL.tS, whiteSpace:'nowrap' }}>{fmt$(r.pend)}</Typography>
                  );
                  case 'montoVenc': return (
                    <Typography sx={{ fontSize:11, fontWeight: 500, color: r.montoVenc > 0 ? DL.red : DL.tS, whiteSpace:'nowrap' }}>{r.montoVenc > 0 ? fmt$(r.montoVenc) : '$0'}</Typography>
                  );
                  case 'facPagadas': return (
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'5px', background:'rgba(22,163,74,.1)', border:'1px solid rgba(22,163,74,.2)' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.green }}>{r.facPagadas ?? 0}</Typography>
                    </Box>
                  );
                  case 'facPendNoVenc': return (
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'5px', background:'rgba(84,126,105,.1)', border:'1px solid rgba(84,126,105,.2)' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue }}>{r.facPendNoVenc ?? 0}</Typography>
                    </Box>
                  );
                  case 'factVenc': return r.factVenc > 0 ? (
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'5px', background:'rgba(220,38,38,.1)', border:'1px solid rgba(220,38,38,.2)' }}>
                      <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red }}>{r.factVenc}</Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize:10, color:DL.tS }}>—</Typography>
                  );
                  case 'ultimaCompra': return <Typography sx={{ fontSize:10, color:DL.tS, whiteSpace:'nowrap' }}>{r.ultimaCompra || '—'}</Typography>;
                  case 'ultimoPago': return (
                    <Typography sx={{ fontSize:10, color: r.ultimoPago ? DL.tS : DL.red, fontWeight: r.ultimoPago ? 400 : 500, whiteSpace:'nowrap' }}>
                      {r.ultimoPago || 'Sin pago'}
                    </Typography>
                  );
                  default: return null;
                }
              };

              return (
                <TableRow key={r.id} onClick={() => navigate(`/clientes/${r.id}`)}
                  sx={{ borderBottom:`1px solid ${DL.border}`, '&:hover td':{ background:'rgba(84,126,105,.025)' }, cursor:'pointer' }}>
                  {visCols.map(col => (
                    <TableCell key={col.key} sx={{ px:'10px', py:'9px', textAlign: col.align }}>
                      {renderCell(col.key)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer — paginación */}
      <Box sx={{ px:'14px', py:'8px', borderTop:`1px solid ${DL.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Typography sx={{ fontSize:9, color:DL.tS }}>
          Mostrando {page * PAGE_SIZE_CARTERA + 1}–{Math.min((page + 1) * PAGE_SIZE_CARTERA, sorted.length)} de {sorted.length} clientes
        </Typography>
        <Box sx={{ display:'flex', gap:'3px', alignItems:'center' }}>
          {[
            { label:'«', disabled: page === 0,             action: () => setPage(0) },
            { label:'‹', disabled: page === 0,             action: () => setPage(p => p - 1) },
            { label:'›', disabled: page >= totalPages - 1, action: () => setPage(p => p + 1) },
            { label:'»', disabled: page >= totalPages - 1, action: () => setPage(totalPages - 1) },
          ].map((btn, i) => (
            <Box key={i} component="button" onClick={btn.action} disabled={btn.disabled} sx={{
              width:26, height:26, borderRadius:'5px', border:`1px solid ${DL.border}`,
              background:'#fff', fontFamily:"'Inter',sans-serif", fontSize:11,
              fontWeight: 500, color: btn.disabled ? DL.tS : DL.navy,
              cursor: btn.disabled ? 'default' : 'pointer', opacity: btn.disabled ? 0.35 : 1,
              display:'flex', alignItems:'center', justifyContent:'center',
              '&:hover': !btn.disabled ? { background:'rgba(26,26,26,.05)', borderColor:DL.blue } : {},
            }}>{btn.label}</Box>
          ))}
          <Box sx={{ mx:'4px', display:'flex', gap:'2px' }}>
            {Array.from({ length: totalPages }, (_, idx) => (
              <Box key={idx} component="button" onClick={() => setPage(idx)} sx={{
                width:26, height:26, borderRadius:'5px',
                border:`1px solid ${idx === page ? DL.blue : DL.border}`,
                background: idx === page ? DL.blue : '#fff',
                fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight: 500,
                color: idx === page ? '#fff' : DL.tM,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                '&:hover': idx !== page ? { background:'rgba(26,26,26,.05)' } : {},
              }}>{idx + 1}</Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Clientes() {
  const { t } = useT();
  const [periodo,  setPeriodo]  = useState('jul2025');
  const [canal,    setCanal]    = useState('todos');
  const [vendedor, setVendedor] = useState('todos');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  function exportToExcel() {
    const wb = XLSX.utils.book_new();
    const autoWidth = ws => {
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      const widths = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        let max = 10;
        for (let R = range.s.r; R <= range.e.r; R++) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v != null) { const len = String(cell.v).length; if (len > max) max = len; }
        }
        widths.push({ wch: Math.min(max + 2, 40) });
      }
      ws['!cols'] = widths;
    };

    // Sheet 1: KPIs de Clientes
    const kpiRows = CLIENTES_KPIS.map(k => ({
      KPI: k.lbl,
      Valor: k.val,
      Meta: k.meta,
      '% de Meta': k.pct + '%',
      'vs Año Ant.': k.yoyDelta,
    }));
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    autoWidth(wsKpi);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs Clientes');

    // Sheet 2: Detalle Facturas
    const detRows = DET_ROWS_CLI.map(r => ({
      'ID Factura': r.id,
      Cliente: r.cli,
      'N° Factura': r.nofac || '',
      'Fecha': r.fecha || '',
      'Vencimiento': r.venc || '',
      Cantidad: r.qty || '',
      'Venta $': r.v,
      'Nota Crédito': r.nc || '',
      'Costo $': r.costo,
      'Margen %': r.mgPct,
      'Abono $': r.abono,
      'Pendiente $': r.pend,
    }));
    const wsDet = XLSX.utils.json_to_sheet(detRows);
    autoWidth(wsDet);
    XLSX.utils.book_append_sheet(wb, wsDet, 'Detalle Facturas');

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `Clientes_${stamp}.xlsx`);
  }

  return (
    <Box>
      <PageHeader title={t('page.clientes')} live={true} onRefresh={handleRefresh} onExport={exportToExcel}>
        <MiniSelect label="Período" value={periodo} onChange={setPeriodo} options={[
          { value:'jul2025', label:'Jul 2025' },
          { value:'jun2025', label:'Jun 2025' },
          { value:'ytd2025', label:'YTD 2025' },
        ]} />
        <MiniSelect label="Canal" value={canal} onChange={setCanal} options={[
          { value:'todos',  label:'Todos' },
          { value:'tienda', label:'Tienda Central' },
          { value:'suc1',   label:'Sucursal No.1' },
        ]} />
        <MiniSelect label="Industria" value={vendedor} onChange={setVendedor} options={[
          { value:'todos',     label:'Todas' },
          { value:'industria', label:'Industria' },
          { value:'agricola',  label:'Agrícola' },
          { value:'farma',     label:'Farma' },
          { value:'comercio',  label:'Comercio' },
          { value:'gobierno',  label:'Gobierno' },
        ]} />
      </PageHeader>

      <Box sx={{ p:{ xs:'10px', md:'14px 16px' }, display:'flex', flexDirection:'column', gap:'14px' }}>

        {/* KPIs */}
        <Box>
          <SectionHeader
            title="Indicadores Clave · Segmento de Clientes"
            subtitle="Evaluar la salud del portafolio de clientes vs metas y períodos anteriores"
          />
          <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'repeat(2,1fr)', sm:'repeat(4,1fr)', md:'repeat(7,minmax(0,1fr))' }, gap:'10px' }}>
            {CLIENTES_KPIS.map(k => <ClienteKpiCard key={k.lbl} k={k} />)}
          </Box>
        </Box>

        {/* Sección 2: Análisis de Segmentos (izq) + Alertas de Sistema (der) */}
        <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'1fr 280px' }, gap:'16px', alignItems:'stretch' }}>
          <AnalisisSection />
          <AlertasSistema alerts={ALERTAS_SISTEMA} />
        </Box>

        {/* Sección 3: Cuentas por Cobrar */}
        <CuentasPorCobrar />

        {/* Cartera de Clientes */}
        <CarteraClientes />

      </Box>
    </Box>
  );
}
