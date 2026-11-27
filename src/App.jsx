// ─── App.jsx: componente raíz de Punto Cero ───────────────────────────────────
// Objetivo: armar toda la aplicación. Aquí se hacen tres cosas:
//   1. Se aplica el tema visual de MUI y el proveedor de idioma a toda la app.
//   2. Se decide si se muestra la pantalla de Login o el sistema (puerta de acceso).
//   3. Se declaran las rutas (URL -> página) dentro del layout con menú lateral.
// Lo usa main.jsx; las páginas viven en ./pages y el menú/barra en components/shell.
// Nota: es un prototipo sin servidor, así que la "sesión" es solo una marca en localStorage.
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { LanguageProvider, useT } from './i18n/LanguageContext';
import AppLayout from './components/shell/AppLayout';
import Home from './pages/Home';
import Pedidos from './pages/Pedidos';
import NuevoPedido from './pages/NuevoPedido';
import PedidosDia from './pages/PedidosDia';
import Ventas from './pages/Ventas';
import SolicitudesCambio from './pages/SolicitudesCambio';
import Login from './pages/Login';
import ConfigClientes from './pages/ConfigClientes';
import ConfigUsuarios from './pages/ConfigUsuarios';
import ConfigProductos from './pages/ConfigProductos';
// Importar este módulo solo por su efecto: al cargarse deja los catálogos de "Pedido Nuevo"
// (clientes y productos) iguales a lo que se configuró en Configuración.
import './data/configuracion'; // sincroniza clientes y productos activos con "Pedido Nuevo"

// Usuario de demostración que reciben el layout y las páginas (nombre, rol, permisos).
// Como no hay login real contra un servidor, siempre se trabaja como administrador.
const DEFAULT_USER = { id:'demo', email:'user123@gmail.com', name:'Demo User', initials:'PC', role:'Admin', isAdmin:true, active:true, lang:'es', permissions:{} };

// AppInner: contenido de la app una vez que ya existen el tema y el idioma.
// Controla la sesión (entrar / salir) y decide qué pantalla mostrar.
// No recibe props; devuelve el Login o el layout con las rutas.
function AppInner() {
  const { applyLang } = useT();
  // Se fuerza el idioma español, que es el único que usa el prototipo.
  applyLang('es');
  // Estado de sesión (true = ya inició sesión). Se lee de localStorage al arrancar para que
  // al recargar la página (F5) no se pida el login otra vez. El try/catch evita que la app se
  // rompa si el navegador bloquea el almacenamiento (modo privado, por ejemplo).
  const [sesion, setSesion] = useState(() => {
    try { return localStorage.getItem('pc_sesion') === '1'; } catch { return false; }
  });
  // entrar: se llama desde Login cuando las credenciales son correctas.
  // Guarda la marca "pc_sesion" en localStorage y cambia el estado para mostrar el sistema.
  const entrar = () => { try { localStorage.setItem('pc_sesion', '1'); } catch { /* sin almacenamiento */ } setSesion(true); };
  // salir: cierra la sesión desde el menú. Borra la marca de localStorage, regresa la URL a "/"
  // (para que el siguiente login empiece en Inicio y no en la última página) y vuelve al Login.
  const salir = () => {
    try { localStorage.removeItem('pc_sesion'); } catch { /* sin almacenamiento */ }
    window.history.replaceState({}, '', '/');
    setSesion(false);
  };

  // Puerta de login: mientras no haya sesión, ninguna ruta del sistema se monta, así que
  // escribir una URL a mano tampoco permite saltarse el login.
  if (!sesion) return <Login onLogin={entrar} />;

  // Con sesión iniciada: el router envuelve el layout (menú + barra superior) y las rutas
  // se pintan dentro de él como contenido.
  return (
    <BrowserRouter>
      <AppLayout user={DEFAULT_USER} onLogout={salir}>
        {/* Tabla de rutas: cada URL muestra una página. Las de /configuracion/* son las pantallas de administración. */}
        <Routes>
          <Route path="/" element={<Home user={DEFAULT_USER} />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/nuevo" element={<NuevoPedido user={DEFAULT_USER} />} />
          <Route path="/pedidos/dia/:fecha" element={<PedidosDia />} />
          <Route path="/dashboard/resumen" element={<Ventas />} />
          <Route path="/produccion/solicitudes" element={<SolicitudesCambio />} />
          <Route path="/configuracion/clientes" element={<ConfigClientes />} />
          <Route path="/configuracion/usuarios" element={<ConfigUsuarios />} />
          <Route path="/configuracion/productos" element={<ConfigProductos />} />
          {/* Cualquier URL desconocida se redirige a Inicio en lugar de mostrar una página en blanco. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

// App: componente que exporta este archivo y que monta main.jsx.
// Orden de los proveedores: tema de MUI (con CssBaseline para normalizar estilos del navegador)
// -> idioma -> AppInner, de modo que todo lo de abajo pueda usar tema e idioma.
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  );
}
