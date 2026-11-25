// Component library: MUI
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Chip, Button, Avatar, LinearProgress,
  TextField, Select, MenuItem, FormControl, InputAdornment,
  Divider, IconButton, Tooltip, Modal, Paper, Snackbar, Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreHoriz as MoreIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as CircleIcon,
  ArrowForward as ArrowIcon,
  ChatBubbleOutlineOutlined as ChatIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Circle as DotIcon,
  Build as BuildIcon,
  Repeat as RepeatIcon,
} from '@mui/icons-material';
import { DL } from '../../theme';
import { proyectos, USUARIOS, ESTADO_CHIP, PRIORIDAD_CHIP } from '../../data/tr-mock';

// ── helpers ───────────────────────────────────────────────────────────────────
function UserAvatar({ uid, size = 22 }) {
  const u = USUARIOS.find(x => x.id === uid);
  if (!u) return null;
  return (
    <Tooltip title={u.nombre}>
      <Avatar sx={{ width: size, height: size, fontSize: size * 0.38, fontWeight: 500, background: u.color, border: '2px solid #fff' }}>
        {uid}
      </Avatar>
    </Tooltip>
  );
}

function StatusChip({ label, map }) {
  const s = map[label] || { bg: '#f3f4f6', color: '#404040' };
  return (
    <Box sx={{ display: 'inline-flex', px: '8px', py: '2px', borderRadius: '12px', fontSize: 10, fontWeight: 500, background: s.bg, color: s.color }}>
      {label}
    </Box>
  );
}

// ── Sidebar derecho ────────────────────────────────────────────────────────────
function SidebarSection({ title, children }) {
  return (
    <Box sx={{ mb: '4px' }}>
      <Box sx={{ px: '16px', py: '8px', background: 'rgba(26,26,26,.04)', borderBottom: `1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</Typography>
      </Box>
      <Box sx={{ px: '16px', py: '12px' }}>{children}</Box>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ mb: '10px' }}>
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '2px' }}>{label}</Typography>
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, wordBreak: 'break-word', lineHeight: 1.4 }}>{value || '—'}</Typography>
    </Box>
  );
}

function ProyectoSidebar({ proyecto }) {
  const doneCnt = proyecto.etapas.filter(e => e.status === 'done').length;
  return (
    <Box sx={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${DL.border}`, overflowY: 'auto', background: '#f6f6f6', display: 'flex', flexDirection: 'column' }}>

      {/* Etapas */}
      <SidebarSection title={`Etapas del Proyecto (${doneCnt}/${proyecto.etapas.length})`}>
        {proyecto.etapas.map((e, i) => (
          <Box key={e.key} sx={{ display: 'flex', gap: '10px', mb: '4px', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: '3px', flexShrink: 0 }}>
              {e.status === 'done'
                ? <CheckIcon sx={{ fontSize: 15, color: DL.green }} />
                : e.status === 'active'
                ? <ArrowIcon sx={{ fontSize: 15, color: DL.blue }} />
                : <CircleIcon sx={{ fontSize: 15, color: 'rgba(26,26,26,.18)' }} />}
              {i < proyecto.etapas.length - 1 && (
                <Box sx={{ width: 2, flex: 1, minHeight: 10, borderRadius: 1, background: e.status === 'done' ? DL.green : 'rgba(26,26,26,.08)', mt: '3px' }} />
              )}
            </Box>
            <Box sx={{ pb: '8px', flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: e.status === 'pending' ? DL.tS : DL.tH, lineHeight: 1.2 }}>
                {e.label}
              </Typography>
              <Typography sx={{ fontSize: 10, color: DL.tS, mt: '1px' }}>{e.sub}</Typography>
            </Box>
          </Box>
        ))}
      </SidebarSection>

      {/* Descripción */}
      <SidebarSection title="Descripción">
        <Typography sx={{ fontSize: 11, color: DL.tM, lineHeight: 1.65 }}>{proyecto.descripcion}</Typography>
      </SidebarSection>

      {/* Encargados */}
      <SidebarSection title="Encargados">
        <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {proyecto.encargados.map(uid => <UserAvatar key={uid} uid={uid} size={28} />)}
        </Box>
      </SidebarSection>

      {/* Info proyecto - 2 column grid */}
      <SidebarSection title="Información del Proyecto">
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          {[
            ['Sector',             proyecto.infoProyecto.sector],
            ['Estructurador',      proyecto.infoProyecto.estructurador],
            ['Tipo de Token',      proyecto.infoProyecto.tipoToken],
            ['Nombre Subyacente',  proyecto.infoProyecto.activoSubyacente],
            ['Precio Token',       proyecto.infoProyecto.precioToken],
            ['Monto Tokenizado',   proyecto.infoProyecto.montoTokenizado],
            ['N° de Tokens',       proyecto.infoProyecto.numeroTokens],
            ['Blockchain',         proyecto.infoProyecto.blockchain],
            ['Nombre Token',       proyecto.infoProyecto.nombreToken],
            ['Plazo de la Emisión',proyecto.infoProyecto.plazoEmision],
          ].map(([label, val]) => (
            <InfoRow key={label} label={label} value={val} />
          ))}
        </Box>
      </SidebarSection>

      {/* Info cliente - 2 column grid */}
      <SidebarSection title="Información del Cliente">
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          {[
            ['Nombre',           proyecto.infoCliente.nombre],
            ['Teléfono',         proyecto.infoCliente.telefono],
            ['Correo',           proyecto.infoCliente.correo],
            ['Tipo de Persona',  proyecto.infoCliente.tipoPersona],
            ['Tipo Documento',   proyecto.infoCliente.tipoDocumento],
            ['N° Documento',     proyecto.infoCliente.nDocumento],
            ['Carácter',         proyecto.infoCliente.caracter],
            ['Dirección',        proyecto.infoCliente.direccion],
          ].map(([label, val]) => (
            <InfoRow key={label} label={label} value={val} />
          ))}
        </Box>
      </SidebarSection>

    </Box>
  );
}

// ── Tab: Tareas ───────────────────────────────────────────────────────────────
function TareasTab({ tareas }) {
  const [sub, setSub] = useState('Activas');
  const activas  = tareas.filter(t => t.activa);
  const cerradas = tareas.filter(t => !t.activa);
  const lista    = sub === 'Activas' ? activas : cerradas;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '14px', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: '4px', background: '#f6f6f6', borderRadius: '8px', p: '3px' }}>
          {['Activas', 'Cerradas'].map(t => (
            <Box key={t} onClick={() => setSub(t)} sx={{
              px: '12px', py: '5px', borderRadius: '6px', cursor: 'pointer',
              fontSize: 11, fontWeight: 500,
              background: sub === t ? '#fff' : 'transparent',
              color: sub === t ? DL.blue : DL.tS,
              boxShadow: sub === t ? DL.e1 : 'none',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              {t}
              <Box sx={{ background: sub === t ? DL.blue : 'rgba(26,26,26,.15)', color: sub === t ? '#fff' : DL.tS, borderRadius: '10px', px: '5px', fontSize: 9, fontWeight: 500 }}>
                {t === 'Activas' ? activas.length : cerradas.length}
              </Box>
            </Box>
          ))}
        </Box>
        <TextField placeholder="Buscar tarea..." size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 13, color: DL.tS }} /></InputAdornment>, sx: { fontSize: 11, height: 30 } }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          sx={{ height: 30, fontSize: 11, borderRadius: '8px' }}>
          Agregar Tarea
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 60px', background: 'rgba(26,26,26,.025)', borderBottom: `1px solid ${DL.border}`, px: '12px', py: '8px' }}>
          {['Nombre de la Tarea', 'Prioridad', 'Usuarios Asignados', 'Fecha Límite', 'Acciones'].map(h => (
            <Typography key={h} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</Typography>
          ))}
        </Box>
        {lista.map((t, i) => (
          <Box key={t.id} sx={{
            display: 'grid', gridTemplateColumns: '1fr 80px 100px 100px 60px',
            px: '12px', py: '10px', alignItems: 'center',
            borderBottom: i < lista.length - 1 ? `1px solid ${DL.border}` : 'none',
            '&:hover': { background: 'rgba(84,126,105,.025)' },
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Box sx={{ pt: '2px', color: sub === 'Cerradas' ? DL.green : 'rgba(26,26,26,.2)' }}>
                {sub === 'Cerradas' ? <CheckIcon sx={{ fontSize: 14 }} /> : <CircleIcon sx={{ fontSize: 14 }} />}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{t.nombre}</Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, lineHeight: 1.4, mt: '1px' }}>{t.desc}</Typography>
              </Box>
            </Box>
            <StatusChip label={t.prioridad} map={PRIORIDAD_CHIP} />
            <Box sx={{ display: 'flex', gap: '3px' }}>
              {t.asignados.map(uid => <UserAvatar key={uid} uid={uid} />)}
            </Box>
            <Typography sx={{ fontSize: 10, color: DL.tM }}>{t.fechaLimite}</Typography>
            <IconButton size="small"><MoreIcon sx={{ fontSize: 16, color: DL.tS }} /></IconButton>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Tab: Documentos ───────────────────────────────────────────────────────────
const DOC_TABS = ['Firmado', 'Legal', 'Cliente', 'CNAD', 'Otros'];
const DOC_COLORS = { Firmado: '#16a34a', Legal: DL.blue, Cliente: DL.blue, CNAD: DL.blue, Otros: '#4d3f32' };

function DocumentosTab({ documentos }) {
  const [sub, setSub] = useState('Firmado');
  const lista = documentos.filter(d => d.tipo === sub);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: '6px', mb: '14px', flexWrap: 'wrap' }}>
        {DOC_TABS.map(t => (
          <Box key={t} onClick={() => setSub(t)} sx={{
            px: '12px', py: '5px', borderRadius: '4px', cursor: 'pointer',
            fontSize: 11, fontWeight: 500,
            background: sub === t ? DOC_COLORS[t] : '#f6f6f6',
            color: sub === t ? '#fff' : DL.tS,
            transition: 'all .14s',
          }}>
            {t}
          </Box>
        ))}
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />}
          sx={{ height: 30, fontSize: 11, borderRadius: '8px' }}>
          Subir Documento
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 90px 60px 80px', background: 'rgba(26,26,26,.025)', borderBottom: `1px solid ${DL.border}`, px: '12px', py: '8px' }}>
          {['Nombre del Documento', 'Documento', 'Tamaño', 'Subido Por', 'Modificación', 'Historial', 'Acciones'].map(h => (
            <Typography key={h} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</Typography>
          ))}
        </Box>
        {lista.length === 0 ? (
          <Box sx={{ py: '30px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 11, color: DL.tS }}>No hay documentos en esta categoría</Typography>
          </Box>
        ) : lista.map((d, i) => (
          <Box key={d.id} sx={{
            display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 90px 60px 80px',
            px: '12px', py: '10px', alignItems: 'center',
            borderBottom: i < lista.length - 1 ? `1px solid ${DL.border}` : 'none',
            '&:hover': { background: 'rgba(84,126,105,.025)' },
          }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{d.nombre}</Typography>
            <Box sx={{ px: '6px', py: '2px', background: '#f6f6f6', borderRadius: '6px', fontSize: 10, fontWeight: 500, color: DL.blue, display: 'inline-flex', width: 'fit-content' }}>
              UNO
            </Box>
            <Typography sx={{ fontSize: 10, color: DL.tM }}>{d.tamano}</Typography>
            <UserAvatar uid={d.subidoPor === 'Carlos R.' ? 'CR' : 'ML'} />
            <Typography sx={{ fontSize: 10, color: DL.tM }}>{d.modificacion}</Typography>
            <IconButton size="small"><ChatIcon sx={{ fontSize: 14, color: DL.tS }} /></IconButton>
            <Box sx={{ display: 'flex', gap: '4px' }}>
              <IconButton size="small"><EditIcon sx={{ fontSize: 14, color: DL.tS }} /></IconButton>
              <IconButton size="small"><DownloadIcon sx={{ fontSize: 14, color: DL.tS }} /></IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Tab: Finanzas ─────────────────────────────────────────────────────────────
const FREQ_MONTHS = { mensual: 1, trimestral: 3, semestral: 6, anual: 12 };
const FREQ_LABELS = { mensual: 'mes', trimestral: 'trimestre', semestral: 'semestre', anual: 'año' };

function addMonthsDate(d, n) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r; }

function generarOcurrencias({ fechaInicio, fechaFin, monto, frecuencia, pagos = {} }) {
  if (!fechaInicio || !fechaFin) return [];
  const result = [];
  let cur = new Date(fechaInicio + 'T00:00:00');
  const end = new Date(fechaFin + 'T00:00:00');
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const step = FREQ_MONTHS[frecuencia] || 1;
  while (cur <= end) {
    const key = cur.toISOString().slice(0, 10);
    const pago = pagos[key] || {};
    const isPast = cur < hoy;
    const estado = pago.ref ? 'Pagado' : (isPast ? 'Vencido' : 'Próximo');
    result.push({
      key, estado, ref: pago.ref || '', notas: pago.notas || '',
      monto: Number(monto),
      fecha: cur.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    cur = addMonthsDate(cur, step);
  }
  return result;
}

const IMPL0 = {
  configurado: true,
  descripcion: 'Desarrollo y configuración del sistema de tokenización',
  monto: 5000, fecha: '2025-01-15',
  abonos: [
    { id: 1, fecha: '2025-01-20', monto: 2000, ref: 'REF-847291', notas: 'Primer abono' },
    { id: 2, fecha: '2025-02-10', monto: 1500, ref: 'REF-921004', notas: 'Segundo abono' },
  ],
};
const MANT0 = {
  configurado: true,
  descripcion: 'Mantenimiento y seguimiento mensual',
  monto: 500, frecuencia: 'mensual',
  fechaInicio: '2025-02-01', fechaFin: '2026-02-01',
  pagos: {
    '2025-02-01': { ref: 'REF-221001', notas: '' },
    '2025-03-01': { ref: 'REF-221002', notas: '' },
    '2025-04-01': { ref: 'REF-221003', notas: '' },
  },
};

const OCC_CHIP = {
  Pagado:  { bg: '#dcfce7', color: '#16a34a', dot: '#16a34a' },
  Próximo: { bg: '#e8e8e8', color: '#1a1a1a', dot: DL.blue },
  Vencido: { bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
};

function FinanzasModal({ open, title, onClose, onSave, saveDisabled, children }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, borderRadius: '14px', p: '24px', outline: 'none', maxHeight: '90vh', overflowY: 'auto' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '16px' }}>{title}</Typography>
        {children}
        <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', mt: '20px' }}>
          <Button onClick={onClose} sx={{ fontSize: 11 }}>Cancelar</Button>
          <Button variant="contained" onClick={onSave} disabled={saveDisabled} sx={{ fontSize: 11, borderRadius: '8px' }}>Guardar</Button>
        </Box>
      </Paper>
    </Modal>
  );
}

function FinanzasTab({ finanzas: _legacy }) {
  const [impl, setImpl] = useState(IMPL0);
  const [mant, setMant] = useState(MANT0);
  const [implForm, setImplForm] = useState(null);
  const [mantForm, setMantForm] = useState(null);
  const [abonoForm, setAbonoForm] = useState(null); // { monto, fecha, ref, notas }
  const [pagoTarget, setPagoTarget] = useState(null);
  const [pagoForm, setPagoForm] = useState({ ref: '', notas: '' });
  const [calTab, setCalTab] = useState('Implementación'); // top calendar tab
  const [sub, setSub] = useState('Todos');               // mantenimiento filter
  const [snack, setSnack] = useState('');

  const ocurrencias = useMemo(() => mant.configurado ? generarOcurrencias(mant) : [], [mant]);

  // Implementación abono totals
  const implAbonos  = impl.configurado ? impl.abonos.reduce((s, a) => s + Number(a.monto), 0) : 0;
  const implSaldo   = impl.configurado ? Math.max(0, Number(impl.monto) - implAbonos) : 0;
  const implPct     = impl.configurado ? Math.min(100, Math.round((implAbonos / Number(impl.monto)) * 100)) : 0;
  const implEstado  = implAbonos >= Number(impl.monto || 1) ? 'Pagado' : implAbonos > 0 ? 'Parcial' : 'Pendiente';
  const IMPL_ESTADO_COLOR = { Pagado: { bg: '#dcfce7', color: '#16a34a' }, Parcial: { bg: '#fef3c7', color: '#d97706' }, Pendiente: { bg: '#fee2e2', color: '#dc2626' } };

  const mantCobrado   = ocurrencias.filter(o => o.estado === 'Pagado').reduce((s, o) => s + o.monto, 0);
  const mantPendiente = ocurrencias.filter(o => o.estado !== 'Pagado').reduce((s, o) => s + o.monto, 0);

  const mantPreview = useMemo(() => mantForm && mantForm.frecuencia && mantForm.fechaInicio && mantForm.fechaFin
    ? generarOcurrencias({ ...mantForm, pagos: {} }) : [], [mantForm]);

  const filtered = sub === 'Todos' ? ocurrencias
    : sub === 'Pagados' ? ocurrencias.filter(o => o.estado === 'Pagado')
    : sub === 'Próximos' ? ocurrencias.filter(o => o.estado === 'Próximo')
    : ocurrencias.filter(o => o.estado === 'Vencido');

  const openPago = (o) => { setPagoTarget(o); setPagoForm({ ref: o.ref, notas: o.notas }); };
  const confirmPago = () => {
    setMant(m => ({ ...m, pagos: { ...m.pagos, [pagoTarget.key]: { ref: pagoForm.ref, notas: pagoForm.notas } } }));
    setSnack(`Pago ${pagoTarget.fecha} registrado ✓`);
    setPagoTarget(null);
  };
  const confirmAbono = () => {
    const newAbono = { id: Date.now(), ...abonoForm, monto: Number(abonoForm.monto) };
    setImpl(im => ({ ...im, abonos: [...im.abonos, newAbono] }));
    setSnack(`Abono de $${Number(abonoForm.monto).toLocaleString()} registrado ✓`);
    setAbonoForm(null);
  };
  const deleteAbono = (id) => {
    setImpl(im => ({ ...im, abonos: im.abonos.filter(a => a.id !== id) }));
    setSnack('Abono eliminado');
  };

  const fieldSx = { mb: '12px', '& .MuiInputBase-input': { fontSize: 11 }, '& label': { fontSize: 11 } };
  const cnt = (estado) => ocurrencias.filter(o => o.estado === estado).length;

  return (
    <Box>
      {/* KPI strip */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '20px' }}>
        {[
          { label: 'Total Cobrado',  val: `$${(implAbonos + mantCobrado).toLocaleString()}`,     color: '#16a34a' },
          { label: 'Por Cobrar',     val: `$${(implSaldo + mantPendiente).toLocaleString()}`,      color: '#f59e0b' },
          { label: 'Abonos Impl.',   val: impl.configurado ? impl.abonos.length : 0,              color: DL.blue },
          { label: 'Mant. Vencidos', val: cnt('Vencido'),                                          color: '#dc2626' },
        ].map(k => (
          <Box key={k.label} sx={{ flex: 1, background: '#f6f6f6', border: `1px solid ${DL.border}`, borderTop: `3px solid ${k.color}`, borderRadius: '10px', p: '12px' }}>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH, mt: '2px' }}>{k.val}</Typography>
          </Box>
        ))}
      </Box>

      {/* Contract setup cards */}
      <Box sx={{ display: 'flex', gap: '12px', mb: '20px' }}>
        {/* Implementación card */}
        <Box sx={{ flex: 1, border: impl.configurado ? `1px solid ${DL.border}` : '2px dashed #d4d4d4', borderRadius: '12px', p: '16px', background: '#f6f6f6' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BuildIcon sx={{ fontSize: 16, color: DL.blue }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>Implementación</Typography>
                <Typography sx={{ fontSize: 9, color: DL.tS }}>Cobro único de desarrollo</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <Button size="small" variant="contained" onClick={() => setAbonoForm({ monto: '', fecha: '', ref: '', notas: '' })}
                disabled={!impl.configurado} sx={{ fontSize: 10, height: 26, borderRadius: '7px' }}>
                + Abono
              </Button>
              <Button size="small" variant="outlined" onClick={() => setImplForm(impl.configurado ? { descripcion: impl.descripcion, monto: impl.monto, fecha: impl.fecha } : { descripcion: '', monto: '', fecha: '' })}
                sx={{ fontSize: 10, height: 26, borderRadius: '7px' }}>
                {impl.configurado ? 'Editar' : 'Configurar'}
              </Button>
            </Box>
          </Box>
          {impl.configurado ? (
            <>
              <Typography sx={{ fontSize: 10, color: DL.tM, mb: '10px', lineHeight: 1.5 }}>{impl.descripcion}</Typography>
              {/* Amount + status */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH }}>${Number(impl.monto).toLocaleString()}</Typography>
                <Box sx={{ px: '8px', py: '2px', borderRadius: '10px', fontSize: 10, fontWeight: 500, ...IMPL_ESTADO_COLOR[implEstado] }}>
                  {implEstado}
                </Box>
              </Box>
              {/* Progress bar */}
              <LinearProgress variant="determinate" value={implPct}
                sx={{ height: 6, borderRadius: 3, mb: '6px', background: '#ededed',
                  '& .MuiLinearProgress-bar': { background: implEstado === 'Pagado' ? '#16a34a' : implEstado === 'Parcial' ? '#f59e0b' : DL.blue, borderRadius: 3 } }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '10px' }}>
                <Typography sx={{ fontSize: 9, color: '#16a34a', fontWeight: 500 }}>Cobrado: ${implAbonos.toLocaleString()}</Typography>
                <Typography sx={{ fontSize: 9, color: implSaldo > 0 ? '#dc2626' : DL.tS, fontWeight: 500 }}>Saldo: ${implSaldo.toLocaleString()}</Typography>
              </Box>
              {/* Abonos list */}
              {impl.abonos.length > 0 && (
                <Box sx={{ borderTop: `1px solid ${DL.border}`, pt: '8px' }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '6px' }}>Abonos recibidos</Typography>
                  {impl.abonos.map(a => (
                    <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '4px', borderBottom: `1px solid rgba(0,0,0,.04)` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: 10, color: DL.tM }}>{a.fecha}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tH }}>${Number(a.monto).toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: 9, color: '#16a34a' }}>{a.ref}</Typography>
                      <IconButton size="small" onClick={() => deleteAbono(a.id)} sx={{ p: '2px' }}>
                        <DeleteIcon sx={{ fontSize: 12, color: DL.tS }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ py: '14px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 10, color: DL.tS }}>Configure el cobro de implementación del proyecto</Typography>
            </Box>
          )}
        </Box>

        {/* Mantenimiento card */}
        <Box sx={{ flex: 1, border: mant.configurado ? `1px solid ${DL.border}` : '2px dashed #d4d4d4', borderRadius: '12px', p: '16px', background: '#f6f6f6' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '10px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#ededed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RepeatIcon sx={{ fontSize: 16, color: '#4d3f32' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>Mantenimiento</Typography>
                <Typography sx={{ fontSize: 9, color: DL.tS }}>Cobro recurrente periódico</Typography>
              </Box>
            </Box>
            <Button size="small" variant="outlined" onClick={() => setMantForm(mant.configurado ? { ...mant } : { configurado: false, descripcion: '', monto: '', frecuencia: 'mensual', fechaInicio: '', fechaFin: '' })}
              sx={{ fontSize: 10, height: 26, borderRadius: '7px' }}>
              {mant.configurado ? 'Editar' : 'Configurar'}
            </Button>
          </Box>
          {mant.configurado ? (
            <>
              <Typography sx={{ fontSize: 10, color: DL.tM, mb: '8px', lineHeight: 1.5 }}>{mant.descripcion}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '4px' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 500, color: DL.tH }}>
                  ${Number(mant.monto).toLocaleString()}
                  <Box component="span" sx={{ fontSize: 10, fontWeight: 500, color: DL.tS }}>/{FREQ_LABELS[mant.frecuencia]}</Box>
                </Typography>
                <Box sx={{ px: '8px', py: '2px', borderRadius: '10px', fontSize: 10, fontWeight: 500, background: '#ededed', color: '#4d3f32', textTransform: 'capitalize' }}>
                  {mant.frecuencia}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 9, color: DL.tS }}>{mant.fechaInicio} → {mant.fechaFin}</Typography>
              <Box sx={{ display: 'flex', gap: '10px', mt: '6px' }}>
                <Typography sx={{ fontSize: 9, color: '#16a34a', fontWeight: 500 }}>{cnt('Pagado')} pagados</Typography>
                <Typography sx={{ fontSize: 9, color: DL.blue, fontWeight: 500 }}>{cnt('Próximo')} próximos</Typography>
                {cnt('Vencido') > 0 && <Typography sx={{ fontSize: 9, color: '#dc2626', fontWeight: 500 }}>{cnt('Vencido')} vencidos</Typography>}
              </Box>
            </>
          ) : (
            <Box sx={{ py: '14px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: 10, color: DL.tS }}>Configure el plan de cobro recurrente del proyecto</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Calendario de Cobros — dual tabs ── */}
      <Box>
        {/* Top-level tab switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '12px' }}>
          <Box sx={{ display: 'flex', gap: '4px', background: DL.dark, borderRadius: '10px', p: '4px' }}>
            {['Implementación', 'Mantenimiento'].map(t => (
              <Box key={t} onClick={() => setCalTab(t)} sx={{
                px: '14px', py: '6px', borderRadius: '7px', cursor: 'pointer',
                fontSize: 11, fontWeight: 500,
                background: calTab === t ? DL.blue : 'transparent',
                color: calTab === t ? '#fff' : 'rgba(255,255,255,.5)',
                transition: 'all .14s',
              }}>
                {t}
                {t === 'Implementación' && impl.configurado && (
                  <Box component="span" sx={{ ml: '6px', background: calTab === t ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)', color: '#fff', borderRadius: '10px', px: '5px', fontSize: 9, fontWeight: 500 }}>
                    {impl.abonos.length}
                  </Box>
                )}
                {t === 'Mantenimiento' && mant.configurado && (
                  <Box component="span" sx={{ ml: '6px', background: calTab === t ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)', color: '#fff', borderRadius: '10px', px: '5px', fontSize: 9, fontWeight: 500 }}>
                    {ocurrencias.length}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Sub-filter only shown for Mantenimiento */}
          {calTab === 'Mantenimiento' && (
            <Box sx={{ display: 'flex', gap: '4px', background: '#f6f6f6', borderRadius: '8px', p: '3px' }}>
              {['Todos', 'Pagados', 'Próximos', 'Vencidos'].map(t => {
                const n = t === 'Pagados' ? cnt('Pagado') : t === 'Próximos' ? cnt('Próximo') : t === 'Vencidos' ? cnt('Vencido') : null;
                return (
                  <Box key={t} onClick={() => setSub(t)} sx={{
                    px: '10px', py: '4px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: 10, fontWeight: 500,
                    background: sub === t ? '#fff' : 'transparent',
                    color: sub === t ? DL.blue : DL.tS,
                    boxShadow: sub === t ? DL.e1 : 'none',
                  }}>
                    {t}
                    {n !== null && <Box sx={{ background: sub === t ? DL.blue : '#f6f6f6', color: sub === t ? '#fff' : DL.blue, borderRadius: '10px', px: '5px', fontSize: 9, fontWeight: 500 }}>{n}</Box>}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* ── Implementación calendar ── */}
        {calTab === 'Implementación' && (
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '130px 80px 120px 1fr 80px', background: 'rgba(26,26,26,.025)', borderBottom: `1px solid ${DL.border}`, px: '12px', py: '8px' }}>
              {['Fecha', 'Monto', 'Ref. Bancaria', 'Notas', 'Acción'].map(h => (
                <Typography key={h} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</Typography>
              ))}
            </Box>
            {!impl.configurado || impl.abonos.length === 0 ? (
              <Box sx={{ py: '28px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, color: DL.tS }}>No hay abonos registrados — usa "+ Abono" para registrar pagos parciales</Typography>
              </Box>
            ) : (
              <>
                {impl.abonos.map((a, i) => (
                  <Box key={a.id} sx={{
                    display: 'grid', gridTemplateColumns: '130px 80px 120px 1fr 80px',
                    px: '12px', py: '10px', alignItems: 'center',
                    borderBottom: `1px solid ${DL.border}`,
                    '&:hover': { background: 'rgba(84,126,105,.025)' },
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{a.fecha}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>${Number(a.monto).toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>{a.ref || '—'}</Typography>
                    <Typography sx={{ fontSize: 10, color: DL.tM }}>{a.notas || '—'}</Typography>
                    <IconButton size="small" onClick={() => deleteAbono(a.id)}>
                      <DeleteIcon sx={{ fontSize: 14, color: DL.tS }} />
                    </IconButton>
                  </Box>
                ))}
                {/* Summary footer */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '130px 80px 120px 1fr 80px', px: '12px', py: '10px', alignItems: 'center', background: 'rgba(26,26,26,.025)', borderTop: `2px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS }}>Total cobrado</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#16a34a' }}>${implAbonos.toLocaleString()}</Typography>
                  <Box />
                  <Typography sx={{ fontSize: 10, color: implSaldo > 0 ? '#dc2626' : DL.tS, fontWeight: 500 }}>
                    {implSaldo > 0 ? `Saldo pendiente: $${implSaldo.toLocaleString()}` : 'Implementación completamente pagada'}
                  </Typography>
                  <Box />
                </Box>
              </>
            )}
          </Box>
        )}

        {/* ── Mantenimiento calendar ── */}
        {calTab === 'Mantenimiento' && (
          <Box sx={{ border: `1px solid ${DL.border}`, borderRadius: '10px', overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 80px 96px 150px 100px', background: 'rgba(26,26,26,.025)', borderBottom: `1px solid ${DL.border}`, px: '12px', py: '8px' }}>
              {['Fecha', 'Descripción', 'Monto', 'Estado', 'Ref. Bancaria', 'Acción'].map(h => (
                <Typography key={h} sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</Typography>
              ))}
            </Box>
            {!mant.configurado || ocurrencias.length === 0 ? (
              <Box sx={{ py: '24px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, color: DL.tS }}>Configure el mantenimiento para ver el calendario de cobros</Typography>
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ py: '24px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, color: DL.tS }}>No hay cobros en esta categoría</Typography>
              </Box>
            ) : filtered.map((o, i) => {
              const es = OCC_CHIP[o.estado] || {};
              const isFuture = o.estado === 'Próximo';
              return (
                <Box key={o.key} sx={{
                  display: 'grid', gridTemplateColumns: '150px 1fr 80px 96px 150px 100px',
                  px: '12px', py: '10px', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${DL.border}` : 'none',
                  background: isFuture ? 'rgba(248,250,255,.5)' : 'transparent',
                  '&:hover': { background: 'rgba(84,126,105,.025)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: es.dot, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 11, fontWeight: isFuture ? 500 : 500, color: isFuture ? DL.tM : DL.tH }}>{o.fecha}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 10, color: DL.tM }}>{mant.descripcion}</Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>${o.monto.toLocaleString()}</Typography>
                  <Box sx={{ px: '8px', py: '2px', borderRadius: '12px', fontSize: 10, fontWeight: 500, background: es.bg, color: es.color, display: 'inline-flex', width: 'fit-content' }}>
                    {o.estado}
                  </Box>
                  <Typography sx={{ fontSize: 10, color: o.ref ? '#16a34a' : DL.tS, fontWeight: o.ref ? 500 : 400 }}>
                    {o.ref || '—'}
                  </Typography>
                  {o.estado === 'Pagado' ? (
                    <Button size="small" variant="text" onClick={() => openPago(o)} sx={{ fontSize: 9, height: 26, color: DL.tS, borderRadius: '6px' }}>Ver detalles</Button>
                  ) : !isFuture ? (
                    <Button size="small" variant="contained" onClick={() => openPago(o)} sx={{ fontSize: 9, height: 26, borderRadius: '6px', px: '8px' }}>Registrar pago</Button>
                  ) : <Box />}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Modal: Configurar Implementación (base info only) */}
      {implForm && (
        <FinanzasModal open
          title={impl.configurado ? 'Editar Implementación' : 'Configurar Implementación'}
          onClose={() => setImplForm(null)}
          saveDisabled={!implForm.descripcion || !implForm.monto || !implForm.fecha}
          onSave={() => { setImpl(im => ({ ...im, ...implForm, configurado: true })); setImplForm(null); setSnack('Implementación guardada'); }}>
          <TextField fullWidth label="Descripción *" value={implForm.descripcion} onChange={e => setImplForm(f => ({ ...f, descripcion: e.target.value }))} sx={fieldSx} />
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <TextField fullWidth label="Monto total ($) *" type="number" value={implForm.monto} onChange={e => setImplForm(f => ({ ...f, monto: e.target.value }))} sx={fieldSx} />
            <TextField fullWidth label="Fecha acordada *" type="date" value={implForm.fecha} onChange={e => setImplForm(f => ({ ...f, fecha: e.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Box>
          <Box sx={{ background: '#f6f6f6', borderRadius: '8px', p: '10px' }}>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>Los pagos parciales se registran con el botón "+ Abono" en la tarjeta.</Typography>
          </Box>
        </FinanzasModal>
      )}

      {/* Modal: Registrar abono de implementación */}
      {abonoForm && (
        <Modal open onClose={() => setAbonoForm(null)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, borderRadius: '14px', p: '24px', outline: 'none' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '4px' }}>Registrar abono</Typography>
            <Box sx={{ background: '#f6f6f6', borderRadius: '8px', p: '10px', mb: '16px' }}>
              <Typography sx={{ fontSize: 10, color: DL.tS }}>{impl.descripcion}</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>
                Cobrado: ${implAbonos.toLocaleString()} · Saldo: <Box component="span" sx={{ color: implSaldo > 0 ? '#dc2626' : '#16a34a' }}>${implSaldo.toLocaleString()}</Box>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: '10px' }}>
              <TextField fullWidth label="Monto del abono ($) *" type="number" value={abonoForm.monto} onChange={e => setAbonoForm(f => ({ ...f, monto: e.target.value }))} sx={fieldSx} />
              <TextField fullWidth label="Fecha *" type="date" value={abonoForm.fecha} onChange={e => setAbonoForm(f => ({ ...f, fecha: e.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            </Box>
            <TextField fullWidth label="Referencia bancaria *" value={abonoForm.ref} onChange={e => setAbonoForm(f => ({ ...f, ref: e.target.value }))} sx={fieldSx} />
            <TextField fullWidth label="Notas" value={abonoForm.notas} onChange={e => setAbonoForm(f => ({ ...f, notas: e.target.value }))} multiline rows={2} sx={fieldSx} />
            <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', mt: '8px' }}>
              <Button onClick={() => setAbonoForm(null)} sx={{ fontSize: 11 }}>Cancelar</Button>
              <Button variant="contained" onClick={confirmAbono} disabled={!abonoForm.monto || !abonoForm.fecha || !abonoForm.ref.trim()} sx={{ fontSize: 11, borderRadius: '8px' }}>
                Confirmar abono
              </Button>
            </Box>
          </Paper>
        </Modal>
      )}

      {/* Modal: Configurar Mantenimiento */}
      {mantForm && (
        <FinanzasModal open
          title={mant.configurado ? 'Editar Mantenimiento' : 'Configurar Mantenimiento'}
          onClose={() => setMantForm(null)}
          saveDisabled={!mantForm.descripcion || !mantForm.monto || !mantForm.fechaInicio || !mantForm.fechaFin}
          onSave={() => { setMant(m => ({ ...m, ...mantForm, configurado: true, pagos: m.pagos })); setMantForm(null); setSnack('Mantenimiento configurado'); }}>
          <TextField fullWidth label="Descripción del cobro *" value={mantForm.descripcion} onChange={e => setMantForm(f => ({ ...f, descripcion: e.target.value }))} sx={fieldSx} />
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <TextField fullWidth label="Monto por período ($) *" type="number" value={mantForm.monto} onChange={e => setMantForm(f => ({ ...f, monto: e.target.value }))} sx={fieldSx} />
            <FormControl fullWidth sx={fieldSx}>
              <Typography sx={{ fontSize: 10, color: DL.tS, mb: '4px' }}>Frecuencia *</Typography>
              <Select value={mantForm.frecuencia} onChange={e => setMantForm(f => ({ ...f, frecuencia: e.target.value }))} size="small" sx={{ fontSize: 11 }}>
                {['mensual', 'trimestral', 'semestral', 'anual'].map(v => (
                  <MenuItem key={v} value={v} sx={{ fontSize: 11, textTransform: 'capitalize' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <TextField fullWidth label="Fecha de inicio *" type="date" value={mantForm.fechaInicio} onChange={e => setMantForm(f => ({ ...f, fechaInicio: e.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} />
            <TextField fullWidth label="Fecha de fin *" type="date" value={mantForm.fechaFin} onChange={e => setMantForm(f => ({ ...f, fechaFin: e.target.value }))} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Box>
          {mantPreview.length > 0 && (
            <Box sx={{ background: '#f6f6f6', borderRadius: '8px', p: '10px' }}>
              <Typography sx={{ fontSize: 10, color: DL.blue, fontWeight: 500 }}>
                Vista previa: {mantPreview.length} cobros de ${Number(mantForm.monto || 0).toLocaleString()} cada {FREQ_LABELS[mantForm.frecuencia]}
              </Typography>
              <Typography sx={{ fontSize: 9, color: DL.tS, mt: '2px' }}>
                Total contrato: ${(mantPreview.length * Number(mantForm.monto || 0)).toLocaleString()}
              </Typography>
            </Box>
          )}
        </FinanzasModal>
      )}

      {/* Modal: Registrar / Ver pago */}
      {pagoTarget && (
        <Modal open onClose={() => setPagoTarget(null)}>
          <Paper sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, borderRadius: '14px', p: '24px', outline: 'none' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, mb: '4px' }}>
              {pagoTarget.ref ? 'Detalles del pago' : 'Registrar pago'}
            </Typography>
            <Box sx={{ background: '#f6f6f6', borderRadius: '8px', p: '10px', mb: '16px' }}>
              <Typography sx={{ fontSize: 10, color: DL.tS }}>{mant.descripcion}</Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{pagoTarget.fecha} · ${pagoTarget.monto.toLocaleString()}</Typography>
            </Box>
            <TextField fullWidth label="Referencia bancaria *" value={pagoForm.ref} onChange={e => setPagoForm(f => ({ ...f, ref: e.target.value }))} sx={fieldSx} />
            <TextField fullWidth label="Notas" value={pagoForm.notas} onChange={e => setPagoForm(f => ({ ...f, notas: e.target.value }))} multiline rows={2} sx={fieldSx} />
            <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', mt: '8px' }}>
              <Button onClick={() => setPagoTarget(null)} sx={{ fontSize: 11 }}>Cancelar</Button>
              <Button variant="contained" onClick={confirmPago} disabled={!pagoForm.ref.trim()} sx={{ fontSize: 11, borderRadius: '8px' }}>
                {pagoTarget.ref ? 'Actualizar' : 'Confirmar pago'}
              </Button>
            </Box>
          </Paper>
        </Modal>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontSize: 12 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const TABS = ['Tareas', 'Documentos', 'Finanzas'];

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Tareas');

  const proyecto = proyectos.find(p => p.id === Number(id));
  if (!proyecto) return (
    <Box sx={{ p: '40px', textAlign: 'center' }}>
      <Typography sx={{ color: DL.tS }}>Proyecto no encontrado</Typography>
      <Button onClick={() => navigate('/tr/proyectos')} sx={{ mt: 2 }}>Volver</Button>
    </Box>
  );

  const docCount  = proyecto.documentos.length;
  const docTotal  = 10;
  const tarActivas = proyecto.tareas.filter(t => t.activa).length;
  const tarTotal  = proyecto.tareas.length;
  const finPct    = Math.round((proyecto.finanzas.filter(f => f.estado === 'Completado').length / proyecto.finanzas.length) * 100);

  const tabLabel = (t) => {
    if (t === 'Tareas')     return `Tareas (${tarActivas}/${tarTotal})`;
    if (t === 'Documentos') return `Documentos (${docCount}/${docTotal})`;
    if (t === 'Finanzas')   return `Finanzas (${finPct}%)`;
    return t;
  };

  const estadoStyle = ESTADO_CHIP[proyecto.estado] || {};

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }}>
      {/* Main content */}
      <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', p: '24px' }}>
        {/* Back */}
        <Button
          startIcon={<BackIcon sx={{ fontSize: 14 }} />}
          onClick={() => navigate('/tr/proyectos')}
          sx={{ fontSize: 11, color: DL.tS, mb: '12px', p: 0, '&:hover': { background: 'none', color: DL.blue } }}
        >
          Panel de Proyectos
        </Button>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: '12px' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: '4px' }}>
              <Typography sx={{ fontSize: 22, fontWeight: 500, color: DL.tH, letterSpacing: '-.4px' }}>
                {proyecto.nombre}
              </Typography>
              <Box sx={{ px: '10px', py: '3px', borderRadius: '12px', fontSize: 10, fontWeight: 500, background: estadoStyle.bg, color: estadoStyle.color }}>
                {proyecto.estado}
              </Box>
            </Box>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>
              ID: {proyecto.id} &nbsp;|&nbsp; Cliente: {proyecto.cliente}
            </Typography>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>
              Fecha de creación: {proyecto.fechaCreacion}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '6px' }}>
            <IconButton size="small" sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px' }}>
              <ChatIcon sx={{ fontSize: 16, color: DL.tS }} />
            </IconButton>
            <IconButton size="small" sx={{ border: `1px solid ${DL.border}`, borderRadius: '8px' }}>
              <EditIcon sx={{ fontSize: 16, color: DL.tS }} />
            </IconButton>
          </Box>
        </Box>

        {/* Meta info bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '18px', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: 11, color: DL.tM }}>
            Monto Estimado: <Box component="span" sx={{ fontWeight: 500, color: DL.tH }}>${proyecto.montoEstimado.toLocaleString()}</Box>
          </Typography>
          <Typography sx={{ fontSize: 11, color: DL.tM }}>
            Monto Depositado: <Box component="span" sx={{ fontWeight: 500, color: DL.tH }}>${proyecto.montoDepositado.toLocaleString()}</Box>
          </Typography>
          <Typography sx={{ fontSize: 11, color: DL.tM }}>
            Tipo de Emisión: <Box component="span" sx={{ fontWeight: 500, color: DL.tH }}>{proyecto.tipoEmision}</Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ fontSize: 11, color: DL.tM }}>Progreso General</Typography>
            <LinearProgress variant="determinate" value={proyecto.progresoGeneral}
              sx={{ width: 100, height: 5, borderRadius: 3, background: '#ededed',
                '& .MuiLinearProgress-bar': { background: DL.blue, borderRadius: 3 } }} />
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH }}>{proyecto.progresoGeneral}%</Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: '4px', mb: '18px', borderBottom: `2px solid ${DL.border}` }}>
          {TABS.map(t => (
            <Box key={t} onClick={() => setTab(t)} sx={{
              px: '14px', py: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: tab === t ? DL.blue : DL.tS,
              borderBottom: `2px solid ${tab === t ? DL.blue : 'transparent'}`,
              mb: '-2px', transition: 'all .14s',
            }}>
              {tabLabel(t)}
            </Box>
          ))}
        </Box>

        {/* Tab content */}
        {tab === 'Tareas'      && <TareasTab    tareas={proyecto.tareas} />}
        {tab === 'Documentos'  && <DocumentosTab documentos={proyecto.documentos} />}
        {tab === 'Finanzas'    && <FinanzasTab   finanzas={proyecto.finanzas} />}
      </Box>

      {/* Right sidebar */}
      <ProyectoSidebar proyecto={proyecto} />
    </Box>
  );
}
