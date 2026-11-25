// Component library: MUI (Box, Typography, Tooltip)
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import { useT } from '../../i18n/LanguageContext';
import {
  AdminPanelSettings as AdminIcon,
  PowerSettingsNew as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Inventory as ProduccionIcon,
  Settings as ConfigIcon,
  HomeOutlined as HomeIcon,
  Store as SucursalIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';

// ─── Sidebar widths ───────────────────────────────────────────────────────────
const W_EXPANDED  = 240;
const W_COLLAPSED = 65;

// ─── Navigation tree ─────────────────────────────────────────────────────────
const NAV = [
  {
    label: 'Inicio',
    items: [
      { id: 'inicio', label: 'Inicio', icon: <HomeIcon sx={{ fontSize: 18 }} />, path: '/' },
    ],
  },
  {
    label: 'Dashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon sx={{ fontSize: 18 }} />,
        isGroup: true,
        children: [
          { id: 'dashboard-resumen',  label: 'Dashboard de Ventas', path: '/dashboard/resumen' },
        ],
      },
    ],
  },
  {
    label: 'Pedidos Sucursal',
    items: [
      {
        id: 'pedidos-sucursal',
        label: 'Pedidos Sucursal',
        icon: <SucursalIcon sx={{ fontSize: 18 }} />,
        isGroup: true,
        children: [
          { id: 'pedidos-nuevo',     label: 'Pedido Nuevo',       path: '/pedidos/nuevo' },
          { id: 'pedidos-registro',  label: 'Registro de Pedidos',path: '/pedidos' },
        ],
      },
    ],
  },
  {
    label: 'Producción',
    items: [
      {
        id: 'produccion',
        label: 'Producción',
        icon: <ProduccionIcon sx={{ fontSize: 18 }} />,
        isGroup: true,
        children: [
          { id: 'prod-calendario',   label: 'Calendario de Pedidos',path: '/pedidos?vista=calendario' },
          { id: 'prod-gestion',      label: 'Gestión de Pedidos',   path: '/pedidos?vista=gestion' },
          { id: 'prod-solicitudes',  label: 'Solicitudes de Cambios',path: '/produccion/solicitudes' },
        ],
      },
    ],
  },
];

// ─── Translation key maps ─────────────────────────────────────────────────────
const NAV_LABEL_KEYS = {
  'pedidos-registro':   'nav.pedidosRegistro',
  'pedidos-gestion':    'nav.pedidosGestion',
  'pedidos-calendario': 'nav.pedidosCalendario',
  ventas: 'nav.ventas',
  clientes: 'nav.clientes',
  segmento: 'nav.segmento',
  productos: 'nav.productos',
  'producto-detalle': 'nav.productoDetalle',
  desempeno: 'nav.desempeno',
  tienda: 'nav.tienda',
  vendedor: 'nav.vendedor',
  metas: 'nav.metas',
  finanzas: 'nav.finanzas',
  estado: 'nav.estado',
  balance: 'nav.balance',
  'cuentas-cobrar': 'nav.cuentasCobrar',
  'cuentas-pagar': 'nav.cuentasPagar',
  'aging-saldos': 'nav.agingSaldos',
  inventarios: 'nav.inventarios',
  compras: 'nav.compras',
  egresos: 'nav.egresos',
  'movimientos-bodega': 'nav.movimientosBodega',
  produccion: 'nav.produccion',
  costos: 'nav.costos',
  soporte: 'nav.soporte',
  'soporte-admin': 'nav.soporteAdmin',
  'santa-ana': 'nav.santaAna',
};

const SECTION_LABEL_KEYS = {
  'Comercial': 'section.comercial',
  'Administración': 'section.admin',
  'Financiero': 'section.financiero',
  'Tesorería': 'section.tesoreria',
  'Logístico': 'section.logistico',
  'Operaciones': 'section.operaciones',
  'Ayuda': 'section.ayuda',
  'Santa Ana': 'section.santaAna',
};

// ─── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({ item, open, isActive, onClick, t, groupExpanded, onToggleGroup, pathname, search }) {
  const isSoon   = item.soon;
  const isChild  = item.child;
  const isAction = item.isAction;
  const isGroup  = item.isGroup;

  // ── Action button (pill azul) ──────────────────────────────────────────────
  if (isAction) {
    if (!open) return null;
    return (
      <Box sx={{ px: '16px', py: '8px' }}>
        <Box onClick={() => onClick(item.path)} sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          py: '6px', borderRadius: '4px',
          background: '#fff', border: '1px solid #1a1a1a', cursor: 'pointer',
          transition: 'background .14s',
          '&:hover': { background: '#46695a' },
        }}>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#1a1a1a', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", whiteSpace: 'nowrap' }}>
            {item.label}
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── Group header (collapsible parent) ─────────────────────────────────────
  if (isGroup) {
    const expanded = groupExpanded;
    // Check if any child is active
    const fullCurrent = pathname + search;
    const anyChildActive = item.children?.some(ch => {
      const [cp, cq] = ch.path.split('?');
      if (cq) return fullCurrent === ch.path;
      return pathname === cp && !search;
    });

    if (!open) {
      // Collapsed sidebar: show just the icon with tooltip
      return (
        <Tooltip title={item.label} placement="right" arrow>
          <Box onClick={onToggleGroup} sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            py: '7px', cursor: 'pointer',
            borderLeft: `2px solid ${anyChildActive ? DL.blue : 'transparent'}`,
            background: anyChildActive ? '#dedede' : 'transparent',
            '&:hover': { background: '#dedede' },
            transition: 'all .14s',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: anyChildActive ? '#1a1a1a' : 'rgba(26,26,26,.6)', minWidth: W_COLLAPSED - 2 }}>
              {item.icon}
            </Box>
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box>
        {/* Group header row */}
        <Box onClick={onToggleGroup} sx={{
          display: 'flex', alignItems: 'center', gap: '10px',
          pl: '16px', pr: '12px', py: '7px',
          cursor: 'pointer',
          borderLeft: `2px solid ${anyChildActive ? DL.blue : 'transparent'}`,
          background: anyChildActive ? '#dedede' : 'transparent',
          transition: 'all .14s',
          '&:hover': { background: '#dedede' },
        }}>
          <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: anyChildActive ? '#1a1a1a' : 'rgba(26,26,26,.6)', opacity: anyChildActive ? 1 : 0.7 }}>
            {item.icon}
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', flex: 1, whiteSpace: 'nowrap', lineHeight: 1 }}>
            {item.label}
          </Typography>
          <Box sx={{ color: 'rgba(26,26,26,.70)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </Box>
        </Box>

        {/* Children */}
        {expanded && item.children?.map(child => {
          const [childPath, childQuery] = child.path.split('?');
          const fullCurrent = pathname + search;
          const childActive = !child.soon && (
            childQuery
              ? fullCurrent === child.path || fullCurrent.startsWith('?' + childQuery)
              : pathname === childPath && !search
          );
          return (
            <Box
              key={child.id}
              onClick={() => !child.soon && onClick(child.path)}
              sx={{
                display: 'flex', alignItems: 'center', gap: '8px',
                pl: '36px', pr: '14px', py: '6px',
                cursor: child.soon ? 'default' : 'pointer',
                borderLeft: `2px solid ${childActive ? DL.blue : 'transparent'}`,
                background: childActive ? '#dedede' : 'transparent',
                transition: 'all .13s',
                '&:hover': !child.soon ? { background: '#dedede' } : {},
              }}
            >
              <Typography sx={{
                fontSize: 11,
                fontWeight: childActive ? 500 : 500,
                color: childActive ? '#1a1a1a' : child.soon ? 'rgba(26,26,26,.22)' : 'rgba(26,26,26,.6)',
                flex: 1, whiteSpace: 'nowrap', lineHeight: 1,
              }}>
                {child.label}
              </Typography>
              {child.soon && (
                <Box sx={{ fontSize: 7, fontWeight: 500, background: 'rgba(26,26,26,.07)', color: 'rgba(26,26,26,.25)', px: '4px', py: '1px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
                  Pronto
                </Box>
              )}
              {!child.soon && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: childActive ? DL.blue : 'rgba(26,26,26,.15)' }} />
              )}
            </Box>
          );
        })}
      </Box>
    );
  }

  // ── Regular item ──────────────────────────────────────────────────────────
  const content = (
    <Box
      onClick={() => !isSoon && onClick(item.path)}
      sx={{
        display: 'flex', alignItems: 'center',
        gap: open ? '10px' : 0,
        pl: open ? (isChild ? '30px' : '16px') : 0,
        pr: open ? '14px' : 0,
        py: isChild ? '5px' : '7px',
        justifyContent: open ? 'flex-start' : 'center',
        cursor: isSoon ? 'default' : 'pointer',
        borderLeft: `2px solid ${isActive ? DL.blue : 'transparent'}`,
        background: isActive ? '#dedede' : 'transparent',
        transition: 'all .14s', userSelect: 'none', overflow: 'hidden',
        '&:hover': !isSoon ? { background: isActive ? '#dedede' : '#dedede', color: '#1a1a1a' } : {},
      }}
    >
      {open && isChild && <Box sx={{ width: 6, height: 1, background: 'rgba(26,26,26,.2)', flexShrink: 0, mr: '-4px' }} />}
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 1 : isSoon ? 0.2 : isChild ? 0.5 : 0.6, color: '#1a1a1a', minWidth: open ? 'auto' : W_COLLAPSED - 2 }}>
        {item.icon}
      </Box>
      {open && (
        <Typography sx={{ fontSize: isChild ? 11 : 12, fontWeight: isActive ? 500 : 500, color: isActive ? '#1a1a1a' : isSoon ? 'rgba(26,26,26,.2)' : isChild ? 'rgba(26,26,26,.5)' : 'rgba(26,26,26,.65)', lineHeight: 1, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'opacity .15s' }}>
          {item.label || t(NAV_LABEL_KEYS[item.id] || item.id)}
        </Typography>
      )}
      {open && !isSoon && <Box sx={{ width: isChild ? 4 : 5, height: isChild ? 4 : 5, borderRadius: '50%', flexShrink: 0, background: isActive ? DL.blue : 'rgba(26,26,26,.15)' }} />}
    </Box>
  );

  if (!open) {
    return (
      <Tooltip title={item.label || t(NAV_LABEL_KEYS[item.id] || item.id) + (isSoon ? ' (Pronto)' : '')} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }
  return content;
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar({ open, onToggle, onClose, onLogout, user }) {
  const navigate  = useNavigate();
  const { pathname, search } = useLocation();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useT();

  // Track which groups are expanded (by item id). Default: pedidos expanded.
  const [expandedGroups, setExpandedGroups] = useState({ 'pedidos-sucursal': true });

  const toggleGroup = (id) => setExpandedGroups(prev => ({ [id]: !prev[id] }));

  // On mobile: completely hidden (0) when closed. On desktop: icon strip (65px).
  const sidebarWidth = open ? W_EXPANDED : (isMobile ? 0 : W_COLLAPSED);

  const handleNav = (path) => {
    navigate(path);
    onClose(); // collapse after navigation
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      width: sidebarWidth,
      background: '#ececec',
      borderRight: '1px solid #d4d4d4',
      zIndex: 1200,
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      // Expand: 225ms · Collapse: 195ms (per spec)
      transition: open
        ? 'width 225ms cubic-bezier(0.4,0,0.6,1)'
        : 'width 195ms cubic-bezier(0.4,0,0.6,1)',
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
    }}>

      {/* ── DrawerHeader — empty space behind fixed Topbar ── */}
      <Box sx={{ height: 45, flexShrink: 0 }} />

      {/* ── Toggle / hamburger row ───────────────────────────────────── */}
      <Box sx={{
        height: 48,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid rgba(26,26,26,.07)',
        flexShrink: 0,
        cursor: 'pointer',
        '&:hover': { background: 'rgba(26,26,26,.09)' },
        transition: 'background .14s',
      }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'rgba(26,26,26,.6)' }}>
          {open ? <CloseIcon sx={{ fontSize: 18 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
        </Box>
      </Box>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, py: '6px' }}>
        {NAV.map((section) => (
          <Box key={section.label} sx={{ mb: '4px' }}>

            {/* Divider between sections */}
            {!open && (
              <Box sx={{ height: '1px', background: 'rgba(26,26,26,.06)', mx: '10px', mb: '2px', mt: '6px' }} />
            )}

            {section.items.map((item) => {
              if (item.isGroup) {
                return (
                  <NavItem
                    key={item.id}
                    item={item}
                    open={open}
                    isActive={false}
                    onClick={handleNav}
                    t={t}
                    groupExpanded={!!expandedGroups[item.id]}
                    onToggleGroup={() => toggleGroup(item.id)}
                    pathname={pathname}
                    search={search}
                  />
                );
              }
              const [itemPath, itemQuery] = item.path ? item.path.split('?') : ['', ''];
              const fullCurrent = pathname + search;
              const isActive = itemQuery
                ? fullCurrent === item.path || fullCurrent.startsWith(item.path)
                : (pathname === itemPath && !search) || (item.path && item.path !== '/' && pathname.startsWith(itemPath) && !itemQuery && !search.includes('tab='));
              return (
                <NavItem
                  key={item.id}
                  item={item}
                  open={open}
                  isActive={isActive}
                  onClick={handleNav}
                  t={t}
                  pathname={pathname}
                  search={search}
                />
              );
            })}
          </Box>
        ))}
      </Box>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <Box sx={{
        borderTop: '1px solid rgba(26,26,26,.07)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Configuración */}
        <Tooltip title="Configuración" placement="right" arrow disableHoverListener={open}>
          <Box
            onClick={() => handleNav('/configuracion/clientes')}
            sx={{
              display: 'flex', alignItems: 'center',
              gap: open ? '10px' : 0,
              px: open ? '16px' : 0,
              py: '9px',
              justifyContent: open ? 'flex-start' : 'center',
              cursor: 'pointer',
              borderLeft: `2px solid ${pathname.startsWith('/configuracion') ? DL.blue : 'transparent'}`,
              background: pathname.startsWith('/configuracion') ? '#dedede' : 'transparent',
              '&:hover': { background: '#dedede' },
              transition: 'all .14s',
            }}
          >
            <Box sx={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: pathname.startsWith('/configuracion') ? '#1a1a1a' : 'rgba(26,26,26,.5)',
              minWidth: open ? 'auto' : W_COLLAPSED - 2,
            }}>
              <ConfigIcon sx={{ fontSize: 16 }} />
            </Box>
            {open && (
              <Typography sx={{
                fontSize: 11, fontWeight: 500,
                color: pathname.startsWith('/configuracion') ? '#1a1a1a' : 'rgba(26,26,26,.5)',
                whiteSpace: 'nowrap',
              }}>
                Configuración
              </Typography>
            )}
          </Box>
        </Tooltip>

        {/* Logout row */}
        <Box sx={{
          display: 'flex', alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          px: open ? '16px' : '0',
          py: '10px',
          minHeight: 44,
        }}>
          {open && (
            <Typography sx={{ fontSize: 9, color: 'rgba(26,26,26,.5)', whiteSpace: 'nowrap' }}>
              Punto Cero
            </Typography>
          )}
          <Tooltip title={t('user.logout')} placement="right" arrow disableHoverListener={open}>
            <Box
              component="button"
              onClick={onLogout}
              sx={{
                display: 'flex', alignItems: 'center', gap: open ? '5px' : 0,
                fontSize: 9, fontWeight: 500, color: 'rgba(26,26,26,.3)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                transition: 'color .14s',
                '&:hover': { color: 'rgba(26,26,26,.65)' },
              }}
            >
              <LogoutIcon sx={{ fontSize: 14 }} />
              {open && 'Salir'}
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
