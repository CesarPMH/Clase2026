export const KPI_DATA = [
  { lbl: 'Ventas Totales',   val: '$1.56M', meta: '$1.50M', metaLbl: 'Presupuesto', pct: 104.1, diff: '+$64K',   yoyPrev: '$1.39M', yoyDelta: '+12.3%', yoyUp: true,  accent: '#16a34a', icon: '✓', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { lbl: 'Margen Bruto',     val: '18.1%',  meta: '25.0%',  metaLbl: 'Umbral Mín.', pct: 72.4,  diff: '−6.9pp',  yoyPrev: '21.4%',  yoyDelta: '−3.3pp', yoyUp: false, accent: '#dc2626', icon: '!', iconBg: '#fee2e2', iconColor: '#dc2626' },
  { lbl: 'Ticket Promedio',  val: '$349',   meta: '$374',   metaLbl: 'Meta',         pct: 93.3,  diff: '−$25',    yoyPrev: '$314',   yoyDelta: '+11.2%', yoyUp: true,  accent: '#d97706', icon: '△', iconBg: '#fef3c7', iconColor: '#d97706' },
  { lbl: 'Clientes Totales', val: '127',    meta: '120',    metaLbl: 'Meta',         pct: 105.8, diff: '+7',      yoyPrev: '109',    yoyDelta: '+16.5%', yoyUp: true,  accent: '#16a34a', icon: '✓', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { lbl: 'Facturas',         val: '43',     meta: '40',     metaLbl: 'Meta',         pct: 107.5, diff: '538 uds', yoyPrev: '34',     yoyDelta: '+26.5%', yoyUp: true,  accent: '#16a34a', icon: '✓', iconBg: '#dcfce7', iconColor: '#16a34a' },
  { lbl: 'Clientes Nuevos',  val: '8',      meta: '10',     metaLbl: 'Meta',         pct: 80,    diff: '−2',      yoyPrev: '5',      yoyDelta: '+60%',   yoyUp: true,  accent: '#547e69', icon: '↑', iconBg: '#e8e8e8', iconColor: '#1a1a1a' },
  { lbl: 'Abandonados',      val: '6',      meta: '5',      metaLbl: 'Umbral Máx.',  pct: 120,   diff: '+1',      yoyPrev: '9',      yoyDelta: '−33%',   yoyUp: true,  accent: '#d97706', icon: '⚠', iconBg: '#fef3c7', iconColor: '#d97706' },
];

export const HIST_DATA = {
  general: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      datasets: [
        { label: '2024', data: [980,1020,1150,1090,1230,1310,1290,1420,1380,1460,1510,1580], color: 'rgba(26,26,26,.22)' },
        { label: '2025', data: [1050,1120,1280,1210,1360,1420,1560,null,null,null,null,null], color: '#547e69' },
      ],
      budget: [1000,1080,1200,1180,1300,1380,1500,1560,1600,1680,1740,1800],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      datasets: [
        { label: '2024', data: [3150,3630,4090,4550], color: 'rgba(26,26,26,.22)' },
        { label: '2025', data: [3590,3990,null,null],  color: '#547e69' },
      ],
      budget: [3260,3860,4360,4720],
    },
  },
  categoria: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      datasets: [
        { label: 'Agrícola',    data: [406,432,494,468,526,549,602,null,null,null,null,null], color: '#547e69' },
        { label: 'Veterinario', data: [315,336,384,363,408,426,468,null,null,null,null,null], color: '#1a1a1a' },
        { label: 'Semillas',    data: [210,224,256,242,272,284,312,null,null,null,null,null], color: '#8fb0a0' },
        { label: 'Otros',       data: [119,128,144,137,154,161,176,null,null,null,null,null], color: 'rgba(26,26,26,.3)' },
      ],
      budget: null, stacked: true,
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      datasets: [
        { label: 'Agrícola',    data: [1332,1543,null,null], color: '#547e69' },
        { label: 'Veterinario', data: [1035,1197,null,null], color: '#1a1a1a' },
        { label: 'Semillas',    data: [690, 798, null,null], color: '#8fb0a0' },
        { label: 'Otros',       data: [391, 452, null,null], color: 'rgba(26,26,26,.3)' },
      ],
      budget: null, stacked: true,
    },
  },
};

export const VPOR_DATA = {
  producto: [
    { name: 'AGROVIT PLUS 1L',  v: 284, prev: 261, part: 18.2, mg: 24.3,  delta: '+8.7%' },
    { name: 'PILAROUND 500ML',  v: 199, prev: 187, part: 12.7, mg: -0.7,  delta: '+6.0%' },
    { name: 'VETMEC COMBO',     v: 157, prev: 134, part: 10.0, mg: 31.4,  delta: '+17.2%' },
    { name: 'NUTRISEM PRO',     v: 143, prev: 129, part: 9.2,  mg: 28.7,  delta: '+11.1%' },
    { name: 'BIOMAX TABS',      v: 119, prev: 102, part: 7.6,  mg: 22.3,  delta: '+16.7%' },
    { name: 'CALCIVIT INY',     v: 84,  prev: 76,  part: 5.4,  mg: 33.1,  delta: '+10.4%' },
    { name: 'SEMVERDE 25KG',    v: 72,  prev: 66,  part: 4.6,  mg: 26.4,  delta: '+9.9%' },
    { name: 'AGROFER 5KG',      v: 97,  prev: 89,  part: 6.2,  mg: 19.8,  delta: '+9.0%' },
    { name: 'HERBICIDA X20',    v: 63,  prev: 71,  part: 4.0,  mg: 15.2,  delta: '-11.3%' },
    { name: 'OTROS',            v: 347, prev: 318, part: 22.2, mg: 20.1,  delta: '+9.1%' },
  ],
  categoria: [
    { name: 'Agrícola',     v: 612, prev: 558, part: 39.2, mg: 22.4, delta: '+9.7%' },
    { name: 'Veterinario',  v: 498, prev: 431, part: 31.9, mg: 28.7, delta: '+15.5%' },
    { name: 'Semillas',     v: 288, prev: 262, part: 18.4, mg: 24.1, delta: '+9.9%' },
    { name: 'Esp. Menores', v: 162, prev: 148, part: 10.4, mg: 31.2, delta: '+9.5%' },
  ],
  canal: [
    { name: 'Tienda Central', v: 682, prev: 611, part: 43.7, mg: 21.3, delta: '+11.6%' },
    { name: 'Sucursal No.1',  v: 498, prev: 452, part: 31.9, mg: 24.8, delta: '+10.2%' },
    { name: 'Sucursal No.2',  v: 215, prev: 198, part: 13.7, mg: 27.1, delta: '+8.6%' },
    { name: 'E-Commerce',     v: 166, prev: 200, part: 10.6, mg: 18.4, delta: '-17.0%' },
  ],
  vendedor: [
    { name: 'David Guerra',       v: 498, prev: 441, part: 31.9, mg: 23.1, delta: '+12.9%' },
    { name: 'Robinson Zamora',    v: 412, prev: 379, part: 26.4, mg: 25.7, delta: '+8.7%' },
    { name: 'Estuardo Quiñonez',  v: 389, prev: 401, part: 24.9, mg: 20.4, delta: '-3.0%' },
    { name: 'Tienda Directa',     v: 261, prev: 219, part: 16.7, mg: 19.8, delta: '+19.2%' },
  ],
  region: [
    { name: 'Ciudad de Guatemala', v: 742, prev: 681, part: 47.5, mg: 22.8, delta: '+9.0%' },
    { name: 'Escuintla',           v: 312, prev: 284, part: 20.0, mg: 26.3, delta: '+9.9%' },
    { name: 'Quetzaltenango',      v: 199, prev: 179, part: 12.7, mg: 24.1, delta: '+11.2%' },
    { name: 'Chiquimula',          v: 163, prev: 148, part: 10.4, mg: 28.4, delta: '+10.1%' },
    { name: 'Petén',               v: 144, prev: 137, part: 9.2,  mg: 21.7, delta: '+5.1%' },
  ],
  cliente: [
    { name: 'Bom Bom Agro S.A.',       v: 189, prev: 163, part: 12.1, mg: 24.3, delta: '+16.0%' },
    { name: 'AgroVerde Ltda.',          v: 157, prev: 143, part: 10.0, mg: 27.8, delta: '+9.8%' },
    { name: 'Veterinaria El Campo',     v: 134, prev: 129, part: 8.6,  mg: 31.2, delta: '+3.9%' },
    { name: 'Semillas del Sur',         v: 112, prev: 119, part: 7.2,  mg: 18.9, delta: '-5.9%' },
    { name: 'Campo Fertil',             v: 98,  prev: 87,  part: 6.3,  mg: 25.4, delta: '+12.6%' },
    { name: 'Agro Norte',               v: 78,  prev: 71,  part: 5.0,  mg: 20.1, delta: '+9.9%' },
    { name: 'La Granja S.A.',           v: 91,  prev: 84,  part: 5.8,  mg: 30.2, delta: '+8.3%' },
    { name: 'VetSur Clínica',           v: 64,  prev: 59,  part: 4.1,  mg: 33.4, delta: '+8.5%' },
    { name: 'Otros (118 clientes)',     v: 637, prev: 591, part: 40.8, mg: 20.8, delta: '+7.8%' },
  ],
};

export const ALERTS = [
  { type: 'r', title: 'Margen Crítico',    msg: 'Margen bruto 18.1% — 6.9pp por debajo del umbral mínimo de 25%. Revisar costos de PILAROUND y HERBICIDA X20.' },
  { type: 'y', title: 'E-Commerce Caída',  msg: 'Canal digital cayó 17% vs. período anterior ($166K vs. $200K). Evaluar campaña de recuperación.' },
  { type: 'y', title: 'Clientes Nuevos',   msg: '8 de 10 clientes nuevos meta (80%). Quedan 2 por alcanzar en lo que resta del mes.' },
  { type: 'g', title: 'Meta de Ventas',    msg: 'Ventas en $1.56M, +4.1% sobre presupuesto de $1.50M. Buen ritmo de cierre de mes.' },
  { type: 'g', title: 'Cartera en Crecimiento', msg: '127 clientes activos, +16.5% YoY. Tasa de retención superior al 93%.' },
];

export const DET_DATA = [
  { fac: 'FAC-8821', cli: 'Bom Bom Agro S.A.',     nofac: '001-22041', fecha: '12/07/2025', vence: '12/08/2025', qty: 18, v: 189, nc: 0,   costo: 143, mg: 24.3, abono: 189, pend: 0 },
  { fac: 'FAC-8819', cli: 'AgroVerde Ltda.',         nofac: '001-22039', fecha: '11/07/2025', vence: '10/08/2025', qty: 12, v: 157, nc: 0,   costo: 113, mg: 27.8, abono: 100, pend: 57 },
  { fac: 'FAC-8815', cli: 'Veterinaria El Campo',    nofac: '001-22035', fecha: '10/07/2025', vence: '09/08/2025', qty: 9,  v: 134, nc: 5,   costo: 92,  mg: 31.2, abono: 134, pend: 0 },
  { fac: 'FAC-8812', cli: 'Semillas del Sur',        nofac: '001-22032', fecha: '09/07/2025', vence: '08/08/2025', qty: 14, v: 112, nc: 0,   costo: 91,  mg: 18.9, abono: 50,  pend: 62 },
  { fac: 'FAC-8808', cli: 'Campo Fertil',            nofac: '001-22028', fecha: '08/07/2025', vence: '07/08/2025', qty: 7,  v: 98,  nc: 0,   costo: 73,  mg: 25.4, abono: 98,  pend: 0 },
  { fac: 'FAC-8803', cli: 'Agro Norte',              nofac: '001-22023', fecha: '07/07/2025', vence: '06/08/2025', qty: 6,  v: 78,  nc: 0,   costo: 62,  mg: 20.1, abono: 78,  pend: 0 },
  { fac: 'FAC-8801', cli: 'La Granja S.A.',          nofac: '001-22021', fecha: '06/07/2025', vence: '05/08/2025', qty: 8,  v: 91,  nc: 0,   costo: 64,  mg: 30.2, abono: 50,  pend: 41 },
  { fac: 'FAC-8798', cli: 'VetSur Clínica',          nofac: '001-22018', fecha: '05/07/2025', vence: '04/08/2025', qty: 5,  v: 64,  nc: 0,   costo: 43,  mg: 33.4, abono: 64,  pend: 0 },
  { fac: 'FAC-8795', cli: 'Bom Bom Agro S.A.',       nofac: '001-22015', fecha: '04/07/2025', vence: '03/08/2025', qty: 22, v: 210, nc: 10,  costo: 159, mg: 24.3, abono: 200, pend: 10 },
  { fac: 'FAC-8790', cli: 'AgroVerde Ltda.',          nofac: '001-22010', fecha: '03/07/2025', vence: '02/08/2025', qty: 11, v: 143, nc: 0,   costo: 103, mg: 27.8, abono: 143, pend: 0 },
];
