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
import './data/configuracion'; // sincroniza clientes y productos activos con "Pedido Nuevo"

const DEFAULT_USER = { id:'demo', email:'user123@gmail.com', name:'Demo User', initials:'PC', role:'Admin', isAdmin:true, active:true, lang:'es', permissions:{} };

function AppInner() {
  const { applyLang } = useT();
  applyLang('es');
  const [sesion, setSesion] = useState(() => {
    try { return localStorage.getItem('pc_sesion') === '1'; } catch { return false; }
  });
  const entrar = () => { try { localStorage.setItem('pc_sesion', '1'); } catch { /* sin almacenamiento */ } setSesion(true); };
  const salir = () => {
    try { localStorage.removeItem('pc_sesion'); } catch { /* sin almacenamiento */ }
    window.history.replaceState({}, '', '/');
    setSesion(false);
  };

  if (!sesion) return <Login onLogin={entrar} />;

  return (
    <BrowserRouter>
      <AppLayout user={DEFAULT_USER} onLogout={salir}>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

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
