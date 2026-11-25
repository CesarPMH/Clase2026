// ─── Estado de Resultados ─────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { DL } from '../theme';
import { ESTADO_ROWS } from '../data/financiero';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import * as XLSX from 'xlsx';

const ff = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fmt = v =>
  (v < 0 ? '-' : '') + '$' +
  Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (a, b) => b !== 0 ? +((( a - b) / Math.abs(b)) * 100).toFixed(1) : 0;

const PERIODS = ['Ene–Mar 2025', 'Abr–Jun 2025', 'Jul–Sep 2025', 'Abr 2026'];

const ANOS    = ['Todos', '2024', '2025', '2026'];
const SUCURSALES = ['Todas', 'Casa Matriz', 'Sucursal Norte', 'Sucursal Sur', 'Sucursal Este'];
const VISTAS  = [
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'mensual',    label: 'Mensual'    },
  { value: 'anual',      label: 'Anual'      },
];
const MONEDAS = [
  { value: 'CLP', label: 'CLP ($)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'UF',  label: 'UF'      },
];

function exportToExcel(rows) {
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
  const header = ['Cuenta', ...PERIODS, 'Var%'];
  const data = rows.flatMap(row => {
    const lastVal = row.values[row.values.length - 1];
    const prevVal = row.values[row.values.length - 2];
    const varPct  = prevVal !== 0 ? +((( lastVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1) : 0;
    const main = [row.label, ...row.values, `${varPct >= 0 ? '+' : ''}${varPct}%`];
    const children = (row.children || []).map(c => [`  — ${c.label}`, ...c.values, '']);
    return [main, ...children];
  });
  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  autoWidth(ws);
  XLSX.utils.book_append_sheet(wb, ws, 'Estado de Resultados');
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  XLSX.writeFile(wb, `EstadoResultados_${stamp}.xlsx`);
}

export default function EstadoResultados() {
  const navigate  = useNavigate();
  const [expanded,  setExpanded]  = useState({});
  const [ano,       setAno]       = useState('2025');
  const [sucursal,  setSucursal]  = useState('Todas');
  const [vista,     setVista]     = useState('trimestral');
  const [moneda,    setMoneda]    = useState('CLP');
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);

  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <Box sx={{ display:'flex', flexDirection:'column' }}>

      <PageHeader
        title="Estado de Resultados"
        live
        onBack={() => navigate('/finanzas')}
        onRefresh={handleRefresh}
        onExport={() => exportToExcel(ESTADO_ROWS)}
      >
        <MiniSelect label="Año"       value={ano}      onChange={setAno}      options={ANOS.map(o => ({ value:o, label:o }))} />
        <MiniSelect label="Sucursal"  value={sucursal} onChange={setSucursal} options={SUCURSALES.map(o => ({ value:o, label:o }))} />
        <MiniSelect label="Vista"     value={vista}    onChange={setVista}    options={VISTAS} />
      </PageHeader>

      {/* ── Contenido ── */}
      <Box sx={{ p: { xs: '10px', md: '16px' }, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Tarjeta */}
        <Box sx={{
          background: '#fff',
          borderRadius: '12px',
          border: `1px solid ${DL.border}`,
          boxShadow: DL.e1,
          overflow: 'clip',
        }}>

          {/* Card header */}
          <Box sx={{ px: '16px', pt: '14px', pb: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: ff }}>
                Estado de Resultados Comparativo
              </Typography>
              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: ff, mt: '2px' }}>
                Períodos: {PERIODS.join(' · ')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: ff }}>Demo Corp S.A.</Typography>
          </Box>
          <Box sx={{ height: '1px', background: DL.border, mx: '14px' }} />

          {/* Tabla */}
          <Box sx={{ overflowX: 'auto', p: '6px 0 4px' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: ff }}>
              <Box component="thead">
                <Box component="tr" sx={{ background: '#f7f8fd' }}>
                  <Box component="th" sx={{
                    p: '9px 16px', textAlign: 'left',
                    fontSize: 9, fontWeight: 500, color: DL.tS,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    borderBottom: `1px solid ${DL.border}`,
                    minWidth: 220,
                  }}>
                    Cuenta
                  </Box>
                  {PERIODS.map((p, i) => (
                    <Box component="th" key={p} sx={{
                      p: '9px 16px', textAlign: 'right',
                      fontSize: 9, fontWeight: 500,
                      color: i === PERIODS.length - 1 ? DL.blue : DL.tS,
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      borderBottom: `1px solid ${DL.border}`,
                      minWidth: 130,
                    }}>
                      {p}
                    </Box>
                  ))}
                  <Box component="th" sx={{
                    p: '9px 16px', textAlign: 'right',
                    fontSize: 9, fontWeight: 500, color: DL.tS,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                    borderBottom: `1px solid ${DL.border}`,
                    minWidth: 72,
                  }}>
                    Var%
                  </Box>
                </Box>
              </Box>
              <Box component="tbody">
                {ESTADO_ROWS.map(row => {
                  const isExpanded = expanded[row.id];
                  const hasChildren = row.children?.length > 0;
                  const lastVal = row.values[row.values.length - 1];
                  const prevVal = row.values[row.values.length - 2];
                  const varPct = pct(lastVal, prevVal);

                  return [
                    <Box component="tr" key={row.id} sx={{
                      borderBottom: `1px solid ${DL.border}`,
                      background: row.subtotal ? 'rgba(26,26,26,.03)' : 'transparent',
                      '&:hover': { background: DL.subtle },
                    }}>
                      <Box component="td" sx={{
                        p: '9px 16px',
                        fontWeight: row.bold ? 500 : 400,
                        fontSize: row.subtotal ? 12 : 11,
                        color: row.subtotal ? DL.tH : DL.tM,
                        cursor: hasChildren ? 'pointer' : 'default',
                      }}
                        onClick={() => hasChildren && toggle(row.id)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {hasChildren && (
                            <Box component="span" sx={{ fontSize: 10, color: DL.blue, fontWeight: 500, userSelect: 'none' }}>
                              {isExpanded ? '▾' : '▸'}
                            </Box>
                          )}
                          {row.label}
                        </Box>
                      </Box>
                      {row.values.map((v, i) => (
                        <Box component="td" key={i} sx={{
                          p: '9px 16px', textAlign: 'right',
                          fontWeight: row.bold ? 500 : 400,
                          fontSize: row.subtotal ? 12 : 11,
                          color: i === row.values.length - 1
                            ? (row.subtotal ? DL.blue : v >= 0 ? DL.tH : DL.red)
                            : DL.tS,
                        }}>
                          {fmt(v)}
                        </Box>
                      ))}
                      <Box component="td" sx={{ p: '9px 16px', textAlign: 'right' }}>
                        <Box component="span" sx={{
                          px: '7px', py: '3px', borderRadius: '4px', fontSize: 9, fontWeight: 500,
                          background: varPct >= 0 ? DL.greenBg : DL.redBg,
                          color: varPct >= 0 ? DL.green : DL.red,
                        }}>
                          {varPct >= 0 ? '+' : ''}{varPct}%
                        </Box>
                      </Box>
                    </Box>,

                    // Filas hijas (expandibles)
                    ...(hasChildren && isExpanded ? row.children.map(child => (
                      <Box component="tr" key={child.id} sx={{
                        borderBottom: `1px solid ${DL.border}`,
                        background: 'rgba(84,126,105,.02)',
                      }}>
                        <Box component="td" sx={{ p: '7px 16px 7px 36px', color: DL.tS, fontSize: 10 }}>
                          — {child.label}
                        </Box>
                        {child.values.map((v, i) => (
                          <Box component="td" key={i} sx={{
                            p: '7px 16px', textAlign: 'right', fontSize: 10,
                            color: i === child.values.length - 1 ? DL.tM : DL.tS,
                          }}>
                            {fmt(v)}
                          </Box>
                        ))}
                        <Box component="td" sx={{ p: '7px 16px' }} />
                      </Box>
                    )) : []),
                  ];
                })}
              </Box>
            </Box>
          </Box>
        </Box>

      </Box>{/* end content wrapper */}
    </Box>
  );
}
