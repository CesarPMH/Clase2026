// ─── lib/supabase.js: capa de autenticación y auditoría simulada ─────────────
// Capa de autenticación/auditoría de demostración.
// En esta versión del proyecto no hay backend: todas las funciones son simuladas
// y los datos viven en el navegador (localStorage). Para conectar un backend real,
// reemplaza estas funciones por llamadas a tu servicio.

// Usuario único que devuelven todas las funciones simuladas. Así el resto del código
// puede llamar a "signIn", "getProfile", etc. como si hubiera un servidor, sin cambiarlo
// cuando se conecte uno real.
const demoUser = { id: 'demo', email: 'demo@puntocero.com', name: 'Demo User', role: 'Admin', isAdmin: true, active: true };

// El cliente de Supabase queda en null porque en el prototipo no hay conexión a ninguna base de datos.
export const supabase = null;

// Funciones de sesión y usuarios: mantienen la misma firma que tendrían con un backend real
// (son async y devuelven el usuario) pero no hacen nada más que devolver el usuario demo.
export async function signIn() { return demoUser; }
export async function signOut() {}
export async function getSessionUser() { return demoUser; }
export async function getProfile() { return demoUser; }
export async function createUser() { return demoUser; }
export async function getAllUsers() { return [demoUser]; }
export async function updateUserEmail() {}
export async function updateProfile() {}
export async function adminUpdateProfile() {}
// Funciones de auditoría y actividad: serían el registro de quién hizo qué. Aquí no guardan
// nada y las consultas devuelven listas vacías para que las pantallas no fallen.
export async function logAudit() {}
export async function getUserAuditLog() { return []; }
export async function resetUserPassword() {}
export async function logActivity() {}
export async function getActivityLog() { return []; }
