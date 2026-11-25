// Component library: MUI
import { useState } from 'react';
import { Box } from '@mui/material';
import TRSidebar from './TRSidebar';
import TRTopbar from './TRTopbar';
import { DL } from '../../theme';

export default function TRLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <TRSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TRTopbar />
        <Box sx={{
          flex: 1, overflowY: 'auto', overflowX: 'clip',
          background: '#fff',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(26,26,26,.15) transparent',
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(26,26,26,.15)', borderRadius: 4 },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
