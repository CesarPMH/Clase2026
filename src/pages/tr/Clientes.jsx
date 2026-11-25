// Component library: MUI
import { useState } from 'react';
import {
  Box, Typography, TextField, Button, IconButton,
  InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';
import { clientesMock } from '../../data/tr-mock';

function NuevoClienteModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PersonIcon sx={{ fontSize: 20, color: DL.blue }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH }}>Nuevo Cliente</Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>Registro de Información</Typography>
          </Box>
        </Box>
        <Box onClick={onClose} sx={{ cursor: 'pointer', color: DL.tS, display: 'flex' }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, mb: 1.5, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PersonIcon sx={{ fontSize: 14, color: DL.blue }} /> Información General
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField fullWidth label="Nombre Completo *" size="small" sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Teléfono *" size="small" sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Correo Electrónico *" size="small" sx={fieldSx} />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>Tipo de Persona *</InputLabel>
              <Select label="Tipo de Persona *">
                <MenuItem value="Natural">Natural</MenuItem>
                <MenuItem value="Jurídica">Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>Tipo de Documento *</InputLabel>
              <Select label="Tipo de Documento *">
                <MenuItem value="DUI">DUI</MenuItem>
                <MenuItem value="NIT">NIT</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth label="N° de Documento *" size="small" sx={fieldSx} />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel sx={{ fontSize: 11 }}>Carácter *</InputLabel>
              <Select label="Carácter *">
                <MenuItem value="Representante Legal">Representante Legal</MenuItem>
                <MenuItem value="Apoderado">Apoderado</MenuItem>
                <MenuItem value="Director General">Director General</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Dirección" size="small" sx={fieldSx} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small">Cancelar</Button>
        <Button variant="contained" size="small" startIcon={<PersonIcon sx={{ fontSize: 13 }} />}>
          Guardar Cliente
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const fieldSx = { '& .MuiInputBase-root': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } };

export default function Clientes() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = clientesMock.filter(c =>
    !search || c.cliente.toLowerCase().includes(search.toLowerCase()) || c.documento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: '24px', background: '#fff', minHeight: '100%' }}>
      <Typography sx={{ fontSize: 22, fontWeight: 500, color: DL.tH, letterSpacing: '-.4px' }}>
        Administración de Clientes
      </Typography>

      {/* Sub panel */}
      <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', p: '16px', mt: '16px' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, mb: '2px' }}>Listado de clientes</Typography>
        <Typography sx={{ fontSize: 11, color: DL.tS, mb: '14px' }}>Consulta clientes y sus detalles.</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '14px' }}>
          <TextField
            placeholder="Buscar..."
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 13, color: DL.tS }} /></InputAdornment>,
              sx: { fontSize: 11, height: 32 },
            }}
            sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="contained" size="small"
            startIcon={<AddIcon sx={{ fontSize: 13 }} />}
            onClick={() => setModalOpen(true)}
            sx={{ height: 32, fontSize: 11, borderRadius: '8px', px: '14px' }}
          >
            Agregar Cliente
          </Button>
        </Box>

        {/* Table */}
        <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 100px 80px 80px',
            background: 'rgba(26,26,26,.025)', borderBottom: `2px solid ${DL.border}`,
            px: '12px', py: '9px',
          }}>
            {['ID', 'Cliente', 'Documento', 'Dirección', 'Contacto', 'Categoría', 'Tipo', 'Acciones'].map(h => (
              <Typography key={h} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</Typography>
            ))}
          </Box>

          {filtered.map((c, i) => (
            <Box key={c.id} sx={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 100px 80px 80px',
              px: '12px', py: '10px',
              borderBottom: i < filtered.length - 1 ? `1px solid ${DL.border}` : 'none',
              alignItems: 'center',
              '&:hover': { background: 'rgba(84,126,105,.025)' },
            }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tS }}>{c.id}</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{c.cliente}</Typography>
              <Typography sx={{ fontSize: 10, color: DL.tM }}>{c.documento}</Typography>
              <Typography sx={{ fontSize: 10, color: DL.tM }}>{c.direccion}</Typography>
              <Typography sx={{ fontSize: 10, color: DL.tM }}>{c.contacto}</Typography>
              <Box sx={{ px: '8px', py: '2px', borderRadius: '12px', fontSize: 9, fontWeight: 500, background: '#e8e8e8', color: '#1a1a1a', display: 'inline-flex', width: 'fit-content' }}>
                {c.categoria}
              </Box>
              <Typography sx={{ fontSize: 10, color: DL.tM }}>{c.tipo}</Typography>
              <Box sx={{ display: 'flex', gap: '2px' }}>
                <IconButton size="small"><EditIcon sx={{ fontSize: 14, color: DL.tS }} /></IconButton>
                <IconButton size="small"><DeleteIcon sx={{ fontSize: 14, color: DL.red }} /></IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <NuevoClienteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}
