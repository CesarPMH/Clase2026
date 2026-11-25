// Piezas compartidas de las vistas de Configuración
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Dialog, DialogContent, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Add as AddIcon, MoreVert as MoreVertIcon, PeopleAltOutlined as PeopleIcon, BadgeOutlined as BadgeIcon, CategoryOutlined as CategoryIcon } from '@mui/icons-material';
import { DL } from '../../theme';

export const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
export const SERIF = "'Crimson Pro','Cormorant Garamond',Georgia,serif";

export const th = { textAlign: 'left', fontFamily: F, fontSize: 11, fontWeight: 500, color: DL.tH, padding: '10px 12px', borderBottom: `1px solid ${DL.tH}`, whiteSpace: 'nowrap', background: 'transparent' };
export const td = { fontFamily: F, fontSize: 11, color: DL.tM, padding: '12px', borderBottom: `1px dotted ${DL.border2}`, verticalAlign: 'middle' };

export function BtnOutline({ children, onClick, color = DL.tH, disabled, filled }) {
  return (
    <Box onClick={disabled ? undefined : onClick} sx={{
      px: '12px', py: '6px', borderRadius: '7px', border: `1px solid ${color}`,
      background: filled ? color : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
      display: 'inline-block', '&:hover': disabled ? {} : { background: filled ? color : DL.bg, opacity: filled ? 0.9 : 1 }, transition: 'all .14s',
    }}>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: filled ? '#fff' : color, fontFamily: F, whiteSpace: 'nowrap' }}>{children}</Typography>
    </Box>
  );
}

export function Card({ children }) {
  return <Box sx={{ background: '#fff', borderRadius: '12px', border: `1px solid ${DL.border}`, overflow: 'hidden' }}>{children}</Box>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, px: '8px', pt: '4px', overflowX: 'auto' }}>
      {tabs.map(t => (
        <Box key={t.id} component="button" onClick={() => onChange(t.id)} sx={{
          fontFamily: F, fontSize: 11, fontWeight: 500, px: '14px', py: '8px',
          border: 'none', borderBottom: `2px solid ${value === t.id ? DL.blue : 'transparent'}`, mb: '-1px',
          background: 'transparent', color: value === t.id ? DL.navy : DL.tS, cursor: 'pointer', whiteSpace: 'nowrap',
          '&:hover': { color: DL.tM },
        }}>
          {t.label}{t.count !== undefined && <Box component="span" sx={{ color: DL.tS, fontWeight: 400 }}> ({t.count})</Box>}
        </Box>
      ))}
    </Box>
  );
}

export function TableWrap({ children, minWidth = 800 }) {
  return (
    <Box sx={{ p: '12px' }}>
      <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth }}>{children}</table>
      </Box>
    </Box>
  );
}

export function Interruptor({ activo, onChange, disabled }) {
  return (
    <Box onClick={disabled ? undefined : () => onChange(!activo)} role="switch" aria-checked={activo} sx={{
      width: 34, height: 18, borderRadius: '9px', position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
      background: activo ? DL.green : '#c9c9c9', transition: 'background .16s', flexShrink: 0, opacity: disabled ? 0.5 : 1,
    }}>
      <Box sx={{ position: 'absolute', top: 2, left: activo ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .16s', boxShadow: '0 1px 2px rgba(0,0,0,.25)' }} />
    </Box>
  );
}

export function Etiqueta({ children, color = DL.tM }) {
  return (
    <Box sx={{ display: 'inline-block', px: '8px', py: '2px', borderRadius: '10px', border: `1px solid ${color}`, }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color, fontFamily: F, whiteSpace: 'nowrap' }}>{children}</Typography>
    </Box>
  );
}

export function Campo({ label, requerido, error, children, flex }) {
  return (
    <Box sx={{ flex: flex ?? 'unset', minWidth: 0 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', color: DL.tS, fontFamily: F, mb: '5px' }}>
        {label}{requerido && ' *'}
      </Typography>
      {children}
      {error && <Typography sx={{ fontSize: 10, color: DL.red, fontFamily: F, mt: '3px' }}>{error}</Typography>}
    </Box>
  );
}

export const inputSx = (error) => ({
  width: '100%', boxSizing: 'border-box', fontFamily: F, fontSize: 12, color: DL.tH, p: '9px 11px', borderRadius: '8px', background: '#fff',
  border: `1px solid ${error ? DL.red : DL.border2}`, outline: 'none', '&:focus': { borderColor: DL.tH },
});

export function Dialogo({ abierto, onCerrar, titulo, subtitulo, children, acciones, ancho = 'sm', icono }) {
  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth={ancho} fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', border: `1px solid ${DL.border}`, boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden' } } }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '14px', px: '28px', pt: '24px', pb: '18px', borderBottom: `1px solid ${DL.border}` }}>
        {icono && (
          <Box sx={{ width: 42, height: 42, borderRadius: '12px', background: '#eef3f0', color: DL.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {icono}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 28, lineHeight: 1.1, color: DL.tH }}>{titulo}</Typography>
          {subtitulo && <Typography sx={{ fontSize: 12, color: DL.tS, fontFamily: F, mt: '4px' }}>{subtitulo}</Typography>}
        </Box>
        <Box component="button" onClick={onCerrar} aria-label="Cerrar" sx={{
          width: 28, height: 28, borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer',
          color: DL.tS, fontSize: 15, '&:hover': { background: DL.bg, color: DL.tH },
        }}>✕</Box>
      </Box>
      {/* Contenido */}
      <DialogContent sx={{ px: '28px', py: '22px' }}>{children}</DialogContent>
      {/* Pie */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', px: '28px', py: '16px', background: '#fafafa', borderTop: `1px solid ${DL.border}` }}>
        {acciones}
      </Box>
    </Dialog>
  );
}

// Título de sección dentro de un formulario
export function Seccion({ titulo, extra, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '10px' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: DL.tH, fontFamily: F }}>{titulo}</Typography>
        <Box sx={{ flex: 1, height: '1px', background: DL.border }} />
        {extra}
      </Box>
      {children}
    </Box>
  );
}

// Selector de dos o más opciones tipo botones
export function Segmentado({ opciones, valor, onChange }) {
  return (
    <Box sx={{ display: 'inline-flex', p: '3px', borderRadius: '10px', background: '#f0f0ee', gap: '2px' }}>
      {opciones.map(o => {
        const on = valor === o;
        return (
          <Box key={o} onClick={() => onChange(o)} sx={{
            px: '18px', py: '7px', borderRadius: '8px', cursor: 'pointer', background: on ? '#fff' : 'transparent',
            boxShadow: on ? '0 1px 3px rgba(0,0,0,.12)' : 'none', transition: 'all .14s',
          }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, fontFamily: F, color: on ? DL.tH : DL.tS }}>{o}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

export function Confirmar({ abierto, titulo, texto, textoBoton = 'Eliminar', onCerrar, onConfirmar }) {
  return (
    <Dialogo abierto={abierto} onCerrar={onCerrar} titulo={titulo} subtitulo={texto}
      acciones={<>
        <BtnOutline color={DL.tM} onClick={onCerrar}>Cancelar</BtnOutline>
        <BtnOutline color={DL.red} onClick={onConfirmar}>{textoBoton}</BtnOutline>
      </>} />
  );
}

export function Aviso({ children }) {
  return (
    <Box sx={{ px: '16px', py: '10px', background: '#f7f7f4', borderBottom: `1px solid ${DL.border}` }}>
      <Typography sx={{ fontSize: 11, color: DL.tM, fontFamily: F, lineHeight: 1.5 }}>{children}</Typography>
    </Box>
  );
}

// Menú lateral secundario de la sección Configuración (a la derecha del menú principal)
const CONFIG_ITEMS = [
  { path: '/configuracion/clientes', label: 'Clientes', icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
  { path: '/configuracion/usuarios', label: 'Usuarios', icon: <BadgeIcon sx={{ fontSize: 16 }} /> },
  { path: '/configuracion/productos', label: 'Productos', icon: <CategoryIcon sx={{ fontSize: 16 }} /> },
];

export function ConfigSideMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <Box sx={{
      width: { xs: '100%', md: 150 }, flexShrink: 0, background: '#e6e6e6', borderRight: { md: '1px solid #d0d0d0' }, borderBottom: { xs: '1px solid #d0d0d0', md: 'none' },
      display: 'flex', flexDirection: { xs: 'row', md: 'column' }, overflowX: 'auto', py: { md: '22px' },
    }}>
      <Typography sx={{ display: { xs: 'none', md: 'block' }, px: '16px', pb: '12px', fontSize: 9, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(26,26,26,.45)', fontFamily: F }}>
        Configuración
      </Typography>
      {CONFIG_ITEMS.map(i => {
        const on = pathname === i.path;
        return (
          <Box key={i.path} onClick={() => navigate(i.path)} sx={{
            display: 'flex', alignItems: 'center', gap: '9px', px: '16px', py: '9px', cursor: 'pointer', whiteSpace: 'nowrap',
            borderLeft: { md: `2px solid ${on ? DL.blue : 'transparent'}` }, background: on ? '#d6d6d6' : 'transparent',
            color: on ? '#1a1a1a' : 'rgba(26,26,26,.6)', transition: 'all .14s', '&:hover': { background: '#dcdcdc', color: '#1a1a1a' },
          }}>
            {i.icon}
            <Typography sx={{ fontSize: 11, fontWeight: 500, fontFamily: F, color: 'inherit' }}>{i.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// Envuelve cada vista de Configuración: menú secundario + contenido
export function ConfigShell({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%', overflow: 'hidden' }}>
      <ConfigSideMenu />
      <Box sx={{ flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>{children}</Box>
    </Box>
  );
}

// Botón de tres puntos: abre las acciones de la fila.
// opciones: [{ label, onClick, color?, separadorAntes?, oculto? }]
export function MenuAcciones({ opciones }) {
  const [anchor, setAnchor] = useState(null);
  const cerrar = () => setAnchor(null);
  const visibles = opciones.filter(o => !o.oculto);
  return (
    <>
      <IconButton size="small" onClick={e => { e.stopPropagation(); setAnchor(e.currentTarget); }} aria-label="Acciones"
        sx={{ color: DL.tS, '&:hover': { color: DL.tH, background: 'rgba(26,26,26,.06)' } }}>
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={cerrar} onClick={e => e.stopPropagation()}
        slotProps={{ paper: { sx: { borderRadius: '12px', border: `1px solid ${DL.border}`, boxShadow: '0 6px 24px rgba(0,0,0,.12)', minWidth: 180 } } }}>
        {visibles.map((o, i) => {
          const c = o.color || DL.tH;
          return [
            o.separadorAntes && i > 0 && <Box key={`sep${i}`} sx={{ borderTop: `1px solid ${DL.border}`, my: '4px' }} />,
            <MenuItem key={o.label} onClick={() => { cerrar(); o.onClick(); }}
              sx={{ fontSize: 12, fontFamily: F, color: c, fontWeight: 500, px: '14px', py: '8px', '&:hover': { background: `${c}12` } }}>
              {o.label}
            </MenuItem>,
          ];
        })}
      </Menu>
    </>
  );
}

// Botón cuadrado solo con ícono (la palabra aparece como ayuda al pasar el cursor)
export function BotonIcono({ icono, titulo, onClick, filled, color = DL.tH, disabled }) {
  return (
    <Tooltip title={titulo} arrow>
      <span>
        <Box component="button" onClick={onClick} disabled={disabled} aria-label={titulo} sx={{
          width: 34, height: 34, borderRadius: '8px', border: `1px solid ${color}`, cursor: disabled ? 'not-allowed' : 'pointer',
          background: filled ? color : '#fff', color: filled ? '#fff' : color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: disabled ? 0.4 : 1, transition: 'all .14s', '&:hover': disabled ? {} : { opacity: filled ? 0.88 : 1, background: filled ? color : DL.bg },
        }}>{icono}</Box>
      </span>
    </Tooltip>
  );
}
export const IconoMas = <AddIcon sx={{ fontSize: 18 }} />;
