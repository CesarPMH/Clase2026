// ─── Aging de Saldos ─────────────────────────────────────────────────────────
// Redesigned: KPI cards + Chart + Top Clientes + Aging Matrix + Invoice Modal
import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import KpiCard from '../components/common/KpiCard';
import { DL } from '../theme';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

const fmtCLP = v => {
  if (v === undefined || v === null) return '—';
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${(v / 1e9).toFixed(2).replace('.', ',')}B`;
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1).replace('.', ',')}M`;
  if (abs >= 1e3) return `$${Math.round(v / 1e3).toLocaleString('es-CL')}K`;
  return `$${v.toLocaleString('es-CL')}`;
};

const Card = ({ children, sx = {} }) => (
  <Box sx={{
    background: '#fff', borderRadius: '10px',
    border: `1px solid ${DL.border}`, boxShadow: DL.e1,
    overflow: 'clip',
    ...sx,
  }}>
    {children}
  </Box>
);

const thSx = {
  fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em',
  color: DL.tS, py: '8px', px: '10px',
  background: '#f7f8fd',
  borderBottom: '2px solid rgba(26,26,26,.08)',
  whiteSpace: 'nowrap',
  zIndex: 2,
};
const tdSx = {
  fontSize: 11, color: DL.tH, py: '9px', px: '10px',
  borderBottom: '1px solid rgba(26,26,26,.05)',
};

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
const CLIENTES = [
  { id: 1,  nombre: 'Grupo Óptima Innovadora Spa'       },
  { id: 2,  nombre: 'Asociados Especializada Confiable' },
  { id: 3,  nombre: 'Internacional Líder Avanzada Spa'  },
  { id: 4,  nombre: 'Distribuidora Líder Óptima S.R.L.' },
  { id: 5,  nombre: 'Importadora Máxima & Tecnológica'  },
  { id: 6,  nombre: 'Grupo Express'                     },
  { id: 7,  nombre: 'Grupo Óptima Premium Profesional'  },
  { id: 8,  nombre: 'Tech Mercantil Excelente'          },
  { id: 9,  nombre: 'Ferretería Central S.A.'           },
  { id: 10, nombre: 'Agro Soluciones del Norte'         },
  { id: 11, nombre: 'Distribuidora El Pino'             },
  { id: 12, nombre: 'Veterinaria San Marcos'            },
];

// ─── AGING MATRIX DATA ───────────────────────────────────────────────────────
// bucket keys: v30, v60, v90, v120, v120p, nv30, nv60, nv90, nv120, nv120p
const AGING_MATRIX = {
  1:  { v120p: { monto: 3287931243, facturas: 18 }, nv30: { monto: 51901350, facturas: 4 } },
  2:  { v30: { monto: 54522936, facturas: 3 }, nv30: { monto: 320000000, facturas: 8 }, nv60: { monto: 207675553, facturas: 5 } },
  3:  { v60: { monto: 100668057, facturas: 4 }, nv30: { monto: 154702786, facturas: 6 } },
  4:  { v30: { monto: 13530433, facturas: 2 }, nv60: { monto: 53352894, facturas: 4 } },
  5:  { v60: { monto: 25000000, facturas: 3 }, v90: { monto: 16061020, facturas: 2 }, nv30: { monto: 78042197, facturas: 5 } },
  6:  { nv30: { monto: 31408963, facturas: 3 }, nv60: { monto: 15200000, facturas: 2 } },
  7:  { v90: { monto: 24619469, facturas: 5 }, nv120: { monto: 1269166, facturas: 1 } },
  8:  { v30: { monto: 2668690, facturas: 1 }, nv30: { monto: 15000000, facturas: 3 }, nv60: { monto: 8979632, facturas: 2 } },
  9:  { v60: { monto: 8200000, facturas: 3 }, nv30: { monto: 10300000, facturas: 4 } },
  10: { v120p: { monto: 38000000, facturas: 6 }, nv30: { monto: 4000000, facturas: 1 } },
  11: { nv30: { monto: 9800000, facturas: 3 } },
  12: { v60: { monto: 6800000, facturas: 2 }, nv30: { monto: 8400000, facturas: 4 } },
};

// Bucket metadata
const VENC_BUCKETS = [
  { key: 'v30',   label: '1–30'   },
  { key: 'v60',   label: '31–60'  },
  { key: 'v90',   label: '61–90'  },
  { key: 'v120',  label: '91–120' },
  { key: 'v120p', label: '+120'   },
];
const NO_VENC_BUCKETS = [
  { key: 'nv30',   label: '1–30'   },
  { key: 'nv60',   label: '31–60'  },
  { key: 'nv90',   label: '61–90'  },
  { key: 'nv120',  label: '91–120' },
  { key: 'nv120p', label: '+120'   },
];
const ALL_BUCKETS = [...VENC_BUCKETS, ...NO_VENC_BUCKETS];

// ─── INVOICE HELPERS ──────────────────────────────────────────────────────────
function generateInvoices(bucketKey, totalMonto, totalFacturas) {
  const isVencida = bucketKey.startsWith('v');
  const n = Math.min(Math.max(totalFacturas, 1), 6);
  const estados = isVencida
    ? ['Vencida', 'Vencida', 'En Disputa', 'Sin Respuesta', 'Vencida']
    : ['Pendiente', 'Por Vencer', 'Pendiente', 'Por Vencer', 'Pendiente'];

  const baseDate = new Date('2026-01-15');
  const invoices = [];
  let remaining = totalMonto;
  for (let i = 0; i < n; i++) {
    const monto = i === n - 1 ? remaining : Math.round((totalMonto / n) * (0.8 + Math.random() * 0.4));
    remaining -= monto;
    const emision = new Date(baseDate);
    emision.setDate(emision.getDate() - (n - i) * 12 + Math.floor(Math.random() * 5));
    const venc = new Date(emision);
    venc.setDate(venc.getDate() + (isVencida ? -30 : 30));
    invoices.push({
      folio: `F-${10500 + i * 17 + Math.floor(Math.random() * 10)}`,
      fechaEmision: emision.toISOString().slice(0, 10),
      vencimiento: venc.toISOString().slice(0, 10),
      monto: Math.abs(monto),
      estado: estados[i % estados.length],
    });
  }
  return invoices;
}

const estadoColor = e => {
  if (e === 'Vencida' || e === 'En Disputa' || e === 'Sin Respuesta') return { bg: DL.redBg, c: DL.red };
  if (e === 'Por Vencer') return { bg: DL.yellowBg, c: DL.yellow };
  return { bg: 'rgba(84,126,105,.10)', c: DL.blue };
};

// ─── INVOICE MODAL ────────────────────────────────────────────────────────────
function InvoiceModal({ cell, onClose }) {
  const { clienteNombre, bucketKey, bucketLabel, isVencida, data } = cell;
  const invoices = useMemo(() => generateInvoices(bucketKey, data.monto, data.facturas), [bucketKey, data]);
  const groupLabel = isVencida ? 'Vencidas' : 'No Vencidas';

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', px: '16px',
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          background: '#fff', borderRadius: '14px', width: '100%', maxWidth: 640,
          boxShadow: DL.e3, position: 'relative',
          display: 'flex', flexDirection: 'column', maxHeight: '80vh',
        }}
      >
        {/* Header */}
        <Box sx={{ p: '20px 24px 14px', borderBottom: `1px solid ${DL.border}`, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, fontFamily: FONT, lineHeight: 1.2 }}>
                {clienteNombre}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: '5px' }}>
                <Box sx={{ display: 'inline-flex', px: '8px', py: '3px', borderRadius: '4px', background: isVencida ? DL.redBg : 'rgba(84,126,105,.10)' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: isVencida ? DL.red : DL.blue, fontFamily: FONT }}>
                    {groupLabel} · {bucketLabel}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: FONT }}>
                  {data.facturas} facturas · {fmtCLP(data.monto)}
                </Typography>
              </Box>
            </Box>
            <Box component="button" onClick={onClose}
              sx={{ fontFamily: FONT, fontSize: 18, color: DL.tS, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, p: '2px 6px', mt: '-2px', '&:hover': { color: DL.red } }}>×</Box>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Folio', 'Fecha Emisión', 'Vencimiento', 'Monto', 'Estado'].map(h => (
                    <TableCell key={h} sx={{ ...thSx, textAlign: h === 'Monto' ? 'right' : 'left' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv, i) => {
                  const ec = estadoColor(inv.estado);
                  return (
                    <TableRow key={i} sx={{ '&:hover td': { background: 'rgba(84,126,105,.04)' } }}>
                      <TableCell sx={{ ...tdSx, fontWeight: 500, color: DL.navy, fontFamily: FONT }}>{inv.folio}</TableCell>
                      <TableCell sx={{ ...tdSx, color: DL.tM, fontFamily: FONT }}>{inv.fechaEmision}</TableCell>
                      <TableCell sx={{ ...tdSx, color: isVencida ? DL.red : DL.tM, fontFamily: FONT, fontWeight: isVencida ? 500 : 400 }}>{inv.vencimiento}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign: 'right', fontWeight: 500, fontFamily: FONT, color: DL.tH }}>{fmtCLP(inv.monto)}</TableCell>
                      <TableCell sx={tdSx}>
                        <Box sx={{ display: 'inline-flex', px: '7px', py: '2px', borderRadius: '4px', background: ec.bg }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 500, color: ec.c, fontFamily: FONT }}>{inv.estado}</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Footer */}
        <Box sx={{ px: '20px', py: '12px', borderTop: `1px solid ${DL.border}`, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <Box component="button" onClick={onClose} sx={{
            fontFamily: FONT, fontSize: 11, fontWeight: 500,
            px: '16px', py: '7px', borderRadius: '8px',
            border: `1px solid ${DL.border2}`, background: '#fff', color: DL.tM,
            cursor: 'pointer', '&:hover': { borderColor: DL.blue, color: DL.navy },
          }}>Cerrar</Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── AGING MATRIX TABLE ───────────────────────────────────────────────────────
// Heat-map helpers: intensity based on amount relative to column max
function heatRed(val, max) {
  if (!val || !max) return 'transparent';
  const t = Math.min(val / max, 1);
  // from #fff5f5 (0%) to #fca5a5 (100%)
  const alpha = 0.06 + t * 0.26;
  return `rgba(239,68,68,${alpha.toFixed(2)})`;
}
function heatBlue(val, max) {
  if (!val || !max) return 'transparent';
  const t = Math.min(val / max, 1);
  const alpha = 0.04 + t * 0.18;
  return `rgba(84,126,105,${alpha.toFixed(2)})`;
}

function AgingMatrixTable({ onCellClick }) {
  const [sortCol, setSortCol] = useState('venc');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const totals = useMemo(() => {
    const row = {};
    ALL_BUCKETS.forEach(b => { row[b.key] = { monto: 0, facturas: 0 }; });
    CLIENTES.forEach(c => {
      const buckets = AGING_MATRIX[c.id] || {};
      ALL_BUCKETS.forEach(b => {
        if (buckets[b.key]) {
          row[b.key].monto    += buckets[b.key].monto;
          row[b.key].facturas += buckets[b.key].facturas;
        }
      });
    });
    return row;
  }, []);

  // Max per column for heat-map normalization
  const colMax = useMemo(() => {
    const m = {};
    ALL_BUCKETS.forEach(b => {
      m[b.key] = Math.max(...CLIENTES.map(c => (AGING_MATRIX[c.id] || {})[b.key]?.monto || 0));
    });
    return m;
  }, []);

  const clienteTotals = useMemo(() => {
    const ct = {};
    CLIENTES.forEach(c => {
      const buckets = AGING_MATRIX[c.id] || {};
      let totalVenc = 0, totalNoVenc = 0, vencFact = 0, noVencFact = 0;
      VENC_BUCKETS.forEach(b => { if (buckets[b.key]) { totalVenc += buckets[b.key].monto; vencFact += buckets[b.key].facturas; } });
      NO_VENC_BUCKETS.forEach(b => { if (buckets[b.key]) { totalNoVenc += buckets[b.key].monto; noVencFact += buckets[b.key].facturas; } });
      ct[c.id] = { venc: totalVenc, noVenc: totalNoVenc, total: totalVenc + totalNoVenc, vencFact, noVencFact };
    });
    return ct;
  }, []);

  const grandTotals = useMemo(() => {
    let tv = 0, tnv = 0, tvf = 0, tnvf = 0;
    VENC_BUCKETS.forEach(b => { tv += totals[b.key].monto; tvf += totals[b.key].facturas; });
    NO_VENC_BUCKETS.forEach(b => { tnv += totals[b.key].monto; tnvf += totals[b.key].facturas; });
    return { venc: tv, noVenc: tnv, total: tv + tnv, vencFact: tvf, noVencFact: tnvf };
  }, [totals]);

  // Max subtotals for subtotal heat-map
  const maxVenc   = useMemo(() => Math.max(...CLIENTES.map(c => clienteTotals[c.id]?.venc   || 0)), [clienteTotals]);
  const maxNoVenc = useMemo(() => Math.max(...CLIENTES.map(c => clienteTotals[c.id]?.noVenc || 0)), [clienteTotals]);

  // Sort helper
  const sortIcon = col => (
    <Box component="span" sx={{ ml: '3px', fontSize: 9, opacity: sortCol === col ? 1 : 0.3 }}>
      {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </Box>
  );

  // Reusable bucket cell
  const BucketCell = ({ clienteId, bucket, isVencida }) => {
    const data = (AGING_MATRIX[clienteId] || {})[bucket.key];
    const clienteNombre = CLIENTES.find(c => c.id === clienteId)?.nombre || '';
    const bg = data?.monto
      ? (isVencida ? heatRed(data.monto, colMax[bucket.key]) : heatBlue(data.monto, colMax[bucket.key]))
      : 'transparent';
    return (
      <TableCell
        onClick={() => data?.monto && onCellClick({ clienteNombre, bucketKey: bucket.key, bucketLabel: bucket.label, isVencida, data })}
        sx={{
          ...tdSx,
          background: bg,
          cursor: data?.monto ? 'pointer' : 'default',
          textAlign: 'right',
          transition: 'filter .12s',
          '&:hover': data?.monto ? { filter: 'brightness(0.93)' } : {},
          borderLeft: 'none',
          px: '12px',
        }}
      >
        {data?.monto ? (
          <>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: isVencida ? '#b91c1c' : DL.blue, fontFamily: FONT, lineHeight: 1.3 }}>
              {fmtCLP(data.monto)}
            </Typography>
            <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>
              {data.facturas} {data.facturas === 1 ? 'fact.' : 'fact.'}
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 11, color: 'rgba(26,26,26,.18)', fontFamily: FONT }}>—</Typography>
        )}
      </TableCell>
    );
  };

  // Subtotal cell (clickable)
  const SubtotalCell = ({ clienteId, isVencida }) => {
    const ct = clienteTotals[clienteId] || { venc: 0, noVenc: 0, vencFact: 0, noVencFact: 0 };
    const val   = isVencida ? ct.venc   : ct.noVenc;
    const fact  = isVencida ? ct.vencFact : ct.noVencFact;
    const max   = isVencida ? maxVenc : maxNoVenc;
    const bg    = val ? (isVencida ? heatRed(val, max) : heatBlue(val, max)) : 'transparent';
    const clN   = CLIENTES.find(c => c.id === clienteId)?.nombre || '';
    return (
      <TableCell
        onClick={() => val > 0 && onCellClick({
          clienteNombre: clN,
          bucketKey: isVencida ? 'v30' : 'nv30',
          bucketLabel: isVencida ? 'Todas las Vencidas' : 'Todas las No Vencidas',
          isVencida,
          data: { monto: val, facturas: fact },
        })}
        sx={{
          ...tdSx,
          background: bg,
          cursor: val > 0 ? 'pointer' : 'default',
          textAlign: 'right',
          fontWeight: 500,
          borderLeft: `2px solid ${isVencida ? 'rgba(239,68,68,.18)' : 'rgba(84,126,105,.18)'}`,
          px: '12px',
          transition: 'filter .12s',
          '&:hover': val > 0 ? { filter: 'brightness(0.9)' } : {},
        }}
      >
        {val > 0 ? (
          <>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: isVencida ? '#b91c1c' : DL.blue, fontFamily: FONT, lineHeight: 1.3 }}>
              {fmtCLP(val)}
            </Typography>
            <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{fact} fact.</Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: 11, color: 'rgba(26,26,26,.18)', fontFamily: FONT }}>—</Typography>
        )}
      </TableCell>
    );
  };

  const sorted = [...CLIENTES].sort((a, b) => {
    const ca = clienteTotals[a.id] || { venc: 0, noVenc: 0, total: 0 };
    const cb = clienteTotals[b.id] || { venc: 0, noVenc: 0, total: 0 };
    let av, bv;
    if (sortCol === 'nombre')      { av = a.nombre; bv = b.nombre; }
    else if (sortCol === 'venc')   { av = ca.venc;   bv = cb.venc; }
    else if (sortCol === 'noVenc') { av = ca.noVenc; bv = cb.noVenc; }
    else                           { av = ca.total;  bv = cb.total; }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  // Shared header cell style
  const GH = (extra = {}) => ({
    ...thSx,
    fontFamily: FONT,
    py: '10px',
    px: '12px',
    fontSize: 10,
    ...extra,
  });

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Card header */}
      <Box sx={{ px: '16px', pt: '14px', pb: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>
            Matriz de Antigüedad de Saldos
          </Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: FONT, mt: '2px' }}>
            Clic en cualquier celda para ver el detalle de facturas
          </Typography>
        </Box>
        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', background: 'rgba(239,68,68,.30)' }} />
            <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>Vencido</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', background: 'rgba(84,126,105,.22)' }} />
            <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>No Vencido</Typography>
          </Box>
          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT, opacity: 0.6 }}>Intensidad = monto</Typography>
        </Box>
      </Box>
      <Box sx={{ height: '1px', background: DL.border, mx: '14px' }} />

      <Box sx={{ p: '14px' }}>
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflow: 'clip', overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1080, borderCollapse: 'separate', borderSpacing: 0 }}>
            <TableHead>
              {/* ── Group header row ── */}
              <TableRow>
                {/* Cliente */}
                <TableCell
                  rowSpan={2}
                  onClick={() => handleSort('nombre')}
                  sx={{
                    ...GH({ position: 'sticky', left: 0, zIndex: 10, minWidth: 190, background: '#f2f2f2',
                      borderRight: `2px solid ${DL.border}`, cursor: 'pointer',
                      color: sortCol === 'nombre' ? DL.blue : DL.tS,
                      '&:hover': { color: DL.blue },
                    }),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>Cliente{sortIcon('nombre')}</Box>
                </TableCell>

                {/* VENCIDAS group */}
                <TableCell
                  colSpan={6}
                  sx={{
                    ...GH({ textAlign: 'center', color: '#b91c1c',
                      background: 'rgba(239,68,68,.06)',
                      borderLeft: `1px solid rgba(239,68,68,.15)`,
                      borderBottom: `1px solid rgba(239,68,68,.15)`,
                    }),
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    ⚠ VENCIDAS
                    <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', background: DL.redBg }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#b91c1c', fontFamily: FONT }}>
                        {grandTotals.total > 0 ? ((grandTotals.venc / grandTotals.total) * 100).toFixed(1) : '0'}% del total
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* NO VENCIDAS group */}
                <TableCell
                  colSpan={6}
                  sx={{
                    ...GH({ textAlign: 'center', color: DL.blue,
                      background: 'rgba(84,126,105,.04)',
                      borderLeft: `2px solid rgba(84,126,105,.18)`,
                      borderBottom: `1px solid rgba(84,126,105,.15)`,
                    }),
                  }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    ✓ NO VENCIDAS
                    <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', background: 'rgba(84,126,105,.10)' }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, fontFamily: FONT }}>
                        {grandTotals.total > 0 ? ((grandTotals.noVenc / grandTotals.total) * 100).toFixed(1) : '0'}% del total
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Total */}
                <TableCell
                  rowSpan={2}
                  onClick={() => handleSort('total')}
                  sx={{
                    ...GH({ textAlign: 'right', background: '#f2f2f2',
                      borderLeft: `2px solid ${DL.border}`,
                      cursor: 'pointer', color: sortCol === 'total' ? DL.blue : DL.tS,
                      '&:hover': { color: DL.blue },
                    }),
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>Total{sortIcon('total')}</Box>
                </TableCell>

                {/* % Vencido */}
                <TableCell
                  rowSpan={2}
                  sx={{
                    ...GH({ textAlign: 'center', background: '#f2f2f2',
                      borderLeft: `1px solid ${DL.border}`,
                      minWidth: 72,
                    }),
                  }}
                >
                  % Venc.
                </TableCell>
              </TableRow>

              {/* ── Sub-header row ── */}
              <TableRow>
                {/* Vencidas buckets */}
                {VENC_BUCKETS.map((b, i) => (
                  <TableCell key={b.key} sx={{
                    ...GH({ color: '#b91c1c', minWidth: 90, textAlign: 'right', px: '12px',
                      background: 'rgba(239,68,68,.04)',
                      borderLeft: i === 0 ? `1px solid rgba(239,68,68,.15)` : 'none',
                    }),
                  }}>
                    {b.label}
                  </TableCell>
                ))}
                {/* Subtotal Vencidas */}
                <TableCell onClick={() => handleSort('venc')} sx={{
                  ...GH({ color: sortCol === 'venc' ? DL.blue : '#b91c1c', fontWeight: 500,
                    background: 'rgba(239,68,68,.08)',
                    borderLeft: `2px solid rgba(239,68,68,.18)`,
                    cursor: 'pointer', textAlign: 'right', px: '12px',
                    '&:hover': { color: DL.blue },
                  }),
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>Subtotal{sortIcon('venc')}</Box>
                </TableCell>

                {/* No Vencidas buckets */}
                {NO_VENC_BUCKETS.map((b, i) => (
                  <TableCell key={b.key} sx={{
                    ...GH({ color: DL.blue, minWidth: 90, textAlign: 'right', px: '12px',
                      background: 'rgba(84,126,105,.03)',
                      borderLeft: i === 0 ? `2px solid rgba(84,126,105,.18)` : 'none',
                    }),
                  }}>
                    {b.label}
                  </TableCell>
                ))}
                {/* Subtotal No Vencidas */}
                <TableCell onClick={() => handleSort('noVenc')} sx={{
                  ...GH({ color: sortCol === 'noVenc' ? DL.blue : DL.blue, fontWeight: 500,
                    background: 'rgba(84,126,105,.07)',
                    borderLeft: `2px solid rgba(84,126,105,.18)`,
                    cursor: 'pointer', textAlign: 'right', px: '12px',
                    '&:hover': { opacity: 1 },
                  }),
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>Subtotal{sortIcon('noVenc')}</Box>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sorted.map((c, rowIdx) => {
                const ct = clienteTotals[c.id] || { venc: 0, noVenc: 0, total: 0, vencFact: 0, noVencFact: 0 };
                const vencPctRow = ct.total > 0 ? Math.round((ct.venc / ct.total) * 100) : 0;
                const riskColor = vencPctRow >= 60 ? '#b91c1c' : vencPctRow >= 30 ? DL.yellow : DL.green;
                const riskBg    = vencPctRow >= 60 ? DL.redBg  : vencPctRow >= 30 ? DL.yellowBg : DL.greenBg;
                const isEven = rowIdx % 2 === 0;

                return (
                  <TableRow key={c.id} sx={{ background: isEven ? '#fff' : '#f6f6f6' }}>
                    {/* Cliente name — sticky */}
                    <TableCell sx={{
                      ...tdSx,
                      position: 'sticky', left: 0, zIndex: 5,
                      background: isEven ? '#fff' : '#f6f6f6',
                      borderRight: `2px solid ${DL.border}`,
                      minWidth: 190, px: '12px',
                    }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.navy, fontFamily: FONT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 175 }}>
                        {c.nombre}
                      </Typography>
                    </TableCell>

                    {/* Vencidas buckets */}
                    {VENC_BUCKETS.map(b => (
                      <BucketCell key={b.key} clienteId={c.id} bucket={b} isVencida={true} />
                    ))}

                    {/* Subtotal Vencidas */}
                    <SubtotalCell clienteId={c.id} isVencida={true} />

                    {/* No Vencidas buckets */}
                    {NO_VENC_BUCKETS.map((b, i) => (
                      <BucketCell key={b.key} clienteId={c.id} bucket={b} isVencida={false} />
                    ))}

                    {/* Subtotal No Vencidas */}
                    <SubtotalCell clienteId={c.id} isVencida={false} />

                    {/* Total */}
                    <TableCell sx={{ ...tdSx, textAlign: 'right', borderLeft: `2px solid ${DL.border}`, px: '12px', background: isEven ? 'rgba(26,26,26,.02)' : 'rgba(26,26,26,.035)' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>
                        {fmtCLP(ct.total)}
                      </Typography>
                    </TableCell>

                    {/* % Vencido pill */}
                    <TableCell sx={{ ...tdSx, textAlign: 'center', borderLeft: `1px solid ${DL.border}`, px: '8px' }}>
                      {ct.total > 0 ? (
                        <Box sx={{ display: 'inline-flex', px: '8px', py: '3px', borderRadius: '4px', background: riskBg }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: riskColor, fontFamily: FONT }}>
                            {vencPctRow}%
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 10, color: 'rgba(26,26,26,.2)', fontFamily: FONT }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>

            {/* ── Grand Totals footer ── */}
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  ...GH({ position: 'sticky', left: 0, zIndex: 10, background: '#ececec',
                    borderRight: `2px solid ${DL.border}`, color: DL.navy, px: '12px',
                    borderTop: `2px solid ${DL.border}`,
                  }),
                }}>
                  TOTAL GENERAL
                </TableCell>

                {/* Vencidas bucket totals */}
                {VENC_BUCKETS.map((b, i) => {
                  const d = totals[b.key];
                  return (
                    <TableCell key={b.key} sx={{
                      ...GH({ background: 'rgba(239,68,68,.07)', textAlign: 'right', px: '12px',
                        borderLeft: i === 0 ? `1px solid rgba(239,68,68,.2)` : 'none',
                        borderTop: `2px solid ${DL.border}`,
                      }),
                    }}>
                      {d.monto > 0 ? (
                        <>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#b91c1c', fontFamily: FONT }}>{fmtCLP(d.monto)}</Typography>
                          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{d.facturas} fact.</Typography>
                        </>
                      ) : <Typography sx={{ fontSize: 11, color: 'rgba(26,26,26,.2)', fontFamily: FONT }}>—</Typography>}
                    </TableCell>
                  );
                })}

                {/* Grand subtotal Vencidas */}
                <TableCell
                  onClick={() => grandTotals.venc > 0 && onCellClick({ clienteNombre: 'Todos los Clientes', bucketKey: 'v30', bucketLabel: 'Todas las Vencidas', isVencida: true, data: { monto: grandTotals.venc, facturas: grandTotals.vencFact } })}
                  sx={{
                    ...GH({ background: 'rgba(239,68,68,.12)', textAlign: 'right', px: '12px',
                      borderLeft: `2px solid rgba(239,68,68,.25)`,
                      borderTop: `2px solid ${DL.border}`,
                      cursor: 'pointer', '&:hover': { filter: 'brightness(0.93)' },
                    }),
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#b91c1c', fontFamily: FONT }}>{fmtCLP(grandTotals.venc)}</Typography>
                  <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{grandTotals.vencFact} fact.</Typography>
                </TableCell>

                {/* No Vencidas bucket totals */}
                {NO_VENC_BUCKETS.map((b, i) => {
                  const d = totals[b.key];
                  return (
                    <TableCell key={b.key} sx={{
                      ...GH({ background: 'rgba(84,126,105,.05)', textAlign: 'right', px: '12px',
                        borderLeft: i === 0 ? `2px solid rgba(84,126,105,.25)` : 'none',
                        borderTop: `2px solid ${DL.border}`,
                      }),
                    }}>
                      {d.monto > 0 ? (
                        <>
                          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.blue, fontFamily: FONT }}>{fmtCLP(d.monto)}</Typography>
                          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{d.facturas} fact.</Typography>
                        </>
                      ) : <Typography sx={{ fontSize: 11, color: 'rgba(26,26,26,.2)', fontFamily: FONT }}>—</Typography>}
                    </TableCell>
                  );
                })}

                {/* Grand subtotal No Vencidas */}
                <TableCell
                  onClick={() => grandTotals.noVenc > 0 && onCellClick({ clienteNombre: 'Todos los Clientes', bucketKey: 'nv30', bucketLabel: 'Todas las No Vencidas', isVencida: false, data: { monto: grandTotals.noVenc, facturas: grandTotals.noVencFact } })}
                  sx={{
                    ...GH({ background: 'rgba(84,126,105,.09)', textAlign: 'right', px: '12px',
                      borderLeft: `2px solid rgba(84,126,105,.25)`,
                      borderTop: `2px solid ${DL.border}`,
                      cursor: 'pointer', '&:hover': { filter: 'brightness(0.93)' },
                    }),
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: FONT }}>{fmtCLP(grandTotals.noVenc)}</Typography>
                  <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{grandTotals.noVencFact} fact.</Typography>
                </TableCell>

                {/* Grand total */}
                <TableCell sx={{
                  ...GH({ textAlign: 'right', px: '12px', background: '#ececec',
                    borderLeft: `2px solid ${DL.border}`,
                    borderTop: `2px solid ${DL.border}`,
                  }),
                }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.navy, fontFamily: FONT }}>{fmtCLP(grandTotals.total)}</Typography>
                </TableCell>

                {/* % vencido grand total */}
                <TableCell sx={{
                  ...GH({ textAlign: 'center', px: '8px', background: '#ececec',
                    borderLeft: `1px solid ${DL.border}`,
                    borderTop: `2px solid ${DL.border}`,
                  }),
                }}>
                  {grandTotals.total > 0 && (
                    <Box sx={{ display: 'inline-flex', px: '8px', py: '3px', borderRadius: '4px', background: DL.redBg }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#b91c1c', fontFamily: FONT }}>
                        {Math.round((grandTotals.venc / grandTotals.total) * 100)}%
                      </Typography>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </Box>
      </Box>
    </Card>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AgingSaldos() {
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);
  const [modalCell, setModalCell] = useState(null);
  const [ano,       setAno]       = useState('2025');
  const [mes,       setMes]       = useState('todos');
  const [sucursal,  setSucursal]  = useState('todas');
  const [vendedor,  setVendedor]  = useState('todos');
  const [estado,    setEstado]    = useState('todos');

  // ── Aggregate totals from AGING_MATRIX ──────────────────────────────────────
  const { totalVenc, totalNoVenc, totalCartera } = useMemo(() => {
    let tv = 0, tnv = 0;
    Object.values(AGING_MATRIX).forEach(cb => {
      VENC_BUCKETS.forEach(b => { if (cb[b.key]) tv += cb[b.key].monto; });
      NO_VENC_BUCKETS.forEach(b => { if (cb[b.key]) tnv += cb[b.key].monto; });
    });
    return { totalVenc: tv, totalNoVenc: tnv, totalCartera: tv + tnv };
  }, []);

  // ── Clients with vencido > 0 ─────────────────────────────────────────────────
  const clientesEnRiesgo = useMemo(() => {
    return Object.entries(AGING_MATRIX).filter(([, cb]) =>
      VENC_BUCKETS.some(b => cb[b.key] && cb[b.key].monto > 0)
    ).length;
  }, []);

  // ── Bucket totals for chart ───────────────────────────────────────────────────
  const bucketTotals = useMemo(() => {
    const res = {};
    ALL_BUCKETS.forEach(b => { res[b.key] = 0; });
    Object.values(AGING_MATRIX).forEach(cb => {
      ALL_BUCKETS.forEach(b => { if (cb[b.key]) res[b.key] += cb[b.key].monto; });
    });
    return res;
  }, []);

  // ── Top 5 clientes by vencido ─────────────────────────────────────────────────
  const topClientes = useMemo(() => {
    const list = CLIENTES.map(c => {
      const cb = AGING_MATRIX[c.id] || {};
      let venc = 0;
      VENC_BUCKETS.forEach(b => { if (cb[b.key]) venc += cb[b.key].monto; });
      return { nombre: c.nombre, venc };
    }).filter(x => x.venc > 0).sort((a, b) => b.venc - a.venc).slice(0, 5);
    const maxVenc = list[0]?.venc || 1;
    return list.map(x => ({ ...x, pct: Math.round((x.venc / maxVenc) * 100) }));
  }, []);

  // ── Chart config ──────────────────────────────────────────────────────────────
  const bucketLabels = ['1–30', '31–60', '61–90', '91–120', '+120'];
  const vencData   = [bucketTotals.v30, bucketTotals.v60, bucketTotals.v90, bucketTotals.v120, bucketTotals.v120p].map(v => +(v / 1e6).toFixed(1));
  const noVencData = [bucketTotals.nv30, bucketTotals.nv60, bucketTotals.nv90, bucketTotals.nv120, bucketTotals.nv120p].map(v => +(v / 1e6).toFixed(1));

  const chartOption = {
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: v => '$' + v + 'M', fontFamily: 'Inter', fontSize: 9 },
      splitLine: { lineStyle: { color: 'rgba(26,26,26,.07)' } },
    },
    yAxis: {
      type: 'category',
      data: bucketLabels,
      axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#6a6a6a' },
    },
    series: [
      {
        name: 'Vencido',
        type: 'bar',
        stack: 'total',
        data: vencData,
        itemStyle: { color: DL.red, borderRadius: [0, 0, 0, 0] },
      },
      {
        name: 'No Vencido',
        type: 'bar',
        stack: 'total',
        data: noVencData,
        itemStyle: { color: 'rgba(84,126,105,.7)', borderRadius: [0, 4, 4, 0] },
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: params => params.map(p => p.seriesName + ': $' + p.value + 'M').join('<br/>'),
    },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: 'Inter', fontSize: 9 },
      icon: 'circle',
      itemWidth: 8,
    },
  };

  // ── KPI derived values ────────────────────────────────────────────────────────
  const vencPct = totalCartera > 0 ? Math.min(Math.round((totalVenc / totalCartera) * 100), 100) : 0;
  const vencDiffPp = vencPct - 25;

  // ── Export to Excel ───────────────────────────────────────────────────────────
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

    const rows = [];
    CLIENTES.forEach(cli => {
      const buckets = AGING_MATRIX[cli.id] || {};
      ALL_BUCKETS.forEach(b => {
        const bucket = buckets[b.key];
        if (bucket) {
          rows.push({
            Cliente: cli.nombre,
            Tramo: b.label,
            Tipo: b.key.startsWith('v') ? 'Vencido' : 'No Vencido',
            'Monto $': bucket.monto,
            Facturas: bucket.facturas,
          });
        }
      });
    });
    const wsAging = XLSX.utils.json_to_sheet(rows);
    autoWidth(wsAging);
    XLSX.utils.book_append_sheet(wb, wsAging, 'Antigüedad de Saldos');

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    XLSX.writeFile(wb, `AgingSaldos_${stamp}.xlsx`);
  }

  return (
    <Box>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <PageHeader title="Antigüedad de Saldos" live onRefresh={handleRefresh} onExport={exportToExcel}>
        <MiniSelect label="Año" value={ano} onChange={setAno} minWidth={72} options={[
          { value: '2025', label: '2025' },
          { value: '2024', label: '2024' },
          { value: '2023', label: '2023' },
        ]} />
        <MiniSelect label="Mes" value={mes} onChange={setMes} options={[
          { value: 'todos', label: 'Todos' },
          { value: 'ene',   label: 'Enero' },
          { value: 'feb',   label: 'Febrero' },
          { value: 'mar',   label: 'Marzo' },
          { value: 'abr',   label: 'Abril' },
          { value: 'may',   label: 'Mayo' },
          { value: 'jun',   label: 'Junio' },
          { value: 'jul',   label: 'Julio' },
          { value: 'ago',   label: 'Agosto' },
          { value: 'sep',   label: 'Septiembre' },
          { value: 'oct',   label: 'Octubre' },
          { value: 'nov',   label: 'Noviembre' },
          { value: 'dic',   label: 'Diciembre' },
        ]} />
        <MiniSelect label="Sucursal" value={sucursal} onChange={setSucursal} options={[
          { value: 'todas',   label: 'Todas' },
          { value: 'central', label: 'Tienda Central' },
          { value: 'suc1',    label: 'Sucursal No.1' },
          { value: 'suc2',    label: 'Sucursal No.2' },
        ]} />
        <MiniSelect label="Vendedor" value={vendedor} onChange={setVendedor} options={[
          { value: 'todos', label: 'Todos' },
          { value: 'JH',    label: 'Juan Hernández' },
          { value: 'JM',    label: 'Jorge Miguel' },
          { value: 'ML',    label: 'María López' },
          { value: 'CA',    label: 'Carlos Ávila' },
        ]} />
        <MiniSelect label="Estado" value={estado} onChange={setEstado} options={[
          { value: 'todos',      label: 'Todos' },
          { value: 'vencido',    label: 'Vencido' },
          { value: 'por-vencer', label: 'Por Vencer' },
          { value: 'al-dia',     label: 'Al Día' },
        ]} />
      </PageHeader>

      <Box sx={{ p: { xs: '10px', md: '16px' }, display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── ROW 1: 4 KPI Cards ──────────────────────────────────────────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {/* KPI 1 — Total Cartera CxC */}
          <KpiCard
            lbl="Total Cartera CxC"
            val={fmtCLP(totalCartera)}
            pct={87}
            meta="$4.5B"
            metaLbl="Presupuesto"
            diff="+$0.3B vs presup."
            yoyPrev="$3.9B"
            yoyDelta="+12.8%"
            yoyUp={true}
          />

          {/* KPI 2 — Cartera Vencida */}
          <KpiCard
            lbl="Cartera Vencida"
            val={fmtCLP(totalVenc)}
            pct={vencPct}
            meta="< 25%"
            metaLbl="Meta"
            diff={`${vencDiffPp >= 0 ? '+' : ''}${vencDiffPp}pp vs meta`}
            yoyPrev="62%"
            yoyDelta="+13pp"
            yoyUp={false}
          />

          {/* KPI 3 — DSO Días */}
          <KpiCard
            lbl="DSO Días"
            val="42 días"
            pct={71}
            meta="≤ 30 días"
            metaLbl="Meta"
            diff="+12d vs meta"
            yoyPrev="38d"
            yoyDelta="+4d"
            yoyUp={false}
          />

          {/* KPI 4 — Clientes en Riesgo */}
          <KpiCard
            lbl="Clientes en Riesgo"
            val={String(clientesEnRiesgo)}
            pct={55}
            meta="0 clientes"
            metaLbl="Meta"
            diff={`${clientesEnRiesgo} con saldo vencido`}
            yoyPrev="7"
            yoyDelta="+1"
            yoyUp={false}
          />
        </Box>

        {/* ── ROW 2: Aging Matrix Table ────────────────────────────────────── */}
        <AgingMatrixTable onCellClick={setModalCell} />

      </Box>

      {/* ── ROW 4: Invoice Modal ─────────────────────────────────────────── */}
      {modalCell && <InvoiceModal cell={modalCell} onClose={() => setModalCell(null)} />}
    </Box>
  );
}
