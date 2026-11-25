export const PROD_KPIS = {
  otAbiertas:    { val:12,  ant:16,   meta:10   },  // isRisk
  otCerradas:    { val:38,  ant:32,   meta:40   },  // higher better
  cumplimiento:  { val:84.2,ant:78.6, meta:90   },  // % plan production
  tiempoPromedio:{ val:3.8, ant:4.6,  meta:3.5  },  // isRisk days average cycle
  eficiencia:    { val:87.4,ant:82.1, meta:90   },  // % output/input
  scrap:         { val:3.2, ant:4.8,  meta:2.5  },  // isRisk % scrap
};

export const ORDENES_PRODUCCION = [
  { id:'OT-2026-042', producto:'AGROVIT PLUS 1L',   cantidad:500, producido:500, estado:'Cerrada',  inicio:'01/04', fin:'04/04', ciclo:3.0, efic:96.2, scrap:1.8 },
  { id:'OT-2026-043', producto:'PILAROUND 500ML',   cantidad:400, producido:380, estado:'Cerrada',  inicio:'03/04', fin:'07/04', ciclo:4.0, efic:91.2, scrap:3.4 },
  { id:'OT-2026-044', producto:'BIOMAX TABS',        cantidad:300, producido:310, estado:'Cerrada',  inicio:'05/04', fin:'08/04', ciclo:3.0, efic:98.4, scrap:0.6 },
  { id:'OT-2026-045', producto:'VETMEC COMBO',       cantidad:250, producido:240, estado:'Cerrada',  inicio:'08/04', fin:'12/04', ciclo:4.0, efic:93.8, scrap:2.4 },
  { id:'OT-2026-046', producto:'AGROFER 5KG',        cantidad:400, producido:0,   estado:'En curso', inicio:'22/04', fin:'',      ciclo:0,   efic:0,    scrap:0   },
  { id:'OT-2026-047', producto:'NUTRISEM PRO',        cantidad:350, producido:0,   estado:'En curso', inicio:'24/04', fin:'',      ciclo:0,   efic:0,    scrap:0   },
  { id:'OT-2026-048', producto:'CALCIVIT INY',        cantidad:200, producido:0,   estado:'Planif.',  inicio:'28/04', fin:'',      ciclo:0,   efic:0,    scrap:0   },
  { id:'OT-2026-049', producto:'HERBICIDA X20',       cantidad:280, producido:0,   estado:'Planif.',  inicio:'29/04', fin:'',      ciclo:0,   efic:0,    scrap:0   },
];

export const PROD_PRODUCTOS = [
  { nombre:'AGROVIT PLUS 1L',  planMes:500, producido:500, cumpl:100, tiempoCiclo:3.0, efic:96.2, scrap:1.8, tendencia:'up'   },
  { nombre:'PILAROUND 500ML',  planMes:400, producido:380, cumpl:95,  tiempoCiclo:4.0, efic:91.2, scrap:3.4, tendencia:'down' },
  { nombre:'BIOMAX TABS',       planMes:300, producido:310, cumpl:103, tiempoCiclo:3.0, efic:98.4, scrap:0.6, tendencia:'up'   },
  { nombre:'VETMEC COMBO',      planMes:250, producido:240, cumpl:96,  tiempoCiclo:4.0, efic:93.8, scrap:2.4, tendencia:'down' },
  { nombre:'NUTRISEM PRO',      planMes:350, producido:0,   cumpl:0,   tiempoCiclo:3.5, efic:0,    scrap:0,   tendencia:'—'    },
];

// Consumo real vs planificado de materiales top
export const CONSUMO_MATERIALES = [
  { material:'Principio Activo A', unidad:'Kg', planificado:840, real:868, variacion:3.3  },
  { material:'Excipiente Base',    unidad:'Kg', planificado:620, real:598, variacion:-3.5 },
  { material:'Envase PET 1L',      unidad:'Un', planificado:500, real:512, variacion:2.4  },
  { material:'Etiqueta AGR-001',   unidad:'Un', planificado:500, real:500, variacion:0.0  },
  { material:'Caja Cartón x12',    unidad:'Un', planificado:42,  real:44,  variacion:4.8  },
];

// Producción mensual trend
export const PROD_TREND = {
  meses:    ['Nov','Dic','Ene','Feb','Mar','Abr'],
  plan:     [35,38,32,40,42,40],
  cerradas: [32,36,30,38,40,38],
  efic:     [82,85,81,88,89,87],
};

export const ALERTAS_PROD = [
  { tier:'r', msg:'OT-2026-043: PILAROUND — scrap 3.4%, sobre límite del 3%' },
  { tier:'r', msg:'Cumplimiento del plan 84.2% — 6pp bajo meta del 90%' },
  { tier:'y', msg:'12 OTs abiertas — 2 sobre meta, verificar capacidad' },
  { tier:'y', msg:'Tiempo de ciclo promedio 3.8 días — 0.3 sobre meta' },
  { tier:'g', msg:'BIOMAX TABS: eficiencia 98.4% — mejor del período' },
  { tier:'g', msg:'Scrap promedio 3.2% — mejora vs 4.8% año anterior' },
];
