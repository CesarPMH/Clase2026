// ─── Cuentas por Pagar — Demo Data ───────────────────────────────────────────
// Guatemalan agro/veterinary company · Abril 2026

export const CXP_KPIS = {
  saldoTotal:  { val: 156800, ant: 198400, meta: 180000 }, // isRisk
  vencido:     { val: 28400,  ant: 45200,  meta: 20000  }, // isRisk
  porVencer:   { val: 128400, ant: 153200, meta: 160000 },
  dpo:         { val: 38,     ant: 32,     meta: 45      }, // DPO - higher is better
  pagosMes:    { val: 187200, ant: 165400, meta: 195000  },
  proveedores: { val: 24,     ant: 22,     meta: 30      },
};

// Aging AP buckets
export const CXP_AGING = [
  { label: 'Corriente',  monto: 128400, facturas: 18, color: '#16a34a' },
  { label: '1–7 días',   monto: 18200,  facturas: 4,  color: '#65a30d' },
  { label: '8–15 días',  monto: 6400,   facturas: 2,  color: '#d97706' },
  { label: '16–30 días', monto: 2800,   facturas: 1,  color: '#ea580c' },
  { label: '30+ días',   monto: 1000,   facturas: 1,  color: '#dc2626' },
];

// Top proveedores
export const TOP_PROVEEDORES = [
  { nombre: 'VetPharma GT',     saldo: 48200, vencido: 0,     proxPago: '05/05', monto: 12400, facturas: 6, dpo: 42 },
  { nombre: 'AgroInsumos S.A.', saldo: 38600, vencido: 6400,  proxPago: '02/05', monto: 8200,  facturas: 5, dpo: 35 },
  { nombre: 'SemillasTec',      saldo: 28400, vencido: 0,     proxPago: '08/05', monto: 6800,  facturas: 4, dpo: 48 },
  { nombre: 'Química Agrícola', saldo: 22000, vencido: 14400, proxPago: '28/04', monto: 4200,  facturas: 3, dpo: 28 },
  { nombre: 'NutriCampo',       saldo: 18200, vencido: 7600,  proxPago: '30/04', monto: 3800,  facturas: 3, dpo: 22 },
  { nombre: 'BioVet Central',   saldo: 12400, vencido: 0,     proxPago: '10/05', monto: 2600,  facturas: 2, dpo: 55 },
];

// Pagos próximos a vencer
export const PROXIMOS_PAGOS = [
  { proveedor: 'Química Agrícola', monto: 4200,  fecha: '28/04', dias: 0,  urgencia: 'vencido' },
  { proveedor: 'NutriCampo',       monto: 3800,  fecha: '30/04', dias: 2,  urgencia: 'hoy'     },
  { proveedor: 'AgroInsumos S.A.', monto: 8200,  fecha: '02/05', dias: 4,  urgencia: '7dias'   },
  { proveedor: 'VetPharma GT',     monto: 12400, fecha: '05/05', dias: 7,  urgencia: '7dias'   },
  { proveedor: 'SemillasTec',      monto: 6800,  fecha: '08/05', dias: 10, urgencia: '15dias'  },
  { proveedor: 'BioVet Central',   monto: 2600,  fecha: '10/05', dias: 12, urgencia: '15dias'  },
];

// Pagos mensuales trend
export const PAGOS_TREND = {
  meses:    ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
  pagado:   [158000, 201000, 172000, 195000, 214000, 187200],
  facturas: [156000, 198000, 169000, 188000, 210000, 182000],
};

export const ALERTAS_CXP = [
  { tier: 'r', msg: 'Química Agrícola: $4.2K VENCIDO hoy — pagar inmediatamente'   },
  { tier: 'r', msg: 'NutriCampo: $7.6K vencido — vence en 2 días'                 },
  { tier: 'y', msg: '$16K vence en los próximos 7 días — verificar liquidez'       },
  { tier: 'y', msg: 'DPO 38 días — 7 días bajo meta de 45 días'                   },
  { tier: 'g', msg: 'Saldo CxP -20.9% vs año anterior — gestión mejorada'         },
  { tier: 'g', msg: '24 proveedores activos — relaciones comerciales estables'     },
];
