// ─── Ingreso de Metas ─────────────────────────────────────────────────────────
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, MenuItem, Select, TextField,
  Button, IconButton, Divider, Tooltip, Switch,
  Popover, Checkbox,
} from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { useT } from '../i18n/LanguageContext';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LinkRounded as UniformIcon,
  LinkOffRounded as NotUniformIcon,
  VisibilityOff as HideIcon,
  Visibility as ShowIcon,
  ViewColumn as ColsIcon,
  TableRows as RowsIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  OpenInFull as ExpandIcon,
} from '@mui/icons-material';
import { DL } from '../theme';
import {
  MESES, SUCURSALES_M, VENDEDORES_M, CATEGORIAS_M, UOMS, METAS_INIT,
} from '../data/metas';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt$ = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });
let nextId = 100;

const MES_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];

// ─── KPI Indicators initial state ────────────────────────────────────────────
const KPI_DEFS = [
  { id: 'margen',   labelKey: 'metas.kpi.margen',   uom: '%',  uomColor: '#92400e', uomBg: '#fef3c7', defaultVal: Array(12).fill(25) },
  { id: 'ticket',   labelKey: 'metas.kpi.ticket',   uom: '$',  uomColor: '#1a1a1a', uomBg: '#e8e8e8', defaultVal: Array(12).fill(374) },
  { id: 'activos',  labelKey: 'metas.kpi.activos',  uom: '#',  uomColor: '#404040', uomBg: '#f3f4f6', defaultVal: [110,112,115,116,118,119,120,121,122,123,124,125] },
  { id: 'facturas', labelKey: 'metas.kpi.facturas', uom: '#',  uomColor: '#404040', uomBg: '#f3f4f6', defaultVal: [38,39,40,40,41,41,42,43,43,44,44,45] },
  { id: 'nuevos',   labelKey: 'metas.kpi.nuevos',   uom: '#',  uomColor: '#166534', uomBg: '#dcfce7', defaultVal: [8,9,9,10,10,10,10,10,10,11,11,12] },
  { id: 'abandon',  labelKey: 'metas.kpi.abandon',  uom: '#',  uomColor: '#991b1b', uomBg: '#fee2e2', defaultVal: Array(12).fill(5) },
];

function buildKpiState() {
  return KPI_DEFS.map(k => ({
    ...k,
    active:  true,
    uniform: k.id === 'margen' || k.id === 'ticket' || k.id === 'abandon',
    values:  [...k.defaultVal],
  }));
}

// ─── Inline Select ────────────────────────────────────────────────────────────
function InlineSelect({ value, onChange, options, width = 140, allowEmpty = false }) {
  const { t } = useT();
  return (
    <Select
      value={value} onChange={(e) => onChange(e.target.value)}
      size="small" variant="standard" disableUnderline displayEmpty
      sx={{
        fontSize: 11, minWidth: width,
        '.MuiSelect-select': { py: '3px', px: '6px', borderRadius: '4px', background: '#f8fafc', border: '1px solid #e3e3e3' },
        '&:hover .MuiSelect-select': { borderColor: DL.blue },
      }}
      renderValue={(v) => v === '' ? (
        <span style={{ color: '#8d8d8d', fontStyle: 'italic', fontSize: 11 }}>{t('metas.lbl.alGranel')}</span>
      ) : v}
    >
      {allowEmpty && (
        <MenuItem value="" sx={{ fontSize: 11, color: '#8d8d8d', fontStyle: 'italic' }}>{t('metas.lbl.alGranel')}</MenuItem>
      )}
      {options.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 11 }}>{o}</MenuItem>)}
    </Select>
  );
}

function MontoInput({ value, onChange, align = 'right', width = 90 }) {
  return (
    <TextField
      value={value} onChange={(e) => onChange(e.target.value)}
      size="small" variant="standard"
      InputProps={{ disableUnderline: true }}
      inputProps={{ style: { textAlign: align, fontSize: 11, padding: '3px 6px', background: '#f8fafc', border: '1px solid #e3e3e3', borderRadius: '4px', width } }}
    />
  );
}



// ─── Summary Tree ─────────────────────────────────────────────────────────────
const MES_ORDER  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function buildTree(rows, dims) {
  const insert = (node, path, row, monto) => {
    const key = row[path[0]] || '';
    if (!node[key]) node[key] = { total: 0, children: {} };
    node[key].total += monto;
    if (path.length > 1) insert(node[key].children, path.slice(1), row, monto);
  };
  const root = {};
  rows.forEach(r => insert(root, dims, r, Number(r.monto) || 0));
  return root;
}

function TreeNodes({ nodes, dims, depth, collapsed, toggle }) {
  const { t } = useT();
  const isLeaf = dims.length <= 1;
  const indent = depth * 18 + 14;

  const sortedKeys = Object.keys(nodes).sort((a, b) =>
    dims[0] === 'mes'
      ? MES_ORDER.indexOf(a) - MES_ORDER.indexOf(b)
      : (a || '').localeCompare(b || '')
  );

  return sortedKeys.map(key => {
    const node   = nodes[key];
    const nodeKey = `${dims[0]}-${depth}-${key}`;
    const isOpen  = !collapsed[nodeKey];
    const hasKids = !isLeaf && Object.keys(node.children).length > 0;
    const isTop   = depth === 0;

    return (
      <Box key={nodeKey}>
        <Box
          onClick={() => hasKids && toggle(nodeKey)}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pl: `${indent}px`, pr: '14px', py: isTop ? '7px' : isLeaf ? '4px' : '5px',
            cursor: hasKids ? 'pointer' : 'default',
            background: isTop ? '#f8fafc' : 'transparent',
            borderBottom: `1px solid ${isTop ? '#f6f6f6' : '#f8fafc'}`,
            '&:hover': hasKids ? { background: isTop ? '#f6f6f6' : '#fafafa' } : {},
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {hasKids && (isOpen
              ? <ExpandLessIcon sx={{ fontSize: isTop ? 13 : 11, color: isTop ? DL.blue : DL.tS }} />
              : <ExpandMoreIcon sx={{ fontSize: isTop ? 13 : 11, color: isTop ? DL.blue : DL.tS }} />
            )}
            {!hasKids && !isTop && <Box sx={{ width: isLeaf ? 3 : 5, height: isLeaf ? 3 : 5, borderRadius: '50%', background: isLeaf ? '#8d8d8d' : DL.blue, ml: '2px' }} />}
            <Typography sx={{
              fontSize: isTop ? 11 : isLeaf ? 9 : 10,
              fontWeight: isTop ? 500 : isLeaf ? 400 : 500,
              color: key ? (isTop ? DL.tH : isLeaf ? DL.tS : DL.tM) : '#8d8d8d',
              fontStyle: key ? 'normal' : 'italic',
            }}>
              {key || t('metas.lbl.alGranel')}
            </Typography>
          </Box>
          <Typography sx={{
            fontSize: isTop ? 11 : 10,
            fontWeight: isTop ? 500 : isLeaf ? 500 : 500,
            color: isTop ? DL.blue : isLeaf ? DL.tH : DL.tM,
          }}>
            {fmt$(node.total)}
          </Typography>
        </Box>
        {hasKids && isOpen && (
          <TreeNodes nodes={node.children} dims={dims.slice(1)} depth={depth + 1} collapsed={collapsed} toggle={toggle} />
        )}
      </Box>
    );
  });
}

function SummaryTree({ rows }) {
  const { t } = useT();
  const navigate = useNavigate();
  const [collapsed,  setCollapsed]  = useState({});
  const [dimOrder,   setDimOrder]   = useState(['mes', 'sucursal', 'vendedor']);
  const [rowsAnchor, setRowsAnchor] = useState(null);

  const tree       = useMemo(() => buildTree(rows, dimOrder), [rows, dimOrder]);
  const grandTotal = useMemo(() => rows.reduce((s, r) => s + (Number(r.monto) || 0), 0), [rows]);
  const toggle     = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const moveDim = (i, dir) => setDimOrder(prev => {
    const arr = [...prev]; const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]]; return arr;
  });

  return (
    <Box sx={{ background: '#fff', borderRadius: '8px', boxShadow: DL.e1, overflow: 'hidden', flexShrink: 0, width: 360, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <Box sx={{ background: '#fff', borderBottom: `1px solid ${DL.border}`, px: '14px', py: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, whiteSpace: 'nowrap' }}>{t('lbl.resumenMetas')}</Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.blue }}>{fmt$(grandTotal)}</Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>

          {/* Filas button */}
          <Box onClick={(e) => setRowsAnchor(e.currentTarget)} sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            px: '9px', py: '5px', borderRadius: '7px', cursor: 'pointer',
            border: `1px solid ${DL.border2}`, background: '#fff',
            color: DL.tM, fontSize: 10, fontWeight: 500,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            '&:hover': { borderColor: DL.blue, color: DL.navy },
            transition: 'all .14s',
          }}>
            <RowsIcon sx={{ fontSize: 14 }} />
            {t('btn.filas')}
          </Box>

          {/* Filas popover */}
          <Popover
            open={Boolean(rowsAnchor)} anchorEl={rowsAnchor}
            onClose={() => setRowsAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { borderRadius: '10px', mt: '6px', minWidth: 200, boxShadow: '0 8px 32px rgba(26,26,26,.12)', overflow: 'hidden' } }}
          >
            <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                {t('lbl.ordenJerarquico')}
              </Typography>
            </Box>
            <Box sx={{ py: '6px' }}>
              {dimOrder.map((dim, i) => (
                <Box key={dim} sx={{ display: 'flex', alignItems: 'center', px: '12px', py: '6px', gap: '8px', '&:hover': { background: '#f8fafc' } }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: '4px', background: '#f6f6f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: DL.tS, flexShrink: 0 }}>
                    {i + 1}
                  </Box>
                  <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 500, color: DL.tH }}>
                    {dim === 'mes' ? t('time.mes') : dim === 'sucursal' ? t('des.tab.sucursal') : t('des.tab.vendedor')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '2px' }}>
                    <Box component="button" onClick={() => moveDim(i, -1)} disabled={i === 0}
                      sx={{ width: 20, height: 20, borderRadius: '4px', border: `1px solid ${DL.border2}`, background: '#fff', cursor: i === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i === 0 ? '#d4d4d4' : DL.tM, fontFamily: 'inherit', '&:hover:not(:disabled)': { borderColor: DL.blue, color: DL.blue } }}>↑</Box>
                    <Box component="button" onClick={() => moveDim(i, 1)} disabled={i === dimOrder.length - 1}
                      sx={{ width: 20, height: 20, borderRadius: '4px', border: `1px solid ${DL.border2}`, background: '#fff', cursor: i === dimOrder.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i === dimOrder.length - 1 ? '#d4d4d4' : DL.tM, fontFamily: 'inherit', '&:hover:not(:disabled)': { borderColor: DL.blue, color: DL.blue } }}>↓</Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Popover>

          {/* Ver todo */}
          <Box onClick={() => navigate('/metas/todo')} sx={{
            display: 'flex', alignItems: 'center', gap: '4px',
            px: '7px', py: '5px', borderRadius: '7px', cursor: 'pointer',
            border: `1px solid ${DL.border2}`, color: DL.tM, fontSize: 10, fontWeight: 500,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            '&:hover': { borderColor: DL.blue, color: DL.navy },
            transition: 'all .14s',
          }}>
            <ExpandIcon sx={{ fontSize: 10 }} />
            {t('btn.verTodo')}
          </Box>
        </Box>
      </Box>

      {/* Tree */}
      <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 } }}>
        {Object.keys(tree).length === 0 ? (
          <Box sx={{ p: '24px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, color: DL.tS }}>{t('lbl.sinMetas')}</Typography>
          </Box>
        ) : (
          <TreeNodes nodes={tree} dims={dimOrder} depth={0} collapsed={collapsed} toggle={toggle} />
        )}
      </Box>

      <Divider />
      <Box sx={{ px: '14px', py: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('lbl.totalGeneral')}</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH }}>{fmt$(grandTotal)}</Typography>
      </Box>
    </Box>
  );
}

// ─── KPI Spreadsheet Cell ─────────────────────────────────────────────────────
function KpiCell({ value, onChange, active, uniform, isFirst }) {
  const disabled = !active || (uniform && !isFirst);
  return (
    <input
      type="number"
      value={disabled && !isFirst ? value : value}
      onChange={(e) => !disabled && onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%', minWidth: 0,
        padding: '5px 6px',
        fontSize: 12,
        fontWeight: 500,
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        border: `1.5px solid ${disabled ? '#f6f6f6' : '#e3e3e3'}`,
        borderRadius: 6,
        background: disabled ? '#f8fafc' : '#fff',
        color: disabled ? '#8d8d8d' : DL.tH,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color .14s',
      }}
      onFocus={e => { e.target.style.borderColor = DL.blue; }}
      onBlur={e => { e.target.style.borderColor = disabled ? '#f6f6f6' : '#e3e3e3'; }}
    />
  );
}

// ─── KPI Spreadsheet ─────────────────────────────────────────────────────────
// For % indicators → show average; for all others → show total
function kpiAggregate(kpi, t) {
  const sum = kpi.values.reduce((s, v) => s + (Number(v) || 0), 0);
  if (kpi.uom === '%') {
    return { label: t('metas.agg.prom'), value: (sum / 12).toFixed(1) + '%' };
  }
  if (kpi.uom === '$K') {
    return { label: t('metas.agg.total'), value: '$' + (sum).toLocaleString('en-US') + 'K' };
  }
  return { label: t('metas.agg.total'), value: sum.toLocaleString('en-US') };
}

function KpiSpreadsheet({ kpis, onUpdate, onToggleActive, onToggleUniform }) {
  const { t } = useT();
  return (
    <Box sx={{ background: '#fff', borderRadius: '8px', boxShadow: DL.e1, overflow: 'hidden' }}>
      {/* Section header */}
      <Box sx={{
        background: '#fff', borderBottom: `1px solid ${DL.border}`,
        px: '16px', py: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box sx={{ width: 3, height: 16, background: DL.blue, borderRadius: 2 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, letterSpacing: '.05em', textTransform: 'uppercase' }}>
            {t('metas.kpis.titulo')}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 10, color: DL.tS, fontStyle: 'italic' }}>
          {t('metas.kpis.nota')}
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { height: 5 }, '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 3 } }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={{ width: 28, padding: '10px 8px 10px 14px' }} />
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9, fontWeight: 500, color: DL.tS, letterSpacing: '.08em', borderBottom: '2px solid #f6f6f6', whiteSpace: 'nowrap', minWidth: 190 }}>
                {t('metas.kpis.indicador')}
              </th>
              <th style={{ width: 60, padding: '10px 8px', textAlign: 'center', fontSize: 9, fontWeight: 500, color: DL.tS, letterSpacing: '.06em', borderBottom: '2px solid #f6f6f6' }}>
                {t('metas.kpis.todoAnio')}
              </th>
              {MES_SHORT.map(m => (
                <th key={m} style={{ padding: '10px 6px', textAlign: 'center', fontSize: 10, fontWeight: 500, color: DL.tM, letterSpacing: '.06em', borderBottom: '2px solid #f6f6f6', minWidth: 72 }}>
                  {m}
                </th>
              ))}
              {/* Aggregate column */}
              <th style={{ padding: '10px 10px', textAlign: 'center', fontSize: 9, fontWeight: 500, color: DL.tS, letterSpacing: '.06em', borderBottom: '2px solid #f6f6f6', borderLeft: '2px solid #f6f6f6', minWidth: 80, whiteSpace: 'nowrap', background: '#f8fafc' }}>
                {t('metas.kpis.totalProm')}
              </th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, rowIdx) => {
              const agg = kpiAggregate(kpi, t);
              return (
                <tr key={kpi.id} style={{
                  background: !kpi.active ? '#fafafa' : rowIdx % 2 === 0 ? '#fff' : '#f6f6f6',
                  opacity: kpi.active ? 1 : 0.55,
                  transition: 'opacity .2s, background .2s',
                }}>
                  {/* Active toggle */}
                  <td style={{ padding: '8px 4px 8px 10px', verticalAlign: 'middle' }}>
                    <Tooltip title={kpi.active ? t('metas.tooltip.desactivar') : t('metas.tooltip.activar')} placement="right">
                      <Box
                        onClick={() => onToggleActive(kpi.id)}
                        sx={{
                          width: 20, height: 20, borderRadius: '50%', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: kpi.active ? '#e8e8e8' : '#f6f6f6',
                          color: kpi.active ? DL.blue : '#8d8d8d',
                          '&:hover': { background: kpi.active ? '#d4d4d4' : '#e3e3e3' },
                          transition: 'background .14s',
                        }}
                      >
                        {kpi.active ? <ShowIcon sx={{ fontSize: 11 }} /> : <HideIcon sx={{ fontSize: 11 }} />}
                      </Box>
                    </Tooltip>
                  </td>

                  {/* Label */}
                  <td style={{ padding: '8px 14px', verticalAlign: 'middle', borderBottom: '1px solid #f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: kpi.active ? DL.tH : DL.tS }}>
                        {t(kpi.labelKey)}
                      </Typography>
                      <Box sx={{ px: '5px', py: '1px', borderRadius: '4px', fontSize: 9, fontWeight: 500, background: kpi.uomBg, color: kpi.uomColor, lineHeight: 1.6 }}>
                        {kpi.uom}
                      </Box>
                    </Box>
                  </td>

                  {/* Uniform toggle */}
                  <td style={{ padding: '8px', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #f8fafc' }}>
                    <Tooltip title={kpi.uniform ? t('metas.tooltip.individual') : t('metas.tooltip.uniform')} placement="top">
                      <Box
                        onClick={() => kpi.active && onToggleUniform(kpi.id)}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: '6px',
                          cursor: kpi.active ? 'pointer' : 'default',
                          background: kpi.uniform ? '#f6f6f6' : 'transparent',
                          color: kpi.uniform ? DL.blue : '#d4d4d4',
                          border: `1.5px solid ${kpi.uniform ? '#d4d4d4' : '#e3e3e3'}`,
                          '&:hover': kpi.active ? { background: '#e8e8e8', color: DL.blue, borderColor: '#b8b8b8' } : {},
                          transition: 'all .14s',
                        }}
                      >
                        {kpi.uniform ? <UniformIcon sx={{ fontSize: 13 }} /> : <NotUniformIcon sx={{ fontSize: 13 }} />}
                      </Box>
                    </Tooltip>
                  </td>

                  {/* Month cells */}
                  {kpi.values.map((val, mi) => (
                    <td key={mi} style={{ padding: '6px 4px', verticalAlign: 'middle', borderBottom: '1px solid #f8fafc' }}>
                      {kpi.uniform && mi > 0 ? (
                        <Box sx={{
                          width: '100%', py: '5px', px: '6px',
                          fontSize: 12, fontWeight: 500, textAlign: 'center',
                          color: kpi.active ? '#8d8d8d' : '#d4d4d4',
                          background: '#f8fafc', border: '1.5px solid #f6f6f6', borderRadius: '6px',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {kpi.values[0]}
                        </Box>
                      ) : (
                        <KpiCell
                          value={val} active={kpi.active} uniform={kpi.uniform} isFirst={mi === 0}
                          onChange={(v) => onUpdate(kpi.id, mi, v, kpi.uniform)}
                        />
                      )}
                    </td>
                  ))}

                  {/* Aggregate cell */}
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', borderBottom: '1px solid #f8fafc', borderLeft: '2px solid #f6f6f6', background: rowIdx % 2 === 0 ? '#f8fafc' : '#f6f6f6', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, letterSpacing: '.04em', mb: '1px' }}>
                      {agg.label}
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: kpi.active ? DL.blue : '#8d8d8d', letterSpacing: '-0.3px' }}>
                      {agg.value}
                    </Typography>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ label, active, onClick, badge }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: '16px', py: '8px', cursor: 'pointer', userSelect: 'none',
        borderBottom: `2px solid ${active ? DL.blue : 'transparent'}`,
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'border-color .14s',
        '&:hover': { borderBottomColor: active ? DL.blue : '#d4d4d4' },
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: active ? 500 : 500, color: active ? DL.blue : DL.tS, transition: 'color .14s' }}>
        {label}
      </Typography>
      {badge !== undefined && (
        <Box sx={{ fontSize: 9, fontWeight: 500, px: '5px', py: '1px', borderRadius: '10px', background: active ? '#e8e8e8' : '#f6f6f6', color: active ? DL.blue : DL.tS }}>
          {badge}
        </Box>
      )}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Metas() {
  const { t } = useT();
  const navigate = useNavigate();

  // Tab state
  const [tab, setTab] = useState('ventas'); // 'ventas' | 'dashboard'

  // Ventas tab state
  const [rows, setRows]   = useState(METAS_INIT);
  const [newRow, setNewRow] = useState({
    mes: 'Enero', sucursal: '', vendedor: '', categoria: '', uom: 'USD', monto: '',
  });
  const [filterMes, setFilterMes]   = useState('Todos');
  const [filterSuc, setFilterSuc]   = useState('Todos');
  const [filterVend, setFilterVend] = useState('Todos');
  const [sortField, setSortField]   = useState('mes');
  const [sortDir,   setSortDir]     = useState('asc');
  const [colsAnchor, setColsAnchor] = useState(null);

  const ALL_COLS = [
    { id: 'mes',       label: t('metas.col.mes'),      mandatory: true  },
    { id: 'sucursal',  label: t('metas.col.sucursal'), mandatory: false },
    { id: 'vendedor',  label: t('metas.col.vendedor'), mandatory: false },
    { id: 'categoria', label: t('metas.col.categoria'),mandatory: false },
    { id: 'uom',       label: t('metas.col.uom'),      mandatory: false },
    { id: 'monto',     label: t('metas.col.monto'),    mandatory: true  },
  ];
  const [colOrder,   setColOrder]   = useState(ALL_COLS.map(c => c.id));
  const [colVisible, setColVisible] = useState(() =>
    Object.fromEntries(ALL_COLS.map(c => [c.id, true]))
  );
  const visibleCols = colOrder.filter(id => colVisible[id]);

  const moveCol = (id, dir) => setColOrder(prev => {
    const arr = [...prev]; const i = arr.indexOf(id);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return arr;
  });

  const updateRow = (id, field, value) => setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));
  const deleteRow = (id) => setRows(rs => rs.filter(r => r.id !== id));
  const addRow = () => {
    if (!newRow.monto) return;
    setRows(rs => [...rs, { ...newRow, id: ++nextId, monto: Number(newRow.monto) }]);
    setNewRow(r => ({ ...r, monto: '' }));
  };

  const SORT_FIELDS = [
    { id: 'mes',       label: 'Mes' },
    { id: 'sucursal',  label: 'Sucursal' },
    { id: 'vendedor',  label: 'Vendedor' },
    { id: 'categoria', label: 'Categoría' },
    { id: 'monto',     label: 'Monto' },
  ];
  const MES_ORDER = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const visible = rows
    .filter(r =>
      (filterMes  === 'Todos' || r.mes      === filterMes) &&
      (filterSuc  === 'Todos' || r.sucursal === filterSuc) &&
      (filterVend === 'Todos' || r.vendedor === filterVend)
    )
    .sort((a, b) => {
      let va = sortField === 'mes' ? MES_ORDER.indexOf(a.mes) : (a[sortField] ?? '');
      let vb = sortField === 'mes' ? MES_ORDER.indexOf(b.mes) : (b[sortField] ?? '');
      if (sortField === 'monto') { va = Number(va); vb = Number(vb); }
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  // KPI/Dashboard tab state
  const [kpis, setKpis] = useState(buildKpiState);

  const updateKpi = useCallback((id, monthIdx, value, uniform) => {
    setKpis(ks => ks.map(k => {
      if (k.id !== id) return k;
      if (uniform) {
        // propagate to all months
        return { ...k, values: Array(12).fill(Number(value) || 0) };
      }
      const vals = [...k.values];
      vals[monthIdx] = Number(value) || 0;
      return { ...k, values: vals };
    }));
  }, []);

  const toggleActive = useCallback((id) => {
    setKpis(ks => ks.map(k => k.id === id ? { ...k, active: !k.active } : k));
  }, []);

  const toggleUniform = useCallback((id) => {
    setKpis(ks => ks.map(k => {
      if (k.id !== id) return k;
      const nowUniform = !k.uniform;
      if (nowUniform) {
        // lock: fill all from first value
        return { ...k, uniform: true, values: Array(12).fill(k.values[0]) };
      }
      return { ...k, uniform: false };
    }));
  }, []);

  // Saved state
  const [saved, setSaved] = useState(false);
  const handleSave = () => setSaved(true);

  const NAV_ITEMS = [
    { id: 'ventas',       label: t('metas.nav.ventas'),          sub: `${rows.length} ${t('lbl.registros')}`,                                        icon: '💰' },
    { id: 'dashboard',    label: t('metas.nav.kpisComerciales'), sub: `${kpis.filter(k=>k.active).length}/${kpis.length} activos`,                   icon: '📊' },
    { id: 'financieros',  label: t('metas.nav.kpisFinancieros'), sub: t('panel.comingSoon'),                                                          icon: '💹', soon: true },
    { id: 'logisticos',   label: t('metas.nav.kpisLogisticos'),  sub: t('panel.comingSoon'),                                                          icon: '🚚', soon: true },
    { id: 'operativos',   label: t('metas.nav.kpisOperativos'),  sub: t('panel.comingSoon'),                                                          icon: '⚙️', soon: true },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Page Header ── */}
      <PageHeader title={t('page.metas')} subtitle={`${t('metas.periodo')} · ${new Date().getFullYear()}`} live={false}>
        <Button
          variant="contained" startIcon={<SaveIcon sx={{ fontSize: 14 }} />}
          onClick={handleSave}
          sx={{
            fontSize: 11, fontWeight: 500, px: '16px', py: '7px',
            background: saved ? DL.green : DL.blue, borderRadius: '8px', textTransform: 'none',
            boxShadow: 'none', '&:hover': { background: saved ? '#15803d' : DL.navy, boxShadow: 'none' },
            transition: 'background .2s',
          }}
        >
          {saved ? t('metas.guardado') : t('metas.guardar')}
        </Button>
      </PageHeader>

      {/* ── Body: left nav + right content ── */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, px: '20px', pt: '16px', pb: '20px', alignItems: 'stretch', gap: '16px' }}>

        {/* ── Left Nav Panel ── */}
        <Box sx={{ width: 200, flexShrink: 0, background: '#fff', borderRadius: '8px', boxShadow: DL.e1, overflow: 'hidden', alignSelf: 'flex-start' }}>
          <Box sx={{ py: '8px' }}>
            {NAV_ITEMS.map(item => (
              <Box
                key={item.id}
                onClick={() => !item.soon && setTab(item.id)}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  px: '16px', py: '11px', cursor: item.soon ? 'default' : 'pointer',
                  borderLeft: `3px solid ${tab === item.id ? DL.blue : 'transparent'}`,
                  background: tab === item.id ? '#f6f6f6' : 'transparent',
                  transition: 'all .14s',
                  '&:hover': !item.soon ? { background: tab === item.id ? '#f6f6f6' : '#f8fafc' } : {},
                }}
              >
                <Typography sx={{
                  fontSize: 13, fontWeight: tab === item.id ? 500 : 500,
                  color: item.soon ? '#8d8d8d' : tab === item.id ? DL.blue : DL.tH,
                }}>
                  {item.label}
                </Typography>
                {item.soon && (
                  <Box sx={{
                    fontSize: 8, fontWeight: 500, px: '5px', py: '1px', borderRadius: '3px',
                    background: '#f6f6f6', color: '#8d8d8d',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {t('metas.nav.pronto')}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Right Content ── */}
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ══ TAB: Ventas ══════════════════════════════════════════════════════════ */}
      {tab === 'ventas' && (
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'stretch', flex: 1, minHeight: 0 }}>

          {/* Left: editable table */}
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, background: '#fff', borderRadius: '8px', boxShadow: DL.e1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header: title + columns button (left) | registros + filters (right) */}
            <Box sx={{ background: '#fff', borderBottom: `1px solid ${DL.border}`, px: '14px', py: '10px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Left side: title + Columnas button */}
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, flexShrink: 0 }}>{t('lbl.tablaMetas')}</Typography>
              {/* Columns button */}
              <Box onClick={(e) => setColsAnchor(e.currentTarget)} sx={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  px: '9px', py: '5px', borderRadius: '7px', cursor: 'pointer',
                  border: `1px solid ${DL.border2}`, background: '#fff',
                  color: DL.tM, fontSize: 10, fontWeight: 500,
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  '&:hover': { borderColor: DL.blue, color: DL.navy },
                  transition: 'all .14s',
                }}>
                  <ColsIcon sx={{ fontSize: 14 }} />
                  {t('btn.columns')}
                </Box>
              {/* Columns popover */}
              <Popover
                open={Boolean(colsAnchor)} anchorEl={colsAnchor}
                onClose={() => setColsAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { borderRadius: '10px', mt: '6px', minWidth: 220, boxShadow: '0 8px 32px rgba(26,26,26,.12)', overflow: 'hidden' } }}
              >
                <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {t('lbl.colVisibles')}
                  </Typography>
                </Box>
                <Box sx={{ py: '6px' }}>
                  {colOrder.map((id, i) => {
                    const col = ALL_COLS.find(c => c.id === id);
                    if (!col) return null;
                    return (
                      <Box key={id} sx={{ display: 'flex', alignItems: 'center', px: '12px', py: '6px', gap: '8px', '&:hover': { background: '#f8fafc' } }}>
                        <Box
                          component="input" type="checkbox"
                          checked={colVisible[id]}
                          disabled={col.mandatory}
                          onChange={() => !col.mandatory && setColVisible(v => ({ ...v, [id]: !v[id] }))}
                          sx={{ cursor: col.mandatory ? 'default' : 'pointer', accentColor: DL.blue, width: 14, height: 14 }}
                        />
                        <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 500, color: colVisible[id] ? DL.tH : DL.tS }}>
                          {col.label}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: '2px' }}>
                          <Box component="button" onClick={() => moveCol(id, -1)} disabled={i === 0}
                            sx={{ width: 20, height: 20, borderRadius: '4px', border: `1px solid ${DL.border2}`, background: '#fff', cursor: i === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i === 0 ? '#d4d4d4' : DL.tM, fontFamily: 'inherit', '&:hover:not(:disabled)': { borderColor: DL.blue, color: DL.blue } }}>↑</Box>
                          <Box component="button" onClick={() => moveCol(id, 1)} disabled={i === colOrder.length - 1}
                            sx={{ width: 20, height: 20, borderRadius: '4px', border: `1px solid ${DL.border2}`, background: '#fff', cursor: i === colOrder.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i === colOrder.length - 1 ? '#d4d4d4' : DL.tM, fontFamily: 'inherit', '&:hover:not(:disabled)': { borderColor: DL.blue, color: DL.blue } }}>↓</Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Popover>

              {/* Right side: registros count + filters */}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Typography sx={{ fontSize: 10, color: DL.tS, whiteSpace: 'nowrap' }}>{rows.length} {t('lbl.registros')}</Typography>
                <MiniSelect label={t('time.mes')} value={filterMes} onChange={setFilterMes} minWidth={90}
                  options={[{ value:'Todos', label: t('filter.todos') }, ...MESES.map(m => ({ value: m, label: m }))]} />
                <MiniSelect label={t('des.tab.sucursal')} value={filterSuc} onChange={setFilterSuc} minWidth={130}
                  options={[{ value:'Todos', label: t('filter.todos') }, ...SUCURSALES_M.map(s => ({ value: s, label: s }))]} />
                <MiniSelect label={t('des.tab.vendedor')} value={filterVend} onChange={setFilterVend} minWidth={130}
                  options={[{ value:'Todos', label: t('filter.todos') }, ...VENDEDORES_M.map(v => ({ value: v, label: v }))]} />
              </Box>
            </Box>

            {/* Table */}
            <Box sx={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'auto', '&::-webkit-scrollbar': { width: 4, height: 4 }, '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 } }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: '#f8fafc' }}>
                    {visibleCols.map(id => {
                      const LABELS = {
                        mes: t('metas.col.mes'), sucursal: t('metas.col.sucursal'),
                        vendedor: t('metas.col.vendedor'), categoria: t('metas.col.categoria'),
                        uom: t('metas.col.uom'), monto: t('metas.col.monto'),
                      };
                      return (
                        <th key={id} style={{ padding: '7px 10px', textAlign: id === 'monto' ? 'right' : 'left', fontSize: 9, fontWeight: 500, color: DL.tS, letterSpacing: '.06em', borderBottom: '1px solid #e3e3e3', whiteSpace: 'nowrap' }}>
                          {LABELS[id] || id.toUpperCase()}
                        </th>
                      );
                    })}
                    <th style={{ padding: '7px 10px', borderBottom: '1px solid #e3e3e3', width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      {visibleCols.map(id => {
                        if (id === 'mes')       return <td key={id} style={{ padding: '4px 10px' }}><InlineSelect value={r.mes}       onChange={(v) => updateRow(r.id, 'mes', v)}       options={MESES}       width={90}  /></td>;
                        if (id === 'sucursal')  return <td key={id} style={{ padding: '4px 10px' }}><InlineSelect value={r.sucursal}  onChange={(v) => updateRow(r.id, 'sucursal', v)}  options={SUCURSALES_M} width={160} allowEmpty /></td>;
                        if (id === 'vendedor')  return <td key={id} style={{ padding: '4px 10px' }}><InlineSelect value={r.vendedor}  onChange={(v) => updateRow(r.id, 'vendedor', v)}  options={VENDEDORES_M} width={140} allowEmpty /></td>;
                        if (id === 'categoria') return <td key={id} style={{ padding: '4px 10px' }}><InlineSelect value={r.categoria} onChange={(v) => updateRow(r.id, 'categoria', v)} options={CATEGORIAS_M} width={130} allowEmpty /></td>;
                        if (id === 'uom')       return <td key={id} style={{ padding: '4px 10px' }}><InlineSelect value={r.uom}       onChange={(v) => updateRow(r.id, 'uom', v)}       options={UOMS}        width={70}  /></td>;
                        if (id === 'monto')     return <td key={id} style={{ padding: '4px 10px', textAlign: 'right' }}><MontoInput value={r.monto} onChange={(v) => updateRow(r.id, 'monto', v)} /></td>;
                        return null;
                      })}
                      <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                        <IconButton size="small" onClick={() => deleteRow(r.id)} sx={{ color: '#d4d4d4', '&:hover': { color: DL.red } }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}

                  {/* Add row */}
                  <tr style={{ borderTop: '2px solid #e3e3e3', background: '#f6f6f6' }}>
                    {visibleCols.map(id => {
                      if (id === 'mes')       return <td key={id} style={{ padding: '6px 10px' }}><InlineSelect value={newRow.mes}       onChange={(v) => setNewRow(r => ({ ...r, mes: v }))}       options={MESES}       width={90}  /></td>;
                      if (id === 'sucursal')  return <td key={id} style={{ padding: '6px 10px' }}><InlineSelect value={newRow.sucursal}  onChange={(v) => setNewRow(r => ({ ...r, sucursal: v }))}  options={SUCURSALES_M} width={160} allowEmpty /></td>;
                      if (id === 'vendedor')  return <td key={id} style={{ padding: '6px 10px' }}><InlineSelect value={newRow.vendedor}  onChange={(v) => setNewRow(r => ({ ...r, vendedor: v }))}  options={VENDEDORES_M} width={140} allowEmpty /></td>;
                      if (id === 'categoria') return <td key={id} style={{ padding: '6px 10px' }}><InlineSelect value={newRow.categoria} onChange={(v) => setNewRow(r => ({ ...r, categoria: v }))} options={CATEGORIAS_M} width={130} allowEmpty /></td>;
                      if (id === 'uom')       return <td key={id} style={{ padding: '6px 10px' }}><InlineSelect value={newRow.uom}       onChange={(v) => setNewRow(r => ({ ...r, uom: v }))}       options={UOMS}        width={70}  /></td>;
                      if (id === 'monto')     return <td key={id} style={{ padding: '6px 10px', textAlign: 'right' }}><MontoInput value={newRow.monto} onChange={(v) => setNewRow(r => ({ ...r, monto: v }))} /></td>;
                      return null;
                    })}
                    <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                      <Tooltip title={t('metas.tooltip.agregarFila')}>
                        <IconButton size="small" onClick={addRow} sx={{ color: DL.blue, '&:hover': { background: '#e8e8e8' } }}>
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* Footer */}
            <Box sx={{ px: '14px', py: '10px', borderTop: '1px solid #f6f6f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 10, color: DL.tS }}>{t('metas.footer.mostrando').replace('{n1}', visible.length).replace('{n2}', rows.length)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Typography sx={{ fontSize: 10, color: DL.tM, fontWeight: 500 }}>{t('lbl.totalFiltrado')}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue }}>
                  {fmt$(visible.reduce((s, r) => s + (Number(r.monto) || 0), 0))}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right: Summary tree — filtered by same visible rows */}
          <SummaryTree rows={visible} />
        </Box>
      )}

      {/* ══ TAB: Dashboard Indicators ══════════════════════════════════════════ */}
      {tab === 'dashboard' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Spreadsheet */}
          <KpiSpreadsheet
            kpis={kpis}
            onUpdate={updateKpi}
            onToggleActive={toggleActive}
            onToggleUniform={toggleUniform}
          />

        </Box>
      )}

        </Box>{/* end right content */}
      </Box>{/* end body row */}
    </Box>
  );
}
