// ─── Cuentas por Cobrar — Demo Data ──────────────────────────────────────────
// Guatemalan agro/veterinary company · Abril 2026

export const CXC_KPIS = {
  saldoTotal:  { val: 284600, ant: 247200, meta: 250000 }, // isRisk - lower better
  vencido:     { val: 84000,  ant: 102000, meta: 60000  }, // isRisk
  porVencer:   { val: 200600, ant: 145200, meta: 190000 },
  dso:         { val: 32,     ant: 38,     meta: 28      }, // isRisk Days Sales Outstanding
  cobranzaMes: { val: 198400, ant: 167000, meta: 210000  },
  facturasMes: { val: 43,     ant: 38,     meta: 45      },
};

// Aging buckets
export const CXC_AGING = [
  { label: 'Corriente',  dias: '0 días',  monto: 200600, facturas: 29, color: '#16a34a' },
  { label: '1–30 días',  dias: 'Vencida', monto: 32000,  facturas: 7,  color: '#65a30d' },
  { label: '31–60 días', dias: 'Vencida', monto: 24000,  facturas: 5,  color: '#d97706' },
  { label: '61–90 días', dias: 'Vencida', monto: 18000,  facturas: 4,  color: '#ea580c' },
  { label: '90+ días',   dias: 'Vencida', monto: 10000,  facturas: 3,  color: '#dc2626' },
];

// Top deudores
export const TOP_DEUDORES = [
  { nombre: 'Agropecuaria El Campo', saldo: 84000, vencido: 32000, dias: 45, facturas: 8, segmento: 'Premium'    },
  { nombre: 'Veterinaria Los Pinos', saldo: 62400, vencido: 18000, dias: 38, facturas: 6, segmento: 'Regular'    },
  { nombre: 'Distribuidora Olmeca',  saldo: 48200, vencido: 24000, dias: 67, facturas: 5, segmento: 'Premium'    },
  { nombre: 'Farmacia Animal GT',    saldo: 38600, vencido: 0,     dias: 12, facturas: 4, segmento: 'Regular'    },
  { nombre: 'Jaine Espi',            saldo: 28400, vencido: 10000, dias: 92, facturas: 3, segmento: 'En riesgo'  },
  { nombre: 'Tienda Norte',          saldo: 22600, vencido: 0,     dias: 8,  facturas: 3, segmento: 'Regular'    },
];

// Cobranza mensual trend (últimos 6 meses)
export const COBRANZA_TREND = {
  meses:   ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
  cobrado: [142000, 178000, 165000, 189000, 201000, 198400],
  emitido: [168000, 195000, 188000, 210000, 224000, 215000],
};

// Alertas
export const ALERTAS_CXC = [
  { tier: 'r', msg: 'Jaine Espi: $10K vencido a 92 días — riesgo de incobrabilidad'      },
  { tier: 'r', msg: 'Distribuidora Olmeca: $24K vencido a 67 días — gestionar cobro'     },
  { tier: 'y', msg: 'DSO 32 días — 4 días sobre meta de 28 días'                         },
  { tier: 'y', msg: 'Veterinaria Los Pinos: $18K vencido — pendiente de acuerdo'         },
  { tier: 'g', msg: 'Cobranza del mes $198K — 94.5% de meta'                             },
  { tier: 'g', msg: '29 facturas corrientes — cartera sana al 70.5%'                     },
];
