// ─── Cuentas por Cobrar (CxC) v3 ─────────────────────────────────────────────
import { useState, useMemo, useCallback, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Box, Typography, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Popover,
} from '@mui/material';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import AlertasSistema from '../components/common/AlertasSistema';
import KpiCard from '../components/common/KpiCard';
import { DL } from '../theme';
import SearchIcon from '@mui/icons-material/Search';
import AscIcon from '@mui/icons-material/KeyboardArrowUp';
import DescIcon from '@mui/icons-material/KeyboardArrowDown';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

// ── Historical chart — stacked bars por mes × año ──
const MESES_LABELS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// 2025 — Pagado (verde, mayor) · Pendiente (amarillo, medio) · Vencido (rojo, menor)
const PAGADO_2025   = [3200,3100,3300,3100,3400,3200,3100,3300,3400,3100,3200,3500];
const PENDIENTE_2025= [1800,1750,1700,1600,1700,1560,1620,1750,1710,1680,1800,1800];
const VENCIDO_2025  = [1250,1270,1300,1250,1300,1200,1300,1240,1300,1250,1300,1300];

// 2026 — sólo Ene–May
const PAGADO_2026   = [3000,2900,3000,3100,3200,null,null,null,null,null,null,null];
const PENDIENTE_2026= [1800,1750,1800,1850,1800,null,null,null,null,null,null,null];
const VENCIDO_2026  = [1230,1250,1220,1240,1250,null,null,null,null,null,null,null];

// DSO promedio por mes — 2025 y 2026
const DSO_2025  = [38,40,41,39,42,44,43,41,42,45,47,44];
const DSO_2026  = [43,41,42,44,43,null,null,null,null,null,null,null];

// ── Client table ──
const CLIENTES_TABLE = [
  { id:1,  nombre:'Grupo Óptima Innovadora Spa',          total:3339832593, vencido:3287931243, noVencido:51901350,  facturas:24, riesgo:'ALTO',  rotacion:4.2  },
  { id:2,  nombre:'Asociados Especializada Confiable',    total:582198489,  vencido:54522936,   noVencido:527675553, facturas:12, riesgo:'BAJO',  rotacion:14.8 },
  { id:3,  nombre:'Internacional Líder Avanzada Spa',     total:255370843,  vencido:100668057,  noVencido:154702786, facturas:9,  riesgo:'MEDIO', rotacion:9.1  },
  { id:4,  nombre:'Distribuidora Líder Óptima S.R.L.',   total:66883327,   vencido:13530433,   noVencido:53352894,  facturas:7,  riesgo:'BAJO',  rotacion:13.2 },
  { id:5,  nombre:'Importadora Máxima & Tecnológica',     total:119103217,  vencido:41061020,   noVencido:78042197,  facturas:11, riesgo:'MEDIO', rotacion:8.4  },
  { id:6,  nombre:'Grupo Express',                        total:46608963,   vencido:0,          noVencido:46608963,  facturas:5,  riesgo:'BAJO',  rotacion:15.6 },
  { id:7,  nombre:'Grupo Óptima Premium Profesional',     total:25888635,   vencido:24619469,   noVencido:1269166,   facturas:8,  riesgo:'ALTO',  rotacion:5.8  },
  { id:8,  nombre:'Tech Mercantil Excelente',             total:26648322,   vencido:2668690,    noVencido:23979632,  facturas:6,  riesgo:'BAJO',  rotacion:12.1 },
  { id:9,  nombre:'Ferretería Central S.A.',              total:18500000,   vencido:8200000,    noVencido:10300000,  facturas:4,  riesgo:'MEDIO', rotacion:8.9  },
  { id:10, nombre:'Agro Soluciones del Norte',            total:42000000,   vencido:38000000,   noVencido:4000000,   facturas:9,  riesgo:'ALTO',  rotacion:3.9  },
  { id:11, nombre:'Distribuidora El Pino',                total:9800000,    vencido:0,          noVencido:9800000,   facturas:3,  riesgo:'BAJO',  rotacion:16.2 },
  { id:12, nombre:'Veterinaria San Marcos',               total:15200000,   vencido:6800000,    noVencido:8400000,   facturas:5,  riesgo:'MEDIO', rotacion:9.7  },
  { id:13, nombre:'Constructora Andina Ltda.',            total:28400000,   vencido:18600000,   noVencido:9800000,   facturas:4,  riesgo:'MEDIO', rotacion:7.4  },
  { id:14, nombre:'Servicios Integrados SpA',             total:52100000,   vencido:0,          noVencido:52100000,  facturas:6,  riesgo:'BAJO',  rotacion:14.1 },
  { id:15, nombre:'Textil del Sur S.A.',                  total:41800000,   vencido:35200000,   noVencido:6600000,   facturas:7,  riesgo:'ALTO',  rotacion:5.2  },
  { id:16, nombre:'Farmacia Cruz Verde Corp',             total:19300000,   vencido:7100000,    noVencido:12200000,  facturas:3,  riesgo:'BAJO',  rotacion:11.8 },
  { id:17, nombre:'Soluciones TI Express',                total:34700000,   vencido:22100000,   noVencido:12600000,  facturas:5,  riesgo:'MEDIO', rotacion:8.6  },
  { id:18, nombre:'Molinos El Roble S.A.',                total:67300000,   vencido:61800000,   noVencido:5500000,   facturas:9,  riesgo:'ALTO',  rotacion:3.4  },
];

// ── Aging buckets ──
const AGING_BUCKETS = [
  { tramo:'1 – 30 d',   vencMonto:320000000,  vencFact:45, noVencMonto:680000000,  noVencFact:62 },
  { tramo:'31 – 60 d',  vencMonto:580000000,  vencFact:38, noVencMonto:420000000,  noVencFact:31 },
  { tramo:'61 – 90 d',  vencMonto:420000000,  vencFact:22, noVencMonto:180000000,  noVencFact:14 },
  { tramo:'91 – 120 d', vencMonto:280000000,  vencFact:18, noVencMonto:95000000,   noVencFact:8  },
  { tramo:'+ 120 d',    vencMonto:1982931243, vencFact:35, noVencMonto:15000000,   noVencFact:3  },
];

// ── Invoice detail ──
const DOCUMENTOS = [
  { id:1,  cliente:'Grupo Óptima Innovadora Spa',        folio:'001-001-0010245', fecha:'15/01/2025', venc:'14/02/2025', condPago:'Crédito', cant:42, venta:1200000000, costo:840000000,  mg:360000000, mgPct:30, abono:0,         pendiente:1200000000, estado:'Vencido',   diasV:79 },
  { id:2,  cliente:'Grupo Óptima Innovadora Spa',        folio:'001-001-0010388', fecha:'05/02/2025', venc:'07/03/2025', condPago:'Crédito', cant:38, venta:980000000,  costo:686000000,  mg:294000000, mgPct:30, abono:0,         pendiente:980000000,  estado:'Vencido',   diasV:57 },
  { id:3,  cliente:'Asociados Especializada Confiable',  folio:'001-001-0010402', fecha:'10/02/2025', venc:'25/02/2025', condPago:'Crédito', cant:31, venta:54522936,   costo:38166055,   mg:16356881,  mgPct:30, abono:0,         pendiente:54522936,   estado:'Vencido',   diasV:39 },
  { id:4,  cliente:'Asociados Especializada Confiable',  folio:'001-001-0010511', fecha:'01/03/2025', venc:'31/03/2025', condPago:'Crédito', cant:29, venta:527675553,  costo:369372887,  mg:158302666, mgPct:30, abono:527675553, pendiente:0,          estado:'Pagado',    diasV:0  },
  { id:5,  cliente:'Internacional Líder Avanzada Spa',   folio:'001-001-0010278', fecha:'20/01/2025', venc:'06/03/2025', condPago:'Crédito', cant:22, venta:100668057,  costo:60400834,   mg:40267223,  mgPct:40, abono:0,         pendiente:100668057,  estado:'Vencido',   diasV:58 },
  { id:6,  cliente:'Distribuidora Líder Óptima S.R.L.',  folio:'001-001-0010350', fecha:'25/01/2025', venc:'24/02/2025', condPago:'Crédito', cant:18, venta:13530433,   costo:8118260,    mg:5412173,   mgPct:40, abono:0,         pendiente:13530433,   estado:'Vencido',   diasV:40 },
  { id:7,  cliente:'Importadora Máxima & Tecnológica',   folio:'001-001-0010098', fecha:'12/02/2025', venc:'12/02/2025', condPago:'Crédito', cant:15, venta:41061020,   costo:24636612,   mg:16424408,  mgPct:40, abono:0,         pendiente:41061020,   estado:'Vencido',   diasV:52 },
  { id:8,  cliente:'Grupo Express',                      folio:'001-001-0010499', fecha:'04/03/2025', venc:'03/04/2025', condPago:'Crédito', cant:12, venta:31408963,   costo:18845378,   mg:12563585,  mgPct:40, abono:0,         pendiente:31408963,   estado:'Pendiente', diasV:0  },
  { id:9,  cliente:'Tech Mercantil Excelente',           folio:'001-001-0010020', fecha:'28/02/2025', venc:'01/03/2025', condPago:'Contado', cant:8,  venta:2668690,    costo:1868083,    mg:800607,    mgPct:30, abono:2668690,   pendiente:0,          estado:'Pagado',    diasV:0  },
  { id:10, cliente:'Grupo Óptima Premium Profesional',   folio:'001-001-0010301', fecha:'01/02/2025', venc:'03/03/2025', condPago:'Crédito', cant:24, venta:24619469,   costo:14771681,   mg:9847788,   mgPct:40, abono:0,         pendiente:24619469,   estado:'Vencido',   diasV:61 },
  { id:11, cliente:'Ferretería Central S.A.',            folio:'001-001-0010580', fecha:'15/03/2026', venc:'14/04/2026', condPago:'Crédito', cant:10, venta:8200000,    costo:4920000,    mg:3280000,   mgPct:40, abono:0,         pendiente:8200000,    estado:'Vencido',   diasV:28 },
  { id:12, cliente:'Agro Soluciones del Norte',          folio:'001-001-0010565', fecha:'01/02/2026', venc:'03/03/2026', condPago:'Crédito', cant:35, venta:38000000,   costo:22800000,   mg:15200000,  mgPct:40, abono:0,         pendiente:38000000,   estado:'Vencido',   diasV:70 },
  { id:13, cliente:'Distribuidora El Pino',              folio:'001-001-0010601', fecha:'01/04/2026', venc:'30/04/2026', condPago:'Crédito', cant:6,  venta:9800000,    costo:5880000,    mg:3920000,   mgPct:40, abono:0,         pendiente:9800000,    estado:'Pendiente', diasV:0  },
  { id:14, cliente:'Veterinaria San Marcos',             folio:'001-001-0010612', fecha:'20/03/2026', venc:'19/04/2026', condPago:'Crédito', cant:8,  venta:6800000,    costo:4080000,    mg:2720000,   mgPct:40, abono:0,         pendiente:6800000,    estado:'Vencido',   diasV:23 },
  { id:15, cliente:'Internacional Líder Avanzada Spa',   folio:'001-001-0010598', fecha:'10/04/2026', venc:'24/05/2026', condPago:'Crédito', cant:14, venta:9800000,    costo:5880000,    mg:3920000,   mgPct:40, abono:0,         pendiente:9800000,    estado:'Pendiente', diasV:0  },
  { id:16, cliente:'Distribuidora Líder Óptima S.R.L.',  folio:'001-001-0010415', fecha:'08/07/2025', venc:'07/08/2025', condPago:'Crédito', cant:14, venta:22400000,  costo:13440000, mg:8960000,  mgPct:40, abono:0,        pendiente:22400000, estado:'Vencido',   diasV:280 },
  { id:17, cliente:'Importadora Máxima & Tecnológica',   folio:'001-001-0010488', fecha:'15/09/2025', venc:'15/10/2025', condPago:'Crédito', cant:19, venta:35600000,  costo:21360000, mg:14240000, mgPct:40, abono:0,        pendiente:35600000, estado:'Vencido',   diasV:210 },
  { id:18, cliente:'Grupo Express',                      folio:'001-001-0010542', fecha:'10/12/2025', venc:'09/01/2026', condPago:'Crédito', cant:11, venta:15200000,  costo:9120000,  mg:6080000,  mgPct:40, abono:0,        pendiente:15200000, estado:'Vencido',   diasV:124 },
  { id:19, cliente:'Constructora Andina Ltda.',          folio:'001-001-0010630', fecha:'18/02/2026', venc:'20/03/2026', condPago:'Crédito', cant:8,  venta:18600000,  costo:11160000, mg:7440000,  mgPct:40, abono:0,        pendiente:18600000, estado:'Vencido',   diasV:54 },
  { id:20, cliente:'Servicios Integrados SpA',           folio:'001-001-0010641', fecha:'05/03/2026', venc:'04/05/2026', condPago:'Crédito', cant:12, venta:52100000,  costo:31260000, mg:20840000, mgPct:40, abono:0,        pendiente:52100000, estado:'Pendiente', diasV:0  },
  { id:21, cliente:'Textil del Sur S.A.',                folio:'001-001-0010658', fecha:'14/02/2026', venc:'16/03/2026', condPago:'Crédito', cant:15, venta:35200000,  costo:21120000, mg:14080000, mgPct:40, abono:0,        pendiente:35200000, estado:'Vencido',   diasV:58 },
  { id:22, cliente:'Farmacia Cruz Verde Corp',           folio:'001-001-0010667', fecha:'28/03/2026', venc:'20/04/2026', condPago:'Crédito', cant:6,  venta:7100000,   costo:4260000,  mg:2840000,  mgPct:40, abono:0,        pendiente:7100000,  estado:'Vencido',   diasV:22 },
  { id:23, cliente:'Soluciones TI Express',              folio:'001-001-0010674', fecha:'22/02/2026', venc:'24/03/2026', condPago:'Crédito', cant:9,  venta:22100000,  costo:13260000, mg:8840000,  mgPct:40, abono:0,        pendiente:22100000, estado:'Vencido',   diasV:49 },
  { id:24, cliente:'Molinos El Roble S.A.',              folio:'001-001-0010683', fecha:'16/02/2026', venc:'18/03/2026', condPago:'Crédito', cant:18, venta:61800000,  costo:37080000, mg:24720000, mgPct:40, abono:0,        pendiente:61800000, estado:'Vencido',   diasV:56 },
];

// ── Vendedores ──
const VENDEDORES = ['Todos','Carlos Méndez','Ana Rivas','Pedro Salas','Lucía Torres','Jorge Ibáñez'];

// Mapping cliente → vendedor
const CLIENTE_VENDEDOR = {
  'Grupo Óptima Innovadora Spa':        'Carlos Méndez',
  'Asociados Especializada Confiable':  'Ana Rivas',
  'Internacional Líder Avanzada Spa':   'Pedro Salas',
  'Distribuidora Líder Óptima S.R.L.': 'Lucía Torres',
  'Importadora Máxima & Tecnológica':   'Jorge Ibáñez',
  'Grupo Express':                      'Carlos Méndez',
  'Grupo Óptima Premium Profesional':   'Ana Rivas',
  'Tech Mercantil Excelente':           'Pedro Salas',
  'Ferretería Central S.A.':            'Lucía Torres',
  'Agro Soluciones del Norte':          'Jorge Ibáñez',
  'Distribuidora El Pino':              'Carlos Méndez',
  'Veterinaria San Marcos':             'Ana Rivas',
  'Constructora Andina Ltda.':          'Pedro Salas',
  'Servicios Integrados SpA':           'Lucía Torres',
  'Textil del Sur S.A.':               'Jorge Ibáñez',
  'Farmacia Cruz Verde Corp':           'Carlos Méndez',
  'Soluciones TI Express':              'Ana Rivas',
  'Molinos El Roble S.A.':             'Jorge Ibáñez',
};

// ── Vendedor metrics (aggregated from CLIENTES_TABLE + demo KPIs) ──
const VENDEDOR_METRICAS = (() => {
  const agg = {};
  CLIENTES_TABLE.forEach(c => {
    const v = CLIENTE_VENDEDOR[c.nombre];
    if (!v) return;
    if (!agg[v]) agg[v] = { nombre:v, cxcTotal:0, vencido:0, facturas:0, clientes:0 };
    agg[v].cxcTotal  += c.total;
    agg[v].vencido   += c.vencido;
    agg[v].facturas  += c.facturas;
    agg[v].clientes  += 1;
  });
  // Merge demo KPIs per vendedor
  const demo = {
    'Carlos Méndez': { dso:48, cei:52, badDebt:3.8 },
    'Ana Rivas':     { dso:38, cei:72, badDebt:1.9 },
    'Pedro Salas':   { dso:41, cei:68, badDebt:2.1 },
    'Lucía Torres':  { dso:32, cei:81, badDebt:1.4 },
    'Jorge Ibáñez':  { dso:44, cei:63, badDebt:2.7 },
  };
  return Object.values(agg).map(v => ({ ...v, ...(demo[v.nombre] || { dso:40, cei:70, badDebt:2.0 }) }));
})();

// ── At-risk clients ──
const RIESGO_ROWS = [
  { cliente:'Ferretería Central S.A.',          folio:'F-10621', vencimiento:'14/05/2026', diasRestantes:2,  monto:8200000,  riesgo:'ALTO'  },
  { cliente:'Grupo Óptima Premium Profesional', folio:'F-10598', vencimiento:'16/05/2026', diasRestantes:4,  monto:6500000,  riesgo:'ALTO'  },
  { cliente:'Veterinaria San Marcos',           folio:'F-10612', vencimiento:'18/05/2026', diasRestantes:6,  monto:4200000,  riesgo:'MEDIO' },
  { cliente:'Importadora Máxima & Tecnológica', folio:'F-10634', vencimiento:'20/05/2026', diasRestantes:8,  monto:12000000, riesgo:'MEDIO' },
  { cliente:'Agro Soluciones del Norte',        folio:'F-10601', vencimiento:'22/05/2026', diasRestantes:10, monto:38000000, riesgo:'ALTO'  },
  { cliente:'Internacional Líder Avanzada',     folio:'F-10645', vencimiento:'24/05/2026', diasRestantes:12, monto:9800000,  riesgo:'MEDIO' },
  { cliente:'Distribuidora El Pino',            folio:'F-10652', vencimiento:'26/05/2026', diasRestantes:14, monto:5200000,  riesgo:'BAJO'  },
];

// ── Alerts ──
const ALERTAS = [
  { tipo:'r', titulo:'Grupo Óptima Innovadora Spa',         msg:'$3.28B vencido. Score: ALTO. Sin contacto hace 15 días.', acciones:['Ver cliente','Notificar ahora'] },
  { tipo:'y', titulo:'53 clientes sin correo',              msg:'No pueden recibir notificaciones automáticas.',            acciones:['Gestionar ahora'] },
  { tipo:'y', titulo:'Cartera +90d subió +$41M',            msg:'Respecto al mes anterior.',                                acciones:['Ver detalle'] },
  { tipo:'o', titulo:'12 compromisos de pago hoy',          msg:'Vencen promesas de pago esta semana.',                     acciones:['Ver compromisos'] },
  { tipo:'g', titulo:'Asociados Especializada Confiable',   msg:'Pagó $527K este mes. Al día.',                             acciones:[] },
  { tipo:'g', titulo:'Tasa recuperación 0–15d: 94%',        msg:'Por encima de meta del 85%.',                              acciones:[] },
];

// ── Periodo filter ──
const PERIODOS = [
  { value:'todos', label:'Todos',           days:null },
  { value:'90d',   label:'Últ. 90 días',    days:90   },
  { value:'180d',  label:'Últ. 180 días',   days:180  },
  { value:'270d',  label:'Últ. 270 días',   days:270  },
  { value:'365d',  label:'Últ. 365 días',   days:365  },
];
const parseDocDate = s => { const [d,m,y]=s.split('/').map(Number); return new Date(y,m-1,d); };
const TODAY_CXC = new Date(2026,4,13); // demo reference: 2026-05-13

const PERIODO_DATA = {
  todos: { dso:42, dsoPct:71, dsoDiff:'+12d sobre la meta', dsoYoyPrev:'38d', dsoYoyDelta:'+4d', dsoYoyUp:false, dsoBarSplit:71,
           cei:'68.0%', ceiPct:80, ceiDiff:'-17pp vs meta', ceiYoyPrev:'72%', ceiYoyDelta:'-4pp', ceiYoyUp:false,
           cxc:'$4.78B', cxcPct:87, cxcMeta:'$4.28B', cxcDiff:'+$0.50B', cxcDiffUp:true, cxcYoyPrev:'$4.2B', cxcYoyDelta:'+12.3%', cxcYoyUp:true,
           pctVenc:'75.0%', pvPct:33, pvDiff:'+50pp vs meta', pvYoyPrev:'62%', pvYoyDelta:'+13pp', pvYoyUp:false,
           bd:'2.3%', bdPct:87, bdDiff:'+0.3pp vs meta', bdYoyPrev:'1.9%', bdYoyDelta:'+0.4pp', bdYoyUp:false,
           rot:'8.6x', rotPct:72, rotDiff:'-3.4x vs meta', rotYoyPrev:'8.9x', rotYoyDelta:'-0.3x', rotYoyUp:false },
  '90d':  { dso:38, dsoPct:79, dsoDiff:'+8d sobre la meta',  dsoYoyPrev:'35d', dsoYoyDelta:'+3d', dsoYoyUp:false, dsoBarSplit:79,
            cei:'74.2%', ceiPct:87, ceiDiff:'-11pp vs meta', ceiYoyPrev:'71%', ceiYoyDelta:'+3pp', ceiYoyUp:true,
            cxc:'$82.6M', cxcPct:92, cxcMeta:'$75.0M', cxcDiff:'+$7.6M', cxcDiffUp:true, cxcYoyPrev:'$68.2M', cxcYoyDelta:'+21.1%', cxcYoyUp:true,
            pctVenc:'62.0%', pvPct:42, pvDiff:'+37pp vs meta', pvYoyPrev:'55%', pvYoyDelta:'+7pp', pvYoyUp:false,
            bd:'2.0%', bdPct:95, bdDiff:'✓ En meta', bdYoyPrev:'2.1%', bdYoyDelta:'-0.1pp', bdYoyUp:true,
            rot:'9.8x', rotPct:82, rotDiff:'-2.2x vs meta', rotYoyPrev:'9.1x', rotYoyDelta:'+0.7x', rotYoyUp:true },
  '180d': { dso:40, dsoPct:75, dsoDiff:'+10d sobre la meta', dsoYoyPrev:'38d', dsoYoyDelta:'+2d', dsoYoyUp:false, dsoBarSplit:75,
            cei:'71.0%', ceiPct:84, ceiDiff:'-14pp vs meta', ceiYoyPrev:'72%', ceiYoyDelta:'-1pp', ceiYoyUp:false,
            cxc:'$120.4M', cxcPct:89, cxcMeta:'$108.0M', cxcDiff:'+$12.4M', cxcDiffUp:true, cxcYoyPrev:'$98.5M', cxcYoyDelta:'+22.2%', cxcYoyUp:true,
            pctVenc:'67.5%', pvPct:38, pvDiff:'+42pp vs meta', pvYoyPrev:'60%', pvYoyDelta:'+8pp', pvYoyUp:false,
            bd:'2.1%', bdPct:93, bdDiff:'+0.1pp vs meta', bdYoyPrev:'2.0%', bdYoyDelta:'+0.1pp', bdYoyUp:false,
            rot:'9.2x', rotPct:77, rotDiff:'-2.8x vs meta', rotYoyPrev:'9.0x', rotYoyDelta:'+0.2x', rotYoyUp:true },
  '270d': { dso:41, dsoPct:73, dsoDiff:'+11d sobre la meta', dsoYoyPrev:'39d', dsoYoyDelta:'+2d', dsoYoyUp:false, dsoBarSplit:73,
            cei:'69.5%', ceiPct:82, ceiDiff:'-15pp vs meta', ceiYoyPrev:'72%', ceiYoyDelta:'-3pp', ceiYoyUp:false,
            cxc:'$2.45B', cxcPct:88, cxcMeta:'$2.21B', cxcDiff:'+$0.24B', cxcDiffUp:true, cxcYoyPrev:'$2.18B', cxcYoyDelta:'+12.4%', cxcYoyUp:true,
            pctVenc:'71.2%', pvPct:35, pvDiff:'+46pp vs meta', pvYoyPrev:'61%', pvYoyDelta:'+10pp', pvYoyUp:false,
            bd:'2.2%', bdPct:91, bdDiff:'+0.2pp vs meta', bdYoyPrev:'1.9%', bdYoyDelta:'+0.3pp', bdYoyUp:false,
            rot:'8.9x', rotPct:74, rotDiff:'-3.1x vs meta', rotYoyPrev:'8.9x', rotYoyDelta:'0x', rotYoyUp:false },
  '365d': { dso:42, dsoPct:71, dsoDiff:'+12d sobre la meta', dsoYoyPrev:'38d', dsoYoyDelta:'+4d', dsoYoyUp:false, dsoBarSplit:71,
            cei:'68.0%', ceiPct:80, ceiDiff:'-17pp vs meta', ceiYoyPrev:'72%', ceiYoyDelta:'-4pp', ceiYoyUp:false,
            cxc:'$4.78B', cxcPct:87, cxcMeta:'$4.28B', cxcDiff:'+$0.50B', cxcDiffUp:true, cxcYoyPrev:'$4.2B', cxcYoyDelta:'+12.3%', cxcYoyUp:true,
            pctVenc:'75.0%', pvPct:33, pvDiff:'+50pp vs meta', pvYoyPrev:'62%', pvYoyDelta:'+13pp', pvYoyUp:false,
            bd:'2.3%', bdPct:87, bdDiff:'+0.3pp vs meta', bdYoyPrev:'1.9%', bdYoyDelta:'+0.4pp', bdYoyUp:false,
            rot:'8.6x', rotPct:72, rotDiff:'-3.4x vs meta', rotYoyPrev:'8.9x', rotYoyDelta:'-0.3x', rotYoyUp:false },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtCLP = v => {
  if (!v && v !== 0) return '—';
  const abs = Math.abs(v);
  if (abs >= 1e9) return `$${(v/1e9).toFixed(2).replace('.',',')}B`;
  if (abs >= 1e6) return `$${(v/1e6).toFixed(1).replace('.',',')}M`;
  if (abs >= 1e3) return `$${Math.round(v/1e3).toLocaleString('es-CL')}K`;
  return `$${v.toLocaleString('es-CL')}`;
};
const riskColor = r => r==='ALTO' ? DL.red : r==='MEDIO' ? '#d97706' : DL.green;
const riskBg    = r => r==='ALTO' ? DL.redBg : r==='MEDIO' ? 'rgba(217,119,6,.12)' : DL.greenBg;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const Card = ({ children, sx={} }) => (
  <Box sx={{ background:'#fff', borderRadius:'10px', border:`1px solid ${DL.border}`, boxShadow:DL.e1, overflow:'hidden', ...sx }}>
    {children}
  </Box>
);
const thSx = { fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, py:'8px', px:'10px', background:'#f7f8fd', borderBottom:`2px solid rgba(26,26,26,.08)`, whiteSpace:'nowrap', zIndex:2 };
const tdSx = { fontSize:11, color:DL.tH, py:'9px', px:'10px', borderBottom:`1px solid rgba(26,26,26,.05)` };

// Local KpiCard removed — using shared KpiCard from components/common/KpiCard

// ─── HistoricalChart — stacked bars + straight DSO lines ─────────────────────
// Series per legend item — what to toggle when clicking each
const SERIES_MAP = {
  '2025':      ['Pagado 2025','Pendiente 2025','Vencido 2025'],
  '2026':      ['Pagado 2026','Pendiente 2026','Vencido 2026'],
  'Pagado':    ['Pagado 2025','Pagado 2026'],
  'Pendiente': ['Pendiente 2025','Pendiente 2026'],
  'Vencido':   ['Vencido 2025','Vencido 2026'],
  'DSO 2025':  ['DSO 2025'],
  'DSO 2026':  ['DSO 2026'],
};

// Green = Pagado, Yellow = Pendiente, Red = Vencido
const COLORS = {
  pagado25:'#16a34a', pagado26:'#86efac',
  pend25:'#d97706',   pend26:'#fcd34d',
  venc25:'#dc2626',   venc26:'#fca5a5',
  dso25:'#4d3f32',    dso26:'#a0a0a0',
};

const LEGEND_GROUPS = [
  {
    label: 'Año',
    items: [
      { key:'2025', label:'2025', color:COLORS.venc25, type:'rect' },
      { key:'2026', label:'2026', color:COLORS.venc26, type:'rect' },
    ],
  },
  {
    label: 'Estado',
    items: [
      { key:'Pagado',    label:'Pagado',    color:COLORS.pagado25, type:'rect' },
      { key:'Pendiente', label:'Pendiente', color:COLORS.pend25,   type:'rect' },
      { key:'Vencido',   label:'Vencido',   color:COLORS.venc25,   type:'rect' },
    ],
  },
  {
    label: 'DSO',
    items: [
      { key:'DSO 2025', label:'DSO 2025', color:COLORS.dso25, type:'line-solid' },
      { key:'DSO 2026', label:'DSO 2026', color:COLORS.dso26, type:'line-dashed' },
    ],
  },
];

function LegendSwatch({ type, color, dim }) {
  const op = dim ? 0.25 : 1;
  if (type === 'rect') return (
    <Box sx={{ width:12, height:8, borderRadius:'2px', background:color, flexShrink:0, opacity:op, transition:'opacity .2s' }} />
  );
  if (type === 'line-solid') return (
    <Box sx={{ display:'flex', alignItems:'center', flexShrink:0, opacity:op, transition:'opacity .2s' }}>
      <Box sx={{ width:14, height:2.5, background:color }} />
      <Box sx={{ width:7, height:7, borderRadius:'50%', background:color, border:'2px solid #fff', outline:`1.5px solid ${color}`, ml:'-3px' }} />
    </Box>
  );
  return (
    <Box sx={{ display:'flex', alignItems:'center', flexShrink:0, opacity:op, transition:'opacity .2s' }}>
      <Box sx={{ display:'flex', gap:'2px', alignItems:'center' }}>
        <Box sx={{ width:5, height:2.5, background:color }} />
        <Box sx={{ width:3, height:2.5, background:'transparent' }} />
        <Box sx={{ width:5, height:2.5, background:color }} />
      </Box>
      <Box sx={{ width:7, height:7, borderRadius:'50%', background:color, border:'2px solid #fff', outline:`1.5px solid ${color}`, ml:'-3px' }} />
    </Box>
  );
}

function HistoricalChart() {
  const chartRef = useRef(null);
  const [hidden, setHidden] = useState(new Set());

  const toggle = useCallback((key) => {
    const series = SERIES_MAP[key] || [];
    const inst = chartRef.current?.getEchartsInstance?.();
    const allHidden = series.every(s => hidden.has(s));
    setHidden(prev => {
      const next = new Set(prev);
      series.forEach(s => allHidden ? next.delete(s) : next.add(s));
      return next;
    });
    if (inst) {
      series.forEach(s => {
        inst.dispatchAction({ type: allHidden ? 'legendSelect' : 'legendUnSelect', name: s });
      });
    }
  }, [hidden]);

  const isDim = (key) => {
    const series = SERIES_MAP[key] || [];
    return series.length > 0 && series.every(s => hidden.has(s));
  };

  const opt = useMemo(() => ({
    tooltip: {
      trigger: 'axis', axisPointer:{ type:'shadow' },
      backgroundColor:'#1a1a1a', borderColor:'transparent', borderRadius:8,
      textStyle:{ fontFamily:FONT, fontSize:11, color:'#fff' },
      formatter: params => {
        let html = `<b style="font-size:12px">${params[0].axisValue}</b><br/>`;
        const order = ['Pagado 2025','Pendiente 2025','Vencido 2025','Pagado 2026','Pendiente 2026','Vencido 2026','DSO 2025','DSO 2026'];
        const map = {};
        params.forEach(p => { map[p.seriesName] = p; });
        order.forEach(name => {
          const p = map[name];
          if (!p || p.value === null || p.value === undefined) return;
          const isDSO = name.startsWith('DSO');
          html += `<span style="display:inline-block;width:8px;height:8px;border-radius:${isDSO?'50%':'2px'};background:${p.color};margin-right:5px"></span>`;
          html += `${name}: <b>${isDSO ? p.value+'d' : '$'+p.value+'M'}</b><br/>`;
        });
        return html;
      },
    },
    legend: {
      show: true, // must be visible for dispatchAction to work
      selectedMode: true,
      itemWidth: 0, itemHeight: 0, // hide native items (zero-size)
      textStyle: { color: 'transparent', fontSize: 0 },
      bottom: -9999, // push off-screen
      data: Object.keys(SERIES_MAP).flatMap(k => SERIES_MAP[k]),
    },
    grid: { top:14, bottom:8, left:68, right:64 },
    xAxis: {
      type:'category', data:MESES_LABELS,
      axisLabel:{ fontFamily:FONT, fontSize:10, color:DL.tS },
      axisLine:{ lineStyle:{ color:DL.border } }, axisTick:{ show:false },
    },
    yAxis: [
      { type:'value', name:'$M',
        nameTextStyle:{ fontFamily:FONT, fontSize:9, color:DL.tS },
        axisLabel:{ fontFamily:FONT, fontSize:9, color:DL.tS, formatter:v=>`$${v}M` },
        splitLine:{ lineStyle:{ color:'rgba(26,26,26,.06)' } }, axisLine:{ show:false } },
      { type:'value', name:'Días',
        nameTextStyle:{ fontFamily:FONT, fontSize:9, color:COLORS.dso25 },
        axisLabel:{ fontFamily:FONT, fontSize:9, color:COLORS.dso25, formatter:v=>`${v}d` },
        splitLine:{ show:false }, axisLine:{ show:false }, min:28, max:52 },
    ],
    series: [
      { name:'Pagado 2025',    type:'bar', stack:'2025', data:PAGADO_2025,
        itemStyle:{ color:COLORS.pagado25 }, barMaxWidth:20, barGap:'20%', emphasis:{ focus:'series' } },
      { name:'Pendiente 2025', type:'bar', stack:'2025', data:PENDIENTE_2025,
        itemStyle:{ color:COLORS.pend25 }, emphasis:{ focus:'series' } },
      { name:'Vencido 2025',   type:'bar', stack:'2025', data:VENCIDO_2025,
        itemStyle:{ color:COLORS.venc25, borderRadius:[3,3,0,0] }, emphasis:{ focus:'series' } },
      { name:'Pagado 2026',    type:'bar', stack:'2026', data:PAGADO_2026,
        itemStyle:{ color:COLORS.pagado26 }, barMaxWidth:20, emphasis:{ focus:'series' } },
      { name:'Pendiente 2026', type:'bar', stack:'2026', data:PENDIENTE_2026,
        itemStyle:{ color:COLORS.pend26 }, emphasis:{ focus:'series' } },
      { name:'Vencido 2026',   type:'bar', stack:'2026', data:VENCIDO_2026,
        itemStyle:{ color:COLORS.venc26, borderRadius:[3,3,0,0] }, emphasis:{ focus:'series' } },
      { name:'DSO 2025', type:'line', data:DSO_2025, yAxisIndex:1, z:10,
        lineStyle:{ color:COLORS.dso25, width:2.5, type:'solid' },
        symbol:'circle', symbolSize:7,
        itemStyle:{ color:COLORS.dso25, borderColor:'#fff', borderWidth:2 },
        smooth:false, connectNulls:false },
      { name:'DSO 2026', type:'line', data:DSO_2026, yAxisIndex:1, z:10,
        lineStyle:{ color:COLORS.dso26, width:2.5, type:'dashed' },
        symbol:'circle', symbolSize:7,
        itemStyle:{ color:COLORS.dso26, borderColor:'#fff', borderWidth:2 },
        smooth:false, connectNulls:false },
    ],
  }), []);

  return (
    <Box>
      <ReactECharts ref={chartRef} option={opt} style={{ height:280 }} />
      {/* ── Custom grouped legend ── */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, pt:'10px', pb:'4px', flexWrap:'wrap' }}>
        {LEGEND_GROUPS.map((group, gi) => (
          <Box key={group.label} sx={{ display:'flex', alignItems:'center' }}>
            {gi > 0 && <Box sx={{ width:'1px', height:16, background:'rgba(26,26,26,.12)', mx:'14px', flexShrink:0 }} />}
            <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'.08em', color:'rgba(26,26,26,.35)', fontFamily:FONT, mr:'8px', flexShrink:0 }}>
              {group.label}
            </Typography>
            <Box sx={{ display:'flex', alignItems:'center', gap:'10px' }}>
              {group.items.map(item => {
                const dim = isDim(item.key);
                return (
                  <Box key={item.key} onClick={() => toggle(item.key)}
                    sx={{ display:'flex', alignItems:'center', gap:'4px', cursor:'pointer', opacity: dim ? 0.4 : 1, transition:'opacity .2s',
                      '&:hover':{ opacity: dim ? 0.6 : 0.75 } }}>
                    <LegendSwatch type={item.type} color={item.color} dim={false} />
                    <Typography sx={{ fontSize:10, color: dim ? DL.tS : DL.tM, fontFamily:FONT, whiteSpace:'nowrap', userSelect:'none' }}>
                      {item.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── CarteraClientesTabs (Clientes + En Riesgo + Vendedores) ─────────────────
function CarteraClientesTabs({ onSelect, clientes = CLIENTES_TABLE }) {
  const [tab, setTab] = useState(0);

  // ── Tab 0: Clientes ──
  const [search,  setSearch]  = useState('');
  const [sortCol, setSortCol] = useState('vencido');
  const [sortDir, setSortDir] = useState('desc');
  const [page,    setPage]    = useState(0);
  const PAGE = 8;
  const [cliCols, setCliCols] = useState([
    { key:'nombre',    label:'Cliente',    fixed:true,  vis:true },
    { key:'total',     label:'Total CxC',  fixed:false, vis:true },
    { key:'vencido',   label:'Vencido',    fixed:false, vis:true },
    { key:'noVencido', label:'No Vencido', fixed:false, vis:true },
    { key:'pctVenc',   label:'% Vencido',  fixed:false, vis:true },
    { key:'rotacion',  label:'Rotación',   fixed:false, vis:true },
    { key:'riesgo',    label:'Riesgo',     fixed:false, vis:true },
    { key:'facturas',  label:'# Fact.',    fixed:false, vis:true },
  ]);
  const toggleCliCol = key => setCliCols(cs => cs.map(c => c.key===key ? {...c, vis:!c.vis} : c));

  // ── Tab 1: En Riesgo ──
  const [riesgoCols, setRiesgoCols] = useState([
    { key:'cliente',       label:'Cliente',     fixed:true,  vis:true },
    { key:'folio',         label:'Folio',       fixed:false, vis:true },
    { key:'vencimiento',   label:'Vencimiento', fixed:false, vis:true },
    { key:'diasRestantes', label:'Días Rest.',  fixed:false, vis:true },
    { key:'monto',         label:'Monto',       fixed:false, vis:true },
    { key:'riesgo',        label:'Riesgo',      fixed:false, vis:true },
  ]);
  const toggleRiesgoCol = key => setRiesgoCols(cs => cs.map(c => c.key===key ? {...c, vis:!c.vis} : c));

  // ── Tab 2: Vendedores ──
  const [vSortCol, setVSortCol] = useState('cxcTotal');
  const [vSortDir, setVSortDir] = useState('desc');
  const [vendCols, setVendCols] = useState([
    { key:'nombre',   label:'Vendedor',       fixed:true,  vis:true },
    { key:'clientes', label:'Clientes',        fixed:false, vis:true },
    { key:'cxcTotal', label:'CxC Total',       fixed:false, vis:true },
    { key:'vencido',  label:'Cartera Vencida', fixed:false, vis:true },
    { key:'pctVenc',  label:'% Vencido',       fixed:false, vis:true },
    { key:'dso',      label:'DSO',             fixed:false, vis:true },
    { key:'cei',      label:'CEI',             fixed:false, vis:true },
    { key:'badDebt',  label:'Bad Debt',        fixed:false, vis:true },
  ]);
  const toggleVendCol = key => setVendCols(cs => cs.map(c => c.key===key ? {...c, vis:!c.vis} : c));

  // ── helpers ──
  const mkSortTh = (col, dir, setCol, setDir) => ({ children, align='left' }) => (
    <TableCell onClick={()=>{ if(col===arguments[0]) setDir(d=>d==='asc'?'desc':'asc'); else{setCol(arguments[0]);setDir('desc');} }}
      sx={{ ...thSx, textAlign:align, cursor:'pointer', color:col===arguments[0]?DL.blue:DL.tS, userSelect:'none', '&:hover':{ color:DL.blue } }}>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'2px' }}>
        {children}
        {col===arguments[0] ? (dir==='asc'?<AscIcon sx={{fontSize:10}}/>:<DescIcon sx={{fontSize:10}}/>) : <Box sx={{fontSize:9,opacity:.3}}>↕</Box>}
      </Box>
    </TableCell>
  );

  // sorted client rows
  const clientRows = useMemo(() => {
    let r = clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));
    r = [...r].sort((a,b) => {
      const av = sortCol==='pctVenc' ? (a.vencido/a.total)*100 : a[sortCol];
      const bv = sortCol==='pctVenc' ? (b.vencido/b.total)*100 : b[sortCol];
      if (typeof av==='string') return sortDir==='asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir==='asc' ? av-bv : bv-av;
    });
    return r;
  }, [clientes, search, sortCol, sortDir]);

  const totalPages = Math.ceil(clientRows.length/PAGE);
  const slice      = clientRows.slice(page*PAGE, (page+1)*PAGE);

  // filtered + sorted riesgo rows
  const riesgoRows = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? RIESGO_ROWS.filter(r => r.cliente.toLowerCase().includes(q) || r.folio.toLowerCase().includes(q))
      : RIESGO_ROWS;
  }, [search]);

  // filtered + sorted vendor rows
  const vendRows = useMemo(() => {
    // Re-aggregate from clientes (already period-filtered)
    const demo = {
      'Carlos Méndez': { dso:48, cei:52, badDebt:3.8 },
      'Ana Rivas':     { dso:38, cei:72, badDebt:1.9 },
      'Pedro Salas':   { dso:41, cei:68, badDebt:2.1 },
      'Lucía Torres':  { dso:32, cei:81, badDebt:1.4 },
      'Jorge Ibáñez':  { dso:44, cei:63, badDebt:2.7 },
    };
    const agg = {};
    clientes.forEach(c => {
      const v = CLIENTE_VENDEDOR[c.nombre];
      if (!v) return;
      if (!agg[v]) agg[v] = { nombre:v, cxcTotal:0, vencido:0, facturas:0, clientes:0 };
      agg[v].cxcTotal += c.total;
      agg[v].vencido  += c.vencido;
      agg[v].facturas += c.facturas;
      agg[v].clientes += 1;
    });
    let r = Object.values(agg).map(v => ({ ...v, ...(demo[v.nombre] || { dso:40, cei:70, badDebt:2.0 }) }));
    const q = search.toLowerCase();
    if (q) r = r.filter(v => v.nombre.toLowerCase().includes(q));
    return [...r].sort((a,b) => {
      let av = a[vSortCol], bv = b[vSortCol];
      if (typeof av==='string') return vSortDir==='asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return vSortDir==='asc' ? av-bv : bv-av;
    });
  }, [clientes, search, vSortCol, vSortDir]);

  const SortTh = ({ col, children, align='left' }) => (
    <TableCell onClick={()=>{ if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortCol(col);setSortDir('desc');} }}
      sx={{ ...thSx, textAlign:align, cursor:'pointer', color:sortCol===col?DL.blue:DL.tS, userSelect:'none', '&:hover':{ color:DL.blue } }}>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'2px' }}>
        {children}
        {sortCol===col ? (sortDir==='asc'?<AscIcon sx={{fontSize:10}}/>:<DescIcon sx={{fontSize:10}}/>) : <Box sx={{fontSize:9,opacity:.3}}>↕</Box>}
      </Box>
    </TableCell>
  );

  const VSortTh = ({ col, children, align='left' }) => (
    <TableCell onClick={()=>{ if(vSortCol===col) setVSortDir(d=>d==='asc'?'desc':'asc'); else{setVSortCol(col);setVSortDir('desc');} }}
      sx={{ ...thSx, textAlign:align, cursor:'pointer', color:vSortCol===col?DL.blue:DL.tS, userSelect:'none', '&:hover':{ color:DL.blue } }}>
      <Box sx={{ display:'inline-flex', alignItems:'center', gap:'2px' }}>
        {children}
        {vSortCol===col ? (vSortDir==='asc'?<AscIcon sx={{fontSize:10}}/>:<DescIcon sx={{fontSize:10}}/>) : <Box sx={{fontSize:9,opacity:.3}}>↕</Box>}
      </Box>
    </TableCell>
  );

  const diasPill = d => {
    if(d<=3) return { bg:DL.redBg, c:DL.red };
    if(d<=7) return { bg:'rgba(217,119,6,.12)', c:'#d97706' };
    return { bg:'rgba(84,126,105,.10)', c:DL.blue };
  };

  // RAG pill for metric values (higher = better unless invert=true)
  const metricPill = (val, meta, invert=false) => {
    const ratio = invert ? meta/val : val/meta;
    const good = ratio >= 1;
    const mid  = ratio >= 0.8;
    if (good)  return { bg:DL.greenBg,              c:DL.green  };
    if (mid)   return { bg:'rgba(217,119,6,.12)',    c:'#d97706' };
    return             { bg:DL.redBg,                c:DL.red    };
  };

  return (
    <Card sx={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* ── Card title + controls ── */}
      <Box sx={{ px:'14px', pt:'12px', pb:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px', flexWrap:'wrap' }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Cartera de Clientes</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <ColBtn
            cols={tab === 0 ? cliCols : tab === 1 ? riesgoCols : vendCols}
            onToggle={tab === 0 ? toggleCliCol : tab === 1 ? toggleRiesgoCol : toggleVendCol}
          />
          <Box sx={{ display:'flex', alignItems:'center', gap:'6px', border:`1px solid ${DL.border2}`, borderRadius:'7px', px:'10px', py:'5px', background:'#fff', width:220 }}>
            <SearchIcon sx={{ fontSize:14, color:DL.tS }} />
            <Box component="input"
              placeholder={tab === 0 ? 'Buscar cliente...' : tab === 1 ? 'Buscar cliente o folio...' : 'Buscar vendedor...'}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              sx={{ fontFamily:FONT, fontSize:11, color:DL.tH, border:'none', outline:'none', background:'transparent', width:'100%', '&::placeholder':{ color:DL.tS } }}
            />
          </Box>
        </Box>
      </Box>
      {/* ── Tabs header ── */}
      <Box sx={{ px:'14px' }}>
        <Tabs value={tab} onChange={(_,v)=>{ setTab(v); setSearch(''); setPage(0); }} sx={{
          minHeight:36,
          '& .MuiTab-root':{ fontFamily:FONT, fontSize:11, fontWeight: 500, minHeight:36, textTransform:'none', color:DL.tS, px:'14px' },
          '& .Mui-selected':{ color:DL.tH },
          '& .MuiTabs-indicator':{ background:DL.blue, height:2 },
        }}>
          {/* Tab 0 — Clientes */}
          <Tab label={
            <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
              Clientes
              <Box sx={{ background:'rgba(26,26,26,.07)', color:DL.blue, borderRadius:'4px', fontSize:9, fontWeight: 500, px:'6px', py:'1px' }}>
                {clientes.length}
              </Box>
            </Box>
          } />
          {/* Tab 1 — En Riesgo */}
          <Tab label={
            <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Box sx={{ width:7, height:7, borderRadius:'50%', background:DL.red,
                animation:'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse':{'0%,100%':{opacity:1},'50%':{opacity:.4}} }} />
              En Riesgo
              <Box sx={{ background:DL.redBg, color:DL.red, borderRadius:'4px', fontSize:9, fontWeight: 500, px:'6px', py:'1px' }}>
                {RIESGO_ROWS.length}
              </Box>
            </Box>
          } />
          {/* Tab 2 — Vendedores */}
          <Tab label={
            <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
              Vendedores
              <Box sx={{ background:'rgba(26,26,26,.07)', color:DL.blue, borderRadius:'4px', fontSize:9, fontWeight: 500, px:'6px', py:'1px' }}>
                {vendRows.length}
              </Box>
            </Box>
          } />
        </Tabs>
      </Box>
      <Box sx={{ height:'1px', background:DL.border, mx:'14px' }} />

      {/* ── Tab 0: Clientes ── */}
      {tab === 0 && (
        <>
          <Box sx={{ px: '14px', py: '14px' }}>
            <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {cliCols.find(c=>c.key==='nombre')?.vis && <SortTh col="nombre">Cliente</SortTh>}
                  {cliCols.find(c=>c.key==='total')?.vis && <SortTh col="total" align="right">Total CxC</SortTh>}
                  {cliCols.find(c=>c.key==='vencido')?.vis && <SortTh col="vencido" align="right">Vencido</SortTh>}
                  {cliCols.find(c=>c.key==='noVencido')?.vis && <SortTh col="noVencido" align="right">No Vencido</SortTh>}
                  {cliCols.find(c=>c.key==='pctVenc')?.vis && <SortTh col="pctVenc" align="right">% Vencido</SortTh>}
                  {cliCols.find(c=>c.key==='rotacion')?.vis && <SortTh col="rotacion" align="right">Rotación</SortTh>}
                  {cliCols.find(c=>c.key==='riesgo')?.vis && <TableCell sx={{ ...thSx, textAlign:'center' }}>Riesgo</TableCell>}
                  {cliCols.find(c=>c.key==='facturas')?.vis && <SortTh col="facturas" align="right"># Fact.</SortTh>}
                </TableRow>
              </TableHead>
              <TableBody>
                {slice.map(r => {
                  const pct = r.total > 0 ? (r.vencido/r.total)*100 : 0;
                  return (
                    <TableRow key={r.id} onClick={()=>onSelect&&onSelect(r)}
                      sx={{ cursor:'pointer', '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                      {cliCols.find(c=>c.key==='nombre')?.vis && <TableCell sx={{ ...tdSx, maxWidth:220 }}>
                        <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.nombre}</Typography>
                      </TableCell>}
                      {cliCols.find(c=>c.key==='total')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500 }}>{fmtCLP(r.total)}</TableCell>}
                      {cliCols.find(c=>c.key==='vencido')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', color:r.vencido>0?DL.red:DL.tS, fontWeight: 500 }}>{r.vencido>0?fmtCLP(r.vencido):'—'}</TableCell>}
                      {cliCols.find(c=>c.key==='noVencido')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.green, fontWeight: 500 }}>{fmtCLP(r.noVencido)}</TableCell>}
                      {cliCols.find(c=>c.key==='pctVenc')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:'6px', justifyContent:'flex-end' }}>
                          <Typography sx={{ fontSize:11, fontFamily:FONT, fontWeight: 500, color:pct>75?DL.red:pct>40?'#d97706':DL.tH }}>{pct.toFixed(0)}%</Typography>
                          <Box sx={{ width:50, height:5, background:'rgba(26,26,26,.07)', borderRadius:3, overflow:'hidden' }}>
                            <Box sx={{ height:'100%', width:`${Math.min(pct,100)}%`, borderRadius:3, background:pct>75?DL.red:pct>40?'#d97706':DL.green }} />
                          </Box>
                        </Box>
                      </TableCell>}
                      {cliCols.find(c=>c.key==='rotacion')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                        <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px',
                          background: r.rotacion >= 12 ? DL.greenBg : r.rotacion >= 8 ? 'rgba(217,119,6,.12)' : DL.redBg }}>
                          <Typography sx={{ fontSize:10, fontWeight: 500, fontFamily:FONT,
                            color: r.rotacion >= 12 ? DL.green : r.rotacion >= 8 ? '#d97706' : DL.red }}>
                            {r.rotacion?.toFixed(1)}x
                          </Typography>
                        </Box>
                      </TableCell>}
                      {cliCols.find(c=>c.key==='riesgo')?.vis && <TableCell sx={{ ...tdSx, textAlign:'center' }}>
                        <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:riskBg(r.riesgo) }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:riskColor(r.riesgo), fontFamily:FONT }}>{r.riesgo}</Typography>
                        </Box>
                      </TableCell>}
                      {cliCols.find(c=>c.key==='facturas')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{r.facturas}</TableCell>}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
            </Box>
          </Box>
          {totalPages > 1 && (
            <Box sx={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px', px:'14px', py:'8px', borderTop:`1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FONT }}>{page+1} / {totalPages}</Typography>
              {['‹','›'].map((btn,i) => (
                <Box key={btn} component="button" onClick={()=>setPage(p=>i===0?Math.max(0,p-1):Math.min(totalPages-1,p+1))}
                  disabled={i===0?page===0:page===totalPages-1}
                  sx={{ fontFamily:FONT, fontSize:13, px:'8px', py:'3px', borderRadius:'5px', border:`1px solid ${DL.border2}`, background:'#fff', color:DL.tM, cursor:'pointer', '&:disabled':{opacity:.4,cursor:'not-allowed'}, '&:hover:not(:disabled)':{borderColor:DL.blue,color:DL.blue} }}>
                  {btn}
                </Box>
              ))}
            </Box>
          )}
        </>
      )}

      {/* ── Tab 1: En Riesgo ── */}
      {tab === 1 && (
        <Box sx={{ px: '14px', py: '14px' }}>
          <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {riesgoCols.find(c=>c.key==='cliente')?.vis      && <TableCell sx={thSx}>Cliente</TableCell>}
                {riesgoCols.find(c=>c.key==='folio')?.vis        && <TableCell sx={thSx}>Folio</TableCell>}
                {riesgoCols.find(c=>c.key==='vencimiento')?.vis  && <TableCell sx={thSx}>Vencimiento</TableCell>}
                {riesgoCols.find(c=>c.key==='diasRestantes')?.vis && <TableCell sx={{ ...thSx, textAlign:'right' }}>Días Rest.</TableCell>}
                {riesgoCols.find(c=>c.key==='monto')?.vis        && <TableCell sx={{ ...thSx, textAlign:'right' }}>Monto</TableCell>}
                {riesgoCols.find(c=>c.key==='riesgo')?.vis       && <TableCell sx={thSx}>Riesgo</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {riesgoRows.length === 0 && (
                <TableRow><TableCell colSpan={6} sx={{ ...tdSx, textAlign:'center', color:DL.tS }}>Sin resultados</TableCell></TableRow>
              )}
              {riesgoRows.map((r,i) => {
                const dp = diasPill(r.diasRestantes);
                return (
                  <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                    {riesgoCols.find(c=>c.key==='cliente')?.vis      && <TableCell sx={{ ...tdSx, fontWeight: 500 }}>{r.cliente}</TableCell>}
                    {riesgoCols.find(c=>c.key==='folio')?.vis        && <TableCell sx={{ ...tdSx, color:DL.blue, fontWeight: 500 }}>{r.folio}</TableCell>}
                    {riesgoCols.find(c=>c.key==='vencimiento')?.vis  && <TableCell sx={{ ...tdSx, color:DL.tM }}>{r.vencimiento}</TableCell>}
                    {riesgoCols.find(c=>c.key==='diasRestantes')?.vis && (
                      <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                        <Box sx={{ display:'inline-flex', px:'8px', py:'2px', borderRadius:'4px', background:dp.bg }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:dp.c, fontFamily:FONT }}>{r.diasRestantes}d</Typography>
                        </Box>
                      </TableCell>
                    )}
                    {riesgoCols.find(c=>c.key==='monto')?.vis        && <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.red, fontWeight: 500 }}>{fmtCLP(r.monto)}</TableCell>}
                    {riesgoCols.find(c=>c.key==='riesgo')?.vis       && (
                      <TableCell sx={tdSx}>
                        <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:riskBg(r.riesgo) }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:riskColor(r.riesgo), fontFamily:FONT }}>{r.riesgo}</Typography>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
          </Box>
        </Box>
      )}

      {/* ── Tab 2: Vendedores ── */}
      {tab === 2 && (
        <>
          <Box sx={{ px: '14px', py: '14px' }}>
            <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {vendCols.find(c=>c.key==='nombre')?.vis   && <VSortTh col="nombre">Vendedor</VSortTh>}
                  {vendCols.find(c=>c.key==='clientes')?.vis && <VSortTh col="clientes" align="right">Clientes</VSortTh>}
                  {vendCols.find(c=>c.key==='cxcTotal')?.vis && <VSortTh col="cxcTotal" align="right">CxC Total</VSortTh>}
                  {vendCols.find(c=>c.key==='vencido')?.vis  && <VSortTh col="vencido" align="right">Cartera Vencida</VSortTh>}
                  {vendCols.find(c=>c.key==='pctVenc')?.vis  && <TableCell sx={{ ...thSx, textAlign:'right' }}>% Vencido</TableCell>}
                  {vendCols.find(c=>c.key==='dso')?.vis      && <VSortTh col="dso" align="right">DSO</VSortTh>}
                  {vendCols.find(c=>c.key==='cei')?.vis      && <VSortTh col="cei" align="right">CEI</VSortTh>}
                  {vendCols.find(c=>c.key==='badDebt')?.vis  && <VSortTh col="badDebt" align="right">Bad Debt</VSortTh>}
                </TableRow>
              </TableHead>
              <TableBody>
                {vendRows.map((v, i) => {
                  const pctVenc = v.cxcTotal > 0 ? (v.vencido/v.cxcTotal)*100 : 0;
                  const dsoPill  = metricPill(30, v.dso);        // lower DSO is better
                  const ceiPill  = metricPill(v.cei, 85);        // higher CEI vs 85% meta
                  const bdPill   = metricPill(2, v.badDebt);     // lower Bad Debt is better
                  return (
                    <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                      {vendCols.find(c=>c.key==='nombre')?.vis && (
                        <TableCell sx={{ ...tdSx }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <Box sx={{ width:26, height:26, borderRadius:'50%', background:`rgba(26,26,26,.1)`,
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.navy, fontFamily:FONT }}>
                                {v.nombre.split(' ').map(w=>w[0]).join('').slice(0,2)}
                              </Typography>
                            </Box>
                            <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{v.nombre}</Typography>
                          </Box>
                        </TableCell>
                      )}
                      {vendCols.find(c=>c.key==='clientes')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tM }}>{v.clientes}</TableCell>}
                      {vendCols.find(c=>c.key==='cxcTotal')?.vis && <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:DL.tH }}>{fmtCLP(v.cxcTotal)}</TableCell>}
                      {vendCols.find(c=>c.key==='vencido')?.vis  && (
                        <TableCell sx={{ ...tdSx, textAlign:'right', fontWeight: 500, color:v.vencido>0?DL.red:DL.tS }}>
                          {v.vencido > 0 ? fmtCLP(v.vencido) : '—'}
                        </TableCell>
                      )}
                      {vendCols.find(c=>c.key==='pctVenc')?.vis  && (
                        <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:'6px', justifyContent:'flex-end' }}>
                            <Typography sx={{ fontSize:11, fontFamily:FONT, fontWeight: 500, color:pctVenc>75?DL.red:pctVenc>40?'#d97706':DL.tH }}>
                              {pctVenc.toFixed(0)}%
                            </Typography>
                            <Box sx={{ width:44, height:5, background:'rgba(26,26,26,.07)', borderRadius:3, overflow:'hidden' }}>
                              <Box sx={{ height:'100%', width:`${Math.min(pctVenc,100)}%`, borderRadius:3,
                                background:pctVenc>75?DL.red:pctVenc>40?'#d97706':DL.green }} />
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      {vendCols.find(c=>c.key==='dso')?.vis && (
                        <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                          <Box sx={{ display:'inline-flex', px:'8px', py:'2px', borderRadius:'4px', background:dsoPill.bg }}>
                            <Typography sx={{ fontSize:10, fontWeight: 500, color:dsoPill.c, fontFamily:FONT }}>{v.dso}d</Typography>
                          </Box>
                        </TableCell>
                      )}
                      {vendCols.find(c=>c.key==='cei')?.vis && (
                        <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                          <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:ceiPill.bg }}>
                            <Typography sx={{ fontSize:10, fontWeight: 500, color:ceiPill.c, fontFamily:FONT }}>{v.cei}%</Typography>
                          </Box>
                        </TableCell>
                      )}
                      {vendCols.find(c=>c.key==='badDebt')?.vis && (
                        <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                          <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:bdPill.bg }}>
                            <Typography sx={{ fontSize:10, fontWeight: 500, color:bdPill.c, fontFamily:FONT }}>{v.badDebt}%</Typography>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
              {/* ── Totals footer ── */}
              <TableHead>
                <TableRow sx={{ background:'rgba(26,26,26,.03)' }}>
                  {vendCols.find(c=>c.key==='nombre')?.vis   && <TableCell sx={{ ...thSx, color:DL.navy }}>TOTAL</TableCell>}
                  {vendCols.find(c=>c.key==='clientes')?.vis && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tM }}>{vendRows.reduce((s,v)=>s+v.clientes,0)}</TableCell>}
                  {vendCols.find(c=>c.key==='cxcTotal')?.vis && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tH }}>{fmtCLP(vendRows.reduce((s,v)=>s+v.cxcTotal,0))}</TableCell>}
                  {vendCols.find(c=>c.key==='vencido')?.vis  && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.red }}>{fmtCLP(vendRows.reduce((s,v)=>s+v.vencido,0))}</TableCell>}
                  {vendCols.find(c=>c.key==='pctVenc')?.vis  && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tS }}>{(() => { const t=vendRows.reduce((s,v)=>s+v.cxcTotal,0); const vv=vendRows.reduce((s,v)=>s+v.vencido,0); return t>0?(vv/t*100).toFixed(0)+'%':'—'; })()}</TableCell>}
                  {vendCols.find(c=>c.key==='dso')?.vis      && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tS }}>{(vendRows.reduce((s,v)=>s+v.dso,0)/vendRows.length).toFixed(0)}d prom.</TableCell>}
                  {vendCols.find(c=>c.key==='cei')?.vis      && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tS }}>{(vendRows.reduce((s,v)=>s+v.cei,0)/vendRows.length).toFixed(0)}% prom.</TableCell>}
                  {vendCols.find(c=>c.key==='badDebt')?.vis  && <TableCell sx={{ ...thSx, textAlign:'right', color:DL.tS }}>{(vendRows.reduce((s,v)=>s+v.badDebt,0)/vendRows.length).toFixed(1)}% prom.</TableCell>}
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
            </Box>
          </Box>
        </>
      )}
    </Card>
  );
}

// ─── AgingTramoModal — Vista consolidada de CxC por Tramo ────────────────────
function AgingTramoModal({ onClose }) {
  const totVencM  = AGING_BUCKETS.reduce((s,r)=>s+r.vencMonto,0);
  const totVencF  = AGING_BUCKETS.reduce((s,r)=>s+r.vencFact,0);
  const totNVencM = AGING_BUCKETS.reduce((s,r)=>s+r.noVencMonto,0);
  const totNVencF = AGING_BUCKETS.reduce((s,r)=>s+r.noVencFact,0);
  const totM      = totVencM + totNVencM;
  const totF      = totVencF + totNVencF;

  const tramoBg = t => {
    if(t==='+120 d'||t==='+ 120 d') return { bg:DL.redBg, c:DL.red };
    if(t.startsWith('91')) return { bg:'rgba(217,119,6,.12)', c:'#d97706' };
    if(t.startsWith('61')) return { bg:'rgba(234,179,8,.12)', c:'#ca8a04' };
    return { bg:DL.greenBg, c:DL.green };
  };

  const chartOption = {
    grid: { left: 80, right: 24, top: 16, bottom: 32 },
    xAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'Inter', fontSize: 9, formatter: v => fmtCLP(v) },
      splitLine: { lineStyle: { color: 'rgba(26,26,26,.07)' } },
    },
    yAxis: {
      type: 'category',
      data: [...AGING_BUCKETS].reverse().map(r => r.tramo),
      axisLabel: { fontFamily: 'Inter', fontSize: 10, color: '#6a6a6a' },
    },
    series: [
      {
        name: 'Vencido',
        type: 'bar',
        stack: 'total',
        data: [...AGING_BUCKETS].reverse().map(r => r.vencMonto),
        itemStyle: { color: DL.red, borderRadius: [0,0,0,0] },
        label: { show: false },
      },
      {
        name: 'No Vencido',
        type: 'bar',
        stack: 'total',
        data: [...AGING_BUCKETS].reverse().map(r => r.noVencMonto),
        itemStyle: { color: 'rgba(84,126,105,.7)', borderRadius: [0,4,4,0] },
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: params => params.map(p => `${p.seriesName}: ${fmtCLP(p.value)}`).join('<br/>'),
    },
    legend: {
      bottom: 0,
      textStyle: { fontFamily: 'Inter', fontSize: 9 },
      icon: 'circle', itemWidth: 8,
    },
  };

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
      }}
    >
      {/* Panel */}
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          width: { xs: '100%', md: '80%', lg: '72%' },
          background: '#f7f8fd',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(26,26,26,.12)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{
          background: '#fff', px: '28px', py: '16px',
          borderBottom: `1px solid ${DL.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>
              Cuentas por Cobrar por Tramo
            </Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: FONT, mt: '2px' }}>
              Vista consolidada · {totF} facturas · Demo Corp S.A.
            </Typography>
          </Box>
          <Box
            component="button" onClick={onClose}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '8px',
              border: `1px solid ${DL.border}`, background: '#fff',
              cursor: 'pointer', color: DL.tS,
              '&:hover': { background: DL.redBg, borderColor: DL.red, color: DL.red },
              transition: 'all .14s',
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: '20px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── 4 KPIs ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { lbl: 'Total Cartera CxC', val: fmtCLP(totM),      pct: 87,  meta: '$4.28B', metaLbl: 'Mes Anterior', diff: '+$0.50B',     diffUp: true,  yoyPrev: '$4.2B', yoyDelta: '+12.3%', yoyUp: true  },
              { lbl: 'Total Vencido',     val: fmtCLP(totVencM),   pct: 33,  meta: '< 25%', metaLbl: 'Meta',         diff: `${((totVencM/totM)*100).toFixed(0)}% del total`, diffUp: false, yoyPrev: '62%', yoyDelta: '+13pp', yoyUp: false },
              { lbl: 'Total No Vencido',  val: fmtCLP(totNVencM),  pct: 100, meta: '> 75%', metaLbl: 'Meta',         diff: `${((totNVencM/totM)*100).toFixed(0)}% del total`, diffUp: true,  yoyPrev: '38%', yoyDelta: '-13pp', yoyUp: true  },
              { lbl: 'Facturas Totales',  val: String(totF),       pct: 92,  meta: '300',   metaLbl: 'Meta',         diff: `${totVencF} venc. / ${totNVencF} al día`, diffUp: false, yoyPrev: '248', yoyDelta: '+11.3%', yoyUp: true  },
            ].map((k, i) => (
              <KpiCard key={i} {...k} />
            ))}
          </Box>

          {/* ── Chart + summary table row ── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            {/* Chart */}
            <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 }}>
              <Box sx={{ px: '14px', pt: '12px', pb: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>Distribución por Tramo</Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: FONT }}>Vencido vs No Vencido</Typography>
              </Box>
              <Box sx={{ height: '1px', background: DL.border, mx: '14px' }} />
              <Box sx={{ p: '12px 14px 14px' }}>
                <ReactECharts option={chartOption} style={{ height: 220 }} opts={{ renderer: 'svg' }} />
              </Box>
            </Box>

            {/* % por tramo breakdown */}
            <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 }}>
              <Box sx={{ px: '14px', pt: '12px', pb: '10px' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>Concentración de Riesgo</Typography>
              </Box>
              <Box sx={{ height: '1px', background: DL.border, mx: '14px' }} />
              <Box sx={{ p: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {AGING_BUCKETS.map((r, i) => {
                  const bc = tramoBg(r.tramo);
                  const pctV = totVencM > 0 ? (r.vencMonto / totVencM) * 100 : 0;
                  return (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '4px' }}>
                        <Box sx={{ display: 'inline-flex', px: '7px', py: '1px', borderRadius: '4px', background: bc.bg }}>
                          <Typography sx={{ fontSize: 9, fontWeight: 500, color: bc.c, fontFamily: FONT }}>{r.tramo}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.red, fontFamily: FONT }}>{fmtCLP(r.vencMonto)}</Typography>
                          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FONT }}>{pctV.toFixed(1)}%</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ height: 6, background: 'rgba(26,26,26,.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${pctV}%`, background: bc.c, borderRadius: 3, transition: 'width .5s ease' }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* ── Detailed table ── */}
          <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 }}>
            <Box sx={{ px: '14px', pt: '12px', pb: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>Detalle por Tramo</Typography>
              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: FONT }}>{totF} facturas en total</Typography>
            </Box>
            <Box sx={{ height: '1px', background: DL.border, mx: '14px' }} />
            <Box sx={{ p: '10px 14px 14px' }}>
              <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'hidden' }}>
                <TableContainer>
                  <Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={thSx} rowSpan={2}>Tramo</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'center', color: DL.red, borderLeft: `2px solid ${DL.redBg}` }} colSpan={3}>Vencidas</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'center', color: DL.blue, borderLeft: `2px solid rgba(84,126,105,.15)` }} colSpan={3}>No Vencidas</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', borderLeft: `2px solid ${DL.border}` }} rowSpan={2}>Total Tramo</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ ...thSx, textAlign: 'right', borderLeft: `2px solid ${DL.redBg}` }}>Monto</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right' }}># Fact.</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right' }}>% Total V.</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', borderLeft: `2px solid rgba(84,126,105,.15)` }}>Monto</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right' }}># Fact.</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right' }}>% Total NV.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {AGING_BUCKETS.map((r, i) => {
                        const bc = tramoBg(r.tramo);
                        const pctV  = totVencM  > 0 ? (r.vencMonto   / totVencM  * 100).toFixed(1) : '—';
                        const pctNV = totNVencM > 0 ? (r.noVencMonto / totNVencM * 100).toFixed(1) : '—';
                        return (
                          <TableRow key={i} sx={{ '&:hover td': { background: 'rgba(84,126,105,.025)' } }}>
                            <TableCell sx={tdSx}>
                              <Box sx={{ display: 'inline-flex', px: '7px', py: '2px', borderRadius: '4px', background: bc.bg }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 500, color: bc.c, fontFamily: FONT }}>{r.tramo}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.red, fontWeight: 500, borderLeft: `2px solid ${DL.redBg}` }}>{fmtCLP(r.vencMonto)}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tS }}>{r.vencFact}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tS, fontSize: 10 }}>{pctV}%</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.blue, fontWeight: 500, borderLeft: `2px solid rgba(84,126,105,.15)` }}>{fmtCLP(r.noVencMonto)}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tS }}>{r.noVencFact}</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tS, fontSize: 10 }}>{pctNV}%</TableCell>
                            <TableCell sx={{ ...tdSx, textAlign: 'right', fontWeight: 500, color: DL.tH, borderLeft: `2px solid ${DL.border}` }}>
                              {fmtCLP(r.vencMonto + r.noVencMonto)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(26,26,26,.04)' }}>
                        <TableCell sx={{ ...thSx, color: DL.navy }}>TOTAL</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.red, borderLeft: `2px solid ${DL.redBg}` }}>{fmtCLP(totVencM)}</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.red }}>{totVencF}</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.tS }}>100%</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.blue, borderLeft: `2px solid rgba(84,126,105,.15)` }}>{fmtCLP(totNVencM)}</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.blue }}>{totNVencF}</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.tS }}>100%</TableCell>
                        <TableCell sx={{ ...thSx, textAlign: 'right', color: DL.navy, fontWeight: 500, borderLeft: `2px solid ${DL.border}` }}>{fmtCLP(totM)}</TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

// ─── TopClientesVencidos ─────────────────────────────────────────────────────
function TopClientesVencidos({ clientes = CLIENTES_TABLE }) {
  const withVencido = clientes.filter(c => c.vencido > 0);
  const top         = [...withVencido].sort((a, b) => b.vencido - a.vencido).slice(0, 10);
  const maxVenc     = top[0]?.vencido || 1;

  return (
    <Card sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Header */}
      <Box sx={{
        px:'14px', pt:'12px', pb:'10px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderBottom:`1px solid ${DL.border}`, flexShrink:0,
      }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>
          Top Clientes Vencidos
        </Typography>
        <Box sx={{ px:'8px', py:'2px', borderRadius:'4px', background:'rgba(220,38,38,.10)' }}>
          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.red, fontFamily:FONT }}>
            {withVencido.length} clientes
          </Typography>
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flex:1, display:'flex', flexDirection:'column', p:'4px 14px 10px', overflowY:'auto', minHeight:0 }}>
        {top.length === 0 && (
          <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FONT, textAlign:'center', py:'20px' }}>
            Sin clientes vencidos en el período
          </Typography>
        )}
        {top.map((c, i) => {
          const barW = Math.round((c.vencido / maxVenc) * 100);
          return (
            <Box key={c.id || i} sx={{
              display:'flex', alignItems:'center', gap:'8px',
              py:'9px',
              borderBottom: i < top.length - 1 ? `1px solid rgba(26,26,26,.05)` : 'none',
            }}>
              {/* Rank */}
              <Typography sx={{
                fontSize:11, fontWeight: 500, color:DL.tS,
                fontFamily:FONT, minWidth:16, textAlign:'center', flexShrink:0,
              }}>
                {i + 1}
              </Typography>

              {/* Name + mini bar */}
              <Box sx={{ flex:1, minWidth:0 }}>
                <Typography sx={{
                  fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>
                  {c.nombre}
                </Typography>
                <Box sx={{ mt:'4px', height:3, borderRadius:2, background:'rgba(26,26,26,.07)', overflow:'hidden' }}>
                  <Box sx={{
                    height:'100%', width:`${barW}%`, borderRadius:2,
                    background: riskColor(c.riesgo),
                    transition:'width 0.5s ease',
                  }} />
                </Box>
              </Box>

              {/* Amount */}
              <Typography sx={{
                fontSize:12, fontWeight: 500, color:DL.red,
                fontFamily:FONT, whiteSpace:'nowrap', flexShrink:0,
              }}>
                {fmtCLP(c.vencido)}
              </Typography>

              {/* Risk badge */}
              <Box sx={{
                px:'6px', py:'2px', borderRadius:'4px',
                background:riskBg(c.riesgo), flexShrink:0,
              }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color:riskColor(c.riesgo), fontFamily:FONT }}>
                  {c.riesgo}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}

// ─── AgingBucketsTable ────────────────────────────────────────────────────────
function AgingBucketsTable() {
  const [modalOpen, setModalOpen] = useState(false);

  const totVencM  = AGING_BUCKETS.reduce((s,r)=>s+r.vencMonto,0);
  const totVencF  = AGING_BUCKETS.reduce((s,r)=>s+r.vencFact,0);
  const totNVencM = AGING_BUCKETS.reduce((s,r)=>s+r.noVencMonto,0);
  const totNVencF = AGING_BUCKETS.reduce((s,r)=>s+r.noVencFact,0);
  const totM      = totVencM + totNVencM;

  const tramoBg = t => {
    if(t==='+120 d'||t==='+ 120 d') return { bg:DL.redBg, c:DL.red };
    if(t.startsWith('91')) return { bg:'rgba(217,119,6,.12)', c:'#d97706' };
    if(t.startsWith('61')) return { bg:'rgba(234,179,8,.12)', c:'#ca8a04' };
    return { bg:DL.greenBg, c:DL.green };
  };

  return (
    <Card sx={{ height:'100%', display:'flex', flexDirection:'column' }}>

      {/* ── Card header ── */}
      <Box sx={{ px:'14px', pt:'12px', pb:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>CxC por Tramo</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FONT }}>
            {totVencF + totNVencF} facturas total
          </Typography>
          {/* Expand button */}
          <Box
            component="button"
            onClick={() => setModalOpen(true)}
            title="Ver vista consolidada"
            sx={{
              display:'flex', alignItems:'center', justifyContent:'center',
              width:26, height:26, borderRadius:'7px',
              border:`1px solid ${DL.border2}`,
              background:'#fff', cursor:'pointer',
              color: DL.tS,
              transition:'all .14s',
              '&:hover':{ background: 'rgba(26,26,26,.06)', borderColor: DL.blue, color: DL.blue },
            }}
          >
            <OpenInFullIcon sx={{ fontSize:13 }} />
          </Box>
        </Box>
      </Box>

      {/* Modal */}
      {modalOpen && <AgingTramoModal onClose={() => setModalOpen(false)} />}
      <Box sx={{ height:'1px', background:DL.border, mx:'14px' }} />

      {/* ── Two summary mini-cards ── */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', px:'14px', pt:'14px', pb:'12px' }}>
        {/* Vencido */}
        <Box sx={{
          background: DL.redBg, borderRadius:'8px',
          border:`1px solid rgba(239,68,68,.22)`, p:'12px 14px',
        }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.red, fontFamily:FONT, mb:'3px' }}>
            Total Vencido
          </Typography>
          <Typography sx={{ fontSize:17, fontWeight: 500, color:'#b91c1c', fontFamily:FONT, lineHeight:1.1, letterSpacing:'-0.02em' }}>
            {fmtCLP(totVencM)}
          </Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mt:'4px' }}>
            <Typography sx={{ fontSize:9, color:DL.red, fontFamily:FONT }}>{totVencF} fact.</Typography>
            <Box sx={{ px:'6px', py:'1px', borderRadius:'4px', background:'rgba(239,68,68,.15)' }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:'#b91c1c', fontFamily:FONT }}>
                {totM > 0 ? ((totVencM/totM)*100).toFixed(1) : 0}% del total
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* No Vencido */}
        <Box sx={{
          background:'rgba(84,126,105,.07)', borderRadius:'8px',
          border:`1px solid rgba(84,126,105,.22)`, p:'12px 14px',
        }}>
          <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.blue, fontFamily:FONT, mb:'3px' }}>
            Total No Vencido
          </Typography>
          <Typography sx={{ fontSize:17, fontWeight: 500, color:DL.navy, fontFamily:FONT, lineHeight:1.1, letterSpacing:'-0.02em' }}>
            {fmtCLP(totNVencM)}
          </Typography>
          <Box sx={{ display:'flex', alignItems:'center', gap:'6px', mt:'4px' }}>
            <Typography sx={{ fontSize:9, color:DL.blue, fontFamily:FONT }}>{totNVencF} fact.</Typography>
            <Box sx={{ px:'6px', py:'1px', borderRadius:'4px', background:'rgba(84,126,105,.12)' }}>
              <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>
                {totM > 0 ? ((totNVencM/totM)*100).toFixed(1) : 0}% del total
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ px:'14px', pb:'14px' }}>
        <Box sx={{ border:`1px solid rgba(26,26,26,.1)`, borderRadius:'8px', overflow:'hidden' }}>
          <TableContainer>
            <Table size="small" sx={{ width:'100%', tableLayout:'fixed' }}>
              <colgroup>
                <col style={{ width:'24%' }} />
                <col style={{ width:'23%' }} />
                <col style={{ width:'13%' }} />
                <col style={{ width:'23%' }} />
                <col style={{ width:'13%' }} />
              </colgroup>
              <TableHead>
                {/* Group row */}
                <TableRow>
                  <TableCell rowSpan={2} sx={{ ...thSx, verticalAlign:'middle', py:'11px' }}>Tramo</TableCell>
                  <TableCell colSpan={2} sx={{
                    fontSize:9, fontWeight: 500, textAlign:'center', color:DL.red,
                    background:'rgba(239,68,68,.10)', py:'7px', px:'10px',
                    borderBottom:'1px solid rgba(239,68,68,.18)',
                    borderLeft:'2px solid rgba(239,68,68,.28)',
                    letterSpacing:'0.07em', textTransform:'uppercase', whiteSpace:'nowrap',
                    fontFamily: FONT,
                  }}>
                    Vencidas
                  </TableCell>
                  <TableCell colSpan={2} sx={{
                    fontSize:9, fontWeight: 500, textAlign:'center', color:DL.blue,
                    background:'rgba(84,126,105,.10)', py:'7px', px:'10px',
                    borderBottom:'1px solid rgba(84,126,105,.18)',
                    borderLeft:'2px solid rgba(84,126,105,.28)',
                    letterSpacing:'0.07em', textTransform:'uppercase', whiteSpace:'nowrap',
                    fontFamily: FONT,
                  }}>
                    No Vencidas
                  </TableCell>
                </TableRow>
                {/* Sub-header row */}
                <TableRow>
                  <TableCell sx={{ ...thSx, textAlign:'right', background:'rgba(239,68,68,.05)', borderLeft:'2px solid rgba(239,68,68,.28)', py:'6px' }}>Monto</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', background:'rgba(239,68,68,.05)', py:'6px' }}>#</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', background:'rgba(84,126,105,.05)', borderLeft:'2px solid rgba(84,126,105,.28)', py:'6px' }}>Monto</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', background:'rgba(84,126,105,.05)', py:'6px' }}>#</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {AGING_BUCKETS.map((r,i) => {
                  const bc = tramoBg(r.tramo);
                  return (
                    <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                      <TableCell sx={tdSx}>
                        <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:bc.bg }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:bc.c, fontFamily:FONT }}>{r.tramo}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.red, fontWeight: 500, borderLeft:'2px solid rgba(239,68,68,.28)', background:'rgba(239,68,68,.025)' }}>{fmtCLP(r.vencMonto)}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tS, background:'rgba(239,68,68,.025)' }}>{r.vencFact}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.blue, fontWeight: 500, borderLeft:'2px solid rgba(84,126,105,.28)', background:'rgba(84,126,105,.025)' }}>{fmtCLP(r.noVencMonto)}</TableCell>
                      <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.tS, background:'rgba(84,126,105,.025)' }}>{r.noVencFact}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableHead>
                <TableRow sx={{ background:'rgba(26,26,26,.03)' }}>
                  <TableCell sx={{ ...thSx, color:DL.navy }}>TOTAL</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', color:DL.red, borderLeft:'2px solid rgba(239,68,68,.28)', background:'rgba(239,68,68,.07)' }}>{fmtCLP(totVencM)}</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', color:DL.red, background:'rgba(239,68,68,.07)' }}>{totVencF}</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', color:DL.blue, borderLeft:'2px solid rgba(84,126,105,.28)', background:'rgba(84,126,105,.07)' }}>{fmtCLP(totNVencM)}</TableCell>
                  <TableCell sx={{ ...thSx, textAlign:'right', color:DL.blue, background:'rgba(84,126,105,.07)' }}>{totNVencF}</TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Card>
  );
}

// ─── AtRiskTable ──────────────────────────────────────────────────────────────
function AtRiskTable() {
  const diasPill = d => {
    if(d<=3) return { bg:DL.redBg, c:DL.red, label:`${d}d` };
    if(d<=7) return { bg:'rgba(217,119,6,.12)', c:'#d97706', label:`${d}d` };
    return { bg:'rgba(84,126,105,.10)', c:DL.blue, label:`${d}d` };
  };
  return (
    <Card>
      <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', gap:'8px' }}>
        <Box sx={{ width:8, height:8, borderRadius:'50%', background:DL.red, animation:'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse':{ '0%,100%':{opacity:1},'50%':{opacity:.4} } }} />
        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Clientes en Riesgo · Vencen en los Próximos 15 Días</Typography>
      </Box>
      <Box sx={{ px: '14px', pb: '14px' }}>
        <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Cliente','Folio','Vencimiento','Días Restantes','Monto','Riesgo'].map(h => (
                <TableCell key={h} sx={{ ...thSx, textAlign:['Monto','Días Restantes'].includes(h)?'right':'left' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {RIESGO_ROWS.map((r,i) => {
              const dp = diasPill(r.diasRestantes);
              return (
                <TableRow key={i} sx={{ '&:hover td':{ background:'rgba(84,126,105,.025)' } }}>
                  <TableCell sx={{ ...tdSx, fontWeight: 500 }}>{r.cliente}</TableCell>
                  <TableCell sx={{ ...tdSx, color:DL.blue, fontWeight: 500 }}>{r.folio}</TableCell>
                  <TableCell sx={{ ...tdSx, color:DL.tM }}>{r.vencimiento}</TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right' }}>
                    <Box sx={{ display:'inline-flex', px:'8px', py:'2px', borderRadius:'4px', background:dp.bg }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:dp.c, fontFamily:FONT }}>{dp.label}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...tdSx, textAlign:'right', color:DL.red, fontWeight: 500 }}>{fmtCLP(r.monto)}</TableCell>
                  <TableCell sx={{ ...tdSx }}>
                    <Box sx={{ display:'inline-flex', px:'7px', py:'2px', borderRadius:'4px', background:riskBg(r.riesgo) }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:riskColor(r.riesgo), fontFamily:FONT }}>{r.riesgo}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
        </Box>
      </Box>
    </Card>
  );
}

// ─── ColBtn — lightweight column picker popover ───────────────────────────────
function ColBtn({ cols, onToggle }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const hiddenCount = cols.filter(c => !c.fixed && !c.vis).length;
  return (
    <>
      <Box onClick={e => setAnchor(e.currentTarget)}
        sx={{ display:'inline-flex', alignItems:'center', gap:'6px',
          border:`1px solid ${hiddenCount > 0 ? DL.blue : DL.border2}`,
          borderRadius:'7px', px:'9px', py:'5px',
          background: hiddenCount > 0 ? 'rgba(26,26,26,.06)' : '#fff',
          cursor:'pointer', whiteSpace:'nowrap', userSelect:'none', transition:'all .15s',
          '&:hover':{ background: hiddenCount > 0 ? 'rgba(26,26,26,.1)' : 'rgba(26,26,26,.04)', borderColor: DL.blue } }}>
        <ViewWeekOutlinedIcon sx={{ fontSize:14, color: hiddenCount > 0 ? DL.blue : DL.tS }} />
        <Typography sx={{ fontSize:11, fontFamily:FONT, fontWeight: 500, color: hiddenCount > 0 ? DL.blue : DL.tM }}>Columnas</Typography>
        {hiddenCount > 0 && (
          <Box sx={{ background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', borderRadius:'4px', fontSize:9, fontWeight: 500, px:'5px', py:'1px', lineHeight:1.4 }}>
            {hiddenCount}
          </Box>
        )}
      </Box>
      <Popover open={open} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical:'bottom', horizontal:'left' }}
        transformOrigin={{ vertical:'top', horizontal:'left' }}
        PaperProps={{ sx:{ p:'10px 12px', minWidth:170, borderRadius:'10px', boxShadow:'0 4px 20px rgba(0,0,0,.12)' } }}>
        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'.06em', mb:'6px', fontFamily:FONT }}>
          Columnas visibles
        </Typography>
        {cols.filter(c => !c.fixed).map(c => (
          <Box key={c.key} onClick={() => onToggle(c.key)}
            sx={{ display:'flex', alignItems:'center', gap:'8px', py:'4px', px:'4px', cursor:'pointer', borderRadius:'5px',
              '&:hover':{ background:'rgba(26,26,26,.05)' } }}>
            <Box sx={{ width:14, height:14, border:`1.5px solid ${c.vis ? DL.blue : DL.border2}`,
              borderRadius:'3px', background:c.vis ? DL.blue : 'transparent', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {c.vis && <Typography sx={{ fontSize:8, color:'#fff', fontWeight: 500, lineHeight:1 }}>✓</Typography>}
            </Box>
            <Typography sx={{ fontSize:11, fontFamily:FONT, color:DL.tH }}>{c.label}</Typography>
          </Box>
        ))}
      </Popover>
    </>
  );
}

// ─── FacturaModal ─────────────────────────────────────────────────────────────
function FacturaModal({ factura: r, onClose }) {
  if (!r) return null;
  const es = ESTADO_STYLE[r.estado] || { bg: DL.subtle, c: DL.tS };
  const mgColor  = r.mgPct >= 35 ? DL.green : r.mgPct >= 20 ? '#d97706' : DL.red;
  const mgBg     = r.mgPct >= 35 ? DL.greenBg : r.mgPct >= 20 ? 'rgba(217,119,6,.1)' : DL.redBg;

  const Field = ({ label, value, color, mono, large }) => (
    <Box sx={{ display:'flex', flexDirection:'column', gap:'3px' }}>
      <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: large ? 18 : 12, fontWeight: large ? 500 : 500,
        color: color || DL.tH, fontFamily:FONT,
        fontVariantNumeric: mono ? 'tabular-nums' : 'normal',
        letterSpacing: large ? '-0.02em' : 0,
      }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Box onClick={onClose} sx={{
      position:'fixed', inset:0, zIndex:1400,
      background:'rgba(15,23,42,.5)', backdropFilter:'blur(3px)',
      display:'flex', alignItems:'center', justifyContent:'center', px:'16px',
    }}>
      <Box onClick={e => e.stopPropagation()} sx={{
        background:'#fff', borderRadius:'14px',
        width:'100%', maxWidth:560,
        boxShadow: DL.e3,
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* ── Header ── */}
        <Box sx={{
          px:'24px', pt:'20px', pb:'16px',
          background: 'linear-gradient(135deg, rgba(26,26,26,.04) 0%, #fff 100%)',
          borderBottom:`1px solid ${DL.border}`,
          display:'flex', alignItems:'flex-start', justifyContent:'space-between',
        }}>
          <Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:'8px', mb:'4px' }}>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tS, fontFamily:FONT, letterSpacing:'0.04em' }}>
                N° FACTURA
              </Typography>
              <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'4px', background: es.bg }}>
                <Typography sx={{ fontSize:9, fontWeight: 500, color: es.c, fontFamily:FONT }}>{r.estado}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize:20, fontWeight: 500, color:DL.navy, fontFamily:FONT, letterSpacing:'-0.02em' }}>
              {r.folio}
            </Typography>
            <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, mt:'4px' }}>{r.cliente}</Typography>
          </Box>
          <Box component="button" onClick={onClose} sx={{
            display:'flex', alignItems:'center', justifyContent:'center',
            width:30, height:30, borderRadius:'8px',
            border:`1px solid ${DL.border}`, background:'#fff',
            cursor:'pointer', color:DL.tS, flexShrink:0,
            transition:'all .14s',
            '&:hover':{ background:DL.redBg, borderColor:DL.red, color:DL.red },
          }}>
            <CloseIcon sx={{ fontSize:15 }} />
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ p:'20px 24px', display:'flex', flexDirection:'column', gap:'16px' }}>

          {/* Dates + Conditions row */}
          <Box sx={{
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
            gap:'12px', p:'14px', borderRadius:'8px',
            background:'rgba(26,26,26,.03)', border:`1px solid ${DL.border}`,
          }}>
            <Field label="Fecha Emisión" value={r.fecha} />
            <Field label="Fecha Vencimiento" value={r.venc} color={r.diasV > 0 ? DL.red : DL.tH} />
            <Field label="Condición de Pago" value={r.condPago} />
          </Box>

          {/* Financial figures */}
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            {/* Left: Importes */}
            <Box sx={{ p:'14px', borderRadius:'8px', border:`1px solid ${DL.border}`, display:'flex', flexDirection:'column', gap:'12px' }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>
                Importes
              </Typography>
              <Field label="Cantidad (uds.)" value={r.cant} mono />
              <Field label="Total Venta" value={fmtCLP(r.venta)} color={DL.tH} mono large />
              <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <Field label="Costo" value={fmtCLP(r.costo)} color={DL.tM} mono />
                <Box>
                  <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT, mb:'3px' }}>
                    Margen
                  </Typography>
                  <Box sx={{ display:'inline-flex', px:'8px', py:'3px', borderRadius:'6px', background: mgBg, gap:'5px', alignItems:'center' }}>
                    <Typography sx={{ fontSize:12, fontWeight: 500, color: mgColor, fontFamily:FONT }}>{fmtCLP(r.mg)}</Typography>
                    <Typography sx={{ fontSize:9, fontWeight: 500, color: mgColor, fontFamily:FONT }}>({r.mgPct}%)</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right: Cobranza */}
            <Box sx={{ p:'14px', borderRadius:'8px', border:`1px solid ${DL.border}`, display:'flex', flexDirection:'column', gap:'12px' }}>
              <Typography sx={{ fontSize:9, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.07em', color:DL.tS, fontFamily:FONT }}>
                Cobranza
              </Typography>
              <Field label="Monto Abonado" value={r.abono > 0 ? fmtCLP(r.abono) : '—'} color={r.abono > 0 ? DL.green : DL.tS} mono />
              <Field label="Saldo Pendiente" value={r.pendiente > 0 ? fmtCLP(r.pendiente) : '—'} color={r.pendiente > 0 ? DL.red : DL.green} mono large />
              {r.diasV > 0 && (
                <Box sx={{ display:'inline-flex', alignItems:'center', gap:'6px', px:'10px', py:'6px', borderRadius:'8px', background:DL.redBg, border:`1px solid rgba(239,68,68,.2)` }}>
                  <Typography sx={{ fontSize:11, fontWeight: 500, color:'#b91c1c', fontFamily:FONT }}>{r.diasV} días</Typography>
                  <Typography sx={{ fontSize:9, color:DL.red, fontFamily:FONT }}>vencida</Typography>
                </Box>
              )}
              {r.diasV === 0 && r.estado !== 'Pagado' && (
                <Box sx={{ display:'inline-flex', alignItems:'center', gap:'6px', px:'10px', py:'6px', borderRadius:'8px', background:'rgba(84,126,105,.07)', border:`1px solid rgba(84,126,105,.2)` }}>
                  <Typography sx={{ fontSize:9, color:DL.blue, fontFamily:FONT }}>Al día / por vencer</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Footer ── */}
        <Box sx={{ px:'24px', py:'12px', borderTop:`1px solid ${DL.border}`, display:'flex', justifyContent:'flex-end' }}>
          <Box component="button" onClick={onClose} sx={{
            fontFamily:FONT, fontSize:11, fontWeight: 500,
            px:'18px', py:'8px', borderRadius:'8px',
            border:`1px solid ${DL.border2}`, background:'#fff', color:DL.tM,
            cursor:'pointer', transition:'all .14s',
            '&:hover':{ borderColor:DL.blue, color:DL.navy },
          }}>Cerrar</Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── DetalleFacturas ─────────────────────────────────────────────────────────
const TAB_FILTERS = {
  0: () => true,
  1: r => r.estado === 'Vencido',
  2: r => r.estado === 'Pendiente',
  3: r => r.estado === 'Pagado',
};
const ESTADO_STYLE = {
  'Vencido':   { bg: DL.redBg,                     c: DL.red,   },
  'Pendiente': { bg: 'rgba(234,179,8,.12)',          c: '#ca8a04' },
  'Pagado':    { bg: DL.greenBg,                    c: DL.green  },
};

const DET_COLS_INIT = [
  { key:'folio',     label:'N° Factura',  fixed:true,  vis:true },
  { key:'cliente',   label:'Cliente',     fixed:true,  vis:true },
  { key:'condPago',  label:'Cond. Pago',  fixed:false, vis:true },
  { key:'fecha',     label:'Fecha',       fixed:false, vis:true },
  { key:'venc',      label:'Venc.',       fixed:false, vis:true },
  { key:'cant',      label:'Cant.',       fixed:false, vis:true },
  { key:'venta',     label:'Venta $',     fixed:false, vis:true },
  { key:'mg',        label:'Mg. $',       fixed:false, vis:true },
  { key:'mgPct',     label:'Mgn%',        fixed:false, vis:false },
  { key:'abono',     label:'Abono',       fixed:false, vis:true },
  { key:'pendiente', label:'Pendiente',   fixed:true,  vis:true },
  { key:'diasV',     label:'Días V.',     fixed:false, vis:true },
  { key:'estado',    label:'Estado',      fixed:false, vis:true },
];

function DetalleFacturas({ docs = DOCUMENTOS }) {
  const [tab, setTab]   = useState(0);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('venc');
  const [sortDir, setSortDir] = useState('asc');
  const [detCols, setDetCols] = useState(DET_COLS_INIT);
  const toggleDetCol = key => setDetCols(cs => cs.map(c => c.key===key ? {...c, vis:!c.vis} : c));
  const [selectedFac, setSelectedFac] = useState(null);

  const rows = useMemo(() => {
    let r = docs.filter(TAB_FILTERS[tab]);
    if (search) r = r.filter(d =>
      d.cliente.toLowerCase().includes(search.toLowerCase()) ||
      d.folio.toLowerCase().includes(search.toLowerCase())
    );
    r = [...r].sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });
    return r;
  }, [docs, tab, search, sortCol, sortDir]);

  const SortTh = ({ col, children, align = 'left' }) => (
    <TableCell
      onClick={() => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } }}
      sx={{ ...thSx, textAlign: align, cursor: 'pointer', color: sortCol === col ? DL.blue : DL.tS, userSelect: 'none', '&:hover': { color: DL.blue } }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
        {children}
        {sortCol === col ? (sortDir === 'asc' ? <AscIcon sx={{ fontSize: 10 }} /> : <DescIcon sx={{ fontSize: 10 }} />) : <Box sx={{ fontSize: 9, opacity: .3 }}>↕</Box>}
      </Box>
    </TableCell>
  );

  const counts = {
    0: docs.length,
    1: docs.filter(r => r.estado === 'Vencido').length,
    2: docs.filter(r => r.estado === 'Pendiente').length,
    3: docs.filter(r => r.estado === 'Pagado').length,
  };

  return (
  <>
    <Card>
      {/* Header */}
      <Box sx={{ px: '14px', pt: '12px', pb: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FONT }}>Detalle de Facturas</Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <ColBtn cols={detCols} onToggle={toggleDetCol} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${DL.border2}`, borderRadius: '7px', px: '10px', py: '5px', background: '#fff', width: 200 }}>
            <SearchIcon sx={{ fontSize: 14, color: DL.tS }} />
            <Box component="input" placeholder="Buscar factura o cliente..." value={search} onChange={e => setSearch(e.target.value)}
              sx={{ fontFamily: FONT, fontSize: 11, color: DL.tH, border: 'none', outline: 'none', background: 'transparent', width: '100%', '&::placeholder': { color: DL.tS } }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ height:'1px', background:DL.border, mx:'14px' }} />

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
        px: '14px', minHeight: 36,
        '& .MuiTab-root': { fontFamily: FONT, fontSize: 10, fontWeight: 500, minHeight: 36, textTransform: 'none', letterSpacing: '.02em', color: DL.tS, px: '12px' },
        '& .Mui-selected': { color: DL.blue },
        '& .MuiTabs-indicator': { background: DL.blue, height: 2 },
      }}>
        {['Todas', 'Vencidas', 'Pendientes', 'Pagadas'].map((lbl, i) => (
          <Tab key={lbl} label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {lbl}
              <Box sx={{ background: i === 1 ? DL.redBg : i === 2 ? 'rgba(234,179,8,.12)' : i === 3 ? DL.greenBg : 'rgba(26,26,26,.07)', color: i === 1 ? DL.red : i === 2 ? '#ca8a04' : i === 3 ? DL.green : DL.blue, borderRadius: '4px', fontSize: 9, fontWeight: 500, px: '6px', py: '1px' }}>
                {counts[i]}
              </Box>
            </Box>
          } />
        ))}
      </Tabs>

      {/* Table */}
      <Box sx={{ px: '14px', pb: '14px' }}>
        <Box sx={{ border: `1px solid rgba(26,26,26,.1)`, borderRadius: '8px', overflow: 'clip' }}>
      <TableContainer sx={{ maxHeight: 380, overflowY: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {detCols.find(c=>c.key==='folio')?.vis && <SortTh col="folio">N° Factura</SortTh>}
              {detCols.find(c=>c.key==='cliente')?.vis && <SortTh col="cliente">Cliente</SortTh>}
              {detCols.find(c=>c.key==='condPago')?.vis && <TableCell sx={{ ...thSx }}>Cond. Pago</TableCell>}
              {detCols.find(c=>c.key==='fecha')?.vis && <SortTh col="fecha">Fecha</SortTh>}
              {detCols.find(c=>c.key==='venc')?.vis && <SortTh col="venc">Venc.</SortTh>}
              {detCols.find(c=>c.key==='cant')?.vis && <SortTh col="cant" align="right">Cant.</SortTh>}
              {detCols.find(c=>c.key==='venta')?.vis && <SortTh col="venta" align="right">Venta $</SortTh>}
              {detCols.find(c=>c.key==='mg')?.vis && <SortTh col="mg" align="right">Mg. $</SortTh>}
              {detCols.find(c=>c.key==='mgPct')?.vis && <SortTh col="mgPct" align="right">Mgn%</SortTh>}
              {detCols.find(c=>c.key==='abono')?.vis && <SortTh col="abono" align="right">Abono</SortTh>}
              {detCols.find(c=>c.key==='pendiente')?.vis && <SortTh col="pendiente" align="right">Pendiente</SortTh>}
              {detCols.find(c=>c.key==='diasV')?.vis && <SortTh col="diasV" align="right">Días V.</SortTh>}
              {detCols.find(c=>c.key==='estado')?.vis && <TableCell sx={{ ...thSx, textAlign: 'center' }}>Estado</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={detCols.filter(c=>c.vis).length} sx={{ ...tdSx, textAlign: 'center', py: '24px', color: DL.tS }}>Sin resultados</TableCell>
              </TableRow>
            ) : rows.map(r => {
              const es = ESTADO_STYLE[r.estado] || { bg: DL.subtle, c: DL.tS };
              const cv = key => detCols.find(c=>c.key===key)?.vis;
              return (
                <TableRow
                  key={r.id}
                  onClick={() => setSelectedFac(r)}
                  sx={{ cursor:'pointer', '&:hover td': { background: 'rgba(84,126,105,.05)' } }}
                >
                  {cv('folio') && <TableCell sx={{ ...tdSx, color: DL.blue, fontWeight: 500, whiteSpace: 'nowrap' }}>{r.folio}</TableCell>}
                  {cv('cliente') && <TableCell sx={{ ...tdSx, maxWidth: 160 }}>
                    <Typography sx={{ fontSize: 11, fontFamily: FONT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: DL.tH }}>{r.cliente}</Typography>
                  </TableCell>}
                  {cv('condPago') && <TableCell sx={{ ...tdSx, color: DL.tM, whiteSpace: 'nowrap' }}>{r.condPago}</TableCell>}
                  {cv('fecha') && <TableCell sx={{ ...tdSx, color: DL.tM, whiteSpace: 'nowrap' }}>{r.fecha}</TableCell>}
                  {cv('venc') && <TableCell sx={{ ...tdSx, color: DL.tM, whiteSpace: 'nowrap' }}>{r.venc}</TableCell>}
                  {cv('cant') && <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tM }}>{r.cant}</TableCell>}
                  {cv('venta') && <TableCell sx={{ ...tdSx, textAlign: 'right', fontWeight: 500, color: DL.tH }}>{fmtCLP(r.venta)}</TableCell>}
                  {cv('mg') && <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.green, fontWeight: 500 }}>{fmtCLP(r.mg)}</TableCell>}
                  {cv('mgPct') && <TableCell sx={{ ...tdSx, textAlign: 'right', color: DL.tM }}>{r.mgPct}%</TableCell>}
                  {cv('abono') && <TableCell sx={{ ...tdSx, textAlign: 'right', color: r.abono > 0 ? DL.green : DL.tS }}>{r.abono > 0 ? fmtCLP(r.abono) : '—'}</TableCell>}
                  {cv('pendiente') && <TableCell sx={{ ...tdSx, textAlign: 'right', fontWeight: 500, color: r.pendiente > 0 ? DL.red : DL.tS }}>{r.pendiente > 0 ? fmtCLP(r.pendiente) : '—'}</TableCell>}
                  {cv('diasV') && <TableCell sx={{ ...tdSx, textAlign: 'right', color: r.diasV > 0 ? DL.red : DL.tS, fontWeight: r.diasV > 0 ? 500 : 400 }}>{r.diasV > 0 ? `${r.diasV}d` : '—'}</TableCell>}
                  {cv('estado') && <TableCell sx={{ ...tdSx, textAlign: 'center' }}>
                    <Box sx={{ display: 'inline-flex', px: '7px', py: '2px', borderRadius: '4px', background: es.bg }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: es.c, fontFamily: FONT }}>{r.estado}</Typography>
                    </Box>
                  </TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
        </Box>
      </Box>
    </Card>
    {selectedFac && <FacturaModal factura={selectedFac} onClose={() => setSelectedFac(null)} />}
  </>
  );
}

// ─── AlertsPanel ─────────────────────────────────────────────────────────────
function AlertsPanel() {
  const alerts = ALERTAS.map(a => ({
    tier: a.tipo,
    msg: a.titulo + (a.msg ? ' — ' + a.msg : ''),
  }));
  return <AlertasSistema alerts={alerts} title="Alertas CxC" />;
}

// ─── Excel export ────────────────────────────────────────────────────────────
function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // ── Helper: auto-fit column widths ──
  const autoWidth = ws => {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const widths = [];
    for (let C = range.s.c; C <= range.e.c; C++) {
      let max = 10;
      for (let R = range.s.r; R <= range.e.r; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v != null) {
          const len = String(cell.v).length;
          if (len > max) max = len;
        }
      }
      widths.push({ wch: Math.min(max + 2, 40) });
    }
    ws['!cols'] = widths;
  };

  const fmt = n => (n == null ? '' : Number(n).toLocaleString('es-CL'));

  // ── Sheet 1: Resumen KPIs ──
  const kpis = [
    ['KPI', 'Valor', 'Meta', 'vs Meta'],
    ['DSO · Days Sales Outstanding', '42 días', '≤ 30 días', '+12d vs meta'],
    ['CEI · Efectividad de Cobranza', '68.0%', '≥ 85%', '-17pp vs meta'],
    ['Total CxC', '$4.78B', '$4.28B', '+$0.50B'],
    ['% Cartera Vencida', '75.0%', '< 25%', '+50pp vs meta'],
    ['Bad Debt Ratio', '2.3%', '< 2.0%', '+0.3pp vs meta'],
    ['Rotación CxC', '8.6x', '≥ 12x / año', '-3.4x vs meta'],
  ];
  const wsKpis = XLSX.utils.aoa_to_sheet(kpis);
  autoWidth(wsKpis);
  XLSX.utils.book_append_sheet(wb, wsKpis, 'Resumen KPIs');

  // ── Sheet 2: Cartera de Clientes ──
  const cliHeader = [['Cliente', 'Total CxC', 'Vencido', 'No Vencido', '% Vencido', 'Riesgo', '# Facturas']];
  const cliRows = CLIENTES_TABLE.map(r => [
    r.nombre,
    r.total,
    r.vencido,
    r.noVencido,
    r.total > 0 ? +((r.vencido / r.total) * 100).toFixed(1) : 0,
    r.riesgo,
    r.facturas,
  ]);
  const wsCli = XLSX.utils.aoa_to_sheet([...cliHeader, ...cliRows]);
  autoWidth(wsCli);
  XLSX.utils.book_append_sheet(wb, wsCli, 'Cartera de Clientes');

  // ── Sheet 3: Detalle de Facturas ──
  const facHeader = [['N° Factura', 'Cliente', 'Cond. Pago', 'Fecha', 'Vencimiento', 'Cant.', 'Venta $', 'Mg. $', 'Mgn %', 'Abono', 'Pendiente', 'Días Vencido', 'Estado']];
  const facRows = DOCUMENTOS.map(r => [
    r.folio, r.cliente, r.condPago, r.fecha, r.venc,
    r.cant, r.venta, r.mg, r.mgPct, r.abono, r.pendiente, r.diasV, r.estado,
  ]);
  const wsFac = XLSX.utils.aoa_to_sheet([...facHeader, ...facRows]);
  autoWidth(wsFac);
  XLSX.utils.book_append_sheet(wb, wsFac, 'Detalle Facturas');

  // ── Sheet 4: CxC por Tramo ──
  const agingHeader = [['Tramo', 'Vencido — Monto', 'Vencido — # Fact.', 'No Vencido — Monto', 'No Vencido — # Fact.']];
  const agingRows = AGING_BUCKETS.map(r => [r.tramo, r.vencMonto, r.vencFact, r.noVencMonto, r.noVencFact]);
  const wsAging = XLSX.utils.aoa_to_sheet([...agingHeader, ...agingRows]);
  autoWidth(wsAging);
  XLSX.utils.book_append_sheet(wb, wsAging, 'CxC por Tramo');

  // ── Sheet 5: Métricas por Vendedor ──
  const vendHeader = [['Vendedor', 'Clientes', 'CxC Total', 'Cartera Vencida', '% Vencido', 'DSO (días)', 'CEI %', 'Bad Debt %']];
  const vendRows = VENDEDOR_METRICAS.map(v => {
    const pct = v.cxcTotal > 0 ? +((v.vencido / v.cxcTotal) * 100).toFixed(1) : 0;
    return [v.nombre, v.clientes, v.cxcTotal, v.vencido, pct, v.dso, v.cei, v.badDebt];
  });
  const wsVend = XLSX.utils.aoa_to_sheet([...vendHeader, ...vendRows]);
  autoWidth(wsVend);
  XLSX.utils.book_append_sheet(wb, wsVend, 'Métricas Vendedores');

  // ── Sheet 6: Clientes en Riesgo ──
  const riesgoHeader = [['Cliente', 'Folio', 'Vencimiento', 'Días Restantes', 'Monto', 'Riesgo']];
  const riesgoRows = RIESGO_ROWS.map(r => [r.cliente, r.folio, r.vencimiento, r.diasRestantes, r.monto, r.riesgo]);
  const wsRiesgo = XLSX.utils.aoa_to_sheet([...riesgoHeader, ...riesgoRows]);
  autoWidth(wsRiesgo);
  XLSX.utils.book_append_sheet(wb, wsRiesgo, 'Clientes en Riesgo');

  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  XLSX.writeFile(wb, `CuentasPorCobrar_${stamp}.xlsx`);
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function CuentasCobrar() {
  const [, forceRefresh] = useState(0);
  const handleRefresh = useCallback(() => forceRefresh(n => n + 1), []);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteFilter, setClienteFilter]   = useState('Todos');
  const [vendedorFilter, setVendedorFilter] = useState('Todos');
  const [periodoFilter, setPeriodoFilter]   = useState('90d');

  const docsInPeriod = useMemo(() => {
    const pDef = PERIODOS.find(p => p.value === periodoFilter);
    if (!pDef?.days) return DOCUMENTOS;
    const cutoff = new Date(TODAY_CXC.getTime() - pDef.days * 86400000);
    return DOCUMENTOS.filter(d => parseDocDate(d.fecha) >= cutoff);
  }, [periodoFilter]);

  const clientesFiltered = useMemo(() => {
    if (periodoFilter === 'todos') return CLIENTES_TABLE;
    const map = {};
    docsInPeriod.forEach(d => {
      if (!map[d.cliente]) map[d.cliente] = { total:0, vencido:0, noVencido:0, facturas:0 };
      map[d.cliente].total    += d.venta;
      map[d.cliente].vencido  += (d.diasV > 0 ? d.pendiente : 0);
      map[d.cliente].noVencido += (d.diasV === 0 && d.pendiente > 0 ? d.pendiente : 0);
      map[d.cliente].facturas += 1;
    });
    return Object.entries(map).map(([nombre, vals]) => {
      const orig = CLIENTES_TABLE.find(c => c.nombre === nombre) || {};
      return { id: orig.id || nombre, nombre, riesgo: orig.riesgo || 'BAJO', rotacion: orig.rotacion ?? 8.0, ...vals };
    });
  }, [docsInPeriod, periodoFilter]);

  const kd = PERIODO_DATA[periodoFilter] || PERIODO_DATA.todos;

  return (
    <Box>
      <PageHeader title="Cuentas por Cobrar" live onRefresh={handleRefresh} onExport={exportToExcel}>
        <MiniSelect label="Período" value={periodoFilter} onChange={setPeriodoFilter}
          options={PERIODOS.map(p => ({ value: p.value, label: p.label }))}
        />
        <MiniSelect label="Cliente" value={clienteFilter} onChange={setClienteFilter}
          options={['Todos', ...CLIENTES_TABLE.map(c => c.nombre)].map(o => ({ value: o, label: o }))}
        />
        <MiniSelect label="Vendedor" value={vendedorFilter} onChange={setVendedorFilter}
          options={VENDEDORES.map(o => ({ value: o, label: o }))}
        />
      </PageHeader>
      <Box sx={{ p:{ xs:'10px', md:'16px' }, display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ── KPIs ── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px' }}>
          <KpiCard
            lbl="DSO — Días de Cobro"
            val={`${kd.dso} días`}
            pct={kd.dsoPct}
            meta="≤ 30 días" metaLbl="Meta"
            diff={kd.dsoDiff} diffUp={false}
            diff2={`+${(100-kd.dsoPct).toFixed(0)}% vs meta`} diff2Up={false}
            valHighlight barSplit={kd.dsoBarSplit}
            yoyPrev={kd.dsoYoyPrev} yoyDelta={kd.dsoYoyDelta} yoyUp={kd.dsoYoyUp}
          />
          <KpiCard
            lbl="CEI · Efectividad de Cobranza"
            val={kd.cei} pct={kd.ceiPct}
            meta="≥ 85%" metaLbl="Meta"
            diff={kd.ceiDiff} diffUp={false}
            yoyPrev={kd.ceiYoyPrev} yoyDelta={kd.ceiYoyDelta} yoyUp={kd.ceiYoyUp}
          />
          <KpiCard
            lbl="Total CxC"
            val={kd.cxc} pct={kd.cxcPct}
            meta={kd.cxcMeta} metaLbl="Mes Anterior"
            diff={kd.cxcDiff} diffUp={kd.cxcDiffUp}
            yoyPrev={kd.cxcYoyPrev} yoyDelta={kd.cxcYoyDelta} yoyUp={kd.cxcYoyUp}
          />
          <KpiCard
            lbl="% Cartera Vencida"
            val={kd.pctVenc} pct={kd.pvPct}
            meta="< 25%" metaLbl="Meta"
            diff={kd.pvDiff} diffUp={false}
            yoyPrev={kd.pvYoyPrev} yoyDelta={kd.pvYoyDelta} yoyUp={kd.pvYoyUp}
          />
          <KpiCard
            lbl="Bad Debt Ratio"
            val={kd.bd} pct={kd.bdPct}
            meta="< 2.0%" metaLbl="Meta"
            diff={kd.bdDiff} diffUp={kd.bdDiff.includes('✓') || kd.bdYoyUp}
            yoyPrev={kd.bdYoyPrev} yoyDelta={kd.bdYoyDelta} yoyUp={kd.bdYoyUp}
          />
          <KpiCard
            lbl="Rotación CxC"
            val={kd.rot} pct={kd.rotPct}
            meta="≥ 12x / año" metaLbl="Meta"
            diff={kd.rotDiff} diffUp={false}
            yoyPrev={kd.rotYoyPrev} yoyDelta={kd.rotYoyDelta} yoyUp={kd.rotYoyUp}
          />
        </Box>

        {/* ── Historical chart + Alerts side-by-side ── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:'16px', alignItems:'stretch' }}>
          <Card sx={{ p:'14px 16px 8px' }}>
            <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT, mb:'12px' }}>
              Saldo por Tramo de Vencimiento — Histórico
            </Typography>
            <HistoricalChart />
          </Card>
          <AlertsPanel />
        </Box>

        {/* ── Cartera de clientes / En Riesgo + Aging buckets — misma altura ── */}
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 340px 280px', gap:'16px', alignItems:'stretch' }}>
          <CarteraClientesTabs onSelect={setSelectedCliente} clientes={clientesFiltered} />
          <AgingBucketsTable />
          <TopClientesVencidos clientes={clientesFiltered} />
        </Box>

        {/* ── Invoice detail ── */}
        <DetalleFacturas docs={docsInPeriod} />

      </Box>

      {/* ── Client drawer ── */}
      {selectedCliente && (
        <Box onClick={()=>setSelectedCliente(null)} sx={{ position:'fixed', inset:0, background:'rgba(0,0,70,.18)', zIndex:200 }}>
          <Box onClick={e=>e.stopPropagation()} sx={{
            position:'fixed', top:0, right:0, bottom:0, width:360, background:'#fff',
            boxShadow:'0 0 40px rgba(0,0,0,.2)', zIndex:201, p:'20px', overflowY:'auto',
            display:'flex', flexDirection:'column', gap:'12px',
          }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <Box>
                <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT, lineHeight:1.3 }}>{selectedCliente.nombre}</Typography>
                <Box sx={{ display:'inline-flex', mt:'4px', px:'7px', py:'2px', borderRadius:'4px', background:riskBg(selectedCliente.riesgo) }}>
                  <Typography sx={{ fontSize:9, fontWeight: 500, color:riskColor(selectedCliente.riesgo), fontFamily:FONT }}>Riesgo {selectedCliente.riesgo}</Typography>
                </Box>
              </Box>
              <Box component="button" onClick={()=>setSelectedCliente(null)} sx={{ fontSize:18, color:DL.tS, background:'none', border:'none', cursor:'pointer', fontFamily:FONT, '&:hover':{ color:DL.red } }}>×</Box>
            </Box>
            {[
              { label:'Total CxC',  val:fmtCLP(selectedCliente.total),    color:DL.tH    },
              { label:'Vencido',    val:fmtCLP(selectedCliente.vencido),   color:DL.red   },
              { label:'No Vencido', val:fmtCLP(selectedCliente.noVencido), color:DL.green },
              { label:'Facturas',   val:selectedCliente.facturas,          color:DL.blue  },
            ].map(k => (
              <Box key={k.label} sx={{ background:DL.subtle, borderRadius:'8px', p:'10px 12px' }}>
                <Typography sx={{ fontSize:8, fontWeight: 500, textTransform:'uppercase', letterSpacing:'.07em', color:DL.tS, fontFamily:FONT }}>{k.label}</Typography>
                <Typography sx={{ fontSize:18, fontWeight: 500, color:k.color, fontFamily:FONT, mt:'2px' }}>{k.val}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
