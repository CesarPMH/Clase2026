// ─── Vista Completa de Metas ──────────────────────────────────────────────────
// Tabla jerárquica indentada: filas = dimensiones, columnas = 12 meses
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Popover, Checkbox, Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ViewList as RowsIcon,
  Percent as PctIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
} from '@mui/icons-material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { DL } from '../theme';
import { MESES, METAS_INIT, SUCURSALES_M, VENDEDORES_M } from '../data/metas';

const MES_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const fmt$      = (n) => n > 0 ? '$' + Number(n).toLocaleString('en-US') : '—';
const fmtPct    = (n) => (n > 0 ? (n * 100).toFixed(1) + '%' : '');

const ALL_DIMS = [
  { id: 'sucursal',  label: 'Sucursal' },
  { id: 'vendedor',  label: 'Vendedor' },
  { id: 'categoria', label: 'Categoría' },
];

// ─── Build flat display rows from data ────────────────────────────────────────
function buildDisplayRows(data, dims, collapsed, dimPath = [], level = 0) {
  if (!dims.length) return [];
  const dim = dims[0];
  const groups = new Map();
  data.forEach(r => {
    const key = r[dim] || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  const sorted = [...groups.entries()].sort((a, b) =>
    (a[0] || 'zzz').localeCompare(b[0] || 'zzz')
  );

  const result = [];
  for (const [key, rows] of sorted) {
    const vals = Array(12).fill(0);
    rows.forEach(r => {
      const mi = MESES.indexOf(r.mes);
      if (mi >= 0) vals[mi] += Number(r.monto) || 0;
    });
    const nodeKey = [...dimPath, key || '__empty__'].join('|');
    const isLeaf  = dims.length === 1;
    result.push({ level, key, vals, nodeKey, isLeaf });
    if (!isLeaf && !collapsed[nodeKey]) {
      result.push(...buildDisplayRows(rows, dims.slice(1), collapsed, [...dimPath, key || '__empty__'], level + 1));
    }
  }
  return result;
}

// ─── Level visual config ──────────────────────────────────────────────────────
const LEVEL_CFG = [
  { bg: '#f8fafc', fontWeight: 500, fontSize: 12, color: '#2a2a2a', dot: { size: 8,  color: '#547e69' }, indent: 16 },
  { bg: '#ffffff', fontWeight: 500, fontSize: 11, color: '#4d3f32', dot: { size: 5,  color: '#8d8d8d' }, indent: 36 },
  { bg: '#ffffff', fontWeight: 400, fontSize: 10, color: '#6a6a6a', dot: { size: 4,  color: '#d4d4d4' }, indent: 58 },
];

// ─── Rows Popover ─────────────────────────────────────────────────────────────
function RowsPopover({ dims, onToggle, onMove, anchor, onClose }) {
  return (
    <Popover
      open={Boolean(anchor)} anchorEl={anchor} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { borderRadius: '10px', mt: '6px', p: '14px', minWidth: 224, boxShadow: '0 8px 32px rgba(26,26,26,.12)' } }}
    >
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, mb: '10px', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Orden de filas
      </Typography>
      {ALL_DIMS.map((dim) => {
        const active = dims.includes(dim.id);
        const idx    = dims.indexOf(dim.id);
        return (
          <Box key={dim.id} sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '4px' }}>
            <Checkbox
              checked={active} size="small"
              onChange={() => onToggle(dim.id)}
              sx={{ p: '3px', color: DL.blue, '&.Mui-checked': { color: DL.blue } }}
            />
            <Typography sx={{ fontSize: 12, fontWeight: active ? 500 : 400, color: active ? DL.tH : DL.tS, flex: 1 }}>
              {dim.label}
            </Typography>
            {active && (
              <Box sx={{ display: 'flex', gap: '1px' }}>
                <IconButton size="small" disabled={idx === 0} onClick={() => onMove(dim.id, -1)}
                  sx={{ p: '3px', color: DL.blue, '&.Mui-disabled': { color: '#d4d4d4' } }}>
                  <UpIcon sx={{ fontSize: 12 }} />
                </IconButton>
                <IconButton size="small" disabled={idx === dims.length - 1} onClick={() => onMove(dim.id, 1)}
                  sx={{ p: '3px', color: DL.blue, '&.Mui-disabled': { color: '#d4d4d4' } }}>
                  <DownIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        );
      })}
      <Typography sx={{ fontSize: 9, color: DL.tS, mt: '8px', fontStyle: 'italic' }}>
        Mínimo 1 dimensión activa
      </Typography>
    </Popover>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MetasTodo() {
  const navigate = useNavigate();
  const [dims,      setDims]      = useState(['sucursal', 'vendedor', 'categoria']);
  const [collapsed, setCollapsed] = useState({});
  const [anchor,    setAnchor]    = useState(null);
  const [showPct,   setShowPct]   = useState(false);

  // Filters
  const [filterAno,  setFilterAno]  = useState('Todos');
  const [filterSuc,  setFilterSuc]  = useState('Todos');
  const [filterVend, setFilterVend] = useState('Todos');

  // Derive available years from data (future-proof)
  const anos = useMemo(() => {
    const set = new Set(METAS_INIT.map(r => r.ano || '2025'));
    return [...set].sort();
  }, []);

  // Apply filters
  const filtered = useMemo(() => METAS_INIT.filter(r =>
    (filterAno  === 'Todos' || (r.ano || '2025') === filterAno) &&
    (filterSuc  === 'Todos' || r.sucursal === filterSuc) &&
    (filterVend === 'Todos' || r.vendedor === filterVend)
  ), [filterAno, filterSuc, filterVend]);

  const displayRows = useMemo(
    () => buildDisplayRows(filtered, dims, collapsed),
    [filtered, dims, collapsed]
  );

  const totals = useMemo(() => {
    const t = Array(12).fill(0);
    filtered.forEach(r => {
      const mi = MESES.indexOf(r.mes);
      if (mi >= 0) t[mi] += Number(r.monto) || 0;
    });
    return t;
  }, [filtered]);
  const grandTotal = totals.reduce((s, v) => s + v, 0);

  const toggleCollapse = (key) => setCollapsed(c => ({ ...c, [key]: !c[key] }));

  const toggleDim = (id) =>
    setDims(d => d.includes(id) ? (d.length > 1 ? d.filter(x => x !== id) : d) : [...d, id]);

  const moveDim = (id, dir) =>
    setDims(d => {
      const idx  = d.indexOf(id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= d.length) return d;
      const arr = [...d];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Header ── */}
      <PageHeader
        title="Vista Completa de Metas"
        subtitle={`${filtered.length} registros · desglose por mes`}
        live={false}
        onBack={() => navigate('/metas')}
      >
        <MiniSelect label="Año" value={filterAno} onChange={setFilterAno} minWidth={80}
          options={[{ value: 'Todos', label: 'Todos' }, ...anos.map(a => ({ value: a, label: a }))]} />
        <MiniSelect label="Sucursal" value={filterSuc} onChange={setFilterSuc} minWidth={130}
          options={[{ value: 'Todos', label: 'Todos' }, ...SUCURSALES_M.map(s => ({ value: s, label: s }))]} />
        <MiniSelect label="Vendedor" value={filterVend} onChange={setFilterVend} minWidth={130}
          options={[{ value: 'Todos', label: 'Todos' }, ...VENDEDORES_M.map(v => ({ value: v, label: v }))]} />

        {/* Proportions toggle */}
        <Tooltip title={showPct ? 'Ocultar proporciones' : 'Mostrar proporciones (% del total)'}>
          <Box
            onClick={() => setShowPct(p => !p)}
            sx={{
              display: 'flex', alignItems: 'center', gap: '4px',
              px: '10px', py: '6px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${showPct ? DL.blue : DL.border2}`,
              background: showPct ? '#f6f6f6' : '#fff',
              color: showPct ? DL.blue : DL.tM,
              fontSize: 11, fontWeight: 500,
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              transition: 'all .14s',
              '&:hover': { borderColor: DL.blue, color: DL.blue, background: '#f6f6f6' },
            }}
          >
            <PctIcon sx={{ fontSize: 14 }} />
            Proporciones
          </Box>
        </Tooltip>

        {/* Filas button */}
        <Button
          size="small"
          startIcon={<RowsIcon sx={{ fontSize: 14 }} />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            fontSize: 11, fontWeight: 500, color: DL.tM, textTransform: 'none',
            border: `1px solid ${DL.border}`, borderRadius: '8px', px: '12px', py: '6px',
            '&:hover': { borderColor: DL.blue, color: DL.blue, background: '#f6f6f6' },
          }}
        >
          Filas
        </Button>
        <RowsPopover dims={dims} onToggle={toggleDim} onMove={moveDim} anchor={anchor} onClose={() => setAnchor(null)} />
      </PageHeader>

      {/* ── Table ── */}
      <Box sx={{ flex: 1, minHeight: 0, px: '20px', py: '16px' }}>
        <Box sx={{ background: '#fff', borderRadius: '10px', boxShadow: DL.e1, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            flex: 1, minHeight: 0,
            overflowX: 'auto', overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 5, height: 5 },
            '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 3 },
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{
                    padding: '11px 16px', textAlign: 'left', fontSize: 9, fontWeight: 500,
                    color: DL.tS, letterSpacing: '.08em',
                    position: 'sticky', left: 0, zIndex: 3, minWidth: 260,
                    background: '#f8fafc', borderBottom: `2px solid #e3e3e3`, whiteSpace: 'nowrap',
                  }}>
                    DIMENSIÓN
                  </th>
                  {MES_SHORT.map(m => (
                    <th key={m} style={{
                      padding: '11px 8px', textAlign: 'right', fontSize: 10, fontWeight: 500,
                      color: DL.tM, letterSpacing: '.04em', minWidth: showPct ? 110 : 88,
                      borderBottom: '2px solid #e3e3e3', whiteSpace: 'nowrap',
                    }}>
                      {m}
                    </th>
                  ))}
                  <th style={{
                    padding: '11px 16px', textAlign: 'right', fontSize: 9, fontWeight: 500,
                    color: DL.blue, letterSpacing: '.08em', minWidth: showPct ? 130 : 104,
                    borderBottom: '2px solid #e3e3e3',
                    borderLeft: `2px solid #e3e3e3`,
                    background: '#f6f6f6', whiteSpace: 'nowrap',
                  }}>
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayRows.map((row) => {
                  const cfg      = LEVEL_CFG[Math.min(row.level, LEVEL_CFG.length - 1)];
                  const rowTotal = row.vals.reduce((s, v) => s + v, 0);
                  const canCollapse = !row.isLeaf;
                  const isOpen  = canCollapse && !collapsed[row.nodeKey];

                  return (
                    <tr
                      key={row.nodeKey}
                      onClick={() => canCollapse && toggleCollapse(row.nodeKey)}
                      style={{
                        background: cfg.bg,
                        borderBottom: '1px solid #f6f6f6',
                        cursor: canCollapse ? 'pointer' : 'default',
                        transition: 'background .1s',
                      }}
                    >
                      {/* Label cell — sticky */}
                      <td style={{
                        padding: `7px 14px 7px ${cfg.indent}px`,
                        position: 'sticky', left: 0, background: cfg.bg, zIndex: 1,
                        borderRight: '1px solid #f6f6f6',
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {canCollapse ? (
                            isOpen
                              ? <ExpandLessIcon sx={{ fontSize: 13, color: DL.blue, flexShrink: 0 }} />
                              : <ExpandMoreIcon sx={{ fontSize: 13, color: DL.tS,  flexShrink: 0 }} />
                          ) : (
                            <Box sx={{
                              width: cfg.dot.size, height: cfg.dot.size,
                              borderRadius: '50%', background: cfg.dot.color,
                              flexShrink: 0, ml: '1px',
                            }} />
                          )}
                          <Typography sx={{
                            fontSize: cfg.fontSize, fontWeight: cfg.fontWeight,
                            color: row.key ? cfg.color : '#8d8d8d',
                            fontStyle: row.key ? 'normal' : 'italic',
                            whiteSpace: 'nowrap', lineHeight: 1.3,
                          }}>
                            {row.key || '— Al granel'}
                          </Typography>
                        </Box>
                      </td>

                      {/* Month cells */}
                      {row.vals.map((v, mi) => (
                        <td key={mi} style={{
                          padding: '7px 8px', textAlign: 'right',
                          fontSize: cfg.fontSize,
                          fontWeight: row.level === 0 ? 500 : row.level === 1 ? 500 : 400,
                          color: v > 0 ? (row.level === 0 ? DL.navy : DL.tH) : '#d4d4d4',
                        }}>
                          {v > 0 ? (
                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                              {fmt$(v)}
                              {showPct && grandTotal > 0 && (
                                <Box component="span" sx={{ fontSize: 9, fontWeight: 500, color: '#8d8d8d' }}>
                                  {fmtPct(v / grandTotal)}
                                </Box>
                              )}
                            </Box>
                          ) : '—'}
                        </td>
                      ))}

                      {/* Total cell */}
                      <td style={{
                        padding: '7px 16px', textAlign: 'right',
                        fontWeight: 500,
                        fontSize: row.level === 0 ? 13 : 11,
                        color: row.level === 0 ? DL.blue : DL.tM,
                        borderLeft: '2px solid #f6f6f6',
                        background: row.level === 0 ? '#f6f6f6' : '#f6f6f6',
                      }}>
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                          {fmt$(rowTotal)}
                          {showPct && grandTotal > 0 && rowTotal > 0 && (
                            <Box component="span" sx={{ fontSize: 9, fontWeight: 500, color: row.level === 0 ? '#547e69' : '#8d8d8d' }}>
                              {fmtPct(rowTotal / grandTotal)}
                            </Box>
                          )}
                        </Box>
                      </td>
                    </tr>
                  );
                })}

                {/* ── Grand total ── */}
                <tr style={{ background: '#f6f6f6' }}>
                  <td style={{
                    padding: '12px 16px', fontSize: 11, fontWeight: 500, color: DL.tH,
                    position: 'sticky', left: 0, background: '#f6f6f6', zIndex: 1,
                    letterSpacing: '.04em', borderTop: `2px solid #e3e3e3`,
                  }}>
                    TOTAL GENERAL
                  </td>
                  {totals.map((v, i) => (
                    <td key={i} style={{
                      padding: '12px 8px', textAlign: 'right',
                      fontSize: 11, fontWeight: 500,
                      color: v > 0 ? DL.navy : '#d4d4d4',
                      borderTop: '2px solid #e3e3e3',
                    }}>
                      {v > 0 ? (
                        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
                          {fmt$(v)}
                          {showPct && grandTotal > 0 && (
                            <Box component="span" sx={{ fontSize: 9, fontWeight: 500, color: '#8d8d8d' }}>
                              {fmtPct(v / grandTotal)}
                            </Box>
                          )}
                        </Box>
                      ) : '—'}
                    </td>
                  ))}
                  <td style={{
                    padding: '12px 16px', textAlign: 'right',
                    fontSize: 14, fontWeight: 500, color: DL.blue,
                    borderLeft: `2px solid #e3e3e3`,
                    borderTop: '2px solid #e3e3e3',
                    background: '#f6f6f6',
                  }}>
                    {fmt$(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
