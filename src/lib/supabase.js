// Capa de autenticación/auditoría de demostración.
// En esta versión del proyecto no hay backend: todas las funciones son simuladas
// y los datos viven en el navegador (localStorage). Para conectar un backend real,
// reemplaza estas funciones por llamadas a tu servicio.

const demoUser = { id: 'demo', email: 'demo@puntocero.com', name: 'Demo User', role: 'Admin', isAdmin: true, active: true };

export const supabase = null;

export async function signIn() { return demoUser; }
export async function signOut() {}
export async function getSessionUser() { return demoUser; }
export async function getProfile() { return demoUser; }
export async function createUser() { return demoUser; }
export async function getAllUsers() { return [demoUser]; }
export async function updateUserEmail() {}
export async function updateProfile() {}
export async function adminUpdateProfile() {}
export async function logAudit() {}
export async function getUserAuditLog() { return []; }
export async function resetUserPassword() {}
export async function logActivity() {}
export async function getActivityLog() { return []; }
