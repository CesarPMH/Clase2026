// ─── Ventas Dashboard — Demo Data (Bom Bom) ───────────────────────────────────

export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Historical ventas grouped bar chart data
export const VENTAS_HIST = {
  general: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      datasets: [
        { label:'2024', data:[980,1020,1150,1090,1230,1310,1290,1420,1380,1460,1510,1580], color:'rgba(26,26,26,.22)' },
        { label:'2025', data:[1050,1120,1280,1210,1360,1420,1560,null,null,null,null,null], color:'#547e69' },
        { label:'2026 Proy.', data:[null,null,null,null,null,null,null,1620,1680,1750,1810,1890], color:'rgba(84,126,105,.4)' },
      ],
      budget: [1000,1080,1200,1180,1300,1380,1500,1560,1600,1680,1740,1800],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      datasets: [
        { label:'2024', data:[3150,3630,4090,4550], color:'rgba(26,26,26,.22)' },
        { label:'2025', data:[3590,3990,null,null],  color:'#547e69' },
      ],
      budget: [3260,3860,4360,4720],
    },
  },
  categoria: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      datasets: [
        { label:'Agrícola',    data:[406,432,494,468,526,549,602,null,null,null,null,null], color:'#547e69' },
        { label:'Veterinario', data:[315,336,384,363,408,426,468,null,null,null,null,null], color:'#1a1a1a' },
        { label:'Semillas',    data:[210,224,256,242,272,284,312,null,null,null,null,null], color:'rgba(84,126,105,.5)' },
        { label:'Otros',       data:[119,128,144,137,154,161,176,null,null,null,null,null], color:'rgba(26,26,26,.3)' },
      ],
      budget: null,
    },
  },
};

// Ventas por (producto/categoría/canal/vendedor/región/cliente) — horizontal bar + table
export const VPOR_DATA = {
  producto: [
    { name:'AGROVIT PLUS 1L',  v:284, prev:261, part:18.2, mg:24.3, vsAnt:8.7   },
    { name:'PILAROUND 500ML',  v:199, prev:188, part:12.7, mg:-0.7, vsAnt:6.0   },
    { name:'VETMEC COMBO',     v:157, prev:134, part:10.0, mg:31.4, vsAnt:17.2  },
    { name:'NUTRISEM PRO',     v:143, prev:129, part:9.2,  mg:28.7, vsAnt:11.1  },
    { name:'BIOMAX TABS',      v:119, prev:102, part:7.6,  mg:22.3, vsAnt:16.7  },
    { name:'CALCIVIT INY',     v:84,  prev:76,  part:5.4,  mg:33.1, vsAnt:10.4  },
    { name:'SEMVERDE 25KG',    v:72,  prev:66,  part:4.6,  mg:26.4, vsAnt:9.9   },
    { name:'AGROFER 5KG',      v:63,  prev:57,  part:4.0,  mg:19.8, vsAnt:10.5  },
    { name:'HERBICIDA X20',    v:54,  prev:61,  part:3.5,  mg:14.2, vsAnt:-11.5 },
    { name:'BIOMAX SPRAY',     v:46,  prev:42,  part:2.9,  mg:21.7, vsAnt:9.5   },
  ],
  categoria: [
    { name:'Agrícola',     v:612, prev:558, part:39.2, mg:22.4, vsAnt:9.7  },
    { name:'Veterinario',  v:498, prev:431, part:31.9, mg:28.7, vsAnt:15.5 },
    { name:'Semillas',     v:288, prev:262, part:18.4, mg:24.1, vsAnt:9.9  },
    { name:'Esp. Menores', v:162, prev:149, part:10.4, mg:31.2, vsAnt:8.7  },
  ],
  canal: [
    { name:'Tienda Central', v:682, prev:611, part:43.7, mg:21.3, vsAnt:11.6  },
    { name:'Sucursal No.1',  v:498, prev:452, part:31.9, mg:24.8, vsAnt:10.2  },
    { name:'Sucursal No.2',  v:215, prev:198, part:13.7, mg:27.1, vsAnt:8.6   },
    { name:'E-Commerce',     v:166, prev:200, part:10.6, mg:18.4, vsAnt:-17.0 },
  ],
  vendedor: [
    { name:'David Guerra',      v:498, prev:441, part:31.9, mg:23.1, vsAnt:12.9 },
    { name:'Robinson Zamora',   v:412, prev:379, part:26.4, mg:25.7, vsAnt:8.7  },
    { name:'Estuardo Quiñonez', v:389, prev:401, part:24.9, mg:20.4, vsAnt:-3.0 },
    { name:'Tienda Directa',    v:261, prev:219, part:16.7, mg:19.8, vsAnt:19.2 },
  ],
  region: [
    { name:'Centro',    v:521, prev:478, part:33.4, mg:22.1, vsAnt:9.0  },
    { name:'Norte',     v:389, prev:341, part:24.9, mg:24.8, vsAnt:14.1 },
    { name:'Sur',       v:312, prev:289, part:20.0, mg:21.3, vsAnt:8.0  },
    { name:'Oriente',   v:199, prev:182, part:12.7, mg:23.4, vsAnt:9.3  },
    { name:'Occidente', v:139, prev:150, part:8.9,  mg:18.2, vsAnt:-7.3 },
  ],
  cliente: [
    { name:'Bom Bom Agro S.A.',   v:312, prev:278, part:20.0, mg:23.1, vsAnt:12.2 },
    { name:'AgroVerde Ltda.',      v:198, prev:172, part:12.7, mg:24.8, vsAnt:15.1 },
    { name:'Vet. El Campo',        v:189, prev:201, part:12.1, mg:28.3, vsAnt:-6.0 },
    { name:'Semillas del Sur S.A.',v:156, prev:141, part:10.0, mg:19.2, vsAnt:10.6 },
    { name:'Campo Fertil S.A.',    v:142, prev:128, part:9.1,  mg:22.1, vsAnt:10.9 },
    { name:'Agro Norte S.R.L.',    v:128, prev:112, part:8.2,  mg:21.8, vsAnt:14.3 },
    { name:'La Granja S.A.',       v:101, prev:98,  part:6.5,  mg:30.2, vsAnt:3.1  },
    { name:'VetSur Clínica',       v:90,  prev:78,  part:5.8,  mg:33.4, vsAnt:15.4 },
    { name:'Agro Sur Ltda.',       v:84,  prev:91,  part:5.4,  mg:17.8, vsAnt:-7.7 },
    { name:'Central Agro S.A.',    v:60,  prev:54,  part:3.8,  mg:20.6, vsAnt:11.1 },
  ],
};

// Invoice / factura data
export const INV_DATA = [
  { fac:'FV-2025-0043', nc:false, nc_monto:null, nofac:'001-001-0000043', cli:'Bom Bom Agro S.A.', cliFull:'Bom Bom Agro S.A.', canal:'Tienda Central', vend:'D. Guerra', vendFull:'David Guerra', condpago:'30 días', tipo:'Crédito', fecha:'25/07/2025', vence:'24/08/2025', qty:38, v:12450, costo:9430, mg:24.3, abono:12450, pend:0, pago:true,
    lines:[{prod:'AGROVIT PLUS 1L',sku:'AGR-001',qty:12,pu:480,tot:5760,costo:4360,mg:24.3},{prod:'VETMEC COMBO',sku:'VET-012',qty:8,pu:612,tot:4896,costo:3370,mg:31.2},{prod:'NUTRISEM PRO',sku:'NUT-007',qty:3,pu:598,tot:1794,costo:1280,mg:28.7}]},
  { fac:'FV-2025-0042', nc:false, nc_monto:null, nofac:'001-001-0000042', cli:'AgroVerde Ltda.', cliFull:'AgroVerde Ltda.', canal:'Suc. No.1', vend:'R. Zamora', vendFull:'Robinson Zamora', condpago:'30 días', tipo:'Crédito', fecha:'24/07/2025', vence:'23/08/2025', qty:24, v:8920, costo:6440, mg:27.8, abono:8920, pend:0, pago:true,
    lines:[{prod:'AGROVIT PLUS 1L',sku:'AGR-001',qty:12,pu:480,tot:5760,costo:4360,mg:24.3},{prod:'VETMEC COMBO',sku:'VET-012',qty:8,pu:612,tot:4896,costo:3370,mg:31.2}]},
  { fac:'FV-2025-0041', nc:true, nc_monto:'NC −$2,295', nofac:'001-001-0000041', cli:'Veterinaria El Campo', cliFull:'Veterinaria El Campo', canal:'Tienda Central', vend:'D. Guerra', vendFull:'David Guerra', condpago:'60 días', tipo:'Crédito', fecha:'24/07/2025', vence:'22/09/2025', qty:51, v:15300, costo:10530, mg:31.2, abono:7650, pend:7650, pago:false,
    lines:[{prod:'CALCIVIT INY',sku:'CAL-003',qty:20,pu:320,tot:6400,costo:4300,mg:32.8},{prod:'BIOMAX TABS',sku:'BIO-008',qty:15,pu:298,tot:4470,costo:3100,mg:30.6}]},
  { fac:'FV-2025-0040', nc:false, nc_monto:null, nofac:'001-001-0000040', cli:'Semillas del Sur S.A.', cliFull:'Semillas del Sur S.A.', canal:'E-Commerce', vend:'E. Quiñonez', vendFull:'Estuardo Quiñonez', condpago:'Contado', tipo:'Contado', fecha:'23/07/2025', vence:'23/07/2025', qty:18, v:6780, costo:5500, mg:18.9, abono:6780, pend:0, pago:true,
    lines:[{prod:'SEMVERDE 25KG',sku:'SEM-015',qty:10,pu:380,tot:3800,costo:3100,mg:18.4},{prod:'AGROFER 5KG',sku:'AGF-011',qty:8,pu:372,tot:2980,costo:2400,mg:19.5}]},
  { fac:'FV-2025-0039', nc:false, nc_monto:null, nofac:'001-001-0000039', cli:'Campo Fertil S.A.', cliFull:'Campo Fertil S.A.', canal:'Suc. No.2', vend:'R. Zamora', vendFull:'Robinson Zamora', condpago:'30 días', tipo:'Crédito', fecha:'23/07/2025', vence:'22/08/2025', qty:31, v:9340, costo:6960, mg:25.4, abono:4000, pend:5340, pago:false,
    lines:[{prod:'AGROVIT PLUS 1L',sku:'AGR-001',qty:10,pu:480,tot:4800,costo:3650,mg:24.0},{prod:'NUTRISEM PRO',sku:'NUT-007',qty:12,pu:398,tot:4776,costo:3560,mg:25.4}]},
  { fac:'FV-2025-0038', nc:false, nc_monto:null, nofac:'001-001-0000038', cli:'Agro Norte S.R.L.', cliFull:'Agro Norte S.R.L.', canal:'Suc. No.1', vend:'E. Quiñonez', vendFull:'Estuardo Quiñonez', condpago:'60 días', tipo:'Crédito', fecha:'22/07/2025', vence:'21/08/2025', qty:14, v:4210, costo:3360, mg:20.2, abono:0, pend:4210, pago:false,
    lines:[{prod:'AGROFER 5KG',sku:'AGF-011',qty:8,pu:298,tot:2384,costo:1900,mg:20.3},{prod:'HERBICIDA X20',sku:'HRB-020',qty:6,pu:304,tot:1826,costo:1460,mg:20.0}]},
  { fac:'FV-2025-0037', nc:true, nc_monto:'NC −$2,295', nofac:'001-001-0000037', cli:'Bom Bom Agro S.A.', cliFull:'Bom Bom Agro S.A.', canal:'Tienda Central', vend:'D. Guerra', vendFull:'David Guerra', condpago:'60 días', tipo:'Crédito', fecha:'22/07/2025', vence:'20/09/2025', qty:62, v:18760, costo:14510, mg:22.7, abono:10000, pend:8760, pago:false,
    lines:[{prod:'AGROVIT PLUS 1L',sku:'AGR-001',qty:25,pu:480,tot:12000,costo:9200,mg:23.3},{prod:'BIOMAX TABS',sku:'BIO-008',qty:20,pu:298,tot:5960,costo:4650,mg:22.0}]},
  { fac:'FV-2025-0036', nc:false, nc_monto:null, nofac:'001-001-0000036', cli:'La Granja S.A.', cliFull:'La Granja S.A.', canal:'E-Commerce', vend:'Tienda', vendFull:'Tienda Directa', condpago:'Contado', tipo:'Contado', fecha:'21/07/2025', vence:'21/07/2025', qty:22, v:7120, costo:4970, mg:30.2, abono:7120, pend:0, pago:true,
    lines:[{prod:'CALCIVIT INY',sku:'CAL-003',qty:10,pu:320,tot:3200,costo:2200,mg:31.3},{prod:'VETMEC COMBO',sku:'VET-012',qty:6,pu:612,tot:3672,costo:2570,mg:30.0}]},
  { fac:'FV-2025-0035', nc:false, nc_monto:null, nofac:'001-001-0000035', cli:'AgroVerde Ltda.', cliFull:'AgroVerde Ltda.', canal:'Tienda Central', vend:'R. Zamora', vendFull:'Robinson Zamora', condpago:'30 días', tipo:'Crédito', fecha:'21/07/2025', vence:'20/08/2025', qty:35, v:11430, costo:8600, mg:24.7, abono:5000, pend:6430, pago:false,
    lines:[{prod:'AGROVIT PLUS 1L',sku:'AGR-001',qty:14,pu:480,tot:6720,costo:5100,mg:24.1},{prod:'NUTRISEM PRO',sku:'NUT-007',qty:12,pu:398,tot:4776,costo:3600,mg:24.6}]},
  { fac:'FV-2025-0034', nc:false, nc_monto:null, nofac:'001-001-0000034', cli:'VetSur Clínica', cliFull:'VetSur Clínica Veterinaria', canal:'Suc. No.2', vend:'Tienda', vendFull:'Tienda Directa', condpago:'Contado', tipo:'Contado', fecha:'20/07/2025', vence:'20/07/2025', qty:17, v:5890, costo:3920, mg:33.4, abono:5890, pend:0, pago:true,
    lines:[{prod:'CALCIVIT INY',sku:'CAL-003',qty:8,pu:320,tot:2560,costo:1680,mg:34.4},{prod:'BIOMAX TABS',sku:'BIO-008',qty:6,pu:298,tot:1788,costo:1180,mg:34.0}]},
];

// KPI cards — matches screenshot exactly
export const VENTAS_KPIS = [
  { id:'ventas',   label:'Ventas Totales',  value:'$1.56M', metaLabel:'Presupuesto', meta:'$1.50M', pct:104.1, metaDelta:'+$64K',   metaDeltaUp:true,  delta:'+12.3%', deltaUp:true,  yoy:'vs Año Ant. $1.39M', accentColor:'#16a34a', badgeIcon:'✓' },
  { id:'margen',   label:'Margen Bruto',    value:'18.1%',  metaLabel:'Umbral Mín.', meta:'25.0%',  pct:72.4,  metaDelta:'-6.9pp',  metaDeltaUp:false, delta:'-3.3pp', deltaUp:false, yoy:'vs Año Ant. 21.4%',  accentColor:'#dc2626', badgeIcon:'!' },
  { id:'ticket',   label:'Ticket Promedio', value:'$349',   metaLabel:'Meta',        meta:'$374',   pct:93.3,  metaDelta:'-$25',    metaDeltaUp:false, delta:'+11.2%', deltaUp:true,  yoy:'vs Año Ant. $314',   accentColor:'#d97706', badgeIcon:'△' },
  { id:'clientes', label:'Clientes Totales',value:'127',    metaLabel:'Meta',        meta:'120',    pct:105.8, metaDelta:'+7',      metaDeltaUp:true,  delta:'+16.5%', deltaUp:true,  yoy:'vs Año Ant. 109',    accentColor:'#16a34a', badgeIcon:'✓' },
  { id:'facturas', label:'Facturas',         value:'43',     metaLabel:'Meta',        meta:'40',     pct:107.5, metaDelta:'538 uds.',metaDeltaUp:true,  delta:'+26.5%', deltaUp:true,  yoy:'vs Año Ant. 34',     accentColor:'#16a34a', badgeIcon:'↑' },
  { id:'nuevos',   label:'Clientes Nuevos', value:'8',      metaLabel:'Meta',        meta:'10',     pct:80.0,  metaDelta:'-2',      metaDeltaUp:false, delta:'+60%',   deltaUp:true,  yoy:'vs Año Ant. 5',      accentColor:'#547e69', badgeIcon:'↑' },
  { id:'abandon',  label:'Abandonados',     value:'6',      metaLabel:'Umbral Máx.', meta:'5',      pct:120.0, metaDelta:null,      metaDeltaUp:false, delta:'-33%',   deltaUp:true,  yoy:'vs Año Ant. 9',      accentColor:'#d97706', badgeIcon:'!' },
];

// Alerts — matches screenshot exactly
export const VENTAS_ALERTS = [
  { type:'r', msg:'Margen bruto 18.1% — bajo umbral mínimo 25%' },
  { type:'r', msg:'PILAROUND con margen negativo -0.7% — revisar precio' },
  { type:'r', msg:'Estuardo Quiñonez: 3 clientes sin compra >15 días' },
  { type:'y', msg:'Ticket promedio $349 — 6.7% bajo meta mensual' },
  { type:'y', msg:'Canal e-commerce -17% vs mes anterior' },
  { type:'g', msg:'Ventas YTD +12.3% vs mismo periodo 2024' },
  { type:'g', msg:'43 facturas emitidas · 107.5% de meta' },
];

// Donut chart data
export const DONUT_DATA = [
  { value:39.2, name:'Agrícola',     color:'#547e69' },
  { value:31.9, name:'Veterinario',  color:'#1a1a1a' },
  { value:18.4, name:'Semillas',     color:'#8fb0a0' },
  { value:10.4, name:'Esp. Menores', color:'#b8b8b8' },
];

// Column config — visibility matches screenshot (fac, cli, nofac, fecha, vence, qty, v, nc, costo, mg, abono, pend visible)
export const INV_COLS_CFG = [
  { key:'fac',      label:'ID Factura',  fixed:true,  vis:true,  center:false },
  { key:'cli',      label:'Cliente',     fixed:true,  vis:true,  center:false },
  { key:'nofac',    label:'Nº Factura',  fixed:false, vis:true,  center:false },
  { key:'tipo',     label:'Tipo',        fixed:false, vis:false, center:true  },
  { key:'condpago', label:'Cond. Pago',  fixed:false, vis:false, center:true  },
  { key:'canal',    label:'Canal',       fixed:false, vis:false, center:true  },
  { key:'vend',     label:'Vendedor',    fixed:false, vis:false, center:true  },
  { key:'fecha',    label:'Fecha',       fixed:false, vis:true,  center:true  },
  { key:'vence',    label:'Vencimiento', fixed:false, vis:true,  center:true  },
  { key:'qty',      label:'Cant.',       fixed:false, vis:true,  center:true  },
  { key:'v',        label:'Venta $',     fixed:true,  vis:true,  center:true  },
  { key:'nc',       label:'N.C.',        fixed:false, vis:true,  center:true  },
  { key:'costo',    label:'Costo $',     fixed:false, vis:true,  center:true  },
  { key:'mg',       label:'MG%',         fixed:true,  vis:true,  center:true  },
  { key:'abono',    label:'Abono',       fixed:false, vis:true,  center:true  },
  { key:'pend',     label:'Pendiente',   fixed:false, vis:true,  center:true  },
  { key:'estado',   label:'Estado',      fixed:false, vis:false, center:true  },
];
