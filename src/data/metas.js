// ─── Ingreso de Metas — Demo Data ────────────────────────────────────────────

export const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

export const SUCURSALES_M = [
  'Guatemala Ciudad','Quetzaltenango','Escuintla','Petén',
];

export const VENDEDORES_M = [
  'Juan Hernández','Jorge Miguel','María López','Carlos Arriaga',
];

export const CATEGORIAS_M = [
  'Farmacéuticos','Suplementos','Fertilizantes','Semillas',
  'Alimento Aviar','Veterinarios','Maquinaria','Limpieza','Empaque',
];

export const UOMS = ['GTQ', 'USD', 'Unidades', 'Kg', 'Lts'];

// ─── Filas iniciales de la tabla ─────────────────────────────────────────────
export const METAS_INIT = [
  { id:1, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Juan Hernández', categoria:'Farmacéuticos', uom:'USD', monto:25000 },
  { id:2, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Juan Hernández', categoria:'Suplementos',   uom:'USD', monto:18000 },
  { id:3, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Jorge Miguel',   categoria:'Fertilizantes', uom:'USD', monto:11000 },
  { id:4, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Jorge Miguel',   categoria:'Semillas',      uom:'USD', monto:8500  },
  { id:5, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'María López',    categoria:'Limpieza',      uom:'USD', monto:15000 },
  { id:6, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'María López',    categoria:'Empaque',       uom:'USD', monto:12000 },
  { id:7, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Carlos Arriaga', categoria:'Alimento Aviar',uom:'USD', monto:17000 },
  { id:8, mes:'Enero',    sucursal:'Guatemala Ciudad', vendedor:'Carlos Arriaga', categoria:'Veterinarios',  uom:'USD', monto:9500  },
  { id:9, mes:'Enero',    sucursal:'Quetzaltenango',   vendedor:'Juan Hernández', categoria:'Farmacéuticos', uom:'USD', monto:14000 },
  { id:10,mes:'Enero',    sucursal:'Quetzaltenango',   vendedor:'Jorge Miguel',   categoria:'Fertilizantes', uom:'USD', monto:9200  },
  { id:11,mes:'Enero',    sucursal:'Quetzaltenango',   vendedor:'María López',    categoria:'Limpieza',      uom:'USD', monto:8800  },
  { id:12,mes:'Enero',    sucursal:'Escuintla',        vendedor:'Carlos Arriaga', categoria:'Alimento Aviar',uom:'USD', monto:11200 },
  { id:13,mes:'Febrero',  sucursal:'Guatemala Ciudad', vendedor:'Juan Hernández', categoria:'Farmacéuticos', uom:'USD', monto:25000 },
  { id:14,mes:'Febrero',  sucursal:'Guatemala Ciudad', vendedor:'Juan Hernández', categoria:'Suplementos',   uom:'USD', monto:18000 },
  { id:15,mes:'Febrero',  sucursal:'Guatemala Ciudad', vendedor:'Jorge Miguel',   categoria:'Fertilizantes', uom:'USD', monto:11000 },
  { id:16,mes:'Febrero',  sucursal:'Guatemala Ciudad', vendedor:'María López',    categoria:'Limpieza',      uom:'USD', monto:15000 },
  { id:17,mes:'Febrero',  sucursal:'Guatemala Ciudad', vendedor:'Carlos Arriaga', categoria:'Alimento Aviar',uom:'USD', monto:17000 },
  { id:18,mes:'Febrero',  sucursal:'Quetzaltenango',   vendedor:'Juan Hernández', categoria:'Farmacéuticos', uom:'USD', monto:14000 },
  { id:19,mes:'Marzo',    sucursal:'Guatemala Ciudad', vendedor:'Juan Hernández', categoria:'Farmacéuticos', uom:'USD', monto:26000 },
  { id:20,mes:'Marzo',    sucursal:'Guatemala Ciudad', vendedor:'María López',    categoria:'Limpieza',      uom:'USD', monto:16000 },
];
