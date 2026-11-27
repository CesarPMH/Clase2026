// ─── Inicio de sesión de Punto Cero ─────────────────────────────────────────────
// Acceso de demostración: un único usuario. Las credenciales están en el código del
// front-end (no hay servidor), por lo que sirven solo como puerta del prototipo.
// Se relaciona con App.jsx: Login solo valida y avisa con onLogin(); App es quien guarda
// la sesión en localStorage (clave "pc_sesion") y cambia a la vista del sistema.
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Credenciales válidas del prototipo (se exportan por si otra pantalla las necesita).
// Son fijas y visibles en el código porque no hay servidor que las verifique.
export const USUARIO_DEMO = { email: 'user123@gmail.com', password: 'puntocero123' };

// Constantes de diseño (tipografías y colores) para mantener el estilo de la marca en toda la pantalla.
const F = "'Inter', ui-sans-serif, system-ui, sans-serif";
const SERIF = "'Crimson Pro', Georgia, serif";
const INK = '#1a1a1a';
const SAGE = '#547e69';

// Campo: caja de texto con etiqueta, reutilizada para correo y contraseña.
// Recibe: label, type, value/onChange (valor controlado), placeholder, autoComplete,
// error (true pinta el borde rojo) y extra (elemento opcional a la derecha, como el ojo).
// Devuelve el campo ya con estilos.
function Campo({ label, type, value, onChange, placeholder, autoComplete, error, extra }) {
  return (
    <Box sx={{ mb: '18px' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: INK, fontFamily: F, mb: '7px' }}>{label}</Typography>
      <Box sx={{ position: 'relative' }}>
        <Box component="input" type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          sx={{
            width: '100%', boxSizing: 'border-box', p: extra ? '13px 44px 13px 14px' : '13px 14px',
            border: `1.5px solid ${error ? '#d9534f' : '#d4d4d4'}`, borderRadius: '8px', fontFamily: F, fontSize: 13, color: INK,
            background: '#fff', outline: 'none', transition: 'border-color .18s',
            '&::placeholder': { color: '#8d8d8d' }, '&:focus': { borderColor: INK },
          }} />
        {extra && <Box sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>{extra}</Box>}
      </Box>
    </Box>
  );
}

// Login: pantalla de inicio de sesión (puerta de entrada al sistema).
// Recibe onLogin, función que App ejecuta para abrir la sesión.
// Muestra un panel de marca (solo en pantallas grandes) y el formulario.
export default function Login({ onLogin }) {
  // Estados del formulario: lo escrito en correo y contraseña, si se ve la contraseña
  // (ojo) y el mensaje de error.
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');

  // enviar: se ejecuta al enviar el formulario. Compara con USUARIO_DEMO; el correo se
  // limpia (espacios y mayúsculas) y la contraseña se compara tal cual. Si coincide llama a
  // onLogin; si no, muestra el error y vacía la contraseña para que se escriba de nuevo.
  const enviar = (e) => {
    // Evita que el navegador recargue la página al enviar el formulario.
    e.preventDefault();
    if (email.trim().toLowerCase() === USUARIO_DEMO.email && pass === USUARIO_DEMO.password) {
      setError('');
      onLogin();
    } else {
      setError('Correo o contraseña incorrectos.');
      setPass('');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', background: '#f6f6f6' }}>
      {/* Panel de marca */}
      <Box sx={{
        flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#ececec', borderRight: '1px solid #d4d4d4', px: '48px',
      }}>
        <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 64, lineHeight: 1, color: INK }}>Punto Cero</Typography>
        <Box sx={{ width: 40, height: 3, borderRadius: 2, background: SAGE, my: '22px' }} />
        <Typography sx={{ fontFamily: F, fontSize: 16, color: '#4d4d4d', textAlign: 'center', maxWidth: 340, lineHeight: 1.5 }}>
          Cada pedido por encargo, a su hora y bajo control.
        </Typography>
      </Box>

      {/* Formulario */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: '24px' }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography sx={{ display: { xs: 'block', md: 'none' }, fontFamily: SERIF, fontWeight: 300, fontSize: 40, color: INK, textAlign: 'center', mb: '28px' }}>
            Punto Cero
          </Typography>
          <Typography sx={{ fontFamily: SERIF, fontWeight: 300, fontSize: 38, color: INK, lineHeight: 1.1, mb: '8px' }}>Bienvenido</Typography>
          <Typography sx={{ fontFamily: F, fontSize: 14, color: '#6a6a6a', mb: '30px' }}>Inicia sesión para continuar.</Typography>

          {/* Formulario: Enter o el botón disparan "enviar". */}
          <Box component="form" onSubmit={enviar}>
            <Campo label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com" autoComplete="username" error={!!error} />
            <Campo label="Contraseña" type={ver ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
              placeholder="Tu contraseña" autoComplete="current-password" error={!!error}
              extra={
                <Box component="button" type="button" aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVer(v => !v)}
                  sx={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d8d8d', display: 'flex', p: 0, '&:hover': { color: INK } }}>
                  {ver ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                </Box>
              } />
            {/* El mensaje solo aparece cuando hay un intento fallido. */}
            {error && <Typography sx={{ fontFamily: F, fontSize: 12, color: '#d9534f', mt: '-6px', mb: '14px' }}>{error}</Typography>}
            <Box component="button" type="submit" sx={{
              width: '100%', mt: '6px', py: '13px', border: 'none', borderRadius: '8px', background: INK, color: '#fff',
              fontFamily: F, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'opacity .15s', '&:hover': { opacity: 0.88 },
            }}>
              Iniciar sesión
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
