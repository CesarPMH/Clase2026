// Component library: MUI + Apache ECharts (echarts-for-react)
import { useState, useMemo } from 'react';
import {
  Box, Typography, Select, MenuItem, Button, Tooltip,
  Menu, Checkbox, ListItemText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  IosShare as ShareIcon,
  ViewColumn as ViewColumnIcon,
  ArrowUpward as AscIcon,
  ArrowDownward as DescIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';

// ── data ──────────────────────────────────────────────────────────────────────
const ANALYSIS = {
  industria: {
    labels: ['Inmobiliaria', 'Energía', 'Commodity', 'Tecnología', 'Infraestructura'],
    colors: ['#547e69', '#1a1a1a', '#16a34a', '#4d3f32', '#ea580c'],
    monto:  [80, 72, 35, 55, 35],
    qty:    [8,   6,  4,  3,  2],
  },
  servicio: {
    labels: ['Emisión', 'Certificación', 'Emisión & Cert.'],
    colors: ['#547e69', '#16a34a', '#4d3f32'],
    monto:  [145, 62, 40],
    qty:    [12,   5,  6],
  },
  blockchain: {
    labels: ['Ethereum', 'Polygon', 'Avalanche', 'Stellar'],
    colors: ['#828282', '#6b6b6b', '#e84142', '#bebebe'],
    monto:  [120, 65, 35, 27],
    qty:    [9,    6,  4,  4],
  },
  token: {
    labels: ['Deuda', 'Ingreso', 'Equity', 'Preferente'],
    colors: ['#547e69', '#16a34a', '#d97706', '#4d3f32'],
    monto:  [155, 60, 22, 10],
    qty:    [10,   5,  6,  2],
  },
};

const PIPELINE = [
  { stage: 'Oferta',       count: 11, color: '#a2a2a2' },
  { stage: 'Pre-Registro', count: 8,  color: '#727272' },
  { stage: 'CNAD',         count: 5,  color: '#4d3f32' },
  { stage: 'Revisión',     count: 3,  color: '#d97706' },
  { stage: 'Habilitado',   count: 6,  color: '#547e69' },
  { stage: 'Emitido',      count: 4,  color: '#16a34a' },
];

const PROJECTS = [
  { nombre: 'Torre Ámbar',       industria: 'Inmobiliaria',    chipCls: 'real-estate', token: 'Deuda',   monto: '$28.5M', montoNum: 28.5, blockchain: 'Ethereum',  etapa: 'Revisión' },
  { nombre: 'Solar Oriente III', industria: 'Energía',         chipCls: 'energy',      token: 'Ingreso', monto: '$42.0M', montoNum: 42.0, blockchain: 'Polygon',   etapa: 'Revisión' },
  { nombre: 'Cocoa Fund I',      industria: 'Commodity',       chipCls: 'commodity',   token: 'Deuda',   monto: '$18.0M', montoNum: 18.0, blockchain: 'Stellar',   etapa: 'Habilitado' },
  { nombre: 'Nexus Data Center', industria: 'Tecnología',      chipCls: 'tech',        token: 'Deuda',   monto: '$55.0M', montoNum: 55.0, blockchain: 'Ethereum',  etapa: 'Activo' },
  { nombre: 'Vías del Sur',      industria: 'Infraestructura', chipCls: 'infra',       token: 'Deuda',   monto: '$35.0M', montoNum: 35.0, blockchain: 'Avalanche', etapa: 'Activo' },
  { nombre: 'Green Port Bx2',    industria: 'Energía',         chipCls: 'energy',      token: 'Ingreso', monto: '$22.0M', montoNum: 22.0, blockchain: 'Polygon',   etapa: 'Activo' },
  { nombre: 'Residencial Cima',  industria: 'Inmobiliaria',    chipCls: 'real-estate', token: 'Ingreso', monto: '$16.5M', montoNum: 16.5, blockchain: 'Ethereum',  etapa: 'Activo' },
];

const INDUSTRY_CHIP = {
  'real-estate': { bg: '#f6f6f6', color: '#1a1a1a' },
  'energy':      { bg: '#fef9c3', color: '#a16207' },
  'commodity':   { bg: '#f0fdf4', color: '#15803d' },
  'tech':        { bg: '#f6f6f6', color: '#515151' },
  'infra':       { bg: '#fff7ed', color: '#c2410c' },
};

const ETAPA_CHIP = {
  Revisión:   { bg: '#fef3c7', color: '#d97706' },
  Habilitado: { bg: '#e8e8e8', color: '#1a1a1a' },
  Emitido:    { bg: '#dcfce7', color: '#16a34a' },
  Activo:     { bg: '#dcfce7', color: '#16a34a' },
  CNAD:       { bg: '#ededed', color: '#4d3f32' },
};

const ALL_COLS = ['Proyecto', 'Industria', 'Token', 'Monto', 'Blockchain', 'Etapa'];
const SORT_KEY = { Proyecto: 'nombre', Industria: 'industria', Token: 'token', Monto: 'montoNum', Blockchain: 'blockchain', Etapa: 'etapa' };

const ANALYSIS_TABS = [
  { id: 'industria', label: 'Industria' },
  { id: 'servicio',  label: 'Tipo de Servicio' },
  { id: 'blockchain',label: 'Blockchain' },
  { id: 'token',     label: 'Tipo de Token' },
];

// ── helper: mini filter select ──────────────────────────────────────────────
function HeaderSelect({ label, options }) {
  const [val, setVal] = useState(options[0]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#a2a2a2', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</Typography>
      <Select value={val} onChange={e => setVal(e.target.value)} size="small"
        sx={{ fontSize: 11, height: 32, minWidth: 140, background: '#fff', borderRadius: '7px',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,70,.12)' },
          '& .MuiSelect-select': { py: '6px' },
        }}>
        {options.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 11 }}>{o}</MenuItem>)}
      </Select>
    </Box>
  );
}

// ── KPI Card — mismo estilo del sistema ─────────────────────────────────────
function KpiCard({ label, value, meta, pct, diff, diffUp, subLabel, accentColor }) {
  const barColor = pct >= 100 ? '#16a34a' : pct >= 80 ? '#d97706' : '#dc2626';
  const pctColor = barColor;
  const barW     = Math.min(pct, 100);
  return (
    <Box sx={{
      background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`,
      p: '12px 13px 10px', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', boxShadow: DL.e1,
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
    }}>
      {/* accent bar — color-matched to status */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '10px 10px 0 0', background: barColor }} />
      {/* label */}
      <Typography sx={{ fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, mt: '3px', mb: '5px' }}>{label}</Typography>
      {/* value — divider attached as border-bottom */}
      <Typography sx={{
        fontSize: 20, fontWeight: 500, color: DL.tH, lineHeight: 1.05, letterSpacing: '-0.04em',
        pb: '3px', mb: '3px',
        borderBottom: '1px solid rgba(26,26,26,.08)',
      }}>{value}</Typography>
      {/* meta row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Meta</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>{meta}</Typography>
      </Box>
      {/* THICK progress bar */}
      <Box sx={{ height: 9, background: 'rgba(26,26,26,.07)', borderRadius: 5, overflow: 'hidden', mb: '5px' }}>
        <Box sx={{ height: '100%', borderRadius: 5, width: `${barW}%`, background: barColor, transition: 'width 0.6s ease' }} />
      </Box>
      {/* pct row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '8px' }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: pctColor }}>{pct.toFixed(0)}% de meta</Typography>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS }}>{diff}</Typography>
      </Box>
      {/* footer */}
      <Box sx={{ background: 'rgba(26,26,26,.035)', borderRadius: '5px', p: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px', mt: 'auto' }}>
        <Typography sx={{ fontSize: 7.5, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{subLabel}</Typography>
        <Box sx={{ fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '4px', background: diffUp ? '#dcfce7' : '#fee2e2', color: diffUp ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
          {diff}
        </Box>
      </Box>
    </Box>
  );
}

// ── Tabbed Analysis Chart ─────────────────────────────────────────────────────
function AnalysisChart() {
  const [tab, setTab] = useState('industria');
  const [mode, setMode] = useState('monto');
  const d = ANALYSIS[tab];
  const data = mode === 'monto' ? d.monto : d.qty;

  const option = {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => `${p[0].name}<br/>${mode === 'monto' ? '$' + p[0].value + 'M' : p[0].value + ' proyectos'}`,
    },
    grid: { top: 10, bottom: 28, left: 44, right: 12 },
    xAxis: {
      type: 'category', data: d.labels,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: '#a2a2a2', fontSize: 10, interval: 0, rotate: d.labels.length > 3 ? 15 : 0 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0,0,0,.04)' } },
      axisLabel: { color: '#a2a2a2', fontSize: 10, formatter: v => mode === 'monto' ? `$${v}M` : v },
    },
    series: [{
      type: 'bar', barMaxWidth: 44,
      data: data.map((v, i) => ({ value: v, itemStyle: { color: d.colors[i], borderRadius: [4, 4, 0, 0] } })),
    }],
  };

  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(0,0,70,.08)', p: '16px' }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '12px' }}>
        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: '4px', background: '#f6f6f6', borderRadius: '8px', p: '3px' }}>
          {ANALYSIS_TABS.map(t => (
            <Box key={t.id} onClick={() => setTab(t.id)} sx={{
              px: '10px', py: '4px', borderRadius: '6px', cursor: 'pointer',
              fontSize: 11, fontWeight: 500,
              background: tab === t.id ? '#fff' : 'transparent',
              color: tab === t.id ? DL.blue : '#727272',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
              transition: 'all .14s', whiteSpace: 'nowrap',
            }}>
              {t.label}
            </Box>
          ))}
        </Box>
        {/* $ vs Q toggle */}
        <Box sx={{ display: 'flex', background: '#f6f6f6', borderRadius: '7px', p: '2px', border: '1px solid rgba(0,0,70,.08)' }}>
          {['monto', 'qty'].map(m => (
            <Box key={m} onClick={() => setMode(m)} sx={{
              fontSize: 10, fontWeight: 500, px: '9px', py: '3px', borderRadius: '5px', cursor: 'pointer',
              background: mode === m ? DL.dark : 'transparent',
              color: mode === m ? '#fff' : '#727272', transition: 'all .2s',
            }}>
              {m === 'monto' ? '$ Monto' : 'Q Proyectos'}
            </Box>
          ))}
        </Box>
      </Box>
      <ReactECharts option={option} style={{ height: 200 }} opts={{ renderer: 'canvas' }} />
    </Box>
  );
}

// ── Pipeline Stages Chart (horizontal) ────────────────────────────────────────
function PipelineChart() {
  const max = Math.max(...PIPELINE.map(p => p.count));
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: p => `${p[0].name}: ${p[0].value} proyectos` },
    grid: { top: 8, bottom: 8, left: 90, right: 32, containLabel: false },
    xAxis: { type: 'value', max, splitLine: { lineStyle: { color: 'rgba(0,0,0,.04)' } }, axisLabel: { color: '#a2a2a2', fontSize: 10 } },
    yAxis: {
      type: 'category',
      data: PIPELINE.map(p => p.stage),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: '#404040', fontSize: 11, fontWeight: 500 },
    },
    series: [{
      type: 'bar', barMaxWidth: 20,
      data: PIPELINE.map(p => ({ value: p.count, itemStyle: { color: p.color, borderRadius: [0, 4, 4, 0] } })),
      label: { show: true, position: 'right', color: '#404040', fontSize: 11, fontWeight: 500, formatter: '{c}' },
    }],
  };

  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(0,0,70,.08)', p: '16px' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.dark }}>Proyectos por etapa</Typography>
      <Typography sx={{ fontSize: 10, color: '#a2a2a2', mb: '8px' }}>Proyectos activos en cada fase del pipeline</Typography>
      <ReactECharts option={option} style={{ height: 200 }} opts={{ renderer: 'canvas' }} />
    </Box>
  );
}

// ── Projects Table with sorting + column visibility ───────────────────────────
function ProjectsTable() {
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCols, setVisibleCols] = useState(new Set(ALL_COLS));
  const [anchor, setAnchor] = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(a => !a);
    else { setSortCol(col); setSortAsc(true); }
  };

  const toggleCol = (col) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) { if (next.size > 2) next.delete(col); }
      else next.add(col);
      return next;
    });
  };

  const rows = useMemo(() => {
    if (!sortCol) return PROJECTS;
    const key = SORT_KEY[sortCol];
    return [...PROJECTS].sort((a, b) => {
      const va = a[key], vb = b[key];
      if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [sortCol, sortAsc]);

  const SortIcon = ({ col }) => sortCol !== col ? null
    : sortAsc ? <AscIcon sx={{ fontSize: 12, ml: '2px', verticalAlign: 'middle' }} />
              : <DescIcon sx={{ fontSize: 12, ml: '2px', verticalAlign: 'middle' }} />;

  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', border: '1px solid rgba(0,0,70,.08)', overflow: 'hidden' }}>
      {/* Table header row */}
      <Box sx={{ px: '16px', py: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,70,.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.dark }}>Proyectos en ejecución</Typography>
          <Box sx={{ fontSize: 10, fontWeight: 500, px: '7px', py: '2px', borderRadius: '10px', background: 'rgba(84,126,105,.1)', color: DL.blue }}>14 activos</Box>
        </Box>
        <Button size="small" startIcon={<ViewColumnIcon sx={{ fontSize: 14 }} />} onClick={e => setAnchor(e.currentTarget)}
          variant="outlined" sx={{ fontSize: 11, height: 32, borderRadius: '7px', textTransform: 'none', borderColor: 'rgba(0,0,70,.15)', color: '#404040', '&:hover': { borderColor: DL.blue, color: DL.blue } }}>
          Columnas
        </Button>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
          PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 180 } }}>
          {ALL_COLS.map(col => (
            <MenuItem key={col} onClick={() => toggleCol(col)} dense sx={{ gap: '6px' }}>
              <Checkbox checked={visibleCols.has(col)} size="small" sx={{ p: 0 }} />
              <ListItemText primary={col} primaryTypographyProps={{ fontSize: 12 }} />
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: '#f9fafb' }}>
              {ALL_COLS.filter(c => visibleCols.has(c)).map(h => (
                <TableCell key={h} onClick={() => handleSort(h)} sx={{ fontSize: 10, fontWeight: 500, color: '#a2a2a2', textTransform: 'uppercase', letterSpacing: '0.6px', py: '8px', borderBottom: '1px solid rgba(0,0,70,.06)', cursor: 'pointer', userSelect: 'none', '&:hover': { color: DL.blue } }}>
                  {h}<SortIcon col={h} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p, i) => {
              const ic = INDUSTRY_CHIP[p.chipCls] || {};
              const ec = ETAPA_CHIP[p.etapa] || { bg: '#f6f6f6', color: '#727272' };
              return (
                <TableRow key={i} sx={{ '&:hover': { background: '#f6f6f6' }, '&:last-child td': { border: 0 } }}>
                  {visibleCols.has('Proyecto')    && <TableCell sx={{ fontSize: 12, fontWeight: 500, color: DL.dark, py: '9px' }}>{p.nombre}</TableCell>}
                  {visibleCols.has('Industria')   && <TableCell sx={{ py: '9px' }}><Box sx={{ fontSize: 9.5, fontWeight: 500, px: '6px', py: '2px', borderRadius: '4px', display: 'inline-block', textTransform: 'uppercase', background: ic.bg, color: ic.color }}>{p.industria}</Box></TableCell>}
                  {visibleCols.has('Token')       && <TableCell sx={{ py: '9px' }}><Box sx={{ fontSize: 9.5, fontWeight: 500, px: '6px', py: '2px', borderRadius: '4px', display: 'inline-block', textTransform: 'uppercase', background: p.token === 'Deuda' ? 'rgba(0,0,70,.07)' : 'rgba(84,126,105,.1)', color: p.token === 'Deuda' ? DL.dark : DL.blue }}>{p.token}</Box></TableCell>}
                  {visibleCols.has('Monto')       && <TableCell sx={{ fontSize: 11.5, fontWeight: 500, color: DL.dark, fontFamily: "'DM Mono',monospace", py: '9px' }}>{p.monto}</TableCell>}
                  {visibleCols.has('Blockchain')  && <TableCell sx={{ fontSize: 11, color: '#727272', py: '9px' }}>{p.blockchain}</TableCell>}
                  {visibleCols.has('Etapa')       && <TableCell sx={{ py: '9px' }}><Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 10, fontWeight: 500, px: '7px', py: '2px', borderRadius: '4px', background: ec.bg, color: ec.color }}>{p.etapa}</Box></TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <Box sx={{ background: '#f0f2f5', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Page Header ── */}
      <Box sx={{ background: '#fff', borderBottom: '1px solid rgba(0,0,70,.08)', px: '28px', py: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', flexShrink: 0 }}>
        {/* Left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.dark, letterSpacing: '-.3px', lineHeight: 1 }}>Portfolio Overview</Typography>
            <Typography sx={{ fontSize: 10, color: '#a2a2a2', mt: '2px' }}>TR Capital · Gestión de proyectos de tokenización</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px', px: '8px', py: '3px', borderRadius: '4px', background: '#dcfce7', border: '1px solid #bbf7d0' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>En vivo</Typography>
          </Box>
        </Box>
        {/* Right: filters + actions */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
          <HeaderSelect label="Período" options={['1 ene - 6 abr 2026','2025','2024','Q1 2026','Q2 2025','Q4 2024']} />
          <HeaderSelect label="Industria" options={['Todas','Inmobiliaria','Energía','Commodity','Tecnología','Infraestructura']} />
          <HeaderSelect label="Tipo de emisión" options={['Todos','Privada','Pública']} />
          <HeaderSelect label="Tipo de servicio" options={['Todos','Emisión','Certificación','Emisión & Cert.']} />
          <Box sx={{ display: 'flex', gap: '6px', alignItems: 'flex-end', pb: '1px' }}>
            <Tooltip title="Compartir">
              <Button size="small" startIcon={<ShareIcon sx={{ fontSize: 14 }} />} variant="outlined"
                sx={{ fontSize: 11, height: 32, borderRadius: '7px', textTransform: 'none', borderColor: 'rgba(0,0,70,.15)', color: '#404040', '&:hover': { borderColor: DL.blue, color: DL.blue } }}>
                Compartir
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* ── Body ── */}
      <Box sx={{ px: '24px', py: '18px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

        {/* KPI Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          <KpiCard label="Proyectos Activos"     value="14"    meta="20 proyectos" pct={70}  diff="+3"   diffUp={true}  subLabel="vs trim. ant."    accentColor="#16a34a" />
          <KpiCard label="Finalizados"           value="9"     meta="12 proyectos" pct={75}  diff="+2"   diffUp={true}  subLabel="vs meta anual"     accentColor="#547e69" />
          <KpiCard label="Monto Emitido"         value="$247M" meta="$300M"        pct={82}  diff="+18%" diffUp={true}  subLabel="vs meta anual"     accentColor="#16a34a" />
          <KpiCard label="Estructuración"        value="$162M" meta="$170M"        pct={95}  diff="−5%"  diffUp={false} subLabel="vs meta"           accentColor="#d97706" />
          <KpiCard label="Certificación"         value="$85M"  meta="$80M"         pct={106} diff="+12%" diffUp={true}  subLabel="vs meta"           accentColor="#16a34a" />
          <KpiCard label="Plazo Prom. Completado" value="28m"  meta="24 meses"     pct={57}  diff="+4m"  diffUp={false} subLabel="sobre plazo"       accentColor="#dc2626" />
        </Box>

        {/* Analysis row: tabbed chart + pipeline chart */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
          <AnalysisChart />
          <PipelineChart />
        </Box>

        {/* Projects table (full width) */}
        <ProjectsTable />

      </Box>
    </Box>
  );
}
