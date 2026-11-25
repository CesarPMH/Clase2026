// ─── Financiero Data ──────────────────────────────────────────────────────────
// Static mock data for the Dashboard Financiero page.

export const FIN_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export const FIN_KPIS = {
  ventas:       { val:749740.82, ant:467593.22, meta:700000 },
  costoVentas:  { val:250089.90, ant:276394.95, meta:260000 },
  utilBruta:    { val:499650.92, ant:191198.27, meta:440000, pctVal:66.6, pctAnt:40.9 },
  gastosOp:     { val:73251.54,  ant:102127.69, meta:85000  },
  ebit:         { val:426399.38, ant:89070.58,  meta:355000, pctVal:56.9, pctAnt:19.0 },
  ebitda:       { val:451399.38, ant:112070.58, meta:380000, pctVal:60.2, pctAnt:24.0 },
  utilNeta:     { val:425966.58, ant:86867.34,  meta:340000, pctVal:56.8, pctAnt:18.6 },
};

export const FIN_TREND = {
  ventas:   [430838.99, 315498.48, 841382.21, 749740.82, 0,0,0,0,0,0,0,0],
  costos:   [240533.23, 201242.67, 446295.75, 250089.90, 0,0,0,0,0,0,0,0],
  gastos:   [114883.83, 111806.10, 121744.19, 73251.54,  0,0,0,0,0,0,0,0],
  ebit:     [75421.93,  2449.71,   273342.27, 426399.38, 0,0,0,0,0,0,0,0],
  ebitda:   [100421.93, 27449.71,  298342.27, 451399.38, 0,0,0,0,0,0,0,0],
};

export const ESTADO_ROWS = [
  { id:'ventas',   label:'Ventas',               values:[430838.99,315498.48,841382.21,749740.82], bold:false },
  { id:'costo',    label:'(-) Costo De Ventas',   values:[240533.23,201242.67,446295.75,250089.90], bold:false, negative:true },
  { id:'utilB',    label:'Utilidad Bruta',         values:[190305.76,114255.81,395086.46,499650.92], bold:true, subtotal:true },
  { id:'gastOp',   label:'(-) Gastos Operativos', values:[114883.83,111806.10,121744.19,73251.54],  bold:false, negative:true, expandable:true, children:[
    { id:'gastVen', label:'Gastos De Ventas',           values:[92888.81, 86445.63,89511.56,66329.18], negative:true },
    { id:'gastAdm', label:'Gasto De Administración',    values:[21995.02, 25360.47,32232.63,6922.36],  negative:true },
  ]},
  { id:'ebit',     label:'Utilidad Operativa',     values:[75421.93,2449.71,273342.27,426399.38],   bold:true, subtotal:true },
  { id:'gastFin',  label:'(-) Gastos Financieros', values:[14031.72,18134.90,12245.35,551.31],       negative:true },
  { id:'otrosIng', label:'(+) Otros Ingresos',     values:[15165.57,11439.07,16193.99,118.51],       expandable:true, children:[
    { id:'ingFin',  label:'Ingresos Financieros',       values:[12248.78,11322.16,16129.07,0] },
    { id:'ingNFin', label:'Ingresos No Financieros',    values:[0,0,0,0] },
    { id:'ingOtr',  label:'Otros Ingresos',             values:[2916.79,116.91,64.92,118.51] },
  ]},
  { id:'utilAnt',  label:'Utilidad Antes De Impuesto', values:[76555.78,-4246.12,277290.91,425966.58], bold:true, subtotal:true },
];

export const RENDIMIENTO = {
  vendedor: [
    { name:'CR - Gerardo Daura', ventas:144246, costos:77663,  util:66582, vPct:20.2, uPct:20.0 },
    { name:'HN - Gerardo Daura', ventas:126218, costos:65354,  util:60864, vPct:17.7, uPct:18.3 },
    { name:'PN - Gerardo Daura', ventas:109022, costos:48114,  util:60907, vPct:15.3, uPct:18.3 },
    { name:'Lilian Portillo',    ventas:60274,  costos:38416,  util:21857, vPct:8.5,  uPct:6.6  },
    { name:'GT - Gerardo Daura', ventas:58860,  costos:32150,  util:26709, vPct:8.3,  uPct:8.0  },
    { name:'GT - Jorge Estrada', ventas:45005,  costos:18637,  util:26367, vPct:6.3,  uPct:7.9  },
    { name:'Enzo Diaz',         ventas:39890,  costos:24850,  util:15040, vPct:5.6,  uPct:4.5  },
    { name:'Ana Herrera',        ventas:34057,  costos:18272,  util:15784, vPct:4.8,  uPct:4.7  },
    { name:'Hazel Del Cid',      ventas:22119,  costos:10925,  util:11194, vPct:3.1,  uPct:3.4  },
    { name:'Denis Bolanos',      ventas:16114,  costos:6690,   util:9423,  vPct:2.3,  uPct:2.8  },
  ],
  categoria: [
    { name:'Agrícola',     ventas:284000, costos:215000, util:69000, vPct:39.2, uPct:40.1 },
    { name:'Veterinario',  ventas:224000, costos:160000, util:64000, vPct:30.9, uPct:37.2 },
    { name:'Semillas',     ventas:143000, costos:104000, util:39000, vPct:19.7, uPct:22.7 },
    { name:'Esp. Menores', ventas:72000,  costos:49000,  util:23000, vPct:9.9,  uPct:13.4 },
  ],
  producto: [
    { name:'AGROVIT PLUS 1L',  ventas:284000, costos:215000, util:69000, vPct:18.2, uPct:20.1 },
    { name:'PILAROUND 500ML',  ventas:199000, costos:163000, util:36000, vPct:12.7, uPct:10.5 },
    { name:'VETMEC COMBO',     ventas:157000, costos:108000, util:49000, vPct:10.0, uPct:14.3 },
    { name:'NUTRISEM PRO',     ventas:143000, costos:102000, util:41000, vPct:9.2,  uPct:11.9 },
    { name:'BIOMAX TABS',      ventas:119000, costos:92000,  util:27000, vPct:7.6,  uPct:7.9  },
    { name:'Otros (5)',        ventas:254000, costos:188000, util:66000, vPct:16.3, uPct:19.2 },
  ],
  sucursal: [
    { name:'Matriz',  ventas:280000, costos:198000, util:82000, vPct:38.4, uPct:47.7 },
    { name:'Central', ventas:210000, costos:152000, util:58000, vPct:28.8, uPct:33.7 },
    { name:'Norte',   ventas:148000, costos:112000, util:36000, vPct:20.3, uPct:20.9 },
    { name:'Sur',     ventas:92000,  costos:71000,  util:21000, vPct:12.6, uPct:12.2 },
  ],
};

export const ALERTAS_FIN = [
  { tier:'r', msg:'Feb 2026: Utilidad operativa $2,449 — casi breakeven' },
  { tier:'r', msg:'Otros Ingresos -99% vs 2025 — analizar impacto' },
  { tier:'y', msg:'Gastos financieros -96.1% vs 2025 — verificar reclasificación' },
  { tier:'y', msg:'Lilian Portillo: Margen utilidad 6.6% — bajo promedio equipo' },
  { tier:'g', msg:'EBITDA $451K · Margen 60.2% — mejor período histórico' },
  { tier:'g', msg:'Utilidad Neta +390% vs año anterior' },
  { tier:'g', msg:'Costos de ventas -9.5% vs año anterior' },
];
