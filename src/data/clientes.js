// ─── Cartera de Clientes — Demo Data ─────────────────────────────────────────

export const CLIENTES_KPIS = [
  {
    lbl:'CxC Total', val:'$127K',
    meta:'$180K', metaLbl:'Límite crédito', pct:70.6,
    badgeDelta:'-$8K', badgeUp:true,
    yoyPrev:'$135K', yoyDelta:'-5.9%', yoyUp:true,
    accent:'#547e69', icon:'₡', iconBg:'#e8e8e8', iconColor:'#1a1a1a',
  },
  {
    lbl:'CxC Vencidas', val:'$108K',
    meta:'$50K', metaLbl:'Máx. tolerable', pct:46, isRisk:true,
    badgeDelta:'+$24K', badgeUp:false,
    yoyPrev:'$84K', yoyDelta:'+28.6%', yoyUp:false,
    accent:'#dc2626', icon:'!', iconBg:'#fee2e2', iconColor:'#dc2626',
  },
  {
    lbl:'Margen Bruto', val:'80%', sub:'Umbral Mín.',
    meta:'65%', metaLbl:'Umbral Mín.', pct:123,
    badge:'+5% más que pasado', badgeDelta:'+15 pp', badgeUp:true,
    yoyPrev:'75%', yoyDelta:'+5pp', yoyUp:true,
    accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a',
  },
  {
    lbl:'Ticket Promedio', val:'$31,456', sub:'Cambio anual',
    meta:'$40,600', metaLbl:'Meta', pct:77.5,
    badge:'76% de meta', badgeDelta:'180 tickets', badgeUp:false,
    yoyPrev:'$32,040', yoyDelta:'−1.82%', yoyUp:false,
    accent:'#dc2626', icon:'!', iconBg:'#fee2e2', iconColor:'#dc2626',
  },
  {
    lbl:'Clientes Nuevos', val:'47', sub:'vs año ant.',
    meta:'40', metaLbl:'Meta período', pct:117.5,
    badge:'+37% vs 1 año pasado', badgeDelta:'+13', badgeUp:true,
    yoyPrev:'34 clientes', yoyDelta:'+13', yoyUp:true,
    metaP:'40  117.5%',
    accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a',
  },
  {
    lbl:'Venta por Cliente', val:'$84,800', sub:'Año pasado',
    meta:'$90,000', metaLbl:'Meta', pct:94.2,
    badge:'−2.8% vs año pasado', badgeDelta:'−$2,400', badgeUp:false,
    yoyPrev:'$87,200', yoyDelta:'−2.8%', yoyUp:false,
    accent:'#d97706', icon:'△', iconBg:'#fef3c7', iconColor:'#d97706',
  },
  {
    lbl:'Frec. Compra', val:'32 días', sub:'Meta ideal',
    meta:'30 días', metaLbl:'Meta ideal', pct:93.8,
    badge:'93.8% de meta', badgeDelta:'+2 días', badgeUp:false,
    yoyPrev:'38 días', yoyDelta:'−6 días', yoyUp:true,
    accent:'#547e69', icon:'↑', iconBg:'#e8e8e8', iconColor:'#1a1a1a',
  },
];

// ─── Captación vs Churn — Mensual ─────────────────────────────────────────────
export const CHURN_DATA = {
  mes: {
    labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
    nuevos: [12, 15, 18, 22, 14, 16, 20, 18, 15, 17, 19, 21],
    churn:  [3,   2,  4,  1,  3,  2,  2,  3,  2,  3,  4,  6],
  },
  trim: {
    labels: ['Q1','Q2','Q3','Q4'],
    nuevos: [45,  52, 53, null],
    churn:  [9,   6,  7,  null],
  },
};

// ─── Alertas de clientes ──────────────────────────────────────────────────────
export const CLIENTES_ALERTS = [
  { type:'r', cli:'Jaine Espí',     msg:'90 días sin compra · 3 facturas vencidas $84K' },
  { type:'r', cli:'Gobierno S.A.',  msg:'Margen 12% · crecimiento −12% · bajo umbral' },
  { type:'r', cli:'Churn Mes',      msg:'6 clientes perdidos en julio vs meta máx. 5' },
  { type:'y', cli:'Agro Soluciones',msg:'45 días sin compra · 2 facturas vencidas' },
  { type:'y', cli:'Textil Norte',   msg:'60 días sin compra · margen bajo 21%' },
];

// ─── Rendimiento por Segmento ─────────────────────────────────────────────────
// dormant2y = clientes sin compra en los últimos 2 años (excluidos del conteo activo)
export const SEGMENTO_DATA = [
  { id:'INDUSTRIA', lbl:'Industria',  color:'#547e69', ventasAct:84900,  ventasAnt:78841, crecPct:+14.2, margenD:12735, margenPct:15, ticketProm:4245, nuevos:8,  actuales:42, abandon:1, dormant2y:3, popPct:38 },
  { id:'AGRICOLA',  lbl:'Agrícola',   color:'#16a34a', ventasAct:74876,  ventasAnt:81112, crecPct:-11.2, margenD:7488,  margenPct:10, ticketProm:2496, nuevos:5,  actuales:35, abandon:3, dormant2y:5, popPct:28 },
  { id:'FARMA',     lbl:'Farma',      color:'#4d3f32', ventasAct:64466,  ventasAnt:34121, crecPct:+47,   margenD:29010, margenPct:45, ticketProm:5372, nuevos:12, actuales:22, abandon:0, dormant2y:1, popPct:18 },
  { id:'COMERCIO',  lbl:'Comercio',   color:'#d97706', ventasAct:81125,  ventasAnt:52718, crecPct:-2.1,  margenD:28394, margenPct:35, ticketProm:3381, nuevos:6,  actuales:18, abandon:2, dormant2y:3, popPct:12 },
  { id:'GOBIERNO',  lbl:'Gobierno',   color:'#6a6a6a', ventasAct:41300,  ventasAnt:38200, crecPct:+8.1,  margenD:4956,  margenPct:12, ticketProm:2065, nuevos:2,  actuales:14, abandon:4, dormant2y:6, popPct:4  },
];

// ─── Heatmap Ventas Cruzadas ──────────────────────────────────────────────────
export const HEATMAP_DATA = {
  xAxis: ['Industria','Agrícola','Farma','Comercio','Gobierno'],
  yAxis: ['Farmacéuticos','Suplementos','Fertilizantes','Semillas','Limpieza','Maquinaria','Veterinarios'],
  // [row][col] value in $K
  data: [
    [18.2, 4.5,  42,   8.3,  2.1],
    [12.4, 2.8,  28.5, 5.1,  0.8],
    [6.2,  32,   1,    3.5,  5.4],
    [3.1,  24.6, 0.5,  1.2,  1.8],
    [8.7,  1.2,  3.4,  12.8, 0.4],
    [22,   15.3, 0.2,  2,    8.5],
    [2.5,  18.7, 6.2,  1,    0.3],
  ],
};

// ─── BCG Matrix data ──────────────────────────────────────────────────────────
// x = participación de mercado (0-100), y = crecimiento (−20 a +50), size = ventas
export const BCG_CLIENTS = [
  { id:'TN', name:'Textil Norte',     seg:'Comercio',  x:18,  y:15,  v:12,  mg:21, quadrant:'Interrogantes', color:'#f59e0b' },
  { id:'CB', name:'Christian B.',     seg:'Comercio',  x:22,  y:22,  v:15,  mg:25, quadrant:'Interrogantes', color:'#f59e0b' },
  { id:'DK', name:'Distribuidora K',  seg:'Industria', x:65,  y:38,  v:142, mg:31, quadrant:'Estrellas',     color:'#16a34a' },
  { id:'FC', name:'Farma Central',    seg:'Farma',     x:72,  y:24,  v:245, mg:30, quadrant:'Estrellas',     color:'#16a34a' },
  { id:'AN', name:'Avícola Nacional', seg:'Avícola',   x:58,  y:22,  v:89,  mg:35, quadrant:'Estrellas',     color:'#16a34a' },
  { id:'JE', name:'Jaine Espi',       seg:'Agrícola',  x:20,  y:-8,  v:1.4, mg:16, quadrant:'Perros',        color:'#dc2626' },
  { id:'GS', name:'Gobierno S.A.',    seg:'Gobierno',  x:25,  y:-12, v:8,   mg:12, quadrant:'Perros',        color:'#dc2626' },
  { id:'GM', name:'Gloria Mar',       seg:'Industria', x:68,  y:3,   v:89,  mg:46, quadrant:'Vacas Lecheras', color:'#d97706' },
  { id:'AS', name:'Agro Soluciones',  seg:'Agrícola',  x:55,  y:1.2, v:34,  mg:30, quadrant:'Vacas Lecheras', color:'#d97706' },
];

// ─── Tops de Productos ────────────────────────────────────────────────────────
export const TOP_PRODUCTOS_MAS = [
  { name:'AGROVIT PLUS 1L',  ventas:'$284K', crec:'+8.7%',  crecUp:true,  cat:'Agrícola'    },
  { name:'PILAROUND 500ML',  ventas:'$199K', crec:'+6.0%',  crecUp:true,  cat:'Agrícola'    },
  { name:'VETMEC COMBO',     ventas:'$157K', crec:'+17.2%', crecUp:true,  cat:'Veterinario'  },
  { name:'NUTRISEM PRO',     ventas:'$143K', crec:'+11.1%', crecUp:true,  cat:'Semillas'     },
  { name:'BIOMAX TABS',      ventas:'$119K', crec:'+16.7%', crecUp:true,  cat:'Veterinario'  },
];

export const TOP_PRODUCTOS_MENOS = [
  { name:'HERBICIDA X20',    ventas:'$54K',  crec:'-11.5%', crecUp:false, cat:'Agrícola'    },
  { name:'BIOMAX SPRAY',     ventas:'$46K',  crec:'+9.5%',  crecUp:true,  cat:'Veterinario'  },
  { name:'AGROFER 5KG',      ventas:'$63K',  crec:'+10.5%', crecUp:true,  cat:'Agrícola'    },
  { name:'SEMVERDE 25KG',    ventas:'$72K',  crec:'+9.9%',  crecUp:true,  cat:'Semillas'     },
  { name:'CALCIVIT INY',     ventas:'$84K',  crec:'+10.4%', crecUp:true,  cat:'Veterinario'  },
];

// ─── Detalle de clientes ──────────────────────────────────────────────────────
export const CLIENTES_DET = [
  {
    id:13212, name:'Gloria Mar', seg:'INDUSTRIA', segColor:'#547e69',
    categoria:'Premium', catColor:'#16a34a',
    creditCat: 'AA', limiteCredito: 120000, utilizadoCredito: 45000,
    diasVencido: 0, proxCobro: null, ultimaCompra: '25/07/25', ultimoPago: '20/07/25',
    vend:'Juan Hernández', tipo:'Jurídico',
    venta:89813, costo:80031, mgPct:46, mgD:14431,
    facturas:39, factVenc:0, montoVenc:0, abono:89813, pend:0, facPagadas:39, facPendNoVenc:0,
    factDet:[
      { id:'FV-2025-0043', fecha:'25/07/25', subtotal:13000, descPct:4.2, total:12450, estado:true  },
      { id:'FV-2025-0031', fecha:'15/07/25', subtotal:9800,  descPct:2.1, total:9594,  estado:true  },
      { id:'FV-2025-0018', fecha:'05/07/25', subtotal:8600,  descPct:0,   total:8600,  estado:true  },
    ],
    crossSell:[
      { prod:'NUTRISEM PRO',   potencial:'$12K', razon:'Clientes del mismo segmento también compran' },
      { prod:'BIOMAX TABS',    potencial:'$8K',  razon:'Complementario con AGROVIT PLUS 1L'         },
      { prod:'VETMEC COMBO',   potencial:'$6K',  razon:'Alta demanda en clientes Industria'         },
    ],
  },
  {
    id:24181, name:'Jaine Espí', seg:'AGRÍCOLA', segColor:'#16a34a',
    categoria:'En Riesgo', catColor:'#dc2626',
    creditCat: 'D', limiteCredito: 50000, utilizadoCredito: 49000,
    diasVencido: 90, proxCobro: '28/07/25', ultimaCompra: '24/07/25', ultimoPago: null,
    vend:'Jorge Miguel', tipo:'Individual',
    venta:1445, costo:800, mgPct:16, mgD:0,
    facturas:41, factVenc:3, montoVenc:84000, abono:0, pend:84000, facPagadas:38, facPendNoVenc:0,
    factDet:[
      { id:'FV-2025-0041', fecha:'24/07/25', subtotal:4800,  descPct:0,   total:4800,  estado:false },
      { id:'FV-2025-0038', fecha:'22/07/25', subtotal:4600,  descPct:8.5, total:4210,  estado:false },
      { id:'FV-2025-0029', fecha:'10/07/25', subtotal:2200,  descPct:3.0, total:2134,  estado:false },
    ],
    crossSell:[
      { prod:'SEMVERDE 25KG', potencial:'$5K',  razon:'Producto de alta rotación en perfil Agrícola' },
      { prod:'AGROFER 5KG',   potencial:'$3K',  razon:'Historial de compras similar a clientes recuperados' },
    ],
  },
  {
    id:15121, name:'Christian B.', seg:'COMERCIO', segColor:'#d97706',
    categoria:'Regular', catColor:'#547e69',
    creditCat: 'B', limiteCredito: 30000, utilizadoCredito: 22000,
    diasVencido: 22, proxCobro: '15/08/25', ultimaCompra: '22/07/25', ultimoPago: '08/07/25',
    vend:'María López', tipo:'Jurídico',
    venta:15800, costo:8500, mgPct:25, mgD:0,
    facturas:13, factVenc:1, montoVenc:6500, abono:6500, pend:6500, facPagadas:10, facPendNoVenc:2,
    factDet:[
      { id:'FV-2025-0037', fecha:'22/07/25', subtotal:7200,  descPct:5.0, total:6840,  estado:false },
      { id:'FV-2025-0024', fecha:'08/07/25', subtotal:5100,  descPct:2.0, total:4998,  estado:true  },
      { id:'FV-2025-0011', fecha:'01/07/25', subtotal:4100,  descPct:0,   total:4100,  estado:true  },
    ],
    crossSell:[
      { prod:'CALCIVIT INY',  potencial:'$9K',  razon:'Clientes Comercio con perfil similar'         },
      { prod:'VETMEC COMBO',  potencial:'$7K',  razon:'Oportunidad de up-sell detectada'             },
    ],
  },
  {
    id:18934, name:'Distribuidora K', seg:'INDUSTRIA', segColor:'#547e69',
    categoria:'Premium', catColor:'#16a34a',
    creditCat: 'A', limiteCredito: 200000, utilizadoCredito: 142000,
    diasVencido: 8, proxCobro: '23/08/25', ultimaCompra: '24/07/25', ultimoPago: '18/07/25',
    vend:'Juan Hernández', tipo:'Jurídico',
    venta:142300, costo:98200, mgPct:31, mgD:44100,
    facturas:28, factVenc:0, montoVenc:0, abono:120000, pend:22300, facPagadas:24, facPendNoVenc:4,
    factDet:[
      { id:'FV-2025-0042', fecha:'24/07/25', subtotal:9500,  descPct:6.1, total:8920,  estado:true  },
      { id:'FV-2025-0039', fecha:'23/07/25', subtotal:10200, descPct:8.4, total:9340,  estado:false },
      { id:'FV-2025-0033', fecha:'18/07/25', subtotal:14800, descPct:4.0, total:14208, estado:true  },
    ],
    crossSell:[
      { prod:'PILAROUND 500ML', potencial:'$22K', razon:'Alta afinidad con cartera actual de productos' },
      { prod:'HERBICIDA X20',   potencial:'$14K', razon:'Producto sustituto con mejor margen'          },
    ],
  },
  {
    id:22056, name:'Agro Soluciones', seg:'AGRÍCOLA', segColor:'#16a34a',
    categoria:'Atención', catColor:'#d97706',
    creditCat: 'B', limiteCredito: 60000, utilizadoCredito: 40600,
    diasVencido: 25, proxCobro: '20/08/25', ultimaCompra: '23/07/25', ultimoPago: '09/07/25',
    vend:'Jorge Miguel', tipo:'Individual',
    venta:34200, costo:24100, mgPct:30, mgD:10100,
    facturas:15, factVenc:2, montoVenc:12400, abono:28000, pend:6200, facPagadas:11, facPendNoVenc:2,
    factDet:[
      { id:'FV-2025-0040', fecha:'23/07/25', subtotal:7100,  descPct:4.5, total:6780,  estado:true  },
      { id:'FV-2025-0036', fecha:'21/07/25', subtotal:7500,  descPct:5.1, total:7118,  estado:false },
      { id:'FV-2025-0028', fecha:'09/07/25', subtotal:5200,  descPct:0,   total:5200,  estado:true  },
    ],
    crossSell:[
      { prod:'NUTRISEM PRO',    potencial:'$8K',  razon:'Complementa su mix de productos Agrícola'   },
      { prod:'SEMVERDE 25KG',   potencial:'$6K',  razon:'Clientes similares aumentaron pedidos'      },
      { prod:'AGROVIT PLUS 1L', potencial:'$5K',  razon:'Historial de compra esporádica — recuperar' },
    ],
  },
  {
    id:30421, name:'Farma Central', seg:'FARMA', segColor:'#4d3f32',
    categoria:'Premium', catColor:'#16a34a',
    creditCat: 'AA', limiteCredito: 350000, utilizadoCredito: 245000,
    diasVencido: 0, proxCobro: null, ultimaCompra: '25/07/25', ultimoPago: '21/07/25',
    vend:'Juan Hernández', tipo:'Jurídico',
    venta:245000, costo:172000, mgPct:30, mgD:73000,
    facturas:52, factVenc:0, montoVenc:0, abono:200000, pend:45000, facPagadas:46, facPendNoVenc:6,
    factDet:[
      { id:'FV-2025-0044', fecha:'25/07/25', subtotal:16500, descPct:7.3, total:15294, estado:true  },
      { id:'FV-2025-0035', fecha:'21/07/25', subtotal:12000, descPct:4.8, total:11424, estado:true  },
      { id:'FV-2025-0026', fecha:'08/07/25', subtotal:18700, descPct:6.0, total:17578, estado:false },
    ],
    crossSell:[
      { prod:'CALCIVIT INY',  potencial:'$18K', razon:'Categoría Farma con alta penetración'       },
      { prod:'BIOMAX TABS',   potencial:'$12K', razon:'Producto de alta rotación en clientes Farma' },
    ],
  },
  {
    id:11287, name:'Textil Norte', seg:'COMERCIO', segColor:'#d97706',
    categoria:'Atención', catColor:'#d97706',
    creditCat: 'C', limiteCredito: 25000, utilizadoCredito: 14800,
    diasVencido: 35, proxCobro: '08/08/25', ultimaCompra: '20/07/25', ultimoPago: '04/07/25',
    vend:'María López', tipo:'Individual',
    venta:12400, costo:9800, mgPct:21, mgD:2600,
    facturas:7, factVenc:1, montoVenc:3200, abono:10000, pend:2400, facPagadas:5, facPendNoVenc:1,
    factDet:[
      { id:'FV-2025-0034', fecha:'20/07/25', subtotal:3400,  descPct:5.9, total:3200,  estado:false },
      { id:'FV-2025-0022', fecha:'04/07/25', subtotal:4100,  descPct:2.4, total:4002,  estado:true  },
      { id:'FV-2025-0015', fecha:'28/06/25', subtotal:5300,  descPct:3.0, total:5141,  estado:true  },
    ],
    crossSell:[
      { prod:'VETMEC COMBO',  potencial:'$7K',  razon:'Perfil Comercio con potencial de expansión'  },
      { prod:'NUTRISEM PRO',  potencial:'$4K',  razon:'Producto de reactivación recomendado'        },
    ],
  },
];

// ─── Detalle facturas (flat) ──────────────────────────────────────────────────
export const DET_ROWS_CLI = [
  { id:'FV-2025-0043', cli:'Bom Bom Agro S.A.',      nofac:'001-001-0000043', fecha:'2025-07-25', venc:'2025-08-24', qty:38, v:12450, nc:null,   costo:9430,  mgPct:24.3, abono:12450, pend:0,
    condpago:'30 días', canal:'Tienda Central', vendFull:'Juan Hernández', tipo:'Crédito',
    lines:[
      { prod:'AGROVIT PLUS 1L',  sku:'AG-001', qty:20, pu:320,  tot:6400,  costo:4800, mg:25.0 },
      { prod:'NUTRISEM PRO 5KG', sku:'NS-012', qty:12, pu:380,  tot:4560,  costo:3480, mg:23.7 },
      { prod:'BIOMAX TABS 50UN', sku:'BT-007', qty:6,  pu:248,  tot:1488,  costo:1150, mg:22.7 },
    ]
  },
  { id:'FV-2025-0042', cli:'AgroVerde Ltda.',          nofac:'001-001-0000042', fecha:'2025-07-24', venc:'2025-08-23', qty:24, v:8920,  nc:null,   costo:6440,  mgPct:27.8, abono:8920,  pend:0,
    condpago:'Contado', canal:'Sucursal No.1', vendFull:'María López', tipo:'Contado',
    lines:[
      { prod:'SEMVERDE 25KG',    sku:'SV-003', qty:14, pu:380,  tot:5320,  costo:3800, mg:28.6 },
      { prod:'AGROFER 5KG',      sku:'AF-009', qty:10, pu:360,  tot:3600,  costo:2640, mg:26.7 },
    ]
  },
  { id:'FV-2025-0041', cli:'Veterinaria El Campo',     nofac:'001-001-0000041', fecha:'2025-07-24', venc:'2025-09-22', qty:51, v:15300, nc:-2295,  costo:10530, mgPct:31.2, abono:0,     pend:15300,
    condpago:'60 días', canal:'Tienda Central', vendFull:'Jorge Miguel', tipo:'Crédito',
    lines:[
      { prod:'CALCIVIT INY 100ML',sku:'CI-014', qty:25, pu:240, tot:6000,  costo:4100, mg:31.7 },
      { prod:'VETMEC COMBO',      sku:'VM-021', qty:18, pu:310, tot:5580,  costo:3850, mg:31.0 },
      { prod:'BIOMAX TABS 50UN',  sku:'BT-007', qty:8,  pu:465, tot:3720,  costo:2580, mg:30.6 },
    ]
  },
  { id:'FV-2025-0040', cli:'Semillas del Sur S.A.',    nofac:'001-001-0000040', fecha:'2025-07-23', venc:'2025-07-23', qty:18, v:6780,  nc:null,   costo:5500,  mgPct:18.9, abono:6780,  pend:0,
    condpago:'Contado', canal:'Tienda Central', vendFull:'Carlos Ávila', tipo:'Contado',
    lines:[
      { prod:'HERBICIDA X20 1L', sku:'HX-005', qty:10, pu:410, tot:4100,  costo:3350, mg:18.3 },
      { prod:'SEMVERDE 25KG',    sku:'SV-003', qty:8,  pu:335, tot:2680,  costo:2150, mg:19.8 },
    ]
  },
  { id:'FV-2025-0039', cli:'Campo Fertil S.A.',        nofac:'001-001-0000039', fecha:'2025-07-23', venc:'2025-08-22', qty:31, v:9340,  nc:null,   costo:6960,  mgPct:25.4, abono:0,     pend:9340,
    condpago:'30 días', canal:'Sucursal No.1', vendFull:'Juan Hernández', tipo:'Crédito',
    lines:[
      { prod:'PILAROUND 500ML',  sku:'PL-002', qty:15, pu:360, tot:5400,  costo:4020, mg:25.6 },
      { prod:'AGROFER 5KG',      sku:'AF-009', qty:16, pu:243, tot:3940,  costo:2940, mg:25.4 },
    ]
  },
  { id:'FV-2025-0038', cli:'Agro Norte S.R.L.',        nofac:'001-001-0000038', fecha:'2025-07-22', venc:'2025-08-21', qty:14, v:4210,  nc:null,   costo:3360,  mgPct:20.2, abono:0,     pend:4210,
    condpago:'15 días', canal:'Tienda Central', vendFull:'María López', tipo:'Crédito',
    lines:[
      { prod:'NUTRISEM PRO 5KG', sku:'NS-012', qty:7,  pu:360, tot:2520,  costo:2010, mg:20.2 },
      { prod:'AGROVIT PLUS 1L',  sku:'AG-001', qty:7,  pu:241, tot:1690,  costo:1350, mg:20.1 },
    ]
  },
  { id:'FV-2025-0037', cli:'Bom Bom Agro S.A.',        nofac:'001-001-0000037', fecha:'2025-07-22', venc:'2025-09-20', qty:62, v:18760, nc:-2295,  costo:14510, mgPct:22.7, abono:0,     pend:18760,
    condpago:'60 días', canal:'Tienda Central', vendFull:'Juan Hernández', tipo:'Crédito',
    lines:[
      { prod:'CALCIVIT INY 100ML',sku:'CI-014', qty:30, pu:290, tot:8700,  costo:6700, mg:23.0 },
      { prod:'VETMEC COMBO',      sku:'VM-021', qty:20, pu:360, tot:7200,  costo:5600, mg:22.2 },
      { prod:'BIOMAX TABS 50UN',  sku:'BT-007', qty:12, pu:238, tot:2860,  costo:2210, mg:22.7 },
    ]
  },
  { id:'FV-2025-0036', cli:'Agro Soluciones',          nofac:'001-001-0000036', fecha:'2025-07-21', venc:'2025-08-20', qty:29, v:7118,  nc:null,   costo:5200,  mgPct:26.9, abono:0,     pend:7118,
    condpago:'30 días', canal:'Sucursal No.1', vendFull:'Jorge Miguel', tipo:'Crédito',
    lines:[
      { prod:'AGROVIT PLUS 1L',  sku:'AG-001', qty:16, pu:270, tot:4320,  costo:3150, mg:27.1 },
      { prod:'SEMVERDE 25KG',    sku:'SV-003', qty:13, pu:215, tot:2798,  costo:2050, mg:26.7 },
    ]
  },
  { id:'FV-2025-0035', cli:'Farma Central',            nofac:'001-001-0000035', fecha:'2025-07-21', venc:'2025-08-20', qty:45, v:11424, nc:null,   costo:8100,  mgPct:29.1, abono:11424, pend:0,
    condpago:'30 días', canal:'Tienda Central', vendFull:'Juan Hernández', tipo:'Crédito',
    lines:[
      { prod:'CALCIVIT INY 100ML',sku:'CI-014', qty:25, pu:300, tot:7500,  costo:5300, mg:29.3 },
      { prod:'BIOMAX TABS 50UN',  sku:'BT-007', qty:20, pu:196, tot:3924,  costo:2800, mg:28.7 },
    ]
  },
  { id:'FV-2025-0034', cli:'Gloria Mar',               nofac:'001-001-0000034', fecha:'2025-07-20', venc:'2025-08-19', qty:22, v:9594,  nc:null,   costo:7200,  mgPct:24.9, abono:9594,  pend:0,
    condpago:'Contado', canal:'Tienda Central', vendFull:'Juan Hernández', tipo:'Contado',
    lines:[
      { prod:'NUTRISEM PRO 5KG', sku:'NS-012', qty:12, pu:460, tot:5520,  costo:4150, mg:24.8 },
      { prod:'HERBICIDA X20 1L', sku:'HX-005', qty:10, pu:407, tot:4074,  costo:3050, mg:25.1 },
    ]
  },
];

// ─── Ventas Cruzadas por Clasificación ───────────────────────────────────────
export const VENTAS_CRUZADAS = {
  A: [
    { cliente:'Agropecuaria El Campo', ventasAct:84001, ventasAnt:78841, crec:6.5,   part:33.9, articulos:44,   pendiente:78841, cruzada:['Alimento Premium','Vacuna Triple','Anti Parasitario'] },
    { cliente:'Veterinaria Los Pinos', ventasAct:74876, ventasAnt:69112, crec:8.3,   part:29.9, articulos:1103, pendiente:78841, cruzada:['Vacuna Triple','Anti Parasitario'] },
    { cliente:'Distribuidora Olmeca',  ventasAct:64406, ventasAnt:24421, crec:163.7, part:25.8, articulos:237,  pendiente:78841, cruzada:['Alimento Premium','Vacuna Triple','Anti Parasitario'] },
    { cliente:'Farmacia Animal',       ventasAct:48200, ventasAnt:14300, crec:237.1, part:33.3, articulos:856,  pendiente:78841, cruzada:['Vacuna Triple','Anti Parasitario'] },
    { cliente:'AgroSur S.A.',          ventasAct:38900, ventasAnt:32100, crec:21.2,  part:18.4, articulos:203,  pendiente:43200, cruzada:['Alimento Premium'] },
    { cliente:'Carlos Méndez',         ventasAct:33798, ventasAnt:25278, crec:-24.3, part:14.3, articulos:1418, pendiente:78841, cruzada:['Alimento Premium'] },
    { cliente:'Finca Las Flores',      ventasAct:22000, ventasAnt:16500, crec:-2.3,  part:8.8,  articulos:312,  pendiente:78841, cruzada:['Alimento Premium','Vacuna Triple','Anti Parasitario'] },
  ],
  B: [
    { cliente:'Veterinaria Central',   ventasAct:52400, ventasAnt:48200, crec:8.7,   part:28.1, articulos:87,   pendiente:34200, cruzada:['Vacuna Triple'] },
    { cliente:'Ganadería del Norte',   ventasAct:44800, ventasAnt:50100, crec:-10.6, part:24.0, articulos:134,  pendiente:21000, cruzada:['Alimento Premium','Anti Parasitario'] },
    { cliente:'Agroquímica Sur',       ventasAct:38200, ventasAnt:31000, crec:23.2,  part:20.5, articulos:296,  pendiente:38200, cruzada:['Alimento Premium'] },
    { cliente:'Distribuidora Maya',    ventasAct:32100, ventasAnt:29800, crec:7.7,   part:17.2, articulos:445,  pendiente:15000, cruzada:['Vacuna Triple','Anti Parasitario'] },
    { cliente:'Granja San José',       ventasAct:19400, ventasAnt:18900, crec:2.6,   part:10.4, articulos:67,   pendiente:8400,  cruzada:['Alimento Premium'] },
  ],
  C: [
    { cliente:'Tienda Agro Xela',      ventasAct:28100, ventasAnt:22000, crec:27.7,  part:35.4, articulos:52,   pendiente:12000, cruzada:['Alimento Premium','Vacuna Triple'] },
    { cliente:'Campo Verde',           ventasAct:21800, ventasAnt:24100, crec:-9.5,  part:27.5, articulos:93,   pendiente:9800,  cruzada:['Anti Parasitario'] },
    { cliente:'Rancho El Sol',         ventasAct:17200, ventasAnt:15400, crec:11.7,  part:21.7, articulos:41,   pendiente:6200,  cruzada:['Alimento Premium'] },
    { cliente:'Fertisa S.A.',          ventasAct:11900, ventasAnt:13200, crec:-9.8,  part:15.0, articulos:28,   pendiente:4100,  cruzada:['Vacuna Triple','Anti Parasitario'] },
  ],
};

// ─── Alertas de Sistema ───────────────────────────────────────────────────────
export const ALERTAS_SISTEMA = [
  { tier:'r', msg:'Margen bruto 18.1% — bajo umbral mínimo 25%' },
  { tier:'r', msg:'PILAROUND con margen negativo -0.7% — revisar precio' },
  { tier:'r', msg:'Estuardo Quiñonez: 3 clientes sin compra >15 días' },
  { tier:'y', msg:'Ticket promedio $349 — 6.7% bajo meta mensual' },
  { tier:'y', msg:'Canal e-commerce -17% vs mes anterior' },
  { tier:'g', msg:'Ventas YTD +12.3% vs mismo periodo 2024' },
  { tier:'g', msg:'43 facturas emitidas · 107.5% de meta' },
];

// ─── Cuentas por Cobrar ───────────────────────────────────────────────────────
export const CXC_DATA = {
  total:             150000,
  facturas:          38,
  deltaVsAnt:        '+10%',
  porVencer:         56000,
  vencidas:          84000,
  porVencerFacturas: 14,
  vencidasFacturas:  24,
  agingPorVencer: [
    { label:'Próx. 7 días',  monto:18000, facturas:5, color:'#16a34a' },
    { label:'8–15 días',     monto:22000, facturas:6, color:'#65a30d' },
    { label:'16–30 días',    monto:16000, facturas:3, color:'#d97706' },
  ],
  agingVencidas: [
    { label:'1–30 días',  monto:32000, facturas:9,  color:'#16a34a' },
    { label:'31–60 días', monto:24000, facturas:7,  color:'#d97706' },
    { label:'61–90 días', monto:18000, facturas:5,  color:'#ea580c' },
    { label:'90+ días',   monto:10000, facturas:3,  color:'#dc2626' },
  ],
};
