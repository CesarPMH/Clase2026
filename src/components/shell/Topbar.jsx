// ─── Topbar ────────────────────────────────────────────────────────────────────
// Barra superior fija de la aplicación. Contiene el botón de menú (solo en celular),
// el nombre "Punto Cero" que lleva al inicio, el cambio de idioma, la ayuda, las
// notificaciones y el menú de la persona usuaria (con el cierre de sesión).
// La ve todo el personal que inicia sesión, en todas las pantallas.
// Librería de componentes: MUI.
import { useState } from 'react';
import {
  Box, Typography, Menu, MenuItem, Divider, Avatar, Tooltip,
} from '@mui/material';
import {
  NotificationsNoneRounded as BellIcon,
  HelpOutlineRounded as HelpIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';
import { useT } from '../../i18n/LanguageContext';

// Objetivo: dibujar la barra superior y manejar su menú de usuario.
// Props: user (usuario con sesión: name, role, email, initials), onLogout (cierra la sesión),
// onMenuToggle (abre/cierra el menú lateral; lo usa el botón hamburguesa).
// Devuelve: la barra fija de 45 px de alto.
export default function Topbar({ user, onLogout, onMenuToggle }) {
  // anchorEl guarda el elemento sobre el que se abre el menú de usuario (null = menú cerrado).
  const [anchorEl, setAnchorEl] = useState(null);
  const { t, lang, toggleLang } = useT();

  // Iniciales para el avatar: usa las que traiga el usuario; si no, las calcula con la primera letra de las dos primeras palabras del nombre.
  const initials = user?.initials || (user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'SK');

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 45,
      background: '#fff',
      zIndex: 1201,
      display: 'flex', alignItems: 'center',
      px: { xs: '10px', md: '16px' }, gap: '0',
      borderBottom: '1px solid #e3e3e3',
    }}>

      {/* Botón de menú: solo existe en celular, donde el menú lateral se abre como panel; en escritorio el menú ya está visible. */}
      <Box
        onClick={onMenuToggle}
        sx={{
          display: { xs: 'flex', md: 'none' },
          alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: '6px',
          mr: '6px', cursor: 'pointer', color: DL.tM, flexShrink: 0,
          '&:hover': { background: '#f6f6f6' }, transition: 'background .14s',
        }}
      >
        <MenuIcon sx={{ fontSize: 18 }} />
      </Box>

      {/* ── Izquierda: nombre de la empresa. Al hacer clic vuelve al inicio ("/").
          Por qué así: se cambia el historial del navegador y se lanza un evento popstate
          para que React Router detecte el cambio sin usar useNavigate aquí. ── */}
      <Box
        onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
        sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Company name */}
        <Typography sx={{
          fontFamily: "'Crimson Pro', Georgia, serif", fontSize: 22, fontWeight: 300, lineHeight: 1, color: DL.tH,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          minWidth: 0,
          display: { xs: 'none', sm: 'block' },
          '&:hover': { color: DL.blue },
          transition: 'color .14s',
        }}>
          Punto Cero
        </Typography>
      </Box>

      {/* Controles de la derecha. En pantallas pequeñas se ocultan textos (ayuda, nombre/rol) para que todo quepa. */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>

        {/* Language toggle */}
        <Box
          onClick={toggleLang}
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: '10px', py: '5px', borderRadius: '6px', cursor: 'pointer',
            border: '1px solid #e3e3e3',
            '&:hover': { background: '#f6f6f6', borderColor: '#d4d4d4' },
            transition: 'all .14s',
            gap: '5px',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, letterSpacing: '0.04em' }}>
            {lang === 'es' ? '🇺🇸 EN' : '🇬🇹 ES'}
          </Typography>
        </Box>

        {/* Help */}
        <Tooltip title={t('help.tooltip')} arrow>
          <Box
            component="a"
            href="#soporte"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex', alignItems: 'center', gap: '5px',
              px: { xs: '6px', md: '10px' }, py: '5px', borderRadius: '6px', cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': { background: '#f6f6f6' }, transition: 'background .14s',
            }}>
            <HelpIcon sx={{ fontSize: 16, color: DL.tS }} />
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, display: { xs: 'none', sm: 'block' } }}>
              {t('help.label')}
            </Typography>
          </Box>
        </Tooltip>

        {/* Bell */}
        <Tooltip title={t('notifications.tooltip')} arrow>
          <Box sx={{
            position: 'relative', display: 'flex', alignItems: 'center',
            p: '6px', borderRadius: '6px', cursor: 'pointer',
            '&:hover': { background: '#f6f6f6' }, transition: 'background .14s',
          }}>
            <BellIcon sx={{ fontSize: 17, color: DL.tS }} />
            <Box sx={{
              position: 'absolute', top: 5, right: 5,
              width: 6, height: 6, borderRadius: '50%',
              background: DL.green, border: '1.5px solid #fff',
            }} />
          </Box>
        </Tooltip>

        {/* Al hacer clic se abre el menú desplegable (ver "User dropdown" más abajo). */}
        <Box
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: '8px',
            ml: '2px', pl: '8px', pr: { xs: '4px', md: '10px' }, py: '4px',
            borderRadius: '8px', cursor: 'pointer',
            border: '1px solid transparent',
            transition: 'all .14s',
            '&:hover': { background: '#f6f6f6', borderColor: '#e3e3e3' },
          }}
        >
          <Avatar sx={{
            width: 27, height: 27, fontSize: 9, fontWeight: 500,
            background: DL.dark,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            letterSpacing: '-.3px',
          }}>
            {initials}
          </Avatar>
          {/* Name/role — hidden on mobile */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              {user?.name || 'Steven K.'}
            </Typography>
            <Typography sx={{ fontSize: 9, color: DL.tS, lineHeight: 1, whiteSpace: 'nowrap' }}>
              {user?.role || 'Admin'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── User dropdown ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { elevation: 3, sx: { mt: '8px', minWidth: 200, border: `1px solid ${DL.border}`, borderRadius: '10px' } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: '16px', py: '12px' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>{user?.name || 'Steven K.'}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS, mt: '1px' }}>{user?.email || 'demo@puntocero.com'}</Typography>
        </Box>
        <Divider sx={{ borderColor: DL.border }} />
        <MenuItem
          onClick={() => { setAnchorEl(null); onLogout(); }}
          sx={{ fontSize: 12, fontWeight: 500, color: DL.red, py: '9px', mx: '6px', borderRadius: '6px', my: '4px' }}
        >
          {t('user.logout')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
