// Component library: MUI
import { useState, useMemo } from 'react';
import { useT } from '../../i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, TextField, Select, MenuItem, FormControl,
  InputAdornment, Tooltip, Button, Menu, Checkbox, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, Close as CloseIcon,
  CheckCircle as CheckIcon, RadioButtonUnchecked as CircleIcon,
  ViewColumn as ColumnIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';
import PageHeader from '../../components/common/PageHeader';
import { proyectos, USUARIOS, PRIORIDAD_CHIP } from '../../data/tr-mock';

// Build flat task list from all projects
const INIT_TAREAS = proyectos.flatMap(p =>
  p.tareas.map(t => ({
    ...t,
    _key: `${p.id}-${t.id}`,
    proyectoId: p.id,
    proyectoNombre: p.nombre,
    cliente: p.cliente,
  }))
);

const COL_DEFS = [
  { id: 'estado',    labelKey: 'col.estado' },
  { id: 'tarea',     labelKey: 'tr.tar.col.tarea' },
  { id: 'prioridad', labelKey: 'tr.tar.col.prioridad' },
  { id: 'asignados', labelKey: 'tr.tar.col.asignados' },
  { id: 'fecha',     labelKey: 'tr.tar.col.fechaLimite' },
];

const DEFAULT_COLS = ['estado', 'tarea', 'prioridad', 'asignados', 'fecha'];

function UserAvatar({ uid }) {
  const u = USUARIOS.find(x => x.id === uid);
  if (!u) return null;
  return (
    <Tooltip title={u.nombre}>
      <Avatar sx={{ width: 22, height: 22, fontSize: 8, fontWeight: 500, background: u.color, border: '2px solid #fff' }}>
        {uid}
      </Avatar>
    </Tooltip>
  );
}

function PrioChip({ label }) {
  const s = PRIORIDAD_CHIP[label] || { bg: '#f3f4f6', color: '#727272' };
  return (
    <Box sx={{ px: '8px', height: 20, borderRadius: '4px', fontSize: 9, fontWeight: 500, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  );
}

// ── Nueva Tarea Modal ─────────────────────────────────────────────────────────
function NuevaTareaModal({ open, onClose, onSave }) {
  const { t } = useT();
  const [form, setForm] = useState({ nombre: '', desc: '', prioridad: 'Medio', asignados: [], fechaLimite: '', proyectoId: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fsx = { '& .MuiInputBase-root': { fontSize: 11 }, '& .MuiInputLabel-root': { fontSize: 11 } };

  const handleClose = () => {
    setForm({ nombre: '', desc: '', prioridad: 'Medio', asignados: [], fechaLimite: '', proyectoId: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH }}>{t('tr.tar.modal.titulo')}</Typography>
        <Box onClick={handleClose} sx={{ cursor: 'pointer', color: DL.tS, display: 'flex' }}><CloseIcon sx={{ fontSize: 18 }} /></Box>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small" sx={fsx}>
              <label style={{ fontSize: 11, color: '#555', marginBottom: 4, display: 'block' }}>{t('tr.lbl.proyecto')} *</label>
              <Select displayEmpty value={form.proyectoId} onChange={e => set('proyectoId', e.target.value)}>
                <MenuItem value="" disabled sx={{ fontSize: 11 }}>{t('tr.lbl.seleccionar')}</MenuItem>
                {proyectos.map(p => <MenuItem key={p.id} value={p.id} sx={{ fontSize: 11 }}>{p.nombre}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('tr.tar.modal.nombreTarea')} size="small" sx={fsx}
              value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('tr.proy.modal.descripcion')} size="small" multiline rows={2} sx={fsx}
              value={form.desc} onChange={e => set('desc', e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" sx={fsx}>
              <label style={{ fontSize: 11, color: '#555', marginBottom: 4, display: 'block' }}>{t('tr.tar.col.prioridad')}</label>
              <Select value={form.prioridad} onChange={e => set('prioridad', e.target.value)}>
                {['Alto', 'Medio', 'Bajo'].map(p => <MenuItem key={p} value={p} sx={{ fontSize: 11 }}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tr.tar.col.fechaLimite')} size="small" type="date" sx={fsx}
              value={form.fechaLimite} onChange={e => set('fechaLimite', e.target.value)}
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small" sx={fsx}>
              <label style={{ fontSize: 11, color: '#555', marginBottom: 4, display: 'block' }}>{t('tr.tar.col.asignados')}</label>
              <Select multiple value={form.asignados} onChange={e => set('asignados', e.target.value)}
                renderValue={sel => sel.join(', ')}>
                {USUARIOS.map(u => (
                  <MenuItem key={u.id} value={u.id} sx={{ fontSize: 11 }}>
                    <Checkbox size="small" checked={form.asignados.includes(u.id)} sx={{ p: 0, mr: 1 }} />
                    <ListItemText primary={u.nombre} primaryTypographyProps={{ fontSize: 11 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small">{t('btn.cancel')}</Button>
        <Button variant="contained" size="small"
          disabled={!form.nombre || !form.proyectoId}
          onClick={() => { onSave(form); handleClose(); }}>
          {t('tr.tar.modal.guardar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PanelTareas() {
  const { t } = useT();
  const navigate = useNavigate();
  const [tareas, setTareas]       = useState(INIT_TAREAS);
  const [cols, setCols]           = useState(DEFAULT_COLS);
  const [colAnchor, setColAnchor] = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('Activas');
  const [proyFilter, setProy]     = useState('');
  const [prioFilter, setPrio]     = useState('');
  const [editCell, setEditCell]   = useState(null); // { key, field }
  const [modalOpen, setModalOpen] = useState(false);

  const updateTarea  = (key, field, value) => setTareas(prev => prev.map(t => t._key === key ? { ...t, [field]: value } : t));
  const toggleStatus = (key) => setTareas(prev => prev.map(t => t._key === key ? { ...t, activa: !t.activa } : t));

  const addTarea = (form) => {
    const p = proyectos.find(x => x.id === form.proyectoId);
    if (!p) return;
    const newId = Date.now();
    setTareas(prev => [...prev, {
      id: newId, nombre: form.nombre, desc: form.desc,
      prioridad: form.prioridad, asignados: form.asignados,
      fechaLimite: form.fechaLimite, activa: true,
      _key: `${p.id}-${newId}`,
      proyectoId: p.id, proyectoNombre: p.nombre, cliente: p.cliente,
    }]);
  };

  const filtered = useMemo(() => tareas.filter(t => {
    const matchStatus = statusFilter === 'Activas' ? t.activa : !t.activa;
    const matchSearch = !search || t.nombre.toLowerCase().includes(search.toLowerCase());
    const matchProy   = !proyFilter || String(t.proyectoId) === String(proyFilter);
    const matchPrio   = !prioFilter || t.prioridad === prioFilter;
    return matchStatus && matchSearch && matchProy && matchPrio;
  }), [tareas, statusFilter, search, proyFilter, prioFilter]);

  const toggleCol = (id) => setCols(prev =>
    prev.includes(id) && prev.length > 2 ? prev.filter(c => c !== id) : prev.includes(id) ? prev : [...prev, id]
  );

  const visibleDefs = cols.map(id => COL_DEFS.find(d => d.id === id)).filter(Boolean);
  const gridCols = visibleDefs.map(d => ({
    estado: '44px', tarea: '1.8fr', prioridad: '90px', asignados: '120px', fecha: '110px',
  }[d.id] || '1fr')).join(' ');
  const fullGrid = `160px ${gridCols}`;

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach(t => {
      if (!map.has(t.proyectoId)) map.set(t.proyectoId, []);
      map.get(t.proyectoId).push(t);
    });
    return [...map.values()];
  }, [filtered]);

  const proyOpts = [...new Map(tareas.map(t => [t.proyectoId, { id: t.proyectoId, nombre: t.proyectoNombre }])).values()];
  const totalActivas = tareas.filter(t => t.activa).length;

  const renderCell = (task, defId) => {
    const key = task._key;
    const editing = (field) => editCell?.key === key && editCell?.field === field;

    switch (defId) {
      case 'estado':
        return (
          <Box onClick={() => toggleStatus(key)} sx={{ cursor: 'pointer', color: task.activa ? 'rgba(26,26,26,.2)' : DL.green, display: 'flex' }}>
            {task.activa ? <CircleIcon sx={{ fontSize: 17 }} /> : <CheckIcon sx={{ fontSize: 17 }} />}
          </Box>
        );

      case 'tarea':
        return (
          <Box>
            {editing('tarea') ? (
              <TextField size="small" autoFocus value={task.nombre}
                onChange={e => updateTarea(key, 'nombre', e.target.value)}
                onBlur={() => setEditCell(null)}
                onKeyDown={e => e.key === 'Enter' && setEditCell(null)}
                sx={{ '& .MuiInputBase-input': { fontSize: 11, p: '3px 7px' }, width: '100%' }} />
            ) : (
              <Typography onClick={() => setEditCell({ key, field: 'tarea' })}
                sx={{ fontSize: 11, fontWeight: 500, color: task.activa ? DL.tH : DL.tS, cursor: 'text', textDecoration: !task.activa ? 'line-through' : 'none', '&:hover': { color: DL.blue } }}>
                {task.nombre}
              </Typography>
            )}
            {editing('desc') ? (
              <TextField size="small" autoFocus value={task.desc} multiline rows={2}
                onChange={e => updateTarea(key, 'desc', e.target.value)}
                onBlur={() => setEditCell(null)}
                sx={{ '& .MuiInputBase-input': { fontSize: 10, p: '3px 7px' }, width: '100%', mt: '2px' }} />
            ) : (
              <Typography onClick={() => setEditCell({ key, field: 'desc' })}
                sx={{ fontSize: 10, color: DL.tS, lineHeight: 1.4, mt: '1px', cursor: 'text', '&:hover': { color: DL.tM } }}>
                {task.desc?.substring(0, 90)}{task.desc?.length > 90 ? '…' : ''}
              </Typography>
            )}
          </Box>
        );

      case 'proyecto':
        return (
          <Box onClick={() => navigate(`/proyectos/${task.proyectoId}`)} sx={{ cursor: 'pointer', '&:hover .pnm': { color: DL.blue } }}>
            <Typography className="pnm" sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, transition: 'color .12s' }}>{task.proyectoNombre}</Typography>
            <Typography sx={{ fontSize: 9.5, color: DL.tS }}>{task.cliente}</Typography>
          </Box>
        );

      case 'prioridad':
        return editing('prioridad') ? (
          <Select size="small" autoFocus value={task.prioridad}
            onChange={e => { updateTarea(key, 'prioridad', e.target.value); setEditCell(null); }}
            onBlur={() => setEditCell(null)}
            sx={{ fontSize: 10, height: 28 }}>
            {['Alto', 'Medio', 'Bajo'].map(p => <MenuItem key={p} value={p} sx={{ fontSize: 11 }}>{p}</MenuItem>)}
          </Select>
        ) : (
          <Box onClick={() => setEditCell({ key, field: 'prioridad' })} sx={{ cursor: 'pointer' }}>
            <PrioChip label={task.prioridad} />
          </Box>
        );

      case 'asignados':
        return editing('asignados') ? (
          <Select size="small" multiple autoFocus value={task.asignados}
            onChange={e => updateTarea(key, 'asignados', e.target.value)}
            onBlur={() => setEditCell(null)}
            renderValue={sel => sel.join(', ')}
            sx={{ fontSize: 10, height: 28, minWidth: 110 }}>
            {USUARIOS.map(u => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: 11 }}>
                <Checkbox size="small" checked={task.asignados.includes(u.id)} sx={{ p: 0, mr: 1 }} />
                {u.nombre}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Box onClick={() => setEditCell({ key, field: 'asignados' })} sx={{ display: 'flex', gap: '3px', cursor: 'pointer', flexWrap: 'wrap' }}>
            {task.asignados.map(uid => <UserAvatar key={uid} uid={uid} />)}
          </Box>
        );

      case 'fecha':
        return editing('fecha') ? (
          <TextField size="small" type="date" autoFocus value={task.fechaLimite}
            onChange={e => updateTarea(key, 'fechaLimite', e.target.value)}
            onBlur={() => setEditCell(null)}
            sx={{ '& .MuiInputBase-input': { fontSize: 10, p: '3px 6px' }, width: 110 }} />
        ) : (
          <Typography onClick={() => setEditCell({ key, field: 'fecha' })}
            sx={{ fontSize: 10, color: DL.tM, cursor: 'text', '&:hover': { color: DL.blue } }}>
            {task.fechaLimite}
          </Typography>
        );

      default: return null;
    }
  };

  return (
    <Box sx={{ background: DL.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Page Header */}
      <PageHeader title={t('tr.tar.titulo')}>
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          onClick={() => setModalOpen(true)}
          sx={{ height: 32, fontSize: 11 }}>
          {t('tr.tar.agregarTarea')}
        </Button>
      </PageHeader>

      {/* Body */}
      <Box sx={{ p: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', background: '#fff', p: '10px 14px', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1 }}>
        {/* Status toggle — DL pill style */}
        <Box sx={{ display: 'flex', gap: '1px', background: DL.subtle, border: `1px solid ${DL.border2}`, borderRadius: '6px', p: '2px' }}>
          {[
            { val: 'Activas',  lbl: t('tr.tar.tab.activas') },
            { val: 'Cerradas', lbl: t('tr.tar.tab.cerradas') },
          ].map(s => (
            <Box key={s.val} component="button" onClick={() => setStatus(s.val)} sx={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              px: '12px', py: '4px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              fontSize: 10, fontWeight: 500,
              background: statusFilter === s.val ? '#fff' : 'transparent',
              color: statusFilter === s.val ? DL.navy : DL.tM,
              boxShadow: statusFilter === s.val ? '0 1px 3px rgba(0,0,70,.1)' : 'none',
              transition: 'all .14s',
              '&:hover': { color: DL.tH },
            }}>
              {s.lbl}
            </Box>
          ))}
        </Box>

        {/* Search */}
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <SearchIcon sx={{ position: 'absolute', left: 8, fontSize: 14, color: DL.tS, pointerEvents: 'none' }} />
          <Box component="input" placeholder={t('tr.tar.buscar')} value={search} onChange={e => setSearch(e.target.value)}
            sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: DL.tH, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', pl: '28px', pr: '10px', py: '7px', outline: 'none', minWidth: 170, transition: 'border-color .15s', '&:hover, &:focus': { borderColor: DL.blue }, '&::placeholder': { color: DL.tS } }} />
        </Box>

        {/* Proyecto filter */}
        {[
          { label: t('tr.lbl.proyecto'), value: proyFilter, onChange: e => setProy(e.target.value), options: proyOpts.map(p => ({ value: String(p.id), label: p.nombre })) },
          { label: t('tr.tar.col.prioridad'), value: prioFilter, onChange: e => setPrio(e.target.value), options: ['Alto','Medio','Bajo'].map(v => ({ value: v, label: v })) },
        ].map(f => (
          <Box key={f.label} sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column' }}>
            <Typography sx={{ position: 'absolute', top: -7, left: 10, zIndex: 1, fontSize: 8.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, background: '#fff', px: '3px', pointerEvents: 'none' }}>
              {f.label}
            </Typography>
            <Box component="select" value={f.value} onChange={f.onChange}
              sx={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, color: f.value ? DL.tH : DL.tS, background: '#fff', border: `1px solid ${f.value ? DL.blue : DL.border2}`, borderRadius: '7px', py: '7px', pl: '10px', pr: '26px', outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 130, transition: 'border-color .15s', '&:hover': { borderColor: DL.blue } }}>
              <option value="">{t('tr.lbl.todos')}</option>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Box>
            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
          </Box>
        ))}

        <Box sx={{ flex: 1 }} />

        <Box component="button" onClick={e => setColAnchor(e.currentTarget)}
          sx={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", fontSize: 10, fontWeight: 500, px: '12px', py: '6px', borderRadius: '7px', border: `1px solid ${DL.border2}`, background: '#fff', color: DL.tM, cursor: 'pointer', '&:hover': { borderColor: DL.blue, color: DL.navy } }}>
          <ColumnIcon sx={{ fontSize: 14 }} /> {t('btn.columns')}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden', boxShadow: DL.e1 }}>
        {/* Header */}
        <Box sx={{ display: 'grid', gridTemplateColumns: fullGrid, background: 'rgba(26,26,26,.025)', borderBottom: `2px solid ${DL.border}`, px: '14px', py: '9px', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t('col.proyecto')}</Typography>
          {visibleDefs.map(def => (
            <Typography key={def.id} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {t(def.labelKey)}
            </Typography>
          ))}
        </Box>

        {grouped.length === 0 && (
          <Box sx={{ py: '48px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, color: DL.tS }}>{t('tr.tar.noTareas')}</Typography>
          </Box>
        )}

        {grouped.map((group, gi) => (
          <Box key={group[0].proyectoId}>
            {group.map((task, i) => (
              <Box key={task._key} sx={{
                display: 'grid', gridTemplateColumns: fullGrid,
                px: '14px', py: '10px', alignItems: 'center',
                borderBottom: `1px solid ${DL.border}`,
                background: !task.activa ? 'rgba(22,163,74,.015)' : 'transparent',
                transition: 'background .12s',
                '&:hover': { background: 'rgba(84,126,105,.025)' },
              }}>
                {/* Project column — name on first row only */}
                <Box sx={{ pr: '12px', borderRight: `1px solid ${DL.border}`, mr: '4px', alignSelf: 'stretch', display: 'flex', alignItems: 'flex-start', pt: '2px' }}>
                  {i === 0 && (
                    <Box onClick={() => navigate(`/tr/proyectos/${task.proyectoId}`)} sx={{ cursor: 'pointer', '&:hover .pnm': { color: DL.blue } }}>
                      <Typography className="pnm" sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, lineHeight: 1.2, transition: 'color .12s' }}>{task.proyectoNombre}</Typography>
                      <Typography sx={{ fontSize: 9, color: DL.tS, mt: '2px' }}>{group.length === 1 ? t('tr.tar.unaTarea') : t('tr.tar.nTareas').replace('{n}', group.length)}</Typography>
                    </Box>
                  )}
                </Box>
                {visibleDefs.map(def => (
                  <Box key={def.id}>{renderCell(task, def.id)}</Box>
                ))}
              </Box>
            ))}
            {/* Group separator */}
            {gi < grouped.length - 1 && (
              <Box sx={{ height: '5px', background: 'rgba(26,26,26,.04)', borderBottom: `1px solid ${DL.border}` }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Columns menu */}
      <Menu anchorEl={colAnchor} open={Boolean(colAnchor)} onClose={() => setColAnchor(null)}
        PaperProps={{ sx: { borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 180 } }}>
        {COL_DEFS.map(def => (
          <MenuItem key={def.id} onClick={() => toggleCol(def.id)} dense sx={{ gap: '6px' }}>
            <Checkbox checked={cols.includes(def.id)} size="small" sx={{ p: 0 }} />
            <ListItemText primary={t(def.labelKey)} primaryTypographyProps={{ fontSize: 12 }} />
          </MenuItem>
        ))}
      </Menu>

      <NuevaTareaModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addTarea} />
      </Box>
    </Box>
  );
}
