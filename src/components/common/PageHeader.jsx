// Component library: MUI (Box, Typography, Select, MenuItem, FormControl, Button)
import { useState, useCallback, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  IosShare as ShareIcon,
  Close as CloseIcon,
  InsertDriveFileOutlined as FileIcon,
  Send as SendIcon,
  TaskAlt as CheckIcon,
  FileDownloadOutlined as ExportIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';

// Reusable MUI-styled mini Select
export function MiniSelect({ label, value, onChange, options, minWidth = 110 }) {
  return (
    <Box sx={{
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
    }}>
      <Typography sx={{
        position: 'absolute', top: -7, left: 10, zIndex: 1,
        fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: DL.tS,
        background: '#fff', px: '4px',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        {label}
      </Typography>
      <Box
        component="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          fontSize: 10, fontWeight: 500, color: DL.tH,
          background: '#fff',
          border: `1px solid ${DL.border2}`,
          borderRadius: '7px',
          padding: '7px 28px 7px 10px',
          outline: 'none', cursor: 'pointer',
          appearance: 'none',
          minWidth,
          transition: 'border-color .15s',
          '&:hover, &:focus-within': { borderColor: DL.blue },
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </Box>
      {/* Custom chevron */}
      <Box sx={{
        position: 'absolute', right: 8, top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none', color: DL.tS,
        fontSize: 10,
      }}>
        ▾
      </Box>
    </Box>
  );
}

// Toggle button group
export function ToggleGroup({ options, value, onChange }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: '1px',
      background: DL.subtle,
      border: `1px solid ${DL.border2}`,
      borderRadius: '6px', p: '2px',
    }}>
      {options.map((o) => (
        <Box
          key={o.value}
          component="button"
          onClick={() => onChange(o.value)}
          sx={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            fontSize: 9, fontWeight: 500,
            px: '9px', py: '3px',
            borderRadius: '4px', border: 'none',
            cursor: 'pointer',
            transition: 'all .14s',
            whiteSpace: 'nowrap',
            background: value === o.value ? '#fff' : 'transparent',
            color: value === o.value ? DL.navy : DL.tM,
            boxShadow: value === o.value ? '0 1px 3px rgba(0,0,70,.1)' : 'none',
            '&:hover': { color: DL.tH },
          }}
        >
          {o.label}
        </Box>
      ))}
    </Box>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
const inputSx = {
  fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
  fontSize: 12, fontWeight: 500, color: '#1a1a1a',
  width: '100%', boxSizing: 'border-box',
  border: '1.5px solid #e3e3e3',
  borderRadius: '8px',
  px: '12px', py: '9px',
  outline: 'none', background: '#fff',
  transition: 'border-color .15s',
  '&:focus': { borderColor: DL.blue },
  '&::placeholder': { color: '#8d8d8d' },
};

function FieldLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: DL.tS, mb: '5px' }}>
      {children}
    </Typography>
  );
}

function ShareModal({ open, onClose, title }) {
  const slug   = (title || 'Dashboard').replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
  const label  = title || 'Dashboard';
  const fname  = `Dashboard_${slug}_Resumen.pdf`;

  const [to,      setTo]      = useState('');
  const [subject, setSubject] = useState(`${label} — Resumen Ejecutivo`);
  const [message, setMessage] = useState(
    `Adjunto el ${label} — Resumen Ejecutivo con los datos más recientes.\n\nPor favor revisa los indicadores clave del periodo.`
  );
  const [sent, setSent] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setTo('');
      setSent(false);
      setSubject(`${label} — Resumen Ejecutivo`);
      setMessage(`Adjunto el ${label} — Resumen Ejecutivo con los datos más recientes.\n\nPor favor revisa los indicadores clave del periodo.`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSend = () => {
    if (!to.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1800);
  };

  if (!open) return null;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: 'fixed', inset: 0, zIndex: 1400,
        background: 'rgba(15,23,42,.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        px: '16px',
      }}
    >
      <Box
        onClick={e => e.stopPropagation()}
        sx={{
          background: '#fff', borderRadius: '18px',
          width: '100%', maxWidth: 480,
          p: '28px',
          boxShadow: '0 24px 64px rgba(0,0,0,.22)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '4px' }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#171717', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Compartir Dashboard
            </Typography>
            <Typography sx={{ fontSize: 11, color: DL.blue, fontWeight: 500, mt: '3px' }}>
              Se enviará un PDF de la visualización actual
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}
            sx={{ color: '#8d8d8d', mt: '-4px', mr: '-8px',
              '&:hover': { color: '#4d3f32', background: '#f6f6f6' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Divider */}
        <Box sx={{ height: '1px', background: '#f6f6f6', my: '18px' }} />

        {/* Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Para */}
          <Box>
            <FieldLabel>Para (Correo Electrónico)</FieldLabel>
            <Box component="input" type="email" placeholder="destinatario@empresa.com"
              value={to} onChange={e => setTo(e.target.value)}
              sx={inputSx} />
          </Box>

          {/* Asunto */}
          <Box>
            <FieldLabel>Asunto</FieldLabel>
            <Box component="input" type="text"
              value={subject} onChange={e => setSubject(e.target.value)}
              sx={inputSx} />
          </Box>

          {/* Mensaje */}
          <Box>
            <FieldLabel>Mensaje</FieldLabel>
            <Box component="textarea" rows={4}
              value={message} onChange={e => setMessage(e.target.value)}
              sx={{ ...inputSx, resize: 'vertical', lineHeight: 1.55, pt: '10px' }} />
          </Box>

          {/* Attachment preview */}
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: '#f8fafc', border: '1.5px solid #e3e3e3',
            borderRadius: '9px', px: '14px', py: '10px',
          }}>
            <FileIcon sx={{ fontSize: 20, color: DL.blue, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.blue, wordBreak: 'break-all' }}>
              {fname}
            </Typography>
          </Box>

        </Box>

        {/* Divider */}
        <Box sx={{ height: '1px', background: '#f6f6f6', my: '20px' }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Box component="button" onClick={onClose} sx={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            fontSize: 12, fontWeight: 500,
            px: '18px', py: '9px', borderRadius: '9px',
            border: '1.5px solid #e3e3e3', background: '#fff',
            color: '#6a6a6a', cursor: 'pointer',
            transition: 'all .14s',
            '&:hover': { borderColor: '#d4d4d4', color: '#1a1a1a' },
          }}>
            Cancelar
          </Box>

          <Box component="button" onClick={handleSend}
            disabled={!to.trim() || sent}
            sx={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: 12, fontWeight: 500,
              px: '20px', py: '9px', borderRadius: '9px',
              border: 'none',
              background: sent ? DL.green : (!to.trim() ? '#b8b8b8' : DL.blue),
              color: '#fff', cursor: !to.trim() ? 'not-allowed' : 'pointer',
              transition: 'all .18s',
              display: 'flex', alignItems: 'center', gap: '7px',
              '&:hover': (!to.trim() || sent) ? {} : { background: DL.navy },
            }}>
            {sent
              ? <CheckIcon sx={{ fontSize: 16 }} />
              : <SendIcon sx={{ fontSize: 16 }} />
            }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const COOLDOWN_MS = 30 * 1000; // 30 seconds

function fmtNow() {
  const now = new Date();
  const day   = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year  = now.getFullYear();
  let   hrs   = now.getHours();
  const mins  = String(now.getMinutes()).padStart(2, '0');
  const ampm  = hrs >= 12 ? 'p. m.' : 'a. m.';
  hrs = hrs % 12 || 12;
  return `${day}/${month}/${year} ${String(hrs).padStart(2, '0')}:${mins} ${ampm} (CST)`;
}

function fmtCooldown(ms) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function PageHeader({
  title, live = true, onBack, children,
  // Refresh props — if onRefresh provided, Refresh button is shown
  onRefresh,
  refreshDisabled = false,
  refreshCooldown = 0,  // remaining ms for cooldown display
  // Share
  showShare = true,
  onExport,
}) {
  const [liveTs,     setLiveTs]     = useState(fmtNow);
  const [shareOpen,  setShareOpen]  = useState(false);

  // Update timestamp every minute
  useEffect(() => {
    const id = setInterval(() => setLiveTs(fmtNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  // When onRefresh fires, update the timestamp
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
      setLiveTs(fmtNow());
    }
  }, [onRefresh]);

  const showRightBar = children || onRefresh || showShare || onExport;
  const isDisabled = refreshDisabled || refreshCooldown > 0;

  return (
    <Box sx={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#fff',
      borderBottom: 'none',
      px: { xs: '12px', md: '20px' },
      py: { xs: '10px', md: '12px' },
      display: 'flex',
      alignItems: { xs: 'flex-start', md: 'center' },
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: '8px', md: '12px' },
      boxShadow: '0 4px 12px rgba(0,0,0,.10)',
      flexShrink: 0,
    }}>

      {/* Top row: back button + title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', width: { xs: '100%', md: 'auto' } }}>
        {onBack && (
          <IconButton size="small" onClick={onBack} sx={{
            color: DL.tS, border: `1px solid ${DL.border}`, borderRadius: '7px', p: '5px', flexShrink: 0,
            '&:hover': { color: DL.blue, borderColor: DL.blue, background: '#f6f6f6' },
          }}>
            <BackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        {/* Title block */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography sx={{
            fontFamily: "'Crimson Pro', Georgia, serif", fontSize: { xs: 22, md: 26 }, fontWeight: 300, color: DL.tH,
            letterSpacing: "normal", lineHeight: 1,
          }}>
            {title}
          </Typography>
        </Box>
      </Box>

      {/* Right: filters + Refresh + Compartir */}
      {showRightBar && (
        <Box sx={{
          flex: 1,
          display: 'flex', alignItems: 'center', gap: '8px',
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          flexWrap: 'wrap',
          width: { xs: '100%', md: 'auto' },
        }}>
          {children}

          {/* Refresh button */}
          {onRefresh && (
            <Box
              component="button"
              onClick={handleRefresh}
              disabled={isDisabled}
              title={refreshCooldown > 0 ? `Disponible en ${fmtCooldown(refreshCooldown)}` : 'Actualizar datos'}
              sx={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                fontSize: 11, fontWeight: 500,
                px: '12px', py: '6px', borderRadius: '8px',
                border: `1px solid ${isDisabled ? DL.border : DL.border2}`,
                background: isDisabled ? 'rgba(26,26,26,.03)' : '#fff',
                color: isDisabled ? DL.tS : DL.tM,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all .14s', whiteSpace: 'nowrap',
                opacity: isDisabled ? 0.65 : 1,
                '&:hover': isDisabled ? {} : { borderColor: DL.blue, color: DL.navy },
              }}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </Box>
          )}

          {/* Compartir button */}
          {showShare && (
            <Box component="button" title="Compartir" aria-label="Compartir" onClick={() => setShareOpen(true)} sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: 11, fontWeight: 500,
              px: '12px', py: '6px', borderRadius: '8px',
              border: `1px solid ${DL.border2}`,
              background: '#fff', color: DL.tM,
              cursor: 'pointer', transition: 'all .14s', whiteSpace: 'nowrap',
              '&:hover': { borderColor: DL.blue, color: DL.navy },
            }}>
              <ShareIcon sx={{ fontSize: 16 }} />
            </Box>
          )}

          {/* Descargar button — always last */}
          {onExport && (
            <Box component="button" title="Descargar" aria-label="Descargar" onClick={onExport} sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: 11, fontWeight: 500,
              px: '12px', py: '6px', borderRadius: '8px',
              border: `1px solid rgba(26,26,26,.2)`,
              background: 'rgba(26,26,26,.06)',
              color: DL.blue, cursor: 'pointer',
              transition: 'all .14s', whiteSpace: 'nowrap',
              '&:hover': { background: 'rgba(26,26,26,.12)', borderColor: DL.blue },
            }}>
              <ExportIcon sx={{ fontSize: 17 }} />
            </Box>
          )}
        </Box>
      )}

      {/* Share modal — rendered at page-header level so it overlays everything */}
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} title={title} />
    </Box>
  );
}
