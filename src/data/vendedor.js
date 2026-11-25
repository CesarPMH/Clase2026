// ─── Seguimiento Comercial — Vendedor / Sucursal Demo Data ───────────────────

export const VENDEDORES = [
  { id: 'JH', name: 'Juan Hernández' },
  { id: 'JM', name: 'Jorge Miguel' },
  { id: 'ML', name: 'María López' },
  { id: 'CA', name: 'Carlos Arriaga' },
];

export const SUCURSALES = [
  { id: 'GT', name: 'Guatemala Ciudad' },
  { id: 'QZ', name: 'Quetzaltenango' },
  { id: 'ES', name: 'Escuintla' },
  { id: 'PT', name: 'Petén' },
];

// ─── KPIs por vendedor ────────────────────────────────────────────────────────
export const VENDEDOR_KPIS = {
  JH: [
    { lbl:'Ventas Totales',    val:'$284,113', sub:'vs año ant.', meta:'$310,000', metaLbl:'Meta anual',  pct:91.6, badge:'91.6% de meta', badgeDelta:'+8.2%', badgeUp:true,  yoyPrev:'$262,541', yoyDelta:'+8.2%', yoyUp:true,  accent:'#547e69', icon:'$',  iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Ticket Promedio',   val:'$31,568',  sub:'vs año ant.', meta:'$38,000', metaLbl:'Meta',        pct:83.1, badge:'83.1% de meta', badgeDelta:'+2.1%', badgeUp:true,  yoyPrev:'$30,916', yoyDelta:'+2.1%', yoyUp:true,  accent:'#547e69', icon:'≈',  iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Cumpl. Meta',       val:'91.6%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:91.6, badge:'8.4% restante',  badgeDelta:'+3pp',  badgeUp:true,  yoyPrev:'88.6%',   yoyDelta:'+3pp', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cuentas por Cobrar',val:'$67,300',  sub:'vs límite',   meta:'$80,000', metaLbl:'Límite CxC',  pct:84.1, badge:'3 facturas venc.', badgeDelta:'+1', badgeUp:false, yoyPrev:'$58,200', yoyDelta:'+15.6%', yoyUp:false, accent:'#d97706', icon:'!',  iconBg:'#fef3c7', iconColor:'#d97706' },
  ],
  JM: [
    { lbl:'Ventas Totales',    val:'$108,521', sub:'vs año ant.', meta:'$140,000', metaLbl:'Meta anual', pct:77.5, badge:'77.5% de meta', badgeDelta:'-4.1%', badgeUp:false, yoyPrev:'$113,200', yoyDelta:'−4.1%', yoyUp:false, accent:'#dc2626', icon:'!',  iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Ticket Promedio',   val:'$24,004',  sub:'vs año ant.', meta:'$32,000', metaLbl:'Meta',        pct:75.0, badge:'75.0% de meta', badgeDelta:'-2.8%', badgeUp:false, yoyPrev:'$24,702', yoyDelta:'−2.8%', yoyUp:false, accent:'#dc2626', icon:'↓',  iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Cumpl. Meta',       val:'77.5%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:77.5, badge:'22.5% restante', badgeDelta:'-5pp',  badgeUp:false, yoyPrev:'82.5%',   yoyDelta:'−5pp', yoyUp:false, accent:'#dc2626', icon:'!',  iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Cuentas por Cobrar',val:'$96,400',  sub:'vs límite',   meta:'$80,000', metaLbl:'Límite CxC',  pct:120, badge:'5 facturas venc.', badgeDelta:'+2',  badgeUp:false, yoyPrev:'$71,000', yoyDelta:'+35.8%', yoyUp:false, accent:'#dc2626', icon:'!',  iconBg:'#fee2e2', iconColor:'#dc2626' },
  ],
  ML: [
    { lbl:'Ventas Totales',    val:'$178,640', sub:'vs año ant.', meta:'$190,000', metaLbl:'Meta anual', pct:94.0, badge:'94.0% de meta', badgeDelta:'+12.3%', badgeUp:true, yoyPrev:'$159,050', yoyDelta:'+12.3%', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Ticket Promedio',   val:'$33,082',  sub:'vs año ant.', meta:'$36,000', metaLbl:'Meta',        pct:91.9, badge:'91.9% de meta', badgeDelta:'+7.2%', badgeUp:true,  yoyPrev:'$30,860', yoyDelta:'+7.2%', yoyUp:true,  accent:'#547e69', icon:'↑',  iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Cumpl. Meta',       val:'94.0%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:94.0, badge:'6.0% restante',  badgeDelta:'+8pp',  badgeUp:true,  yoyPrev:'86.0%',   yoyDelta:'+8pp', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cuentas por Cobrar',val:'$38,900',  sub:'vs límite',   meta:'$70,000', metaLbl:'Límite CxC',  pct:55.6, badge:'1 factura venc.', badgeDelta:'−1',  badgeUp:true,  yoyPrev:'$44,200', yoyDelta:'−12%', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
  ],
  CA: [
    { lbl:'Ventas Totales',    val:'$214,800', sub:'vs año ant.', meta:'$220,000', metaLbl:'Meta anual', pct:97.6, badge:'97.6% de meta', badgeDelta:'+18.4%', badgeUp:true, yoyPrev:'$181,400', yoyDelta:'+18.4%', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Ticket Promedio',   val:'$35,800',  sub:'vs año ant.', meta:'$38,000', metaLbl:'Meta',        pct:94.2, badge:'94.2% de meta', badgeDelta:'+11%',  badgeUp:true,  yoyPrev:'$32,250', yoyDelta:'+11%', yoyUp:true,  accent:'#16a34a', icon:'↑',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cumpl. Meta',       val:'97.6%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:97.6, badge:'2.4% restante',  badgeDelta:'+14pp', badgeUp:true,  yoyPrev:'83.6%',   yoyDelta:'+14pp', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cuentas por Cobrar',val:'$52,100',  sub:'vs límite',   meta:'$75,000', metaLbl:'Límite CxC',  pct:69.5, badge:'0 facturas venc.', badgeDelta:'0',  badgeUp:true,  yoyPrev:'$48,600', yoyDelta:'+7.2%', yoyUp:true,  accent:'#16a34a', icon:'✓',  iconBg:'#dcfce7', iconColor:'#16a34a' },
  ],
};

// ─── Ventas por Período (mensual y trimestral) ────────────────────────────────
export const PERIODO_DATA = {
  JH: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      ventas:  [21400,18900,26800,24100,22600,25900,28400,27100,23800,26200,29400,32500],
      meta:    [25000,25000,25000,26000,26000,26000,27000,27000,27000,28000,28000,28000],
      ant:     [19200,17100,23400,21800,20500,23200,25600,24200,21100,23900,26400,29100],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      ventas: [67100, 72600, 79300, null],
      meta:   [75000, 78000, 81000, 84000],
      ant:    [59700, 65500, 70800, 80000],
    },
  },
  JM: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      ventas:  [8900, 7600, 10200, 9400, 8100, 9800, 11200, 9100, 8400, 9600, 10800, 12400],
      meta:    [11000,11000,11000,12000,12000,12000,12500,12500,12500,13000,13000,13000],
      ant:     [9800, 8400, 11100, 10200, 8900, 10600, 12100, 9900, 9100, 10400, 11600, 13100],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      ventas: [26700, 27300, 28700, null],
      meta:   [33000, 36000, 37500, 39000],
      ant:    [29300, 29700, 31100, 35100],
    },
  },
  ML: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      ventas:  [13200,11800,16400,15100,13900,16800,18500,17200,14800,16400,19200,22400],
      meta:    [15000,15000,15000,16000,16000,16000,17000,17000,17000,17500,17500,17500],
      ant:     [11400,10200,14200,13100,12100,14600,16200,15000,12800,14300,16800,19100],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      ventas: [41400, 45800, 50500, null],
      meta:   [45000, 48000, 51000, 52500],
      ant:    [35800, 39800, 44000, 56800],
    },
  },
  CA: {
    mes: {
      labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
      ventas:  [16800,14900,21200,19400,17800,21600,23800,22100,18900,21400,24600,28400],
      meta:    [17000,17000,17000,18000,18000,18000,19000,19000,19000,20000,20000,20000],
      ant:     [13900,12200,17800,16100,14800,18000,20100,18700,15900,18100,20800,24100],
    },
    trim: {
      labels: ['Q1','Q2','Q3','Q4'],
      ventas: [52900, 58800, 64800, null],
      meta:   [51000, 54000, 57000, 60000],
      ant:    [43900, 48900, 54700, 62200],
    },
  },
};

// ─── Ventas por Cliente (tabla) ───────────────────────────────────────────────
// cxcTotal = cxcVencido + cxcNoVencido
export const CLIENTES_VEND = {
  JH: [
    { id:'DK', name:'Distribuidora K',   seg:'INDUSTRIA', segColor:'#547e69', ventas:142300, ant:124100, delta:+14.7, mgPct:31, pend:22300, cxcVencido:8400,  cxcNoVencido:13900, cxcTotal:22300 },
    { id:'FC', name:'Farma Central',     seg:'FARMA',     segColor:'#4d3f32', ventas:245000, ant:210000, delta:+16.7, mgPct:30, pend:45000, cxcVencido:18200, cxcNoVencido:26800, cxcTotal:45000 },
    { id:'GM', name:'Gloria Mar',        seg:'INDUSTRIA', segColor:'#547e69', ventas:89813,  ant:78841,  delta:+13.9, mgPct:46, pend:0,     cxcVencido:0,     cxcNoVencido:0,     cxcTotal:0     },
    { id:'PN', name:'Pharma Norte',      seg:'FARMA',     segColor:'#4d3f32', ventas:54200,  ant:48900,  delta:+10.8, mgPct:38, pend:12400, cxcVencido:6200,  cxcNoVencido:6200,  cxcTotal:12400 },
    { id:'AG', name:'Agro Global',       seg:'AGRÍCOLA',  segColor:'#16a34a', ventas:38100,  ant:41200,  delta:-7.5,  mgPct:22, pend:8200,  cxcVencido:8200,  cxcNoVencido:0,     cxcTotal:8200  },
  ],
  JM: [
    { id:'JE', name:'Jaine Espí',        seg:'AGRÍCOLA',  segColor:'#16a34a', ventas:1445,   ant:2100,   delta:-31.2, mgPct:16, pend:84000, cxcVencido:56000, cxcNoVencido:28000, cxcTotal:84000 },
    { id:'AS', name:'Agro Soluciones',   seg:'AGRÍCOLA',  segColor:'#16a34a', ventas:34200,  ant:38800,  delta:-11.9, mgPct:30, pend:6200,  cxcVencido:0,     cxcNoVencido:6200,  cxcTotal:6200  },
    { id:'GS', name:'Gobierno S.A.',     seg:'GOBIERNO',  segColor:'#6a6a6a', ventas:41300,  ant:38200,  delta:+8.1,  mgPct:12, pend:18400, cxcVencido:12400, cxcNoVencido:6000,  cxcTotal:18400 },
    { id:'FN', name:'Fertilizantes Nal.',seg:'AGRÍCOLA',  segColor:'#16a34a', ventas:28600,  ant:26200,  delta:+9.2,  mgPct:19, pend:4100,  cxcVencido:0,     cxcNoVencido:4100,  cxcTotal:4100  },
    { id:'CV', name:'Cooperativa Valle', seg:'AGRÍCOLA',  segColor:'#16a34a', ventas:22400,  ant:19800,  delta:+13.1, mgPct:24, pend:0,     cxcVencido:0,     cxcNoVencido:0,     cxcTotal:0     },
  ],
  ML: [
    { id:'TN', name:'Textil Norte',      seg:'COMERCIO',  segColor:'#d97706', ventas:12400,  ant:11200,  delta:+10.7, mgPct:21, pend:2400,  cxcVencido:2400,  cxcNoVencido:0,     cxcTotal:2400  },
    { id:'CB', name:'Christian B.',      seg:'COMERCIO',  segColor:'#d97706', ventas:15800,  ant:14300,  delta:+10.5, mgPct:25, pend:6500,  cxcVencido:0,     cxcNoVencido:6500,  cxcTotal:6500  },
    { id:'MR', name:'Mercado Real',      seg:'COMERCIO',  segColor:'#d97706', ventas:68400,  ant:58200,  delta:+17.5, mgPct:32, pend:14200, cxcVencido:4200,  cxcNoVencido:10000, cxcTotal:14200 },
    { id:'DS', name:'Distribuidora Sur', seg:'COMERCIO',  segColor:'#d97706', ventas:44800,  ant:39100,  delta:+14.6, mgPct:28, pend:9800,  cxcVencido:0,     cxcNoVencido:9800,  cxcTotal:9800  },
    { id:'SC', name:'SuperCentro',       seg:'COMERCIO',  segColor:'#d97706', ventas:37240,  ant:36250,  delta:+2.7,  mgPct:23, pend:6000,  cxcVencido:3000,  cxcNoVencido:3000,  cxcTotal:6000  },
  ],
  CA: [
    { id:'AN', name:'Avícola Nacional',  seg:'AVÍCOLA',   segColor:'#059669', ventas:89200,  ant:74600,  delta:+19.6, mgPct:35, pend:0,     cxcVencido:0,     cxcNoVencido:0,     cxcTotal:0     },
    { id:'PL', name:'Pollo Lindo S.A.',  seg:'AVÍCOLA',   segColor:'#059669', ventas:62400,  ant:51800,  delta:+20.5, mgPct:38, pend:18600, cxcVencido:6600,  cxcNoVencido:12000, cxcTotal:18600 },
    { id:'AI', name:'Avícola Integral',  seg:'AVÍCOLA',   segColor:'#059669', ventas:38100,  ant:31400,  delta:+21.3, mgPct:41, pend:7800,  cxcVencido:0,     cxcNoVencido:7800,  cxcTotal:7800  },
    { id:'GA', name:'Granjas Altiplano', seg:'AVÍCOLA',   segColor:'#059669', ventas:25100,  ant:23600,  delta:+6.4,  mgPct:29, pend:4100,  cxcVencido:4100,  cxcNoVencido:0,     cxcTotal:4100  },
    { id:'VR', name:'Veterinaria Rural', seg:'COMERCIO',  segColor:'#d97706', ventas:18100,  ant:16200,  delta:+11.7, mgPct:22, pend:0,     cxcVencido:0,     cxcNoVencido:0,     cxcTotal:0     },
  ],
};

// ─── Cuentas por Cobrar desglose ──────────────────────────────────────────────
export const CXC_DATA = {
  JH: { total:67300, corriente:28400, dias30:18900, dias60:12600, dias90plus:7400, limite:80000 },
  JM: { total:96400, corriente:24100, dias30:31200, dias60:28400, dias90plus:12700, limite:80000 },
  ML: { total:38900, corriente:22100, dias30:10400, dias60:6400,  dias90plus:0,     limite:70000 },
  CA: { total:52100, corriente:31400, dias30:14200, dias60:6500,  dias90plus:0,     limite:75000 },
};

// ─── Mapa de Calor Categoría × Mes ───────────────────────────────────────────
export const HEATMAP_VEND = {
  // Values in actual $ (formatted as K in the chart label)
  // Each category has its own seasonal peak to create visible contrast
  JH: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Farmacéuticos','Suplementos','Maquinaria','Veterinarios','Limpieza'],
    data: [
      // Farmacéuticos: pico en Ene/Feb y Ago (temporadas vacunación)
      [18400, 22100, 14600, 11200,  9800, 12400, 15800, 24200, 16400],
      // Suplementos: pico en temporada de siembra (Mar-Jun)
      [ 6200,  7800, 14400, 16800, 18200, 12600,  8400,  6000,  4800],
      // Maquinaria: pico en cosecha Jun-Ago
      [ 8600,  6200,  9800, 11400, 16800, 22400, 28600, 24200, 18800],
      // Veterinarios: pico en temporada fría Ene-Feb
      [12400, 14800,  8600,  6200,  4800,  5400,  7200, 10600,  9800],
      // Limpieza: relativamente plano, leve pico Q1
      [ 5600,  5200,  4800,  3400,  2800,  3200,  4600,  5800,  4200],
    ],
  },
  JM: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Fertilizantes','Semillas','Veterinarios','Fumigantes','Herramientas'],
    data: [
      // Fertilizantes: fuerte pico en temporada de siembra Mar-May
      [ 2400,  1800,  4800,  6200,  7600,  5400,  3200,  2600,  2200],
      // Semillas: pico corto en Mar-May
      [ 1200,  1400,  3800,  5200,  4800,  2600,  1800,  1400,  1600],
      // Veterinarios: pico en temporada seca Ene-Feb y Ago
      [ 2800,  3400,  2200,  1800,  1400,  1600,  2600,  3200,  2800],
      // Fumigantes: pico en Mayo-Jun (pre-lluvia)
      [  600,   800,  1400,  2200,  3600,  4200,  2800,  1600,  1200],
      // Herramientas: irregular, repuntes esporádicos
      [ 1800,  1400,  2400,  1600,   800,   600,   800,  1400,  2200],
    ],
  },
  ML: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Limpieza','Empaque','Insumos Gral.','Farmacéuticos','Varios'],
    data: [
      // Limpieza: pico en Feb y Jul-Ago (temporadas de higiene)
      [ 9200, 12400,  8600,  6800,  5400,  7200, 11600, 14800, 10400],
      // Empaque: pico en temporada de cosecha Mar-May
      [ 3800,  4200,  6800,  8400,  7600,  5200,  4600,  3800,  4200],
      // Insumos Gral.: estable con leve crecimiento
      [ 4800,  4200,  5600,  6400,  5800,  4600,  3800,  4200,  5200],
      // Farmacéuticos: pico en Jun-Ago
      [ 1800,  2400,  1600,  1200,  1800,  3200,  4600,  3800,  2400],
      // Varios: patrón irregular
      [ 2400,  1800,  1400,  2800,  3600,  2200,  1600,  2400,  3200],
    ],
  },
  CA: {
    xAxis: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep'],
    yAxis: ['Alimento Aviar','Veterinarios','Vacunas','Equipos','Suplementos'],
    data: [
      // Alimento Aviar: crece sostenido, pico Jul-Ago
      [12400, 10800,  8600,  9200, 12600, 16800, 22400, 24600, 18800],
      // Veterinarios: pico en Ene-Feb y Jul
      [ 8400,  9600,  6200,  4800,  6400,  9800, 12600,  8400,  6800],
      // Vacunas: picos irregulares (campañas)
      [14800,  6200,  4400,  8600, 18400, 12800,  6400, 16200, 10400],
      // Equipos: compras esporádicas
      [ 2200,  1600,  4800,  8400,  3600,  1800,  2400,  3600,  6200],
      // Suplementos: variado
      [ 4200,  5800,  7400,  4600,  3200,  4800,  7600,  5400,  3800],
    ],
  },
};

// ─── Detalle de Ventas ────────────────────────────────────────────────────────
// cols: id, nofac, fecha, cli, qty, v, nc (null|negative), costo, mgPct, venc, abono, pend
// estado derived: pend===0 → 'Pagado', else → 'Pendiente'
export const DET_ROWS_VEND = {
  JH: [
    { id:'FV-2025-0043', nofac:'001-001-0000043', fecha:'2025-07-25', cli:'Bom Bom Agro S.A.',    qty:38, v:12450, nc:null,  costo:9430,  mgPct:24.3, venc:'2025-08-24', abono:12450, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0042', nofac:'001-001-0000042', fecha:'2025-07-24', cli:'AgroVerde Ltda.',       qty:24, v:8920,  nc:null,  costo:6440,  mgPct:27.8, venc:'2025-08-23', abono:8920,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0041', nofac:'001-001-0000041', fecha:'2025-07-24', cli:'Veterinaria El Campo',  qty:51, v:15300, nc:-2295, costo:10530, mgPct:31.2, venc:'2025-09-22', abono:7650,  pend:7650, estado:'Pendiente' },
    { id:'FV-2025-0040', nofac:'001-001-0000040', fecha:'2025-07-23', cli:'Semillas del Sur S.A.', qty:18, v:6780,  nc:null,  costo:5500,  mgPct:18.9, venc:'2025-07-23', abono:6780,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0039', nofac:'001-001-0000039', fecha:'2025-07-23', cli:'Campo Fertil S.A.',     qty:31, v:9340,  nc:null,  costo:6960,  mgPct:25.4, venc:'2025-08-22', abono:4000,  pend:5340, estado:'Pendiente' },
    { id:'FV-2025-0038', nofac:'001-001-0000038', fecha:'2025-07-22', cli:'Agro Norte S.R.L.',     qty:14, v:4210,  nc:null,  costo:3360,  mgPct:20.2, venc:'2025-08-21', abono:0,     pend:4210, estado:'Pendiente' },
    { id:'FV-2025-0037', nofac:'001-001-0000037', fecha:'2025-07-22', cli:'Bom Bom Agro S.A.',    qty:62, v:18760, nc:-2295, costo:14510, mgPct:22.7, venc:'2025-09-20', abono:10000, pend:8760, estado:'Pendiente' },
    { id:'FV-2025-0036', nofac:'001-001-0000036', fecha:'2025-07-21', cli:'AgroVerde Ltda.',       qty:29, v:7640,  nc:null,  costo:5580,  mgPct:26.9, venc:'2025-08-20', abono:7640,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0035', nofac:'001-001-0000035', fecha:'2025-07-20', cli:'Farma Distribuidora',   qty:44, v:11200, nc:null,  costo:8400,  mgPct:25.0, venc:'2025-08-19', abono:11200, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0034', nofac:'001-001-0000034', fecha:'2025-07-19', cli:'Campo Fertil S.A.',     qty:22, v:5980,  nc:null,  costo:4784,  mgPct:20.0, venc:'2025-08-18', abono:0,     pend:5980, estado:'Pendiente' },
  ],
  JM: [
    { id:'FV-2025-0033', nofac:'001-001-0000033', fecha:'2025-07-24', cli:'Cooperativa Valle',     qty:36, v:9400,  nc:null,  costo:7144,  mgPct:24.0, venc:'2025-08-23', abono:9400,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0032', nofac:'001-001-0000032', fecha:'2025-07-22', cli:'Agro Soluciones',       qty:19, v:8200,  nc:null,  costo:6642,  mgPct:19.0, venc:'2025-08-21', abono:8200,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0031', nofac:'001-001-0000031', fecha:'2025-07-20', cli:'Fertilizantes Nal.',    qty:27, v:12800, nc:-960,  costo:10240, mgPct:20.0, venc:'2025-08-19', abono:6000,  pend:6800, estado:'Pendiente' },
    { id:'FV-2025-0030', nofac:'001-001-0000030', fecha:'2025-07-18', cli:'Jaine Espí',            qty:11, v:4200,  nc:null,  costo:3528,  mgPct:16.0, venc:'2025-08-17', abono:4200,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0029', nofac:'001-001-0000029', fecha:'2025-07-16', cli:'Cooperativa Valle',     qty:43, v:7600,  nc:null,  costo:6156,  mgPct:19.0, venc:'2025-08-15', abono:0,     pend:7600, estado:'Pendiente' },
  ],
  ML: [
    { id:'FV-2025-0028', nofac:'001-001-0000028', fecha:'2025-07-25', cli:'Mercado Real',          qty:52, v:18400, nc:null,  costo:12512, mgPct:32.0, venc:'2025-08-24', abono:18400, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0027', nofac:'001-001-0000027', fecha:'2025-07-23', cli:'Distribuidora Sur',     qty:38, v:14200, nc:null,  costo:10224, mgPct:28.0, venc:'2025-08-22', abono:14200, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0026', nofac:'001-001-0000026', fecha:'2025-07-21', cli:'SuperCentro',           qty:45, v:12600, nc:-1260, costo:9702,  mgPct:23.0, venc:'2025-08-20', abono:5000,  pend:7600, estado:'Pendiente' },
    { id:'FV-2025-0025', nofac:'001-001-0000025', fecha:'2025-07-19', cli:'Textil Norte',          qty:16, v:6800,  nc:null,  costo:5372,  mgPct:21.0, venc:'2025-08-18', abono:0,     pend:6800, estado:'Pendiente' },
    { id:'FV-2025-0024', nofac:'001-001-0000024', fecha:'2025-07-17', cli:'Christian B.',          qty:28, v:8400,  nc:null,  costo:6300,  mgPct:25.0, venc:'2025-08-16', abono:8400,  pend:0,    estado:'Pagado'    },
  ],
  CA: [
    { id:'FV-2025-0023', nofac:'001-001-0000023', fecha:'2025-07-24', cli:'Avícola Nacional',      qty:48, v:24600, nc:null,  costo:15990, mgPct:35.0, venc:'2025-08-23', abono:24600, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0022', nofac:'001-001-0000022', fecha:'2025-07-22', cli:'Pollo Lindo S.A.',      qty:34, v:18400, nc:null,  costo:11960, mgPct:35.0, venc:'2025-08-21', abono:18400, pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0021', nofac:'001-001-0000021', fecha:'2025-07-20', cli:'Avícola Integral',      qty:39, v:14200, nc:-1420, costo:8378,  mgPct:41.0, venc:'2025-08-19', abono:6000,  pend:8200, estado:'Pendiente' },
    { id:'FV-2025-0020', nofac:'001-001-0000020', fecha:'2025-07-18', cli:'Granjas Altiplano',     qty:21, v:9800,  nc:null,  costo:6958,  mgPct:29.0, venc:'2025-08-17', abono:9800,  pend:0,    estado:'Pagado'    },
    { id:'FV-2025-0019', nofac:'001-001-0000019', fecha:'2025-07-16', cli:'Veterinaria Rural',     qty:18, v:7200,  nc:null,  costo:5616,  mgPct:22.0, venc:'2025-08-15', abono:0,     pend:7200, estado:'Pendiente' },
  ],
};

// ─── Sucursal equivalents (same shape, different slices) ─────────────────────
export const SUCURSAL_KPIS = {
  GT: [
    { lbl:'Ventas Totales',    val:'$412,860', sub:'vs año ant.', meta:'$450,000', metaLbl:'Meta anual', pct:91.7, badge:'91.7% de meta', badgeDelta:'+11.2%', badgeUp:true, yoyPrev:'$371,290', yoyDelta:'+11.2%', yoyUp:true, accent:'#547e69', icon:'$', iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Ticket Promedio',   val:'$34,405',  sub:'vs año ant.', meta:'$40,000', metaLbl:'Meta',        pct:86.0, badge:'86% de meta',  badgeDelta:'+5.2%', badgeUp:true,  yoyPrev:'$32,700', yoyDelta:'+5.2%', yoyUp:true, accent:'#547e69', icon:'≈', iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Cumpl. Meta',       val:'91.7%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:91.7, badge:'8.3% restante', badgeDelta:'+6pp', badgeUp:true,   yoyPrev:'85.7%', yoyDelta:'+6pp', yoyUp:true, accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cuentas por Cobrar',val:'$105,200', sub:'vs límite',   meta:'$130,000', metaLbl:'Límite CxC', pct:80.9, badge:'4 fact. venc.', badgeDelta:'+2', badgeUp:false,    yoyPrev:'$92,400', yoyDelta:'+13.9%', yoyUp:false, accent:'#d97706', icon:'!', iconBg:'#fef3c7', iconColor:'#d97706' },
  ],
  QZ: [
    { lbl:'Ventas Totales',    val:'$184,210', sub:'vs año ant.', meta:'$210,000', metaLbl:'Meta anual', pct:87.7, badge:'87.7% de meta', badgeDelta:'+4.8%', badgeUp:true, yoyPrev:'$175,780', yoyDelta:'+4.8%', yoyUp:true, accent:'#547e69', icon:'$', iconBg:'#e8e8e8', iconColor:'#547e69' },
    { lbl:'Ticket Promedio',   val:'$26,315',  sub:'vs año ant.', meta:'$32,000', metaLbl:'Meta',        pct:82.2, badge:'82.2% de meta', badgeDelta:'+2.1%', badgeUp:true,  yoyPrev:'$25,770', yoyDelta:'+2.1%', yoyUp:true, accent:'#d97706', icon:'△', iconBg:'#fef3c7', iconColor:'#d97706' },
    { lbl:'Cumpl. Meta',       val:'87.7%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:87.7, badge:'12.3% restante', badgeDelta:'+2pp', badgeUp:true,  yoyPrev:'85.7%', yoyDelta:'+2pp', yoyUp:true, accent:'#d97706', icon:'△', iconBg:'#fef3c7', iconColor:'#d97706' },
    { lbl:'Cuentas por Cobrar',val:'$68,400',  sub:'vs límite',   meta:'$90,000', metaLbl:'Límite CxC',  pct:76.0, badge:'2 fact. venc.', badgeDelta:'+1', badgeUp:false,    yoyPrev:'$61,200', yoyDelta:'+11.8%', yoyUp:false, accent:'#547e69', icon:'↑', iconBg:'#e8e8e8', iconColor:'#547e69' },
  ],
  ES: [
    { lbl:'Ventas Totales',    val:'$142,500', sub:'vs año ant.', meta:'$180,000', metaLbl:'Meta anual', pct:79.2, badge:'79.2% de meta', badgeDelta:'-6.1%', badgeUp:false, yoyPrev:'$151,750', yoyDelta:'−6.1%', yoyUp:false, accent:'#dc2626', icon:'!', iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Ticket Promedio',   val:'$23,750',  sub:'vs año ant.', meta:'$30,000', metaLbl:'Meta',        pct:79.2, badge:'79.2% de meta', badgeDelta:'-8.4%', badgeUp:false, yoyPrev:'$25,940', yoyDelta:'−8.4%', yoyUp:false, accent:'#dc2626', icon:'↓', iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Cumpl. Meta',       val:'79.2%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:79.2, badge:'20.8% restante', badgeDelta:'-7pp', badgeUp:false, yoyPrev:'86.2%', yoyDelta:'−7pp', yoyUp:false, accent:'#dc2626', icon:'!', iconBg:'#fee2e2', iconColor:'#dc2626' },
    { lbl:'Cuentas por Cobrar',val:'$88,200',  sub:'vs límite',   meta:'$80,000', metaLbl:'Límite CxC',  pct:110,  badge:'6 fact. venc.', badgeDelta:'+3', badgeUp:false,    yoyPrev:'$64,100', yoyDelta:'+37.6%', yoyUp:false, accent:'#dc2626', icon:'!', iconBg:'#fee2e2', iconColor:'#dc2626' },
  ],
  PT: [
    { lbl:'Ventas Totales',    val:'$96,800',  sub:'vs año ant.', meta:'$110,000', metaLbl:'Meta anual', pct:88.0, badge:'88% de meta',  badgeDelta:'+21.3%', badgeUp:true, yoyPrev:'$79,800', yoyDelta:'+21.3%', yoyUp:true, accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Ticket Promedio',   val:'$32,267',  sub:'vs año ant.', meta:'$36,000', metaLbl:'Meta',        pct:89.6, badge:'89.6% de meta', badgeDelta:'+18.2%', badgeUp:true, yoyPrev:'$27,300', yoyDelta:'+18.2%', yoyUp:true, accent:'#16a34a', icon:'↑', iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cumpl. Meta',       val:'88.0%',    sub:'período actual',meta:'100%', metaLbl:'Meta',         pct:88.0, badge:'12% restante',  badgeDelta:'+9pp', badgeUp:true,  yoyPrev:'79%', yoyDelta:'+9pp', yoyUp:true, accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a' },
    { lbl:'Cuentas por Cobrar',val:'$21,400',  sub:'vs límite',   meta:'$50,000', metaLbl:'Límite CxC',  pct:42.8, badge:'0 fact. venc.', badgeDelta:'0', badgeUp:true,     yoyPrev:'$28,600', yoyDelta:'−25.2%', yoyUp:true, accent:'#16a34a', icon:'✓', iconBg:'#dcfce7', iconColor:'#16a34a' },
  ],
};

// ─── KPIs — new Ventas-style format ──────────────────────────────────────────
export const VEND_KPIS = {
  JH: [
    { id:'ventas', label:'Ventas Totales',     value:'$284,113', accentColor:'#547e69', badgeIcon:'$',  metaLabel:'Meta anual',  meta:'$310,000', pct:91.6, metaDelta:'-$25.9K', metaDeltaUp:false, delta:'+8.2%',  deltaUp:true,  yoy:'vs Año Ant. $262,541' },
    { id:'ticket', label:'Ticket Promedio',    value:'$31,568',  accentColor:'#547e69', badgeIcon:'≈',  metaLabel:'Meta',        meta:'$38,000',  pct:83.1, metaDelta:'-$6.4K',  metaDeltaUp:false, delta:'+2.1%',  deltaUp:true,  yoy:'vs Año Ant. $30,916'  },
    { id:'cumpl',  label:'Cumpl. Meta',        value:'91.6%',    accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Meta',        meta:'100%',     pct:91.6, metaDelta:'-8.4pp',  metaDeltaUp:false, delta:'+3pp',   deltaUp:true,  yoy:'vs Año Ant. 88.6%'    },
    { id:'cxc',    label:'Cuentas por Cobrar', value:'$67,300',  accentColor:'#d97706', badgeIcon:'!',  metaLabel:'Límite CxC',  meta:'$80,000',  pct:84.1, metaDelta:'+$12.7K', metaDeltaUp:true,  delta:'+15.6%', deltaUp:false, yoy:'vs Mes Ant. $58,200'  },
  ],
  JM: [
    { id:'ventas', label:'Ventas Totales',     value:'$108,521', accentColor:'#dc2626', badgeIcon:'!',  metaLabel:'Meta anual',  meta:'$140,000', pct:77.5, metaDelta:'-$31.5K', metaDeltaUp:false, delta:'-4.1%',  deltaUp:false, yoy:'vs Año Ant. $113,200' },
    { id:'ticket', label:'Ticket Promedio',    value:'$24,004',  accentColor:'#dc2626', badgeIcon:'↓',  metaLabel:'Meta',        meta:'$32,000',  pct:75.0, metaDelta:'-$8K',    metaDeltaUp:false, delta:'-2.8%',  deltaUp:false, yoy:'vs Año Ant. $24,702'  },
    { id:'cumpl',  label:'Cumpl. Meta',        value:'77.5%',    accentColor:'#dc2626', badgeIcon:'!',  metaLabel:'Meta',        meta:'100%',     pct:77.5, metaDelta:'-22.5pp', metaDeltaUp:false, delta:'-5pp',   deltaUp:false, yoy:'vs Año Ant. 82.5%'    },
    { id:'cxc',    label:'Cuentas por Cobrar', value:'$96,400',  accentColor:'#dc2626', badgeIcon:'!',  metaLabel:'Límite CxC',  meta:'$80,000',  pct:100,  metaDelta:'+$16.4K', metaDeltaUp:false, delta:'+35.8%', deltaUp:false, yoy:'vs Mes Ant. $71,000'  },
  ],
  ML: [
    { id:'ventas', label:'Ventas Totales',     value:'$178,640', accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Meta anual',  meta:'$190,000', pct:94.0, metaDelta:'-$11.4K', metaDeltaUp:false, delta:'+12.3%', deltaUp:true,  yoy:'vs Año Ant. $159,050' },
    { id:'ticket', label:'Ticket Promedio',    value:'$33,082',  accentColor:'#547e69', badgeIcon:'↑',  metaLabel:'Meta',        meta:'$36,000',  pct:91.9, metaDelta:'-$2.9K',  metaDeltaUp:false, delta:'+7.2%',  deltaUp:true,  yoy:'vs Año Ant. $30,860'  },
    { id:'cumpl',  label:'Cumpl. Meta',        value:'94.0%',    accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Meta',        meta:'100%',     pct:94.0, metaDelta:'-6pp',    metaDeltaUp:false, delta:'+8pp',   deltaUp:true,  yoy:'vs Año Ant. 86.0%'    },
    { id:'cxc',    label:'Cuentas por Cobrar', value:'$38,900',  accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Límite CxC',  meta:'$70,000',  pct:55.6, metaDelta:'+$31.1K', metaDeltaUp:true,  delta:'-12%',   deltaUp:true,  yoy:'vs Mes Ant. $44,200'  },
  ],
  CA: [
    { id:'ventas', label:'Ventas Totales',     value:'$214,800', accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Meta anual',  meta:'$220,000', pct:97.6, metaDelta:'-$5.2K',  metaDeltaUp:false, delta:'+18.4%', deltaUp:true,  yoy:'vs Año Ant. $181,400' },
    { id:'ticket', label:'Ticket Promedio',    value:'$35,800',  accentColor:'#16a34a', badgeIcon:'↑',  metaLabel:'Meta',        meta:'$38,000',  pct:94.2, metaDelta:'-$2.2K',  metaDeltaUp:false, delta:'+11%',   deltaUp:true,  yoy:'vs Año Ant. $32,250'  },
    { id:'cumpl',  label:'Cumpl. Meta',        value:'97.6%',    accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Meta',        meta:'100%',     pct:97.6, metaDelta:'-2.4pp',  metaDeltaUp:false, delta:'+14pp',  deltaUp:true,  yoy:'vs Año Ant. 83.6%'    },
    { id:'cxc',    label:'Cuentas por Cobrar', value:'$52,100',  accentColor:'#16a34a', badgeIcon:'✓',  metaLabel:'Límite CxC',  meta:'$75,000',  pct:69.5, metaDelta:'+$22.9K', metaDeltaUp:true,  delta:'+7.2%',  deltaUp:false, yoy:'vs Mes Ant. $48,600'  },
  ],
};

// ─── Histórico — split: general / categoria / clientes ───────────────────────
export const HIST_DATA = {
  JH: {
    general: {
      mes:  { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'2024', data:[19200,17100,23400,21800,20500,23200,25600,24200,21100,23900,26400,29100], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[21400,18900,26800,24100,22600,25900,28400,27100,23800,26200,29400,32500], color:'#547e69' }], budget:[25000,25000,25000,26000,26000,26000,27000,27000,27000,28000,28000,28000] },
      trim: { labels:['Q1','Q2','Q3','Q4'], datasets:[{ label:'2024', data:[59700,65500,70800,80000], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[67100,72600,79300,null], color:'#547e69' }], budget:[75000,78000,81000,84000] },
      semana: { labels:['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15','S16'], datasets:[{ label:'2024', data:[4700,4300,5600,5300,4600,5100,5500,5200,4900,5100,5700,6100,4900,5500,6500,7000], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[5200,4800,6200,5900,5100,5600,6100,5800,5400,5700,6300,6800,5500,6100,7200,7800], color:'#547e69' }], budget:[5800,5800,5800,6000,6000,6000,6000,6200,6200,6200,6500,6500,6500,6500,6500,6500] },
    },
    categoria: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Agrícola', data:[8560,7560,10720,9640,9040,10360,11360,10840,9520,10480,11760,13000], color:'#547e69' },{ label:'Veterinario', data:[6420,5670,8040,7230,6780,7770,8520,8130,7140,7860,8820,9750], color:'#1a1a1a' },{ label:'Semillas', data:[4280,3780,5360,4820,4520,5180,5680,5420,4760,5240,5880,6500], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[2140,1890,2680,2410,2260,2590,2840,2710,2380,2620,2940,3250], color:'rgba(26,26,26,.3)' }], budget:null },
    },
    clientes: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Farma Central', data:[7490,6615,9380,8435,7910,9065,9940,9485,8330,9170,10290,11375], color:'#547e69' },{ label:'Distribuidora K', data:[5350,4725,6700,6025,5650,6475,7100,6775,5950,6550,7350,8125], color:'#1a1a1a' },{ label:'Gloria Mar', data:[3852,3402,4828,4351,4077,4672,5132,4882,4284,4726,5310,5850], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[4708,4158,5892,5289,4963,5688,6228,5963,5236,5754,6460,7150], color:'rgba(26,26,26,.3)' }], budget:null },
    },
  },
  JM: {
    general: {
      mes:  { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'2024', data:[9800,8400,11100,10200,8900,10600,12100,9900,9100,10400,11600,13100], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[8900,7600,10200,9400,8100,9800,11200,9100,8400,9600,10800,12400], color:'#547e69' }], budget:[11000,11000,11000,12000,12000,12000,12500,12500,12500,13000,13000,13000] },
      trim: { labels:['Q1','Q2','Q3','Q4'], datasets:[{ label:'2024', data:[29300,29700,31100,35100], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[26700,27300,28700,null], color:'#547e69' }], budget:[33000,36000,37500,39000] },
      semana: { labels:['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15','S16'], datasets:[{ label:'2024', data:[2400,2100,2700,2500,2200,2600,2900,2400,2200,2500,2800,3100,2300,2700,3000,3400], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[2200,1900,2500,2300,2000,2400,2700,2200,2000,2300,2600,2900,2100,2400,2800,3100], color:'#547e69' }], budget:[2600,2600,2600,2800,2800,2800,2900,2900,2900,3000,3000,3000,3000,3000,3000,3000] },
    },
    categoria: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Agrícola', data:[3560,3040,4080,3760,3240,3920,4480,3640,3360,3840,4320,4960], color:'#547e69' },{ label:'Veterinario', data:[2670,2280,3060,2820,2430,2940,3360,2730,2520,2880,3240,3720], color:'#1a1a1a' },{ label:'Semillas', data:[1780,1520,2040,1880,1620,1960,2240,1820,1680,1920,2160,2480], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[890,760,1020,940,810,980,1120,910,840,960,1080,1240], color:'rgba(26,26,26,.3)' }], budget:null },
    },
    clientes: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Agro Soluciones', data:[3115,2660,3570,3290,2835,3430,3920,3185,2940,3360,3780,4340], color:'#547e69' },{ label:'Gobierno S.A.', data:[2225,1900,2550,2350,2025,2450,2800,2275,2100,2400,2700,3100], color:'#1a1a1a' },{ label:'Coop. Valle', data:[1780,1520,2040,1880,1620,1960,2240,1820,1680,1920,2160,2480], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[1780,1520,2040,1880,1620,1960,2240,1820,1680,1920,2160,2480], color:'rgba(26,26,26,.3)' }], budget:null },
    },
  },
  ML: {
    general: {
      mes:  { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'2024', data:[11400,10200,14200,13100,12100,14600,16200,15000,12800,14300,16800,19100], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[13200,11800,16400,15100,13900,16800,18500,17200,14800,16400,19200,22400], color:'#547e69' }], budget:[15000,15000,15000,16000,16000,16000,17000,17000,17000,17500,17500,17500] },
      trim: { labels:['Q1','Q2','Q3','Q4'], datasets:[{ label:'2024', data:[35900,39800,44100,51200], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[41400,45800,50500,null], color:'#547e69' }], budget:[45000,48000,51000,52500] },
      semana: { labels:['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15','S16'], datasets:[{ label:'2024', data:[2900,2600,3600,3400,3100,3700,4100,3800,3200,3600,4200,4800,3700,4100,4800,5400], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[3300,2900,3900,3700,3400,4100,4500,4200,3600,4000,4700,5100,3700,4200,4900,5500], color:'#547e69' }], budget:[3600,3600,3600,3800,3800,3800,4000,4000,4000,4100,4100,4100,4100,4100,4100,4100] },
    },
    categoria: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Agrícola', data:[5280,4720,6560,6040,5560,6720,7400,6880,5920,6560,7680,8960], color:'#547e69' },{ label:'Veterinario', data:[3960,3540,4920,4530,4170,5040,5550,5160,4440,4920,5760,6720], color:'#1a1a1a' },{ label:'Semillas', data:[2640,2360,3280,3020,2780,3360,3700,3440,2960,3280,3840,4480], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[1320,1180,1640,1510,1390,1680,1850,1720,1480,1640,1920,2240], color:'rgba(26,26,26,.3)' }], budget:null },
    },
    clientes: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Mercado Real', data:[4620,4130,5740,5285,4865,5880,6475,6020,5180,5740,6720,7840], color:'#547e69' },{ label:'Distrib. Sur', data:[3300,2950,4100,3775,3475,4200,4625,4300,3700,4100,4800,5600], color:'#1a1a1a' },{ label:'SuperCentro', data:[2640,2360,3280,3020,2780,3360,3700,3440,2960,3280,3840,4480], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[2640,2360,3280,3020,2780,3360,3700,3440,2960,3280,3840,4480], color:'rgba(26,26,26,.3)' }], budget:null },
    },
  },
  CA: {
    general: {
      mes:  { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'2024', data:[13900,12300,17200,15800,14600,17500,19400,18100,15600,17200,20200,22900], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[16800,14900,21200,19400,17800,21600,23800,22100,18900,21400,24600,28400], color:'#547e69' }], budget:[17000,17000,17000,18000,18000,18000,19000,19000,19000,20000,20000,20000] },
      trim: { labels:['Q1','Q2','Q3','Q4'], datasets:[{ label:'2024', data:[43400,47900,53100,62300], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[52900,58800,64800,null], color:'#547e69' }], budget:[51000,54000,57000,60000] },
      semana: { labels:['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15','S16'], datasets:[{ label:'2024', data:[3500,3100,4300,3900,3700,4400,4900,4500,3900,4300,5100,5800,4600,5300,6100,7000], color:'rgba(26,26,26,.22)' },{ label:'2025', data:[4200,3700,5000,4700,4300,5200,5800,5400,4600,5100,6000,6500,4700,5400,6200,7100], color:'#547e69' }], budget:[4200,4200,4200,4400,4400,4400,4600,4600,4600,4800,4800,4800,4800,4800,4800,4800] },
    },
    categoria: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Agrícola', data:[6720,5960,8480,7760,7120,8640,9520,8840,7560,8560,9840,11360], color:'#547e69' },{ label:'Veterinario', data:[5040,4470,6360,5820,5340,6480,7140,6630,5670,6420,7380,8520], color:'#1a1a1a' },{ label:'Semillas', data:[3360,2980,4240,3880,3560,4320,4760,4420,3780,4280,4920,5680], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[1680,1490,2120,1940,1780,2160,2380,2210,1890,2140,2460,2840], color:'rgba(26,26,26,.3)' }], budget:null },
    },
    clientes: {
      mes: { labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], datasets:[{ label:'Avícola Nac.', data:[5880,5215,7420,6790,6230,7560,8330,7735,6615,7490,8610,9940], color:'#547e69' },{ label:'Pollo Lindo', data:[4200,3725,5300,4850,4450,5400,5950,5525,4725,5350,6150,7100], color:'#1a1a1a' },{ label:'Avícola Intgr', data:[3360,2980,4240,3880,3560,4320,4760,4420,3780,4280,4920,5680], color:'rgba(84,126,105,.5)' },{ label:'Otros', data:[3360,2980,4240,3880,3560,4320,4760,4420,3780,4280,4920,5680], color:'rgba(26,26,26,.3)' }], budget:null },
    },
  },
};

// ─── Alertas por vendedor ─────────────────────────────────────────────────────
export const VEND_ALERTS = {
  JH: [
    { type:'r', msg:'Meta al 91.6% — pendientes $25,887 para cierre de período' },
    { type:'r', msg:'Ticket promedio $31,568 — 16.9% bajo meta mensual ($38,000)' },
    { type:'y', msg:'CxC $67,300 — 84.1% del límite. Revisar vencimientos próximos.' },
    { type:'y', msg:'3 clientes sin compra en los últimos 15 días' },
    { type:'g', msg:'Crecimiento YoY +8.2% — tendencia positiva sostenida' },
    { type:'g', msg:'Categoría Agrícola creció +12% vs mismo período 2024' },
  ],
  JM: [
    { type:'r', msg:'Meta al 77.5% — riesgo alto. Requiere cierre urgente de oportunidades.' },
    { type:'r', msg:'CxC $96,400 supera límite de $80,000 — acción inmediata requerida' },
    { type:'r', msg:'5 facturas vencidas pendientes de cobro' },
    { type:'y', msg:'Ticket promedio cayó 2.8% vs año anterior — revisar estrategia' },
    { type:'y', msg:'Ventas Totales -4.1% vs año anterior' },
    { type:'g', msg:'Cooperativa Valle: nuevo cliente activo con buen potencial' },
  ],
  ML: [
    { type:'r', msg:'Cumplimiento al 94% — $11,360 restantes para alcanzar meta' },
    { type:'y', msg:'Ticket promedio al 91.9% de meta — revisar mix de productos' },
    { type:'y', msg:'1 factura vencida — enviar recordatorio de cobro' },
    { type:'g', msg:'Crecimiento YoY +12.3% — mejor desempeño del trimestre' },
    { type:'g', msg:'CxC saludable: $38,900 — bien por debajo del límite' },
    { type:'g', msg:'Mercado Real: +17.5% vs año anterior — relación en expansión' },
  ],
  CA: [
    { type:'y', msg:'Meta al 97.6% — $5,200 para alcanzar objetivo mensual' },
    { type:'y', msg:'Ticket promedio al 94.2% de meta — oportunidad de mejora' },
    { type:'g', msg:'Crecimiento YoY +18.4% — mejor vendedor del período' },
    { type:'g', msg:'CxC $52,100 — 69.5% del límite, posición saludable' },
    { type:'g', msg:'0 facturas vencidas — gestión de cobro excelente' },
    { type:'g', msg:'Avícola Nacional +19.6% y Pollo Lindo +20.5% vs año anterior' },
  ],
};

// ─── Ventas por Categoría ─────────────────────────────────────────────────────
// skus=total SKUs, lowStockQ=SKUs below min, rotacion=days inventory, valorStock=$
export const VENTAS_CAT_VEND = {
  JH: [
    { nombre:'Farmacéuticos', ventas:142300, ant:118500, delta:20.1, mg:30, pend:22300, skus:42, skusAnt:38, lowStockQ:5, rotacion:28, valorStock:124000 },
    { nombre:'Maquinaria',    ventas:89813,  ant:78841,  delta:13.9, mg:31, pend:0,     skus:31, skusAnt:29, lowStockQ:2, rotacion:45, valorStock:286000 },
    { nombre:'Suplementos',   ventas:32800,  ant:28200,  delta:16.3, mg:24, pend:8200,  skus:18, skusAnt:16, lowStockQ:4, rotacion:22, valorStock:68000  },
    { nombre:'Veterinarios',  ventas:16800,  ant:14100,  delta:19.1, mg:38, pend:12400, skus:16, skusAnt:14, lowStockQ:3, rotacion:18, valorStock:42000  },
    { nombre:'Limpieza',      ventas:2400,   ant:2300,   delta:4.3,  mg:22, pend:0,     skus:15, skusAnt:15, lowStockQ:4, rotacion:35, valorStock:28000  },
  ],
  JM: [
    { nombre:'Fertilizantes', ventas:45600, ant:48200, delta:-5.4,  mg:19, pend:22600, skus:22, skusAnt:24, lowStockQ:6, rotacion:38, valorStock:82000  },
    { nombre:'Semillas',      ventas:29800, ant:31200, delta:-4.5,  mg:24, pend:6200,  skus:16, skusAnt:18, lowStockQ:2, rotacion:26, valorStock:48000  },
    { nombre:'Veterinarios',  ventas:18400, ant:16200, delta:13.6,  mg:30, pend:0,     skus:12, skusAnt:10, lowStockQ:1, rotacion:20, valorStock:31000  },
    { nombre:'Fumigantes',    ventas:9800,  ant:10400, delta:-5.8,  mg:18, pend:0,     skus:10, skusAnt:11, lowStockQ:3, rotacion:42, valorStock:24000  },
    { nombre:'Herramientas',  ventas:4921,  ant:7200,  delta:-31.7, mg:16, pend:4100,  skus:18, skusAnt:20, lowStockQ:7, rotacion:68, valorStock:19000  },
  ],
  ML: [
    { nombre:'Limpieza',      ventas:68400, ant:58200, delta:17.5, mg:32, pend:14200, skus:28, skusAnt:26, lowStockQ:2, rotacion:18, valorStock:96000  },
    { nombre:'Empaque',       ventas:44800, ant:39100, delta:14.6, mg:28, pend:9800,  skus:22, skusAnt:20, lowStockQ:1, rotacion:22, valorStock:74000  },
    { nombre:'Insumos Gral.', ventas:37240, ant:36250, delta:2.7,  mg:23, pend:6000,  skus:19, skusAnt:19, lowStockQ:3, rotacion:30, valorStock:58000  },
    { nombre:'Farmacéuticos', ventas:18400, ant:16200, delta:13.6, mg:21, pend:2400,  skus:14, skusAnt:12, lowStockQ:3, rotacion:25, valorStock:38000  },
    { nombre:'Varios',        ventas:9800,  ant:9300,  delta:5.4,  mg:18, pend:0,     skus:9,  skusAnt:8,  lowStockQ:2, rotacion:40, valorStock:21000  },
  ],
  CA: [
    { nombre:'Alimento Aviar',ventas:89200, ant:74600, delta:19.6, mg:35, pend:0,     skus:12, skusAnt:10, lowStockQ:0, rotacion:15, valorStock:148000 },
    { nombre:'Vacunas',       ventas:62400, ant:51800, delta:20.5, mg:35, pend:18600, skus:24, skusAnt:22, lowStockQ:4, rotacion:20, valorStock:86000  },
    { nombre:'Veterinarios',  ventas:38100, ant:31400, delta:21.3, mg:38, pend:0,     skus:18, skusAnt:16, lowStockQ:2, rotacion:22, valorStock:62000  },
    { nombre:'Suplementos',   ventas:25100, ant:23600, delta:6.4,  mg:29, pend:0,     skus:14, skusAnt:13, lowStockQ:1, rotacion:28, valorStock:44000  },
    { nombre:'Equipos',       ventas:0,     ant:0,     delta:0,    mg:0,  pend:0,     skus:6,  skusAnt:6,  lowStockQ:2, rotacion:90, valorStock:12000  },
  ],
};

// ─── Ventas por Producto ──────────────────────────────────────────────────────
// stockStatus: 'Normal'|'Bajo'|'Crítico', rotacion=days inventory, valorStock=$
export const VENTAS_PROD_VEND = {
  JH: [
    { nombre:'AGROVIT PLUS 1L',  cat:'Farmacéuticos', ventas:84200, ant:72100, delta:16.8, mg:24, pend:12000, stockStatus:'Normal',   rotacion:14, valorStock:18400,  cantStock:48  },
    { nombre:'MAQUINA X500',     cat:'Maquinaria',    ventas:62800, ant:55400, delta:13.4, mg:31, pend:0,     stockStatus:'Normal',   rotacion:62, valorStock:124000, cantStock:12  },
    { nombre:'VETMEC COMBO',     cat:'Veterinarios',  ventas:48600, ant:39200, delta:24.0, mg:31, pend:6400,  stockStatus:'Bajo',     rotacion:22, valorStock:12800,  cantStock:9   },
    { nombre:'NUTRISEM PRO',     cat:'Suplementos',   ventas:32800, ant:28200, delta:16.3, mg:29, pend:8200,  stockStatus:'Bajo',     rotacion:18, valorStock:8600,   cantStock:10  },
    { nombre:'CALCIVIT INY',     cat:'Farmacéuticos', ventas:32100, ant:29400, delta:9.2,  mg:33, pend:8200,  stockStatus:'Normal',   rotacion:16, valorStock:15200,  cantStock:36  },
    { nombre:'MAQUINA Y200',     cat:'Maquinaria',    ventas:27013, ant:23441, delta:15.2, mg:31, pend:0,     stockStatus:'Crítico',  rotacion:55, valorStock:78000,  cantStock:4   },
  ],
  JM: [
    { nombre:'AGROFER 5KG',      cat:'Fertilizantes', ventas:28400, ant:30200, delta:-6.0,  mg:20, pend:14800, stockStatus:'Crítico', rotacion:32, valorStock:22000,  cantStock:5   },
    { nombre:'SEMVERDE 25KG',    cat:'Semillas',      ventas:18600, ant:19800, delta:-6.1,  mg:26, pend:4100,  stockStatus:'Normal',  rotacion:26, valorStock:16400,  cantStock:24  },
    { nombre:'HERBICIDA X20',    cat:'Fumigantes',    ventas:9800,  ant:10400, delta:-5.8,  mg:18, pend:0,     stockStatus:'Bajo',    rotacion:42, valorStock:8800,   cantStock:14  },
    { nombre:'CALCIVIT INY',     cat:'Veterinarios',  ventas:9600,  ant:8200,  delta:17.1,  mg:32, pend:0,     stockStatus:'Normal',  rotacion:20, valorStock:7400,   cantStock:21  },
    { nombre:'NUTRISEM PRO',     cat:'Semillas',      ventas:11200, ant:11400, delta:-1.8,  mg:22, pend:2100,  stockStatus:'Bajo',    rotacion:28, valorStock:9200,   cantStock:11  },
    { nombre:'AGROFER 10KG',     cat:'Fertilizantes', ventas:17200, ant:18000, delta:-4.4,  mg:18, pend:7800,  stockStatus:'Bajo',    rotacion:38, valorStock:14600,  cantStock:13  },
    { nombre:'PALA ACERO',       cat:'Herramientas',  ventas:4921,  ant:7200,  delta:-31.7, mg:16, pend:4100,  stockStatus:'Crítico', rotacion:68, valorStock:6200,   cantStock:3   },
  ],
  ML: [
    { nombre:'DETERGENT PRO 5L', cat:'Limpieza',      ventas:42800, ant:36400, delta:17.6, mg:34, pend:8200, stockStatus:'Normal',  rotacion:18, valorStock:38200,  cantStock:62  },
    { nombre:'EMPAQUE FLEX 100', cat:'Empaque',       ventas:32400, ant:28200, delta:14.9, mg:30, pend:9800, stockStatus:'Normal',  rotacion:22, valorStock:28400,  cantStock:240 },
    { nombre:'LIMPIAMAX 1L',     cat:'Limpieza',      ventas:25600, ant:21800, delta:17.4, mg:29, pend:6000, stockStatus:'Normal',  rotacion:24, valorStock:22600,  cantStock:54  },
    { nombre:'INSUMO BASE 10',   cat:'Insumos Gral.', ventas:37240, ant:36250, delta:2.7,  mg:23, pend:0,    stockStatus:'Bajo',    rotacion:30, valorStock:32400,  cantStock:18  },
    { nombre:'FARMAVIT C',       cat:'Farmacéuticos', ventas:18400, ant:16200, delta:13.6, mg:21, pend:2400, stockStatus:'Crítico', rotacion:25, valorStock:16800,  cantStock:4   },
    { nombre:'BOLSA PLAST 50',   cat:'Empaque',       ventas:12400, ant:10900, delta:13.8, mg:25, pend:0,    stockStatus:'Normal',  rotacion:20, valorStock:11200,  cantStock:320 },
  ],
  CA: [
    { nombre:'ALIPOL PLUS 25KG', cat:'Alimento Aviar',ventas:54200, ant:44800, delta:21.0, mg:36, pend:0,     stockStatus:'Normal',  rotacion:15, valorStock:62000,  cantStock:38  },
    { nombre:'VACUNA NDV',       cat:'Vacunas',       ventas:42400, ant:34800, delta:21.8, mg:38, pend:8600,  stockStatus:'Bajo',    rotacion:20, valorStock:34800,  cantStock:9   },
    { nombre:'ALIPOL BASE 50KG', cat:'Alimento Aviar',ventas:35000, ant:29800, delta:17.4, mg:33, pend:0,     stockStatus:'Normal',  rotacion:18, valorStock:46000,  cantStock:28  },
    { nombre:'VACUNA IB',        cat:'Vacunas',       ventas:20000, ant:17000, delta:17.6, mg:31, pend:10000, stockStatus:'Crítico', rotacion:22, valorStock:18400,  cantStock:3   },
    { nombre:'VETMEC AVES',      cat:'Veterinarios',  ventas:38100, ant:31400, delta:21.3, mg:38, pend:0,     stockStatus:'Normal',  rotacion:18, valorStock:28600,  cantStock:22  },
    { nombre:'SUPMIX PRO',       cat:'Suplementos',   ventas:25100, ant:23600, delta:6.4,  mg:29, pend:0,     stockStatus:'Bajo',    rotacion:28, valorStock:21400,  cantStock:7   },
  ],
};

// ─── CxC con desglose vencido / vigente ───────────────────────────────────────
// facs = { vte, vcd } invoice counts per range
export const CXC_DATA_V2 = {
  JH: {
    total: 67300, limite: 80000,
    desglose: [
      { lbl: '1–30 días',  vigente: 12000, vencido: 6900,  facs: { vte: 4,  vcd: 2 } },
      { lbl: '31–60 días', vigente: 5000,  vencido: 7600,  facs: { vte: 2,  vcd: 3 } },
      { lbl: '61+ días',   vigente: 0,     vencido: 7400,  facs: { vte: 0,  vcd: 4 } },
    ],
  },
  JM: {
    total: 96400, limite: 80000,
    desglose: [
      { lbl: '1–30 días',  vigente: 5000,  vencido: 26200, facs: { vte: 2,  vcd: 11 } },
      { lbl: '31–60 días', vigente: 3000,  vencido: 25400, facs: { vte: 1,  vcd: 10 } },
      { lbl: '61+ días',   vigente: 0,     vencido: 12700, facs: { vte: 0,  vcd: 6  } },
    ],
  },
  ML: {
    total: 38900, limite: 70000,
    desglose: [
      { lbl: '1–30 días',  vigente: 10400, vencido: 0, facs: { vte: 4, vcd: 0 } },
      { lbl: '31–60 días', vigente: 6400,  vencido: 0, facs: { vte: 2, vcd: 0 } },
      { lbl: '61+ días',   vigente: 0,     vencido: 0, facs: { vte: 0, vcd: 0 } },
    ],
  },
  CA: {
    total: 52100, limite: 75000,
    desglose: [
      { lbl: '1–30 días',  vigente: 14200, vencido: 0, facs: { vte: 5,  vcd: 0 } },
      { lbl: '31–60 días', vigente: 6500,  vencido: 0, facs: { vte: 2,  vcd: 0 } },
      { lbl: '61+ días',   vigente: 0,     vencido: 0, facs: { vte: 0,  vcd: 0 } },
    ],
  },
};
