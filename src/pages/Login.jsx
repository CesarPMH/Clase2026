// Component library: MUI (Box, Typography, CircularProgress)
// Layout: two-panel — light-gray left (wordmark + slogan, ≥xl) + dark #1a1a1a right (form)
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { signIn } from '../lib/supabase';

// ─── Left panel (≥ xl) ────────────────────────────────────────────────────────
function LeftPanel() {
  const [sloganVisible, setSloganVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSloganVisible(true), 1050);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box sx={{
      display: { xs: 'none', xl: 'flex' },
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pb: '48px',
      background: "#f6f6f6",
    }}>
      {/* Full wordmark logo */}
      <Typography sx={{ fontFamily: "'Crimson Pro', Georgia, serif", fontWeight: 300, fontSize: 56, lineHeight: 1, color: "#1a1a1a" }}>
        Punto Cero
      </Typography>

      {/* Slogan — slides in after 1050ms */}
      <Box sx={{
        mt: '24px',
        opacity: sloganVisible ? 1 : 0,
        transform: sloganVisible ? 'translateY(0)' : 'translateY(-16px)',
        transition: 'opacity .5s ease-out, transform .5s ease-out',
      }}>
        <Typography sx={{
          fontSize: 18, fontWeight: 400, color: '#1a1a1a',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          textAlign: 'center',
        }}>
          Transformando datos en Acción
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Input field — light blue style ──────────────────────────────────────────
function AuthInput({ label, type, value, onChange, placeholder, endAdornment, error }) {
  return (
    <Box sx={{ mb: '20px' }}>
      <Typography sx={{
        fontSize: 13, fontWeight: 500, color: "#1a1a1a",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", mb: '7px', display: 'block',
      }}>
        {label}
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          sx={{
            width: '100%',
            p: endAdornment ? '13px 44px 13px 14px' : '13px 14px',
            border: `1.5px solid ${error ? 'rgba(249,115,22,.8)' : '#d4d4d4'}`,
            borderRadius: '6px',
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
            color: '#1a1a1a',
            background: '#fff',
            outline: 'none',
            display: 'block',
            boxSizing: 'border-box',
            transition: 'border-color .18s, background .18s, box-shadow .18s',
            '&::placeholder': { color: '#8d8d8d' },
            '&:focus': {
              borderColor: "#1a1a1a",
              background: '#fff',
              boxShadow: "none",
            },
            '&:-webkit-autofill': {
              boxShadow: '0 0 0px 1000px #fff inset !important',
              WebkitTextFillColor: '#1a1a1a !important',
            },
            '&:-webkit-autofill:hover': {
              boxShadow: '0 0 0px 1000px #fff inset !important',
              WebkitTextFillColor: '#1a1a1a !important',
            },
          }}
        />
        {endAdornment && (
          <Box sx={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center',
          }}>
            {endAdornment}
          </Box>
        )}
      </Box>
      {error && (
        <Typography sx={{
          fontSize: 11, fontWeight: 500, color: '#f97316',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", mt: '5px',
        }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

// ─── Sign-in form ─────────────────────────────────────────────────────────────
function SignInForm({ onLogin, onForgot }) {
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    // ⚠️ DEV-ONLY: bypass Supabase auth in local dev mode
    // import.meta.env.DEV is always false in production builds — safe by design
    if (import.meta.env.DEV) {
      onLogin({ id: 'dev-user', email: 'dev@puntocero.local', role: 'admin' });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await signIn(email.trim(), pass);
      onLogin(user);
    } catch {
      setError('Correo o contraseña incorrectos');
      setPass('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: '36px' }}>
        <Typography sx={{
          fontSize: 40, fontWeight: 300, color: "#1a1a1a",
          fontFamily: "'Crimson Pro', Georgia, serif",
          letterSpacing: '-.5px', mb: '10px',
        }}>
          ¡Bienvenido!
        </Typography>
        <Typography sx={{
          fontSize: 18, color: '#6a6a6a',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontWeight: 400,
        }}>
          Inicia sesión para continuar
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>

        <AuthInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ingresa tu correo electrónico"
          error={error ? ' ' : ''}
        />

        <AuthInput
          label="Contraseña"
          type={showPass ? 'text' : 'password'}
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="Ingresa tu contraseña"
          error={error || ''}
          endAdornment={
            <Box
              component="button"
              type="button"
              onClick={() => setShowPass(s => !s)}
              sx={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#8d8d8d', display: 'flex',
                alignItems: 'center', justifyContent: 'center', p: 0,
                '&:hover': { color: '#4d3f32' },
              }}
            >
              {showPass
                ? <VisibilityOff sx={{ fontSize: 18 }} />
                : <Visibility   sx={{ fontSize: 18 }} />}
            </Box>
          }
        />

        {/* Recordarme + Olvidé contraseña */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: '14px', sm: 0 },
          mb: '28px',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <Box sx={{
              width: 18, height: 18, borderRadius: '4px',
              background: "#1a1a1a", flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Typography sx={{
              fontSize: 13, color: "#1a1a1a",
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            }}>Recuérdame</Typography>
          </Box>
          <Typography
            onClick={onForgot}
            sx={{
              fontSize: 13, color: '#6a6a6a',
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              cursor: 'pointer',
              '&:hover': { color: "#1a1a1a", textDecoration: 'underline', textUnderlineOffset: '5px' },
              transition: 'color .15s',
            }}
          >
            ¿Olvidaste tu contraseña?
          </Typography>
        </Box>

        {/* Submit */}
        <Box
          component="button"
          type="submit"
          disabled={loading}
          sx={{
            width: '100%', p: '15px',
            border: 'none', borderRadius: '6px',
            background: "#fff", color: "#1a1a1a", border: "1px solid #1a1a1a",
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            fontSize: 14, fontWeight: 500,
            cursor: 'pointer',
            transition: 'background .15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            letterSpacing: '0.02em',
            '&:hover': { background: "#f6f6f6" },
            
            '&:disabled': { opacity: .7, cursor: 'default' },
          }}
        >
          {loading && <CircularProgress size={15} sx={{ color: "#1a1a1a" }} />}
          {loading ? 'Verificando...' : 'Iniciar Sesión'}
        </Box>

      </Box>
    </>
  );
}

// ─── Forgot-password form ─────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }) {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setEmailSent(true); }, 700);
  };

  if (emailSent) {
    return (
      <>
        <Box sx={{ textAlign: 'center', mb: '36px' }}>
          <Typography sx={{
            fontSize: 40, fontWeight: 300, color: "#1a1a1a",
            fontFamily: "'Crimson Pro', Georgia, serif", letterSpacing: '-.3px', mb: '12px',
          }}>
            Verifica tu correo
          </Typography>
          <Typography sx={{
            fontSize: 16, color: '#6a6a6a',
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7,
          }}>
            Te hemos enviado un enlace para<br />restablecer tu contraseña.
          </Typography>
        </Box>
        <Box component="button" onClick={onBack} sx={{
          width: '100%', p: '15px', border: 'none', borderRadius: '6px',
          background: "#fff", color: "#1a1a1a", border: "1px solid #1a1a1a",
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 14, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          '&:hover': { background: "#f6f6f6" }, transition: 'background .15s',
        }}>
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Volver al inicio de sesión
        </Box>
      </>
    );
  }

  return (
    <>
      <Box sx={{ textAlign: 'center', mb: '36px' }}>
        <Typography sx={{
          fontSize: 40, fontWeight: 300, color: "#1a1a1a",
          fontFamily: "'Crimson Pro', Georgia, serif", letterSpacing: '-.3px', mb: '12px',
        }}>
          ¿Olvidaste tu contraseña?
        </Typography>
        <Typography sx={{
          fontSize: 16, color: '#6a6a6a',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7,
        }}>
          Ingresa tu correo y te enviamos<br />un enlace para restablecerla.
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <AuthInput
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Ingresa tu correo electrónico"
        />
        <Box component="button" type="submit" disabled={loading} sx={{
          width: '100%', p: '15px', mb: '14px',
          border: 'none', borderRadius: '6px',
          background: "#fff", color: "#1a1a1a", border: "1px solid #1a1a1a",
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 14, fontWeight: 500,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          '&:hover': { background: "#f6f6f6" },
          '&:disabled': { opacity: .7, cursor: 'default' },
          transition: 'background .15s',
        }}>
          {loading && <CircularProgress size={15} sx={{ color: "#1a1a1a" }} />}
          {loading ? 'Enviando...' : 'Enviar enlace de reset'}
        </Box>
        <Box component="button" type="button" onClick={onBack} sx={{
          width: '100%', p: '10px', border: 'none', background: 'none',
          color: '#6a6a6a', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          '&:hover': { color: "#1a1a1a" }, transition: 'color .15s',
        }}>
          <ArrowBackIcon sx={{ fontSize: 15 }} />
          Volver al inicio de sesión
        </Box>
      </Box>
    </>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const [view, setView] = useState('signin');

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', xl: '2fr 4fr' },
    }}>

      {/* ── Left panel (≥ xl only) ── */}
      <LeftPanel />

      {/* ── Right panel ── */}
      <Box sx={{
        background: "#ffffff",
        borderLeft: "1px solid #e3e3e3",
        display: "flex", flexDirection: 'column',
        position: 'relative',
        gridColumn: { xs: '1 / -1', xl: 'auto' },
        minHeight: '100vh',
      }}>

        {/* Form area — vertically centered */}
        <Box sx={{
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          width: { xs: '90%', md: '85%', xl: '80%' },
          mx: 'auto',
          py: '48px',
        }}>
          <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%' }}>

            {view === 'signin'
              ? <SignInForm onLogin={onLogin} onForgot={() => setView('forgot')} />
              : <ForgotPasswordForm onBack={() => setView('signin')} />
            }

          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{
          textAlign: 'center', py: '18px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: 12, color: 'rgba(209,213,219,1)',
        }}>
          <Typography component="span" sx={{
            fontSize: 'inherit', color: 'inherit', cursor: 'pointer',
            textDecoration: 'underline', fontFamily: 'inherit',
            '&:hover': { color: 'rgba(249,250,251,1)' }, transition: 'color .15s',
          }}>EULA</Typography>
          <Typography component="span" sx={{ fontSize: 'inherit', color: 'rgba(156,163,175,1)', fontFamily: 'inherit' }}>·</Typography>
          <Typography component="span" sx={{
            fontSize: 'inherit', color: 'inherit', cursor: 'pointer',
            textDecoration: 'underline', fontFamily: 'inherit',
            '&:hover': { color: 'rgba(249,250,251,1)' }, transition: 'color .15s',
          }}>Política de Privacidad</Typography>
        </Box>

      </Box>
    </Box>
  );
}
