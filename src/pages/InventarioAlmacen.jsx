// ─── InventarioAlmacen — Detalle de un Almacén ───────────────────────────────
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography,
  Table, TableHead, TableBody, TableRow, TableCell,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { DL } from '../theme';
import KpiCard from '../components/common/KpiCard';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import AlertasSistema from '../components/common/AlertasSistema';

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

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

const cardSx = {
  background: '#fff', borderRadius: '10px',
  border: `1px solid ${DL.border}`, boxShadow: DL.e1, overflow: 'hidden',
};
const thSx = {
  fontFamily: FONT, fontSize: 8, fontWeight: 500,
  textTransform: 'uppercase', letterSpacing: '0.07em',
  color: DL.tS, py: '8px', px: '12px',
  background: '#f8fafc', borderBottom: `1px solid rgba(26,26,26,.12)`,
  whiteSpace: 'nowrap',
};
const tdSx = {
  fontFamily: FONT, fontSize: 10, fontWeight: 500,
  color: DL.tM, py: '10px', px: '12px',
  borderBottom: `1px solid rgba(26,26,26,.07)`,
};
const tblWrap = {
  mx: '14px', mt: '12px', mb: '14px',
  border: `1px solid rgba(26,26,26,.12)`,
  borderRadius: '8px', overflow: 'hidden',
};
const BORDER  = 'rgba(26,26,26,.10)';
const BORDER2 = 'rgba(26,26,26,.15)';

function PaginationBar({ page, total, perPage, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (total === 0) return null;
  const from = page * perPage + 1;
  const to   = Math.min((page + 1) * perPage, total);
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px', px:'14px', py:'8px', borderTop:`1px solid ${BORDER}` }}>
      <Typography sx={{ fontSize:9, color:'#6a6a6a', fontFamily:FONT, mr:'4px' }}>{from}–{to} de {total}</Typography>
      {[
        { label:'«', target:0,            disabled: page === 0 },
        { label:'‹', target:page - 1,     disabled: page === 0 },
        { label:'›', target:page + 1,     disabled: page >= totalPages - 1 },
        { label:'»', target:totalPages-1, disabled: page >= totalPages - 1 },
      ].map(btn => (
        <Box key={btn.label} component="button" onClick={() => !btn.disabled && onChange(btn.target)} sx={{
          fontFamily:FONT, fontSize:11, fontWeight: 500,
          width:26, height:26, borderRadius:'6px', border:`1px solid ${BORDER2}`,
          background: btn.disabled ? '#f8fafc' : '#fff',
          color: btn.disabled ? '#d4d4d4' : '#3f3f3f',
          cursor: btn.disabled ? 'default' : 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all .12s',
          '&:hover': btn.disabled ? {} : { borderColor:'#547e69', color:'#547e69' },
        }}>{btn.label}</Box>
      ))}
    </Box>
  );
}

// ─── DATA POR ALMACÉN ────────────────────────────────────────────────────────
const ALMACENES_DATA = {
  'Bodega Central': {
    estado: 'ok',
    evolucion: [1142000000,1168000000,1180000000,1195000000,1198000000,1200000000,1202000000,1200000000,1198000000,1202000000,1203000000,1204830000],
    kpis: { stockTotal:1204830000, skusActivos:362, fillRate:91.2, doh:31, rotacion:8.7, quiebre:13, sobrestock:67177600, ventaPerdida:38920000 },
    categorias: [
      { nombre:'Fertilizantes', skus:98, stock:640000000, doh:44, quiebre:8,  rotacion:7.2,  normal:80, enQuiebre: 8, enRiesgo:10 },
      { nombre:'Semillas',      skus:84, stock:285000000, doh:38, quiebre:12, rotacion:9.1,  normal:62, enQuiebre:10, enRiesgo:12 },
      { nombre:'Agroquímicos',  skus:76, stock:142000000, doh:22, quiebre:11, rotacion:11.4, normal:59, enQuiebre: 8, enRiesgo: 9 },
      { nombre:'Veterinaria',   skus:92, stock: 89000000, doh:29, quiebre:18, rotacion:8.3,  normal:61, enQuiebre:17, enRiesgo:14 },
      { nombre:'Alim. Animal',  skus:60, stock: 48830000, doh:18, quiebre:14, rotacion:13.2, normal:42, enQuiebre: 8, enRiesgo:10 },
    ],
    productos: [
      { sku:'AGR-1001', nombre:'Urea 46% Granulada',            categoria:'Fertilizantes', uom:'kg',    proveedor:'AgroSeed',  estadoVentas:'Activo',  existencia:48200, stockMin:10000, doh:58, rotacion:8.6,  costoUnit:8750,  costoUCompra:8600,  costoTotal:421680000, consumoSem:5300, consumoPHist:4800, v3m:134200, v6m:241600, fechaUltimaCompra:'12/03/2026', cantUltimaCompra:60000, estado:'Normal'  },
      { sku:'AGR-1012', nombre:'Semilla Soja RR 6200',          categoria:'Semillas',      uom:'kg',    proveedor:'AgroSeed',  estadoVentas:'Activo',  existencia:32400, stockMin: 8000, doh:44, rotacion:12.4, costoUnit:9650,  costoUCompra:9500,  costoTotal:312840000, consumoSem:1800, consumoPHist:1650, v3m:52200,  v6m:88400,  fechaUltimaCompra:'28/02/2026', cantUltimaCompra:40000, estado:'Normal'  },
      { sku:'AGR-1021', nombre:'NPK 15-15-15 Granulado',        categoria:'Fertilizantes', uom:'kg',    proveedor:'NutriCrop', estadoVentas:'Activo',  existencia:29100, stockMin: 7000, doh:36, rotacion:9.8,  costoUnit:7510,  costoUCompra:7400,  costoTotal:218600000, consumoSem:2500, consumoPHist:2300, v3m:75100,  v6m:138200, fechaUltimaCompra:'05/03/2026', cantUltimaCompra:35000, estado:'Normal'  },
      { sku:'ALI-4001', nombre:'Balanceado Bovino Inicio 40kg', categoria:'Alim. Animal',  uom:'kg',    proveedor:'NutriFeed', estadoVentas:'Alerta',  existencia:21600, stockMin: 5000, doh:22, rotacion:10.8, costoUnit:5940,  costoUCompra:5850,  costoTotal:128400000, consumoSem:2500, consumoPHist:2300, v3m:74800,  v6m:138000, fechaUltimaCompra:'01/04/2026', cantUltimaCompra:28000, estado:'Bajo'    },
      { sku:'AGR-1031', nombre:'Cal Agrícola Molida',           categoria:'Fertilizantes', uom:'kg',    proveedor:'NutriCrop', estadoVentas:'Activo',  existencia:62100, stockMin: 8000, doh:72, rotacion:1.8,  costoUnit:1435,  costoUCompra:1400,  costoTotal: 89100000, consumoSem:1200, consumoPHist:1100, v3m:28200,  v6m:52800,  fechaUltimaCompra:'18/01/2026', cantUltimaCompra:80000, estado:'Normal'  },
      { sku:'AGQ-3022', nombre:'Fungicida Captan 50%',          categoria:'Agroquímicos',  uom:'lt',    proveedor:'QuimAgro',  estadoVentas:'Quiebre', existencia:  180, stockMin: 1000, doh: 8, rotacion:3.2,  costoUnit:12000, costoUCompra:11800, costoTotal:  2160000, consumoSem: 280, consumoPHist: 260, v3m:8400,   v6m:15200,  fechaUltimaCompra:'15/11/2025', cantUltimaCompra:2000,  fechaVenc:'28/02/2026', estado:'Crítico',
        lotes:[{ lote:'L-2024-087', cantidad:120, fechaVenc:'28/02/2026' }, { lote:'L-2024-091', cantidad:60, fechaVenc:'28/02/2026' }] },
      { sku:'AGR-1044', nombre:'Semilla Girasol Confitero',     categoria:'Semillas',      uom:'kg',    proveedor:'AgroSeed',  estadoVentas:'Quiebre', existencia:  120, stockMin: 3000, doh: 6, rotacion:4.1,  costoUnit:13200, costoUCompra:13000, costoTotal:  1584000, consumoSem: 470, consumoPHist: 440, v3m:14050,  v6m:26200,  fechaUltimaCompra:'20/01/2026', cantUltimaCompra:10000, estado:'Crítico' },
      { sku:'VET-2019', nombre:'Complejo B Inyectable 100ml',   categoria:'Veterinaria',   uom:'amp',   proveedor:'VetSalud',  estadoVentas:'Activo',  existencia:  320, stockMin:  800, doh:41, rotacion:5.8,  costoUnit:6000,  costoUCompra:5900,  costoTotal:  1920000, consumoSem:  95, consumoPHist:  88, v3m:3200,   v6m:5800,   fechaUltimaCompra:'25/02/2026', cantUltimaCompra:1200,  estado:'Normal'  },
      { sku:'AGR-1055', nombre:'Semilla Sorgo Forrajero 10kg',  categoria:'Semillas',      uom:'kg',    proveedor:'AgroSeed',  estadoVentas:'Alerta',  existencia:   60, stockMin: 2000, doh:20, rotacion:6.2,  costoUnit:18000, costoUCompra:17500, costoTotal:  1080000, consumoSem:  80, consumoPHist:  75, v3m:2400,   v6m:4400,   fechaUltimaCompra:'20/10/2025', cantUltimaCompra:4000,  fechaVenc:'10/04/2026', estado:'Bajo',
        lotes:[{ lote:'L-2023-214', cantidad:60, fechaVenc:'10/04/2026' }] },
      { sku:'AGQ-3015', nombre:'Insecticida Clorpirifós 48%',   categoria:'Agroquímicos',  uom:'lt',    proveedor:'QuimAgro',  estadoVentas:'Activo',  existencia: 4200, stockMin: 2000, doh:28, rotacion:9.4,  costoUnit:12300, costoUCompra:12100, costoTotal: 51660000, consumoSem: 380, consumoPHist: 360, v3m:11400,  v6m:20800,  fechaUltimaCompra:'10/03/2026', cantUltimaCompra:5000,  estado:'Normal'  },
    ],
    proveedores: [
      { nombre:'AgroInsumos S.A.',    categorias:'Fertilizantes · Semillas',    skus:82, leadTime: 7, fillRate:94, entregasATiempo:96, ultimaCompra:  8, montoUltCompra: 184000000, ocPendiente: true,  estado:'ok'          },
      { nombre:'QuimAgro Ltda.',      categorias:'Agroquímicos',                skus:45, leadTime:10, fillRate:88, entregasATiempo:84, ultimaCompra: 14, montoUltCompra:  62400000, ocPendiente: false, estado:'advertencia' },
      { nombre:'VetSalud S.A.',       categorias:'Veterinaria',                 skus:67, leadTime: 5, fillRate:92, entregasATiempo:91, ultimaCompra:  5, montoUltCompra:  44800000, ocPendiente: true,  estado:'ok'          },
      { nombre:'NutriFeed Corp.',     categorias:'Alim. Animal',                skus:48, leadTime: 3, fillRate:96, entregasATiempo:98, ultimaCompra:  3, montoUltCompra:  38200000, ocPendiente: false, estado:'ok'          },
      { nombre:'SemillasPro Ltda.',   categorias:'Semillas',                    skus:34, leadTime:14, fillRate:87, entregasATiempo:82, ultimaCompra: 21, montoUltCompra:  96500000, ocPendiente: false, estado:'advertencia' },
    ],
    alerts: [
      { tier:'y', msg:'Cal Agrícola Molida — sobrestock $89.1M, DOH 72d (meta 30d). Considerar liquidación' },
      { tier:'y', msg:'Urea 46% — sobrestock $38.4M · DOH 58d supera meta 30d. Revisar reposición' },
      { tier:'r', msg:'Semilla Girasol Confitero — quiebre inminente (6d). Stock 120 uds vs. mín. 3,000' },
      { tier:'r', msg:'Fungicida Captan 50% — vencimiento 28/02/2026 · 180 uds · $2.16M en riesgo' },
      { tier:'g', msg:'Rotación 8.7x dentro del rango objetivo. Semilla Soja lidera con 12.4x' },
    ],
  },
  'Punto de Venta Sur': {
    estado: 'critico',
    evolucion: [398000000,410000000,420000000,430000000,440000000,445000000,442000000,438000000,432000000,428000000,424000000,421680000],
    kpis: { stockTotal:421680000, skusActivos:118, fillRate:34.0, doh:42, rotacion:4.1, quiebre:66, sobrestock:38420000, ventaPerdida:42100000 },
    categorias: [
      { nombre:'Agroquímicos',  skus:52, stock:184200000, doh:38, quiebre:58, rotacion:4.8, normal:12, enQuiebre:30, enRiesgo:10 },
      { nombre:'Fertilizantes', skus:40, stock:142000000, doh:48, quiebre:72, rotacion:3.2, normal: 5, enQuiebre:29, enRiesgo: 6 },
      { nombre:'Veterinaria',   skus:38, stock: 52000000, doh:44, quiebre:71, rotacion:4.6, normal: 5, enQuiebre:27, enRiesgo: 6 },
      { nombre:'Alim. Animal',  skus:30, stock: 28000000, doh:36, quiebre:63, rotacion:5.1, normal: 5, enQuiebre:19, enRiesgo: 6 },
      { nombre:'Semillas',      skus:24, stock: 15480000, doh:42, quiebre:68, rotacion:3.8, normal: 4, enQuiebre:16, enRiesgo: 4 },
    ],
    productos: [
      { sku:'AGQ-3001', nombre:'Herbicida Glifosato 48%',      categoria:'Agroquímicos',  uom:'lt',    proveedor:'MultiAgro', estadoVentas:'Activo',  existencia:18400, stockMin:4000, doh:38, rotacion:11.1, costoUnit:10010, costoUCompra:9850,  costoTotal:184200000, consumoSem:1500, consumoPHist:1380, v3m:44000,  v6m:79200,  fechaUltimaCompra:'18/03/2026', cantUltimaCompra:20000, estado:'Normal'  },
      { sku:'AGQ-3015', nombre:'Insecticida Clorpirifós 48%',  categoria:'Agroquímicos',  uom:'lt',    proveedor:'MultiAgro', estadoVentas:'Quiebre', existencia:    0, stockMin:2000, doh: 0, rotacion: 0.0, costoUnit:12300, costoUCompra:12100, costoTotal:       0, consumoSem: 480, consumoPHist: 420, v3m:14200,  v6m:25400,  fechaUltimaCompra:'10/01/2026', cantUltimaCompra:8000,  estado:'Crítico' },
      { sku:'AGQ-3008', nombre:'Herbicida Atrazina 50% SC',    categoria:'Agroquímicos',  uom:'lt',    proveedor:'MultiAgro', estadoVentas:'Quiebre', existencia:    5, stockMin:2000, doh: 1, rotacion: 1.2, costoUnit:8500,  costoUCompra:8400,  costoTotal:   42500, consumoSem: 420, consumoPHist: 390, v3m:12600,  v6m:22800,  fechaUltimaCompra:'05/01/2026', cantUltimaCompra:6000,  estado:'Crítico' },
      { sku:'VET-2008', nombre:'Antibiótico Oxitetraciclina',  categoria:'Veterinaria',   uom:'amp',   proveedor:'VetSalud',  estadoVentas:'Activo',  existencia:  880, stockMin: 500, doh:38, rotacion: 3.4, costoUnit:4727,  costoUCompra:4600,  costoTotal: 4160000, consumoSem: 140, consumoPHist: 130, v3m:4200,   v6m:7800,   fechaUltimaCompra:'12/03/2026', cantUltimaCompra:2000,  estado:'Normal'  },
      { sku:'VET-2033', nombre:'Oxitocina 10 UI 10ml',         categoria:'Veterinaria',   uom:'amp',   proveedor:'VetSalud',  estadoVentas:'Alerta',  existencia:  200, stockMin: 400, doh:25, rotacion: 4.2, costoUnit:4200,  costoUCompra:4100,  costoTotal:  840000, consumoSem:  96, consumoPHist:  88, v3m:2880,   v6m:5200,   fechaUltimaCompra:'20/02/2026', cantUltimaCompra:1000,  fechaVenc:'05/04/2026', estado:'Bajo',
        lotes:[{ lote:'L-2025-033', cantidad:120, fechaVenc:'05/04/2026' }, { lote:'L-2025-041', cantidad:80, fechaVenc:'05/04/2026' }] },
      { sku:'ALI-4012', nombre:'Premezcla Vitamínica Aviar',   categoria:'Alim. Animal',  uom:'kg',    proveedor:'NutriFeed', estadoVentas:'Alerta',  existencia:   90, stockMin: 500, doh:12, rotacion: 2.8, costoUnit:11000, costoUCompra:10800, costoTotal:  990000, consumoSem: 180, consumoPHist: 165, v3m:5400,   v6m:9800,   fechaUltimaCompra:'10/11/2025', cantUltimaCompra:1500,  fechaVenc:'10/03/2026', estado:'Bajo',
        lotes:[{ lote:'L-2025-008', cantidad:90, fechaVenc:'10/03/2026' }] },
      { sku:'AGR-1021', nombre:'NPK 15-15-15 Granulado',       categoria:'Fertilizantes', uom:'kg',    proveedor:'NutriCrop', estadoVentas:'Activo',  existencia:12400, stockMin:4000, doh:36, rotacion: 5.8, costoUnit:7510,  costoUCompra:7400,  costoTotal: 93200000, consumoSem: 900, consumoPHist: 840, v3m:27000,  v6m:49600,  fechaUltimaCompra:'22/02/2026', cantUltimaCompra:15000, estado:'Normal'  },
      { sku:'AGQ-3041', nombre:'Insecticida Endosulfán 35%',   categoria:'Agroquímicos',  uom:'lt',    proveedor:'MultiAgro', estadoVentas:'Alerta',  existencia:  140, stockMin: 800, doh:30, rotacion: 3.1, costoUnit:12000, costoUCompra:11800, costoTotal: 1680000, consumoSem: 110, consumoPHist: 100, v3m:3300,   v6m:6200,   fechaUltimaCompra:'15/02/2026', cantUltimaCompra:1000,  estado:'Normal'  },
    ],
    proveedores: [
      { nombre:'AgroInsumos S.A.',    categorias:'Agroquímicos',                skus:28, leadTime:12, fillRate:48, entregasATiempo:52, ultimaCompra: 32, montoUltCompra:  28400000, ocPendiente: false, estado:'critico'     },
      { nombre:'FertiMax Ltda.',      categorias:'Fertilizantes',               skus:30, leadTime:15, fillRate:41, entregasATiempo:47, ultimaCompra: 45, montoUltCompra:  42100000, ocPendiente: false, estado:'critico'     },
      { nombre:'VetSalud S.A.',       categorias:'Veterinaria',                 skus:22, leadTime: 8, fillRate:55, entregasATiempo:61, ultimaCompra: 28, montoUltCompra:  14600000, ocPendiente: false, estado:'critico'     },
      { nombre:'AlimPro S.A.',        categorias:'Alim. Animal',                skus:18, leadTime: 5, fillRate:62, entregasATiempo:70, ultimaCompra: 18, montoUltCompra:   8900000, ocPendiente: true,  estado:'advertencia' },
    ],
    alerts: [
      { tier:'r', msg:'66% de SKUs en quiebre — $42.1M en venta perdida estimada este mes' },
      { tier:'r', msg:'Insecticida Clorpirifós — 0 existencias, 21 días sin stock. Reposición urgente' },
      { tier:'r', msg:'Herbicida Atrazina — stock crítico (5 uds), 1 día de cobertura restante' },
      { tier:'y', msg:'Fill Rate 34% muy bajo meta (94%). Revisar plan de reposición inmediato' },
      { tier:'y', msg:'Oxitocina vencida — 200 uds · $840K en riesgo. Fecha: 05/04/2026' },
    ],
  },
  'Sucursal Norte': {
    estado: 'advertencia',
    evolucion: [195000000,198000000,200000000,205000000,208000000,210000000,212000000,211000000,213000000,214000000,215000000,216140000],
    kpis: { stockTotal:216140000, skusActivos:186, fillRate:72.5, doh:28, rotacion:11.2, quiebre:54, sobrestock:10851100, ventaPerdida:17400000 },
    categorias: [
      { nombre:'Veterinaria',   skus:68, stock: 88000000, doh:22, quiebre:48, rotacion:12.8, normal:21, enQuiebre:33, enRiesgo:14 },
      { nombre:'Agroquímicos',  skus:58, stock: 62000000, doh:24, quiebre:55, rotacion:11.4, normal:14, enQuiebre:32, enRiesgo:12 },
      { nombre:'Alim. Animal',  skus:44, stock: 38000000, doh:30, quiebre:61, rotacion:10.2, normal: 7, enQuiebre:27, enRiesgo:10 },
      { nombre:'Semillas',      skus:38, stock: 22000000, doh:26, quiebre:52, rotacion:9.8,  normal: 8, enQuiebre:20, enRiesgo:10 },
      { nombre:'Fertilizantes', skus:32, stock:  6140000, doh:18, quiebre:54, rotacion:13.1, normal: 7, enQuiebre:17, enRiesgo: 8 },
    ],
    productos: [
      { sku:'VET-2001', nombre:'Vacuna Triple Bovina',          categoria:'Veterinaria',  uom:'dosis', proveedor:'BioVet',    estadoVentas:'Activo',  existencia: 9800, stockMin:2000, doh:31, rotacion:14.2, costoUnit:14520, costoUCompra:14200, costoTotal:142300000, consumoSem: 920, consumoPHist: 870, v3m:28400,  v6m:52100,  fechaUltimaCompra:'22/03/2026', cantUltimaCompra:12000, estado:'Normal'  },
      { sku:'VET-2031', nombre:'Vacuna Aftosa Bivalente',       categoria:'Veterinaria',  uom:'dosis', proveedor:'BioVet',    estadoVentas:'Quiebre', existencia:    0, stockMin:1500, doh: 0, rotacion: 0.0, costoUnit:21440, costoUCompra:21000, costoTotal:       0, consumoSem: 360, consumoPHist: 330, v3m:10720,  v6m:19800,  fechaUltimaCompra:'15/01/2026', cantUltimaCompra:5000,  estado:'Crítico' },
      { sku:'VET-2019', nombre:'Antiparasitario Ivermectina',   categoria:'Veterinaria',  uom:'amp',   proveedor:'VetNorte',  estadoVentas:'Quiebre', existencia:   12, stockMin: 800, doh: 2, rotacion: 5.8, costoUnit:6000,  costoUCompra:5850,  costoTotal:   72000, consumoSem: 260, consumoPHist: 240, v3m:7800,   v6m:14200,  fechaUltimaCompra:'28/01/2026', cantUltimaCompra:2000,  estado:'Crítico' },
      { sku:'VET-2014', nombre:'Vacuna Brucelosis 10ml',        categoria:'Veterinaria',  uom:'amp',   proveedor:'BioVet',    estadoVentas:'Alerta',  existencia:  240, stockMin: 500, doh:74, rotacion: 2.2, costoUnit:13000, costoUCompra:12800, costoTotal: 3120000, consumoSem:  74, consumoPHist:  68, v3m:2220,   v6m:4100,   fechaUltimaCompra:'10/10/2025', cantUltimaCompra:800,   fechaVenc:'15/02/2026', estado:'Normal',
        lotes:[{ lote:'L-2025-052', cantidad:140, fechaVenc:'15/02/2026' }, { lote:'L-2025-061', cantidad:100, fechaVenc:'15/02/2026' }] },
      { sku:'ALI-4007', nombre:'Suplemento Mineral Bovino',     categoria:'Alim. Animal', uom:'kg',    proveedor:'AlimNorte', estadoVentas:'Quiebre', existencia:   18, stockMin: 600, doh: 3, rotacion: 8.4, costoUnit:9000,  costoUCompra:8800,  costoTotal:  162000, consumoSem: 190, consumoPHist: 175, v3m:5700,   v6m:10400,  fechaUltimaCompra:'05/02/2026', cantUltimaCompra:1200,  estado:'Crítico' },
      { sku:'AGQ-3004', nombre:'Fungicida Mancozeb 80%',        categoria:'Agroquímicos', uom:'kg',    proveedor:'AgroSur',   estadoVentas:'Activo',  existencia: 8400, stockMin:2000, doh:14, rotacion: 6.2, costoUnit:1750,  costoUCompra:1720,  costoTotal: 14700000, consumoSem: 880, consumoPHist: 820, v3m:26400,  v6m:48600,  fechaUltimaCompra:'15/03/2026', cantUltimaCompra:10000, estado:'Normal'  },
      { sku:'AGQ-3041', nombre:'Insecticida Endosulfán 35%',    categoria:'Agroquímicos', uom:'lt',    proveedor:'AgroSur',   estadoVentas:'Alerta',  existencia:  140, stockMin: 800, doh:30, rotacion: 3.4, costoUnit:12000, costoUCompra:11800, costoTotal: 1680000, consumoSem: 110, consumoPHist: 100, v3m:3300,   v6m:6200,   fechaUltimaCompra:'20/02/2026', cantUltimaCompra:1000,  estado:'Normal'  },
      { sku:'ALI-4001', nombre:'Balanceado Bovino Inicio 40kg', categoria:'Alim. Animal', uom:'kg',    proveedor:'AlimNorte', estadoVentas:'Alerta',  existencia: 4800, stockMin:2000, doh:18, rotacion:12.4, costoUnit:5940,  costoUCompra:5850,  costoTotal: 28512000, consumoSem: 720, consumoPHist: 680, v3m:21600,  v6m:40200,  fechaUltimaCompra:'08/03/2026', cantUltimaCompra:8000,  estado:'Bajo'    },
    ],
    proveedores: [
      { nombre:'VetNorte Ltda.',      categorias:'Veterinaria',                 skus:52, leadTime: 6, fillRate:71, entregasATiempo:74, ultimaCompra: 12, montoUltCompra:  68400000, ocPendiente: true,  estado:'advertencia' },
      { nombre:'AgroSur S.A.',        categorias:'Agroquímicos · Fertilizantes', skus:44, leadTime: 9, fillRate:68, entregasATiempo:72, ultimaCompra: 19, montoUltCompra:  52300000, ocPendiente: false, estado:'advertencia' },
      { nombre:'AlimNorte Corp.',     categorias:'Alim. Animal',                skus:32, leadTime: 4, fillRate:64, entregasATiempo:68, ultimaCompra:  7, montoUltCompra:  24100000, ocPendiente: true,  estado:'advertencia' },
      { nombre:'SemillasNorte Ltda.', categorias:'Semillas',                    skus:28, leadTime:11, fillRate:73, entregasATiempo:76, ultimaCompra: 24, montoUltCompra:  18600000, ocPendiente: false, estado:'advertencia' },
      { nombre:'FertiNorte S.A.',     categorias:'Fertilizantes',               skus:18, leadTime: 7, fillRate:77, entregasATiempo:80, ultimaCompra:  9, montoUltCompra:   8200000, ocPendiente: false, estado:'ok'          },
    ],
    alerts: [
      { tier:'r', msg:'Vacuna Aftosa Bivalente — quiebre total, 35 días sin stock. Impacto $10.7M' },
      { tier:'r', msg:'Antiparasitario Ivermectina — 12 uds, 2 días cobertura. Reposición urgente' },
      { tier:'r', msg:'Suplemento Mineral Bovino — stock 18 uds, 3 días vs. mín. 600' },
      { tier:'y', msg:'54% quiebre de SKUs. Fill Rate 72.5% bajo meta (94%)' },
      { tier:'y', msg:'Vacuna Brucelosis vencida — 240 uds · $3.12M. Venc.: 15/02/2026' },
    ],
  },
};

const ESTADO_CHIP = {
  Normal:   { bg:'#f0fdf4', color:'#16a34a', bd:'#86efac' },
  Bajo:     { bg:'#fef3c7', color:'#d97706', bd:'#fcd34d' },
  Crítico:  { bg:'#fef2f2', color:'#dc2626', bd:'#fca5a5' },
};
const ALMACEN_ESTADO = {
  ok:          { color:'#16a34a', bg:'#f0fdf4', bd:'#86efac',  label:'✓ OK'        },
  advertencia: { color:'#d97706', bg:'#fef3c7', bd:'#fcd34d',  label:'⚠ Atención'  },
  critico:     { color:'#dc2626', bg:'#fef2f2', bd:'#fca5a5',  label:'! Crítico'   },
};
const DOH_META = 30;

const CAT_PER_PAGE = 4;   // categorías visibles por página en los charts

export default function InventarioAlmacen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prodPage, setProdPage] = useState(0);
  const [tabProd,  setTabProd]  = useState('sinStock');
  const [detCat,   setDetCat]   = useState('Todos');
  const [chartTab,    setChartTab]    = useState('doh');
  const [invSubView,  setInvSubView]  = useState('producto');
  const [rangeMonths, setRangeMonths] = useState(6);
  const [kpiTab,      setKpiTab]      = useState('inventario');
  const [dohPage,  setDohPage]  = useState(0);
  const [quebPage, setQuebPage] = useState(0);
  const [provPage, setProvPage] = useState(0);
  const [invPage,  setInvPage]  = useState(0);
  const PER_PAGE = 6;

  const nombre = decodeURIComponent(id || '');
  const data   = ALMACENES_DATA[nombre];

  if (!data) return (
    <Box sx={{ p:'40px', textAlign:'center' }}>
      <Typography sx={{ fontFamily:FONT, fontSize:14, color:DL.tM }}>Almacén no encontrado: "{nombre}"</Typography>
    </Box>
  );

  const { kpis, categorias, productos, proveedores, alerts } = data;
  const ec = ALMACEN_ESTADO[data.estado] || ALMACEN_ESTADO.ok;

  // Tab classification
  const pSinStock   = productos.filter(p => p.existencia === 0);
  const pEnRiesgo   = productos.filter(p => p.existencia > 0 && p.existencia < p.stockMin);
  const pSobreStock = productos.filter(p => p.doh > 45 && p.existencia >= p.stockMin);
  const pVencido    = productos.filter(p => p.fechaVenc);
  const TAB_PRODS   = { todos: productos, sinStock: pSinStock, enRiesgo: pEnRiesgo, sobreStock: pSobreStock, vencido: pVencido };
  const tabListAll  = TAB_PRODS[tabProd] ?? [];
  const detCats     = ['Todos', ...new Set(tabListAll.map(p => p.categoria))];
  const tabList     = detCat === 'Todos' ? tabListAll : tabListAll.filter(p => p.categoria === detCat);
  const prodRows    = tabList.slice(prodPage * PER_PAGE, (prodPage + 1) * PER_PAGE);
  const dohRows   = categorias.slice(dohPage  * CAT_PER_PAGE, (dohPage   + 1) * CAT_PER_PAGE);
  const quebRows  = categorias.slice(quebPage * CAT_PER_PAGE, (quebPage  + 1) * CAT_PER_PAGE);
  const provRows  = proveedores.slice(provPage * PER_PAGE,    (provPage  + 1) * PER_PAGE);

  // ── Inventario por Producto / Proveedor ──────────────────────────────────
  const fmtInv = v => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v/1e3)}K` : `$${v}`;
  const invProdRows = [...productos]
    .sort((a,b) => b.costoTotal - a.costoTotal)
    .slice(invPage * CAT_PER_PAGE, (invPage + 1) * CAT_PER_PAGE);
  const invProvMap = {};
  productos.forEach(p => {
    if (!invProvMap[p.proveedor]) invProvMap[p.proveedor] = 0;
    invProvMap[p.proveedor] += p.costoTotal;
  });
  const invProvData = Object.entries(invProvMap)
    .map(([nombre, val]) => ({ nombre, val }))
    .sort((a,b) => b.val - a.val);
  const invProvRows = invProvData.slice(invPage * CAT_PER_PAGE, (invPage + 1) * CAT_PER_PAGE);
  const invRows     = invSubView === 'producto' ? invProdRows : invProvRows;
  const invTotal    = invSubView === 'producto' ? productos.length : invProvData.length;

  const invOption = {
    backgroundColor:'transparent',
    tooltip:{
      trigger:'axis', axisPointer:{ type:'shadow' },
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      extraCssText:'box-shadow:0 4px 16px rgba(26,26,26,.12);border-radius:8px;padding:10px 14px',
      formatter: p => {
        const v = invSubView === 'producto' ? p[0].data.costoTotal : p[0].data.val;
        const lbl = p[0].axisValue;
        return `<div style="font-family:'Inter',sans-serif">
          <div style="font-size:11px;font-weight:500;color:#1b1b1b;margin-bottom:6px">${lbl}</div>
          <div style="font-size:9px;color:#6a6a6a;text-transform:uppercase">Valor en inventario</div>
          <div style="font-size:15px;font-weight:500;color:#1a1a1a">${fmtInv(v)}</div>
        </div>`;
      },
    },
    grid:{ top:8, right:70, bottom:8, left:8, containLabel:true },
    xAxis:{ type:'value', axisLabel:{show:false}, axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:'rgba(26,26,26,.06)',type:'dashed'}} },
    yAxis:{
      type:'category',
      data: invRows.map(r => invSubView === 'producto'
        ? (r.nombre.length > 20 ? r.nombre.slice(0,18)+'…' : r.nombre)
        : r.nombre),
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{ fontFamily:FONT, fontSize:9.5, color:DL.tH, fontWeight: 500 },
      inverse:true,
    },
    series:[{
      type:'bar', barMaxWidth:22, barMinHeight:6,
      data: invRows.map(r => ({
        value: invSubView === 'producto' ? r.costoTotal : r.val,
        costoTotal: r.costoTotal,
        val: r.val,
        itemStyle:{ color:DL.blue, borderRadius:[0,5,5,0] },
      })),
      label:{ show:true, position:'right', fontFamily:FONT, fontSize:9.5, fontWeight: 500, color:DL.tH,
        formatter: p => fmtInv(invSubView === 'producto' ? p.data.costoTotal : p.data.val) },
    }],
  };

  // ── DOH por categoría chart (paginado) ───────────────────────────────────
  const CHART_H = CAT_PER_PAGE * 62 + 16;

  const dohOption = {
    tooltip: {
      trigger:'axis', axisPointer:{type:'shadow'}, backgroundColor:'#fff',
      borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      textStyle:{fontFamily:FONT, fontSize:10},
      formatter: p => `<b>${p[0].axisValue}</b><br/>${p[0].marker}DOH: <b>${p[0].value}d</b><br/>Meta: <b>${DOH_META}d</b>`,
    },
    grid:{ top:8, right:64, bottom:8, left:14, containLabel:true },
    xAxis:{
      type:'value', max:80,
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{fontFamily:FONT, fontSize:9, color:DL.tS, formatter:v=>`${v}d`},
      splitLine:{lineStyle:{color:'rgba(26,26,26,.06)', type:'dashed'}},
    },
    yAxis:{
      type:'category', data:dohRows.map(c=>c.nombre),
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{fontFamily:FONT, fontSize:10, color:DL.tM, fontWeight: 500},
    },
    series:[{
      type:'bar', barMaxWidth:40, barCategoryGap:'28%',
      data: dohRows.map(c=>({
        value:c.doh,
        itemStyle:{ color: c.doh > DOH_META ? '#dc2626' : DL.blue, borderRadius:[0,5,5,0] },
      })),
      label:{show:true, position:'right', fontFamily:FONT, fontSize:11, fontWeight: 500, color:DL.tH, formatter:p=>`${p.value}d`},
    }],
  };

  // ── Quiebre por categoría chart (paginado) ───────────────────────────────
  const quebOption = {
    tooltip:{
      trigger:'axis', axisPointer:{type:'shadow'}, backgroundColor:'#fff',
      borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      textStyle:{fontFamily:FONT, fontSize:10},
      formatter:p=>`<b>${p[0].axisValue}</b><br/>Quiebre: <b>${p[0].value}%</b>`,
    },
    grid:{top:8, right:54, bottom:8, left:14, containLabel:true},
    xAxis:{
      type:'value', max:100,
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{fontFamily:FONT, fontSize:9, color:DL.tS, formatter:v=>`${v}%`},
      splitLine:{lineStyle:{color:'rgba(26,26,26,.06)', type:'dashed'}},
    },
    yAxis:{
      type:'category', data:quebRows.map(c=>c.nombre),
      axisLine:{show:false}, axisTick:{show:false},
      axisLabel:{fontFamily:FONT, fontSize:10, color:DL.tM, fontWeight: 500},
    },
    series:[{
      type:'bar', barMaxWidth:40, barCategoryGap:'28%',
      data: quebRows.map(c=>({
        value:c.quiebre,
        itemStyle:{
          color: c.quiebre > 60 ? '#dc2626' : c.quiebre > 30 ? '#f97316' : DL.green,
          borderRadius:[0,5,5,0],
        },
      })),
      label:{show:true, position:'right', fontFamily:FONT, fontSize:11, fontWeight: 500, color:DL.tH, formatter:p=>`${p.value}%`},
    }],
  };

  // ── Evolución de KPIs — 4 tabs ─────────────────────────────────────────
  const INV_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const evolMonths = INV_MONTHS.slice(-rangeMonths);

  // Seed para ruido determinístico basado en el nombre del almacén
  const kpiSeed = nombre.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const deterNoise = (i, amp) => Math.round(amp * Math.sin(i * 1.9 + kpiSeed * 0.31));

  // Inventario (datos reales)
  const evolInvData = (data.evolucion || []).slice(-rangeMonths);

  // Fill Rate: tendencia hacia el valor actual con variación orgánica
  const evolFillData = evolMonths.map((_, i) => {
    const base = Math.round(kpis.fillRate - (rangeMonths - 1 - i) * (kpis.fillRate < 80 ? 1.4 : 0.5));
    return Math.min(100, Math.max(0, base + deterNoise(i, 2.8)));
  });

  // DOH: basado en el nivel de inventario relativo
  const evolDohData = evolMonths.map((_, i) => {
    const base = Math.round(kpis.doh - (rangeMonths - 1 - i) * (kpis.doh > 30 ? 1.2 : -0.8));
    return Math.max(0, base + deterNoise(i + 7, 3.2));
  });

  // OTIF: similar a Fill Rate pero con distintos valores base
  const otifBase = Math.min(99, Math.round(kpis.fillRate * 1.08));
  const evolOtifData = evolMonths.map((_, i) => {
    const base = Math.round(otifBase - (rangeMonths - 1 - i) * (otifBase < 80 ? 1.2 : 0.4));
    return Math.min(100, Math.max(0, base + deterNoise(i + 13, 2.4)));
  });

  // Helper para construir opciones de gráfica de línea KPI
  const mkKpiOpt = ({ data: seriesData, color, yFmt, name, yMin }) => ({
    backgroundColor: 'transparent',
    tooltip:{
      trigger:'axis',
      axisPointer:{ type:'line', lineStyle:{ color:'rgba(26,26,26,.15)', width:1, type:'dashed' } },
      backgroundColor:'#fff', borderColor:'rgba(26,26,26,.12)', borderWidth:1,
      extraCssText:'box-shadow:0 4px 16px rgba(26,26,26,.10);border-radius:10px;padding:10px 14px',
      textStyle:{ fontFamily:FONT, fontSize:10 },
      formatter: p => `<div style="font-family:'Inter',sans-serif;min-width:120px">
        <div style="font-size:12px;font-weight:500;color:#1b1b1b;margin-bottom:4px">${p[0]?.axisValue}</div>
        <div style="font-size:15px;font-weight:500;color:${color}">${yFmt(p[0]?.value)}</div>
        <div style="font-size:9px;color:#6a6a6a;margin-top:2px;text-transform:uppercase;letter-spacing:.04em">${name}</div>
      </div>`,
    },
    legend:{ show:false },
    grid:{ top:16, right:20, bottom:24, left:60 },
    xAxis:{
      type:'category', data:evolMonths,
      axisLine:{ show:false }, axisTick:{ show:false },
      axisLabel:{ fontFamily:FONT, fontSize:9, color:DL.tS },
      splitLine:{ show:false },
    },
    yAxis:{
      type:'value', min: yMin ?? 'dataMin',
      axisLine:{ show:false }, axisTick:{ show:false },
      axisLabel:{ fontFamily:FONT, fontSize:9, color:DL.tS, formatter: yFmt },
      splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)', type:'dashed' } },
    },
    series:[{
      name, type:'line', smooth:false,
      data: seriesData,
      symbolSize:4, symbol:'circle',
      lineStyle:{ color, width:2 },
      itemStyle:{ color, borderColor:'#fff', borderWidth:2 },
      areaStyle:{ color:{ type:'linear', x:0, y:0, x2:0, y2:1,
        colorStops:[{ offset:0, color:`${color}28` },{ offset:1, color:`${color}04` }] } },
    }],
  });

  const KPI_OPTS = {
    inventario: mkKpiOpt({ data: evolInvData, color:'#6c6c6c', yFmt: fmtMoney,       name:'Stock valorizado',  yMin: Math.min(...evolInvData) * 0.96 }),
    fillRate:   mkKpiOpt({ data: evolFillData, color:'#16a34a', yFmt: v => `${v}%`,   name:'Fill Rate',         yMin: Math.max(0, Math.min(...evolFillData) - 5) }),
    doh:        mkKpiOpt({ data: evolDohData,  color:DL.navy,   yFmt: v => `${v}d`,   name:'Días de cobertura', yMin: 0 }),
    otif:       mkKpiOpt({ data: evolOtifData, color:'#4d3f32', yFmt: v => `${v}%`,   name:'OTIF',              yMin: Math.max(0, Math.min(...evolOtifData) - 5) }),
  };

  const KPI_TABS = [
    { key:'inventario', label:'Inventario', color:'#6c6c6c' },
    { key:'fillRate',   label:'Fill Rate',  color:'#16a34a' },
    { key:'doh',        label:'DOH',        color:DL.navy   },
    { key:'otif',       label:'OTIF',       color:'#4d3f32' },
  ];

  return (
    <Box sx={{ display:'flex', flexDirection:'column', background:DL.bg }}>

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <PageHeader title={nombre} onBack={() => navigate('/inventario')} live>
        <Box sx={{
          display:'inline-flex', px:'10px', py:'4px', borderRadius:'4px',
          background:ec.bg, color:ec.color, fontSize:10, fontWeight: 500,
          fontFamily:FONT, border:`1px solid ${ec.bd}`,
        }}>
          {ec.label}
        </Box>
      </PageHeader>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <Box sx={{ p:'16px', display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ── ROW 1: KPI CARDS ──────────────────────────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          <KpiCard
            lbl="Stock Total"
            val={fmtMoney(kpis.stockTotal)}
            pct={Math.round(kpis.stockTotal / 1200000000 * 100)}
            metaLbl="Capacidad"
            meta={fmtMoney(1200000000)}
            diff="+2.1% vs mes ant."
            diffUp
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="SKUs Activos"
            val={`${kpis.skusActivos}`}
            pct={Math.round(kpis.skusActivos / (kpis.skusActivos + Math.round(kpis.quiebre / 100 * kpis.skusActivos)) * 100)}
            metaLbl="Total SKUs"
            meta={`${Math.round(kpis.skusActivos * 100 / (100 - kpis.quiebre))}`}
            diff={`${kpis.quiebre}% en quiebre`}
            diffUp={kpis.quiebre < 20}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Fill Rate"
            val={`${kpis.fillRate}%`}
            pct={Math.round(kpis.fillRate / 94 * 100)}
            metaLbl="Meta"
            meta="94%"
            diff={kpis.fillRate >= 90 ? '+1.2% vs mes ant.' : '-3.4% vs mes ant.'}
            diffUp={kpis.fillRate >= 90}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="DOH"
            val={`${kpis.doh} días`}
            pct={Math.round(30 / kpis.doh * 100)}
            metaLbl="Meta"
            meta="30 días"
            diff={kpis.doh <= 30 ? '✓ Dentro de meta' : `+${kpis.doh - 30}d sobre meta`}
            diffUp={kpis.doh <= 30}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Rotación"
            val={`${kpis.rotacion.toFixed(1)}x`}
            pct={Math.round(kpis.rotacion / 9 * 100)}
            metaLbl="Meta"
            meta="9.0x"
            diff={kpis.rotacion >= 9 ? '+0.3x vs mes ant.' : '-0.4x vs mes ant.'}
            diffUp={kpis.rotacion >= 9}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Quiebre de Stock"
            val={`${kpis.quiebre}%`}
            pct={100 - kpis.quiebre}
            metaLbl="Meta"
            meta="0%"
            diff={`${fmtMoney(kpis.ventaPerdida)} pérdida est.`}
            diffUp={false}
            barSplit={kpis.quiebre}
            valHighlight
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Sobrestock"
            val={fmtMoney(kpis.sobrestock)}
            pct={Math.round(kpis.sobrestock / kpis.stockTotal * 100)}
            metaLbl="Meta"
            meta="$0"
            diff={`${(kpis.sobrestock / kpis.stockTotal * 100).toFixed(1)}% del stock total`}
            diffUp={false}
            onInfo={()=>{}}
          />
          <KpiCard
            lbl="Venta Perdida Est."
            val={fmtMoney(kpis.ventaPerdida)}
            pct={0}
            metaLbl="Meta"
            meta="$0"
            diff="Por quiebre de stock"
            diffUp={false}
            valHighlight
            onInfo={()=>{}}
          />
        </Box>

        {/* ── ROW 2: EVOLUCIÓN DE KPIs + ALERTAS ───────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px', alignItems:'stretch' }}>

          {/* Evolución de KPIs */}
          <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
            {/* header + slider */}
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Box>
                <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Evolución de KPIs</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>Tendencia mensual vs. meta</Typography>
              </Box>
              <Box sx={{ display:'flex', alignItems:'center', gap:'7px', flexShrink:0 }}>
                <Box component="input" type="range" min={1} max={12} step={1}
                  value={rangeMonths}
                  onChange={e => setRangeMonths(Number(e.target.value))}
                  sx={{
                    width:90, height:3, borderRadius:2,
                    outline:'none', border:'none', cursor:'pointer',
                    appearance:'none', WebkitAppearance:'none',
                    background:`linear-gradient(to right, ${DL.navy} 0%, ${DL.navy} ${((rangeMonths-1)/11)*100}%, #e3e3e3 ${((rangeMonths-1)/11)*100}%, #e3e3e3 100%)`,
                    '&::-webkit-slider-thumb':{ WebkitAppearance:'none', appearance:'none', width:14, height:14, borderRadius:'50%', background:DL.navy, cursor:'pointer', border:'2px solid #fff', boxShadow:'0 0 0 2px rgba(0,0,70,.2)' },
                    '&::-moz-range-thumb':{ width:14, height:14, borderRadius:'50%', background:DL.navy, cursor:'pointer', border:'2px solid #fff', boxShadow:'0 0 0 2px rgba(0,0,70,.2)' },
                  }}
                />
                <Box sx={{ width:20, height:20, borderRadius:'50%', background:DL.navy, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:'#fff', fontFamily:FONT, lineHeight:1 }}>{rangeMonths}</Typography>
                </Box>
              </Box>
            </Box>
            {/* 4 tabs: Inventario / Fill Rate / DOH / OTIF — estilo pill */}
            <Box sx={{ display:'flex', gap:'5px', px:'16px', pb:'8px', borderBottom:`1px solid ${DL.border}` }}>
              {KPI_TABS.map(t => {
                const active = kpiTab === t.key;
                return (
                  <Box key={t.key} component="button" onClick={() => setKpiTab(t.key)} sx={{
                    px:'13px', py:'5px', borderRadius:'4px',
                    background: active ? t.color : 'transparent',
                    color: active ? '#fff' : DL.tS,
                    border: active ? 'none' : `1px solid ${DL.border}`,
                    fontFamily:FONT, fontSize:10, fontWeight: 500,
                    cursor:'pointer', outline:'none', whiteSpace:'nowrap',
                    transition:'all .15s',
                    '&:hover':{ background: active ? t.color : `${t.color}12`, color: active ? '#fff' : t.color, borderColor: t.color },
                  }}>
                    {t.label}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ px:'8px', pb:'8px', flex:1 }}>
              <ReactECharts key={kpiTab} option={KPI_OPTS[kpiTab]} style={{ height:240 }} />
            </Box>
          </Box>

          {/* Alertas */}
          <AlertasSistema alerts={alerts} title={`Alertas — ${nombre}`} />
        </Box>

        {/* ── ROW 3: DOH / QUIEBRE + PROVEEDORES ───────────────────────────── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', alignItems:'stretch' }}>

          {/* DOH / Quiebre / Inventario — tarjeta con tabs */}
          <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Box>
                <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>
                  {chartTab === 'doh' ? 'DOH por Categoría' : chartTab === 'quiebre' ? 'Quiebre por Categoría' : `Inventario por ${invSubView === 'producto' ? 'Producto' : 'Proveedor'}`}
                </Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>
                  {chartTab === 'doh' ? 'Días de inventario disponible por categoría' : chartTab === 'quiebre' ? '% SKUs sin stock por categoría' : 'Valor en inventario ($)'}
                </Typography>
              </Box>
              {/* Dropdown solo visible en tab Inventario */}
              {chartTab === 'inventario' && (
                <Box
                  component="select"
                  value={invSubView}
                  onChange={e => { setInvSubView(e.target.value); setInvPage(0); }}
                  sx={{
                    fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.navy,
                    border:`1px solid rgba(26,26,26,.2)`, borderRadius:'6px',
                    px:'10px', py:'4px', background:'rgba(26,26,26,.04)',
                    cursor:'pointer', outline:'none',
                    '&:focus':{ borderColor:DL.blue },
                  }}
                >
                  <option value="producto">Por Producto</option>
                  <option value="proveedor">Por Proveedor</option>
                </Box>
              )}
            </Box>
            <Box sx={{ display:'flex', gap:0, borderBottom:`1px solid ${DL.border}`, px:'14px', flexShrink:0 }}>
              {[
                { key:'doh',        lbl:'DOH'        },
                { key:'quiebre',    lbl:'Quiebre'    },
                { key:'inventario', lbl:'Inventario' },
              ].map(t => {
                const active = chartTab === t.key;
                return (
                  <Box key={t.key} component="button" onClick={() => { setChartTab(t.key); setInvPage(0); }} sx={{
                    fontFamily:FONT, fontSize:10, fontWeight: 500,
                    px:'14px', py:'9px', border:'none', cursor:'pointer',
                    background:'transparent',
                    color: active ? DL.navy : DL.tS,
                    borderBottom: active ? `2px solid ${DL.blue}` : '2px solid transparent',
                    transition:'all .14s', whiteSpace:'nowrap',
                    display:'flex', alignItems:'center', gap:'6px',
                    '&:hover':{ color: DL.navy },
                  }}>
                    {t.lbl}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ px:'16px', py:'16px' }}>
              {chartTab === 'doh'
                ? <ReactECharts option={dohOption}  style={{ width:'100%', height: CHART_H }} />
                : chartTab === 'quiebre'
                ? <ReactECharts option={quebOption} style={{ width:'100%', height: CHART_H }} />
                : <ReactECharts option={invOption}  style={{ width:'100%', height: CHART_H }} />
              }
            </Box>
            <PaginationBar
              page={chartTab === 'doh' ? dohPage : chartTab === 'quiebre' ? quebPage : invPage}
              total={chartTab === 'doh' ? categorias.length : chartTab === 'quiebre' ? categorias.length : invTotal}
              perPage={CAT_PER_PAGE}
              onChange={p => chartTab === 'doh' ? setDohPage(p) : chartTab === 'quiebre' ? setQuebPage(p) : setInvPage(p)}
            />
          </Box>

          {/* Proveedores del Almacén */}
          <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
            <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Proveedores del Almacén</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>Desempeño, lead time y fill rate por proveedor</Typography>
            </Box>
            <Box sx={{ ...tblWrap }}>
              <Box sx={{ overflowX:'auto' }}>
                <Table size="small" sx={{ tableLayout:'fixed', minWidth:560 }}>
                  <colgroup>
                    <col style={{ width:'24%' }}/><col style={{ width:'9%' }}/><col style={{ width:'11%' }}/>
                    <col style={{ width:'11%' }}/><col style={{ width:'13%' }}/><col style={{ width:'11%' }}/>
                    <col style={{ width:'11%' }}/><col style={{ width:'10%' }}/>
                  </colgroup>
                  <TableHead>
                    <TableRow>
                      {['Proveedor','SKUs','Lead Time','Fill Rate','Entregas A Tiempo','Última Compra','OC Pend.','Estado'].map((h,i) => (
                        <TableCell key={h} sx={{ ...thSx, textAlign: i>=1 && i<=5 ? 'right' : 'left' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {provRows.map((p,i) => {
                      const ec3 = p.estado === 'ok' ? { bg:'#f0fdf4', color:'#16a34a', bd:'#86efac', lbl:'OK' }
                                : p.estado === 'critico' ? { bg:'#fef2f2', color:'#dc2626', bd:'#fca5a5', lbl:'Crítico' }
                                : { bg:'#fef3c7', color:'#d97706', bd:'#fcd34d', lbl:'Atención' };
                      const frC = p.fillRate >= 90 ? DL.green : p.fillRate >= 70 ? '#d97706' : '#dc2626';
                      const etC = p.entregasATiempo >= 90 ? DL.green : p.entregasATiempo >= 70 ? '#d97706' : '#dc2626';
                      const ltC = p.leadTime <= 7 ? DL.green : p.leadTime <= 14 ? '#d97706' : '#dc2626';
                      return (
                        <TableRow key={i} sx={{ '&:hover':{ background:'rgba(84,126,105,.03)' } }}>
                          <TableCell sx={{ ...tdSx, fontWeight: 500, color:DL.tH }}>{p.nombre}</TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.skus}</TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:ltC }}>{p.leadTime}d</TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:frC }}>{p.fillRate}%</TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:etC }}>{p.entregasATiempo}%</TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>
                            <Box sx={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'1px' }}>
                              <Typography sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tH }}>hace {p.ultimaCompra}d</Typography>
                              <Typography sx={{ fontFamily:FONT, fontSize:8, color:DL.tS }}>{fmtMoney(p.montoUltCompra)}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                            {p.ocPendiente
                              ? <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:'#f6f6f6', border:'1px solid #d4d4d4' }}>
                                  <Typography sx={{ fontSize:8, fontWeight: 500, color:'#1a1a1a', fontFamily:FONT }}>Sí</Typography>
                                </Box>
                              : <Typography sx={{ fontFamily:FONT, fontSize:10, color:'#8d8d8d' }}>—</Typography>
                            }
                          </TableCell>
                          <TableCell sx={tdSx}>
                            <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:ec3.bg, border:`1px solid ${ec3.bd}` }}>
                              <Typography sx={{ fontSize:8, fontWeight: 500, color:ec3.color, fontFamily:FONT }}>{ec3.lbl}</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
            <PaginationBar page={provPage} total={proveedores.length} perPage={PER_PAGE} onChange={setProvPage} />
          </Box>
        </Box>

        {/* ── ROW 4: TABLA DE PRODUCTOS (con tabs) ─────────────────────────── */}
        <Box sx={{ ...cardSx, display:'flex', flexDirection:'column' }}>
          {/* header */}
          <Box sx={{ px:'16px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px', flexWrap:'wrap' }}>
            <Box>
              <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Detalle de Productos</Typography>
              <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, mt:'1px' }}>Existencia, compras, costos y consumo por SKU</Typography>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <MiniSelect
                value={detCat}
                onChange={v => { setDetCat(v); setProdPage(0); }}
                options={detCats.map(c => ({ value:c, label:c }))}
              />
              <Box sx={{ px:'10px', py:'3px', borderRadius:'4px', background: ALMACEN_ESTADO[data.estado]?.bg || '#f0fdf4', color: ALMACEN_ESTADO[data.estado]?.color || '#16a34a', fontSize:9, fontWeight: 500, fontFamily:FONT, border:`1px solid ${ALMACEN_ESTADO[data.estado]?.bd || '#86efac'}` }}>
                {ALMACEN_ESTADO[data.estado]?.label || '✓ OK'}
              </Box>
            </Box>
          </Box>
          {/* tabs */}
          <Box sx={{ display:'flex', gap:0, borderBottom:`1px solid ${DL.border}`, px:'14px', flexShrink:0 }}>
            {[
              { key:'todos',      lbl:'Todos',       cnt: productos.length,   sc:DL.navy   },
              { key:'sinStock',   lbl:'Sin Stock',   cnt: pSinStock.length,   sc:'#dc2626' },
              { key:'enRiesgo',   lbl:'En Riesgo',   cnt: pEnRiesgo.length,   sc:'#d97706' },
              { key:'sobreStock', lbl:'Sobre Stock',  cnt: pSobreStock.length, sc:'#6c6c6c' },
              { key:'vencido',    lbl:'Vencido',      cnt: pVencido.length,    sc:'#4d3f32' },
            ].map(t => {
              const active = tabProd === t.key;
              return (
                <Box key={t.key} component="button" onClick={() => { setTabProd(t.key); setProdPage(0); setDetCat('Todos'); }} sx={{
                  fontFamily:FONT, fontSize:10, fontWeight: 500,
                  px:'12px', py:'9px', border:'none', cursor:'pointer',
                  background:'transparent',
                  color: active ? DL.navy : DL.tS,
                  borderBottom: active ? `2px solid ${DL.blue}` : '2px solid transparent',
                  transition:'all .14s', whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:'6px',
                  '&:hover':{ color: DL.navy },
                }}>
                  {t.lbl}
                  <Box sx={{ px:'5px', py:'1px', borderRadius:'4px', background:`${t.sc}1a`, color:t.sc, fontSize:8, fontWeight: 500 }}>
                    {t.cnt}
                  </Box>
                </Box>
              );
            })}
          </Box>
          {/* tabla */}
          {(() => {
            const isTodos = tabProd === 'todos';
            // En tab Todos mostramos columna Estado; sin columna Almacén (ya estamos en un almacén)
            const headers = isTodos
              ? ['SKU','Producto','Estado','Categoría','UOM',
                 'Existencia (Q)','Venta Últ. 3M','Venta Últ. 6M',
                 'Fecha Últ. Compra','Cant. Últ. Compra',
                 'Costo Unitario','Costo U. Compra','Costo Total',
                 'Días de Inv.','Stock Mínimo','Consumo Prom. Sem.','Consumo Prom. Hist.']
              : ['SKU','Producto','Categoría','UOM',
                 'Existencia (Q)','Venta Últ. 3M','Venta Últ. 6M',
                 'Fecha Últ. Compra','Cant. Últ. Compra',
                 'Costo Unitario','Costo U. Compra','Costo Total',
                 'Días de Inv.','Stock Mínimo','Consumo Prom. Sem.','Consumo Prom. Hist.'];
            return (
              <Box sx={{ mx:'14px', mt:'12px', mb:'14px', border:`1px solid rgba(26,26,26,.12)`, borderRadius:'8px', overflow:'hidden' }}>
                <Box sx={{ overflowX:'auto' }}>
                  <Table size="small" sx={{ tableLayout:'fixed', minWidth: isTodos ? 1820 : 1700 }}>
                    <colgroup>
                      <col style={{ width:90 }}/><col style={{ width:200 }}/>
                      {isTodos && <col style={{ width:90 }}/>}
                      <col style={{ width:110 }}/><col style={{ width:60 }}/>
                      <col style={{ width:110 }}/><col style={{ width:110 }}/><col style={{ width:120 }}/>
                      <col style={{ width:130 }}/><col style={{ width:115 }}/><col style={{ width:115 }}/>
                      <col style={{ width:110 }}/><col style={{ width:115 }}/><col style={{ width:80 }}/><col style={{ width:100 }}/>
                      <col style={{ width:120 }}/><col style={{ width:120 }}/>
                    </colgroup>
                    <TableHead>
                      <TableRow>
                        {headers.map((h, i) => (
                          <TableCell key={h} sx={{ ...thSx, textAlign: i >= (isTodos ? 5 : 4) ? 'right' : 'left', whiteSpace:'nowrap' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tabList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={headers.length} sx={{ ...tdSx, textAlign:'center', py:'28px', color:DL.tS }}>
                            No hay productos en esta categoría
                          </TableCell>
                        </TableRow>
                      ) : prodRows.map((p, i) => {
                        const ec2  = ESTADO_CHIP[p.estado] || ESTADO_CHIP.Normal;
                        const dohC = p.doh === 0 ? '#dc2626' : p.doh < 10 ? '#d97706' : p.doh > 60 ? '#d97706' : DL.green;
                        return (
                          <TableRow key={i} onClick={() => navigate(`/inventario/almacen/${encodeURIComponent(nombre)}/producto/${p.sku}`, { state: { producto: p, almacen: nombre } })} sx={{ cursor:'pointer', '&:hover':{ background:'rgba(84,126,105,.04)' } }}>
                            <TableCell sx={{ ...tdSx, fontFamily:"'Courier New',monospace", fontSize:8.5, color:DL.tS }}>{p.sku}</TableCell>
                            <TableCell sx={{ ...tdSx, fontWeight: 500, color:DL.tH }}>{p.nombre}</TableCell>
                            {isTodos && (
                              <TableCell sx={tdSx}>
                                <Box sx={{ display:'inline-flex', px:'6px', py:'2px', borderRadius:'4px', background:ec2.bg, border:`1px solid ${ec2.bd}50` }}>
                                  <Typography sx={{ fontSize:8, fontWeight: 500, color:ec2.color, fontFamily:FONT }}>{p.estado}</Typography>
                                </Box>
                              </TableCell>
                            )}
                            <TableCell sx={tdSx}>
                              <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:'rgba(26,26,26,.07)', whiteSpace:'nowrap' }}>
                                <Typography sx={{ fontSize:8.5, fontWeight: 500, color:DL.navy, fontFamily:FONT, whiteSpace:'nowrap' }}>{p.categoria}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, color:DL.tS, fontSize:9 }}>{p.uom}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color: p.existencia===0?'#dc2626':DL.tH }}>{p.existencia === 0 ? '0' : p.existencia.toLocaleString()}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.v3m ? p.v3m.toLocaleString() : '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.v6m ? p.v6m.toLocaleString() : '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, color:DL.tS }}>{p.fechaUltimaCompra || '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.cantUltimaCompra ? p.cantUltimaCompra.toLocaleString() : '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{p.costoUnit ? `$${p.costoUnit.toLocaleString()}` : '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.costoUCompra ? `$${p.costoUCompra.toLocaleString()}` : '—'}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{p.costoTotal === 0 ? '—' : fmtMoney(p.costoTotal)}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:dohC }}>{p.doh === 0 ? '0d' : `${p.doh}d`}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.stockMin.toLocaleString()}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.consumoSem.toLocaleString()}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{p.consumoPHist ? p.consumoPHist.toLocaleString() : '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            );
          })()}
          <PaginationBar page={prodPage} total={tabList.length} perPage={PER_PAGE} onChange={setProdPage} />
        </Box>

      </Box>
    </Box>
  );
}
