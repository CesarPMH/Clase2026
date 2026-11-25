// ─── Default permissions (all sidebar item IDs) ───────────────────────────────
export const DEFAULT_PERMISSIONS = {
  // Comercial
  ventas:              true,
  clientes:            true,
  segmento:            true,
  productos:           true,
  'producto-detalle':  false,
  desempeno:           true,
  tienda:              true,
  vendedor:            true,
  // Administración
  metas:               true,
  // Financiero
  finanzas:            true,
  'flujo-caja':        true,
  estado:              true,
  balance:             true,
  // Tesorería
  'cuentas-cobrar':    true,
  'cuentas-pagar':     true,
  'aging-saldos':      true,
  // Logístico
  inventarios:         true,
  compras:             true,
  egresos:             true,
  'movimientos-bodega':false,
  // Operaciones
  produccion:          true,
  costos:              true,
  // Santa Ana
  'santa-ana':         true,
  // Ayuda
  soporte:             true,
  'soporte-admin':     false,
};

// ─── Seed (first-time only) ───────────────────────────────────────────────────
const SEED = [
  {
    id: 'u1',
    email: 'demo@puntocero.com',
    pass: '1234',
    name: 'Ligia Guidos',
    initials: 'LG',
    role: 'Administrador',
    isAdmin: true,
    active: true,
    permissions: { ...DEFAULT_PERMISSIONS, 'soporte-admin': true },
  },
];

const KEY = 'dl_users_v1';

// ─── Persistence helpers ──────────────────────────────────────────────────────
export function getUsers() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED.map(u => ({ ...u }));
}

function save(users) {
  localStorage.setItem(KEY, JSON.stringify(users));
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function authenticate(email, pass) {
  const users = getUsers();
  // blank login → first active user (demo shortcut)
  if (!email && !pass) {
    return users.find(u => u.active !== false) || null;
  }
  return users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
      && u.pass === pass
      && u.active !== false
  ) || null;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export function addUser(data) {
  const users = getUsers();
  const initials = data.name
    ? data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const newUser = {
    id: `u${Date.now()}`,
    active: true,
    isAdmin: false,
    initials,
    permissions: { ...DEFAULT_PERMISSIONS },
    ...data,
  };
  users.push(newUser);
  save(users);
  return newUser;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const i = users.findIndex(u => u.id === id);
  if (i < 0) return null;
  // Recompute initials if name changed
  if (updates.name && !updates.initials) {
    updates.initials = updates.name
      .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  users[i] = { ...users[i], ...updates };
  save(users);
  return users[i];
}

export function deleteUser(id) {
  save(getUsers().filter(u => u.id !== id));
}
