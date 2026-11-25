// ─── Configuración: clientes, usuarios y productos (almacén local) ───────────────
// - Clientes y usuarios se pueden agregar, editar y eliminar.
// - Los productos vienen de SAP: no se agregan ni se eliminan, solo se activan o
//   desactivan para que aparezcan (o no) al crear un pedido.
// Al cargar este módulo se sincronizan los catálogos que usa "Pedido Nuevo".
import { CLIENTES, CATALOGO, ACCESORIOS, TOPPERS, TOPPERS_SUBCATS } from './pedidosMock';

const K_CLI = 'config_clientes';
const K_USR = 'config_usuarios';
const K_PROD = 'config_productos_inactivos';

const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

// Copias originales (lo que "viene de SAP")
const BASE_CLIENTES = CLIENTES.map(c => ({ ...c }));
const ORIG = { catalogo: [...CATALOGO], accesorios: [...ACCESORIOS], toppers: [...TOPPERS] };

// ─── Clientes ─────────────────────────────────────────────────────────────────
const dir = (direccion, departamento, municipio) => [{ id: 1, direccion, departamento, municipio, comentario: '' }];
const EXTRAS = [
  ['Silvia Rosales', 'Natural', '+503 7810 2233', 'silvia.rosales@correo.com', dir('Col. Escalón, Pasaje 4 #21', 'San Salvador', 'San Salvador')],
  ['Verónica Maldonado', 'Natural', '+503 7455 1290', 'veronica.m@correo.com', dir('Residencial Altos de la Cima, Casa 14', 'San Salvador', 'San Salvador')],
  ['Rodrigo Cordero', 'Natural', '+503 7001 8842', 'rcordero@correo.com', dir('Calle El Pedregal #9', 'La Libertad', 'Antiguo Cuscatlán')],
  ['Lorena Fuentes', 'Natural', '+503 7322 4410', '', []],
  ['Federico Cabrera', 'Natural', '+503 6120 9981', 'fcabrera@correo.com', dir('Col. Médica, Av. Dr. Emilio Álvarez #5', 'San Salvador', 'San Salvador')],
  ['Diana Hidalgo', 'Natural', '+503 7790 3356', 'diana.h@correo.com', []],
  ['César Mendieta', 'Natural', '+503 7611 0274', '', dir('4a Calle Oriente #118', 'La Libertad', 'Santa Tecla')],
  ['Irene Tobar', 'Natural', '+503 7248 5519', 'irene.tobar@correo.com', []],
  ['Paola Quintanilla', 'Natural', '+503 7512 3380', 'paola.q@correo.com', dir('Urb. Madre Selva, Block C #7', 'La Libertad', 'Antiguo Cuscatlán')],
  ['Gabriela Arévalo', 'Natural', '+503 6877 1045', '', []],
  ['Delicias del Instante Ltda.', 'Jurídico', '+503 5555 5555', 'pedidos@deliciasdelinstante.com', dir('Centro Comercial Metrocentro, Local 31', 'San Salvador', 'San Salvador')],
  ['Enlaces & Ceremonias Selecta S.A.', 'Jurídico', '+503 2260 7714', 'eventos@selecta.com', dir('Blvd. Los Próceres #210', 'San Salvador', 'San Salvador')],
  ['Repostería Casa Nuestra S.A.', 'Jurídico', '+503 2222 2222', 'compras@casanuestra.com', []],
  ['Grupo Festejos S.A.', 'Jurídico', '+503 2245 8830', 'info@grupofestejos.com', dir('Paseo General Escalón #4010', 'San Salvador', 'San Salvador')],
];
const SEED_CLIENTES = [
  ...BASE_CLIENTES,
  ...EXTRAS.map(([nombre, tipo, telefono, email, direcciones], i) => ({
    id: 100 + i, nombre, tipo, telefono, email, direcciones,
    ...(tipo === 'Natural' ? { dui: String(40000000 + i * 1111111).padStart(9, '0') } : { nit: `0614-${String(10 + i).padStart(2, '0')}0301-00${(i % 9) + 1}-${i % 10}` }),
  })),
];

function syncClientes(list) { CLIENTES.splice(0, CLIENTES.length, ...list); }

export function getClientes() {
  let list = read(K_CLI, null);
  if (!list) { list = SEED_CLIENTES; write(K_CLI, list); }
  return list;
}
export function saveClientes(list) { write(K_CLI, list); syncClientes(list); return list; }
export function nuevoIdCliente(list) { return list.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1; }

// ─── Usuarios ─────────────────────────────────────────────────────────────────
export const ROLES = ['Administrador', 'Vendedor', 'Producción'];
const SEED_USUARIOS = [
  { id: 1, nombre: 'Administrador General', email: 'admin@puntocero.com', rol: 'Administrador', sucursal: 'Matriz', creado: '2026-01-12' },
  { id: 2, nombre: 'Andrea M.', email: 'andrea@puntocero.com', rol: 'Vendedor', sucursal: 'Sucursal Centro', creado: '2026-02-03' },
  { id: 3, nombre: 'Christian B.', email: 'christian@puntocero.com', rol: 'Vendedor', sucursal: 'Sucursal Norte', creado: '2026-02-03' },
  { id: 4, nombre: 'Mariana V.', email: 'mariana@puntocero.com', rol: 'Vendedor', sucursal: 'Sucursal Sur', creado: '2026-03-18' },
  { id: 5, nombre: 'Jefe de Producción', email: 'produccion@puntocero.com', rol: 'Producción', sucursal: 'Matriz', creado: '2026-01-20' },
];
export const SUCURSALES = ['Matriz', 'Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'];

export function getUsuarios() {
  let list = read(K_USR, null);
  if (!list) { list = SEED_USUARIOS; write(K_USR, list); }
  return list;
}
export function saveUsuarios(list) { write(K_USR, list); return list; }
export function nuevoIdUsuario(list) { return list.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1; }

// ─── Productos (vienen de SAP: solo activar / desactivar) ─────────────────────
const subcatLabel = Object.fromEntries(TOPPERS_SUBCATS.map(s => [s.id, s.label]));
const TODOS = () => [
  ...ORIG.catalogo.map(p => ({ ...p, tipo: 'Catálogo' })),
  ...ORIG.accesorios.map(p => ({ ...p, tipo: 'Accesorio' })),
  ...ORIG.toppers.map(p => ({ ...p, tipo: 'Topper', categoria: subcatLabel[p.subcat] || 'Toppers' })),
];

const inactivos = () => new Set(read(K_PROD, []));

export function getProductos() {
  const off = inactivos();
  return TODOS().map(p => ({ ...p, activo: !off.has(p.sku) }));
}

function aplicarProductos() {
  const off = inactivos();
  CATALOGO.splice(0, CATALOGO.length, ...ORIG.catalogo.filter(p => !off.has(p.sku)));
  ACCESORIOS.splice(0, ACCESORIOS.length, ...ORIG.accesorios.filter(p => !off.has(p.sku)));
  TOPPERS.splice(0, TOPPERS.length, ...ORIG.toppers.filter(p => !off.has(p.sku)));
}

// skus: un sku o una lista. Devuelve la lista de productos actualizada.
export function setProductosActivo(skus, activo) {
  const off = inactivos();
  (Array.isArray(skus) ? skus : [skus]).forEach(s => (activo ? off.delete(s) : off.add(s)));
  write(K_PROD, [...off]);
  aplicarProductos();
  return getProductos();
}

// ─── Sincronización al cargar ─────────────────────────────────────────────────
syncClientes(getClientes());
aplicarProductos();
