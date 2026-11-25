import { useState } from 'react';
import {
  Box, Typography, FormControl, Select, MenuItem, InputLabel,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import {
  FilterAlt as FilterIcon,
  RestartAlt as LimpiarIcon,
  Add as AddIcon,
  CalendarToday as CalIcon,
} from '@mui/icons-material';
import { DL } from '../theme';

const F  = "'Inter', ui-sans-serif, system-ui, sans-serif";
const F2 = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ─── Mock data ────────────────────────────────────────────────────────────────
const DIAS = ['1 Jul','2 Jul','3 Jul','4 Jul','5 Jul','6 Jul','7 Jul','8 Jul','9 Jul','10 Jul','11 Jul','12 Jul','13 Jul','14 Jul','15 Jul'];
const VENTAS_2024 = [9200,8800,10100,9600,7800,8200,7200,8100,7900,8400,10200,9800,9100,9600,900];
const VENTAS_2025 = [10800,10200,12100,11600,9200,9800,8800,10100,9900,10400,12200,11800,11100,11600,1200];
const VENTAS_2026 = [12300,11800,14200,15300,11500,13700,10800,11800,11200,12400,15800,14200,12600,13200,1900];

const CATS = ['Super Premium','Individual','Premium','Pasteles Personalizados','Bebida Caliente','Pan Grande','Gourmet','Porcion','Pan Menudo','Pasteles Restaurantes'];
const CATS_V = [48600,31000,24000,18400,10700,9800,8400,7000,6700,6600];

const TOP_CLIENTES  = ['Clientes Varios','Delivery Hero El Salvador','Alimentos Y Turismo S.A.','Specialty Foods S.A De...','Servamatic, S.A De C.V','Seguros E Inversiones S.A','P.C. Servicios, S.A De C.V','Foundever El Salvador, Li...','Inversiones Y Proyectos...','Guadalupe Lopez Abrego'];
const TOP_CLI_V     = [125600,19300,5500,1700,1300,598.5,575.5,476.2,455,360];
const TOP_PRODS     = ['Queso Fresa Mediano','Extremo Ferrero Mediano','Cafe Americano 8 Oz','Tiramisu Mediano','Frutti Tutti','Queso Fresa Grande','Caramelo Con Marshal...','Bomberry Mediano','Queso Fresa Pequeño','Caramelo Con Marshal...'];
const TOP_PRODS_V   = [10800,7500,6400,6400,6300,5600,5000,5000,4800,4800];

const EMPLEADOS = [
  { nombre:'Alejandra Beatriz Amaya Rivera',    ventas:6648,  costos:961,  margen:4928,  pct:81.6 },
  { nombre:'Alexandra Pamela Carcamo Fuentes',  ventas:193,   costos:53,   margen:117,   pct:71.8 },
  { nombre:'Alisson Lissette Avalos Hernandez', ventas:6974,  costos:1498, margen:4677,  pct:71.8 },
  { nombre:'Alvaro Antonio Cornejo Santos',     ventas:4191,  costos:1068, margen:2644,  pct:68.9 },
  { nombre:'Ana Delmi Hernandez Cruz',          ventas:2104,  costos:482,  margen:1381,  pct:76.8 },
  { nombre:'Andrea Jasmin Rivera Vasquez',      ventas:2333,  costos:491,  margen:1575,  pct:79.4 },
  { nombre:'Blanca Josefina Cruz Barrera',      ventas:5,     costos:1,    margen:3,     pct:84.1 },
  { nombre:'Brenda Jeannette Martinez Jovel',   ventas:2232,  costos:512,  margen:1464,  pct:76.5 },
  { nombre:'Cindy Marisol Hernandez Vasquez',   ventas:7494,  costos:1948, margen:4697,  pct:69.8 },
  { nombre:'Claudia Esmeralda Vasquez Antonio', ventas:11417, costos:2780, margen:7329,  pct:75.8 },
  { nombre:'Dora Johanna Orellana Vasquez',     ventas:2678,  costos:491,  margen:1881,  pct:79.3 },
  { nombre:'Eunice Abigail Henriquez Castro',   ventas:10278, costos:2421, margen:6679,  pct:76.6 },
  { nombre:'Evelyn Beatriz Esquivel Hernandez', ventas:1239,  costos:281,  margen:816,   pct:76.2 },
  { nombre:'Flor De Maria Flores Contreras',    ventas:2213,  costos:500,  margen:1460,  pct:76.5 },
  { nombre:'Gabriela Beatriz Pineda Jimenez',   ventas:4842,  costos:908,  margen:3380,  pct:78.7 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = n => n >= 1000 ? `$${(n/1000).toFixed(1)}K` : `$${n}`;
const fmtN = n => n.toLocaleString('en-US');

// ─── Componentes UI ───────────────────────────────────────────────────────────
function Card({ children, sx = {} }) {
  return (
    <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, p: '20px', ...sx }}>
      {children}
    </Box>
  );
}

function KpiCard({ label, actual, anterior, anoPasado, prefix = '$', pct = false }) {
  return (
    <Card sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '.08em', mb: '10px', fontFamily: F }}>
        {label}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', gap: '6px' }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, mb: '2px' }}>Período Actual</Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 500, color: DL.tH, fontFamily: F, lineHeight: 1.1 }}>
            {pct ? `${actual}%` : `${prefix}${fmtN(actual)}`}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Período Anterior</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tM, fontFamily: F }}>
            {pct ? `${anterior}%` : `${prefix}${fmtN(anterior)}`}
          </Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F, mt: '6px' }}>Período Año Pasado</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tM, fontFamily: F }}>
            {pct ? `${anoPasado}%` : `${prefix}${fmtN(anoPasado)}`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

function Btn({ children, icon, variant = 'default', onClick }) {
  const styles = {
    default: { bg: '#fff', color: DL.tM, border: `1px solid ${DL.border}` },
    primary: { bg: '#fff', color: DL.tH, border: `1px solid ` },
    blue:    { bg: '#fff', color: DL.blue, border: `1px solid ` },
  };
  const s = styles[variant];
  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: '6px',
      px: '14px', py: '7px', borderRadius: '8px', cursor: 'pointer',
      background: s.bg, border: s.border,
      '&:hover': { opacity: .88 }, transition: 'opacity .13s', flexShrink: 0,
    }}>
      {icon && <Box sx={{ color: s.color, display: 'flex' }}>{icon}</Box>}
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: s.color, fontFamily: F, whiteSpace: 'nowrap' }}>{children}</Typography>
    </Box>
  );
}

function FilterSelect({ label, options }) {
  const [v, setV] = useState('');
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <Select value={v} onChange={e => setV(e.target.value)} displayEmpty
        sx={{ fontSize: 12, borderRadius: '8px', fontFamily: F, background: '#fff' }}>
        <MenuItem value="" sx={{ fontSize: 12 }}>{label}</MenuItem>
        {options.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 12 }}>{o}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function ChartVentas() {
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, data: ['2024','2025','2026'], textStyle: { fontFamily: F, fontSize: 11 } },
    grid: { left: 50, right: 20, top: 16, bottom: 50 },
    xAxis: { type: 'category', data: DIAS, axisLabel: { fontFamily: F, fontSize: 10, color: DL.tS } },
    yAxis: { type: 'value', axisLabel: { fontFamily: F, fontSize: 10, color: DL.tS, formatter: v => `${v/1000}K` } },
    color: ['#d7d7d7','#b4b4b4',DL.blue],
    series: [
      { name:'2024', type:'bar', data: VENTAS_2024, barGap: '5%', itemStyle: { borderRadius:[3,3,0,0] } },
      { name:'2025', type:'bar', data: VENTAS_2025, itemStyle: { borderRadius:[3,3,0,0] } },
      { name:'2026', type:'bar', data: VENTAS_2026, itemStyle: { borderRadius:[3,3,0,0] } },
    ],
  };
  return <ReactECharts option={option} style={{ height: 240 }} />;
}

function ChartDonut() {
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { bottom: 0, data: ['CCF','FCF'], textStyle: { fontFamily: F, fontSize: 11 } },
    color: [DL.blue, '#313131'],
    series: [{
      type: 'pie', radius: ['52%','78%'], center: ['50%','46%'],
      label: { formatter: '{d}%', fontFamily: F, fontSize: 11 },
      data: [{ value: 4.9, name: 'CCF' }, { value: 95.1, name: 'FCF' }],
    }],
  };
  return <ReactECharts option={option} style={{ height: 260 }} />;
}

function ChartHBar({ title, categories, values, color = DL.blue }) {
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: p => `${p[0].name}: $${fmtN(p[0].value)}` },
    grid: { left: 150, right: 70, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { fontFamily: F, fontSize: 9, color: DL.tS, formatter: v => `${v/1000}K` }, name: 'Ventas ($)', nameLocation: 'end', nameTextStyle: { fontFamily: F, fontSize: 9, color: DL.tS } },
    yAxis: { type: 'category', data: [...categories].reverse(), axisLabel: { fontFamily: F, fontSize: 10, color: DL.tH, width: 140, overflow: 'truncate' } },
    color: [color],
    series: [{ type: 'bar', data: [...values].reverse(), barMaxWidth: 18, itemStyle: { borderRadius:[0,3,3,0] },
      label: { show: true, position: 'right', fontFamily: F, fontSize: 9, color: DL.tS, formatter: p => fmt(p.value) } }],
  };
  return (
    <Card sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: F, textAlign: 'center', mb: '4px' }}>{title}</Typography>
      <ReactECharts option={option} style={{ height: 280 }} />
    </Card>
  );
}

// ─── Tabla empleados ──────────────────────────────────────────────────────────
function TablaEmpleados() {
  const thSx = { padding: '10px 14px', fontFamily: F, fontSize: 9, fontWeight: 500, color: DL.tS, textAlign: 'left', background: DL.navy };
  const tdSx = { padding: '10px 14px', fontFamily: F, fontSize: 11, color: DL.tH, borderBottom: `1px solid ${DL.border}`, textAlign: 'left' };
  const totales = { ventas: 195279, costos: 40781, margen: 132139, pct: 4002.5 };
  return (
    <Card sx={{ mt: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '14px' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F }}>Tabla Resumen Financiero</Typography>
        <FilterSelect label="Empleado" options={EMPLEADOS.map(e => e.nombre)} />
      </Box>
      <Box sx={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${DL.border}`, overflowY: 'auto', maxHeight: 420 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thSx, borderRadius: '10px 0 0 0' }}>Empleado</th>
              <th style={thSx}>Ventas ($)</th>
              <th style={thSx}>Costos ($)</th>
              <th style={thSx}>Margen ($)</th>
              <th style={{ ...thSx, borderRadius: '0 10px 0 0' }}>Margen %</th>
            </tr>
          </thead>
          <tbody>
            {EMPLEADOS.map((e, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafbfe' }}
                onMouseEnter={el => el.currentTarget.style.background = 'rgba(84,126,105,.04)'}
                onMouseLeave={el => el.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfe'}>
                <td style={{ ...tdSx, fontWeight: 500 }}>{e.nombre}</td>
                <td style={tdSx}>$ {fmtN(e.ventas)}</td>
                <td style={tdSx}>$ {fmtN(e.costos)}</td>
                <td style={tdSx}>$ {fmtN(e.margen)}</td>
                <td style={tdSx}>{e.pct} %</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: DL.bg, borderBottom: '1px solid ' + DL.border }}>
              <td style={{ ...tdSx, color: '#fff', fontWeight: 500, borderBottom: 'none' }}>Total</td>
              <td style={{ ...tdSx, color: '#fff', fontWeight: 500, borderBottom: 'none' }}>$ {fmtN(totales.ventas)}</td>
              <td style={{ ...tdSx, color: '#fff', fontWeight: 500, borderBottom: 'none' }}>$ {fmtN(totales.costos)}</td>
              <td style={{ ...tdSx, color: '#fff', fontWeight: 500, borderBottom: 'none' }}>$ {fmtN(totales.margen)}</td>
              <td style={{ ...tdSx, color: '#fff', fontWeight: 500, borderBottom: 'none' }}>{totales.pct} %</td>
            </tr>
          </tfoot>
        </table>
      </Box>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResumenEjecutivo() {
  return (
    <Box sx={{ p: '20px 24px', background: DL.bg, minHeight: '100vh' }}>

      {/* Header */}
      <Typography sx={{ fontSize: 32, fontWeight: 300, color: DL.tH, fontFamily: "'Crimson Pro', Georgia, serif", lineHeight: 1, mb: '16px' }}>
        Dashboard Resumen Ejecutivo
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: '16px', p: '12px 16px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Rango de fechas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#efefef', borderRadius: '8px', px: '12px', py: '7px' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: F }}>01/07/2026</Typography>
            <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F }}>-</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: F }}>15/07/2026</Typography>
            <CalIcon sx={{ fontSize: 14, color: DL.blue, ml: '4px' }} />
          </Box>
          <FilterSelect label="Sucursal"  options={['Sucursal 1','Sucursal 2']} />
          <FilterSelect label="Categoría" options={CATS} />
          <FilterSelect label="Empleado"  options={EMPLEADOS.map(e => e.nombre)} />
          <Box sx={{ flex: 1 }} />
          <Btn icon={<AddIcon sx={{ fontSize: 15 }} />} variant="blue">Agregar</Btn>
          <Btn icon={<FilterIcon sx={{ fontSize: 15 }} />} variant="primary">Filtrar</Btn>
          <Btn icon={<LimpiarIcon sx={{ fontSize: 15 }} />} variant="primary">Limpiar</Btn>
        </Box>
      </Card>

      {/* KPIs */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '16px', flexWrap: 'wrap' }}>
        <KpiCard label="Ventas Totales"  actual={195279} anterior={207158} anoPasado={177575} />
        <KpiCard label="Costos Totales"  actual={40781}  anterior={41764}  anoPasado={34818} />
        <KpiCard label="Margen Total"    actual={132139} anterior={141701} anoPasado={122429} />
        <KpiCard label="Margen %"        actual={74.26}  anterior={75.61}  anoPasado={72.37}  pct />
      </Box>

      {/* Gráfico de ventas */}
      <Card sx={{ mb: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '4px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F }}>Ventas</Typography>
          <FormControl size="small">
            <Select defaultValue="dia" sx={{ fontSize: 12, borderRadius: '8px', fontFamily: F, minWidth: 100 }}>
              <MenuItem value="dia"    sx={{ fontSize: 12 }}>Día</MenuItem>
              <MenuItem value="semana" sx={{ fontSize: 12 }}>Semana</MenuItem>
              <MenuItem value="mes"    sx={{ fontSize: 12 }}>Mes</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ChartVentas />
      </Card>

      {/* Fila: Ticket + Donut + Categorías */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '16px', flexWrap: 'wrap' }}>
        {/* Ticket Promedio + Tickets */}
        <Card sx={{ minWidth: 220, maxWidth: 260 }}>
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: F }}>Ticket Promedio</Typography>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, mt: '10px', mb: '2px' }}>Período Actual</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 500, color: DL.tH, fontFamily: F }}>$11.24</Typography>
          <Box sx={{ display: 'flex', gap: '20px', mt: '6px' }}>
            <Box>
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Período Anterior</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>$10.88</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Período Año Pasado</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>$13.12</Typography>
            </Box>
          </Box>
          <Box sx={{ height: '1px', background: DL.border, my: '16px' }} />
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '.08em', fontFamily: F }}>Tickets</Typography>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontFamily: F, mt: '10px', mb: '2px' }}>Período Actual</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 500, color: DL.tH, fontFamily: F }}>17,370</Typography>
          <Box sx={{ display: 'flex', gap: '20px', mt: '6px' }}>
            <Box>
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Período Anterior</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>19,036</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: F }}>Período Año Pasado</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tM, fontFamily: F }}>13,538</Typography>
            </Box>
          </Box>
        </Card>

        {/* Donut */}
        <Card sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: F, textAlign: 'center', mb: '4px' }}>Tipos de Documento</Typography>
          <ChartDonut />
        </Card>

        {/* Categorías */}
        <Card sx={{ flex: 2, minWidth: 300 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.blue, fontFamily: F, textAlign: 'center', mb: '4px' }}>Categorías</Typography>
          <ReactECharts option={{
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: p => `${p[0].name}: ${fmt(p[0].value)}` },
            grid: { left: 140, right: 70, top: 8, bottom: 24 },
            xAxis: { type: 'value', axisLabel: { fontFamily: F, fontSize: 9, color: DL.tS, formatter: v => `${v/1000}K` } },
            yAxis: { type: 'category', data: [...CATS].reverse(), axisLabel: { fontFamily: F, fontSize: 10, color: DL.tH, width: 130, overflow: 'truncate' } },
            color: [DL.blue],
            series: [{ type: 'bar', data: [...CATS_V].reverse(), barMaxWidth: 14, itemStyle: { borderRadius:[0,3,3,0] },
              label: { show: true, position: 'right', fontFamily: F, fontSize: 9, color: DL.tS, formatter: p => fmt(p.value) } }],
          }} style={{ height: 280 }} />
        </Card>
      </Box>

      {/* Top ventas */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '16px' }}>
        <ChartHBar title="Top Ventas a Clientes"  categories={TOP_CLIENTES} values={TOP_CLI_V} />
        <ChartHBar title="Top Productos Vendidos" categories={TOP_PRODS}    values={TOP_PRODS_V} color="#547e69" />
      </Box>

      {/* Tabla */}
      <TablaEmpleados />

    </Box>
  );
}
