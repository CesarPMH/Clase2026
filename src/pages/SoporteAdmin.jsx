// ─── Soporte Admin ────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { Box, Typography, TextField, Divider, Select, MenuItem } from '@mui/material';
import {
  AttachFile as AttachIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const TIPO_ERROR_OPTS   = ['Bug / Error técnico', 'Acceso / Usuarios', 'Datos incorrectos', 'Rendimiento', 'Solicitud de mejora', 'Consulta general', 'Otro'];
const ENCARGADO_OPTS    = ['Sin asignar', 'Steven K.', 'Marcos R.', 'Daniela P.', 'Luis T.'];
const STATUS_OPTS       = ['Abierto', 'En revisión', 'Esperando cliente', 'Resuelto', 'Cerrado'];
const PRIORIDAD_OPTS    = ['Baja', 'Media', 'Alta', 'Crítica'];
const VERTICAL_OPTS     = ['Punto Cero App', 'Facturación', 'Inventarios', 'CRM', 'Otro'];

const STATUS_CFG = {
  'Abierto':            { bg: '#e8e8e8', color: '#1a1a1a' },
  'En revisión':        { bg: '#fef3c7', color: '#b45309' },
  'Esperando cliente':  { bg: '#ededed', color: '#4d3f32' },
  'Resuelto':           { bg: '#dcfce7', color: '#16a34a' },
  'Cerrado':            { bg: '#f6f6f6', color: '#6a6a6a' },
};

const PRIORIDAD_CFG = {
  'Baja':     { color: '#6a6a6a', bg: '#f6f6f6' },
  'Media':    { color: '#1a1a1a', bg: '#e8e8e8' },
  'Alta':     { color: '#b45309', bg: '#fef3c7' },
  'Crítica':  { color: '#dc2626', bg: '#fee2e2' },
};

const daysSince = (dateStr) => {
  const [d, m, y] = dateStr.split('/').map(Number);
  const diff = Date.now() - new Date(y, m - 1, d).getTime();
  return Math.floor(diff / 86400000);
};

// ─── Demo tickets ──────────────────────────────────────────────────────────────
const ADMIN_TICKETS = [
  {
    id: 'DL-001',
    empresa: 'Agropecuaria del Norte S.A.',
    cliente: 'Daniel Castro',
    asunto: 'Error al cargar el dashboard de ventas',
    fecha: '12/04/2026',
    hora: '09:14',
    tipoError: 'Bug / Error técnico',
    encargado: 'Steven K.',
    status: 'En revisión',
    prioridad: 'Alta',
    vertical: 'Punto Cero App',
    descripcion: 'El usuario reporta que al ingresar al dashboard de Ventas la pantalla aparece en blanco. El resto de los módulos funcionan correctamente. Se solicita revisión del componente de carga de KPIs.',
    mensajes: [
      { from: 'cliente', texto: 'Buen día, al intentar abrir el dashboard de ventas aparece una pantalla en blanco.', ts: '12/04/2026 09:14', attachments: [] },
      { from: 'soporte', texto: 'Buen día Daniel, recibimos tu reporte. ¿Puedes indicarnos qué navegador usas y si el error ocurre también en modo incógnito?', ts: '12/04/2026 10:30', attachments: [] },
    ],
  },
  {
    id: 'DL-002',
    empresa: 'Distribuidora El Maíz Ltda.',
    cliente: 'Ana Morales',
    asunto: 'Solicitud de acceso para nuevo usuario',
    fecha: '08/03/2026',
    hora: '14:22',
    tipoError: 'Acceso / Usuarios',
    encargado: 'Daniela P.',
    status: 'Cerrado',
    prioridad: 'Baja',
    vertical: 'Punto Cero App',
    descripcion: 'La empresa solicita la creación de acceso para un nuevo vendedor: Juan Pérez, jperez@empresa.com.',
    mensajes: [
      { from: 'cliente', texto: 'Necesitamos crear acceso para un nuevo vendedor: Juan Pérez, correo jperez@empresa.com.', ts: '08/03/2026 14:22', attachments: [] },
      { from: 'soporte', texto: 'Acceso creado. El usuario recibirá credenciales en los próximos minutos.', ts: '08/03/2026 15:05', attachments: [] },
      { from: 'cliente', texto: 'Perfecto, muchas gracias.', ts: '08/03/2026 15:18', attachments: [] },
      { from: 'soporte', texto: 'Con gusto. Cerramos el ticket.', ts: '08/03/2026 15:20', attachments: [] },
    ],
  },
  {
    id: 'DL-003',
    empresa: 'Semillas del Valle Coop.',
    cliente: 'Roberto Fuentes',
    asunto: 'Los filtros de fecha no responden correctamente',
    fecha: '01/02/2026',
    hora: '11:00',
    tipoError: 'Bug / Error técnico',
    encargado: 'Sin asignar',
    status: 'Abierto',
    prioridad: 'Media',
    vertical: 'Punto Cero App',
    descripcion: 'Al seleccionar el mes de Enero en el filtro de Ventas, los KPIs continúan mostrando datos del año completo.',
    mensajes: [
      { from: 'cliente', texto: 'Al seleccionar Enero en el filtro de Ventas, los KPIs siguen mostrando datos de todo el año.', ts: '01/02/2026 11:00', attachments: [] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function AdminSelect({ label, value, onChange, options, width = 180 }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '4px' }}>{label}</Typography>
      <Select
        value={value} onChange={(e) => onChange(e.target.value)}
        size="small" variant="outlined"
        sx={{
          fontSize: 11, fontWeight: 500, width,
          borderRadius: '7px',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: DL.border2 },
          '& .MuiSelect-select': { py: '6px', px: '10px' },
        }}
      >
        {options.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 11 }}>{o}</MenuItem>)}
      </Select>
    </Box>
  );
}

function MetaItem({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '3px' }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, lineHeight: 1.4 }}>{value}</Typography>
    </Box>
  );
}

function PrioridadBadge({ p }) {
  const cfg = PRIORIDAD_CFG[p] || PRIORIDAD_CFG['Media'];
  return (
    <Box sx={{ display: 'inline-flex', px: '8px', py: '2px', borderRadius: '4px', background: cfg.bg }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: cfg.color }}>{p}</Typography>
    </Box>
  );
}

function StatusBadge({ s }) {
  const cfg = STATUS_CFG[s] || STATUS_CFG['Abierto'];
  return (
    <Box sx={{ display: 'inline-flex', px: '8px', py: '2px', borderRadius: '4px', background: cfg.bg }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: cfg.color }}>{s}</Typography>
    </Box>
  );
}

// ─── Ticket Row ───────────────────────────────────────────────────────────────
function TicketRow({ t: tk, active, onClick }) {
  const { t } = useT();
  const days = daysSince(tk.fecha);
  const priCfg = PRIORIDAD_CFG[tk.prioridad] || PRIORIDAD_CFG['Media'];
  const stCfg  = STATUS_CFG[tk.status] || STATUS_CFG['Abierto'];
  return (
    <Box
      onClick={onClick}
      sx={{
        px: '14px', py: '12px', cursor: 'pointer',
        borderLeft: `3px solid ${active ? DL.blue : 'transparent'}`,
        background: active ? '#f6f6f6' : '#fff',
        borderBottom: `1px solid ${DL.border}`,
        transition: 'all .12s',
        '&:hover': { background: active ? '#f6f6f6' : '#f8fafc' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '4px' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: '8px' }}>
          {tk.asunto}
        </Typography>
        <Box sx={{ px: '5px', py: '1px', borderRadius: '4px', background: stCfg.bg, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 9, fontWeight: 500, color: stCfg.color }}>{tk.status}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 9, color: DL.tS }}>{tk.empresa}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Box sx={{ px: '5px', py: '1px', borderRadius: '4px', background: priCfg.bg }}>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: priCfg.color }}>{tk.prioridad}</Typography>
          </Box>
          <Typography sx={{ fontSize: 9, color: days > 3 ? '#dc2626' : DL.tS }}>
            {days === 0 ? t('soporte.admin.hoy') : `${days}d`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Chat Panel (feed style) ──────────────────────────────────────────────────
function ChatPanel({ ticket, onSend }) {
  const { t } = useT();
  const [msg, setMsg]     = useState('');
  const [files, setFiles] = useState([]);
  const fileRef           = useRef();

  const canPublish = msg.trim() || files.length > 0;

  const handleFile = (e) => {
    setFiles(f => [...f, ...Array.from(e.target.files || [])]);
    e.target.value = '';
  };

  const handlePublish = () => {
    if (!canPublish) return;
    onSend(ticket.id, msg.trim(), files);
    setMsg('');
    setFiles([]);
  };

  const clientInitials = ticket.cliente.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

      {/* ── Feed ── */}
      <Box sx={{
        flex: 1, minHeight: 0, overflowY: 'auto', py: '20px',
        background: '#f8fafc',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 640, px: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ticket.mensajes.map((m, i) => {
            const isSupport = m.from === 'soporte';
            const initials  = isSupport ? 'AD' : clientInitials;
            const avatarBg  = isSupport ? DL.blue : '#3f3f3f';
            const authorLabel = isSupport ? t('soporte.admin.adminNombre') : ticket.cliente;
            const badge     = isSupport ? t('soporte.admin.adminBadge') : t('soporte.admin.clienteBadge');
            const badgeBg   = isSupport ? '#f6f6f6' : '#f6f6f6';
            const badgeBorder = isSupport ? '#d4d4d4' : '#e3e3e3';
            const badgeColor  = isSupport ? DL.blue : DL.tM;
            const headerBg  = isSupport ? '#f6f6f6' : '#f8fafc';

            return (
              <Box key={i} sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                {/* Author bar */}
                <Box sx={{ px: '14px', py: '10px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: headerBg }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#fff', letterSpacing: '-.02em' }}>{initials}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, lineHeight: 1 }}>{authorLabel}</Typography>
                    <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>{m.ts}</Typography>
                  </Box>
                  <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', background: badgeBg, border: `1px solid ${badgeBorder}` }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 500, color: badgeColor }}>{badge}</Typography>
                  </Box>
                </Box>

                {/* Body */}
                <Box sx={{ px: '16px', py: '14px' }}>
                  {m.texto && (
                    <Typography sx={{ fontSize: 13, color: DL.tH, lineHeight: 1.75 }}>{m.texto}</Typography>
                  )}
                  {m.attachments?.length > 0 && (
                    <Box sx={{ mt: m.texto ? '12px' : 0 }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '6px' }}>
                        {t('soporte.admin.archivos').replace('{n}', m.attachments.length)}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {m.attachments.map((a, ai) => (
                          <Box key={ai} onClick={() => a.url && window.open(a.url, '_blank')} sx={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            px: '12px', py: '9px', borderRadius: '8px',
                            background: '#f8fafc', border: `1px solid ${DL.border}`,
                            cursor: a.url ? 'pointer' : 'default', transition: 'all .14s',
                            '&:hover': a.url ? { borderColor: DL.blue, background: '#f6f6f6' } : {},
                          }}>
                            {a.type?.startsWith('image')
                              ? <ImageIcon sx={{ fontSize: 17, color: DL.blue, flexShrink: 0 }} />
                              : <FileIcon sx={{ fontSize: 17, color: DL.tM, flexShrink: 0 }} />
                            }
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</Typography>
                              {a.url && <Typography sx={{ fontSize: 9, color: DL.blue, mt: '1px' }}>{t('soporte.admin.abrirArchivo')}</Typography>}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Compose — pinned bottom ── */}
      <Box sx={{ flexShrink: 0, borderTop: `1px solid ${DL.border}`, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 640, px: '16px', py: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: DL.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 500, color: '#fff' }}>AD</Typography>
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM }}>{t('soporte.admin.responder')}</Typography>
          </Box>

          {/* Textarea */}
          <TextField
            multiline rows={3} fullWidth
            placeholder={t('soporte.admin.placeholder')}
            value={msg} onChange={(e) => setMsg(e.target.value)}
            variant="outlined" size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
          />

          {/* Staged files */}
          {files.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {files.map((f, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '6px', borderRadius: '7px', background: '#f8fafc', border: `1px solid ${DL.border}` }}>
                  {f.type.startsWith('image') ? <ImageIcon sx={{ fontSize: 13, color: DL.blue }} /> : <FileIcon sx={{ fontSize: 13, color: DL.tM }} />}
                  <Typography sx={{ fontSize: 11, color: DL.tM, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</Typography>
                  <Box onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} sx={{ cursor: 'pointer', color: DL.tS, display: 'flex', '&:hover': { color: '#dc2626' } }}>
                    <CloseIcon sx={{ fontSize: 12 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Action row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={handleFile} />
            <Box onClick={() => fileRef.current?.click()} sx={{
              display: 'flex', alignItems: 'center', gap: '5px',
              px: '12px', py: '7px', borderRadius: '8px', cursor: 'pointer',
              border: `1px solid ${DL.border2}`, color: DL.tM,
              fontSize: 11, fontWeight: 500, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              '&:hover': { borderColor: DL.blue, color: DL.blue, background: '#f6f6f6' },
              transition: 'all .14s',
            }}>
              <AttachIcon sx={{ fontSize: 14 }} />
              {t('soporte.admin.adjuntar')}
            </Box>
            <Box sx={{ flex: 1 }} />
            <Box onClick={handlePublish} sx={{
              px: '22px', py: '8px', borderRadius: '8px',
              cursor: canPublish ? 'pointer' : 'default',
              background: canPublish ? DL.blue : '#e3e3e3',
              color: canPublish ? '#fff' : '#8d8d8d',
              fontSize: 12, fontWeight: 500, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              transition: 'background .14s',
              '&:hover': canPublish ? { background: DL.navy } : {},
            }}>
              {t('soporte.admin.publicar')}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ ticket, onUpdate }) {
  const { t } = useT();
  const days  = daysSince(ticket.fecha);

  return (
    <Box sx={{
      width: 280, flexShrink: 0, borderLeft: `1px solid ${DL.border}`,
      overflowY: 'auto', background: '#f6f6f6',
      '&::-webkit-scrollbar': { width: 3 },
      '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 },
    }}>
      {/* Client info */}
      <Box sx={{ px: '16px', pt: '16px', pb: '14px', borderBottom: `1px solid ${DL.border}` }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.08em', mb: '10px' }}>{t('soporte.admin.lbl.cliente')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MetaItem label={t('soporte.admin.lbl.empresa')} value={ticket.empresa} />
          <MetaItem label={t('soporte.admin.lbl.nombreCli')} value={ticket.cliente} />
          <Box>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '3px' }}>{t('soporte.admin.lbl.fechaTicket')}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH }}>{ticket.fecha} {ticket.hora}</Typography>
            <Typography sx={{ fontSize: 10, color: days > 3 ? '#dc2626' : DL.tS, mt: '1px' }}>
              {days === 0 ? t('soporte.admin.recibidoHoy') : days === 1 ? t('soporte.admin.hace').replace('{n}', days) : t('soporte.admin.haces').replace('{n}', days)}
            </Typography>
          </Box>
          {/* Descripción right after fecha */}
          <Box>
            <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '4px' }}>{t('soporte.admin.lbl.descripcion')}</Typography>
            <TextField
              multiline rows={4} fullWidth size="small"
              value={ticket.descripcion}
              onChange={(e) => onUpdate('descripcion', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 11 }, '& .MuiInputBase-input': { lineHeight: 1.6 } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Ticket meta — all dropdowns */}
      <Box sx={{ px: '16px', pt: '14px', pb: '16px' }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.08em', mb: '12px' }}>{t('soporte.admin.lbl.gestion')}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <AdminSelect label={t('soporte.admin.lbl.status')} value={ticket.status} onChange={(v) => onUpdate('status', v)} options={STATUS_OPTS} width={248} />
          <AdminSelect label={t('soporte.admin.lbl.prioridad')} value={ticket.prioridad} onChange={(v) => onUpdate('prioridad', v)} options={PRIORIDAD_OPTS} width={248} />
          <AdminSelect label={t('soporte.admin.lbl.tipoError')} value={ticket.tipoError} onChange={(v) => onUpdate('tipoError', v)} options={TIPO_ERROR_OPTS} width={248} />
          <AdminSelect label={t('soporte.admin.lbl.encargado')} value={ticket.encargado} onChange={(v) => onUpdate('encargado', v)} options={ENCARGADO_OPTS} width={248} />
          <AdminSelect label={t('soporte.admin.lbl.vertical')} value={ticket.vertical} onChange={(v) => onUpdate('vertical', v)} options={VERTICAL_OPTS} width={248} />

          {/* Quick summary row */}
          <Box sx={{ pt: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 10, color: DL.tS }}>{ticket.mensajes.length === 1 ? t('soporte.admin.mensajes').replace('{n}', ticket.mensajes.length) : t('soporte.admin.mensajesP').replace('{n}', ticket.mensajes.length)}</Typography>
            <Box sx={{ display: 'flex', gap: '6px' }}>
              <StatusBadge s={ticket.status} />
              <PrioridadBadge p={ticket.prioridad} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SoporteAdmin() {
  const { t } = useT();
  const [tickets, setTickets] = useState(ADMIN_TICKETS);
  const [activeId, setActiveId] = useState(ADMIN_TICKETS[0].id);
  const [listTab, setListTab]   = useState('abiertos'); // 'abiertos' | 'cerrados'

  const active = tickets.find(tk => tk.id === activeId);

  const handleSend = (id, texto, files = []) => {
    const attachments = files.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setTickets(ts => ts.map(tk =>
      tk.id !== id ? tk : {
        ...tk,
        mensajes: [...tk.mensajes, {
          from: 'soporte',
          texto,
          ts: new Date().toLocaleString('es-GT'),
          attachments,
        }],
      }
    ));
  };

  const handleUpdate = (id, field, value) => {
    setTickets(ts => ts.map(tk => tk.id === id ? { ...tk, [field]: value } : tk));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <PageHeader title={t('soporte.admin.titulo')} subtitle={t('soporte.admin.subtitle')} live={false} />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* ── Ticket list sidebar ── */}
        {(() => {
          const CLOSED_STATUSES = ['Resuelto', 'Cerrado'];
          const abiertos  = tickets.filter(tk => !CLOSED_STATUSES.includes(tk.status));
          const cerrados  = tickets.filter(tk =>  CLOSED_STATUSES.includes(tk.status));
          const shown     = listTab === 'abiertos' ? abiertos : cerrados;
          return (
            <Box sx={{ width: 280, flexShrink: 0, borderRight: `1px solid ${DL.border}`, background: '#fff', display: 'flex', flexDirection: 'column',
              '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 } }}>

              {/* Tabs */}
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${DL.border}`, background: '#fff', flexShrink: 0 }}>
                {[
                  { id: 'abiertos', label: t('soporte.admin.abiertos'), count: abiertos.length },
                  { id: 'cerrados', label: t('soporte.admin.cerrados'), count: cerrados.length },
                ].map(tab => (
                  <Box
                    key={tab.id}
                    onClick={() => setListTab(tab.id)}
                    sx={{
                      flex: 1, px: '8px', py: '10px', cursor: 'pointer',
                      borderBottom: `2px solid ${listTab === tab.id ? DL.blue : 'transparent'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'border-color .14s',
                      '&:hover': { background: '#f8fafc' },
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: listTab === tab.id ? 500 : 500, color: listTab === tab.id ? DL.blue : DL.tS }}>
                      {tab.label}
                    </Typography>
                    <Box sx={{ px: '5px', py: '1px', borderRadius: '10px', background: listTab === tab.id ? '#e8e8e8' : '#f6f6f6' }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: listTab === tab.id ? DL.blue : DL.tS }}>{tab.count}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* List */}
              <Box sx={{ flex: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: 3 }, '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 } }}>
                {shown.length === 0 ? (
                  <Box sx={{ p: '24px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 11, color: DL.tS }}>{t('soporte.admin.noTickets').replace('{tab}', listTab === 'abiertos' ? t('soporte.admin.abiertos').toLowerCase() : t('soporte.admin.cerrados').toLowerCase())}</Typography>
                  </Box>
                ) : (
                  shown.map(tk => (
                    <TicketRow key={tk.id} t={tk} active={tk.id === activeId} onClick={() => setActiveId(tk.id)} />
                  ))
                )}
              </Box>
            </Box>
          );
        })()}

        {/* ── Main: chat + detail ── */}
        {active ? (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

            {/* Ticket header */}
            <Box sx={{ px: '20px', py: '12px', borderBottom: `1px solid ${DL.border}`, background: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, lineHeight: 1 }}>{active.asunto}</Typography>
                <Typography sx={{ fontSize: 10, color: DL.tS, mt: '3px' }}>{active.empresa} · {active.cliente} · {active.id}</Typography>
              </Box>
              <StatusBadge s={active.status} />
              <PrioridadBadge p={active.prioridad} />
            </Box>

            {/* Chat + Detail */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <ChatPanel ticket={active} onSend={handleSend} />
              <DetailPanel ticket={active} onUpdate={(field, val) => handleUpdate(active.id, field, val)} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: 13, color: DL.tS }}>{t('soporte.admin.selTicket')}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
