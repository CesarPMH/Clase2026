// ─── InventarioProducto — Detalle de un Producto ─────────────────────────────
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography,
  Table, TableHead, TableBody, TableRow, TableCell,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DL } from '../theme';
import KpiCard from '../components/common/KpiCard';
import PageHeader from '../components/common/PageHeader';
import AlertasSistema from '../components/common/AlertasSistema';

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

function fmtMoney(n) {
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + n.toLocaleString('es-CL');
}

const cardSx = {
  background:'#fff', borderRadius:'10px',
  border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden',
};
const thSx = {
  fontFamily:FONT, fontSize:8, fontWeight: 500,
  textTransform:'uppercase', letterSpacing:'0.07em',
  color:DL.tS, py:'8px', px:'12px',
  background:'#f8fafc', borderBottom:`1px solid rgba(26,26,26,.12)`,
  whiteSpace:'nowrap',
};
const tdSx = {
  fontFamily:FONT, fontSize:10, fontWeight:500,
  color:DL.tM, py:'10px', px:'12px',
  borderBottom:`1px solid rgba(26,26,26,.07)`,
};

// ─── MASTER DATA ─────────────────────────────────────────────────────────────
const PRODUCTOS_DATA = {
  'AGR-1001': {
    nombre:        'Urea 46% Granulada',
    proveedor:     'AgroSeed',
    categoria:     'Fertilizantes',
    uom:           'kg',
    estado:        'Normal',
    estadoVentas:  'Activo',
    existencia:    48200,
    stockMin:      10000,
    costoUnit:     8750,
    costoUCompra:  8600,
    costoTotal:    421680000,
    diasInv:       58,
    consumoSem:    5300,
    consumoHist:   4800,
    v3m:           134200,
    v6m:           241600,
    fechaUCompra:  '12/03/2026',
    cantUCompra:   60000,
    leadTimeDias:  14,
    puntoPedido:   74200,
    cantPedido:    60000,
    ubicaciones: [
      { almacen:'Bodega Central',    stock:36400, pct:75, doh:48, estado:'Normal'  },
      { almacen:'Sucursal Norte',    stock: 8200, pct:17, doh:32, estado:'Normal'  },
      { almacen:'Punto de Venta Sur',stock: 3600, pct: 8, doh:18, estado:'Bajo'    },
    ],
    trend6m: {
      meses:  ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [39400, 42100, 56800, 52300, 49100, 48200],
      entradas:[18000, 60000,  4000,  0,    0,    0],
      salidas: [18000, 44900, 14100,10800, 9800, 6200],
    },
    alerts: [
      { tier:'y', msg:'DOH 58d supera meta (30d) en 28 días. Revisar ritmo de reposición' },
      { tier:'y', msg:'Sobrestock estimado: 18,400 uds · $160.9M inmovilizados' },
      { tier:'g', msg:'Rotación 8.6x dentro del rango objetivo (meta 9.0x)' },
      { tier:'g', msg:'Proveedor AgroSeed — lead time 14 días · punto de pedido 74,200 uds' },
    ],
  },
  'AGR-1012': {
    nombre:       'Semilla Soja RR 6200',
    proveedor:    'AgroSeed',
    categoria:    'Semillas',
    uom:          'kg',
    estado:       'Normal',
    estadoVentas: 'Activo',
    existencia:   32400,
    stockMin:     8000,
    costoUnit:    9650,
    costoUCompra: 9500,
    costoTotal:   312840000,
    diasInv:      44,
    consumoSem:   1800,
    consumoHist:  1650,
    v3m:          52200,
    v6m:          88400,
    fechaUCompra: '28/02/2026',
    cantUCompra:  40000,
    leadTimeDias: 21,
    puntoPedido:  28000,
    cantPedido:   40000,
    ubicaciones: [
      { almacen:'Bodega Central',    stock:28200, pct:87, doh:44, estado:'Normal' },
      { almacen:'Sucursal Norte',    stock: 2800, pct: 9, doh:18, estado:'Bajo'   },
      { almacen:'Punto de Venta Sur',stock: 1400, pct: 4, doh:12, estado:'Bajo'   },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [22100, 18400, 28900, 34200, 33100, 32400],
      entradas:[0,    40000,  6200,  2800,  0,     0],
      salidas: [6200,  6800,  8400,  7200,  6800,  4900],
    },
    alerts: [
      { tier:'g', msg:'Rotación 12.4x — el producto de mayor rotación del almacén' },
      { tier:'y', msg:'DOH 44d, sobre meta. Stock actual supera cobertura óptima de 30d' },
      { tier:'g', msg:'Fill Rate 100% en los últimos 3 meses — sin quiebre registrado' },
    ],
  },
  'AGR-1021': {
    nombre:       'NPK 15-15-15 Granulado',
    proveedor:    'NutriCrop',
    categoria:    'Fertilizantes',
    uom:          'kg',
    estado:       'Normal',
    estadoVentas: 'Activo',
    existencia:   29100,
    stockMin:     7000,
    costoUnit:    7510,
    costoUCompra: 7400,
    costoTotal:   218600000,
    diasInv:      36,
    consumoSem:   2500,
    consumoHist:  2300,
    v3m:          75100,
    v6m:          138200,
    fechaUCompra: '05/03/2026',
    cantUCompra:  35000,
    leadTimeDias: 10,
    puntoPedido:  28000,
    cantPedido:   35000,
    ubicaciones: [
      { almacen:'Bodega Central',    stock:16700, pct:57, doh:36, estado:'Normal' },
      { almacen:'Punto de Venta Sur',stock: 9400, pct:32, doh:36, estado:'Normal' },
      { almacen:'Sucursal Norte',    stock: 3000, pct:10, doh:22, estado:'Bajo'   },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [18200, 21400, 34800, 31200, 30400, 29100],
      entradas:[7000, 35000,  0,     0,     0,     0],
      salidas: [6200,  9800, 10600,  9200,  8400,  7500],
    },
    alerts: [
      { tier:'g', msg:'Stock dentro de rango normal. DOH 36d ligeramente sobre meta (30d)' },
      { tier:'g', msg:'Lead time corto (10d) con NutriCrop permite reposición ágil' },
    ],
  },
  'AGQ-3001': {
    nombre:       'Herbicida Glifosato 48%',
    proveedor:    'MultiAgro',
    categoria:    'Agroquímicos',
    uom:          'lt',
    estado:       'Normal',
    estadoVentas: 'Activo',
    existencia:   18400,
    stockMin:     4000,
    costoUnit:    10010,
    costoUCompra: 9850,
    costoTotal:   184200000,
    diasInv:      38,
    consumoSem:   1500,
    consumoHist:  1380,
    v3m:          44000,
    v6m:          79200,
    fechaUCompra: '18/03/2026',
    cantUCompra:  20000,
    leadTimeDias: 12,
    puntoPedido:  18000,
    cantPedido:   20000,
    ubicaciones: [
      { almacen:'Punto de Venta Sur',stock:14200, pct:77, doh:38, estado:'Normal' },
      { almacen:'Bodega Central',    stock: 2800, pct:15, doh:24, estado:'Bajo'   },
      { almacen:'Sucursal Norte',    stock: 1400, pct: 8, doh:14, estado:'Bajo'   },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [12400, 9800, 18200, 16800, 19200, 18400],
      entradas:[0,    20000,  0,    6000,  0,     0],
      salidas: [4200,  5800,  6200,  7400,  5800,  5200],
    },
    alerts: [
      { tier:'g', msg:'Rotación 11.1x — alto rendimiento. DOH 38d ligeramente sobre meta' },
      { tier:'y', msg:'Punto de venta Sur concentra 77% del stock. Considerar distribución' },
    ],
  },
  'VET-2001': {
    nombre:       'Vacuna Triple Bovina',
    proveedor:    'BioVet SA',
    categoria:    'Veterinaria',
    uom:          'dosis',
    estado:       'Normal',
    estadoVentas: 'Activo',
    existencia:   9800,
    stockMin:     2000,
    costoUnit:    14520,
    costoUCompra: 14200,
    costoTotal:   142300000,
    diasInv:      31,
    consumoSem:   920,
    consumoHist:  870,
    v3m:          28400,
    v6m:          52100,
    fechaUCompra: '22/03/2026',
    cantUCompra:  12000,
    leadTimeDias: 30,
    puntoPedido:  14000,
    cantPedido:   12000,
    ubicaciones: [
      { almacen:'Sucursal Norte',    stock: 6200, pct:63, doh:31, estado:'Normal' },
      { almacen:'Bodega Central',    stock: 2400, pct:25, doh:28, estado:'Normal' },
      { almacen:'Punto de Venta Sur',stock: 1200, pct:12, doh:22, estado:'Bajo'   },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [7200, 6100, 11800, 10400, 10100, 9800],
      entradas:[0,  12000,  0,     0,     0,    0],
      salidas: [2800, 4200,  3600,  3600,  3800, 3400],
    },
    alerts: [
      { tier:'y', msg:'Lead time 30d con BioVet SA — pedido recomendado antes de llegar a punto (14,000)' },
      { tier:'g', msg:'Rotación 14.2x — el producto de mayor rotación. DOH 31d en meta' },
    ],
  },
  'ALI-4001': {
    nombre:       'Balanceado Bovino Inicio 40kg',
    proveedor:    'NutriCrop',
    categoria:    'Alim. Animal',
    uom:          'kg',
    estado:       'Bajo',
    estadoVentas: 'Alerta',
    existencia:   21600,
    stockMin:     5000,
    costoUnit:    5940,
    costoUCompra: 5850,
    costoTotal:   128400000,
    diasInv:      22,
    consumoSem:   2500,
    consumoHist:  2300,
    v3m:          74800,
    v6m:          138000,
    fechaUCompra: '01/04/2026',
    cantUCompra:  28000,
    leadTimeDias: 7,
    puntoPedido:  16000,
    cantPedido:   28000,
    ubicaciones: [
      { almacen:'Bodega Central',    stock:14800, pct:69, doh:22, estado:'Bajo'   },
      { almacen:'Sucursal Norte',    stock: 4600, pct:21, doh:18, estado:'Bajo'   },
      { almacen:'Punto de Venta Sur',stock: 2200, pct:10, doh:14, estado:'Crítico'},
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [38200, 32400, 52800, 44200, 28600, 21600],
      entradas:[28000, 28000, 28000, 0,     0,     0],
      salidas: [18400, 22200, 24400, 22600, 20200, 10200],
    },
    alerts: [
      { tier:'r', msg:'Stock bajo alerta — 22 días de cobertura. Generar pedido a NutriCrop' },
      { tier:'r', msg:'Punto de Venta Sur: 14d cobertura, bajo stock mínimo. Reposición urgente' },
      { tier:'y', msg:'Consumo 2,500 uds/sem. Próximo pedido recomendado en ≤7 días' },
    ],
  },
  'AGQ-3015': {
    nombre:       'Insecticida Clorpirifós 48%',
    proveedor:    'MultiAgro',
    categoria:    'Agroquímicos',
    uom:          'lt',
    estado:       'Crítico',
    estadoVentas: 'Quiebre',
    existencia:   0,
    stockMin:     2000,
    costoUnit:    12300,
    costoUCompra: 12100,
    costoTotal:   0,
    diasInv:      0,
    consumoSem:   480,
    consumoHist:  420,
    v3m:          14200,
    v6m:          25400,
    fechaUCompra: '10/01/2026',
    cantUCompra:  8000,
    leadTimeDias: 15,
    puntoPedido:  6000,
    cantPedido:   8000,
    ubicaciones: [
      { almacen:'Punto de Venta Sur',stock:0, pct:0, doh:0, estado:'Crítico' },
      { almacen:'Bodega Central',    stock:0, pct:0, doh:0, estado:'Crítico' },
      { almacen:'Sucursal Norte',    stock:0, pct:0, doh:0, estado:'Crítico' },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [9200, 6800, 4200, 1800, 400, 0],
      entradas:[8000, 0,    0,    0,    0,   0],
      salidas: [3600, 4600, 4200, 3600, 2400, 400],
    },
    alerts: [
      { tier:'r', msg:'Quiebre total — 0 uds en los 3 almacenes. Venta perdida $9.7M' },
      { tier:'r', msg:'21 días sin stock en Pto. Venta Sur. Lead time 15d → pedido urgente' },
      { tier:'r', msg:'Última compra 10/01/2026 — sin reposición en 90 días. Revisar proveedor' },
      { tier:'y', msg:'Consumo histórico 480 uds/sem. Pedido mínimo recomendado: 8,000 uds' },
    ],
  },
  'VET-2031': {
    nombre:       'Vacuna Aftosa Bivalente',
    proveedor:    'BioVet SA',
    categoria:    'Veterinaria',
    uom:          'dosis',
    estado:       'Crítico',
    estadoVentas: 'Quiebre',
    existencia:   0,
    stockMin:     1500,
    costoUnit:    21440,
    costoUCompra: 21000,
    costoTotal:   0,
    diasInv:      0,
    consumoSem:   360,
    consumoHist:  330,
    v3m:          10720,
    v6m:          19800,
    fechaUCompra: '15/01/2026',
    cantUCompra:  5000,
    leadTimeDias: 30,
    puntoPedido:  8000,
    cantPedido:   5000,
    ubicaciones: [
      { almacen:'Sucursal Norte',    stock:0, pct:0, doh:0, estado:'Crítico' },
      { almacen:'Bodega Central',    stock:0, pct:0, doh:0, estado:'Crítico' },
      { almacen:'Punto de Venta Sur',stock:0, pct:0, doh:0, estado:'Crítico' },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [6200, 4800, 3200, 1600, 600, 0],
      entradas:[5000, 0,    0,    0,    0,   0],
      salidas: [2400, 2800, 3200, 2400, 2000, 600],
    },
    alerts: [
      { tier:'r', msg:'Quiebre total — 35 días sin stock en Sucursal Norte. Impacto $10.7M' },
      { tier:'r', msg:'Lead time 30d con BioVet SA. Pedido urgente requerido hoy' },
      { tier:'r', msg:'Sin reposición desde 15/01/2026 — revisar acuerdo con proveedor' },
    ],
  },
  'AGR-1044': {
    nombre:       'Semilla Girasol Confitero',
    proveedor:    'AgroSeed',
    categoria:    'Semillas',
    uom:          'kg',
    estado:       'Crítico',
    estadoVentas: 'Quiebre',
    existencia:   120,
    stockMin:     3000,
    costoUnit:    13200,
    costoUCompra: 13000,
    costoTotal:   1584000,
    diasInv:      6,
    consumoSem:   470,
    consumoHist:  440,
    v3m:          14050,
    v6m:          26200,
    fechaUCompra: '20/01/2026',
    cantUCompra:  10000,
    leadTimeDias: 21,
    puntoPedido:  9000,
    cantPedido:   10000,
    ubicaciones: [
      { almacen:'Bodega Central',    stock:120, pct:100, doh:6, estado:'Crítico' },
      { almacen:'Punto de Venta Sur',stock:  0, pct:  0, doh:0, estado:'Crítico' },
      { almacen:'Sucursal Norte',    stock:  0, pct:  0, doh:0, estado:'Crítico' },
    ],
    trend6m: {
      meses: ['Nov','Dic','Ene','Feb','Mar','Abr'],
      stock:  [12400, 9800, 4200, 1800, 640, 120],
      entradas:[10000, 0,    0,    0,    0,   0],
      salidas: [2800,  9200, 8400, 5600, 3560, 520],
    },
    alerts: [
      { tier:'r', msg:'Stock crítico — 120 uds, 6 días de cobertura. Stock mínimo: 3,000' },
      { tier:'r', msg:'Sin reposición desde 20/01/2026. Lead time 21d — ya en quiebre inminente' },
      { tier:'r', msg:'Impacto estimado: $14.1M en venta perdida si no se repone hoy' },
    ],
  },
  // ─── Productos adicionales (sinQuiebres / sobrestock / vencido) ─────────
  'AGQ-3004': {
    nombre:'Fungicida Mancozeb 80%',      proveedor:'MultiAgro',    categoria:'Agroquímicos',  uom:'kg',
    estado:'Bajo', estadoVentas:'Activo',
    existencia:8400, stockMin:1000, costoUnit:10200, costoUCompra:10000, costoTotal:85680000,
    diasInv:14, consumoSem:520, consumoHist:480, v3m:6900, v6m:13200,
    fechaUCompra:'28/02/2026', cantUCompra:10000, leadTimeDias:12, puntoPedido:4000, cantPedido:10000,
    ubicaciones:[{ almacen:'Sucursal Norte',stock:6200,pct:74,doh:14,estado:'Bajo' },{ almacen:'Bodega Central',stock:2200,pct:26,doh:14,estado:'Bajo' }],
    alerts:[{ tier:'y', msg:'DOH 14d bajo meta. Cobertura insuficiente — evaluar reposición urgente' },{ tier:'y', msg:'Stock en 2 almacenes. Rotación 6.2x — flujo regular' }],
  },
  'AGQ-3008': {
    nombre:'Herbicida Atrazina 50% SC',   proveedor:'MultiAgro',    categoria:'Agroquímicos',  uom:'lt',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:5, stockMin:2000, costoUnit:9800, costoUCompra:9600, costoTotal:49000,
    diasInv:1, consumoSem:420, consumoHist:400, v3m:12600, v6m:23000,
    fechaUCompra:'05/12/2025', cantUCompra:12000, leadTimeDias:10, puntoPedido:5000, cantPedido:12000,
    ubicaciones:[{ almacen:'Punto de Venta Sur',stock:5,pct:100,doh:1,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Quiebre inminente — 5 uds, 1 día de cobertura. Pedido urgente a MultiAgro' },{ tier:'r', msg:'12 días en quiebre en Pto. Venta Sur. Impacto estimado $8.4M' }],
  },
  'AGQ-3022': {
    nombre:'Fungicida Captan 50%',        proveedor:'QuimAgro',     categoria:'Agroquímicos',  uom:'lt',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:180, stockMin:1000, costoUnit:12000, costoUCompra:11800, costoTotal:2160000,
    diasInv:8, consumoSem:280, consumoHist:260, v3m:8400, v6m:15200,
    fechaUCompra:'15/11/2025', cantUCompra:2000, leadTimeDias:14, puntoPedido:3000, cantPedido:5000,
    ubicaciones:[{ almacen:'Bodega Central',stock:180,pct:100,doh:8,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Lotes vencidos 28/02/2026 — 180 uds en Bodega Central. Baja inmediata requerida' },{ tier:'r', msg:'Stock bajo mínimo (1,000). Sin reposición desde 15/11/2025' }],
  },
  'AGQ-3041': {
    nombre:'Insecticida Endosulfán 35%',  proveedor:'MultiAgro',    categoria:'Agroquímicos',  uom:'lt',
    estado:'Bajo', estadoVentas:'Alerta',
    existencia:140, stockMin:800, costoUnit:12000, costoUCompra:11500, costoTotal:1680000,
    diasInv:20, consumoSem:200, consumoHist:185, v3m:6000, v6m:11000,
    fechaUCompra:'10/10/2025', cantUCompra:3000, leadTimeDias:12, puntoPedido:2000, cantPedido:3000,
    ubicaciones:[{ almacen:'Sucursal Norte',stock:140,pct:100,doh:20,estado:'Bajo' }],
    alerts:[{ tier:'r', msg:'Vence 31/03/2026 — 30 días restantes. Liquidar o transferir stock' },{ tier:'y', msg:'Sin reposición desde 10/10/2025. Evaluar necesidad vs vigencia' }],
  },
  'AGR-1031': {
    nombre:'Cal Agrícola Molida',         proveedor:'NutriCrop',    categoria:'Fertilizantes', uom:'kg',
    estado:'Normal', estadoVentas:'Activo',
    existencia:62100, stockMin:8000, costoUnit:1435, costoUCompra:1400, costoTotal:89113500,
    diasInv:72, consumoSem:1200, consumoHist:1100, v3m:28200, v6m:52800,
    fechaUCompra:'18/01/2026', cantUCompra:80000, leadTimeDias:7, puntoPedido:15000, cantPedido:80000,
    ubicaciones:[{ almacen:'Bodega Central',stock:62100,pct:100,doh:72,estado:'Normal' }],
    alerts:[{ tier:'y', msg:'DOH 72d supera meta (30d) — sobrestock de 31,000 uds · $24.8M inmovilizados' },{ tier:'y', msg:'Rotación 1.8x muy baja. Revisar reposición y plan de distribución' },{ tier:'g', msg:'Sin quiebre registrado. Cobertura garantizada para los próximos 2 meses' }],
  },
  'AGR-1038': {
    nombre:'Semilla Maíz Híbrido DK7500', proveedor:'AgroSeed',     categoria:'Semillas',      uom:'kg',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:3, stockMin:4000, costoUnit:15200, costoUCompra:15000, costoTotal:45600,
    diasInv:0, consumoSem:420, consumoHist:400, v3m:12600, v6m:23800,
    fechaUCompra:'15/11/2025', cantUCompra:15000, leadTimeDias:21, puntoPedido:7000, cantPedido:15000,
    ubicaciones:[{ almacen:'Bodega Central',stock:3,pct:100,doh:0,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Quiebre total — 3 uds residuales. 18 días en quiebre en Bodega Central' },{ tier:'r', msg:'Lead time 21d con AgroSeed. Pedido urgente requerido hoy' },{ tier:'r', msg:'Sin reposición desde 15/11/2025. Temporada de siembra en riesgo' }],
  },
  'AGR-1055': {
    nombre:'Semilla Sorgo Forrajero 10kg',proveedor:'AgroSeed',     categoria:'Semillas',      uom:'kg',
    estado:'Bajo', estadoVentas:'Alerta',
    existencia:60, stockMin:2000, costoUnit:18000, costoUCompra:17500, costoTotal:1080000,
    diasInv:20, consumoSem:80, consumoHist:75, v3m:2400, v6m:4400,
    fechaUCompra:'20/10/2025', cantUCompra:4000, leadTimeDias:21, puntoPedido:3500, cantPedido:6000,
    ubicaciones:[{ almacen:'Bodega Central',stock:60,pct:100,doh:20,estado:'Bajo' }],
    alerts:[{ tier:'r', msg:'Lote L-2023-214 vence 10/04/2026 — 60 uds en riesgo de vencimiento' },{ tier:'y', msg:'Stock bajo mínimo (2,000). Rotación 6.2x aceptable pero nivel crítico' }],
  },
  'ALI-4007': {
    nombre:'Suplemento Mineral Bovino',   proveedor:'NutriCrop',    categoria:'Alim. Animal',  uom:'kg',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:18, stockMin:2500, costoUnit:7200, costoUCompra:7000, costoTotal:129600,
    diasInv:3, consumoSem:300, consumoHist:280, v3m:9000, v6m:17200,
    fechaUCompra:'01/12/2025', cantUCompra:8000, leadTimeDias:7, puntoPedido:4000, cantPedido:8000,
    ubicaciones:[{ almacen:'Sucursal Norte',stock:18,pct:100,doh:3,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Quiebre inminente — 18 uds, 3 días de cobertura en Sucursal Norte' },{ tier:'r', msg:'4 días en quiebre parcial. Reposición urgente — lead time 7 días' }],
  },
  'ALI-4012': {
    nombre:'Premezcla Vitamínica Aviar',  proveedor:'NutriFeed Corp.',categoria:'Alim. Animal', uom:'kg',
    estado:'Bajo', estadoVentas:'Alerta',
    existencia:90, stockMin:800, costoUnit:11000, costoUCompra:10800, costoTotal:990000,
    diasInv:18, consumoSem:160, consumoHist:150, v3m:4800, v6m:9200,
    fechaUCompra:'15/11/2025', cantUCompra:2500, leadTimeDias:14, puntoPedido:2000, cantPedido:2500,
    ubicaciones:[{ almacen:'Punto de Venta Sur',stock:90,pct:100,doh:18,estado:'Bajo' }],
    alerts:[{ tier:'r', msg:'Lote L-2025-008 vence 10/03/2026 — 90 uds en Pto. Venta Sur' },{ tier:'y', msg:'DOH 18d bajo meta. Evaluar uso o devolución antes de vencimiento' }],
  },
  'VET-2008': {
    nombre:'Antibiótico Oxitetraciclina', proveedor:'BioVet SA',    categoria:'Veterinaria',   uom:'dosis',
    estado:'Normal', estadoVentas:'Activo',
    existencia:880, stockMin:300, costoUnit:13000, costoUCompra:12800, costoTotal:11440000,
    diasInv:38, consumoSem:150, consumoHist:140, v3m:1800, v6m:3400,
    fechaUCompra:'05/02/2026', cantUCompra:2000, leadTimeDias:30, puntoPedido:1000, cantPedido:2000,
    ubicaciones:[{ almacen:'Punto de Venta Sur',stock:560,pct:64,doh:38,estado:'Normal' },{ almacen:'Bodega Central',stock:320,pct:36,doh:38,estado:'Normal' }],
    alerts:[{ tier:'y', msg:'DOH 38d sobre meta (30d). Sobrestock 320 uds · $4.16M inmovilizados' },{ tier:'y', msg:'Rotación 3.4x baja para producto veterinario. Revisar demanda' },{ tier:'g', msg:'Sin quiebre registrado. Stock sobre mínimo en ambas ubicaciones' }],
  },
  'VET-2014': {
    nombre:'Vacuna Brucelosis 10ml',      proveedor:'BioVet SA',    categoria:'Veterinaria',   uom:'dosis',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:240, stockMin:500, costoUnit:13000, costoUCompra:12800, costoTotal:3120000,
    diasInv:0, consumoSem:140, consumoHist:130, v3m:4200, v6m:8400,
    fechaUCompra:'15/09/2025', cantUCompra:3000, leadTimeDias:21, puntoPedido:1500, cantPedido:3000,
    ubicaciones:[{ almacen:'Sucursal Norte',stock:240,pct:100,doh:0,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Lotes vencidos 15/02/2026 — 240 uds en Sucursal Norte. Baja inmediata' },{ tier:'r', msg:'Sin reposición desde 15/09/2025 (6 meses). Revisar contrato con BioVet SA' }],
  },
  'VET-2019': {
    nombre:'Antiparasitario Ivermectina', proveedor:'BioVet SA',    categoria:'Veterinaria',   uom:'dosis',
    estado:'Crítico', estadoVentas:'Quiebre',
    existencia:12, stockMin:2000, costoUnit:6000, costoUCompra:5850, costoTotal:72000,
    diasInv:2, consumoSem:420, consumoHist:400, v3m:12600, v6m:23800,
    fechaUCompra:'20/11/2025', cantUCompra:5000, leadTimeDias:21, puntoPedido:4000, cantPedido:5000,
    ubicaciones:[{ almacen:'Sucursal Norte',stock:12,pct:100,doh:2,estado:'Crítico' }],
    alerts:[{ tier:'r', msg:'Quiebre inminente — 12 uds, 2 días de cobertura en Sucursal Norte' },{ tier:'r', msg:'6 días en quiebre parcial. Lead time 21d — riesgo de desabasto prolongado' }],
  },
  'VET-2033': {
    nombre:'Oxitocina 10 UI 10ml',        proveedor:'BioVet SA',    categoria:'Veterinaria',   uom:'dosis',
    estado:'Bajo', estadoVentas:'Alerta',
    existencia:200, stockMin:600, costoUnit:4200, costoUCompra:4100, costoTotal:840000,
    diasInv:14, consumoSem:180, consumoHist:165, v3m:5400, v6m:10200,
    fechaUCompra:'05/01/2026', cantUCompra:3000, leadTimeDias:21, puntoPedido:1500, cantPedido:3000,
    ubicaciones:[{ almacen:'Punto de Venta Sur',stock:200,pct:100,doh:14,estado:'Bajo' }],
    alerts:[{ tier:'r', msg:'Lotes L-2025-033 y L-2025-041 vencen 05/04/2026 — 200 uds en riesgo' },{ tier:'y', msg:'DOH 14d bajo meta (30d). Stock bajo mínimo (600)' }],
  },
};

const ESTADO_CHIP = {
  Normal:   { bg:'#f0fdf4', color:'#16a34a', bd:'#86efac'  },
  Bajo:     { bg:'#fef3c7', color:'#d97706', bd:'#fcd34d'  },
  Crítico:  { bg:'#fef2f2', color:'#dc2626', bd:'#fca5a5'  },
  Activo:   { bg:'#f0fdf4', color:'#16a34a', bd:'#86efac'  },
  Alerta:   { bg:'#fef3c7', color:'#d97706', bd:'#fcd34d'  },
  Quiebre:  { bg:'#fef2f2', color:'#dc2626', bd:'#fca5a5'  },
};

function InfoRow({ label, value, highlight }) {
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'7px', borderBottom:`1px solid rgba(26,26,26,.06)` }}>
      <Typography sx={{ fontFamily:FONT, fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</Typography>
      <Typography sx={{ fontFamily:FONT, fontSize:11, fontWeight: 500, color: highlight || DL.tH }}>{value}</Typography>
    </Box>
  );
}

export default function InventarioProducto() {
  const { sku, almacenId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [chartTab, setChartTab] = useState('inventario');

  // ── Modo almacén: viene desde InventarioAlmacen con state ───────────────
  const wp            = location.state?.producto;               // producto específico del almacén
  const almacenNombre = almacenId ? decodeURIComponent(almacenId) : null;
  const isAlmacenMode = Boolean(almacenId && wp);

  // ── Datos generales (desde vista general de inventario) ─────────────────
  const data = PRODUCTOS_DATA[sku];

  // Si no hay ninguna fuente de datos, mostrar error
  if (!isAlmacenMode && !data) return (
    <Box sx={{ p:'40px', textAlign:'center' }}>
      <Typography sx={{ fontFamily:FONT, fontSize:14, color:DL.tM }}>Producto no encontrado: "{sku}"</Typography>
    </Box>
  );

  // ── En modo almacén: si wp existe pero no hay datos generales, fabricar
  // valores mínimos para poder reusar el chart de tendencia si está disponible
  const generalData = data || null;

  // "prod" es la fuente activa de datos para KPIs y ficha
  const prod = isAlmacenMode ? wp : data;

  const estChip  = ESTADO_CHIP[prod.estado]      || ESTADO_CHIP.Normal;
  const ventChip = ESTADO_CHIP[prod.estadoVentas] || ESTADO_CHIP.Activo;

  // ── Alerts dinámicos para modo almacén (si no vienen por state) ─────────
  const almacenAlerts = isAlmacenMode ? (() => {
    const a = [];
    if (wp.existencia === 0)
      a.push({ tier:'r', msg:`Sin stock en ${almacenNombre} — quiebre activo` });
    else if (wp.existencia < wp.stockMin)
      a.push({ tier:'r', msg:`Existencia (${wp.existencia.toLocaleString()}) bajo mínimo (${wp.stockMin.toLocaleString()}) en ${almacenNombre}` });
    if (wp.doh > 45 && wp.existencia >= wp.stockMin)
      a.push({ tier:'y', msg:`DOH ${wp.doh}d supera meta (30d). Sobrestock en ${almacenNombre}` });
    if (wp.fechaVenc)
      a.push({ tier:'r', msg:`Producto con fecha de vencimiento: ${wp.fechaVenc}` });
    if (wp.doh > 0 && wp.doh <= 30)
      a.push({ tier:'g', msg:`DOH ${wp.doh}d dentro de meta (30d) en ${almacenNombre}` });
    if (wp.rotacion && wp.rotacion >= 9)
      a.push({ tier:'g', msg:`Rotación ${wp.rotacion.toFixed(1)}x — buen desempeño en ${almacenNombre}` });
    return a;
  })() : [];

  const fmtK = v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v);

  // ── Trend chart — usa datos reales si existen; si no, genera tendencia sintética ──
  const realTrend = generalData?.trend6m ?? null;
  const trendRef = realTrend ?? (() => {
    // Construir tendencia sintética retrocediendo 6 meses desde la existencia actual
    const MESES = ['Nov','Dic','Ene','Feb','Mar','Abr'];
    const salMes = Math.round((prod.consumoSem ?? 0) * 4.3);
    const stock = [];
    let s = prod.existencia ?? 0;
    for (let i = 5; i >= 0; i--) {
      stock[i] = Math.max(0, Math.round(s));
      s += salMes;
    }
    return {
      meses:   MESES,
      stock,
      entradas: MESES.map(() => 0),
      salidas:  MESES.map(() => salMes),
    };
  })();
  const hasTrend = true; // siempre mostramos la gráfica

  // ── Weekly (24-point) expansion for organic cardiogram lines ──────────────
  // Seed determinístico desde SKU para que el mismo producto siempre tenga la misma forma
  const chartSeed = sku ? sku.split('').reduce((a, c) => a + c.charCodeAt(0), 0) : 42;
  const weeklyTrendRef = (() => {
    const weekStock = [], weekEntradas = [], weekSalidas = [], weekLabels = [];
    const WEEKS = 4;
    trendRef.meses.forEach((mes, mi) => {
      // Stock inicial del mes: si es el primero, estimamos desde consumo; si no, el mes anterior
      const prevStock = mi === 0
        ? Math.max(0, Math.round(trendRef.stock[0] + trendRef.salidas[0] * 0.85))
        : trendRef.stock[mi - 1];
      const targetStock = trendRef.stock[mi];
      const monthSalidas  = trendRef.salidas[mi];
      const monthEntradas = trendRef.entradas[mi];
      for (let w = 0; w < WEEKS; w++) {
        const wIdx    = mi * WEEKS + w;
        const baseStock = Math.round(prevStock + (targetStock - prevStock) * (w + 1) / WEEKS);
        // Ruido orgánico: combinación de dos senos con frecuencias distintas
        const noiseAmp = Math.max(40, Math.abs(baseStock) * 0.038);
        const noise = Math.round(
          noiseAmp * (Math.sin(wIdx * 1.87 + chartSeed * 0.31) +
                      0.45 * Math.cos(wIdx * 3.71 + chartSeed * 0.57))
        );
        weekStock.push(Math.max(0, baseStock + noise));
        // Entradas: colocar la compra en semana 2 del mes
        weekEntradas.push(w === 1 && monthEntradas > 0 ? monthEntradas : 0);
        // Salidas semanales con variación ±18%
        const baseSal  = Math.round(monthSalidas / WEEKS);
        const salNoise = Math.round(baseSal * 0.18 * Math.sin(wIdx * 2.53 + chartSeed));
        weekSalidas.push(Math.max(0, baseSal + salNoise));
        // Solo etiqueta en la primera semana del mes
        weekLabels.push(w === 0 ? mes : '');
      }
    });
    return { meses: weekLabels, stock: weekStock, entradas: weekEntradas, salidas: weekSalidas };
  })();

  const trendStockMin = generalData?.stockMin ?? prod.stockMin;

  // Puntos donde hubo compra (entradas > 0) — marcados sobre la línea (en weekly data)
  const compraScatter = weeklyTrendRef.meses.map((m, i) =>
    weeklyTrendRef.entradas[i] > 0
      ? { value: [i, weeklyTrendRef.stock[i]], raw: weeklyTrendRef.entradas[i], label: m || trendRef.meses[Math.floor(i / 4)] }
      : null
  ).filter(Boolean);

  const stockData = weeklyTrendRef.stock.map((v) => ({
    value: v,
    itemStyle: { color: v < trendStockMin ? '#dc2626' : DL.navy },
  }));

  const yMax = Math.max(...weeklyTrendRef.stock, trendStockMin) * 1.18 || 100;

  const trendOption = hasTrend ? {
    backgroundColor: 'transparent',
    tooltip:{
      trigger:'axis',
      axisPointer:{ type:'line', lineStyle:{ color:'rgba(26,26,26,.15)', width:1, type:'dashed' } },
      backgroundColor:'#fff',
      borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      extraCssText:'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:10px;padding:12px 16px',
      textStyle:{fontFamily:FONT, fontSize:10},
      formatter: params => {
        const wIdx   = params[0]?.dataIndex ?? 0;
        const stock  = weeklyTrendRef.stock[wIdx]    ?? 0;
        const ent    = weeklyTrendRef.entradas[wIdx] ?? 0;
        const sal    = weeklyTrendRef.salidas[wIdx]  ?? 0;
        const mesLabel = weeklyTrendRef.meses[wIdx] || trendRef.meses[Math.floor(wIdx / 4)] || '';
        const mes    = mesLabel + (weeklyTrendRef.meses[wIdx] ? '' : ` (s${(wIdx % 4) + 1})`);
        const pct    = trendStockMin > 0 ? Math.round(stock / trendStockMin * 100) : 100;
        const pp     = generalData?.puntoPedido ?? trendStockMin * 2;
        const status = stock === 0 ? ['Sin stock', '#dc2626']
                     : stock < trendStockMin ? ['⚠ Bajo mínimo', '#d97706']
                     : stock < pp ? ['Atención', '#f97316']
                     : ['✓ Normal', '#16a34a'];
        return `
          <div style="font-family:'Inter',sans-serif;min-width:200px">
            <div style="font-size:12px;font-weight:500;color:#1b1b1b;margin-bottom:10px">${mes}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:9px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.05em">Stock actual</span>
              <b style="font-size:16px;color:${stock < trendStockMin ? '#dc2626' : '#1b1b1b'}">${stock.toLocaleString()}</b>
            </div>
            <div style="height:4px;background:#f6f6f6;border-radius:4px;margin-bottom:10px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,pct)}%;background:${stock < trendStockMin ? '#dc2626' : '#547e69'};border-radius:4px"></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin-bottom:8px">
              ${ent > 0 ? `<div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase">Compra</div><div style="font-size:11px;font-weight:500;color:#16a34a">+${ent.toLocaleString()}</div></div>` : ''}
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase">Salidas</div><div style="font-size:11px;font-weight:500;color:#f97316">-${sal.toLocaleString()}</div></div>
              <div><div style="font-size:8px;color:#6a6a6a;text-transform:uppercase">vs Mínimo</div><div style="font-size:11px;font-weight:500;color:#1b1b1b">${pct}%</div></div>
            </div>
            <div style="display:inline-flex;padding:3px 9px;border-radius:20px;background:${status[1]}15;color:${status[1]};font-size:9px;font-weight:500">${status[0]}</div>
          </div>`;
      },
    },
    legend: { show: false },
    grid: { top:24, right:88, bottom:32, left:54 },
    xAxis:{
      type:'category', data:weeklyTrendRef.meses,
      axisLine:{lineStyle:{color:'rgba(26,26,26,.10)'}}, axisTick:{show:false},
      axisLabel:{
        fontFamily:FONT, fontSize:9, color:DL.tS,
        interval: (idx, val) => val !== '',
      },
      splitLine:{show:false},
    },
    yAxis:{
      type:'value', min:0, max: yMax,
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{fontFamily:FONT, fontSize:9, color:DL.tS, formatter:fmtK},
      splitLine:{lineStyle:{color:'rgba(26,26,26,.06)', type:'dashed'}},
    },
    series:[
      // ── Zona de peligro (relleno rojo debajo del stock mínimo) ───────────
      {
        name:'_danger', type:'line', silent:true, symbol:'none',
        data: weeklyTrendRef.meses.map(() => trendStockMin),
        lineStyle:{ opacity:0 },
        areaStyle:{
          color:'rgba(220,38,38,.07)',
          origin: 0,
        },
        z: 1,
      },
      // ── Línea de stock ────────────────────────────────────────────────────
      {
        name:'Stock', type:'line',
        data: stockData,
        smooth:false,
        symbolSize: p => (p < trendStockMin ? 6 : 3),
        lineStyle:{ color:DL.navy, width:2 },
        itemStyle:{ color: DL.navy },
        areaStyle:{
          color:{
            type:'linear', x:0, y:0, x2:0, y2:1,
            colorStops:[
              { offset:0, color:'rgba(26,26,26,.22)' },
              { offset:1, color:'rgba(26,26,26,.02)' },
            ],
          },
          origin: trendStockMin,
        },
        // ── Línea stock mínimo ───────────────────────────────────────────
        markLine:{
          silent:true,
          symbol:['none','none'],
          data:[
            {
              yAxis: trendStockMin,
              lineStyle:{ color:'#dc2626', type:'dashed', width:1.5 },
              label:{ show:true, position:'end', formatter:`Mín\n${fmtK(trendStockMin)}`, fontFamily:FONT, fontSize:8, color:'#dc2626', fontWeight: 500 },
            },
            ...(generalData?.puntoPedido ? [{
              yAxis: generalData.puntoPedido,
              lineStyle:{ color:'#f97316', type:'dashed', width:1.5 },
              label:{ show:true, position:'end', formatter:`Pedido\n${fmtK(generalData.puntoPedido)}`, fontFamily:FONT, fontSize:8, color:'#f97316', fontWeight: 500 },
            }] : []),
          ],
        },
        z: 3,
      },
      // ── Puntos de compra (círculos verdes sobre la línea) ────────────────
      {
        name:'Compra',
        type:'scatter',
        data: compraScatter.map(p => ({ value: [p.value[0], p.value[1]], raw: p.raw, label: p.label })),
        symbolSize: 14,
        symbol:'circle',
        itemStyle:{ color:'#16a34a', borderColor:'#fff', borderWidth:2.5 },
        label:{
          show:true, position:'top',
          fontFamily:FONT, fontSize:9, fontWeight: 500, color:'#16a34a',
          formatter: p => `+${fmtK(p.data.raw)}`,
          offset:[0,-4],
        },
        z: 5,
        tooltip:{ show:false },
      },
    ],
  } : null;

  // ── Tabs de gráfica: Inventario / Compras / Ventas / Costo ──────────────
  const CHART_TABS = [
    { key:'inventario', label:'INV',     color:DL.navy    },
    { key:'compras',    label:'Compras', color:'#16a34a'  },
    { key:'ventas',     label:'Ventas',  color:'#547e69'  },
    { key:'costo',      label:'Costo',   color:'#4d3f32'  },
  ];

  // Costo sintético 24 semanas (de costoUCompra a costoUnit con variación orgánica cardiógrafo)
  const costoTrend = (() => {
    const curr  = prod.costoUnit;
    const uComp = prod.costoUCompra ?? generalData?.costoUCompra ?? curr;
    const TOTAL = weeklyTrendRef.meses.length;
    const seed2 = chartSeed * 3;
    return weeklyTrendRef.meses.map((_, i) => {
      const base  = Math.round(uComp + (curr - uComp) * i / Math.max(TOTAL - 1, 1));
      const noise = Math.round(base * 0.009 * (Math.sin(i * 1.8 + seed2) + 0.4 * Math.cos(i * 3.2 + seed2 * 0.5)));
      return base + noise;
    });
  })();

  // Helper para construir una opción de línea-cardiógrafo limpia
  const mkLineOpt = ({ data, color, yFmt, name, markY, markLabel, markColor, yMin }) => ({
    backgroundColor: 'transparent',
    tooltip:{
      trigger:'axis',
      axisPointer:{ type:'line', lineStyle:{ color:'rgba(26,26,26,.15)', width:1, type:'dashed' } },
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      extraCssText:'box-shadow:0 6px 20px rgba(26,26,26,.13);border-radius:10px;padding:10px 14px',
      textStyle:{ fontFamily:FONT, fontSize:10 },
      formatter: params => {
        const p = params[0]; if (!p) return '';
        return `<div style="font-family:'Inter',sans-serif;min-width:140px">
          <div style="font-size:12px;font-weight:500;color:#1b1b1b;margin-bottom:6px">${p.axisValue}</div>
          <div style="font-size:15px;font-weight:500;color:${color}">${yFmt(p.value)}</div>
          <div style="font-size:9px;color:#6a6a6a;margin-top:3px;text-transform:uppercase;letter-spacing:.04em">${name}</div>
        </div>`;
      },
    },
    legend: { show:false },
    grid: { top:20, right:20, bottom:30, left:60 },
    xAxis:{
      type:'category', data: weeklyTrendRef.meses,
      axisLine:{ lineStyle:{ color:'rgba(26,26,26,.10)' } }, axisTick:{ show:false },
      axisLabel:{
        fontFamily:FONT, fontSize:9, color:DL.tS,
        interval: (idx, val) => val !== '',
      },
      splitLine:{ show:false },
    },
    yAxis:{
      type:'value',
      min: yMin ?? 0,
      axisLine:{ show:false }, axisTick:{ show:false },
      axisLabel:{ fontFamily:FONT, fontSize:9, color:DL.tS, formatter: yFmt },
      splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
    },
    series:[{
      name,
      type:'line',
      smooth: false,
      data,
      symbolSize: 4,
      symbol: 'circle',
      lineStyle:{ color, width:2 },
      itemStyle:{ color, borderColor:'#fff', borderWidth:2 },
      areaStyle:{
        color:{ type:'linear', x:0, y:0, x2:0, y2:1,
          colorStops:[
            { offset:0, color:`${color}2a` },
            { offset:1, color:`${color}04` },
          ],
        },
      },
      ...(markY != null ? { markLine:{
        silent:true, symbol:['none','none'],
        data:[{ yAxis: markY,
          lineStyle:{ color: markColor ?? color, type:'dashed', width:1.5, opacity:.7 },
          label:{ show:true, position:'end', formatter: markLabel, fontFamily:FONT, fontSize:8, color: markColor ?? color, fontWeight: 500 },
        }],
      }} : {}),
    }],
  });

  const comprasOption = mkLineOpt({
    data: weeklyTrendRef.entradas, color:'#16a34a',
    yFmt: fmtK, name:'Unidades compradas',
  });
  const ventasOption = mkLineOpt({
    data: weeklyTrendRef.salidas, color:'#547e69',
    yFmt: fmtK, name:'Unidades vendidas / salidas',
  });
  const costoOption = mkLineOpt({
    data: costoTrend, color:'#4d3f32',
    yFmt: v => `$${fmtK(v)}`, name:'Costo unitario',
    yMin: Math.floor(Math.min(...costoTrend) * 0.97),
    markY: prod.costoUCompra ?? generalData?.costoUCompra ?? null,
    markLabel: `Últ. compra`,
    markColor: '#656565',
  });

  const activeChartOpt = chartTab === 'inventario' ? trendOption
    : chartTab === 'compras' ? comprasOption
    : chartTab === 'ventas'  ? ventasOption
    : costoOption;

  const CHART_INFO = {
    inventario:{ title:'Evolución de Inventario', sub: realTrend ? 'Nivel de stock — últimos 6 meses' : 'Tendencia estimada — basada en consumo promedio semanal' },
    compras:   { title:'Evolución de Compras',    sub: 'Entradas de mercancía — últimos 6 meses' },
    ventas:    { title:'Evolución de Ventas',      sub: 'Salidas / ventas — últimos 6 meses' },
    costo:     { title:'Evolución de Costo',       sub: 'Costo unitario — evolución últimos 6 meses' },
  };
  const CHART_LEGENDS = {
    inventario:[
      { color:DL.navy,   label:'Stock',        type:'line'   },
      { color:'#dc2626', label:'Zona peligro', type:'area'   },
      { color:'#dc2626', label:'Mín',          type:'dash'   },
      { color:'#f97316', label:'Pto. pedido',  type:'dash'   },
      { color:'#16a34a', label:'Compra',       type:'circle' },
    ],
    compras:[{ color:'#16a34a', label:'Compras (uds)',       type:'line' }],
    ventas: [{ color:'#547e69', label:'Ventas / Salidas',    type:'line' }],
    costo:  [
      { color:'#4d3f32', label:'Costo unit.',  type:'line' },
      { color:'#656565', label:'Últ. compra',  type:'dash' },
    ],
  };

  const dohVal  = isAlmacenMode ? prod.doh   : (prod.diasInv ?? prod.doh ?? 0);
  const dohC    = dohVal === 0 ? '#dc2626' : dohVal < 15 ? '#d97706' : dohVal > 60 ? '#d97706' : '#16a34a';
  const cobPct  = prod.stockMin > 0 ? Math.min(100, Math.round(prod.existencia / prod.stockMin * 100)) : 100;

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100%', background:DL.bg, overflow:'hidden' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <PageHeader
        title={prod.nombre}
        onBack={() => isAlmacenMode ? navigate(`/inventario/almacen/${almacenId}`) : navigate('/inventario')}
        live
      >
        <Box sx={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          px:'10px', py:'4px', borderRadius:'4px',
          background:'rgba(26,26,26,.07)', border:`1px solid rgba(26,26,26,.12)`,
          color:DL.navy, fontSize:10, fontWeight: 500, fontFamily:FONT,
        }}>
          {sku}
        </Box>
        {isAlmacenMode && (
          <Box sx={{ display:'inline-flex', alignItems:'center', gap:'5px', px:'10px', py:'4px', borderRadius:'4px', background:'rgba(26,26,26,.09)', border:`1px solid rgba(26,26,26,.18)`, color:DL.navy, fontSize:10, fontWeight: 500, fontFamily:FONT }}>
            📦 {almacenNombre}
          </Box>
        )}
        <Box sx={{ display:'inline-flex', px:'10px', py:'4px', borderRadius:'4px', background:estChip.bg, color:estChip.color, fontSize:10, fontWeight: 500, fontFamily:FONT, border:`1px solid ${estChip.bd}` }}>
          {prod.estado}
        </Box>
      </PageHeader>

      {/* ── SCROLL AREA ─────────────────────────────────────────────────────── */}
      <Box sx={{ flex:1, overflowY:'auto', p:'16px', display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ── ROW 1: KPI CARDS ──────────────────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
          <KpiCard
            lbl={isAlmacenMode ? `Existencia en ${almacenNombre}` : 'Existencia Actual'}
            val={prod.existencia.toLocaleString()}
            pct={cobPct}
            metaLbl="Stock Mínimo"
            meta={prod.stockMin.toLocaleString()}
            diff={prod.existencia === 0 ? 'SIN STOCK' : `${cobPct}% sobre mínimo`}
            diffUp={prod.existencia > prod.stockMin}
            valHighlight={prod.existencia === 0}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="DOH"
            val={dohVal === 0 ? '0 días' : `${dohVal} días`}
            pct={dohVal === 0 ? 0 : Math.min(100, Math.round(30 / Math.max(dohVal,1) * 100))}
            metaLbl="Meta"
            meta="30 días"
            diff={dohVal === 0 ? 'Quiebre de stock' : dohVal <= 30 ? '✓ Dentro de meta' : `+${dohVal-30}d sobre meta`}
            diffUp={dohVal > 0 && dohVal <= 30}
            valHighlight={dohVal === 0}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Stock Mínimo"
            val={prod.stockMin.toLocaleString()}
            pct={100}
            metaLbl={isAlmacenMode ? 'Rotación' : 'Punto de pedido'}
            meta={isAlmacenMode ? `${(prod.rotacion??0).toFixed(1)}x` : (generalData?.puntoPedido??prod.stockMin*2).toLocaleString()}
            diff={isAlmacenMode ? `Rotación en ${almacenNombre}` : `Lead time ${generalData?.leadTimeDias??'—'} días`}
            diffUp={isAlmacenMode ? (prod.rotacion??0) >= 9 : true}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Consumo Prom/Sem"
            val={prod.consumoSem.toLocaleString()}
            pct={prod.consumoPHist > 0 ? Math.round(prod.consumoSem / prod.consumoPHist * 100) : 100}
            metaLbl="Hist. prom."
            meta={(prod.consumoPHist ?? prod.consumoHist ?? prod.consumoSem).toLocaleString()}
            diff={prod.consumoSem >= (prod.consumoPHist ?? prod.consumoSem)
              ? `+${prod.consumoSem - (prod.consumoPHist ?? prod.consumoSem)} vs hist.`
              : `-${(prod.consumoPHist ?? prod.consumoSem) - prod.consumoSem} vs hist.`}
            diffUp={prod.consumoSem >= (prod.consumoPHist ?? prod.consumoSem)}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl={isAlmacenMode ? `Valor en ${almacenNombre}` : 'Valor en Inventario'}
            val={fmtMoney(prod.costoTotal)}
            pct={prod.costoTotal > 0 ? 100 : 0}
            metaLbl="Costo unit."
            meta={`$${prod.costoUnit.toLocaleString()}`}
            diff={prod.costoTotal === 0 ? 'Sin stock' : `${prod.uom}`}
            diffUp={prod.costoTotal > 0}
            onInfo={()=>{}}
          />
        </Box>

        {/* ── ROW 2 + LOTES: grid unificado — Ficha hace span de todas las filas ─ */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px' }}>

          {/* Ficha de producto — abarca TODAS las filas que ocupe la columna derecha */}
          <Box sx={{ ...cardSx, display:'flex', flexDirection:'column', gridRow:'1 / -1', alignSelf:'stretch' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Ficha del Producto</Typography>
              <Box sx={{ display:'flex', gap:'6px' }}>
                <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:estChip.bg, border:`1px solid ${estChip.bd}50` }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:estChip.color, fontFamily:FONT }}>Inventario: {prod.estado}</Typography>
                </Box>
                <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:ventChip.bg, border:`1px solid ${ventChip.bd}50` }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:ventChip.color, fontFamily:FONT }}>Ventas: {prod.estadoVentas}</Typography>
                </Box>
              </Box>
            </Box>
            {(() => {
              const allFields = [
                { label:'Categoría',            value: prod.categoria },
                { label:'Proveedor',             value: prod.proveedor ?? generalData?.proveedor ?? '—' },
                { label:'Unidad de Medida',      value: prod.uom },
                { label:'Costo Unitario',        value: `$${prod.costoUnit.toLocaleString()}` },
                { label:'Costo Última Compra',   value: `$${(prod.costoUCompra ?? generalData?.costoUCompra ?? prod.costoUnit).toLocaleString()}` },
                { label:'Últ. Fecha Compra',     value: prod.fechaUltimaCompra ?? prod.fechaUCompra ?? generalData?.fechaUCompra ?? '—' },
                { label:'Últ. Cant. Compra',     value: (prod.cantUCompra ?? generalData?.cantUCompra ?? 0).toLocaleString() },
                { label:'Venta Últ. 3 Meses',    value: (prod.v3m ?? generalData?.v3m ?? 0).toLocaleString() },
                { label:'Venta Últ. 6 Meses',    value: (prod.v6m ?? generalData?.v6m ?? 0).toLocaleString() },
                { label:'Consumo Hist. Prom.',   value: `${(prod.consumoPHist ?? prod.consumoHist ?? 0).toLocaleString()} / sem` },
                { label:'Stock Mínimo',          value: prod.stockMin.toLocaleString() },
                ...((prod.puntoPedido ?? generalData?.puntoPedido) != null ? [{ label:'Punto de Pedido', value: (prod.puntoPedido ?? generalData.puntoPedido).toLocaleString(), highlight: prod.existencia <= (prod.puntoPedido ?? generalData?.puntoPedido) ? '#dc2626' : undefined }] : []),
                ...((prod.cantPedido ?? generalData?.cantPedido) != null ? [{ label:'Cant. Pedido Sugerida', value: (prod.cantPedido ?? generalData.cantPedido).toLocaleString() }] : []),
                ...((prod.leadTimeDias ?? generalData?.leadTimeDias) != null ? [{ label:'Lead Time', value: `${prod.leadTimeDias ?? generalData.leadTimeDias} días` }] : []),
              ];
              const half = Math.ceil(allFields.length / 2);
              const col1 = allFields.slice(0, half);
              const col2 = allFields.slice(half);
              return (
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, px:'20px', py:'8px', flex:1 }}>
                  <Box sx={{ pr:'20px', borderRight:`1px solid rgba(26,26,26,.07)` }}>
                    {col1.map(f => <InfoRow key={f.label} label={f.label} value={f.value} highlight={f.highlight} />)}
                  </Box>
                  <Box sx={{ pl:'20px' }}>
                    {col2.map(f => <InfoRow key={f.label} label={f.label} value={f.value} highlight={f.highlight} />)}
                  </Box>
                </Box>
              );
            })()}
          </Box>

          {/* Right card: Stock por Almacén (general) OR En este Almacén (warehouse) */}
          {isAlmacenMode ? (
            /* ── WAREHOUSE MODE: metrics for this specific almacén ── */
            <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
              <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
                <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>En este Almacén</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>{almacenNombre}</Typography>
              </Box>
              <Box sx={{ px:'14px', py:'12px', display:'flex', flexDirection:'column', gap:'10px', flex:1 }}>
                {[
                  { lbl:'Existencia', val: prod.existencia.toLocaleString(), color: prod.existencia === 0 ? '#dc2626' : DL.navy, sub: prod.existencia === 0 ? 'Sin stock' : `${cobPct}% sobre mín.` },
                  { lbl:'DOH', val: dohVal === 0 ? 'Quiebre' : `${dohVal} días`, color: dohC, sub: dohVal <= 30 && dohVal > 0 ? '✓ En meta' : dohVal > 30 ? `+${dohVal-30}d sobre meta` : 'Quiebre de stock' },
                  { lbl:'Stock Mínimo', val: prod.stockMin.toLocaleString(), color: DL.tH, sub: prod.existencia < prod.stockMin ? '⚠ Por debajo del mínimo' : '✓ Sobre mínimo' },
                  { lbl:'Rotación', val: prod.rotacion != null ? `${prod.rotacion.toFixed(1)}x` : '—', color: (prod.rotacion??0) >= 9 ? DL.green : DL.tH, sub: (prod.rotacion??0) >= 9 ? 'Rotación óptima' : 'Rotación baja' },
                  { lbl:'Consumo Prom/Sem', val: prod.consumoSem?.toLocaleString() ?? '—', color: DL.tH, sub: 'En este almacén' },
                  ...(prod.quiebre != null ? [{ lbl:'Quiebre %', val: `${prod.quiebre}%`, color: prod.quiebre > 0 ? '#dc2626' : DL.green, sub: prod.quiebre > 0 ? 'Días en quiebre' : 'Sin quiebre' }] : []),
                ].map((item, i) => (
                  <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:'6px', borderBottom:`1px solid rgba(26,26,26,.06)` }}>
                    <Box>
                      <Typography sx={{ fontFamily:FONT, fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'.04em' }}>{item.lbl}</Typography>
                      <Typography sx={{ fontFamily:FONT, fontSize:8, color:DL.tS, mt:'1px' }}>{item.sub}</Typography>
                    </Box>
                    <Typography sx={{ fontFamily:FONT, fontSize:14, fontWeight: 500, color:item.color }}>{item.val}</Typography>
                  </Box>
                ))}

              </Box>
            </Box>
          ) : (
            /* ── GENERAL MODE: Stock por Almacén ── */
            <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
              <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
                <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Stock por Almacén</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>Distribución actual</Typography>
              </Box>
              <Box sx={{ px:'14px', py:'12px', display:'flex', flexDirection:'column', gap:'12px', flex:1 }}>
                {(generalData?.ubicaciones ?? []).map((u, i) => {
                  const uc = ESTADO_CHIP[u.estado] || ESTADO_CHIP.Normal;
                  const barW = generalData.existencia > 0 ? `${u.pct}%` : '0%';
                  const COLORS = [DL.navy, DL.blue, '#b8b8b8'];
                  return (
                    <Box key={i}>
                      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:'4px' }}>
                        <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{u.almacen}</Typography>
                        <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:COLORS[i] }}>{u.stock.toLocaleString()}</Typography>
                          <Box sx={{ px:'5px', py:'1px', borderRadius:'4px', background:uc.bg }}>
                            <Typography sx={{ fontFamily:FONT, fontSize:8, fontWeight: 500, color:uc.color }}>{u.estado}</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ height:6, borderRadius:3, background:'rgba(26,26,26,.08)', overflow:'hidden' }}>
                        <Box sx={{ height:'100%', width:barW, background:COLORS[i], borderRadius:3, transition:'width .3s' }} />
                      </Box>
                      <Box sx={{ display:'flex', justifyContent:'space-between', mt:'3px' }}>
                        <Typography sx={{ fontFamily:FONT, fontSize:8, color:DL.tS }}>{u.pct}% del total</Typography>
                        <Typography sx={{ fontFamily:FONT, fontSize:8, color: u.doh === 0 ? '#dc2626' : u.doh < 15 ? '#d97706' : DL.green, fontWeight: 500 }}>
                          {u.doh === 0 ? 'Sin stock' : `${u.doh}d`}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              {/* Total */}
              <Box sx={{ px:'14px', py:'10px', borderTop:`1px solid rgba(26,26,26,.08)`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <Typography sx={{ fontFamily:FONT, fontSize:9, fontWeight: 500, color:DL.tS }}>TOTAL</Typography>
                <Typography sx={{ fontFamily:FONT, fontSize:13, fontWeight: 500, color: generalData?.existencia===0?'#dc2626':DL.tH }}>
                  {(generalData?.existencia ?? 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Lotes por vencer — fila 2 de la columna derecha (solo modo almacén) */}
          {isAlmacenMode && prod.lotes?.length > 0 && (
            <Box sx={{ ...cardSx, overflow:'visible' }}>
              {/* Header */}
              <Box sx={{ px:'14px', py:'9px', borderBottom:`1px solid rgba(26,26,26,.08)`, display:'flex', alignItems:'center', gap:'8px' }}>
                <Typography sx={{ fontFamily:FONT, fontSize:11, fontWeight: 500, color:'#d97706' }}>⚠ Lotes por vencer</Typography>
                <Box sx={{ px:'7px', py:'2px', borderRadius:'4px', background:'#fef3c7', border:'1px solid #fcd34d' }}>
                  <Typography sx={{ fontFamily:FONT, fontSize:8, fontWeight: 500, color:'#d97706' }}>{prod.lotes.length} lote{prod.lotes.length > 1 ? 's' : ''}</Typography>
                </Box>
              </Box>
              {/* Tabla */}
              <Box sx={{ px:'12px', py:'8px' }}>
                <Box sx={{ display:'grid', gridTemplateColumns:'1fr 56px 88px', gap:'4px', px:'8px', py:'5px', background:'#fef9ec', borderRadius:'6px 6px 0 0', border:'1px solid rgba(217,119,6,.15)' }}>
                  {['Lote','Cant.','Vence'].map(h => (
                    <Typography key={h} sx={{ fontFamily:FONT, fontSize:8, fontWeight: 500, color:'#92400e', textTransform:'uppercase', letterSpacing:'.05em' }}>{h}</Typography>
                  ))}
                </Box>
                {prod.lotes.map((l, i) => (
                  <Box key={i} sx={{ display:'grid', gridTemplateColumns:'1fr 56px 88px', gap:'4px', px:'8px', py:'8px', border:'1px solid rgba(217,119,6,.12)', borderTop:'none', background:'#fff', borderRadius: i === prod.lotes.length-1 ? '0 0 6px 6px' : 0 }}>
                    <Typography sx={{ fontFamily:"'Courier New',monospace", fontSize:9.5, fontWeight: 500, color:DL.navy }}>{l.lote}</Typography>
                    <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>{l.cantidad.toLocaleString()}</Typography>
                    <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:'#dc2626' }}>{l.fechaVenc}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* ── ROW 3: GRÁFICA CON TABS + ALERTAS ──────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px', alignItems:'stretch' }}>

          {/* Gráfica con 4 tabs */}
          <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>

            {/* Header: título + subtítulo */}
            <Box sx={{ px:'16px', pt:'12px', pb:'8px' }}>
              <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>
                {CHART_INFO[chartTab].title}
              </Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>
                {CHART_INFO[chartTab].sub}
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ display:'flex', gap:'5px', px:'16px', pb:'8px', borderBottom:`1px solid ${DL.border}` }}>
              {CHART_TABS.map(t => {
                const active = chartTab === t.key;
                return (
                  <Box
                    key={t.key}
                    component="button"
                    onClick={() => setChartTab(t.key)}
                    sx={{
                      px:'13px', py:'5px', borderRadius:'4px',
                      background: active ? t.color : 'transparent',
                      color: active ? '#fff' : DL.tS,
                      border: active ? 'none' : `1px solid ${DL.border}`,
                      fontFamily:FONT, fontSize:10, fontWeight: 500,
                      cursor:'pointer', outline:'none',
                      transition:'all .15s',
                      '&:hover': { background: active ? t.color : `${t.color}12`, color: active ? '#fff' : t.color, borderColor: t.color },
                    }}
                  >
                    {t.label}
                  </Box>
                );
              })}
            </Box>

            {/* Gráfica */}
            <Box sx={{ px:'8px', pt:'8px', flex:1 }}>
              <ReactECharts
                key={chartTab}
                option={activeChartOpt}
                style={{ height:260 }}
              />
            </Box>

            {/* Leyenda dinámica */}
            <Box sx={{ display:'flex', flexWrap:'wrap', gap:'14px', justifyContent:'center', px:'16px', py:'10px', borderTop:`1px solid rgba(26,26,26,.07)` }}>
              {(CHART_LEGENDS[chartTab] ?? []).map(l => (
                <Box key={l.label} sx={{ display:'flex', alignItems:'center', gap:'5px' }}>
                  {l.type === 'circle'
                    ? <Box sx={{ width:10, height:10, borderRadius:'50%', background:l.color, border:'2px solid #fff', boxShadow:`0 0 0 1.5px ${l.color}`, flexShrink:0 }} />
                    : l.type === 'dash'
                    ? <Box sx={{ width:14, height:2, background:`repeating-linear-gradient(90deg,${l.color} 0,${l.color} 3px,transparent 3px,transparent 5px)`, flexShrink:0 }} />
                    : l.type === 'area'
                    ? <Box sx={{ width:10, height:10, borderRadius:'2px', background:`${l.color}25`, border:`1px solid ${l.color}60`, flexShrink:0 }} />
                    : <Box sx={{ width:16, height:2.5, background:l.color, borderRadius:2, flexShrink:0 }} />
                  }
                  <Typography sx={{ fontFamily:FONT, fontSize:8.5, color:DL.tM, fontWeight: 500 }}>{l.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Alertas */}
          <AlertasSistema
            alerts={isAlmacenMode ? almacenAlerts : (generalData?.alerts ?? [])}
            title={isAlmacenMode ? `Alertas — ${almacenNombre}` : `Alertas — ${sku}`}
          />
        </Box>

      </Box>
    </Box>
  );
}
