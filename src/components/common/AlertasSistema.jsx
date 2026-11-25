// ─── AlertasSistema — shared compact alerts card ───────────────────────────────
// Usage: <AlertasSistema alerts={[{ tier:'r'|'y'|'o'|'g', msg:'...' }]} />
//   tier:  r = critical (red) · y = warning (yellow) · o = info (orange) · g = success (green)

import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DL } from '../../theme';
import { MiniSelect } from './PageHeader';

const FF = "'Inter', ui-sans-serif, system-ui, sans-serif";

const TIER = {
  r: { bg: '#fff1f0', border: DL.red,    iconBg: '#fee2e2', iconColor: DL.red,    iconBd: '#fca5a5', icon: '!' },
  y: { bg: '#fffbeb', border: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706', iconBd: '#fcd34d', icon: '⚠' },
  o: { bg: '#fff7ed', border: '#ea580c', iconBg: '#ffedd5', iconColor: '#ea580c', iconBd: '#fed7aa', icon: '!' },
  g: { bg: '#f0fdf4', border: DL.green,  iconBg: '#dcfce7', iconColor: DL.green,  iconBd: '#86efac', icon: '✓' },
};

const selectSx = {
  fontSize: 10, fontWeight: 500, color: '#3f3f3f',
  border: `1px solid ${DL.border2}`, borderRadius: '6px',
  px: '7px', py: '3px', background: '#fff',
  fontFamily: FF,
  cursor: 'pointer', outline: 'none',
  '&:focus': { borderColor: DL.blue },
};

export default function AlertasSistema({ alerts = [], title = 'Alertas de Sistema', maxHeight }) {
  const [filter, setFilter] = useState('todos');

  const shown = filter === 'todos' ? alerts
    : filter === 'r' ? alerts.filter(a => a.tier === 'r')
    : filter === 'y' ? alerts.filter(a => a.tier === 'y' || a.tier === 'o')
    :                  alerts.filter(a => a.tier === 'g');

  return (
    <Box sx={{
      background: '#fff',
      borderRadius: '10px',
      border: `1px solid ${DL.border}`,
      boxShadow: DL.e1,
      overflow: 'hidden',
      height: '100%',
      maxHeight: maxHeight ?? 'none',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Box sx={{
        px: '14px', py: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${DL.border}`,
        flexShrink: 0,
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: FF }}>
          {title}
        </Typography>
        <MiniSelect compact label="Mostrar" value={filter} onChange={setFilter} minWidth={92}
          options={[{ value: 'todos', label: 'Todos' }, { value: 'r', label: 'Críticas' }, { value: 'y', label: 'Atención' }, { value: 'g', label: 'Positivas' }]} />
      </Box>

      {/* Rows */}
      <Box sx={{ p: '6px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', overflowY: 'auto' }}>
        {shown.length === 0 && (
          <Typography sx={{ fontSize: 9, color: DL.tS, fontFamily: FF, textAlign: 'center', py: '10px' }}>
            Sin alertas
          </Typography>
        )}
        {shown.map((a, i) => {
          const c = TIER[a.tier] || TIER.g;
          return (
            <Box key={i} sx={{
              display: 'flex', alignItems: 'center', gap: '6px',
              p: '5px 8px', borderRadius: '6px',
              borderLeft: `2px solid ${c.border}`,
              background: c.bg,
            }}>
              <Box sx={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                background: c.iconBg, color: c.iconColor,
                border: `1px solid ${c.iconBd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 500,
              }}>
                {c.icon}
              </Box>
              <Typography sx={{ fontSize: 9, color: DL.tM, lineHeight: 1.35, fontWeight: 500, fontFamily: FF }}>
                {a.msg}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
