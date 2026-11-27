// ─── AppLayout ─────────────────────────────────────────────────────────────────
// Estructura general de la aplicación una vez que la persona inició sesión:
// barra superior (Topbar), menú lateral (Sidebar) y el área donde se muestra cada página.
// Todas las pantallas se pintan dentro de este layout (como "children"), así el menú
// y la barra no se vuelven a crear al cambiar de página.
// Librería de componentes: MUI (Box).
// Component library: MUI (Box)
import { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DL } from '../../theme';
import { useActivityTracking } from '../../hooks/useActivityTracking';

// Anchos del menú lateral en píxeles. El colapsado (65) es el que deja de margen el contenido en escritorio.
const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 65;

// Objetivo: armar el marco de la aplicación (barra + menú + contenido).
// Props: user (usuario con sesión), onLogout (función para cerrar sesión), children (la página actual).
// Devuelve: el layout completo con la página dentro del área de contenido.
export default function AppLayout({ user, onLogout, children }) {
  // sidebarOpen controla si el menú está desplegado; en celular se abre como panel encima del contenido.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Registra la actividad del usuario (para saber qué módulos usa); se llama aquí porque este componente vive mientras dure la sesión.
  useActivityTracking(user);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Fixed Header ───────────────────────────────────────────────── */}
      <Topbar user={user} onLogout={onLogout} onMenuToggle={() => setSidebarOpen(o => !o)} />

      {/* ── Fixed Sidebar ──────────────────────────────────────────────── */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
      />

      {/* ── Backdrop — closes sidebar when clicking outside ────────────── */}
      {sidebarOpen && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: 'fixed', inset: 0,
            zIndex: 1199,
            background: 'rgba(0,0,0,.45)',
            backdropFilter: 'blur(1px)',
          }}
        />
      )}

      {/* Área de contenido. Por qué estas medidas:
         - marginTop 45px y alto calc(100vh - 45px): deja libre la barra superior fija y el scroll es solo de esta zona.
         - marginLeft: el menú es fijo, así que en escritorio se reserva su ancho colapsado; en celular no hay margen.
         - minWidth 0 y overflowX hidden evitan que tablas anchas ensanchen toda la página.
      */}
      {/* ── Content area ── */}
      <Box sx={{
        marginTop: '45px',
        // On mobile: full width (sidebar is overlay). On desktop: offset by collapsed sidebar.
        marginLeft: { xs: 0, md: `${SIDEBAR_COLLAPSED}px` },
        height: 'calc(100vh - 45px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: DL.bg,
        flex: 1,
        minWidth: 0,
        scrollbarWidth: 'thin',
        scrollbarColor: '#d4d4d4 transparent',
        '&::-webkit-scrollbar':       { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: '#d4d4d4', borderRadius: 4 },
        pb: 0,
      }}>
        {children}
      </Box>
    </Box>
  );
}
