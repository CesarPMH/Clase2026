export const INV_KPIS = {
  stockTotal:     { val:4820,  ant:4240,  meta:5000  },  // units
  valorInventario:{ val:287400,ant:312000,meta:300000 },  // $ isRisk (don't want too high)
  bajominimo:     { val:18,    ant:24,    meta:10     },  // isRisk - items below minimum
  critico:        { val:6,     ant:8,     meta:3      },  // isRisk - critical stock
  rotacionProm:   { val:4.6,   ant:3.9,   meta:5.0    },  // higher better
  coberturaDias:  { val:28,    ant:32,    meta:30     },  // days of coverage
};

export const INV_CATEGORIAS = [
  { nombre:'Agrícola',     stockU:1840, stockMin:1200, stockMax:2400, valor:112000, rotacion:5.2, cobertura:24, estado:'Normal'  },
  { nombre:'Veterinario',  stockU:1420, stockMin:900,  stockMax:1800, valor:98600,  rotacion:4.8, cobertura:28, estado:'Normal'  },
  { nombre:'Semillas',     stockU:980,  stockMin:600,  stockMax:1400, valor:54200,  rotacion:3.8, cobertura:32, estado:'Bajo'    },
  { nombre:'Esp. Menores', stockU:580,  stockMin:400,  stockMax:800,  valor:22600,  rotacion:4.2, cobertura:30, estado:'Normal'  },
];

export const ITEMS_BAJO_MINIMO = [
  { sku:'SEM-002', nombre:'SEMVERDE 25KG',   categoria:'Semillas',   stockActual:45,  stockMin:120, stockMax:200, cobertura:8,  rotacion:3.8, proveedor:'SemillasTec',   urgencia:'critico' },
  { sku:'AGR-004', nombre:'HERBICIDA X20',   categoria:'Agrícola',   stockActual:12,  stockMin:30,  stockMax:60,  cobertura:5,  rotacion:7.2, proveedor:'Química Agr.',  urgencia:'critico' },
  { sku:'VET-003', nombre:'CALCIVIT INY',    categoria:'Veterinario',stockActual:28,  stockMin:50,  stockMax:100, cobertura:12, rotacion:3.5, proveedor:'VetPharma GT',  urgencia:'bajo'    },
  { sku:'AGR-003', nombre:'AGROFER 5KG',     categoria:'Agrícola',   stockActual:85,  stockMin:150, stockMax:300, cobertura:18, rotacion:3.5, proveedor:'AgroInsumos',   urgencia:'bajo'    },
  { sku:'VET-004', nombre:'VITAVET B12',     categoria:'Veterinario',stockActual:42,  stockMin:80,  stockMax:160, cobertura:14, rotacion:4.1, proveedor:'BioVet Central',urgencia:'bajo'    },
  { sku:'SEM-003', nombre:'NUTRISEM PLUS',   categoria:'Semillas',   stockActual:68,  stockMin:100, stockMax:200, cobertura:20, rotacion:3.2, proveedor:'SemillasTec',   urgencia:'bajo'    },
];

export const INV_BODEGAS = [
  { nombre:'Matriz',   stockU:1980, valor:118400, rotacion:5.1, utilizacion:82 },
  { nombre:'Central',  stockU:1440, valor:86200,  rotacion:4.8, utilizacion:72 },
  { nombre:'Norte',    stockU:880,  valor:52600,  rotacion:4.2, utilizacion:65 },
  { nombre:'Sur',      stockU:520,  valor:30200,  rotacion:3.9, utilizacion:58 },
];

// Stock trend (últimos 6 meses)
export const INV_TREND = {
  meses:    ['Nov','Dic','Ene','Feb','Mar','Abr'],
  stockVal: [298000,312000,305000,318000,294000,287400],
  unidades: [4580,4820,4640,4980,4720,4820],
};

export const ALERTAS_INV = [
  { tier:'r', msg:'SEMVERDE 25KG: 45 un. — 8 días de cobertura, reorden urgente' },
  { tier:'r', msg:'HERBICIDA X20: 12 un. — stock crítico, solo 5 días' },
  { tier:'y', msg:'18 SKUs bajo punto de reorden — revisar plan de compras' },
  { tier:'y', msg:'Semillas: cobertura 32 días — rotación más lenta que meta' },
  { tier:'g', msg:'Rotación promedio 4.6x — mejora vs 3.9x año anterior' },
  { tier:'g', msg:'Valor inventario -8% vs año ant. — gestión de capital mejorada' },
];
