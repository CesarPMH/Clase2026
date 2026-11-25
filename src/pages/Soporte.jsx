// ─── Soporte ──────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, Divider } from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as BackIcon,
  AttachFile as AttachIcon,
  ChevronRight as ChevronIcon,
  NotificationsActive as UnreadIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { DL } from '../theme';

// ─── Demo data ────────────────────────────────────────────────────────────────
// unread: true = hay un mensaje de soporte que el usuario no ha visto aún
const TICKETS_INIT = [
  {
    id: 'DL-001',
    asunto: 'Error al cargar el dashboard de ventas',
    fecha: '12/04/2026',
    estado: 'Abierto',
    unread: true,
    mensajes: [
      { from: 'user',    texto: 'Buen día, al intentar abrir el dashboard de ventas aparece una pantalla en blanco. El resto de las páginas funcionan bien.', ts: '12/04/2026 09:14' },
      { from: 'soporte', texto: 'Buen día, gracias por reportarlo. ¿Podría indicarnos qué navegador y versión está utilizando? También nos ayuda saber si el error ocurre en incógnito.', ts: '12/04/2026 10:30' },
    ],
  },
  {
    id: 'DL-002',
    asunto: 'Solicitud de acceso para nuevo usuario',
    fecha: '08/03/2026',
    estado: 'Cerrado',
    unread: false,
    mensajes: [
      { from: 'user',    texto: 'Necesitamos crear acceso para un nuevo vendedor: nombre completo Juan Pérez, correo jperez@empresa.com.', ts: '08/03/2026 14:22' },
      { from: 'soporte', texto: 'Hola, el acceso ha sido creado exitosamente. El usuario recibirá sus credenciales por correo en los próximos minutos.', ts: '08/03/2026 15:05' },
      { from: 'user',    texto: 'Perfecto, muchas gracias.', ts: '08/03/2026 15:18' },
      { from: 'soporte', texto: 'Con gusto. Cerramos el ticket. Si necesita algo más no dude en escribirnos.', ts: '08/03/2026 15:20' },
    ],
  },
  {
    id: 'DL-003',
    asunto: 'Los filtros de fecha no responden correctamente',
    fecha: '01/02/2026',
    estado: 'Abierto',
    unread: false,
    mensajes: [
      { from: 'user', texto: 'Al seleccionar el mes de Enero en el filtro de Ventas, los KPIs siguen mostrando datos de todo el año.', ts: '01/02/2026 11:00' },
    ],
  },
];

const ESTADO_CFG = {
  'Abierto': { bg: '#e8e8e8', color: '#1a1a1a' },
  'Cerrado': { bg: '#dcfce7', color: '#16a34a' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CFG[estado] || ESTADO_CFG['Abierto'];
  return (
    <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', background: cfg.bg, display: 'inline-flex' }}>
      <Typography sx={{ fontSize: 10, fontWeight: 500, color: cfg.color }}>{estado}</Typography>
    </Box>
  );
}

// ─── Ticket Detail ────────────────────────────────────────────────────────────
function TicketDetail({ ticket, onBack, onReply }) {
  const [msg, setMsg]     = useState('');
  const [files, setFiles] = useState([]);
  const fileRef           = useRef();

  const canPublish = msg.trim() || files.length > 0;

  const handlePublish = () => {
    if (!canPublish) return;
    onReply(ticket.id, msg.trim(), files);
    setMsg('');
    setFiles([]);
  };

  const handleFile = (e) => {
    setFiles(f => [...f, ...Array.from(e.target.files || [])]);
    e.target.value = '';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>

      {/* Sub-header */}
      <Box sx={{ px: '20px', py: '12px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', flexShrink: 0 }}>
        <IconButton size="small" onClick={onBack} sx={{ border: `1px solid ${DL.border}`, borderRadius: '7px', p: '5px', color: DL.tS, '&:hover': { color: DL.blue, borderColor: DL.blue, background: '#f6f6f6' } }}>
          <BackIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: DL.tH, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.asunto}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mt: '4px', flexWrap: 'wrap' }}>
            {[
              { label: 'Ticket', value: ticket.id },
              { label: 'Apertura', value: ticket.fecha },
              { label: 'Publicaciones', value: ticket.mensajes.length },
            ].map(({ label, value }) => (
              <Typography key={label} sx={{ fontSize: 10, color: DL.tS }}>
                <Box component="span" sx={{ fontWeight: 500, color: DL.tM }}>{label}:</Box> {value}
              </Typography>
            ))}
          </Box>
        </Box>
        <EstadoBadge estado={ticket.estado} />
      </Box>

      {/* Feed — scrollable, only post cards */}
      <Box sx={{
        flex: 1, minHeight: 0, overflowY: 'auto', py: '24px',
        background: '#f8fafc',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { background: '#e3e3e3', borderRadius: 2 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 680, px: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {ticket.mensajes.map((m, i) => {
            const isUser = m.from === 'user';
            return (
              <Box key={i} sx={{ background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                {/* Author bar */}
                <Box sx={{ px: '16px', py: '11px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', background: isUser ? '#f6f6f6' : '#f8fafc' }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isUser ? DL.blue : '#3f3f3f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: '#fff', letterSpacing: '-.02em' }}>
                      {isUser ? 'TÚ' : 'DL'}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: DL.tH, lineHeight: 1 }}>
                      {isUser ? 'Tú' : 'Soporte Punto Cero'}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: DL.tS, mt: '2px' }}>{m.ts}</Typography>
                  </Box>
                  <Box sx={{ px: '8px', py: '2px', borderRadius: '4px', background: isUser ? '#f6f6f6' : '#f6f6f6', border: `1px solid ${isUser ? '#d4d4d4' : '#e3e3e3'}` }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 500, color: isUser ? DL.blue : DL.tM }}>
                      {isUser ? 'Cliente' : 'Soporte'}
                    </Typography>
                  </Box>
                </Box>
                {/* Body */}
                <Box sx={{ px: '18px', py: '16px' }}>
                  {m.texto && (
                    <Typography sx={{ fontSize: 13, color: DL.tH, lineHeight: 1.75 }}>{m.texto}</Typography>
                  )}
                  {m.attachments?.length > 0 && (
                    <Box sx={{ mt: m.texto ? '14px' : 0 }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '.07em', mb: '8px' }}>
                        Archivos adjuntos · {m.attachments.length}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {m.attachments.map((a, ai) => (
                          <Box key={ai} onClick={() => a.url && window.open(a.url, '_blank')} sx={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            px: '12px', py: '10px', borderRadius: '8px',
                            background: '#f8fafc', border: `1px solid ${DL.border}`,
                            cursor: a.url ? 'pointer' : 'default', transition: 'all .14s',
                            '&:hover': a.url ? { borderColor: DL.blue, background: '#f6f6f6' } : {},
                          }}>
                            {a.type?.startsWith('image')
                              ? <ImageIcon sx={{ fontSize: 18, color: DL.blue, flexShrink: 0 }} />
                              : <FileIcon sx={{ fontSize: 18, color: DL.tM, flexShrink: 0 }} />
                            }
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tH, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</Typography>
                              {a.url && <Typography sx={{ fontSize: 9, color: DL.blue, mt: '1px' }}>Clic para abrir</Typography>}
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

      {/* ── Compose — pinned to bottom ── */}
      {ticket.estado !== 'Cerrado' ? (
        <Box sx={{ flexShrink: 0, borderTop: `1px solid ${DL.border}`, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: 680, px: '20px', py: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Compose header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: DL.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 500, color: '#fff' }}>TÚ</Typography>
              </Box>
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM }}>Agregar actualización</Typography>
            </Box>

            {/* Textarea */}
            <TextField
              multiline rows={3} fullWidth
              placeholder="Escribe tu mensaje aquí..."
              value={msg} onChange={(e) => setMsg(e.target.value)}
              variant="outlined" size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
            />

            {/* Staged files */}
            {files.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {files.map((f, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '10px', py: '6px', borderRadius: '7px', background: '#f8fafc', border: `1px solid ${DL.border}` }}>
                    {f.type.startsWith('image') ? <ImageIcon sx={{ fontSize: 14, color: DL.blue }} /> : <FileIcon sx={{ fontSize: 14, color: DL.tM }} />}
                    <Typography sx={{ fontSize: 11, color: DL.tM, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</Typography>
                    <Box onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} sx={{ cursor: 'pointer', color: DL.tS, display: 'flex', '&:hover': { color: '#dc2626' } }}>
                      <CloseIcon sx={{ fontSize: 13 }} />
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
                Adjuntar archivo
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
                Publicar
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flexShrink: 0, borderTop: `1px solid ${DL.border}`, background: '#f8fafc', py: '12px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: 11, color: DL.tS, fontStyle: 'italic' }}>
            Este ticket está cerrado. Si necesitas ayuda adicional, abre un nuevo ticket.
          </Typography>
        </Box>
      )}

    </Box>
  );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────
function NewTicketForm({ onCancel, onSubmit }) {
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const canSubmit = asunto.trim() && mensaje.trim();

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', py: '24px', px: '20px' }}>
      <Box sx={{ maxWidth: 680, mx: 'auto', background: '#fff', borderRadius: '12px', boxShadow: DL.e1, p: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, mb: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Asunto *</Typography>
          <TextField fullWidth size="small" placeholder="Describe brevemente tu consulta" value={asunto} onChange={(e) => setAsunto(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, mb: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Mensaje *</Typography>
          <TextField fullWidth multiline rows={6} placeholder="Describe el problema con el mayor detalle posible..." value={mensaje} onChange={(e) => setMensaje(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }} />
        </Box>

        {/* Attach */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Box component="label" sx={{
            display: 'flex', alignItems: 'center', gap: '6px',
            px: '12px', py: '7px', borderRadius: '8px', cursor: 'pointer',
            border: `1px solid ${DL.border2}`, color: DL.tM, fontSize: 11, fontWeight: 500,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            '&:hover': { borderColor: DL.blue, color: DL.blue, background: '#f6f6f6' },
            transition: 'all .14s',
          }}>
            <AttachIcon sx={{ fontSize: 15 }} />
            Adjuntar archivo
            <input type="file" style={{ display: 'none' }} />
          </Box>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>Máx. 10MB · PNG, JPG, PDF</Typography>
        </Box>

        <Divider />

        {/* Legal */}
        <Box sx={{ background: '#f8fafc', borderRadius: '8px', p: '12px', border: `1px solid ${DL.border}` }}>
          <Typography sx={{ fontSize: 10, fontWeight: 500, color: DL.tS, mb: '4px' }}>Información Básica Sobre Protección De Datos</Typography>
          <Typography sx={{ fontSize: 9, color: DL.tS, lineHeight: 1.6 }}>
            Responsable: Punto Cero. Finalidad: Gestión de consultas de soporte. Tus datos no serán cedidos a terceros. Puedes ejercer tus derechos de acceso, rectificación y supresión contactándonos.
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Box onClick={onCancel} sx={{
            px: '16px', py: '8px', borderRadius: '8px', cursor: 'pointer',
            border: `1px solid ${DL.border2}`, color: DL.tM, fontSize: 12, fontWeight: 500,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            '&:hover': { background: '#f8fafc' },
          }}>
            Cancelar
          </Box>
          <Box onClick={() => canSubmit && onSubmit(asunto, mensaje)} sx={{
            px: '20px', py: '8px', borderRadius: '8px', cursor: canSubmit ? 'pointer' : 'default',
            background: canSubmit ? DL.blue : '#e3e3e3', color: canSubmit ? '#fff' : '#8d8d8d',
            fontSize: 12, fontWeight: 500, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            transition: 'background .14s',
            '&:hover': canSubmit ? { background: DL.navy } : {},
          }}>
            Enviar ticket
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Ticket List ──────────────────────────────────────────────────────────────
const ESTADOS_ACTIVOS  = ['Abierto'];
const ESTADOS_CERRADOS = ['Cerrado'];

function TicketCard({ t, onSelect }) {
  const cfg = ESTADO_CFG[t.estado] || ESTADO_CFG['Abierto'];
  return (
    <Box
      onClick={() => onSelect(t.id)}
      sx={{
        background: '#fff', borderRadius: '10px', boxShadow: DL.e1,
        px: '18px', py: '16px', cursor: 'pointer',
        border: `1px solid ${t.unread ? '#d4d4d4' : DL.border}`,
        display: 'flex', alignItems: 'center', gap: '14px',
        transition: 'all .14s',
        '&:hover': { borderColor: DL.blue, boxShadow: DL.e2, transform: 'translateY(-1px)' },
      }}
    >
      {/* Estado dot */}
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography sx={{ fontSize: 13, fontWeight: t.unread ? 500 : 500, color: DL.tH, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.asunto}
          </Typography>
          {t.unread && (
            <Tooltip title="Tienes un mensaje sin leer">
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: '3px',
                px: '6px', py: '2px', borderRadius: '4px',
                background: '#f6f6f6', border: '1px solid #d4d4d4', flexShrink: 0,
              }}>
                <UnreadIcon sx={{ fontSize: 10, color: DL.blue }} />
                <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.blue }}>Nuevo</Typography>
              </Box>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: '8px', mt: '3px', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>{t.id}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>·</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>{t.fecha}</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>·</Typography>
          <Typography sx={{ fontSize: 10, color: DL.tS }}>{t.mensajes.length} mensaje{t.mensajes.length !== 1 ? 's' : ''}</Typography>
        </Box>
      </Box>

      <EstadoBadge estado={t.estado} />
      <ChevronIcon sx={{ fontSize: 16, color: DL.tS, flexShrink: 0 }} />
    </Box>
  );
}

function EmptyState({ label, onNew }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: '60px', gap: '10px' }}>
      <Box sx={{ fontSize: 36 }}>📭</Box>
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tM }}>{label}</Typography>
      {onNew && (
        <Box onClick={onNew} sx={{
          mt: '6px', px: '18px', py: '9px', borderRadius: '9px', cursor: 'pointer',
          background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', fontSize: 11, fontWeight: 500,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
          display: 'flex', alignItems: 'center', gap: '5px',
          '&:hover': { background: '#f6f6f6' }, transition: 'background .14s',
        }}>
          <AddIcon sx={{ fontSize: 14 }} /> Nuevo ticket
        </Box>
      )}
    </Box>
  );
}

function TicketList({ tickets, onSelect, onNew }) {
  const [tab, setTab] = useState('activos');

  const activos  = tickets.filter(t => ESTADOS_ACTIVOS.includes(t.estado));
  const cerrados = tickets.filter(t => ESTADOS_CERRADOS.includes(t.estado));
  const shown    = tab === 'activos' ? activos : cerrados;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs bar */}
      <Box sx={{ borderBottom: `1px solid ${DL.border}`, px: '20px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', maxWidth: 680, width: '100%' }}>
          {[
            { id: 'activos',  label: 'Tickets activos',  count: activos.length },
            { id: 'cerrados', label: 'Tickets cerrados', count: cerrados.length },
          ].map(t => (
            <Box
              key={t.id}
              onClick={() => setTab(t.id)}
              sx={{
                px: '4px', py: '12px', mr: '24px', cursor: 'pointer',
                borderBottom: `2px solid ${tab === t.id ? DL.blue : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: '7px',
                transition: 'border-color .14s',
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: tab === t.id ? 500 : 500, color: tab === t.id ? DL.blue : DL.tS }}>
                {t.label}
              </Typography>
              <Box sx={{ px: '6px', py: '1px', borderRadius: '10px', background: tab === t.id ? '#e8e8e8' : '#f6f6f6' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 500, color: tab === t.id ? DL.blue : DL.tS }}>{t.count}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, py: '20px', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 680, px: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {shown.length === 0 ? (
            <EmptyState
              label={tab === 'activos' ? 'No tienes tickets activos' : 'No hay tickets cerrados aún'}
              onNew={tab === 'activos' ? onNew : null}
            />
          ) : (
            shown.map(t => <TicketCard key={t.id} t={t} onSelect={onSelect} />)
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Soporte() {
  const [tickets, setTickets]   = useState(TICKETS_INIT);
  const [view, setView]         = useState('list'); // 'list' | 'detail' | 'new'
  const [selectedId, setSelectedId] = useState(null);

  const selectedTicket = tickets.find(t => t.id === selectedId);

  const handleNew = () => setView('new');
  const handleCancel = () => setView('list');

  // Mark ticket as read when opened
  const handleSelect = (id) => {
    setTickets(ts => ts.map(t => t.id === id ? { ...t, unread: false } : t));
    setSelectedId(id);
    setView('detail');
  };

  const handleSubmit = (asunto, mensaje) => {
    const newTicket = {
      id: `DL-${String(tickets.length + 1).padStart(3, '0')}`,
      asunto,
      fecha: new Date().toLocaleDateString('es-GT'),
      estado: 'Abierto',
      unread: false,
      mensajes: [{ from: 'user', texto: mensaje, ts: new Date().toLocaleString('es-GT') }],
    };
    setTickets(ts => [newTicket, ...ts]);
    setSelectedId(newTicket.id);
    setView('detail');
  };

  const handleReply = (id, texto, files = []) => {
    const attachments = files.map(f => ({
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    setTickets(ts => ts.map(t =>
      t.id !== id ? t : {
        ...t,
        mensajes: [...t.mensajes, {
          from: 'user', texto,
          ts: new Date().toLocaleString('es-GT'),
          attachments,
        }],
      }
    ));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <PageHeader title="Soporte" subtitle="Centro de ayuda · Punto Cero" live={false}>
        {view !== 'new' && view !== 'detail' && (
          <Box onClick={handleNew} sx={{
            display: 'flex', alignItems: 'center', gap: '6px',
            px: '14px', py: '7px', borderRadius: '8px', cursor: 'pointer',
            background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', fontSize: 11, fontWeight: 500,
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            '&:hover': { background: '#f6f6f6' },
            transition: 'background .14s',
          }}>
            <AddIcon sx={{ fontSize: 15 }} />
            Nuevo ticket
          </Box>
        )}
      </PageHeader>

      {view === 'list' && (
        <TicketList tickets={tickets} onSelect={handleSelect} onNew={handleNew} />
      )}

      {view === 'detail' && selectedTicket && (
        <TicketDetail ticket={selectedTicket} onBack={() => setView('list')} onReply={handleReply} />
      )}

      {view === 'new' && (
        <NewTicketForm onCancel={handleCancel} onSubmit={handleSubmit} />
      )}

    </Box>
  );
}
