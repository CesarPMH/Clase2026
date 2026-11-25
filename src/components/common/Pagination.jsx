// Pagination — patrón canónico del UI kit del proyecto.
// Tamaño de página (MiniSelect) + "X–Y de Z" + « ‹ › » 26×26px.
import { Box, Typography } from '@mui/material';
import { DL } from '../../theme';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";

export default function Pagination({
  page, pageSize, total, onPageChange, onPageSizeChange,
  pageSizeOptions = [5, 10, 25],
}) {
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const buttons = [
    { label: '«', target: 1,                             disabled: page === 1 },
    { label: '‹', target: Math.max(page - 1, 1),          disabled: page === 1 },
    { label: '›', target: Math.min(page + 1, pageCount),  disabled: page === pageCount },
    { label: '»', target: pageCount,                      disabled: page === pageCount },
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', px: '16px', py: '10px', borderTop: `1px solid ${DL.border}` }}>
      <Typography sx={{ fontFamily: F, fontSize: 11, color: DL.tS }}>Tamaño de página</Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Box component="select"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          sx={{
            fontFamily: F, fontSize: 11, fontWeight: 500, color: DL.tH,
            background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px',
            padding: '5px 22px 5px 10px', outline: 'none', cursor: 'pointer', appearance: 'none',
            transition: 'border-color .15s',
            '&:hover, &:focus-within': { borderColor: DL.blue },
          }}>
          {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </Box>
        <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
      </Box>
      <Typography sx={{ fontFamily: F, fontSize: 11, color: DL.tS }}>
        {total === 0 ? '0–0 de 0' : `${from}–${to} de ${total}`}
      </Typography>
      <Box sx={{ display: 'flex', gap: '6px' }}>
        {buttons.map(btn => (
          <Box key={btn.label} component="button"
            onClick={() => !btn.disabled && onPageChange(btn.target)}
            disabled={btn.disabled}
            sx={{
              fontFamily: F, fontSize: 11, fontWeight: 500,
              width: 26, height: 26, borderRadius: '6px', border: `1px solid ${DL.border2}`,
              background: btn.disabled ? '#f8fafc' : '#fff',
              color: btn.disabled ? '#d4d4d4' : '#3f3f3f',
              cursor: btn.disabled ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .12s',
              '&:hover': btn.disabled ? {} : { borderColor: DL.blue, color: DL.blue },
            }}
          >{btn.label}</Box>
        ))}
      </Box>
    </Box>
  );
}
