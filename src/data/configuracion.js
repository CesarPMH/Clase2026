// ─── Configuración: clientes, usuarios y productos (almacén local) ───────────────
// - Clientes y usuarios se pueden agregar, editar y eliminar.
// - Los productos vienen de SAP: no se agregan ni se eliminan, solo se activan o
//   desactivan para que aparezcan (o no) al crear un pedido.
// Al cargar este módulo se sincronizan los catálogos que usa "Pedido Nuevo".
//
// Idea central: los catálogos que usa "Pedido Nuevo" (CLIENTES, CATALOGO, ACCESORIOS y TOPPERS en
// pedidosMock.js) son arreglos exportados que otras pantallas ya importaron. Por eso aquí nunca
// se reemplazan con "=" (eso rompería la referencia que tienen los demás archivos): se modifican
// EN SU LUGAR con splice, de modo que Pedido Nuevo siempre vea los datos actuales.
// Persistencia: todo se guarda en localStorage (no hay servidor). Las pantallas de
// Configuración (pages/Config*.jsx) leen y escriben únicamente a través de este archivo.
import { CLIENTES, CATALOGO, ACCESORIOS, TOPPERS, TOPPERS_SUBCATS } from './pedidosMock';

// Claves de localStorage donde se guarda cada conjunto de datos. De los productos solo se guardan los SKU desactivados.
const K_CLI = 'config_clientes';
const K_USR = 'config_usuarios';
const K_PROD = 'config_productos_inactivos';

// read/write: lectura y escritura segura en localStorage. read devuelve el valor de respaldo (fb)
// si no existe o está dañado; write ignora el error si el navegador no permite guardar.
const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };

// Copias originales (lo que "viene de SAP"). Se guardan antes de que splice modifique los arreglos
// exportados, para poder reconstruirlos después (por ejemplo al reactivar un producto).
const BASE_CLIENTES = CLIENTES.map(c => ({ ...c }));
const ORIG = { catalogo: [...CATALOGO], accesorios: [...ACCESORIOS], toppers: [...TOPPERS] };

// ─── Clientes ─────────────────────────────────────────────────────────────────
// dir: arma la lista de direcciones de un cliente con una sola dirección, para escribir más corto los clientes de ejemplo.
const dir = (direccion, departamento, municipio) => [{ id: 1, direccion, departamento, municipio, comentario: '' }];
// EXTRAS: clientes de ejemplo adicionales, en formato [nombre, tipo, teléfono, correo, direcciones].
// Se amplían a objetos completos en SEED_CLIENTES.
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
// SEED_CLIENTES: clientes iniciales la primera vez que se abre la app (los de pedidosMock más los
// EXTRAS). A los naturales se les genera un DUI y a los jurídicos un NIT de ejemplo, con ids desde 100
// para no chocar con los originales.
const SEED_CLIENTES = [
  ...BASE_CLIENTES,
  ...EXTRAS.map(([nombre, tipo, telefono, email, direcciones], i) => ({
    id: 100 + i, nombre, tipo, telefono, email, direcciones,
    ...(tipo === 'Natural' ? { dui: String(40000000 + i * 1111111).padStart(9, '0') } : { nit: `0614-${String(10 + i).padStart(2, '0')}0301-00${(i % 9) + 1}-${i % 10}` }),
  })),
];

// syncClientes: deja el arreglo CLIENTES (el de Pedido Nuevo) con el contenido de "list".
// splice(0, length, ...list) vacía y vuelve a llenar el mismo arreglo, conservando su referencia.
function syncClientes(list) { CLIENTES.splice(0, CLIENTES.length, ...list); }

// getClientes: devuelve los clientes guardados; si es la primera vez, guarda los iniciales (SEED_CLIENTES).
export function getClientes() {
  let list = read(K_CLI, null);
  if (!list) { list = SEED_CLIENTES; write(K_CLI, list); }
  return list;
}
// saveClientes: guarda la lista, la sincroniza con Pedido Nuevo y la devuelve para que la pantalla actualice su estado.
export function saveClientes(list) { write(K_CLI, list); syncClientes(list); return list; }
// nuevoIdCliente: siguiente id libre (el mayor existente + 1), así nunca se repite aunque se hayan borrado clientes.
export function nuevoIdCliente(list) { return list.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1; }

// ─── Usuarios ─────────────────────────────────────────────────────────────────
// Roles disponibles. Administrador gestiona el sistema, Vendedor crea pedidos y Producción prepara los pedidos.
export const ROLES = ['Administrador', 'Vendedor', 'Producción'];
// Usuarios iniciales de ejemplo (incluye un administrador). Las contraseñas son de demostración.
const SEED_USUARIOS = [
  { id: 1, nombre: 'Administrador General', email: 'admin@puntocero.com', password: 'admin123', rol: 'Administrador', sucursal: 'Matriz', creado: '2026-01-12' },
  { id: 2, nombre: 'Andrea M.', email: 'andrea@puntocero.com', password: 'andrea123', rol: 'Vendedor', sucursal: 'Sucursal Centro', creado: '2026-02-03' },
  { id: 3, nombre: 'Christian B.', email: 'christian@puntocero.com', password: 'christian123', rol: 'Vendedor', sucursal: 'Sucursal Norte', creado: '2026-02-03' },
  { id: 4, nombre: 'Mariana V.', email: 'mariana@puntocero.com', password: 'mariana123', rol: 'Vendedor', sucursal: 'Sucursal Sur', creado: '2026-03-18' },
  { id: 5, nombre: 'Jefe de Producción', email: 'produccion@puntocero.com', password: 'produccion123', rol: 'Producción', sucursal: 'Matriz', creado: '2026-01-20' },
];
// Sucursales entre las que se puede asignar un usuario.
export const SUCURSALES = ['Matriz', 'Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'];

// getUsuarios: devuelve los usuarios guardados (o los iniciales la primera vez).
// Además repara datos viejos: si hay usuarios guardados sin contraseña se les asigna una de ejemplo.
export function getUsuarios() {
  let list = read(K_USR, null);
  if (!list) { list = SEED_USUARIOS; write(K_USR, list); }
  // Usuarios guardados antes de existir la contraseña de ejemplo
  if (list.some(u => !u.password)) { list = list.map(u => (u.password ? u : { ...u, password: 'demo1234' })); write(K_USR, list); }
  return list;
}
// saveUsuarios: guarda la lista de usuarios y la devuelve. Las reglas de validación están en ConfigUsuarios.jsx.
export function saveUsuarios(list) { write(K_USR, list); return list; }
// nuevoIdUsuario: siguiente id libre para un usuario.
export function nuevoIdUsuario(list) { return list.reduce((m, u) => Math.max(m, u.id || 0), 0) + 1; }

// ─── Productos (vienen de SAP: solo activar / desactivar) ─────────────────────
// subcatLabel: traduce el id de subcategoría de un topper (ej. "impreso") a su texto para mostrarlo como categoría.
const subcatLabel = Object.fromEntries(TOPPERS_SUBCATS.map(s => [s.id, s.label]));
// TODOS: lista unificada de los productos originales de SAP (catálogo, accesorios y toppers), con su "tipo"
// para filtrarlos en la pantalla. Es función para armarla a partir de las copias ORIG cada vez.
const TODOS = () => [
  ...ORIG.catalogo.map(p => ({ ...p, tipo: 'Catálogo' })),
  ...ORIG.accesorios.map(p => ({ ...p, tipo: 'Accesorio' })),
  ...ORIG.toppers.map(p => ({ ...p, tipo: 'Topper', categoria: subcatLabel[p.subcat] || 'Toppers' })),
];

// inactivos: conjunto de SKU que el usuario desactivó (se lee de localStorage).
const inactivos = () => new Set(read(K_PROD, []));

// getProductos: devuelve todos los productos con el campo "activo" (true salvo que su SKU esté desactivado).
export function getProductos() {
  const off = inactivos();
  return TODOS().map(p => ({ ...p, activo: !off.has(p.sku) }));
}

// aplicarProductos: sincroniza con Pedido Nuevo. Rellena CATALOGO, ACCESORIOS y TOPPERS (con splice,
// para no perder la referencia) solo con los productos activos, partiendo siempre de las copias ORIG.
function aplicarProductos() {
  const off = inactivos();
  CATALOGO.splice(0, CATALOGO.length, ...ORIG.catalogo.filter(p => !off.has(p.sku)));
  ACCESORIOS.splice(0, ACCESORIOS.length, ...ORIG.accesorios.filter(p => !off.has(p.sku)));
  TOPPERS.splice(0, TOPPERS.length, ...ORIG.toppers.filter(p => !off.has(p.sku)));
}

// setProductosActivo: activa o desactiva productos y deja Pedido Nuevo actualizado.
// skus: un SKU o una lista (acciones masivas); activo: true/false. Guarda la lista de
// desactivados y devuelve los productos actualizados.
export function setProductosActivo(skus, activo) {
  const off = inactivos();
  (Array.isArray(skus) ? skus : [skus]).forEach(s => (activo ? off.delete(s) : off.add(s)));
  write(K_PROD, [...off]);
  aplicarProductos();
  return getProductos();
}

// ─── Sincronización al cargar ─────────────────────────────────────────────────
// Se ejecuta una sola vez al importar el módulo (App.jsx lo importa al arrancar): así Pedido Nuevo
// tiene los clientes y productos correctos desde el inicio, aunque el usuario no abra Configuración.
syncClientes(getClientes());
aplicarProductos();
