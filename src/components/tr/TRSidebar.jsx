// Component library: MUI
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Collapse } from '@mui/material';
import {
  Home as HomeIcon,
  FolderOpen as FolderIcon,
  Assignment as TaskIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';

const NAV = [
  { id: 'inicio', label: 'Portfolio Overview', icon: HomeIcon, path: '/tr/dashboard' },
  {
    id: 'registros', label: 'Registros', icon: FolderIcon,
    children: [
      { id: 'proyectos',  label: 'Panel de Proyectos',  path: '/tr/proyectos'  },
      { id: 'tareas',     label: 'Panel de Tareas',     path: '/tr/tareas'     },
      { id: 'financiero', label: 'Panel Financiero',    path: '/tr/financiero' },
    ],
  },
  {
    id: 'admin', label: 'Administración', icon: SettingsIcon,
    children: [
      { id: 'clientes', label: 'Clientes',        path: '/tr/clientes' },
      { id: 'usuarios', label: 'Usuarios',         path: '/tr/usuarios' },
      { id: 'roles',    label: 'Roles y Permisos', path: '/tr/roles'    },
    ],
  },
];

function DLogo({ size = 28 }) {
  return (
    <Box sx={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${DL.blue}, ${DL.navy})`,
      borderRadius: '8px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 16 16" fill="none">
        <path d="M3 2h4.5C10.537 2 13 4.463 13 8s-2.463 6-5.5 6H3V2z" fill="white" opacity="0.9" />
        <circle cx="8" cy="8" r="2.5" fill={DL.blue} />
      </svg>
    </Box>
  );
}

export default function TRSidebar({ open, onToggle }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({ registros: true, admin: false });

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const isActive = (path) => path && (pathname === path || (path !== '/tr' && pathname.startsWith(path)));

  return (
    <Box sx={{
      width: open ? 200 : 60,
      background: DL.dark,
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, height: '100vh',
      transition: 'width .2s ease',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <Box sx={{
        px: '14px', py: '12px',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        display: 'flex', alignItems: 'center', gap: '10px', minHeight: 52,
      }}>
        <DLogo size={28} />
        {open && (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '-.3px', lineHeight: 1 }}>
              TR Capital
            </Typography>
            <Typography sx={{ fontSize: 8, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Gestión de Proyectos
            </Typography>
          </Box>
        )}
      </Box>

      {/* Menu header */}
      <Box sx={{
        px: '14px', py: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,.05)',
      }}>
        {open && (
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Menú Principal
          </Typography>
        )}
        <Box
          onClick={onToggle}
          sx={{ cursor: 'pointer', color: 'rgba(255,255,255,.4)', display: 'flex', alignItems: 'center',
            '&:hover': { color: 'rgba(255,255,255,.8)' }, ml: open ? 0 : 'auto', mr: open ? 0 : 'auto' }}
        >
          <MenuIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: '6px', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const hasChildren = !!item.children;
          const exp = expanded[item.id];

          return (
            <Box key={item.id}>
              <Box
                onClick={() => hasChildren ? toggle(item.id) : navigate(item.path)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  px: '14px', py: '7px',
                  color: active ? '#fff' : 'rgba(255,255,255,.5)',
                  cursor: 'pointer',
                  borderLeft: `2px solid ${active ? DL.blue : 'transparent'}`,
                  background: active ? 'rgba(84,126,105,.14)' : 'transparent',
                  transition: 'all .14s',
                  '&:hover': { color: 'rgba(255,255,255,.85)', background: 'rgba(255,255,255,.05)' },
                  whiteSpace: 'nowrap',
                }}
              >
                <Box sx={{ opacity: active ? 1 : 0.55, flexShrink: 0, display: 'flex' }}>
                  <Icon sx={{ fontSize: 15 }} />
                </Box>
                {open && (
                  <>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: 'inherit', lineHeight: 1, flex: 1 }}>
                      {item.label}
                    </Typography>
                    {hasChildren && (
                      <Box sx={{ color: 'rgba(255,255,255,.3)', display: 'flex' }}>
                        {exp ? <ExpandLessIcon sx={{ fontSize: 13 }} /> : <ExpandMoreIcon sx={{ fontSize: 13 }} />}
                      </Box>
                    )}
                  </>
                )}
              </Box>

              {hasChildren && open && (
                <Collapse in={exp}>
                  {item.children.map((child) => {
                    const childActive = isActive(child.path);
                    return (
                      <Box
                        key={child.id}
                        onClick={() => navigate(child.path)}
                        sx={{
                          display: 'flex', alignItems: 'center',
                          pl: '36px', pr: '14px', py: '6px',
                          fontSize: 11, fontWeight: childActive ? 500 : 500,
                          color: childActive ? '#fff' : 'rgba(255,255,255,.38)',
                          cursor: 'pointer',
                          background: childActive ? 'rgba(84,126,105,.10)' : 'transparent',
                          borderLeft: `2px solid ${childActive ? DL.blue : 'transparent'}`,
                          transition: 'all .12s',
                          whiteSpace: 'nowrap',
                          '&:hover': { color: 'rgba(255,255,255,.75)', background: 'rgba(255,255,255,.04)' },
                        }}
                      >
                        {child.label}
                      </Box>
                    );
                  })}
                </Collapse>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
