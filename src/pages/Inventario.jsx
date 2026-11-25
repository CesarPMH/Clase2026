// ─── Inventario Dashboard ────────────────────────────────────────────────────
// Design system: matches existing pages (CuentasCobrar, AgingSaldos, etc.)
// Data: fully hardcoded demo — Agropecuaria

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography,
  Table, TableHead, TableBody, TableRow, TableCell,
  Snackbar, Alert,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DL } from '../theme';
import KpiCard from '../components/common/KpiCard';
import AlertasSistema from '../components/common/AlertasSistema';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ─── HARDCODED DATA — Agropecuaria ───────────────────────────────────────────
const DATA = {
  fechaCorte:  '23-11-2025',
  healthScore: 52,
  kpis: {
    stockDollar:           1842650000,
    stockQty:              412800,
    skusDistintos:         634,
    quiebrePct:            57,
    ventaPerdida:          98420000,
    sobrestock:            134810000,
    inmovilizadoValor:     47300000,
    inmovilizadoUnidades:  18640,
    coberturaDias:         38,
    coberturaMeta:         30,
  },
  subScores: { cobertura: 68, sinQuiebres: 43, sinSobrestock: 61, rotacion: 84 },
  alertasUrgentes: [
    { producto: 'Semilla Girasol Confitero',  sku: 'AGR-1044-GIR', impacto: 14052300, almacen: 'Bodega Central'   },
    { producto: 'Vacuna Aftosa Bivalente',    sku: 'VET-2031-AFT', impacto: 10722200, almacen: 'Sucursal Norte'   },
    { producto: 'Insecticida Clorpirifós 48%',sku: 'AGQ-3015-CLO', impacto:  9662900, almacen: 'Punto de Venta S' },
  ],
  oportunidades: [
    { descripcion: 'Reasignar sobrestock Urea 46% → Sucursal Norte',    impacto: 38420000 },
    { descripcion: 'Liquidar Cal Agrícola próxima a vencimiento',        impacto:  8614000 },
    { descripcion: 'Devolución 22 SKUs inmovilizados 7–12 meses',        impacto: 19300000 },
  ],
  almacenes: [
    { nombre: 'Punto de Venta Sur', conStock: 35, quiebre: 66, sobrestock: 38420000, stockTotal:  421680000, skus: 184, ventaPerdida: 42100000, coberturaDias: 42, rotacion: 4.1,  estado: 'critico'     },
    { nombre: 'Bodega Central',     conStock: 14, quiebre: 13, sobrestock: 67177600, stockTotal: 1204830000, skus: 410, ventaPerdida: 38920000, coberturaDias: 31, rotacion: 8.7,  estado: 'ok'          },
    { nombre: 'Sucursal Norte',     conStock: 15, quiebre: 54, sobrestock: 10851100, stockTotal:  216140000, skus: 240, ventaPerdida: 17400000, coberturaDias: 28, rotacion: 11.2, estado: 'advertencia' },
  ],
  distribucion: [
    { almacen: 'Bodega Central',     pct: 65 },
    { almacen: 'Punto de Venta Sur', pct: 23 },
    { almacen: 'Sucursal Norte',     pct: 12 },
  ],
  articulos: [
    { sku: 'AGR-1001', nombre: 'Urea 46% Granulada',           stockQ: 48200, stockS: 421680000, entradasQ: 182400, salidasQ: 134200, alerta: false },
    { sku: 'AGR-1012', nombre: 'Semilla Soja RR 6200',         stockQ: 32400, stockS: 312840000, entradasQ:  84600, salidasQ:  52200, alerta: false },
    { sku: 'AGR-1021', nombre: 'NPK 15-15-15 Granulado',       stockQ: 29100, stockS: 218600000, entradasQ: 104200, salidasQ:  75100, alerta: false },
    { sku: 'AGQ-3001', nombre: 'Herbicida Glifosato 48%',      stockQ: 18400, stockS: 184200000, entradasQ:  62400, salidasQ:  44000, alerta: false },
    { sku: 'VET-2001', nombre: 'Vacuna Triple Bovina',         stockQ:  9800, stockS: 142300000, entradasQ:  38200, salidasQ:  28400, alerta: false },
    { sku: 'ALI-4001', nombre: 'Balanceado Bovino Inicio 40kg',stockQ: 21600, stockS: 128400000, entradasQ:  96400, salidasQ:  74800, alerta: true  },
    { sku: 'AGQ-3015', nombre: 'Insecticida Clorpirifós 48%',  stockQ:     0, stockS:         0, entradasQ:  14200, salidasQ:  14200, alerta: true  },
  ],
  // ── Productos por dimensión de salud ─────────────────────────────────────
  healthProducts: {
    cobertura: [
      { sku: 'AGR-1001', nombre: 'Urea 46% Granulada',            categoria: 'Fertilizantes', coberturaDias: 58, meta: 30, estado: 'ok'      },
      { sku: 'AGR-1012', nombre: 'Semilla Soja RR 6200',          categoria: 'Semillas',      coberturaDias: 44, meta: 30, estado: 'ok'      },
      { sku: 'AGR-1021', nombre: 'NPK 15-15-15 Granulado',        categoria: 'Fertilizantes', coberturaDias: 36, meta: 30, estado: 'ok'      },
      { sku: 'VET-2001', nombre: 'Vacuna Triple Bovina',          categoria: 'Veterinaria',   coberturaDias: 31, meta: 30, estado: 'ok'      },
      { sku: 'ALI-4001', nombre: 'Balanceado Bovino Inicio 40kg', categoria: 'Alim. Animal',  coberturaDias: 22, meta: 30, estado: 'riesgo'  },
      { sku: 'AGQ-3004', nombre: 'Fungicida Mancozeb 80%',        categoria: 'Agroquímicos',  coberturaDias: 14, meta: 30, estado: 'riesgo'  },
      { sku: 'AGR-1044', nombre: 'Semilla Girasol Confitero',     categoria: 'Semillas',      coberturaDias:  6, meta: 30, estado: 'critico' },
      { sku: 'AGQ-3015', nombre: 'Insecticida Clorpirifós 48%',   categoria: 'Agroquímicos',  coberturaDias:  0, meta: 30, estado: 'critico' },
    ],
    sinQuiebres: [
      { sku: 'AGQ-3015', nombre: 'Insecticida Clorpirifós 48%',  categoria: 'Agroquímicos',  sucursal: 'Pto. Venta Sur', stockQ:  0, quiebre: true,  diasSinStock: 21, coberturaDias:  0, sinStockEn: ['Pto. Venta Sur', 'Suc. Norte'] },
      { sku: 'VET-2031', nombre: 'Vacuna Aftosa Bivalente',      categoria: 'Veterinaria',   sucursal: 'Suc. Norte',     stockQ:  0, quiebre: true,  diasSinStock: 35, coberturaDias:  0, sinStockEn: ['Bodega Central', 'Suc. Norte'] },
      { sku: 'AGR-1044', nombre: 'Semilla Girasol Confitero',    categoria: 'Semillas',      sucursal: 'Bodega Central', stockQ:  0, quiebre: true,  diasSinStock:  8, coberturaDias:  0, sinStockEn: ['Bodega Central'] },
      { sku: 'AGQ-3008', nombre: 'Herbicida Atrazina 50% SC',    categoria: 'Agroquímicos',  sucursal: 'Pto. Venta Sur', stockQ:  5, quiebre: true,  diasSinStock: 12, coberturaDias:  1, sinStockEn: ['Pto. Venta Sur'] },
      { sku: 'VET-2019', nombre: 'Antiparasitario Ivermectina',  categoria: 'Veterinaria',   sucursal: 'Suc. Norte',     stockQ: 12, quiebre: true,  diasSinStock:  6, coberturaDias:  2, sinStockEn: ['Suc. Norte'] },
      { sku: 'AGR-1038', nombre: 'Semilla Maíz Híbrido DK7500', categoria: 'Semillas',      sucursal: 'Bodega Central', stockQ:  3, quiebre: true,  diasSinStock: 18, coberturaDias:  0, sinStockEn: ['Pto. Venta Sur', 'Bodega Central'] },
      { sku: 'ALI-4007', nombre: 'Suplemento Mineral Bovino',    categoria: 'Alim. Animal',  sucursal: 'Suc. Norte',     stockQ: 18, quiebre: true,  diasSinStock:  4, coberturaDias:  3, sinStockEn: ['Suc. Norte'] },
    ],
    sinSobrestock: [
      { sku: 'AGR-1001', nombre: 'Urea 46% Granulada',            categoria: 'Fertilizantes', sucursal: 'Bodega Central', stockQ: 48200, sobrestockVal: 38420000, sobrestockUds: 18400, coberturaDias: 58 },
      { sku: 'AGR-1031', nombre: 'Cal Agrícola Molida',           categoria: 'Fertilizantes', sucursal: 'Bodega Central', stockQ: 62100, sobrestockVal: 24810000, sobrestockUds: 31000, coberturaDias: 72 },
      { sku: 'AGQ-3001', nombre: 'Herbicida Glifosato 48%',       categoria: 'Agroquímicos',  sucursal: 'Pto. Venta Sur', stockQ: 18400, sobrestockVal: 18420000, sobrestockUds:  6800, coberturaDias: 48 },
      { sku: 'ALI-4001', nombre: 'Balanceado Bovino Inicio 40kg', categoria: 'Alim. Animal',  sucursal: 'Suc. Norte',     stockQ: 21600, sobrestockVal: 12480000, sobrestockUds:  4200, coberturaDias: 42 },
      { sku: 'AGR-1021', nombre: 'NPK 15-15-15 Granulado',        categoria: 'Fertilizantes', sucursal: 'Pto. Venta Sur', stockQ: 29100, sobrestockVal:  8800000, sobrestockUds:  3100, coberturaDias: 36 },
    ],
    sobrestock: [
      { sku:'AGR-1001', nombre:'Urea 46% Granulada',            categoria:'Fertilizantes', sucursal:'Bodega Central', stockQ:48200, sobrestockUds:18400, sobrestockVal:38420000, coberturaDias:58 },
      { sku:'AGR-1031', nombre:'Cal Agrícola Molida',           categoria:'Fertilizantes', sucursal:'Bodega Central', stockQ:62100, sobrestockUds:31000, sobrestockVal:24810000, coberturaDias:72 },
      { sku:'AGQ-3001', nombre:'Herbicida Glifosato 48%',       categoria:'Agroquímicos',  sucursal:'Pto. Venta Sur', stockQ:18400, sobrestockUds: 6800, sobrestockVal:18420000, coberturaDias:48 },
      { sku:'ALI-4001', nombre:'Balanceado Bovino Inicio 40kg', categoria:'Alim. Animal',  sucursal:'Suc. Norte',     stockQ:21600, sobrestockUds: 4200, sobrestockVal:12480000, coberturaDias:42 },
      { sku:'AGR-1021', nombre:'NPK 15-15-15 Granulado',        categoria:'Fertilizantes', sucursal:'Pto. Venta Sur', stockQ:29100, sobrestockUds: 3100, sobrestockVal: 8800000, coberturaDias:36 },
      { sku:'VET-2008', nombre:'Antibiótico Oxitetraciclina',   categoria:'Veterinaria',   sucursal:'Pto. Venta Sur', stockQ:  880, sobrestockUds:  320, sobrestockVal: 4160000, coberturaDias:38 },
    ],
    vencido: [
      { sku:'VET-2014', nombre:'Vacuna Brucelosis 10ml',        categoria:'Veterinaria',   sucursal:'Suc. Norte',     stockQ: 240, fechaVenc:'15/02/2026', diasVencido:74, val:3120000  },
      { sku:'AGQ-3022', nombre:'Fungicida Captan 50%',          categoria:'Agroquímicos',  sucursal:'Bodega Central', stockQ: 180, fechaVenc:'28/02/2026', diasVencido:61, val:2160000  },
      { sku:'ALI-4012', nombre:'Premezcla Vitamínica Aviar',    categoria:'Alim. Animal',  sucursal:'Pto. Venta Sur', stockQ:  90, fechaVenc:'10/03/2026', diasVencido:51, val: 990000  },
      { sku:'VET-2019', nombre:'Complejo B Inyectable 100ml',   categoria:'Veterinaria',   sucursal:'Bodega Central', stockQ: 320, fechaVenc:'20/03/2026', diasVencido:41, val:1920000  },
      { sku:'AGQ-3041', nombre:'Insecticida Endosulfán 35%',    categoria:'Agroquímicos',  sucursal:'Suc. Norte',     stockQ: 140, fechaVenc:'31/03/2026', diasVencido:30, val:1680000  },
      { sku:'VET-2033', nombre:'Oxitocina 10 UI 10ml',          categoria:'Veterinaria',   sucursal:'Pto. Venta Sur', stockQ: 200, fechaVenc:'05/04/2026', diasVencido:25, val: 840000  },
      { sku:'AGR-1055', nombre:'Semilla Sorgo Forrajero 10kg',  categoria:'Semillas',      sucursal:'Bodega Central', stockQ:  60, fechaVenc:'10/04/2026', diasVencido:20, val:1080000  },
    ],
    rotacion: [
      { sku: 'VET-2001', nombre: 'Vacuna Triple Bovina',          categoria: 'Veterinaria',   sucursal: 'Bodega Central', rotacion: 14.2, ventas30d: 4800, stockQ:  9800, coberturaDias: 12 },
      { sku: 'AGR-1012', nombre: 'Semilla Soja RR 6200',          categoria: 'Semillas',      sucursal: 'Bodega Central', rotacion: 12.4, ventas30d: 6200, stockQ: 32400, coberturaDias: 44 },
      { sku: 'AGQ-3001', nombre: 'Herbicida Glifosato 48%',       categoria: 'Agroquímicos',  sucursal: 'Pto. Venta Sur', rotacion: 11.1, ventas30d: 5100, stockQ: 18400, coberturaDias: 48 },
      { sku: 'ALI-4001', nombre: 'Balanceado Bovino Inicio 40kg', categoria: 'Alim. Animal',  sucursal: 'Suc. Norte',     rotacion: 10.8, ventas30d: 8400, stockQ: 21600, coberturaDias: 22 },
      { sku: 'AGR-1001', nombre: 'Urea 46% Granulada',            categoria: 'Fertilizantes', sucursal: 'Bodega Central', rotacion:  8.6, ventas30d: 9200, stockQ: 48200, coberturaDias: 58 },
      { sku: 'AGQ-3004', nombre: 'Fungicida Mancozeb 80%',        categoria: 'Agroquímicos',  sucursal: 'Suc. Norte',     rotacion:  6.2, ventas30d: 2100, stockQ:  8400, coberturaDias: 14 },
      { sku: 'VET-2008', nombre: 'Antibiótico Oxitetraciclina',   categoria: 'Veterinaria',   sucursal: 'Pto. Venta Sur', rotacion:  3.4, ventas30d:  640, stockQ:   880, coberturaDias: 38 },
      { sku: 'AGR-1031', nombre: 'Cal Agrícola Molida',           categoria: 'Fertilizantes', sucursal: 'Bodega Central', rotacion:  1.8, ventas30d: 1200, stockQ: 62100, coberturaDias: 72 },
    ],
  },
};

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
function fmtMoney(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + n.toLocaleString('es-CL');
}
function fmtQty(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return Math.round(n / 1e3).toLocaleString('es-CL') + 'K';
  return n.toLocaleString('es-CL');
}

// ─── DETALLE PRODUCTOS — tabla extendida ─────────────────────────────────────
const DETALLE_PRODS = [
  { id:'AGR-1001', producto:'Urea 46% Granulada',           estado:'Normal',   estadoVentas:'Activo',   proveedor:'AgroSeed',     almacen:'Bodega Central',  categoria:'Fertilizantes', uom:'kg',   existencia:48200, v3m:134200, v6m:241600, fechaUltimaCompra:'12/03/2026', cantUltimaCompra:60000, costoUnit:8750,  costoUCompra:8600,  costoTotal:421680000, diasInv:58, stockMin:10000, consumoPSem:5300, consumoPHist:4800 },
  { id:'AGR-1012', producto:'Semilla Soja RR 6200',         estado:'Normal',   estadoVentas:'Activo',   proveedor:'AgroSeed',     almacen:'Bodega Central',  categoria:'Semillas',      uom:'kg',   existencia:32400, v3m: 52200, v6m: 88400, fechaUltimaCompra:'28/02/2026', cantUltimaCompra:40000, costoUnit:9650,  costoUCompra:9500,  costoTotal:312840000, diasInv:44, stockMin: 8000, consumoPSem:1800, consumoPHist:1650 },
  { id:'AGR-1021', producto:'NPK 15-15-15 Granulado',       estado:'Normal',   estadoVentas:'Activo',   proveedor:'NutriCrop',    almacen:'Bodega Central',  categoria:'Fertilizantes', uom:'kg',   existencia:29100, v3m: 75100, v6m:138200, fechaUltimaCompra:'05/03/2026', cantUltimaCompra:35000, costoUnit:7510,  costoUCompra:7400,  costoTotal:218600000, diasInv:36, stockMin: 7000, consumoPSem:2500, consumoPHist:2300 },
  { id:'AGQ-3001', producto:'Herbicida Glifosato 48%',      estado:'Normal',   estadoVentas:'Activo',   proveedor:'MultiAgro',    almacen:'Pto. Venta Sur',  categoria:'Agroquímicos',  uom:'lt',   existencia:18400, v3m: 44000, v6m: 79200, fechaUltimaCompra:'18/03/2026', cantUltimaCompra:20000, costoUnit:10010, costoUCompra:9850,  costoTotal:184200000, diasInv:38, stockMin: 4000, consumoPSem:1500, consumoPHist:1380 },
  { id:'VET-2001', producto:'Vacuna Triple Bovina',         estado:'Normal',   estadoVentas:'Activo',   proveedor:'BioVet SA',    almacen:'Suc. Norte',      categoria:'Veterinaria',   uom:'dosis',existencia: 9800, v3m: 28400, v6m: 52100, fechaUltimaCompra:'22/03/2026', cantUltimaCompra:12000, costoUnit:14520, costoUCompra:14200, costoTotal:142300000, diasInv:31, stockMin: 2000, consumoPSem:  920, consumoPHist:  870 },
  { id:'ALI-4001', producto:'Balanceado Bovino Inicio 40kg',estado:'Bajo',     estadoVentas:'Alerta',   proveedor:'NutriCrop',    almacen:'Bodega Central',  categoria:'Alim. Animal',  uom:'kg',   existencia:21600, v3m: 74800, v6m:138000, fechaUltimaCompra:'01/04/2026', cantUltimaCompra:28000, costoUnit:5940,  costoUCompra:5850,  costoTotal:128400000, diasInv:22, stockMin: 5000, consumoPSem:2500, consumoPHist:2300 },
  { id:'AGQ-3015', producto:'Insecticida Clorpirifós 48%',  estado:'Crítico',  estadoVentas:'Quiebre',  proveedor:'MultiAgro',    almacen:'Pto. Venta Sur',  categoria:'Agroquímicos',  uom:'lt',   existencia:    0, v3m: 14200, v6m: 25400, fechaUltimaCompra:'10/01/2026', cantUltimaCompra: 8000, costoUnit:12300, costoUCompra:12100, costoTotal:       0, diasInv: 0, stockMin: 2000, consumoPSem:  480, consumoPHist:  420 },
  { id:'VET-2031', producto:'Vacuna Aftosa Bivalente',      estado:'Crítico',  estadoVentas:'Quiebre',  proveedor:'BioVet SA',    almacen:'Suc. Norte',      categoria:'Veterinaria',   uom:'dosis',existencia:    0, v3m: 10720, v6m: 19800, fechaUltimaCompra:'15/01/2026', cantUltimaCompra: 5000, costoUnit:21440, costoUCompra:21000, costoTotal:       0, diasInv: 0, stockMin: 1500, consumoPSem:  360, consumoPHist:  330 },
  { id:'AGR-1044', producto:'Semilla Girasol Confitero',    estado:'Crítico',  estadoVentas:'Quiebre',  proveedor:'AgroSeed',     almacen:'Bodega Central',  categoria:'Semillas',      uom:'kg',   existencia:  120, v3m: 14050, v6m: 26200, fechaUltimaCompra:'20/01/2026', cantUltimaCompra:10000, costoUnit:13200, costoUCompra:13000, costoTotal: 1584000, diasInv: 6, stockMin: 3000, consumoPSem:  470, consumoPHist:  440 },
];

// ─── ALL UNIQUE PRODUCT NAMES (for Producto filter dropdown) ─────────────────
const ALL_PRODUCTS = [...new Set([
  ...Object.values(DATA.healthProducts).flat().map(r => r.nombre),
  ...DETALLE_PRODS.map(r => r.producto),
])].sort();

// ─── KPI TREND HISTÓRICO (12 meses) ──────────────────────────────────────────
const TREND_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const KPI_TRENDS = {
  inventario: {
    label: 'Inventario ($B)',
    meta:   1700,
    color:  '#6c6c6c',
    unit:   'M',
    data:   [1420, 1480, 1520, 1560, 1610, 1640, 1680, 1700, 1750, 1800, 1820, 1843],
  },
  fillRate: {
    label: 'Fill Rate %',
    meta:   94,
    color:  '#547e69',
    unit:   '%',
    data:   [82, 83, 84, 85, 85, 85.5, 86, 86.5, 87, 86.5, 87, 88],
  },
  doh: {
    label: 'DOH (días)',
    meta:   30,
    color:  '#4d3f32',
    unit:   ' d',
    data:   [42, 40, 39, 38, 37, 36, 38, 39, 37, 36, 35, 34],
  },
  otif: {
    label: 'OTIF %',
    meta:   95,
    color:  '#16a34a',
    unit:   '%',
    data:   [78, 79, 81, 82, 83, 84, 83, 85, 86, 85, 87, 88],
  },
};

// ─── INVENTORY ALERTS (for AlertasSistema component) ─────────────────────────
const INV_ALERTS = [
  { tier: 'r', msg: `Quiebre de stock ${DATA.kpis.quiebrePct}% — ${fmtMoney(DATA.kpis.ventaPerdida)} en venta perdida estimada` },
  { tier: 'r', msg: `${DATA.alertasUrgentes[0].producto} — impacto ${fmtMoney(DATA.alertasUrgentes[0].impacto)} en ${DATA.alertasUrgentes[0].almacen}` },
  { tier: 'r', msg: `${DATA.alertasUrgentes[1].producto} — impacto ${fmtMoney(DATA.alertasUrgentes[1].impacto)} en ${DATA.alertasUrgentes[1].almacen}` },
  { tier: 'y', msg: `Sobrestock ${fmtMoney(DATA.kpis.sobrestock)} · Punto de Venta Sur supera límite — revisar reposición` },
  { tier: 'y', msg: `Cobertura ${DATA.kpis.coberturaDias} días vs meta ${DATA.kpis.coberturaMeta} días — exceso de inventario activo` },
  { tier: 'y', msg: `Stock inmovilizado +4 meses: ${fmtQty(DATA.kpis.inmovilizadoUnidades)} uds. · ${fmtMoney(DATA.kpis.inmovilizadoValor)} en riesgo de obsolescencia` },
  { tier: 'g', msg: `${DATA.oportunidades[0].descripcion} · potencial ${fmtMoney(DATA.oportunidades[0].impacto)}` },
  { tier: 'g', msg: `${DATA.oportunidades[2].descripcion} · potencial ${fmtMoney(DATA.oportunidades[2].impacto)}` },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ESTADO_COLORS = {
  ok:          { color: DL.green,  bg: DL.greenBg,  bd: DL.greenBd  },
  advertencia: { color: '#d97706', bg: '#fef3c7',   bd: '#fcd34d'   },
  critico:     { color: DL.red,    bg: DL.redBg,    bd: DL.redBd    },
};
const ESTADO_LABELS = { ok: '✓ OK', advertencia: '⚠ Atención', critico: '! Crítico' };

function scoreColor(s) {
  return s >= 80 ? DL.green : s >= 60 ? '#d97706' : DL.red;
}

const cardSx = {
  background: '#fff',
  borderRadius: '10px',
  border: `1px solid ${DL.border}`,
  boxShadow: DL.e1,
  overflow: 'hidden',
};

const thSx = {
  fontFamily: FONT, fontSize: 8, fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: DL.tS, py: '8px', px: '12px',
  background: '#f8fafc',
  borderBottom: `1px solid rgba(26,26,26,.12)`,
  whiteSpace: 'nowrap',
};
const tdSx = {
  fontFamily: FONT, fontSize: 10, fontWeight: 500,
  color: DL.tM, py: '10px', px: '12px',
  borderBottom: `1px solid rgba(26,26,26,.07)`,
};
// Wrapper that adds border + margin around any table
const tblWrap = {
  mx: '14px', mt: '10px', mb: '14px',
  border: `1px solid rgba(26,26,26,.12)`,
  borderRadius: '8px',
  overflow: 'hidden',
};

// SubScoreBar removed — replaced by ECharts bar chart inside the component


const BORDER  = 'rgba(26,26,26,.10)';
const BORDER2 = 'rgba(26,26,26,.15)';

// ─── Pagination bar ──────────────────────────────────────────────────────────
function PaginationBar({ page, total, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const from = page * perPage + 1;
  const to   = Math.min((page + 1) * perPage, total);
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px', px:'14px', py:'8px', borderTop:`1px solid ${BORDER}` }}>
      <Typography sx={{ fontSize:9, color:'#6a6a6a', fontFamily:FONT, mr:'4px' }}>
        {from}–{to} de {total}
      </Typography>
      {[
        { label:'«', target:0,           disabled: page === 0 },
        { label:'‹', target:page - 1,    disabled: page === 0 },
        { label:'›', target:page + 1,    disabled: page >= totalPages - 1 },
        { label:'»', target:totalPages-1,disabled: page >= totalPages - 1 },
      ].map(btn => (
        <Box
          key={btn.label}
          component="button"
          onClick={() => !btn.disabled && onChange(btn.target)}
          sx={{
            fontFamily:FONT, fontSize:11, fontWeight: 500,
            width:26, height:26, borderRadius:'6px', border:`1px solid ${BORDER2}`,
            background: btn.disabled ? '#f8fafc' : '#fff',
            color: btn.disabled ? '#d4d4d4' : '#3f3f3f',
            cursor: btn.disabled ? 'default' : 'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all .12s',
            '&:hover': btn.disabled ? {} : { borderColor:'#547e69', color:'#547e69' },
          }}
        >
          {btn.label}
        </Box>
      ))}
    </Box>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Inventario() {
  const navigate = useNavigate();
  const [healthSubTab,    setHealthSubTab]    = useState('sinQuiebres');
  const [healthCatFilter, setHealthCatFilter] = useState('Todos');
  const [selectedAlmacen, setSelectedAlmacen] = useState(null);
  const [almacenFilter,   setAlmacenFilter]   = useState('todos');
  const [catFilter,       setCatFilter]       = useState('todas');
  const [provFilter,      setProvFilter]      = useState('todos');
  const [prodFilter,      setProdFilter]      = useState('todos');
  const [snack,           setSnack]           = useState({ open: false, msg: '' });
  const [kpiTrendKey,     setKpiTrendKey]     = useState('inventario');
  const [rangeMonths,     setRangeMonths]     = useState(6);
  const [dohTab,          setDohTab]          = useState('doh');
  const [invFilter,       setInvFilter]       = useState('almacen');
  const [chartPage,       setChartPage]       = useState(0);
  const CHART_PER_PAGE = 4;
  const [detalleTab,      setDetalleTab]      = useState('producto');
  const [healthPage,      setHealthPage]      = useState(0);
  const [almacenPage,     setAlmacenPage]     = useState(0);
  const [detallePage,     setDetallePage]     = useState(0);
  const PER_PAGE = 5;

  const notify = (msg) => setSnack({ open: true, msg });

  // Reset pagination when global filters change
  useEffect(() => { setHealthPage(0); }, [almacenFilter, catFilter, provFilter, prodFilter]);

  // Filter articulos table when a warehouse row is clicked
  const articulosFiltrados = useMemo(() => {
    if (!selectedAlmacen) return DATA.articulos;
    // Map warehouse → slice indices (demo approximation)
    const sizes = { 'Tienda': 3, 'Centro Distribución': 5, 'E-Commerce/B2B': 2 };
    return DATA.articulos.slice(0, sizes[selectedAlmacen] ?? DATA.articulos.length);
  }, [selectedAlmacen]);

  const { kpis, subScores } = DATA;
  const scoreC = scoreColor(DATA.healthScore);

  // ── ECharts: stock distribution donut ─────────────────────────────────────
  const DONUT_COLORS = [DL.navy, DL.blue, '#b8b8b8'];
  const donutOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: 'rgba(26,26,26,.12)',
      borderWidth: 1,
      textStyle: { fontFamily: FONT, fontSize: 10, color: '#3f3f3f' },
      extraCssText: 'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:10px;padding:10px 14px',
      formatter: (p) => {
        const a = DATA.almacenes.find(x => x.nombre === p.name) || {};
        const ec = ESTADO_COLORS[a.estado] || ESTADO_COLORS.ok;
        return `
          <div style="font-family:'Inter',sans-serif;min-width:180px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(26,26,26,.08)">
              <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${p.color};flex-shrink:0"></span>
              <span style="font-size:11px;font-weight:500;color:#1b1b1b">${p.name}</span>
              <span style="margin-left:auto;font-size:11px;font-weight:500;color:${p.color}">${p.value}%</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px">
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">Stock $</div><div style="font-size:12px;font-weight:500;color:#1b1b1b">${a.stockTotal ? '$' + (a.stockTotal/1e9 >= 1 ? (a.stockTotal/1e9).toFixed(1)+'B' : (a.stockTotal/1e6).toFixed(0)+'M') : '—'}</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">SKUs</div><div style="font-size:12px;font-weight:500;color:#1b1b1b">${a.skus ?? '—'}</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">Quiebre %</div><div style="font-size:12px;font-weight:500;color:#dc2626">${a.quiebre ?? '—'}%</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">Cobertura</div><div style="font-size:12px;font-weight:500;color:#1b1b1b">${a.coberturaDias ?? '—'}d</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">Rotación</div><div style="font-size:12px;font-weight:500;color:#1b1b1b">${a.rotacion ? a.rotacion.toFixed(1)+'x' : '—'}</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.06em">Estado</div><div style="font-size:10px;font-weight:500;color:${ec.color}">${a.estado ? a.estado.charAt(0).toUpperCase()+a.estado.slice(1) : '—'}</div></div>
            </div>
          </div>`;
      },
    },
    color: DONUT_COLORS,
    series: [{
      type: 'pie',
      radius: ['52%', '78%'],
      center: ['50%', '50%'],
      data: DATA.distribucion.map(d => ({ value: d.pct, name: d.almacen })),
      label: { show: false },
      emphasis: { scale: true, scaleSize: 6, itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.15)' } },
    }],
  };



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <PageHeader title="Inventario" live>
        <MiniSelect
          label="Almacén"
          value={almacenFilter}
          onChange={v => { setAlmacenFilter(v); setHealthPage(0); }}
          options={[
            { value: 'todos',          label: 'Todos los almacenes' },
            { value: 'Bodega Central', label: 'Bodega Central'      },
            { value: 'Suc. Norte',     label: 'Suc. Norte'          },
            { value: 'Pto. Venta Sur', label: 'Pto. Venta Sur'      },
          ]}
          minWidth={160}
        />
        <MiniSelect
          label="Categoría"
          value={catFilter}
          onChange={v => { setCatFilter(v); setHealthPage(0); }}
          options={[
            { value: 'todas',         label: 'Todas las categorías' },
            { value: 'Fertilizantes', label: 'Fertilizantes'        },
            { value: 'Semillas',      label: 'Semillas'             },
            { value: 'Agroquímicos',  label: 'Agroquímicos'         },
            { value: 'Veterinaria',   label: 'Veterinaria'          },
            { value: 'Alim. Animal',  label: 'Alim. Animal'         },
          ]}
          minWidth={160}
        />
        <MiniSelect
          label="Proveedor"
          value={provFilter}
          onChange={v => { setProvFilter(v); setHealthPage(0); }}
          options={[
            { value: 'todos',           label: 'Todos los proveedores' },
            { value: 'AgroSeed',        label: 'AgroSeed'              },
            { value: 'NutriCrop',       label: 'NutriCrop'             },
            { value: 'MultiAgro',       label: 'MultiAgro'             },
            { value: 'BioVet SA',       label: 'BioVet SA'             },
            { value: 'NutriFeed Corp.', label: 'NutriFeed Corp.'       },
          ]}
          minWidth={170}
        />
        <MiniSelect
          label="Producto"
          value={prodFilter}
          onChange={v => { setProdFilter(v); setHealthPage(0); }}
          options={[
            { value: 'todos', label: 'Todos los productos' },
            ...ALL_PRODUCTS.map(n => ({ value: n, label: n })),
          ]}
          minWidth={190}
        />
      </PageHeader>

      {/* ── SCROLLABLE CONTENT ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
        {true && (<>
            {/* ── ROW 1: 8 KPI CARDS ────────────────────────────────────── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>

              {/* 1. Stock Total (en $) */}
              <KpiCard
                lbl="Stock Total (en $)"
                val={fmtMoney(kpis.stockDollar)}
                pct={108}
                metaLbl="Meta Stock"
                meta={fmtMoney(1700000000)}
                diff="+$1.9B"
                diffUp
                yoyPrev="$1.84B"
                yoyDelta="+12.6%"
                yoyUp
                onInfo={() => notify('Valor total del inventario en todos los almacenes activos.')}
              />

              {/* 2. Quiebre de Stock (SKUs) */}
              <KpiCard
                lbl="Quiebre de Stock"
                val={`${Math.round(kpis.quiebrePct / 100 * kpis.skusDistintos)} SKUs`}
                pct={43}
                metaLbl="Meta: 0 SKUs"
                meta="0 SKUs"
                diff="+18 SKUs"
                diffUp={false}
                yoyPrev="338 SKUs"
                yoyDelta="+8.3%"
                yoyUp={false}
                barSplit={43}
                valHighlight
                onInfo={() => notify('Cantidad de SKUs con quiebre de stock activo.')}
              />

              {/* 3. Sobre Stock (SKUs) */}
              <KpiCard
                lbl="Sobre Stock"
                val="127 SKUs"
                pct={74}
                metaLbl="Meta: 0 SKUs"
                meta="0 SKUs"
                diff="-12 SKUs"
                diffUp
                yoyPrev="139 SKUs"
                yoyDelta="-8.6%"
                yoyUp
                onInfo={() => notify('SKUs con stock superior a la cobertura objetivo de 30 días.')}
              />

              {/* 4. Fill Rate */}
              <KpiCard
                lbl="Fill Rate"
                val={`${KPI_TRENDS.fillRate.data[KPI_TRENDS.fillRate.data.length - 1]}%`}
                pct={Math.round(KPI_TRENDS.fillRate.data[KPI_TRENDS.fillRate.data.length - 1] / KPI_TRENDS.fillRate.meta * 100)}
                metaLbl="Meta"
                meta={`${KPI_TRENDS.fillRate.meta}%`}
                diff="+1% vs mes ant."
                diffUp
                yoyPrev="82%"
                yoyDelta="+6.1%"
                yoyUp
                onInfo={() => notify('% de órdenes completadas íntegramente desde stock disponible.')}
              />

              {/* 5. DOH */}
              <KpiCard
                lbl="DOH"
                val={`${KPI_TRENDS.doh.data[KPI_TRENDS.doh.data.length - 1]} días`}
                pct={Math.round(KPI_TRENDS.doh.meta / KPI_TRENDS.doh.data[KPI_TRENDS.doh.data.length - 1] * 100)}
                metaLbl="Meta"
                meta={`${KPI_TRENDS.doh.meta} días`}
                diff="-1d vs mes ant."
                diffUp
                yoyPrev="42 días"
                yoyDelta="-19%"
                yoyUp
                onInfo={() => notify('Days on Hand: días promedio de inventario disponible.')}
              />

              {/* 6. Rotación */}
              <KpiCard
                lbl="Rotación"
                val="8.0x"
                pct={89}
                metaLbl="Meta"
                meta="9.0x"
                diff="+0.3x vs mes ant."
                diffUp
                yoyPrev="6.8x"
                yoyDelta="+17.6%"
                yoyUp
                onInfo={() => notify('Número de veces que el inventario se renueva en el período.')}
              />

              {/* 7. OTIF */}
              <KpiCard
                lbl="OTIF"
                val={`${KPI_TRENDS.otif.data[KPI_TRENDS.otif.data.length - 1]}%`}
                pct={Math.round(KPI_TRENDS.otif.data[KPI_TRENDS.otif.data.length - 1] / KPI_TRENDS.otif.meta * 100)}
                metaLbl="Meta"
                meta={`${KPI_TRENDS.otif.meta}%`}
                diff="+1% vs mes ant."
                diffUp
                yoyPrev="78%"
                yoyDelta="+12.8%"
                yoyUp
                onInfo={() => notify('On Time In Full: entregas completas y a tiempo.')}
              />

              {/* 8. Vencidos (SKUs) */}
              <KpiCard
                lbl="Vencidos"
                val="23 SKUs"
                pct={54}
                metaLbl="Meta: 0 SKUs"
                meta="0 SKUs"
                diff="+5 SKUs"
                diffUp={false}
                yoyPrev="18 SKUs"
                yoyDelta="+27.8%"
                yoyUp={false}
                valHighlight
                onInfo={() => notify('SKUs con fecha de vencimiento expirada en inventario.')}
              />
            </Box>

            {/* ── ROW 2: EVOLUCIÓN DE KPIs + ALERTAS ───────────────────── */}
            {(() => {
              const trend     = KPI_TRENDS[kpiTrendKey];
              const isUp      = kpiTrendKey === 'fillRate' || kpiTrendKey === 'otif' || kpiTrendKey === 'inventario';
              const slicedM   = TREND_MONTHS.slice(-rangeMonths);
              const slicedD   = trend.data.slice(-rangeMonths);
              const belowMeta = trend.data[trend.data.length - 1] < trend.meta;
              const trendOpt  = {
                tooltip: {
                  trigger: 'axis',
                  backgroundColor: '#fff',
                  borderColor: 'rgba(26,26,26,.12)',
                  borderWidth: 1,
                  textStyle: { fontFamily: FONT, fontSize: 10 },
                  formatter: (p) => {
                    const d = p[0]; const m = p[1];
                    return `<b>${d.axisValue}</b><br/>${d.marker}${trend.label}: <b>${d.value}${trend.unit}</b>${m ? `<br/>${m.marker}Meta: <b>${m.value}${trend.unit}</b>` : ''}`;
                  },
                },
                legend: { show: false },
                grid: { top: 16, right: 20, bottom: 24, left: 52 },
                xAxis: {
                  type: 'category', data: slicedM,
                  axisLine: { show: false }, axisTick: { show: false },
                  axisLabel: { fontFamily: FONT, fontSize: 9, color: DL.tS },
                  splitLine: { show: false },
                },
                yAxis: {
                  type: 'value', min: 'dataMin',
                  axisLine: { show: false }, axisTick: { show: false },
                  axisLabel: { fontFamily: FONT, fontSize: 9, color: DL.tS, formatter: v => kpiTrendKey === 'inventario' ? `$${v}M` : `${v}${trend.unit}` },
                  splitLine: { lineStyle: { color: 'rgba(26,26,26,.06)', type: 'dashed' } },
                },
                series: [
                  {
                    name: trend.label,
                    type: 'line',
                    data: slicedD,
                    smooth: true,
                    symbol: 'circle', symbolSize: 6,
                    lineStyle: { color: trend.color, width: 2.5 },
                    itemStyle: { color: trend.color },
                    areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${trend.color}30` }, { offset: 1, color: `${trend.color}04` }] } },
                  },
                  {
                    name: 'Meta',
                    type: 'line',
                    data: Array(rangeMonths).fill(trend.meta),
                    smooth: false,
                    symbol: 'none',
                    lineStyle: { color: '#f97316', width: 1.5, type: 'dashed' },
                    itemStyle: { color: '#f97316' },
                  },
                ],
              };
              const KPI_BTNS = [
                { key: 'inventario', label: 'Inventario' },
                { key: 'fillRate',   label: 'Fill Rate'  },
                { key: 'doh',        label: 'DOH'        },
                { key: 'otif',       label: 'OTIF'       },
              ];
              const current = trend.data[trend.data.length - 1];
              const prev    = trend.data[trend.data.length - 2];
              const delta   = +(current - prev).toFixed(1);
              const deltaUp = isUp ? delta >= 0 : delta <= 0;
              const DOH_ABC = [
                { cat:'C (1190 SKUs)', doh:68, skus:1190, color:'#dc2626', metaColor:'#f97316' },
                { cat:'B (340 SKUs)',  doh:34, skus:340,  color:DL.blue,   metaColor:'#f97316' },
                { cat:'A (170 SKUs)',  doh:18, skus:170,  color:DL.blue,   metaColor:'#f97316' },
              ];
              const DOH_META = 30;
              const dohOption = {
                tooltip: {
                  trigger:'axis', axisPointer:{ type:'shadow' },
                  backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1,
                  textStyle:{ fontFamily:FONT, fontSize:11 },
                  formatter: p => `<b>${p[0].axisValue}</b><br/>${p[0].marker}DOH: <b>${p[0].value}d</b><br/>Meta: <b>${DOH_META}d</b>`,
                },
                grid:{ top:12, right:60, bottom:28, left:14, containLabel:true },
                xAxis:{
                  type:'value', max:80,
                  axisLine:{show:false}, axisTick:{show:false},
                  axisLabel:{ fontFamily:FONT, fontSize:10, color:DL.tS, formatter:v=>`${v}d` },
                  splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
                },
                yAxis:{
                  type:'category', data:DOH_ABC.map(d=>d.cat),
                  axisLine:{show:false}, axisTick:{show:false},
                  axisLabel:{ fontFamily:FONT, fontSize:11, color:DL.tM, fontWeight: 500 },
                },
                series:[{
                  type:'bar', barMaxWidth:46, barCategoryGap:'30%',
                  data: DOH_ABC.map(d=>({ value:d.doh, itemStyle:{ color: d.doh > DOH_META ? '#dc2626' : DL.blue, borderRadius:[0,5,5,0] } })),
                  label:{ show:true, position:'right', fontFamily:FONT, fontSize:12, fontWeight: 500, color:DL.tH, formatter:p=>`${p.value}d` },
                }],
              };

              return (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', alignItems: 'stretch' }}>
                  {/* KPI Trend chart */}
                  <Box sx={cardSx}>
                    {/* Header: título + slider */}
                    <Box sx={{ px: '16px', py: '10px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>Evolución de KPIs</Typography>
                        <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT, mt: '1px' }}>Tendencia mensual vs. meta</Typography>
                      </Box>
                      {/* Mini slider */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
                        <Box
                          component="input"
                          type="range"
                          min={1} max={12} step={1}
                          value={rangeMonths}
                          onChange={e => setRangeMonths(Number(e.target.value))}
                          sx={{
                            width: 90, height: 3, borderRadius: 2,
                            outline: 'none', border: 'none', cursor: 'pointer',
                            appearance: 'none', WebkitAppearance: 'none',
                            background: `linear-gradient(to right, ${DL.navy} 0%, ${DL.navy} ${((rangeMonths-1)/11)*100}%, #e3e3e3 ${((rangeMonths-1)/11)*100}%, #e3e3e3 100%)`,
                            '&::-webkit-slider-thumb': { WebkitAppearance: 'none', appearance: 'none', width: 14, height: 14, borderRadius: '50%', background: DL.navy, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,70,.2)' },
                            '&::-moz-range-thumb': { width: 14, height: 14, borderRadius: '50%', background: DL.navy, cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,70,.2)' },
                          }}
                        />
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', background: DL.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: 8, fontWeight: 500, color: '#fff', fontFamily: FONT, lineHeight: 1 }}>{rangeMonths}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* Tabs: Fill Rate / DOH / OTIF / Urgentes */}
                    <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '16px' }}>
                      {KPI_BTNS.map(b => (
                        <Box
                          key={b.key}
                          component="button"
                          onClick={() => setKpiTrendKey(b.key)}
                          sx={{
                            fontFamily: FONT, fontSize: 11, fontWeight: 500,
                            px: '16px', py: '10px', border: 'none', background: 'transparent',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            color: kpiTrendKey === b.key ? KPI_TRENDS[b.key].color : DL.tS,
                            borderBottom: kpiTrendKey === b.key ? `2px solid ${KPI_TRENDS[b.key].color}` : '2px solid transparent',
                            transition: 'all .14s',
                            '&:hover': { color: KPI_TRENDS[b.key].color },
                          }}
                        >
                          {b.label}
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ px: '8px', pb: '8px' }}>
                      <ReactECharts option={trendOpt} style={{ height: 240 }} />
                    </Box>
                  </Box>

                  {/* DOH / Inventario card — con tabs */}
                  {(() => {
                    // ── Inventario data by filter ──
                    const INV_DATA = {
                      almacen: [
                        { label:'Suc. Norte',     val:216140000,  color:DL.blue   },
                        { label:'Pto. Venta Sur', val:421680000,  color:DL.blue   },
                        { label:'Bodega Central', val:1204830000, color:DL.navy   },
                      ],
                      categoria: [
                        { label:'Esp. Menores',  val:82000000,  color:DL.blue  },
                        { label:'Alim. Animal',  val:128000000, color:DL.blue  },
                        { label:'Agroquímicos',  val:184000000, color:DL.blue  },
                        { label:'Semillas',      val:280000000, color:DL.blue  },
                        { label:'Veterinaria',   val:320000000, color:DL.blue  },
                        { label:'Fertilizantes', val:450000000, color:DL.navy  },
                      ],
                      proveedor: [
                        { label:'NutriCrop',    val:150000000, color:DL.blue  },
                        { label:'MultiAgro',    val:180000000, color:DL.blue  },
                        { label:'BioVet SA',    val:240000000, color:DL.blue  },
                        { label:'AgroSeed',     val:290000000, color:DL.blue  },
                        { label:'VetPharma GT', val:380000000, color:DL.navy  },
                      ],
                    };
                    const fmtB = v => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : `$${(v/1e6).toFixed(0)}M`;
                    const allInvRows = INV_DATA[invFilter];
                    const invRows    = allInvRows.slice(chartPage * CHART_PER_PAGE, (chartPage + 1) * CHART_PER_PAGE);
                    const invMax     = Math.max(...allInvRows.map(r => r.val));

                    const invOption = {
                      tooltip:{ trigger:'axis', axisPointer:{type:'shadow'}, backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1, textStyle:{fontFamily:FONT,fontSize:10}, formatter: p => `<b>${p[0].axisValue}</b><br/>${p[0].marker}<b>${fmtB(p[0].value)}</b>` },
                      grid:{ top:8, right:64, bottom:8, left:14, containLabel:true },
                      xAxis:{ type:'value', max: Math.max(...allInvRows.map(r=>r.val)), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{show:false}, splitLine:{show:false} },
                      yAxis:{ type:'category', data:invRows.map(r=>r.label), axisLine:{show:false}, axisTick:{show:false}, axisLabel:{fontFamily:FONT,fontSize:10,color:DL.tM,fontWeight: 500} },
                      series:[{
                        type:'bar', barMaxWidth:42, barCategoryGap:'28%',
                        data: invRows.map(r=>({ value:r.val, itemStyle:{ color: r.val === invMax ? DL.navy : DL.blue, borderRadius:[0,4,4,0] } })),
                        label:{ show:true, position:'right', fontFamily:FONT, fontSize:11, fontWeight: 500, color:DL.tH, formatter:p=>fmtB(p.value) },
                      }],
                    };

                    return (
                      <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
                        {/* Header */}
                        <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <Box>
                            <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>
                              {dohTab === 'doh' ? 'DOH por Categoría ABC' : 'Inventario'}
                            </Typography>
                            <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>
                              {dohTab === 'doh' ? 'Días inventario disponible por categoría' : 'Stock valorizado por dimensión'}
                            </Typography>
                          </Box>
                          {/* Filtro solo visible en tab Inventario */}
                          {dohTab === 'inventario' && (
                            <Box
                              component="select"
                              value={invFilter}
                              onChange={e => { setInvFilter(e.target.value); setChartPage(0); }}
                              sx={{
                                fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH,
                                border:`1px solid ${DL.border2}`, borderRadius:'7px',
                                px:'10px', py:'5px', pr:'28px',
                                outline:'none', cursor:'pointer', appearance:'none',
                                background:`#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E") no-repeat right 8px center`,
                                '&:hover':{ borderColor:DL.blue },
                              }}
                            >
                              <option value="almacen">Almacén</option>
                              <option value="categoria">Categoría</option>
                              <option value="proveedor">Proveedor</option>
                            </Box>
                          )}
                        </Box>

                        {/* Tabs */}
                        <Box sx={{ display:'flex', borderBottom:`1px solid ${DL.border}`, px:'16px' }}>
                          {[{k:'doh',label:'DOH'},{k:'inventario',label:'Inventario'}].map(t => (
                            <Box key={t.k} component="button" onClick={() => { setDohTab(t.k); setChartPage(0); }} sx={{
                              fontFamily:FONT, fontSize:11, fontWeight: 500,
                              px:'16px', py:'9px', border:'none', background:'transparent', cursor:'pointer',
                              color: dohTab===t.k ? DL.blue : DL.tS,
                              borderBottom: dohTab===t.k ? `2px solid ${DL.blue}` : '2px solid transparent',
                              transition:'all .14s', '&:hover':{ color:DL.blue },
                            }}>{t.label}</Box>
                          ))}
                        </Box>

                        {/* Chart */}
                        <Box sx={{ px:'12px', pt:'12px' }}>
                          {dohTab === 'doh' ? (
                            <ReactECharts key="doh" option={dohOption} style={{ width:'100%', height: DOH_ABC.length * 70 + 16 }} />
                          ) : (
                            <ReactECharts key="inv" option={invOption} style={{ width:'100%', height: CHART_PER_PAGE * 62 + 8 }} />
                          )}
                        </Box>

                        {/* Legend solo para DOH */}
                        {dohTab === 'inventario' && (
                          <PaginationBar page={chartPage} total={allInvRows.length} perPage={CHART_PER_PAGE} onChange={setChartPage} />
                        )}
                      </Box>
                    );
                  })()}
                </Box>
              );
            })()}

            {/* ── ROW 3: DETALLE (tabs Producto / Almacén) + DONUT ──────── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'stretch' }}>

              {/* DETALLE — tabs Producto / Almacén */}
              <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Score de Salud del Inventario</Typography>
                  <Box sx={{ px:'10px', py:'3px', borderRadius:'4px', background:'rgba(26,26,26,.07)', color:DL.navy, fontSize:9, fontWeight: 500, fontFamily:FONT }}>
                    {`${DATA.almacenes.length} almacenes`}
                  </Box>
                </Box>

                {/* Almacén table — directo, sin tabs */}
                {(()=>{ const _ = null; return (
                  <>
                    <Box sx={tblWrap}>
                    <Table size="small" sx={{ tableLayout:'fixed' }}>
                      <colgroup>
                        <col style={{ width:'16%' }}/><col style={{ width:'5%' }}/><col style={{ width:'12%' }}/>
                        <col style={{ width:'6%' }}/><col style={{ width:'9%' }}/><col style={{ width:'8%' }}/>
                        <col style={{ width:'12%' }}/><col style={{ width:'11%' }}/><col style={{ width:'8%' }}/>
                        <col style={{ width:'7%' }}/><col style={{ width:'10%' }}/>
                      </colgroup>
                      <TableHead>
                        <TableRow>
                          {['Almacén','%','Stock $','SKUs','Con Stock %','Quiebre %','V. Perdida $','Sobrestock $','Cobertura','Rotación','Estado'].map((h,hi) => (
                            <TableCell key={h} sx={{ ...thSx, textAlign:hi>0&&hi<10?'right':'left' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {DATA.almacenes.slice(detallePage * PER_PAGE, (detallePage + 1) * PER_PAGE).map((a, i) => {
                          const rowSx = { '& td': { py: '22px' } };
                          const ri = detallePage * PER_PAGE + i;
                          const ec = ESTADO_COLORS[a.estado]||ESTADO_COLORS.ok;
                          const rotC = a.rotacion>=10?DL.green:a.rotacion>=6?'#d97706':DL.red;
                          const cobC = a.coberturaDias<=30?DL.green:a.coberturaDias<=45?'#d97706':DL.red;
                          return (
                            <TableRow key={i} onClick={() => navigate(`/inventario/almacen/${encodeURIComponent(a.nombre)}`)} sx={{ cursor:'pointer', '&:hover':{ background:'rgba(84,126,105,.05)' }, ...rowSx }}>
                              <TableCell sx={{ ...tdSx, fontWeight: 500, color:DL.tH }}>
                                <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                  <Box sx={{ width:8,height:8,borderRadius:'2px',background:DONUT_COLORS[ri],flexShrink:0 }} />
                                  {a.nombre}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DONUT_COLORS[ri], fontFamily:FONT }}>{DATA.distribucion.find(d => d.almacen === a.nombre)?.pct??'—'}%</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{fmtMoney(a.stockTotal)}</TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tM, fontFamily:FONT }}>{a.skus}</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DL.green, fontFamily:FONT }}>{a.conStock}%</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT }}>{a.quiebre}%</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT }}>{fmtMoney(a.ventaPerdida)}</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:'#d97706', fontFamily:FONT }}>{fmtMoney(a.sobrestock)}</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:cobC, fontFamily:FONT }}>{a.coberturaDias}d</Typography></TableCell>
                              <TableCell sx={{ ...tdSx, textAlign:'right' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:rotC, fontFamily:FONT }}>{a.rotacion.toFixed(1)}x</Typography></TableCell>
                              <TableCell sx={tdSx}><Box sx={{ display:'inline-flex',px:'7px',py:'2px',borderRadius:'4px',background:ec.bg,color:ec.color,fontSize:8,fontWeight: 500,fontFamily:FONT,border:`1px solid ${ec.bd}` }}>{ESTADO_LABELS[a.estado]}</Box></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    </Box>
                    <PaginationBar page={detallePage} total={DATA.almacenes.length} perPage={PER_PAGE} onChange={setDetallePage} />
                  </>
                ); })()}
              </Box>

              {/* Alertas de Inventario — moved up */}
              <AlertasSistema alerts={INV_ALERTS} title="Alertas de Inventario" maxHeight={290} />
            </Box>

            {/* ── ROW 4: HEALTH SCORE + DONUT ──────────────────────────── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'stretch' }}>

              {/* Health Score — tabla con sub-tabs */}
              <Box sx={{ ...cardSx, display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <Box sx={{
                  px: '16px', py: '10px',
                  borderBottom: `1px solid ${DL.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>
                      Detalle
                    </Typography>
                  </Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <MiniSelect
                      value={healthCatFilter}
                      onChange={v => { setHealthCatFilter(v); setHealthPage(0); }}
                      options={['Todos', ...new Set((DATA.healthProducts[healthSubTab]||[]).map(r=>r.categoria))].map(c => ({ value:c, label:c }))}
                    />
                    <Box sx={{
                      px: '10px', py: '3px', borderRadius: '4px',
                      background: `${scoreC}1a`, color: scoreC,
                      fontSize: 9, fontWeight: 500, fontFamily: FONT,
                    }}>
                      {DATA.healthScore >= 80 ? 'SALUDABLE' : DATA.healthScore >= 60 ? 'ATENCIÓN' : 'CRÍTICO'}
                    </Box>
                  </Box>
                </Box>

                {/* Sub-tabs */}
                {(() => {
                  const HTABS = [
                    { id: 'sinQuiebres',   label: 'Sin Stock',   score: subScores.sinQuiebres,   count: DATA.healthProducts.sinQuiebres.length   },
                    { id: 'sinSobrestock', label: 'En Riesgo',   score: subScores.sinSobrestock,  count: DATA.healthProducts.sinSobrestock.length  },
                    { id: 'sobrestock',    label: 'Sobre Stock', score: 61,                       count: DATA.healthProducts.sobrestock.length     },
                    { id: 'vencido',       label: 'Vencido',     score: 23,                       count: DATA.healthProducts.vencido.length        },
                  ];

                  // Column definitions per tab
                  const COL_DEFS = {
                    cobertura: [
                      { label: 'SKU',        w: '12%', render: r => <Typography sx={{ fontFamily: "'Courier New',monospace", fontSize: 8.5, color: DL.tS }}>{r.sku}</Typography> },
                      { label: 'Nombre',     w: '30%', render: r => <Typography sx={{ fontFamily: FONT, fontSize: 10, fontWeight: 500, color: DL.tH }}>{r.nombre}</Typography> },
                      { label: 'Categoría',  w: '20%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(26,26,26,.07)', fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>{r.categoria}</Box> },
                      { label: 'Cobertura',  w: '14%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color: r.estado==='ok' ? DL.green : r.estado==='riesgo' ? '#d97706' : DL.red }}>{r.coberturaDias} días</Typography> },
                      { label: 'Meta',       w: '10%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:9, color:DL.tS }}>{r.meta} días</Typography> },
                      { label: 'Estado',     w: '14%', render: r => {
                        const map = { ok: { c: DL.green, bg: DL.greenBg, l: '✓ OK' }, riesgo: { c: '#d97706', bg: '#fef3c7', l: '⚠ Riesgo' }, critico: { c: DL.red, bg: DL.redBg, l: '! Crítico' } };
                        const e = map[r.estado] || map.ok;
                        return <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:e.bg, color:e.c, fontSize:8, fontWeight: 500, fontFamily:FONT }}>{e.l}</Box>;
                      }},
                    ],
                    sinQuiebres: [
                      { label: 'SKU',           w: '9%',  render: r => <Typography sx={{ fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{r.sku}</Typography> },
                      { label: 'Nombre',        w: '20%', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{r.nombre}</Typography> },
                      { label: 'Categoría',     w: '13%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(26,26,26,.07)', fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>{r.categoria}</Box> },
                      { label: 'Sucursal',      w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(84,126,105,.08)', fontSize:8.5, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{r.sucursal}</Box> },
                      { label: 'Stock Q',       w: '8%',  align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color: r.stockQ === 0 ? DL.red : '#d97706' }}>{r.stockQ === 0 ? '0' : fmtQty(r.stockQ)}</Typography> },
                      { label: 'Días sin stock',w: '10%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color: r.diasSinStock > 0 ? DL.red : DL.tS }}>{r.diasSinStock > 0 ? `${r.diasSinStock}d` : '—'}</Typography> },
                      { label: 'Sin stock en',  w: '18%', render: r => (
                        <Box sx={{ display:'flex', flexWrap:'wrap', gap:'3px' }}>
                          {(r.sinStockEn || []).map(s => (
                            <Box key={s} sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background: DL.redBg, color: DL.red, fontSize:8, fontWeight: 500, fontFamily:FONT, whiteSpace:'nowrap' }}>{s}</Box>
                          ))}
                        </Box>
                      )},
                      { label: 'Cobertura',     w: '8%',  align: 'right', render: r => { const c = r.coberturaDias === 0 ? DL.red : r.coberturaDias <= 5 ? '#d97706' : DL.green; return <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:c }}>{r.coberturaDias === 0 ? '0d' : `${r.coberturaDias}d`}</Typography>; }},
                    ],
                    sinSobrestock: [
                      { label: 'SKU',            w: '10%', render: r => <Typography sx={{ fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{r.sku}</Typography> },
                      { label: 'Nombre',         w: '20%', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{r.nombre}</Typography> },
                      { label: 'Categoría',      w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(26,26,26,.07)', fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>{r.categoria}</Box> },
                      { label: 'Sucursal',       w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(84,126,105,.08)', fontSize:8.5, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{r.sucursal}</Box> },
                      { label: 'Stock Q',        w: '10%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tM }}>{fmtQty(r.stockQ)}</Typography> },
                      { label: 'Sobrestock $',   w: '13%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.red }}>{fmtMoney(r.sobrestockVal)}</Typography> },
                      { label: 'Sobrestock Uds', w: '11%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:'#d97706' }}>{fmtQty(r.sobrestockUds)}</Typography> },
                      { label: 'Cobertura',      w: '8%',  align: 'right', render: r => { const c = r.coberturaDias > 60 ? DL.red : r.coberturaDias > 45 ? '#d97706' : DL.green; return <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:c }}>{r.coberturaDias}d</Typography>; }},
                    ],
                    sobrestock: [
                      { label: 'SKU',            w: '10%', render: r => <Typography sx={{ fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{r.sku}</Typography> },
                      { label: 'Nombre',         w: '22%', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{r.nombre}</Typography> },
                      { label: 'Categoría',      w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(26,26,26,.07)', fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>{r.categoria}</Box> },
                      { label: 'Sucursal',       w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(84,126,105,.08)', fontSize:8.5, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{r.sucursal}</Box> },
                      { label: 'Stock Q',        w: '10%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tM }}>{fmtQty(r.stockQ)}</Typography> },
                      { label: 'Sobrestock Uds', w: '11%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:'#d97706' }}>{fmtQty(r.sobrestockUds)}</Typography> },
                      { label: 'Sobrestock $',   w: '11%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.red }}>{fmtMoney(r.sobrestockVal)}</Typography> },
                      { label: 'Cobertura',      w: '8%',  align: 'right', render: r => { const c = r.coberturaDias > 60 ? DL.red : r.coberturaDias > 45 ? '#d97706' : DL.green; return <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:c }}>{r.coberturaDias}d</Typography>; }},
                    ],
                    vencido: [
                      { label: 'SKU',            w: '10%', render: r => <Typography sx={{ fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{r.sku}</Typography> },
                      { label: 'Nombre',         w: '24%', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{r.nombre}</Typography> },
                      { label: 'Categoría',      w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(26,26,26,.07)', fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>{r.categoria}</Box> },
                      { label: 'Sucursal',       w: '14%', render: r => <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:'rgba(84,126,105,.08)', fontSize:8.5, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{r.sucursal}</Box> },
                      { label: 'Stock Q',        w: '9%',  align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.red }}>{r.stockQ}</Typography> },
                      { label: 'Fecha venc.',    w: '10%', render: r => <Typography sx={{ fontFamily:FONT, fontSize:9, color:DL.red, fontWeight: 500 }}>{r.fechaVenc}</Typography> },
                      { label: 'Días vencido',   w: '10%', align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color: r.diasVencido>60?DL.red:r.diasVencido>30?'#d97706':'#d97706' }}>{r.diasVencido}d</Typography> },
                      { label: 'Valor en riesgo',w: '9%',  align: 'right', render: r => <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.red }}>{fmtMoney(r.val)}</Typography> },
                    ],
                  };

                  const cols       = COL_DEFS[healthSubTab] || [];
                  const baseRows   = DATA.healthProducts[healthSubTab] || [];
                  const healthCats = ['Todos', ...new Set(baseRows.map(r => r.categoria))];
                  const allRows = (() => {
                    let rows = baseRows;
                    // local card-level category filter
                    if (healthCatFilter !== 'Todos')  rows = rows.filter(r => r.categoria === healthCatFilter);
                    // global header filters
                    if (catFilter    !== 'todas') rows = rows.filter(r => r.categoria === catFilter);
                    if (almacenFilter !== 'todos') rows = rows.filter(r => r.sucursal  === almacenFilter);
                    if (prodFilter   !== 'todos') rows = rows.filter(r => r.nombre    === prodFilter);
                    if (provFilter   !== 'todos') rows = rows.filter(r => {
                      const dp = DETALLE_PRODS.find(p => p.id === r.sku);
                      return dp ? dp.proveedor === provFilter : false;
                    });
                    return rows;
                  })();
                  const rows = allRows.slice(healthPage * PER_PAGE, (healthPage + 1) * PER_PAGE);

                  return (
                    <>
                      {/* Tab buttons */}
                      <Box sx={{ display: 'flex', gap: 0, borderBottom: `1px solid ${DL.border}`, px: '14px', flexShrink: 0 }}>
                        {HTABS.map(t => {
                          const sc = t.id === 'sobrestock' ? '#d97706' : t.id === 'vencido' ? DL.red : scoreColor(t.score);
                          const active = healthSubTab === t.id;
                          return (
                            <Box
                              key={t.id}
                              component="button"
                              onClick={() => { setHealthSubTab(t.id); setHealthPage(0); setHealthCatFilter('Todos'); }}
                              sx={{
                                fontFamily: FONT, fontSize: 10, fontWeight: 500,
                                px: '12px', py: '9px', border: 'none', cursor: 'pointer',
                                background: 'transparent',
                                color: active ? DL.navy : DL.tS,
                                borderBottom: active ? `2px solid ${DL.blue}` : '2px solid transparent',
                                transition: 'all .14s', whiteSpace: 'nowrap',
                                display: 'flex', alignItems: 'center', gap: '6px',
                                '&:hover': { color: DL.navy },
                              }}
                            >
                              {t.label}
                              <Box sx={{
                                px: '5px', py: '1px', borderRadius: '4px',
                                background: `${sc}1a`, color: sc,
                                fontSize: 8, fontWeight: 500,
                              }}>
                                {t.count ?? t.score}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Wide unified table — all 20 product columns */}
                      <Box sx={{ mx:'14px', mt:'10px', mb:'4px', border:`1px solid rgba(26,26,26,.12)`, borderRadius:'8px', overflow:'hidden', flex:1 }}>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ tableLayout: 'fixed', minWidth: 2400 }}>
                          <colgroup>
                            <col style={{ width:100 }}/><col style={{ width:220 }}/><col style={{ width:100 }}/>
                            <col style={{ width:110 }}/><col style={{ width:130 }}/><col style={{ width:140 }}/>
                            <col style={{ width:120 }}/><col style={{ width:75  }}/><col style={{ width:110 }}/>
                            <col style={{ width:130 }}/><col style={{ width:130 }}/><col style={{ width:140 }}/>
                            <col style={{ width:130 }}/><col style={{ width:115 }}/><col style={{ width:115 }}/>
                            <col style={{ width:110 }}/><col style={{ width:105 }}/><col style={{ width:110 }}/>
                            <col style={{ width:140 }}/><col style={{ width:140 }}/>
                          </colgroup>
                          <TableHead>
                            <TableRow>
                              {['ID','Producto','Estado','Estado ventas','Proveedor','Almacén','Categoría','Uom','Existencia (q)',
                                'Venta últ. 3m','Venta últ. 6m','Fecha últ. compra','Cant. últ. compra',
                                'Costo unitario','Costo u. compra','Costo total',
                                'Días de inv.','Stock mínimo','Consumo prom. sem.','Consumo prom. hist.'].map(h => (
                                <TableCell key={h} sx={{ ...thSx, whiteSpace:'nowrap', px:'14px', py:'9px' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rows.map((r, i) => {
                              const dp = DETALLE_PRODS.find(p => p.id === r.sku) || {};
                              const estC = { Normal:{bg:DL.greenBg,tx:DL.green}, Bajo:{bg:DL.yellowBg,tx:'#a16207'}, Crítico:{bg:DL.redBg,tx:DL.red} };
                              const venC = { Activo:{bg:DL.greenBg,tx:DL.green}, Alerta:{bg:DL.yellowBg,tx:'#a16207'}, Quiebre:{bg:DL.redBg,tx:DL.red} };
                              const estado      = dp.estado       || (r.stockQ === 0 ? 'Crítico' : r.stockQ <= 10 ? 'Bajo' : 'Normal');
                              const estadoV     = dp.estadoVentas || (r.stockQ === 0 ? 'Quiebre' : 'Activo');
                              const ec = estC[estado] || estC.Normal;
                              const vc = venC[estadoV] || venC.Activo;
                              const chip = (txt,c) => <Box sx={{ display:'inline-flex',px:'6px',py:'1px',borderRadius:'4px',background:c.bg,border:`1px solid ${c.tx}30`}}><Typography sx={{fontSize:8,fontWeight: 500,color:c.tx,fontFamily:FONT}}>{txt}</Typography></Box>;
                              const existencia  = r.stockQ !== undefined ? r.stockQ : (dp.existencia ?? '—');
                              const diasInv     = r.coberturaDias !== undefined ? r.coberturaDias : (dp.diasInv ?? '—');
                              return (
                                <TableRow key={i} onClick={() => navigate(`/inventario/producto/${r.sku}`)} sx={{ cursor:'pointer', '&:hover':{ background:'rgba(84,126,105,.05)' } }}>
                                  <TableCell sx={{ ...tdSx, fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{r.sku}</TableCell>
                                  <TableCell sx={{ ...tdSx, fontWeight: 500, color:DL.tH }}>{r.nombre}</TableCell>
                                  <TableCell sx={tdSx}>{chip(estado, ec)}</TableCell>
                                  <TableCell sx={tdSx}>{chip(estadoV, vc)}</TableCell>
                                  <TableCell sx={{ ...tdSx, color:DL.tM }}>{dp.proveedor || '—'}</TableCell>
                                  <TableCell sx={tdSx}><Box sx={{ display:'inline-flex',px:'6px',py:'1px',borderRadius:'4px',background:'rgba(84,126,105,.08)'}}><Typography sx={{fontSize:8.5,fontWeight: 500,color:DL.blue,fontFamily:FONT}}>{r.sucursal || dp.almacen || '—'}</Typography></Box></TableCell>
                                  <TableCell sx={tdSx}><Box sx={{ display:'inline-flex',px:'6px',py:'1px',borderRadius:'4px',background:'rgba(26,26,26,.07)'}}><Typography sx={{fontSize:8.5,fontWeight: 500,color:DL.navy,fontFamily:FONT}}>{r.categoria}</Typography></Box></TableCell>
                                  <TableCell sx={{ ...tdSx, color:DL.tM }}>{dp.uom || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color: existencia===0?DL.red:DL.tH }}>{typeof existencia==='number'?existencia.toLocaleString():existencia}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.v3m?.toLocaleString() || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.v6m?.toLocaleString() || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, color:DL.tS }}>{dp.fechaUltimaCompra || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.cantUltimaCompra?.toLocaleString() || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{dp.costoUnit ? `$${dp.costoUnit.toLocaleString()}` : '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.costoUCompra ? `$${dp.costoUCompra.toLocaleString()}` : '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{dp.costoTotal ? fmtMoney(dp.costoTotal) : '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color: diasInv===0?DL.red:typeof diasInv==='number'&&diasInv<30?'#d97706':DL.green }}>{typeof diasInv==='number'?`${diasInv}d`:diasInv}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.stockMin?.toLocaleString() || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.consumoPSem?.toLocaleString() || '—'}</TableCell>
                                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{dp.consumoPHist?.toLocaleString() || '—'}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Box>{/* overflowX */}
                      </Box>{/* border wrapper */}
                      <PaginationBar page={healthPage} total={allRows.length} perPage={PER_PAGE} onChange={setHealthPage} />
                    </>
                  );
                })()}
              </Box>

              {/* Donut chart — moved down */}
              <Box sx={{ ...cardSx, overflow: 'visible', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}`, borderRadius: '10px 10px 0 0', background: '#fff' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>
                    Distribución por Almacén
                  </Typography>
                  <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT, mt: '1px' }}>
                    Hover sobre un segmento para ver detalle
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '16px' }}>
                  <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                    <ReactECharts option={donutOption} style={{ width: 200, height: 200 }} />
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                      <Typography sx={{ fontSize: 7, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: FONT }}>Total</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: DL.tH, lineHeight: 1.1, fontFamily: FONT }}>{fmtMoney(DATA.kpis.stockDollar)}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

            </Box>


          </>
        )}
      </Box>

      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ fontFamily: FONT, fontSize: 12, fontWeight: 500 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
