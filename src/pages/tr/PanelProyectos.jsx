// Component library: MUI
import { useState, useMemo } from 'react';
import { useT } from '../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputAdornment, Avatar, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, InputLabel, Menu, Checkbox,
  Tooltip, Pagination, IconButton,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Close as CloseIcon,
  FolderOpen as FolderIcon, ViewColumn as ColumnIcon,
  ArrowUpward as AscIcon, ArrowDownward as DescIcon,
  KeyboardArrowUp as UpIcon, KeyboardArrowDown as DownIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';
import PageHeader from '../../components/common/PageHeader';
import { kpiStrip, proyectos, USUARIOS, ESTADO_CHIP, ETAPA_COLOR } from '../../data/tr-mock';

const PAGE_SIZE = 8;

const fmt = (n) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
  : n > 0 ? `$${n.toLocaleString()}` : '$0';

const COL_DEFS = [
  { id: 'id',          labelKey: 'col.id',                sortKey: 'id' },
  { id: 'proyecto',    labelKey: 'col.proyecto',           sortKey: 'nombre' },
  { id: 'cliente',     labelKey: 'col.cliente',            sortKey: 'cliente' },
  { id: 'tipo',        labelKey: 'col.tipo',               sortKey: 'tipo' },
  { id: 'encargado',   labelKey: 'tr.proy.col.encargado',  sortKey: null },
  { id: 'estado',      labelKey: 'col.estado',             sortKey: 'estado' },
  { id: 'etapa',       labelKey: 'tr.proy.col.etapa',      sortKey: 'etapaActual' },
  { id: 'diasAbierto', labelKey: 'tr.proy.col.diasAb',     sortKey: 'diasAbierto' },
  { id: 'diasEnEtapa', labelKey: 'tr.proy.col.diasEtapa',  sortKey: 'diasEnEtapa' },
  { id: 'progreso',    labelKey: 'tr.proy.col.progreso',   sortKey: 'progresoGeneral' },
  { id: 'totalImpl',   labelKey: 'tr.proy.col.totalImpl',  sortKey: 'totalImpl' },
];

const DEFAULT_COLS = ['id', 'proyecto', 'cliente', 'encargado', 'estado', 'etapa', 'diasAbierto', 'totalImpl'];

const ETAPA_LABELS = {
  oferta: 'Oferta', preReg: 'Pre-Registro', cnad: 'CNAD',
  revision: 'Revisión', habilitado: 'Habilitado', emitido: 'Emitido',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function UserChip({ uid }) {
  const u = USUARIOS.find(x => x.id === uid);
  if (!u) return null;
  return (
    <Tooltip title={u.nombre}>
      <Avatar sx={{ width: 22, height: 22, fontSize: 8, fontWeight: 500, background: u.color, border: '2px solid #fff' }}>
        {uid}
      </Avatar>
    </Tooltip>
  );
}

function EstadoChip({ label }) {
  const s = ESTADO_CHIP[label] || { bg: '#f3f4f6', color: '#404040' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: '8px', height: 20, borderRadius: '4px', fontSize: 9, fontWeight: 500, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  );
}

function EtapaChip({ etapaKey }) {
  const s = ETAPA_COLOR[etapaKey] || { bg: '#f3f4f6', color: '#404040', border: '#e3e3e3' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', px: '8px', height: 20, borderRadius: '4px', fontSize: 9, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {ETAPA_LABELS[etapaKey] || etapaKey}
    </Box>
  );
}

// ── KPI Strip ─────────────────────────────────────────────────────────────────
const TOTAL_PROJ = proyectos.length || 1;

function KpiCard({ item }) {
  const { t } = useT();
  const accent = item.alert ? DL.red : DL.blue;
  const barW = Math.min(Math.round((item.count / TOTAL_PROJ) * 100), 100);
  return (
    <Box sx={{
      flex: '1 1 0', minWidth: 80,
      background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px',
      p: '12px 13px 10px', position: 'relative', overflow: 'hidden',
      boxShadow: DL.e1,
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': { boxShadow: DL.e2, transform: 'translateY(-1px)' },
    }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent, borderRadius: '10px 10px 0 0' }} />
      {/* Label */}
      <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', mt: '3px', mb: '5px' }}>{item.label}</Typography>
      {/* Value + divider */}
      <Typography sx={{ fontSize: 22, fontWeight: 500, color: item.alert ? DL.red : DL.tH, lineHeight: 1.05, letterSpacing: '-0.04em', pb: '3px', mb: '3px', borderBottom: '1px solid rgba(26,26,26,.08)' }}>{item.count}</Typography>
      {/* Amount meta row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: '4px' }}>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('tr.fin.col.monto')}</Typography>
        <Typography sx={{ fontSize: 10, fontWeight: 500, color: accent }}>{fmt(item.amount)}</Typography>
      </Box>
      {/* Progress bar */}
      <Box sx={{ height: 6, background: 'rgba(26,26,26,.07)', borderRadius: 5, overflow: 'hidden', mb: '4px' }}>
        <Box sx={{ height: '100%', borderRadius: 5, width: `${barW}%`, background: accent, transition: 'width .6s ease' }} />
      </Box>
      {/* Footer */}
      <Box sx={{ background: DL.subtle, borderRadius: '5px', px: '7px', py: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 7.5, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('tr.proy.kpi.prom')}</Typography>
        <Typography sx={{ fontSize: 8, fontWeight: 500, color: DL.tM }}>{item.diasProm}d</Typography>
      </Box>
    </Box>
  );
}

// ── Column Manager Menu ────────────────────────────────────────────────────────
function ColumnMenu({ cols, setCols, anchor, onClose }) {
  const { t } = useT();
  const move = (i, dir) => {
    setCols(prev => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const toggle = (id) => {
    setCols(prev =>
      prev.includes(id) && prev.length > 2
        ? prev.filter(c => c !== id)
        : prev.includes(id) ? prev : [...prev, id]
    );
  };

  return (
    <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={onClose}
      PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 230, p: '4px' } }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', px: '12px', pt: '8px', pb: '4px' }}>
        {t('lbl.colVisibles')}
      </Typography>
      {COL_DEFS.map((def) => {
        const idx = cols.indexOf(def.id);
        const visible = idx !== -1;
        return (
          <Box key={def.id} sx={{ display: 'flex', alignItems: 'center', gap: '4px', px: '8px', py: '4px', borderRadius: '6px', '&:hover': { background: '#f6f6f6' } }}>
            <Checkbox size="small" checked={visible} onChange={() => toggle(def.id)} sx={{ p: 0 }} />
            <Typography sx={{ fontSize: 12, flex: 1, color: visible ? DL.tH : DL.tS }}>{t(def.labelKey)}</Typography>
            {visible && (
              <Box sx={{ display: 'flex' }}>
                <IconButton size="small" onClick={() => move(idx, -1)} disabled={idx === 0} sx={{ p: '2px' }}>
                  <UpIcon sx={{ fontSize: 13 }} />
                </IconButton>
                <IconButton size="small" onClick={() => move(idx, 1)} disabled={idx === cols.length - 1} sx={{ p: '2px' }}>
                  <DownIcon sx={{ fontSize: 13 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      })}
    </Menu>
  );
}

// ── Cell Renderer ─────────────────────────────────────────────────────────────
function CellValue({ colId, p }) {
  const { t } = useT();
  switch (colId) {
    case 'id':
      return <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tS }}>{p.id}</Typography>;
    case 'proyecto':
      return (
        <Box sx={{ pr: '8px' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, lineHeight: 1 }}>{p.nombre}</Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.04em', mt: '2px' }}>{p.tipo}</Typography>
          <LinearProgress variant="determinate" value={p.progresoGeneral}
            sx={{ mt: '5px', height: 3, borderRadius: 2, background: '#ededed', '& .MuiLinearProgress-bar': { background: DL.blue, borderRadius: 2 } }} />
        </Box>
      );
    case 'cliente':
      return <Typography sx={{ fontSize: 11, color: DL.tM }}>{p.cliente}</Typography>;
    case 'tipo':
      return <Typography sx={{ fontSize: 10, color: DL.tM }}>{p.tipo}</Typography>;
    case 'encargado':
      return <Box sx={{ display: 'flex', gap: '3px' }}>{p.encargados.map(uid => <UserChip key={uid} uid={uid} />)}</Box>;
    case 'estado':
      return <EstadoChip label={p.estado} />;
    case 'etapa':
      return <EtapaChip etapaKey={p.etapaActual} />;
    case 'diasAbierto':
      return <Typography sx={{ fontSize: 11, color: DL.tM }}>{p.diasAbierto} {t('tr.proy.dias')}</Typography>;
    case 'diasEnEtapa':
      return <Typography sx={{ fontSize: 11, color: DL.tM }}>{p.diasEnEtapa} {t('tr.proy.dias')}</Typography>;
    case 'progreso':
      return (
        <Box sx={{ minWidth: 80 }}>
          <Typography sx={{ fontSize: 9, color: DL.tS, mb: '2px' }}>{p.progresoGeneral}%</Typography>
          <LinearProgress variant="determinate" value={p.progresoGeneral}
            sx={{ height: 4, borderRadius: 2, background: '#ededed', '& .MuiLinearProgress-bar': { background: DL.blue, borderRadius: 2 } }} />
        </Box>
      );
    case 'totalImpl':
      return (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.blue }}>${p.totalImpl.toLocaleString()}</Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS }}>${p.totalImplGoal.toLocaleString()} ({Math.round((p.totalImpl / p.totalImplGoal) * 100)}%)</Typography>
        </Box>
      );
    default: return null;
  }
}

// ── Modal Nuevo Proyecto ───────────────────────────────────────────────────────
const fieldSx = { '& .MuiInputBase-root': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } };

function NuevoProyectoModal({ open, onClose }) {
  const { t } = useT();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderIcon sx={{ fontSize: 20, color: DL.blue }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH }}>{t('tr.proy.modal.titulo')}</Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('tr.proy.modal.sub')}</Typography>
          </Box>
        </Box>
        <Box onClick={onClose} sx={{ cursor: 'pointer', color: DL.tS, display: 'flex' }}><CloseIcon sx={{ fontSize: 18 }} /></Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: 1.5 }}>{t('tr.proy.modal.infoGeneral')}</Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12}><TextField fullWidth label={t('tr.proy.modal.nombreProy')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={12}><TextField fullWidth label={t('tr.proy.modal.descripcion')} size="small" multiline rows={2} sx={fieldSx} /></Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>{t('tr.proy.modal.tipoEmision')}</InputLabel>
              <Select label={t('tr.proy.modal.tipoEmision')}><MenuItem value="Pública">Pública</MenuItem><MenuItem value="Privada">Privada</MenuItem></Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>{t('tr.proy.modal.tipoServicio')}</InputLabel>
              <Select label={t('tr.proy.modal.tipoServicio')}><MenuItem value="Token">Token</MenuItem></Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>{t('tr.proy.col.encargado')}</InputLabel>
              <Select label={t('tr.proy.col.encargado')}>{USUARIOS.map(u => <MenuItem key={u.id} value={u.id} sx={{ fontSize: 11 }}>{u.nombre}</MenuItem>)}</Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}><TextField fullWidth label={t('tr.proy.modal.montoProy')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={6}><TextField fullWidth label={t('tr.proy.modal.montoDepositado')} size="small" sx={fieldSx} /></Grid>
        </Grid>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: 1.5 }}>{t('tr.proy.modal.detallesProy')}</Typography>
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>{t('col.cliente')} *</InputLabel>
              <Select label={`${t('col.cliente')} *`}><MenuItem value="">{t('tr.lbl.seleccionar')}</MenuItem></Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}><TextField fullWidth label={t('tr.proy.modal.industria')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={4}><TextField fullWidth label={t('tr.proy.modal.estructurador')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={4}><TextField fullWidth label="PSAD" size="small" sx={fieldSx} /></Grid>
        </Grid>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: 1.5 }}>{t('tr.proy.modal.detallesEmision')}</Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>{t('tr.proy.modal.tipoToken')}</InputLabel>
              <Select label={t('tr.proy.modal.tipoToken')}><MenuItem value="Renta Fija">Renta Fija</MenuItem><MenuItem value="Equity">Equity</MenuItem></Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}><TextField fullWidth label={t('tr.proy.modal.activoSub')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={4}><TextField fullWidth label={t('tr.proy.modal.montoToken')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={4}><TextField fullWidth label={t('tr.proy.modal.precioToken')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={4}><TextField fullWidth label={t('tr.proy.modal.totalTokens')} size="small" sx={fieldSx} /></Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>Blockchain</InputLabel>
              <Select label="Blockchain"><MenuItem value="Polygon">Polygon</MenuItem><MenuItem value="Ethereum">Ethereum</MenuItem></Select>
              {/* Blockchain is a proper noun — keep as-is */}
            </FormControl>
          </Grid>
          <Grid item xs={6}><TextField fullWidth label={t('tr.proy.modal.nombreToken')} size="small" sx={fieldSx} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">{t('btn.cancel')}</Button>
        <Button variant="contained" size="small" startIcon={<FolderIcon sx={{ fontSize: 13 }} />}>{t('tr.proy.modal.guardar')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PanelProyectos() {
  const { t } = useT();
  const navigate = useNavigate();
  const [cols, setCols]             = useState(DEFAULT_COLS);
  const [colAnchor, setColAnchor]   = useState(null);
  const [search, setSearch]         = useState('');
  const [estadoFilter, setEstado]   = useState('');
  const [encFilter, setEnc]         = useState('');
  const [etapaFilter, setEtapa]     = useState('');
  const [emisionFilter, setEmision] = useState('');
  const [sortCol, setSortCol]       = useState(null);
  const [sortAsc, setSortAsc]       = useState(true);
  const [page, setPage]             = useState(1);
  const [modalOpen, setModalOpen]   = useState(false);

  const handleSort = (colId) => {
    const def = COL_DEFS.find(c => c.id === colId);
    if (!def?.sortKey) return;
    if (sortCol === colId) setSortAsc(a => !a);
    else { setSortCol(colId); setSortAsc(true); }
  };

  const filtered = useMemo(() => {
    let list = proyectos.filter(p => {
      const matchSearch  = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.cliente.toLowerCase().includes(search.toLowerCase());
      const matchEstado  = !estadoFilter || p.estado === estadoFilter;
      const matchEnc     = !encFilter || p.encargados.includes(encFilter);
      const matchEtapa   = !etapaFilter || p.etapaActual === etapaFilter;
      const matchEmision = !emisionFilter || p.tipoEmision === emisionFilter;
      return matchSearch && matchEstado && matchEnc && matchEtapa && matchEmision;
    });
    if (sortCol) {
      const def = COL_DEFS.find(c => c.id === sortCol);
      if (def?.sortKey) {
        list = [...list].sort((a, b) => {
          const va = a[def.sortKey], vb = b[def.sortKey];
          if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
          return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
        });
      }
    }
    return list;
  }, [search, estadoFilter, encFilter, etapaFilter, emisionFilter, sortCol, sortAsc]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const visibleDefs = cols.map(id => COL_DEFS.find(d => d.id === id)).filter(Boolean);
  const gridCols = visibleDefs.map(d => {
    const map = { id: '52px', proyecto: '1.6fr', cliente: '1.2fr', tipo: '1.1fr', encargado: '90px', estado: '100px', etapa: '110px', diasAbierto: '90px', diasEnEtapa: '90px', progreso: '100px', totalImpl: '110px' };
    return map[d.id] || '1fr';
  }).join(' ');

  const estados = [...new Set(proyectos.map(p => p.estado))];
  const etapas  = [...new Set(proyectos.map(p => p.etapaActual))];
  const hasFilters = search || estadoFilter || encFilter || etapaFilter || emisionFilter;

  return (
    <Box sx={{ minHeight: '100%', background: DL.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <PageHeader title={t('tr.proy.titulo')}>
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          onClick={() => setModalOpen(true)}
          sx={{ height: 32, fontSize: 11 }}>
          {t('tr.proy.nuevoProy')}
        </Button>
      </PageHeader>

      {/* Body */}
      <Box sx={{ p: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>

      {/* KPI Strip */}
      <Box sx={{ display: 'flex', gap: '8px', overflowX: 'auto', pb: '4px' }}>
        {kpiStrip.map(k => <KpiCard key={k.label} item={k} />)}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: '#fff', p: '10px 14px', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 }}>
        {/* Search */}
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <SearchIcon sx={{ position: 'absolute', left: 8, fontSize: 14, color: DL.tS, pointerEvents: 'none' }} />
          <Box component="input" placeholder={t('tr.proy.buscar')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: DL.tH, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', pl: '28px', pr: '10px', py: '7px', outline: 'none', minWidth: 200, transition: 'border-color .15s', '&:hover, &:focus': { borderColor: DL.blue }, '&::placeholder': { color: DL.tS } }} />
        </Box>

        {/* Estado */}
        {[
          { label: t('col.estado'),            value: estadoFilter, onChange: v => { setEstado(v); setPage(1); }, options: estados.map(e => ({ value: e, label: e })) },
          { label: t('tr.proy.col.etapa'),     value: etapaFilter,  onChange: v => { setEtapa(v);  setPage(1); }, options: etapas.map(e => ({ value: e, label: ETAPA_LABELS[e] || e })) },
          { label: t('tr.proy.col.encargado'), value: encFilter,    onChange: v => { setEnc(v);    setPage(1); }, options: USUARIOS.map(u => ({ value: u.id, label: u.nombre })) },
          { label: t('tr.proy.modal.tipoEmision'), value: emisionFilter, onChange: v => { setEmision(v); setPage(1); }, options: [{ value: 'Pública', label: 'Pública' }, { value: 'Privada', label: 'Privada' }] },
        ].map(f => (
          <Box key={f.label} sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column' }}>
            <Typography sx={{ position: 'absolute', top: -7, left: 10, zIndex: 1, fontSize: 8.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, background: '#fff', px: '3px', pointerEvents: 'none' }}>
              {f.label}
            </Typography>
            <Box component="select" value={f.value} onChange={e => f.onChange(e.target.value)}
              sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: f.value ? DL.tH : DL.tS, background: '#fff', border: `1px solid ${f.value ? DL.blue : DL.border2}`, borderRadius: '7px', py: '7px', pl: '10px', pr: '26px', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 110, transition: 'border-color .15s', '&:hover': { borderColor: DL.blue } }}>
              <option value="">{t('tr.lbl.todos')}</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Box>
            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
          </Box>
        ))}

        {hasFilters && (
          <Box component="button" onClick={() => { setSearch(''); setEstado(''); setEnc(''); setEtapa(''); setEmision(''); setPage(1); }}
            sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, px: '10px', py: '6px', borderRadius: '7px', border: `1px solid ${DL.redBd}`, background: DL.redBg, color: DL.red, cursor: 'pointer', '&:hover': { background: DL.redBd } }}>
            {t('btn.limpiar')}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        <Box component="button" onClick={e => setColAnchor(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, px: '12px', py: '6px', borderRadius: '7px', border: `1px solid ${DL.border2}`, background: '#fff', color: DL.tM, cursor: 'pointer', '&:hover': { borderColor: DL.blue, color: DL.navy } }}>
          <ColumnIcon sx={{ fontSize: 14 }} /> {t('btn.columns')}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: DL.e1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, background: 'rgba(26,26,26,.025)', borderBottom: `2px solid ${DL.border}`, px: '14px', py: '9px', alignItems: 'center' }}>
          {visibleDefs.map(def => {
            const sortable = !!def.sortKey;
            const active   = sortCol === def.id;
            return (
              <Box key={def.id} onClick={() => handleSort(def.id)}
                sx={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: active ? DL.blue : DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', transition: 'color .14s' }}>
                  {t(def.labelKey)}
                </Typography>
                {active && (sortAsc ? <AscIcon sx={{ fontSize: 11, color: DL.blue }} /> : <DescIcon sx={{ fontSize: 11, color: DL.blue }} />)}
              </Box>
            );
          })}
        </Box>

        {pageData.length === 0 && (
          <Box sx={{ py: '48px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: DL.tS }}>{t('tr.proy.noProyectos')}</Typography>
          </Box>
        )}

        {pageData.map((p, i) => (
          <Box key={p.id} onClick={() => navigate(`/tr/proyectos/${p.id}`)}
            sx={{
              display: 'grid', gridTemplateColumns: gridCols,
              px: '14px', py: '11px', alignItems: 'center',
              borderBottom: i < pageData.length - 1 ? `1px solid ${DL.border}` : 'none',
              cursor: 'pointer', transition: 'background .12s',
              '&:hover': { background: 'rgba(84,126,105,.035)' },
            }}>
            {visibleDefs.map(def => (
              <Box key={def.id}><CellValue colId={def.id} p={p} /></Box>
            ))}
          </Box>
        ))}
      </Box>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '12px' }}>
          <Typography sx={{ fontSize: 11, color: DL.tS }}>{t('tr.proy.paginacion').replace('{total}', filtered.length).replace('{page}', page).replace('{total_pages}', pageCount)}</Typography>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small" color="primary"
            sx={{ '& .MuiPaginationItem-root': { fontSize: 11, borderRadius: '7px' } }} />
        </Box>
      )}

      <ColumnMenu cols={cols} setCols={setCols} anchor={colAnchor} onClose={() => setColAnchor(null)} />
      <NuevoProyectoModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Box>
    </Box>
  );
}
