export const COST_KPIS = {
  costoReal:      { val:187600, ant:198400, meta:182000 },  // isRisk
  costoEstandar:  { val:182000, ant:190000, meta:182000 },
  variacion:      { val:3.1,    ant:4.4,    meta:2.0    },  // isRisk % variance
  eficiencia:     { val:87.4,   ant:82.1,   meta:90.0   },
  scrapPct:       { val:3.2,    ant:4.8,    meta:2.5    },  // isRisk
  costoUnidad:    { val:32.4,   ant:35.8,   meta:34.0   },  // lower better isRisk
};

// Variación costo por componente (Material, MOD, CIF)
export const VARIACION_COMPONENTES = [
  { componente:'Material Directo', real:112400, estandar:108000, var:4.1,  pct:59.9 },
  { componente:'Mano de Obra Dir.', real:38200,  estandar:36400,  var:4.9,  pct:20.4 },
  { componente:'Costos Ind. Fab.',  real:37000,  estandar:37600,  var:-1.6, pct:19.7 },
];

// Por orden de trabajo
export const COSTOS_OT = [
  { id:'OT-2026-042', producto:'AGROVIT PLUS 1L',  real:48200, estandar:46000, var:4.8, und:500, costoUnd:96.4, efic:96.2, scrap:1.8 },
  { id:'OT-2026-043', producto:'PILAROUND 500ML',  real:42800, estandar:40000, var:7.0, und:380, costoUnd:112.6,efic:91.2, scrap:3.4 },
  { id:'OT-2026-044', producto:'BIOMAX TABS',       real:28400, estandar:28800, var:-1.4,und:310, costoUnd:91.6, efic:98.4, scrap:0.6 },
  { id:'OT-2026-045', producto:'VETMEC COMBO',      real:36200, estandar:34600, var:4.6, und:240, costoUnd:150.8,efic:93.8, scrap:2.4 },
];

// Scrap por producto
export const SCRAP_DETALLE = [
  { producto:'AGROVIT PLUS 1L',  scrapKg:8.4,  scrapPct:1.8, costoScrap:1240, causa:'Llenado'    },
  { producto:'PILAROUND 500ML',  scrapKg:14.2, scrapPct:3.4, costoScrap:2180, causa:'Mezclado'   },
  { producto:'BIOMAX TABS',       scrapKg:2.1,  scrapPct:0.6, costoScrap:420,  causa:'Tableteado' },
  { producto:'VETMEC COMBO',      scrapKg:9.8,  scrapPct:2.4, costoScrap:1560, causa:'Empaque'    },
];

// Trend costo real vs estándar
export const COST_TREND = {
  meses:     ['Nov','Dic','Ene','Feb','Mar','Abr'],
  real:      [198400,212000,178000,194000,218000,187600],
  estandar:  [190000,204000,172000,188000,210000,182000],
  variacion: [4.4,3.9,3.5,3.2,3.8,3.1],
};

export const ALERTAS_COST = [
  { tier:'r', msg:'OT-2026-043 PILAROUND: variación +7.0% — mayor del período' },
  { tier:'r', msg:'MOD: variación +4.9% vs estándar — revisar eficiencia de línea' },
  { tier:'y', msg:'Variación promedio 3.1% — 1.1pp sobre meta del 2.0%' },
  { tier:'y', msg:'PILAROUND: scrap 3.4% — costo de desperdicio $2,180' },
  { tier:'g', msg:'CIF: -1.6% bajo estándar — gestión de indirectos eficiente' },
  { tier:'g', msg:'Variación mejora de 4.4% a 3.1% vs año anterior' },
];
