// ─── Resumen Ejecutivo ────────────────────────────────────────────────────────
// Objetivo: Dar al Gerente Comercial una vista de 60 segundos del estado comercial:
//   ¿Estamos en meta? ¿Dónde está el problema? ¿Qué acción tomar hoy?
//
// Componentes: MUI (Box, Typography, Grid, Tabs, Tab, Paper)
// Gráficas:    Apache ECharts via echarts-for-react

import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Grid, Tabs, Tab, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, InputBase,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

import PageHeader, { MiniSelect, ToggleGroup } from '../components/common/PageHeader';
import SectionHeader from '../components/common/SectionHeader';
import KpiCard from '../components/common/KpiCard';
import Pagination from '../components/common/Pagination';
import { DL } from '../theme';
import { KPI_DATA, HIST_DATA, VPOR_DATA, ALERTS, DET_DATA } from '../data/resumen';

// ─── Semaphore Alert Panel ────────────────────────────────────────────────────
const ALERT_COLORS = {
  r: { bg: '#fff1f0', border: '#dc2626', iconBg: '#fee2e2', iconColor: '#dc2626', iconBorder: '#fca5a5' },
  y: { bg: '#fffbeb', border: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706', iconBorder: '#fcd34d' },
  g: { bg: '#f0fdf4', border: '#16a34a', iconBg: '#dcfce7', iconColor: '#16a34a', iconBorder: '#86efac' },
};
const ALERT_ICONS = { r: '!', y: '⚠', g: '✓' };

function AlertPanel({ alerts }) {
  return (
    <Paper elevation={1} sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: '10px' }}>
        Alertas del Período
      </Typography>
      {alerts.map((a, i) => {
        const c = ALERT_COLORS[a.type];
        return (
          <Box key={i} sx={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            p: '9px 11px', borderRadius: '8px', mb: '6px',
            background: c.bg,
            borderLeft: `3px solid ${c.border}`,
          }}>
            <Box sx={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: '1px',
              background: c.iconBg, color: c.iconColor,
              border: `1.5px solid ${c.iconBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 500,
            }}>
              {ALERT_ICONS[a.type]}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH, mb: '1px' }}>
                {a.title}
              </Typography>
              <Typography sx={{ fontSize: 10, color: DL.tM, lineHeight: 1.4, fontWeight: 500 }}>
                {a.msg}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
}

// ─── Historical Chart (ECharts) ───────────────────────────────────────────────
function HistChart({ gran, split }) {
  const data = HIST_DATA[split]?.[gran] || HIST_DATA.general.mes;

  const series = useMemo(() => {
    const result = data.datasets.map((ds) => ({
      name: ds.label,
      type: 'bar',
      data: ds.data,
      stack: data.stacked ? 'total' : undefined,
      barMaxWidth: data.stacked ? 20 : 22,
      barGap: '8%',
      barCategoryGap: '35%',
      itemStyle: { color: ds.color, borderRadius: [3, 3, 0, 0] },
      emphasis: { focus: 'series' },
    }));
    if (data.budget) {
      result.push({
        name: 'Presupuesto',
        type: 'line',
        data: data.budget,
        smooth: false,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#f59e0b', width: 1.8, type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        z: 10,
      });
    }
    return result;
  }, [data]);

  const option = {
    animation: true,
    animationDuration: 500,
    grid: { top: 16, right: 20, bottom: 40, left: 62 },
    xAxis: {
      type: 'category',
      data: data.labels,
      axisLine: { lineStyle: { color: 'rgba(26,26,26,.12)' } },
      axisTick: { show: false },
      axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontFamily: 'Inter', fontSize: 10, color: '#8d8d8d',
        formatter: (v) => `$${v}K`,
      },
      splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(84,126,105,.06)' } },
      backgroundColor: '#fff',
      borderColor: 'rgba(26,26,26,.15)',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { fontFamily: 'Inter', fontSize: 11, color: '#1a1a1a' },
    },
    legend: { show: false },
    series,
  };

  // Custom legend
  const legendItems = [
    ...data.datasets.map((ds) => ({ label: ds.label, color: ds.color, type: 'bar' })),
    ...(data.budget ? [{ label: 'Presupuesto', color: '#f59e0b', type: 'dashed' }] : []),
  ];

  return (
    <Paper elevation={1} sx={{ p: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '10px' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>
          Histórico de Ventas
        </Typography>
        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {legendItems.map((l) => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {l.type === 'dashed' ? (
                <Box sx={{ width: 16, borderTop: `2px dashed ${l.color}` }} />
              ) : (
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', background: l.color, flexShrink: 0 }} />
              )}
              <Typography sx={{ fontSize: 9, color: DL.tS, fontWeight: 500 }}>{l.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ReactECharts option={option} style={{ height: '100%', minHeight: 200 }} />
      </Box>
    </Paper>
  );
}

// ─── Ventas Por section ───────────────────────────────────────────────────────
const VPOR_TABS = [
  { value: 'producto',  label: 'Producto' },
  { value: 'categoria', label: 'Categoría' },
  { value: 'canal',     label: 'Canal' },
  { value: 'vendedor',  label: 'Vendedor' },
  { value: 'region',    label: 'Región' },
  { value: 'cliente',   label: 'Cliente' },
];

function MgBadge({ mg }) {
  if (mg >= 25) return <Box sx={{ display: 'inline-block', px: '7px', py: '2px', borderRadius: '4px', fontSize: 10, fontWeight: 500, background: 'rgba(22,163,74,.1)', color: DL.green }}>{mg.toFixed(1)}%</Box>;
  if (mg >= 15) return <Box sx={{ display: 'inline-block', px: '7px', py: '2px', borderRadius: '4px', fontSize: 10, fontWeight: 500, background: 'rgba(180,83,9,.1)', color: DL.yellow }}>{mg.toFixed(1)}%</Box>;
  return <Box sx={{ display: 'inline-block', px: '7px', py: '2px', borderRadius: '4px', fontSize: 10, fontWeight: 500, background: 'rgba(220,38,38,.1)', color: DL.red }}>{mg < 0 ? mg.toFixed(1) : mg.toFixed(1)}%</Box>;
}

function DeltaBadge({ delta }) {
  const up = !delta.startsWith('-');
  return (
    <Box sx={{
      display: 'inline-block', px: '5px', py: '1px',
      borderRadius: '4px', fontSize: 9, fontWeight: 500,
      background: up ? DL.greenBg : DL.redBg,
      color: up ? DL.green : DL.red,
    }}>
      {delta}
    </Box>
  );
}

function VporChart({ rows }) {
  const maxV = Math.max(...rows.map((r) => r.v));
  const option = {
    animation: true,
    grid: { top: 8, right: 56, bottom: 8, left: 8, containLabel: true },
    tooltip: {
      backgroundColor: '#fff', borderColor: 'rgba(26,26,26,.15)', borderWidth: 1,
      padding: [8, 12], textStyle: { fontFamily: 'Inter', fontSize: 10 },
      trigger: 'axis',
    },
    xAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'Inter', fontSize: 8, color: '#939393', formatter: (v) => `$${v}K` },
      splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)' } },
      axisLine: { show: false }, axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: rows.map((r) => r.name.length > 14 ? r.name.slice(0, 12) + '…' : r.name),
      inverse: true,
      axisLabel: { fontFamily: 'Inter', fontSize: 9, color: DL.dark },
      axisTick: { show: false }, axisLine: { show: false },
    },
    series: [
      {
        name: 'Ant.',
        type: 'bar',
        data: rows.map((r) => r.prev),
        barWidth: 5,
        itemStyle: { color: 'rgba(26,26,26,.15)', borderRadius: [0, 2, 2, 0] },
      },
      {
        name: 'Actual',
        type: 'bar',
        data: rows.map((r) => r.v),
        barWidth: 5,
        itemStyle: {
          color: (p) => {
            const mg = rows[p.dataIndex].mg;
            return mg < 0 ? '#dc2626' : mg < 20 ? '#b45309' : '#547e69';
          },
          borderRadius: [0, 2, 2, 0],
        },
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: Math.max(rows.length * 30 + 20, 160) }} />;
}

function DetTable({ search }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filtered = DET_DATA.filter((r) =>
    !search || r.cli.toLowerCase().includes(search.toLowerCase()) || r.fac.toLowerCase().includes(search.toLowerCase())
  );
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <TableContainer>
        <Table size="small" sx={{ fontSize: 10 }}>
          <TableHead>
            <TableRow>
              {['ID Factura','Cliente','Nº Factura','Fecha','Vence','Cant.','Venta $','N.C.','Costo $','Mg%','Abono','Pendiente'].map((h) => (
                <TableCell key={h} sx={{
                  fontSize: 8, fontWeight: 500, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: DL.tS,
                  borderBottom: `2px solid rgba(26,26,26,.08)`,
                  background: 'rgba(26,26,26,.025)',
                  whiteSpace: 'nowrap', px: '8px',
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.fac} hover sx={{ cursor: 'pointer', '&:hover td': { background: 'rgba(84,126,105,.03)' } }}>
                <TableCell sx={{ fontSize: 10, color: DL.blue, fontWeight: 500, px: '8px' }}>{r.fac}</TableCell>
                <TableCell sx={{ fontSize: 10, color: DL.tB, fontWeight: 500, px: '8px', whiteSpace: 'nowrap' }}>{r.cli}</TableCell>
                <TableCell sx={{ fontSize: 10, color: DL.tS, px: '8px' }}>{r.nofac}</TableCell>
                <TableCell sx={{ fontSize: 10, color: DL.tS, px: '8px' }}>{r.fecha}</TableCell>
                <TableCell sx={{ fontSize: 10, color: DL.tS, px: '8px' }}>{r.vence}</TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', fontWeight: 500, color: DL.tH, px: '8px' }}>{r.qty}</TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', fontWeight: 500, color: DL.tH, px: '8px' }}>${r.v}K</TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', color: r.nc > 0 ? DL.red : DL.tS, fontWeight: r.nc > 0 ? 500 : 400, px: '8px' }}>
                  {r.nc > 0 ? `$${r.nc}K` : '—'}
                </TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', color: DL.tS, px: '8px' }}>${r.costo}K</TableCell>
                <TableCell sx={{ px: '8px' }}><MgBadge mg={r.mg} /></TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', fontWeight: 500, color: DL.tH, px: '8px' }}>${r.abono}K</TableCell>
                <TableCell sx={{ fontSize: 10, textAlign: 'right', fontWeight: 500, color: r.pend > 0 ? DL.red : DL.green, px: '8px' }}>
                  {r.pend > 0 ? `$${r.pend}K` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={p => setPage(p)}
        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        pageSizeOptions={[10, 25, 50]}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Resumen() {
  const [periodo,  setPeriodo]  = useState('jul2025');
  const [empresa,  setEmpresa]  = useState('todas');
  const [gran,     setGran]     = useState('mes');
  const [split,    setSplit]    = useState('general');
  const [vporTab,  setVporTab]  = useState('producto');
  const [detTab,   setDetTab]   = useState('todas');
  const [search,   setSearch]   = useState('');

  const vporRows = VPOR_DATA[vporTab] || [];

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

    // Sheet 1: KPIs Resumen
    const kpiRows = KPI_DATA.map(k => ({
      KPI: k.lbl,
      Valor: k.val,
      Meta: k.meta,
      '% de Meta': k.pct + '%',
      Diferencia: k.diff,
      'vs Año Ant.': k.yoyPrev,
      'Delta YoY': k.yoyDelta,
    }));
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    autoWidth(wsKpi);
    XLSX.utils.book_append_sheet(wb, wsKpi, 'KPIs Resumen');

    // Sheet 2: Detalle
    if (DET_DATA && DET_DATA.length > 0) {
      const detRows = DET_DATA.map(r => ({
        'ID Factura': r.id || '',
        Cliente: r.cli || '',
        Vendedor: r.vend || '',
        Canal: r.canal || '',
        'Fecha': r.fecha || '',
        'Venta $': r.v || '',
        'Margen %': r.mg || '',
        Estado: r.estado || '',
      }));
      const wsDet = XLSX.utils.json_to_sheet(detRows);
      autoWidth(wsDet);
      XLSX.utils.book_append_sheet(wb, wsDet, 'Detalle');
    }

    const today = new Date();
    const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    XLSX.writeFile(wb, `ResumenEjecutivo_${stamp}.xlsx`);
  }

  return (
    <Box>
      <PageHeader title="Resumen Ejecutivo" subtitle="Julio 2025 · Demo Bom Bom" onExport={exportToExcel}>
        <MiniSelect
          label="Período"
          value={periodo}
          onChange={setPeriodo}
          options={[
            { value: 'jul2025', label: 'Julio 2025' },
            { value: 'jun2025', label: 'Junio 2025' },
            { value: 'may2025', label: 'Mayo 2025' },
            { value: 'ytd2025', label: 'YTD 2025' },
          ]}
        />
        <MiniSelect
          label="Empresa"
          value={empresa}
          onChange={setEmpresa}
          options={[
            { value: 'todas',   label: 'Todas' },
            { value: 'bombom',  label: 'Bom Bom Agro' },
          ]}
        />
      </PageHeader>

      <Box sx={{ p:{ xs:'10px', md:'16px' }, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── KPI Row ── */}
        <Box>
          <SectionHeader title="Indicadores Clave" subtitle="vs. presupuesto y año anterior" />
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs:'repeat(2,1fr)', sm:'repeat(4,1fr)', md:'repeat(7, minmax(0, 1fr))' },
            gap: '10px',
          }}>
            {KPI_DATA.map((k) => <KpiCard key={k.lbl} {...k} />)}
          </Box>
        </Box>

        {/* ── Hist Chart + Alerts ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
            <SectionHeader title="Histórico de Ventas" subtitle="con presupuesto y año anterior" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ToggleGroup
                options={[{ value: 'mes', label: 'Mensual' }, { value: 'trim', label: 'Trimestral' }]}
                value={gran}
                onChange={setGran}
              />
              <ToggleGroup
                options={[
                  { value: 'general',  label: 'General' },
                  { value: 'categoria',label: 'Categoría' },
                ]}
                value={split}
                onChange={setSplit}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs:'1fr', md:'1fr 280px' }, gap: '12px' }}>
            <HistChart gran={gran} split={split} />
            <AlertPanel alerts={ALERTS} />
          </Box>
        </Box>

        {/* ── Ventas Por ── */}
        <Box>
          <SectionHeader title="Ventas Por Dimensión" subtitle="comparado con período anterior · margen bruto con semáforo" />
          <Paper elevation={1} sx={{ p: '14px 16px' }}>
            {/* Tab bar */}
            <Box sx={{
              display: 'flex', borderBottom: `2px solid ${DL.border}`,
              mb: '12px', overflowX: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
            }}>
              {VPOR_TABS.map((t) => (
                <Box
                  key={t.value}
                  component="button"
                  onClick={() => setVporTab(t.value)}
                  sx={{
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    fontSize: 11, fontWeight: 500,
                    px: '14px', py: '6px',
                    borderBottom: `2px solid ${vporTab === t.value ? DL.blue : 'transparent'}`,
                    mb: '-2px', border: 'none', background: 'transparent',
                    color: vporTab === t.value ? DL.navy : DL.tS,
                    fontWeight: vporTab === t.value ? 500 : 500,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all .14s',
                    '&:hover': { color: DL.tM },
                  }}
                >
                  {t.label}
                </Box>
              ))}
            </Box>

            {/* Split layout: table + chart */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
              {/* Table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Nombre','Ventas $K','Part.%','Δ vs Ant.','Margen'].map((h) => (
                        <TableCell key={h} sx={{
                          fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: DL.tS,
                          borderBottom: `2px solid rgba(26,26,26,.08)`,
                          background: 'rgba(26,26,26,.025)',
                          px: '10px',
                        }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vporRows.map((r) => (
                      <TableRow key={r.name} hover>
                        <TableCell sx={{ fontSize: 11, fontWeight: 500, color: DL.tB, px: '10px' }}>{r.name}</TableCell>
                        <TableCell sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, textAlign: 'right', px: '10px' }}>
                          ${r.v}K
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, color: DL.tM, textAlign: 'right', px: '10px' }}>
                          {r.part}%
                          <Box sx={{
                            display: 'inline-block', ml: '5px',
                            width: 30, height: 3,
                            background: 'rgba(26,26,26,.07)',
                            borderRadius: 3, verticalAlign: 'middle', overflow: 'hidden',
                          }}>
                            <Box sx={{ width: `${r.part / 50 * 100}%`, maxWidth: '100%', height: '100%', background: DL.blue, borderRadius: 3 }} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: '10px' }}><DeltaBadge delta={r.delta} /></TableCell>
                        <TableCell sx={{ px: '10px' }}><MgBadge mg={r.mg} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Chart */}
              <VporChart rows={vporRows} />
            </Box>
          </Paper>
        </Box>

        {/* ── Detalle de Facturas ── */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
            <SectionHeader title="Detalle de Facturas" subtitle="todas las transacciones del período" />
            {/* Search */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: DL.subtle, border: `1px solid ${DL.border2}`,
              borderRadius: '7px', overflow: 'hidden',
              '&:focus-within': { borderColor: DL.blue },
            }}>
              <SearchIcon sx={{ fontSize: 14, color: DL.tS, mx: '8px', opacity: 0.6, flexShrink: 0 }} />
              <InputBase
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente o factura..."
                sx={{
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  fontSize: 10, color: DL.tH,
                  '& input': { p: '5px 10px 5px 0', width: 180 },
                }}
              />
            </Box>
          </Box>

          {/* Filter tabs */}
          <Box sx={{
            display: 'flex', borderBottom: `2px solid ${DL.border}`,
            mb: '12px',
          }}>
            {[
              { value: 'todas',    label: 'Todas' },
              { value: 'pendiente',label: 'Con pendiente' },
              { value: 'nc',       label: 'Con N.C.' },
            ].map((t) => (
              <Box
                key={t.value}
                component="button"
                onClick={() => setDetTab(t.value)}
                sx={{
                  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                  fontSize: 11, fontWeight: detTab === t.value ? 500 : 500,
                  px: '14px', py: '6px',
                  borderBottom: `2px solid ${detTab === t.value ? DL.blue : 'transparent'}`,
                  mb: '-2px', border: 'none', background: 'transparent',
                  color: detTab === t.value ? DL.navy : DL.tS,
                  cursor: 'pointer', transition: 'all .14s',
                  '&:hover': { color: DL.tM },
                }}
              >
                {t.label}
              </Box>
            ))}
          </Box>

          <Paper elevation={1} sx={{ p: '14px 16px' }}>
            <DetTable search={search} />
          </Paper>
        </Box>

      </Box>
    </Box>
  );
}
