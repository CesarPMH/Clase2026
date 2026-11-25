export const PROD_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export const CATS = [
  { id:'agricola',   name:'Agrícola',     ingreso:612000, costo:477000, margen:22, pct:39.2, color:'#547e69', sku:28, rotacion:4.2, stock:'Normal',  ingrAnt:558000, margenAnt:20, unidades:2800, unidAnt:2550, stockNorm:68, stockBajo:22, stockCrit:10 },
  { id:'veterinario',name:'Veterinario',  ingreso:498000, costo:358000, margen:28, pct:31.9, color:'#1a1a1a', sku:22, rotacion:5.1, stock:'Normal',  ingrAnt:431000, margenAnt:26, unidades:1800, unidAnt:1620, stockNorm:72, stockBajo:18, stockCrit:10 },
  { id:'semillas',   name:'Semillas',     ingreso:288000, costo:210000, margen:27, pct:18.4, color:'#16a34a', sku:18, rotacion:3.8, stock:'Bajo',    ingrAnt:262000, margenAnt:25, unidades:2200, unidAnt:2000, stockNorm:60, stockBajo:28, stockCrit:12 },
  { id:'especiales', name:'Esp. Menores', ingreso:162000, costo:112000, margen:31, pct:10.4, color:'#b45309', sku:12, rotacion:6.2, stock:'Normal',  ingrAnt:148000, margenAnt:29, unidades:980,  unidAnt:890,  stockNorm:75, stockBajo:15, stockCrit:10 },
];

export const PRODS = [
  { id:'P001', icon:'💊', name:'AGROVIT PLUS 1L',  cat:'Agrícola',    ing:284000, costo:215000, margen:24, stock:'Normal',  unidades:580, unidAnt:532, ingAnt:261000, margenAnt:22, rotacion:4.2, diasStock:28, color:'#547e69', skuCode:'AGR-001', stockQ:245, sucursal:'Bodega Central', sinStockEn:[],                             diasSinStock:0  },
  { id:'P002', icon:'🧴', name:'PILAROUND 500ML',  cat:'Agrícola',    ing:199000, costo:163000, margen:18, stock:'Bajo',    unidades:490, unidAnt:458, ingAnt:187000, margenAnt:16, rotacion:6.1, diasStock:12, color:'#547e69', skuCode:'AGR-002', stockQ:48,  sucursal:'Suc. Norte',     sinStockEn:['Pto. Venta Sur'],             diasSinStock:6  },
  { id:'P003', icon:'💉', name:'VETMEC COMBO',      cat:'Veterinario', ing:157000, costo:108000, margen:31, stock:'Normal',  unidades:310, unidAnt:265, ingAnt:134000, margenAnt:29, rotacion:3.2, diasStock:35, color:'#1a1a1a', skuCode:'VET-001', stockQ:182, sucursal:'Bodega Central', sinStockEn:[],                             diasSinStock:0  },
  { id:'P004', icon:'🌱', name:'NUTRISEM PRO',      cat:'Semillas',    ing:143000, costo:102000, margen:29, stock:'Bajo',    unidades:380, unidAnt:342, ingAnt:129000, margenAnt:27, rotacion:4.8, diasStock:14, color:'#16a34a', skuCode:'SEM-001', stockQ:62,  sucursal:'Suc. Norte',     sinStockEn:['Bodega Central'],             diasSinStock:4  },
  { id:'P005', icon:'💊', name:'BIOMAX TABS',       cat:'Veterinario', ing:119000, costo:92000,  margen:23, stock:'Normal',  unidades:290, unidAnt:248, ingAnt:102000, margenAnt:21, rotacion:5.0, diasStock:22, color:'#1a1a1a', skuCode:'VET-002', stockQ:126, sucursal:'Pto. Venta Sur', sinStockEn:[],                             diasSinStock:0  },
  { id:'P006', icon:'🌾', name:'AGROFER 5KG',       cat:'Agrícola',    ing:97000,  costo:78000,  margen:20, stock:'Normal',  unidades:450, unidAnt:413, ingAnt:89000,  margenAnt:18, rotacion:3.5, diasStock:32, color:'#547e69', skuCode:'AGR-003', stockQ:210, sucursal:'Bodega Central', sinStockEn:[],                             diasSinStock:0  },
  { id:'P007', icon:'💉', name:'CALCIVIT INY',      cat:'Veterinario', ing:84000,  costo:56000,  margen:33, stock:'Normal',  unidades:210, unidAnt:190, ingAnt:76000,  margenAnt:31, rotacion:4.4, diasStock:40, color:'#1a1a1a', skuCode:'VET-003', stockQ:156, sucursal:'Suc. Norte',     sinStockEn:[],                             diasSinStock:0  },
  { id:'P008', icon:'🌿', name:'SEMVERDE 25KG',     cat:'Semillas',    ing:72000,  costo:53000,  margen:26, stock:'Normal',  unidades:320, unidAnt:292, ingAnt:66000,  margenAnt:24, rotacion:3.8, diasStock:30, color:'#16a34a', skuCode:'SEM-002', stockQ:138, sucursal:'Bodega Central', sinStockEn:[],                             diasSinStock:0  },
  { id:'P009', icon:'🧪', name:'HERBICIDA X20',     cat:'Agrícola',    ing:63000,  costo:53000,  margen:15, stock:'Crítico', unidades:220, unidAnt:248, ingAnt:71000,  margenAnt:14, rotacion:7.2, diasStock:5,  color:'#547e69', skuCode:'AGR-004', stockQ:8,   sucursal:'Pto. Venta Sur', sinStockEn:['Suc. Norte','Bodega Central'], diasSinStock:14 },
  { id:'P010', icon:'🩺', name:'VITAVET B12',       cat:'Veterinario', ing:78000,  costo:55000,  margen:29, stock:'Normal',  unidades:180, unidAnt:163, ingAnt:71000,  margenAnt:27, rotacion:4.1, diasStock:38, color:'#1a1a1a', skuCode:'VET-004', stockQ:142, sucursal:'Suc. Norte',     sinStockEn:[],                             diasSinStock:0  },
];

export const PROD_TREND = {
  'Agrícola':    [38,40,48,46,52,54,58,55,60,62,65,70],
  'Veterinario': [31,33,38,36,41,43,46,44,48,50,52,56],
  'Semillas':    [18,19,22,21,24,25,28,26,28,30,32,35],
  'Esp. Menores':[10,11,12,11,13,14,15,13,15,16,17,18],
};

export const RFM_SEGS = [
  { key:'champions',  icon:'⭐', label:'Champions',          cssClass:'seg-champions',  desc:'Alta recencia, frecuencia y valor',            acciones:['Proteger stock','Expandir línea'],   r:[4,5],f:[4,5],m:[4,5] },
  { key:'dormidos',   icon:'😴', label:'Dormidos Valiosos',  cssClass:'seg-dormidos',   desc:'Alto valor histórico, sin compras recientes',  acciones:['Liquidar','Reducir stock'],          r:[1,2],f:[4,5],m:[4,5] },
  { key:'en-peligro', icon:'🚨', label:'En Peligro',         cssClass:'seg-en-peligro', desc:'Perdiendo actividad rápidamente',              acciones:['Investigar','Promocionar'],          r:[2,3],f:[3,4],m:[3,4] },
  { key:'alto-valor', icon:'💎', label:'Alto Valor Ocasional',cssClass:'seg-alto-valor',desc:'Compra poco pero gasta mucho',                 acciones:['Aumentar frecuencia','Retargeting'], r:[3,4],f:[1,2],m:[5,5] },
  { key:'nuevos',     icon:'🆕', label:'Nuevos Potenciales', cssClass:'seg-nuevos',     desc:'Recientes con potencial de crecimiento',       acciones:['Aumentar ticket','Upselling'],       r:[4,5],f:[1,2],m:[2,3] },
  { key:'inicio',     icon:'🌱', label:'Inicio',             cssClass:'seg-inicio',     desc:'Primeras compras, bajo volumen',               acciones:['Monitorear 6 meses','Evaluar'],      r:[3,4],f:[1,2],m:[1,2] },
  { key:'requiere',   icon:'⚠️', label:'Requiere Atención',  cssClass:'seg-requiere',   desc:'Señales mixtas, necesita seguimiento',         acciones:['Promoción','Revisar pricing'],       r:[2,3],f:[2,3],m:[2,3] },
  { key:'perdidos',   icon:'❌', label:'Perdidos',            cssClass:'seg-perdidos',   desc:'Sin actividad, valor histórico bajo',          acciones:['Descatalogar','Liberar espacio'],    r:[1,2],f:[1,2],m:[1,2] },
];

export const RFM_PROD = {
  P001:{ r:5, f:5, m:5, seg:'champions',  dias:5,  frec:89, pct:3.02 },
  P002:{ r:3, f:5, m:4, seg:'en-peligro', dias:12, frec:83, pct:1.25 },
  P003:{ r:4, f:4, m:4, seg:'champions',  dias:35, frec:62, pct:1.05 },
  P004:{ r:3, f:4, m:3, seg:'requiere',   dias:14, frec:48, pct:0.92 },
  P005:{ r:4, f:4, m:3, seg:'inicio',     dias:22, frec:40, pct:0.84 },
  P006:{ r:4, f:4, m:3, seg:'inicio',     dias:32, frec:35, pct:0.79 },
  P007:{ r:4, f:3, m:4, seg:'alto-valor', dias:40, frec:28, pct:0.70 },
  P008:{ r:4, f:3, m:3, seg:'inicio',     dias:30, frec:30, pct:0.62 },
  P009:{ r:2, f:3, m:2, seg:'requiere',   dias:5,  frec:22, pct:0.61 },
  P010:{ r:4, f:3, m:3, seg:'inicio',     dias:38, frec:25, pct:0.50 },
};

export const RFM_CAT_PEERS = {
  'Agrícola':    [
    { name:'VITAFOL 500ML', r:5,f:5,m:4, seg:'champions',  ing:180000 },
    { name:'FERTIMIX 2L',   r:3,f:3,m:3, seg:'requiere',   ing:95000  },
    { name:'AGROPLEX B',    r:2,f:4,m:4, seg:'dormidos',   ing:78000  },
    { name:'NUTRIVERDE',    r:4,f:2,m:3, seg:'inicio',     ing:52000  },
    { name:'TERRAMAX',      r:1,f:2,m:1, seg:'perdidos',   ing:28000  },
  ],
  'Veterinario': [
    { name:'IVERMEC 1%',    r:5,f:5,m:5, seg:'champions',  ing:142000 },
    { name:'BOTROPEN',      r:3,f:5,m:2, seg:'en-peligro', ing:88000  },
    { name:'VITAMIX VET',   r:2,f:3,m:4, seg:'dormidos',   ing:65000  },
    { name:'PROCAN PLUS',   r:4,f:2,m:2, seg:'inicio',     ing:42000  },
  ],
  'Semillas':    [
    { name:'SEMMAX PRO',    r:5,f:5,m:5, seg:'champions',  ing:98000  },
    { name:'AGROSEM 5KG',   r:3,f:4,m:3, seg:'requiere',   ing:62000  },
    { name:'MAIZAL ELITE',  r:2,f:2,m:1, seg:'perdidos',   ing:31000  },
  ],
  'Esp. Menores':[
    { name:'BIOFILM 1L',    r:5,f:4,m:3, seg:'champions',  ing:58000  },
    { name:'MICROMAX',      r:2,f:3,m:2, seg:'requiere',   ing:38000  },
    { name:'FERRATIVO',     r:1,f:2,m:1, seg:'perdidos',   ing:18000  },
  ],
};

export const CLI_DATA = {
  P001:[
    { name:'Bom Bom Agro S.A.',    seg:'Agrícola',   monto:95200, pedidos:18, ult:5  },
    { name:'AgroVerde Ltda.',       seg:'Agrícola',   monto:70400, pedidos:14, ult:12 },
    { name:'Semillas del Sur',      seg:'Semillas',   monto:48600, pedidos:9,  ult:20 },
    { name:'Campo Fertil S.A.',     seg:'Semillas',   monto:42000, pedidos:7,  ult:28 },
    { name:'Veterinaria El Campo',  seg:'Veterinario',monto:21200, pedidos:5,  ult:44 },
    { name:'Otros (14 clientes)',   seg:'—',          monto:6600,  pedidos:36, ult:null },
  ],
  P002:[
    { name:'Campo Fertil S.A.',     seg:'Semillas',   monto:72000, pedidos:28, ult:8  },
    { name:'Bom Bom Agro S.A.',     seg:'Agrícola',   monto:55000, pedidos:21, ult:14 },
    { name:'Agro Norte S.R.L.',     seg:'Agrícola',   monto:38000, pedidos:14, ult:22 },
    { name:'Otros (9 clientes)',    seg:'—',          monto:34000, pedidos:22, ult:null },
  ],
  P003:[
    { name:'Veterinaria El Campo',  seg:'Veterinario',monto:51000, pedidos:14, ult:10 },
    { name:'VetSur Clínica',        seg:'Veterinario',monto:42000, pedidos:11, ult:18 },
    { name:'La Granja S.A.',        seg:'Agrícola',   monto:32000, pedidos:8,  ult:30 },
    { name:'Otros (6 clientes)',    seg:'—',          monto:32000, pedidos:18, ult:null },
  ],
  P004:[
    { name:'Semillas del Sur',      seg:'Semillas',   monto:52000, pedidos:22, ult:5  },
    { name:'AgroVerde Ltda.',       seg:'Agrícola',   monto:42000, pedidos:18, ult:14 },
    { name:'Otros (8 clientes)',    seg:'—',          monto:49000, pedidos:28, ult:null },
  ],
  P005:[
    { name:'Bom Bom Agro S.A.',     seg:'Agrícola',   monto:48000, pedidos:16, ult:8  },
    { name:'VetSur Clínica',        seg:'Veterinario',monto:36000, pedidos:12, ult:22 },
    { name:'Otros (7 clientes)',    seg:'—',          monto:35000, pedidos:20, ult:null },
  ],
};

export const CLI_DEFAULT = (p) => [
  { name:'Cliente A',  seg:'Comercial', monto:Math.round(p.ing*.35), pedidos:22, ult:10 },
  { name:'Cliente B',  seg:'Agrícola',  monto:Math.round(p.ing*.25), pedidos:16, ult:18 },
  { name:'Cliente C',  seg:'Semillas',  monto:Math.round(p.ing*.18), pedidos:11, ult:24 },
  { name:'Otros',      seg:'—',         monto:Math.round(p.ing*.22), pedidos:40, ult:null },
];

export const ESTAC_DATA = {
  P001:{ '2022':[88,82,95,110,120,105,98,107,115,118,124,138], '2023':[90,85,97,112,125,108,100,110,118,122,128,105], '2024':[92,88,102,115,130,112,105,114,122,126,132,162] },
  P002:{ '2022':[102,95,110,108,118,100,92,105,112,115,120,123], '2023':[105,98,114,111,122,103,95,108,116,119,124,85],  '2024':[108,100,118,115,126,106,98,112,120,124,128,145] },
  P003:{ '2022':[95,90,100,105,110,102,98,103,108,112,115,162], '2023':[97,92,103,108,114,105,100,106,112,116,118,129], '2024':[100,95,107,112,118,108,103,110,116,120,122,189] },
  P004:{ '2022':[112,105,120,98,88,80,75,82,95,110,118,117], '2023':[115,108,124,100,90,82,78,85,98,114,122,84],  '2024':[118,110,128,103,92,84,80,88,101,118,126,152] },
  P005:{ '2022':[120,115,135,110,90,72,65,70,88,108,125,102], '2023':[124,118,140,114,93,74,68,72,90,111,128,68],  '2024':[128,122,145,118,95,76,70,75,92,115,132,132] },
};

export const ESTAC_DEFAULT = (id) => ({
  '2022': Array.from({length:12},(_,i)=>Math.round(85+Math.sin((i-2)*0.55)*30)),
  '2023': Array.from({length:12},(_,i)=>Math.round(88+Math.sin((i-2)*0.55)*32)),
  '2024': Array.from({length:12},(_,i)=>Math.round(91+Math.sin((i-2)*0.55)*34)),
});
