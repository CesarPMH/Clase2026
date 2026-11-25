export const COMP_KPIS = {
  ordenesAbiertas: { val:14,    ant:18,   meta:12   },  // isRisk
  montoOrdenes:    { val:284600,ant:318000,meta:260000}, // total open POs
  comprasMes:      { val:187200,ant:165400,meta:200000}, // actual purchases
  leadTimeProm:    { val:8.2,   ant:10.4,  meta:7.0  },  // isRisk days
  proveedoresAct:  { val:24,    ant:22,    meta:28   },
  variacionPrec:   { val:2.4,   ant:4.8,   meta:3.0  },  // isRisk % price variation
};

export const ORDENES_ABIERTAS = [
  { id:'PO-2026-089', proveedor:'VetPharma GT',    monto:48200, fecha:'15/04', diasAbierta:13, items:6, estado:'En tránsito' },
  { id:'PO-2026-092', proveedor:'AgroInsumos S.A.',monto:38600, fecha:'18/04', diasAbierta:10, items:5, estado:'Confirmada'  },
  { id:'PO-2026-095', proveedor:'SemillasTec',     monto:28400, fecha:'20/04', diasAbierta:8,  items:4, estado:'Pendiente'   },
  { id:'PO-2026-098', proveedor:'Química Agrícola',monto:22000, fecha:'22/04', diasAbierta:6,  items:3, estado:'Confirmada'  },
  { id:'PO-2026-101', proveedor:'NutriCampo',      monto:18200, fecha:'24/04', diasAbierta:4,  items:3, estado:'En tránsito' },
  { id:'PO-2026-104', proveedor:'BioVet Central',  monto:12400, fecha:'25/04', diasAbierta:3,  items:2, estado:'Pendiente'   },
  { id:'PO-2026-107', proveedor:'VetPharma GT',    monto:9800,  fecha:'26/04', diasAbierta:2,  items:2, estado:'Pendiente'   },
];

export const COMPRAS_CATEGORIA = [
  { categoria:'Agrícola',    monto:72400,  ant:64200,  pct:38.7, ordenes:5  },
  { categoria:'Veterinario', monto:58600,  ant:52800,  pct:31.3, ordenes:4  },
  { categoria:'Semillas',    monto:36200,  ant:28400,  pct:19.3, ordenes:3  },
  { categoria:'Esp. Menores',monto:20000,  ant:20000,  pct:10.7, ordenes:2  },
];

export const LEAD_TIMES = [
  { proveedor:'BioVet Central',  leadTime:5.2, ant:7.8, ordenes:8,  rating:4.8 },
  { proveedor:'VetPharma GT',    leadTime:7.1, ant:9.2, ordenes:12, rating:4.5 },
  { proveedor:'SemillasTec',     leadTime:8.4, ant:10.1,ordenes:6,  rating:4.2 },
  { proveedor:'AgroInsumos S.A.',leadTime:9.2, ant:11.4,ordenes:9,  rating:4.0 },
  { proveedor:'NutriCampo',      leadTime:10.8,ant:12.6,ordenes:5,  rating:3.8 },
  { proveedor:'Química Agrícola',leadTime:12.4,ant:13.2,ordenes:4,  rating:3.5 },
];

// Variación de precios por producto
export const VARIACION_PRECIOS = [
  { sku:'AGR-001', nombre:'AGROVIT PLUS 1L',  precioAct:36.50, precioAnt:34.20, var:6.7,  tendencia:'up'   },
  { sku:'VET-001', nombre:'PILAROUND 500ML',   precioAct:28.40, precioAnt:29.80, var:-4.7, tendencia:'down' },
  { sku:'VET-002', nombre:'BIOMAX TABS',        precioAct:18.20, precioAnt:17.60, var:3.4,  tendencia:'up'   },
  { sku:'AGR-003', nombre:'AGROFER 5KG',        precioAct:42.80, precioAnt:41.20, var:3.9,  tendencia:'up'   },
  { sku:'SEM-001', nombre:'NUTRISEM PRO',       precioAct:55.60, precioAnt:58.40, var:-4.8, tendencia:'down' },
];

export const COMP_TREND = {
  meses:   ['Nov','Dic','Ene','Feb','Mar','Abr'],
  compras: [148000,198000,168000,182000,214000,187200],
  ordenes: [12,16,13,14,18,14],
};

export const ALERTAS_COMP = [
  { tier:'r', msg:'PO-2026-089: 13 días abierta — VetPharma GT, seguimiento urgente' },
  { tier:'r', msg:'SEMVERDE 25KG: sin orden de compra activa — stock crítico' },
  { tier:'y', msg:'Lead time promedio 8.2 días — 1.2 días sobre meta' },
  { tier:'y', msg:'AGROVIT PLUS: precio subió 6.7% — renegociar contrato' },
  { tier:'g', msg:'Lead time BioVet: 5.2 días — mejor proveedor del período' },
  { tier:'g', msg:'Variación precio promedio 2.4% — mejora vs 4.8% año ant.' },
];
