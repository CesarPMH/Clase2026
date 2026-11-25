// Component library: MUI + Apache ECharts (echarts-for-react)
import { useState, useMemo } from 'react';
import { useT } from '../../i18n/LanguageContext';
import {
  Box, Typography, Button, IconButton, Tooltip,
  TextField, Select, MenuItem, FormControl, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Checkbox, Menu, ListItemText,
  Snackbar, Alert,
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon,
  CheckCircle as CheckIcon, Schedule as ScheduleIcon,
  Close as CloseIcon, Receipt as ReceiptIcon,
  CalendarMonth as CalIcon, Warning as WarnIcon,
  ViewColumn as ColumnIcon,
  AccountBalance as BankIcon, Payments as PayIcon,
} from '@mui/icons-material';
import ReactECharts from 'echarts-for-react';
import { DL } from '../../theme';
import PageHeader from '../../components/common/PageHeader';
import { proyectos as PROYECTOS } from '../../data/tr-mock';

// ── Constants ─────────────────────────────────────────────────────────────────
const ESTADO_STYLE = {
  Cobrada:    { bg: '#dcfce7', color: '#16a34a' },
  Pendiente:  { bg: '#fef3c7', color: '#d97706' },
  Vencida:    { bg: '#fee2e2', color: '#dc2626' },
  Programada: { bg: '#e8e8e8', color: '#1a1a1a' },
};
const TIPO_STYLE = {
  'Pago Inicial':            { bg: '#ededed', color: '#4d3f32' },
  'Pago Final':              { bg: '#d1fae5', color: '#065f46' },
  'Suscripción':             { bg: '#e8e8e8', color: '#1a1a1a' },
  'Certificación Semestral': { bg: '#fef9c3', color: '#a16207' },
};
const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const COL_DEFS = [
  { id: 'check',    labelKey: '' },
  { id: 'id',       labelKey: 'col.id' },
  { id: 'proyecto', labelKey: 'col.proyecto' },
  { id: 'cliente',  labelKey: 'col.cliente' },
  { id: 'tipo',     labelKey: 'col.tipo' },
  { id: 'monto',    labelKey: 'tr.fin.col.monto' },
  { id: 'vence',    labelKey: 'col.vencimiento' },
  { id: 'estado',   labelKey: 'col.estado' },
  { id: 'ref',      labelKey: 'tr.fin.col.ref' },
];
const DEFAULT_COLS = ['check', 'id', 'proyecto', 'cliente', 'tipo', 'monto', 'vence', 'estado', 'ref'];

const INIT_FACTURAS = [
  { id: 'FAC-001', proyecto: 'Puerto Marisco',   cliente: 'GRUPO C5 S.A.',         tipo: 'Pago Inicial',            monto: 2000,  emision: '01/03/2025', vencimiento: '15/03/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-847291', fechaPago: '12/03/2025', notas: '' },
  { id: 'FAC-002', proyecto: 'Puerto Marisco',   cliente: 'GRUPO C5 S.A.',         tipo: 'Pago Final',              monto: 4000,  emision: '01/09/2025', vencimiento: '15/09/2025', estado: 'Pendiente',  etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-003', proyecto: 'Hacienda Verde',   cliente: 'AGROMAX S.A.',          tipo: 'Pago Inicial',            monto: 5000,  emision: '01/04/2025', vencimiento: '15/04/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-112034', fechaPago: '10/04/2025', notas: '' },
  { id: 'FAC-004', proyecto: 'Torres del Norte', cliente: 'INMOBILIARIA TNS',      tipo: 'Pago Inicial',            monto: 8000,  emision: '01/02/2025', vencimiento: '15/02/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-664821', fechaPago: '08/02/2025', notas: 'Pago en 2 partes' },
  { id: 'FAC-005', proyecto: 'Torres del Norte', cliente: 'INMOBILIARIA TNS',      tipo: 'Certificación Semestral', monto: 1200,  emision: '01/03/2025', vencimiento: '31/03/2025', estado: 'Cobrada',    etapa: 'Mar / Sep',    ref: 'REF-221983', fechaPago: '20/03/2025', notas: '' },
  { id: 'FAC-006', proyecto: 'Costa Azul',       cliente: 'MARINA HOLDINGS S.A.',  tipo: 'Pago Inicial',            monto: 12000, emision: '01/01/2025', vencimiento: '15/01/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-009834', fechaPago: '14/01/2025', notas: '' },
  { id: 'FAC-007', proyecto: 'Costa Azul',       cliente: 'MARINA HOLDINGS S.A.',  tipo: 'Suscripción',             monto: 1500,  emision: '01/04/2025', vencimiento: '10/04/2025', estado: 'Vencida',    etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-008', proyecto: 'Punta Cana Tech',  cliente: 'TECHVENTURES GROUP',    tipo: 'Pago Inicial',            monto: 6000,  emision: '15/03/2025', vencimiento: '30/03/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-558800', fechaPago: '28/03/2025', notas: '' },
  { id: 'FAC-009', proyecto: 'Sierra Nevada',    cliente: 'ENERGÍA LIMPIA S.R.L.', tipo: 'Pago Inicial',            monto: 20000, emision: '01/02/2025', vencimiento: '15/02/2025', estado: 'Cobrada',    etapa: 'Pre-Registro', ref: 'REF-774412', fechaPago: '13/02/2025', notas: '' },
  { id: 'FAC-010', proyecto: 'Sierra Nevada',    cliente: 'ENERGÍA LIMPIA S.R.L.', tipo: 'Pago Final',              monto: 20000, emision: '01/04/2025', vencimiento: '15/04/2025', estado: 'Vencida',    etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-011', proyecto: 'Sierra Nevada',    cliente: 'ENERGÍA LIMPIA S.R.L.', tipo: 'Suscripción',             monto: 2500,  emision: '01/05/2025', vencimiento: '10/05/2025', estado: 'Pendiente',  etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-012', proyecto: 'Torres del Norte', cliente: 'INMOBILIARIA TNS',      tipo: 'Certificación Semestral', monto: 1200,  emision: '01/09/2025', vencimiento: '30/09/2025', estado: 'Programada', etapa: 'Mar / Sep',    ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-013', proyecto: 'Costa Azul',       cliente: 'MARINA HOLDINGS S.A.',  tipo: 'Suscripción',             monto: 1500,  emision: '01/05/2025', vencimiento: '10/05/2025', estado: 'Programada', etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-014', proyecto: 'Punta Cana Tech',  cliente: 'TECHVENTURES GROUP',    tipo: 'Pago Final',              monto: 6000,  emision: '15/06/2025', vencimiento: '30/06/2025', estado: 'Programada', etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
  { id: 'FAC-015', proyecto: 'Puerto Marisco',   cliente: 'GRUPO C5 S.A.',         tipo: 'Suscripción',             monto: 800,   emision: '01/06/2025', vencimiento: '10/06/2025', estado: 'Pendiente',  etapa: 'Emitido',      ref: '', fechaPago: '', notas: '' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt$ = n => `$${Number(n).toLocaleString()}`;
const fsx  = { '& .MuiInputBase-root': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } };

function parseVenc(str) {
  if (!str) return null;
  const [, m, y] = str.split('/').map(Number);
  return { month: m, year: y, key: `${y}-${String(m).padStart(2, '0')}` };
}

function TipoChip({ label }) {
  const s = TIPO_STYLE[label] || {};
  return <Box component="span" sx={{ display: 'inline-flex', px: '7px', py: '2px', borderRadius: '6px', fontSize: 9.5, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{label}</Box>;
}

function EstadoBadge({ label }) {
  const s = ESTADO_STYLE[label] || {};
  return <Box component="span" sx={{ display: 'inline-flex', px: '8px', py: '2px', borderRadius: '12px', fontSize: 10, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{label}</Box>;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <Box sx={{
      background: '#fff', borderRadius: '10px', p: '12px 13px 10px', border: `1px solid ${DL.border}`,
      flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden',
      boxShadow: DL.e1,
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '10px 10px 0 0' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '5px', mt: '3px' }}>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</Typography>
        {Icon && <Icon sx={{ fontSize: 14, color: accent }} />}
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH, lineHeight: 1.05, letterSpacing: '-0.04em', pb: '3px', mb: '3px', borderBottom: '1px solid rgba(26,26,26,.08)' }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 9, color: DL.tS, mt: '2px' }}>{sub}</Typography>}
    </Box>
  );
}

// ── Bar Chart (stacked, clickable, 3-series) ──────────────────────────────────
const NOW_KEY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();

const ETAPA_LABELS = {
  preReg: 'Pre-Registro', oferta: 'Oferta', cnad: 'CNAD',
  revision: 'Revisión', habilitado: 'Habilitado', emitido: 'Emitido',
};

const RANGE_OPTS = [
  { label: '3M',  value: 3 },
  { label: '6M',  value: 6 },
  { label: '12M', value: 12 },
  { label: 'Todo', value: 999 },
];
const FWD_OPTS = [
  { label: '0',   value: 0 },
  { label: '+1M', value: 1 },
  { label: '+3M', value: 3 },
  { label: '+6M', value: 6 },
];

function CobrosChart({ facturas, selectedMonth, onBarClick, monthRange, setMonthRange, monthForward, setMonthForward }) {
  const { t } = useT();
  const allMonthKeys = useMemo(() => {
    const keys = new Set();
    facturas.forEach(f => { const d = parseVenc(f.vencimiento); if (d) keys.add(d.key); });
    return [...keys].sort();
  }, [facturas]);

  const monthKeys = useMemo(() => {
    const ci = allMonthKeys.indexOf(NOW_KEY);
    const start = monthRange >= 999 ? 0 : Math.max(0, ci - monthRange + 1);
    const end = Math.min(allMonthKeys.length - 1, ci < 0 ? allMonthKeys.length - 1 : ci + monthForward);
    return allMonthKeys.slice(start, end + 1);
  }, [allMonthKeys, monthRange, monthForward]);

  const sum = (k, pred) => facturas.filter(f => parseVenc(f.vencimiento)?.key === k && pred(f)).reduce((s, f) => s + f.monto, 0);

  const cobrado   = monthKeys.map(k => sum(k, f => f.estado === 'Cobrada'));
  const vencido   = monthKeys.map(k => sum(k, f => f.estado === 'Vencida'));
  const pendiente = monthKeys.map(k => sum(k, f => f.estado === 'Pendiente' || f.estado === 'Programada'));
  const labels    = monthKeys.map(k => { const [y, m] = k.split('-'); return `${MES[Number(m) - 1]} ${y.slice(2)}`; });

  const option = {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: p => `<b>${p[0].name}</b><br/>${p.filter(s => s.value > 0).map(s => `${s.seriesName}: $${s.value.toLocaleString()}`).join('<br/>')}`,
    },
    legend: { bottom: 0, icon: 'rect', itemWidth: 9, itemHeight: 9, textStyle: { color: '#727272', fontSize: 10 } },
    grid:   { top: 8, bottom: 36, left: 56, right: 8 },
    xAxis: {
      type: 'category', data: labels,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: '#a2a2a2', fontSize: 10, rotate: labels.length > 8 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0,0,0,.04)' } },
      axisLabel: { color: '#a2a2a2', fontSize: 10, formatter: v => v >= 1000 ? `$${v / 1000}k` : `$${v}` },
    },
    series: [
      { name: t('tr.fin.cobrado'),   type: 'bar', stack: 'total', data: cobrado,   itemStyle: { color: '#16a34a' }, barMaxWidth: 40 },
      { name: t('tr.fin.vencido'),   type: 'bar', stack: 'total', data: vencido,   itemStyle: { color: '#dc2626' }, barMaxWidth: 40 },
      { name: t('tr.fin.pendiente'), type: 'bar', stack: 'total', data: pendiente, itemStyle: { color: '#f59e0b' }, barMaxWidth: 40 },
    ],
  };

  const onEvents = { click: params => onBarClick(monthKeys[params.dataIndex]) };

  return (
    <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', p: '16px', boxShadow: DL.e1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '10px' }}>
        <Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>{t('tr.fin.chart.titulo')}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('tr.fin.chart.sub')}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Backward range */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('tr.fin.chart.atras')}</Typography>
            <Box sx={{ display: 'flex', background: '#f6f6f6', borderRadius: '7px', p: '2px', border: `1px solid ${DL.border}` }}>
              {RANGE_OPTS.map(o => (
                <Box key={o.value} onClick={() => setMonthRange(o.value)} sx={{
                  fontSize: 10, fontWeight: 500, px: '7px', py: '3px', borderRadius: '5px', cursor: 'pointer',
                  background: monthRange === o.value ? DL.dark : 'transparent',
                  color: monthRange === o.value ? '#fff' : DL.tS,
                  transition: 'all .15s',
                }}>{o.label}</Box>
              ))}
            </Box>
          </Box>
          {/* Forward range */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('tr.fin.chart.adelante')}</Typography>
            <Box sx={{ display: 'flex', background: '#f6f6f6', borderRadius: '7px', p: '2px', border: `1px solid ${DL.border}` }}>
              {FWD_OPTS.map(o => (
                <Box key={o.value} onClick={() => setMonthForward(o.value)} sx={{
                  fontSize: 10, fontWeight: 500, px: '7px', py: '3px', borderRadius: '5px', cursor: 'pointer',
                  background: monthForward === o.value ? DL.blue : 'transparent',
                  color: monthForward === o.value ? '#fff' : DL.tS,
                  transition: 'all .15s',
                }}>{o.label}</Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <ReactECharts option={option} style={{ height: 190 }} opts={{ renderer: 'canvas' }} onEvents={onEvents} />
    </Box>
  );
}

// ── Registrar Pago Modal ───────────────────────────────────────────────────────
function RegistrarPagoModal({ factura, open, onClose, onConfirm }) {
  const { t } = useT();
  const [ref,   setRef]   = useState(factura?.ref || '');
  const [fecha, setFecha] = useState(factura?.fechaPago || '');
  const [monto, setMonto] = useState(factura?.monto || '');
  const [notas, setNotas] = useState(factura?.notas || '');
  if (!factura) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BankIcon sx={{ fontSize: 20, color: DL.blue }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH }}>{t('tr.fin.regPago.titulo')}</Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{factura.id} · {factura.proyecto}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box sx={{ background: '#f6f6f6', border: `1px solid ${DL.border}`, borderRadius: '8px', p: '10px', mb: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('col.cliente')}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{factura.cliente}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('tr.fin.col.monto')}</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.blue }}>{fmt$(factura.monto)}</Typography>
          </Box>
        </Box>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField fullWidth label={t('tr.fin.regPago.refBancaria')} size="small" sx={fsx} value={ref}
              onChange={e => setRef(e.target.value)} placeholder="REF-847291" />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tr.fin.regPago.fechaPago')} size="small" type="date" sx={fsx}
              value={fecha} onChange={e => setFecha(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tr.fin.regPago.montoRecibido')} size="small" type="number" sx={fsx}
              value={monto} onChange={e => setMonto(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 11 }}>$</Typography></InputAdornment> }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('tr.fin.regPago.notas')} size="small" multiline rows={2} sx={fsx}
              value={notas} onChange={e => setNotas(e.target.value)} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">{t('btn.cancel')}</Button>
        <Button onClick={() => { onConfirm(factura.id, { ref, fechaPago: fecha, monto: Number(monto), notas }); onClose(); }}
          variant="contained" size="small" disabled={!ref || !fecha}
          startIcon={<CheckIcon sx={{ fontSize: 13 }} />}
          sx={{ background: '#16a34a', '&:hover': { background: '#15803d' } }}>
          {t('tr.fin.regPago.confirmar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Nueva Factura Modal ────────────────────────────────────────────────────────
function NuevaFacturaModal({ open, onClose }) {
  const { t } = useT();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ReceiptIcon sx={{ fontSize: 20, color: DL.blue }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH }}>{t('tr.fin.nuevaFac.titulo')}</Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('tr.fin.nuevaFac.sub')}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small" sx={fsx}>
              <label style={{ fontSize: 11, color: '#555', marginBottom: 4, display: 'block' }}>{t('tr.lbl.proyecto')} *</label>
              <Select displayEmpty defaultValue="">
                <MenuItem value="" disabled sx={{ fontSize: 11 }}>{t('tr.lbl.seleccionar')}</MenuItem>
                {['Puerto Marisco', 'Hacienda Verde', 'Torres del Norte', 'Costa Azul', 'Punta Cana Tech', 'Sierra Nevada'].map(p => (
                  <MenuItem key={p} value={p} sx={{ fontSize: 11 }}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" sx={fsx}>
              <label style={{ fontSize: 11, color: '#555', marginBottom: 4, display: 'block' }}>{t('tr.fin.tipoCobro')} *</label>
              <Select displayEmpty defaultValue="">
                <MenuItem value="" disabled sx={{ fontSize: 11 }}>{t('tr.lbl.seleccionar')}</MenuItem>
                {Object.keys(TIPO_STYLE).map(tk => <MenuItem key={tk} value={tk} sx={{ fontSize: 11 }}>{tk}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tr.fin.nuevaFac.concepto')} size="small" sx={fsx} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={`${t('tr.fin.col.monto')} *`} size="small" type="number" sx={fsx}
              InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 11 }}>$</Typography></InputAdornment> }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tr.fin.nuevaFac.fechaVenc')} size="small" type="date" sx={fsx} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('tr.fin.nuevaFac.notasAd')} size="small" multiline rows={2} sx={fsx} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">{t('btn.cancel')}</Button>
        <Button variant="contained" size="small" startIcon={<ReceiptIcon sx={{ fontSize: 13 }} />}>{t('tr.fin.nuevaFac.guardar')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Implementation Side Panel ─────────────────────────────────────────────────
function ImplPanel() {
  const { t } = useT();
  const [implTab, setImplTab] = useState(0);

  const implPendientes = useMemo(() =>
    PROYECTOS.filter(p => p.totalImplGoal > 0).map(p => ({
      ...p,
      pendiente: (p.totalImplGoal || 0) - (p.totalImpl || 0),
    })),
  []);

  const sinMonto = useMemo(() =>
    PROYECTOS.filter(p => !p.totalImpl && !p.totalImplGoal),
  []);

  return (
    <Box sx={{ width: 280, flexShrink: 0, background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', boxShadow: DL.e1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar */}
      <Box sx={{ borderBottom: `1px solid ${DL.border}`, px: '12px', pt: '12px' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: '8px' }}>{t('tr.fin.impl.titulo')}</Typography>
        <Box sx={{ display: 'flex', gap: '2px' }}>
          {[t('tr.fin.impl.pendiente'), t('tr.fin.impl.sinMonto')].map((label, idx) => (
            <Box key={label} onClick={() => setImplTab(idx)} sx={{
              px: '10px', py: '5px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
              fontSize: 10, fontWeight: 500,
              borderBottom: implTab === idx ? `2px solid ${DL.blue}` : '2px solid transparent',
              color: implTab === idx ? DL.blue : DL.tS,
              transition: 'all .12s',
            }}>
              {label}
              {idx === 0 && implPendientes.some(p => p.etapaActual === 'emitido') && (
                <Box component="span" sx={{ ml: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: DL.blue, color: '#fff', fontSize: 8, fontWeight: 500 }}>
                  {implPendientes.filter(p => p.etapaActual === 'emitido').length}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tab 1: Pending implementation */}
      {implTab === 0 && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {implPendientes.length === 0 ? (
            <Box sx={{ py: '24px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11, color: DL.tS }}>{t('tr.fin.impl.sinPendientes')}</Typography>
            </Box>
          ) : implPendientes.map(p => {
            const active = p.etapaActual === 'emitido';
            return (
              <Box key={p.id} sx={{
                px: '12px', py: '10px',
                borderBottom: `1px solid ${DL.border}`,
                background: active ? 'rgba(84,126,105,.04)' : 'transparent',
                opacity: active ? 1 : 0.55,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: active ? DL.tH : DL.tS, lineHeight: 1.2 }} noWrap>{p.nombre}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', mt: '3px' }}>
                      <Box sx={{
                        px: '5px', py: '1px', borderRadius: '4px', fontSize: 8.5, fontWeight: 500,
                        background: active ? 'rgba(84,126,105,.12)' : 'rgba(0,0,0,.06)',
                        color: active ? DL.blue : DL.tS,
                      }}>{ETAPA_LABELS[p.etapaActual] || p.etapaActual}</Box>
                      {active && (
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: active ? DL.blue : DL.tS, fontFamily: "'DM Mono',monospace" }}>{fmt$(p.pendiente)}</Typography>
                    <Typography sx={{ fontSize: 8.5, color: DL.tS, mt: '1px' }}>{t('tr.fin.impl.de')} {fmt$(p.totalImplGoal)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: '6px', height: 3, borderRadius: '2px', background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', borderRadius: '2px', width: `${Math.round((p.totalImpl / p.totalImplGoal) * 100)}%`, background: active ? DL.blue : '#a2a2a2', transition: 'width .3s' }} />
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Tab 2: No amount set */}
      {implTab === 1 && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {sinMonto.length === 0 ? (
            <Box sx={{ py: '24px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 11, color: DL.tS }}>{t('tr.fin.impl.todosConMonto')}</Typography>
            </Box>
          ) : sinMonto.map(p => (
            <Box key={p.id} sx={{ px: '12px', py: '10px', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, lineHeight: 1.2 }} noWrap>{p.nombre}</Typography>
              <Box sx={{ mt: '3px', px: '5px', py: '1px', borderRadius: '4px', fontSize: 8.5, fontWeight: 500, background: 'rgba(0,0,0,.06)', color: DL.tS, display: 'inline-block' }}>
                {ETAPA_LABELS[p.etapaActual] || p.etapaActual}
              </Box>
              <Typography sx={{ fontSize: 9, color: '#d97706', mt: '4px', fontWeight: 500 }}>⚠ {t('tr.fin.impl.sinMontoLabel')}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PanelFinanciero() {
  const { t } = useT();
  const [facturas, setFacturas]       = useState(INIT_FACTURAS);
  const [tab, setTab]                 = useState('Todos');
  const [search, setSearch]           = useState('');
  const [selectedMonth, setMonth]     = useState(null); // 'YYYY-MM' | null
  const [selected, setSelected]       = useState(new Set());
  const [pagoModal, setPagoModal]     = useState(null);
  const [facturaModal, setFacturaModal] = useState(false);
  const [snack, setSnack]             = useState(null);
  const [editCell, setEditCell]       = useState(null); // { id, field }
  const [cols, setCols]               = useState(DEFAULT_COLS);
  const [colAnchor, setColAnchor]     = useState(null);
  const [monthRange, setMonthRange]   = useState(6);
  const [monthForward, setMonthForward] = useState(3);

  // KPIs
  const cobradas    = facturas.filter(f => f.estado === 'Cobrada');
  const vencidas    = facturas.filter(f => f.estado === 'Vencida');
  const pendientes  = facturas.filter(f => f.estado === 'Pendiente');
  const programadas = facturas.filter(f => f.estado === 'Programada');
  const totalCobrado   = cobradas.reduce((s, f) => s + f.monto, 0);
  const totalVencido   = vencidas.reduce((s, f) => s + f.monto, 0);
  const totalPendiente = pendientes.reduce((s, f) => s + f.monto, 0);

  // Filter
  const filtered = useMemo(() => facturas.filter(f => {
    const matchTab =
      tab === 'Todos'      ? true :
      tab === 'Pendientes' ? (f.estado === 'Pendiente' || f.estado === 'Vencida') :
      tab === 'Pagados'    ? f.estado === 'Cobrada' :
      f.estado === 'Vencida';
    const matchMonth  = !selectedMonth || parseVenc(f.vencimiento)?.key === selectedMonth;
    const matchSearch = !search || f.proyecto.toLowerCase().includes(search.toLowerCase()) || f.cliente.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchMonth && matchSearch;
  }), [facturas, tab, selectedMonth, search]);

  // Selection
  const allSelected  = filtered.length > 0 && filtered.every(f => selected.has(f.id));
  const someSelected = filtered.some(f => selected.has(f.id));
  const toggleAll    = () => {
    if (allSelected) setSelected(s => { const n = new Set(s); filtered.forEach(f => n.delete(f.id)); return n; });
    else setSelected(s => { const n = new Set(s); filtered.forEach(f => n.add(f.id)); return n; });
  };
  const toggleOne = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulkSetEstado = (estado) => {
    setFacturas(f => f.map(x => selected.has(x.id) ? { ...x, estado, ref: estado === 'Pendiente' ? '' : x.ref, fechaPago: estado === 'Pendiente' ? '' : x.fechaPago } : x));
    setSnack({ msg: t('tr.fin.bulk.marcadas').replace('{n}', selected.size).replace('{estado}', estado), sev: estado === 'Cobrada' ? 'success' : 'info' });
    setSelected(new Set());
  };

  const handleConfirmPago = (id, data) => {
    setFacturas(f => f.map(x => x.id === id ? { ...x, estado: 'Cobrada', ...data } : x));
    setSnack({ msg: t('tr.fin.pagoRegistrado').replace('{ref}', data.ref), sev: 'success' });
  };

  const updateFactura = (id, field, value) => setFacturas(f => f.map(x => x.id === id ? { ...x, [field]: value } : x));

  const toggleCol = (id) => {
    if (id === 'check') return;
    setCols(prev => prev.includes(id) && prev.length > 3 ? prev.filter(c => c !== id) : prev.includes(id) ? prev : [...prev, id]);
  };

  const visibleDefs = cols.map(id => COL_DEFS.find(d => d.id === id)).filter(Boolean);
  const gridCols = visibleDefs.map(d => ({
    check: '36px', id: '72px', proyecto: '1.2fr', cliente: '1fr',
    tipo: '150px', monto: '80px', vence: '90px', estado: '100px', ref: '150px',
  }[d.id] || '1fr')).join(' ');

  const selCount = selected.size;
  const monthLabel = selectedMonth
    ? (() => { const [y, m] = selectedMonth.split('-'); return `${MES[Number(m) - 1]} ${y}`; })()
    : null;

  // All available month keys from facturas, for the month dropdown
  const allMonthOpts = useMemo(() => {
    const keys = new Set();
    facturas.forEach(f => { const d = parseVenc(f.vencimiento); if (d) keys.add(d.key); });
    return [...keys].sort();
  }, [facturas]);

  return (
    <Box sx={{ background: DL.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <PageHeader title={t('tr.fin.titulo')}>
        {/* Month filter — MiniSelect style */}
        <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column' }}>
          <Typography sx={{ position: 'absolute', top: -7, left: 10, zIndex: 1, fontSize: 8.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, background: '#fff', px: '3px', pointerEvents: 'none' }}>{t('time.mes')}</Typography>
          <Box component="select" value={selectedMonth || ''} onChange={e => setMonth(e.target.value || null)}
            sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: selectedMonth ? DL.blue : DL.tS, background: '#fff', border: `1px solid ${selectedMonth ? DL.blue : DL.border2}`, borderRadius: '7px', py: '7px', pl: '10px', pr: '26px', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140, transition: 'border-color .15s', '&:hover': { borderColor: DL.blue } }}>
            <option value="">{t('tr.fin.todosMeses')}</option>
            {allMonthOpts.map(k => { const [y, m] = k.split('-'); return <option key={k} value={k}>{MES[Number(m)-1]} {y}{k === NOW_KEY ? ' ·' : ''}</option>; })}
          </Box>
          <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          onClick={() => setFacturaModal(true)} sx={{ height: 32, fontSize: 11 }}>
          {t('tr.fin.nuevaFac.btn')}
        </Button>
      </PageHeader>

      {/* Body */}
      <Box sx={{ p: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

        {/* KPIs */}
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <KpiCard label={t('tr.fin.kpi.cobrado')}   value={fmt$(totalCobrado)}   sub={t('tr.fin.kpi.facCobradas').replace('{n}', cobradas.length)}  accent={DL.green} icon={CheckIcon} />
          <KpiCard label={t('tr.fin.kpi.porCobrar')} value={fmt$(totalPendiente)} sub={t('tr.fin.kpi.pendientes').replace('{n}', pendientes.length)}  accent={DL.yellow} icon={ScheduleIcon} />
          <KpiCard label={t('tr.fin.kpi.vencidas')}  value={fmt$(totalVencido)}   sub={t('tr.fin.kpi.sinCobrar').replace('{n}', vencidas.length)}     accent={DL.red} icon={WarnIcon} />
          <KpiCard label={t('tr.fin.kpi.programadas')} value={`${programadas.length}`} sub={t('tr.fin.kpi.porEmitir')} accent={DL.blue} icon={CalIcon} />
          <KpiCard label={t('tr.fin.kpi.totalFac')} value={fmt$(facturas.reduce((s, f) => s + f.monto, 0))} sub={t('tr.fin.kpi.nFacturas').replace('{n}', facturas.length)} accent={DL.navy} />
        </Box>

        {/* Chart + Impl Panel */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CobrosChart facturas={facturas} selectedMonth={selectedMonth}
              onBarClick={key => setMonth(prev => prev === key ? null : key)}
              monthRange={monthRange} setMonthRange={setMonthRange}
              monthForward={monthForward} setMonthForward={setMonthForward} />
          </Box>
          <ImplPanel />
        </Box>

        {/* Toolbar */}
        <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', p: '10px 14px', boxShadow: DL.e1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Tabs — DL pill style */}
            <Box sx={{ display: 'flex', gap: '1px', background: DL.subtle, border: `1px solid ${DL.border2}`, borderRadius: '6px', p: '2px' }}>
              {[
                { val: 'Todos',      lbl: t('tr.fin.tab.todos') },
                { val: 'Pendientes', lbl: t('tr.fin.tab.pendientes') },
                { val: 'Pagados',    lbl: t('tr.fin.tab.pagados') },
                { val: 'Vencidas',   lbl: t('tr.fin.tab.vencidas') },
              ].map(tb => {
                const cnt = tb.val === 'Pendientes' ? pendientes.length + vencidas.length : tb.val === 'Vencidas' ? vencidas.length : 0;
                return (
                  <Box key={tb.val} component="button" onClick={() => setTab(tb.val)} sx={{
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    px: '12px', py: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                    fontSize: 10, fontWeight: 500,
                    background: tab === tb.val ? '#fff' : 'transparent',
                    color: tab === tb.val ? DL.navy : DL.tM,
                    boxShadow: tab === tb.val ? '0 1px 3px rgba(0,0,70,.1)' : 'none',
                    transition: 'all .14s',
                    display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                    '&:hover': { color: DL.tH },
                  }}>
                    {tb.lbl}
                    {cnt > 0 && (
                      <Box sx={{ background: tb.val === 'Vencidas' ? DL.red : DL.yellow, color: '#fff', borderRadius: '10px', px: '5px', fontSize: 8.5, fontWeight: 500 }}>{cnt}</Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Search */}
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <SearchIcon sx={{ position: 'absolute', left: 8, fontSize: 14, color: DL.tS, pointerEvents: 'none' }} />
              <Box component="input" placeholder={t('tr.fin.buscar')} value={search} onChange={e => setSearch(e.target.value)}
                sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: DL.tH, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', pl: '28px', pr: '10px', py: '7px', outline: 'none', minWidth: 150, transition: 'border-color .15s', '&:hover, &:focus': { borderColor: DL.blue }, '&::placeholder': { color: DL.tS } }} />
            </Box>

            <Box sx={{ flex: 1 }} />

            <Box component="button" onClick={e => setColAnchor(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, px: '12px', py: '6px', borderRadius: '7px', border: `1px solid ${DL.border2}`, background: '#fff', color: DL.tM, cursor: 'pointer', '&:hover': { borderColor: DL.blue, color: DL.navy } }}>
              <ColumnIcon sx={{ fontSize: 14 }} /> {t('btn.columns')}
            </Box>
          </Box>
        </Box>

        {/* Bulk action bar */}
        {selCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1a1a1a', borderRadius: '8px', px: '14px', py: '9px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#fff', flex: 1 }}>
              {t('tr.fin.bulk.seleccionadas').replace('{n}', selCount)}
            </Typography>
            <Button size="small" onClick={() => bulkSetEstado('Cobrada')}
              sx={{ fontSize: 11, background: '#16a34a', color: '#fff', borderRadius: '7px', height: 28, '&:hover': { background: '#15803d' }, fontWeight: 500 }}>
              ✓ {t('tr.fin.bulk.marcarCobrada')}
            </Button>
            <Button size="small" onClick={() => bulkSetEstado('Pendiente')}
              sx={{ fontSize: 11, background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: '7px', height: 28, fontWeight: 500 }}>
              ◷ {t('tr.fin.bulk.pendiente')}
            </Button>
            <Button size="small" onClick={() => bulkSetEstado('Vencida')}
              sx={{ fontSize: 11, background: 'rgba(220,38,38,.35)', color: '#fff', borderRadius: '7px', height: 28, fontWeight: 500 }}>
              ! {t('tr.fin.bulk.vencida')}
            </Button>
            <IconButton size="small" onClick={() => setSelected(new Set())} sx={{ color: 'rgba(255,255,255,.5)' }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}

        {/* Table */}
        <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: DL.e1 }}>
          {/* Header */}
          <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, background: 'rgba(26,26,26,.025)', borderBottom: `2px solid ${DL.border}`, px: '12px', py: '8px', alignItems: 'center' }}>
            {visibleDefs.map(d => d.id === 'check'
              ? <Checkbox key="check" size="small" checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} sx={{ p: 0, color: DL.border2 }} />
              : <Typography key={d.id} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{d.labelKey ? t(d.labelKey) : ''}</Typography>
            )}
          </Box>

          {filtered.length === 0 && (
            <Box sx={{ py: '32px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 12, color: DL.tS }}>{t('tr.fin.noFacturas')}</Typography>
            </Box>
          )}

          {filtered.map((f, i) => {
            const isSel    = selected.has(f.id);
            const cobrable = f.estado === 'Pendiente' || f.estado === 'Vencida';
            const editRef   = editCell?.id === f.id && editCell?.field === 'ref';
            const editEstado = editCell?.id === f.id && editCell?.field === 'estado';

            return (
              <Box key={f.id} sx={{
                display: 'grid', gridTemplateColumns: gridCols,
                px: '12px', py: '9px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? `1px solid ${DL.border}` : 'none',
                background: isSel ? 'rgba(84,126,105,.05)' : f.estado === 'Vencida' ? 'rgba(220,38,38,.02)' : 'transparent',
                transition: 'background .12s',
                '&:hover': { background: isSel ? 'rgba(84,126,105,.07)' : 'rgba(84,126,105,.025)' },
              }}>
                {visibleDefs.map(d => {
                  switch (d.id) {
                    case 'check':
                      return <Checkbox key="check" size="small" checked={isSel} onChange={() => toggleOne(f.id)} sx={{ p: 0, color: DL.border2 }} />;
                    case 'id':
                      return <Typography key="id" sx={{ fontSize: 9.5, fontWeight: 500, color: DL.tS, fontFamily: "'DM Mono',monospace" }}>{f.id}</Typography>;
                    case 'proyecto':
                      return (
                        <Box key="proyecto">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{f.proyecto}</Typography>
                            {f.estado === 'Vencida' && (
                              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', px: '6px', py: '1px', borderRadius: '4px', background: '#fee2e2', border: '1px solid #fca5a5' }}>
                                <Typography sx={{ fontSize: 8, fontWeight: 500, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{t('tr.fin.vencido')}</Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography sx={{ fontSize: 9, color: DL.tS, mt: '2px' }}>{f.etapa}</Typography>
                        </Box>
                      );
                    case 'cliente':
                      return <Typography key="cliente" sx={{ fontSize: 10.5, color: DL.tM }}>{f.cliente}</Typography>;
                    case 'tipo':
                      return <TipoChip key="tipo" label={f.tipo} />;
                    case 'monto':
                      return <Typography key="monto" sx={{ fontSize: 12, fontWeight: 500, color: DL.dark, fontFamily: "'DM Mono',monospace" }}>{fmt$(f.monto)}</Typography>;
                    case 'vence':
                      return <Typography key="vence" sx={{ fontSize: 10, color: f.estado === 'Vencida' ? '#dc2626' : DL.tM, fontWeight: f.estado === 'Vencida' ? 500 : 400 }}>{f.vencimiento}</Typography>;
                    case 'estado':
                      return (
                        <Select key="estado" size="small" value={f.estado}
                          onChange={e => updateFactura(f.id, 'estado', e.target.value)}
                          sx={{
                            fontSize: 10, fontWeight: 500, height: 26, borderRadius: '12px',
                            background: ESTADO_STYLE[f.estado]?.bg || '#f3f4f6',
                            color: ESTADO_STYLE[f.estado]?.color || '#404040',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-select': { py: '2px', px: '8px', pr: '22px !important' },
                            '& .MuiSelect-icon': { color: ESTADO_STYLE[f.estado]?.color || '#404040', fontSize: 14, right: '4px' },
                          }}>
                          {!['Cobrada', 'Pendiente'].includes(f.estado) && (
                            <MenuItem value={f.estado} sx={{ display: 'none' }} />
                          )}
                          {['Cobrada', 'Pendiente'].map(s => <MenuItem key={s} value={s} sx={{ fontSize: 11 }}>{s}</MenuItem>)}
                        </Select>
                      );
                    case 'ref':
                      return (
                        <TextField key="ref" size="small" value={f.ref || ''}
                          onChange={e => updateFactura(f.id, 'ref', e.target.value)}
                          placeholder="REF-000000"
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              fontSize: 10, fontWeight: 500, fontFamily: "'DM Mono',monospace", borderRadius: '6px',
                              '& fieldset': { borderColor: 'transparent' },
                              '&:hover fieldset': { borderColor: DL.border },
                              '&.Mui-focused fieldset': { borderColor: DL.blue },
                            },
                            '& .MuiInputBase-input': { py: '4px', px: '6px', color: f.ref ? '#16a34a' : DL.tS },
                          }} />
                      );
                    default: return null;
                  }
                })}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Columns menu */}
      <Menu anchorEl={colAnchor} open={Boolean(colAnchor)} onClose={() => setColAnchor(null)}
        PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 180 } }}>
        {COL_DEFS.filter(d => d.id !== 'check').map(def => (
          <MenuItem key={def.id} onClick={() => toggleCol(def.id)} dense sx={{ gap: '6px' }}>
            <Checkbox checked={cols.includes(def.id)} size="small" sx={{ p: 0 }} />
            <ListItemText primary={def.labelKey ? t(def.labelKey) : ''} primaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
        ))}
      </Menu>

      <RegistrarPagoModal open={!!pagoModal} factura={pagoModal} onClose={() => setPagoModal(null)} onConfirm={handleConfirmPago} />
      <NuevaFacturaModal open={facturaModal} onClose={() => setFacturaModal(false)} />

      <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity={snack?.sev || 'success'} sx={{ fontSize: 12, fontWeight: 500 }}>
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
