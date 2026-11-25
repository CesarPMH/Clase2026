// Component library: MUI (Box)
import { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { DL } from '../../theme';
import { useActivityTracking } from '../../hooks/useActivityTracking';

const SIDEBAR_EXPANDED  = 240;
const SIDEBAR_COLLAPSED = 65;

export default function AppLayout({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
