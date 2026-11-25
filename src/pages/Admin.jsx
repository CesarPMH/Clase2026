// ─── Admin Portal ─────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography, Switch, Divider, Button, CircularProgress } from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  BarChart as ActivityIcon,
  AccessTime as ClockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { DEFAULT_PERMISSIONS } from '../data/users.js';
import {
  getAllUsers, createUser, adminUpdateProfile,
  resetUserPassword, logAudit, getUserAuditLog,
  getActivityLog, supabase,
} from '../lib/supabase';

import { DL } from '../theme';
import { useT } from '../i18n/LanguageContext';

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";
const AVATAR_COLORS = ['#547e69','#059669','#4d3f32','#d97706','#dc2626','#1a1a1a','#be185d'];

// ─── Permission groups ─────────────────────────────────────────────────────────
// Keep in sync with Sidebar.jsx NAV array.
// Add `soon: true` to items that exist in the sidebar but aren't ready yet.
const PERM_GROUPS = [
  { labelKey: 'admin.perm.comercial', color: '#547e69', items: [
    { id: 'ventas',            labelKey: 'nav.ventas' },
    { id: 'clientes',          labelKey: 'nav.clientes' },
    { id: 'segmento',          labelKey: 'nav.segmento' },
    { id: 'productos',         labelKey: 'nav.productos' },
    { id: 'desempeno',         labelKey: 'nav.desempeno' },
    { id: 'tienda',            labelKey: 'nav.tienda' },
    { id: 'vendedor',          labelKey: 'nav.vendedor' },
    { id: 'producto-detalle',  labelKey: 'nav.productoDetalle', soon: true },
  ]},
  { labelKey: 'admin.perm.financiero', color: '#059669', items: [
    { id: 'finanzas',       labelKey: 'nav.finanzas' },
    { id: 'flujo-caja',     labelKey: 'nav.flujoCaja' },
    { id: 'estado',         labelKey: 'nav.estado' },
    { id: 'balance',        labelKey: 'nav.balance' },
  ]},
  { labelKey: 'admin.perm.tesoreria', color: '#595959', items: [
    { id: 'cuentas-cobrar', labelKey: 'nav.cuentasCobrar' },
    { id: 'cuentas-pagar',  labelKey: 'nav.cuentasPagar' },
    { id: 'aging-saldos',   labelKey: 'nav.agingSaldos' },
  ]},
  { labelKey: 'admin.perm.logistico', color: '#d97706', items: [
    { id: 'inventarios',        labelKey: 'nav.inventarios' },
    { id: 'compras',            labelKey: 'nav.compras' },
    { id: 'egresos',            labelKey: 'nav.egresos' },
    { id: 'movimientos-bodega', labelKey: 'nav.movimientosBodega', soon: true },
  ]},
  { labelKey: 'admin.perm.operaciones', color: '#dc2626', items: [
    { id: 'produccion', labelKey: 'nav.produccion' },
    { id: 'costos',     labelKey: 'nav.costos' },
  ]},
  { labelKey: 'admin.perm.santaAna', color: '#16a34a', items: [
    { id: 'santa-ana', labelKey: 'nav.santaAna' },
  ]},
  { labelKey: 'admin.perm.administracion', color: '#4d3f32', items: [
    { id: 'metas',         labelKey: 'nav.metas' },
    { id: 'soporte',       labelKey: 'nav.soporte' },
    { id: 'soporte-admin', labelKey: 'nav.soporteAdmin' },
  ]},
];

const BLANK = {
  name: '', email: '', pass: '', role: '', company: '',
  isAdmin: false, active: true,
  permissions: { ...DEFAULT_PERMISSIONS },
};

// ─── Company combobox ─────────────────────────────────────────────────────────
function CompanySelect({ value, onChange, companies }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState(value || '');
  const ref = useRef(null);

  // Sync query when value changes from outside
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return companies.filter(c => c.toLowerCase().includes(q));
  }, [query, companies]);

  const showCreate = query.trim() && !companies.some(c => c.toLowerCase() === query.toLowerCase().trim());

  const select = (val) => { onChange(val); setQuery(val); setOpen(false); };

  return (
    <Box ref={ref} sx={{ position:'relative' }}>
      <Box sx={{ position:'relative' }}>
        <Box
          component="input"
          type="text"
          placeholder="Empresa..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          sx={{ ...inputSx, pr:'28px' }}
        />
        <Box onClick={() => setOpen(o => !o)} sx={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', fontSize:10, color:DL.tS, userSelect:'none' }}>
          {open ? '▲' : '▼'}
        </Box>
      </Box>
      {open && (
        <Box sx={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:500,
          background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'8px',
          boxShadow:'0 6px 20px rgba(0,0,0,.1)', maxHeight:200, overflowY:'auto',
        }}>
          {showCreate && (
            <Box onClick={() => select(query.trim())} sx={{ px:'12px', py:'9px', cursor:'pointer', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', gap:'6px', '&:hover':{ background:DL.subtle } }}>
              <Box sx={{ width:16, height:16, borderRadius:'4px', background:`${DL.blue}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.blue, lineHeight:1 }}>+</Typography>
              </Box>
              <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>Crear «{query.trim()}»</Typography>
            </Box>
          )}
          {filtered.length === 0 && !showCreate && (
            <Typography sx={{ px:'12px', py:'9px', fontSize:11, color:DL.tS, fontFamily:FONT }}>Sin coincidencias</Typography>
          )}
          {filtered.map((c, i) => (
            <Box key={i} onClick={() => select(c)} sx={{ px:'12px', py:'8px', cursor:'pointer', fontSize:11, fontWeight: c === value ? 500 : 500, color: c === value ? DL.blue : DL.tH, fontFamily:FONT, background: c === value ? `${DL.blue}08` : 'transparent', '&:hover':{ background:DL.subtle }, borderBottom:`1px solid ${DL.border}`, '&:last-child':{ borderBottom:'none' } }}>
              {c}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

const inputSx = {
  fontFamily: FONT, fontSize: 12, fontWeight: 500, color: DL.tH,
  background: '#f6f6f6', border: `1px solid ${DL.border2}`,
  borderRadius: '7px', padding: '7px 10px', outline: 'none', width: '100%',
  transition: 'border-color .15s',
  '&:focus': { borderColor: DL.blue, background: '#e8e8e8' },
  '&::placeholder': { color: DL.tS, fontWeight: 500 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.08em', mb: '10px', fontFamily: FONT }}>
      {children}
    </Typography>
  );
}
function FieldLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 9, fontWeight: 500, color: DL.tS, textTransform: 'uppercase', letterSpacing: '0.07em', mb: '4px', fontFamily: FONT }}>
      {children}
    </Typography>
  );
}
function fmtDur(secs) {
  if (!secs) return '—';
  if (secs < 60)  return `${secs}s`;
  if (secs < 3600) return `${Math.round(secs/60)}m`;
  return `${(secs/3600).toFixed(1)}h`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-SV', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000)   return 'Ahora';
  if (diffMs < 3600000) return `Hace ${Math.round(diffMs/60000)}m`;
  if (diffMs < 86400000)return `Hace ${Math.round(diffMs/3600000)}h`;
  return d.toLocaleDateString('es-SV', { month:'short', day:'numeric' });
}

// ─── Permission checkbox ──────────────────────────────────────────────────────
function PermItem({ item, checked, groupColor, onToggle, tFn }) {
  const isSoon = !!item.soon;
  return (
    <Box onClick={isSoon ? undefined : onToggle} sx={{
      display:'flex', alignItems:'center', gap:'6px',
      p:'6px 10px', borderRadius:'6px',
      cursor: isSoon ? 'default' : 'pointer',
      border:`1px solid ${isSoon ? DL.border : checked ? groupColor+'40' : DL.border}`,
      background: isSoon ? DL.subtle : checked ? groupColor+'08' : '#fff',
      opacity: isSoon ? 0.5 : 1,
      transition:'all .12s',
      '&:hover': isSoon ? {} : { borderColor: groupColor+'60', background: groupColor+'10' },
    }}>
      <Box sx={{
        width:14, height:14, borderRadius:'3px', flexShrink:0,
        border:`1.5px solid ${isSoon ? DL.border2 : checked ? groupColor : DL.border2}`,
        background: isSoon ? '#e3e3e3' : checked ? groupColor : '#fff',
        display:'flex', alignItems:'center', justifyContent:'center', transition:'all .12s',
      }}>
        {!isSoon && checked && (
          <Box component="svg" viewBox="0 0 10 8" sx={{ width:8, height:8 }}>
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize:10, fontWeight: checked?500:500, color: isSoon ? DL.tS : checked?DL.tH:DL.tM, fontFamily:FONT, lineHeight:1.2, userSelect:'none', flex:1 }}>
        {tFn(item.labelKey)}
      </Typography>
      {isSoon && (
        <Box sx={{ fontSize:7, fontWeight: 500, color:DL.tS, background:'rgba(0,0,0,.06)', px:'5px', py:'1px', borderRadius:'3px', textTransform:'uppercase', letterSpacing:'0.04em', flexShrink:0 }}>
          Pronto
        </Box>
      )}
    </Box>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ userId, adminId, onClose, onDone }) {
  const [pwdVal,    setPwdVal]    = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdErr,    setPwdErr]    = useState('');
  const [pwdOk,     setPwdOk]     = useState(false);

  const handleSubmit = async () => {
    if (!pwdVal || pwdVal.length < 6) { setPwdErr('Mínimo 6 caracteres.'); return; }
    setPwdSaving(true); setPwdErr('');
    try {
      await resetUserPassword(userId, pwdVal);
      await logAudit(userId, adminId, 'password_reset', 'Contraseña restablecida');
      setPwdOk(true);
      onDone?.();
      setTimeout(onClose, 1200);
    } catch (err) {
      setPwdErr(err.message || 'Error al cambiar contraseña.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <Box sx={{ position:'fixed', inset:0, zIndex:1400, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <Box sx={{ background:'#fff', borderRadius:'14px', p:'28px 24px', width:340, boxShadow:'0 24px 64px rgba(0,0,0,.22)' }}
        onClick={e => e.stopPropagation()}>
        <Typography sx={{ fontSize:14, fontWeight: 500, color:DL.tH, fontFamily:FONT, mb:'4px' }}>Cambiar Contraseña</Typography>
        <Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FONT, mb:'20px' }}>La nueva contraseña se aplica de inmediato.</Typography>

        <FieldLabel>Nueva contraseña</FieldLabel>
        <Box component="input" type="password" placeholder="Mínimo 6 caracteres..."
          value={pwdVal} onChange={e => { setPwdVal(e.target.value); setPwdErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
          sx={{ ...inputSx, mb:'14px' }} />

        {pwdErr && (
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.red, fontFamily:FONT, mb:'10px' }}>{pwdErr}</Typography>
        )}
        {pwdOk && (
          <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.green, fontFamily:FONT, mb:'10px' }}>✓ Contraseña actualizada.</Typography>
        )}

        <Box sx={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
          <Box component="button" onClick={onClose}
            sx={{ fontFamily:FONT, fontSize:11, fontWeight: 500, color:DL.tS, background:'transparent', border:`1px solid ${DL.border}`, borderRadius:'7px', px:'14px', py:'7px', cursor:'pointer', '&:hover':{ background:DL.subtle } }}>
            Cancelar
          </Box>
          <Box component="button" onClick={handleSubmit} disabled={pwdSaving || pwdOk}
            sx={{ fontFamily:FONT, fontSize:11, fontWeight: 500, color: '#1a1a1a', background: '#fff', border: '1px solid #1a1a1a', borderRadius:'7px', px:'16px', py:'7px', cursor:'pointer', opacity: (pwdSaving||pwdOk) ? .7 : 1, '&:hover': { background: '#f6f6f6' } }}>
            {pwdSaving ? 'Guardando...' : 'Actualizar'}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Audit Log Section ────────────────────────────────────────────────────────
const EVENT_META = {
  profile_update:  { label: 'Perfil actualizado',     color: '#547e69', icon: '✏️' },
  password_reset:  { label: 'Contraseña restablecida', color: '#4d3f32', icon: '🔑' },
  user_created:    { label: 'Usuario creado',          color: '#059669', icon: '✅' },
};

function AuditLogSection({ userId, refreshKey }) {
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getUserAuditLog(userId)
      .then(d => { setEntries(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId, refreshKey]);

  const fmtFull = (iso) => new Date(iso).toLocaleString('es-SV', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <Box>
      {loading && <Box sx={{ display:'flex', justifyContent:'center', py:'20px' }}><CircularProgress size={18} /></Box>}
      {!loading && entries.length === 0 && (
        <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, textAlign:'center', py:'18px' }}>Sin cambios registrados aún.</Typography>
      )}
      {!loading && entries.length > 0 && (
        <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', fontSize:11, fontFamily:FONT }}>
          <Box component="thead">
            <Box component="tr" sx={{ background:DL.subtle }}>
              {['Evento','Detalle','Fecha'].map(h => (
                <Box component="th" key={h} sx={{ px:'12px', py:'7px', textAlign:'left', borderBottom:`1px solid ${DL.border}` }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>{h}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {entries.map((e, i) => {
              const meta = EVENT_META[e.event_type] || { label: e.event_type, color: DL.tS, icon: '•' };
              // Build detail from changes object
              let detail = e.description || '';
              if (e.changes && Object.keys(e.changes).length > 0) {
                const FIELD_LABELS = { name:'Nombre', email:'Correo', role:'Cargo', company:'Empresa', isAdmin:'Admin', active:'Activo' };
                const parts = Object.entries(e.changes).map(([k, v]) => {
                  const lbl = FIELD_LABELS[k] || k;
                  const from = String(v.from ?? '—');
                  const to   = String(v.to   ?? '—');
                  return `${lbl}: "${from}" → "${to}"`;
                });
                if (parts.length) detail = parts.join(' · ');
              }
              return (
                <Box component="tr" key={e.id || i} sx={{ borderTop:`1px solid ${DL.border}`, '&:hover':{ background:DL.subtle } }}>
                  <Box component="td" sx={{ px:'12px', py:'8px', whiteSpace:'nowrap' }}>
                    <Box sx={{ display:'inline-flex', alignItems:'center', gap:'5px', px:'7px', py:'2px', borderRadius:'4px', background:`${meta.color}12`, border:`1px solid ${meta.color}30` }}>
                      <Typography sx={{ fontSize:9 }}>{meta.icon}</Typography>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:meta.color, fontFamily:FONT }}>{meta.label}</Typography>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ px:'12px', py:'8px', maxWidth:320 }}>
                    <Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT, lineHeight:1.4 }}>{detail || '—'}</Typography>
                  </Box>
                  <Box component="td" sx={{ px:'12px', py:'8px', whiteSpace:'nowrap' }}>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtFull(e.created_at)}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── User Detail Panel ────────────────────────────────────────────────────────
function UserDetailPanel({ form, setForm, isNew, onSave, saving, autoSaveStatus, userId, adminId, onAuditRefresh, companies }) {
  const { t } = useT();
  const [pwdOpen, setPwdOpen] = useState(false);

  const togglePerm = useCallback((id) => setForm(f => ({ ...f, permissions: { ...f.permissions, [id]: !f.permissions[id] } })), [setForm]);
  const toggleGroupAll = useCallback((group) => {
    const allOn = group.items.every(it => form.permissions[it.id]);
    setForm(f => { const next = { ...f.permissions }; group.items.forEach(it => { next[it.id] = !allOn; }); return { ...f, permissions: next }; });
  }, [form, setForm]);

  const isError     = autoSaveStatus.startsWith('error');
  const statusColor = autoSaveStatus === 'saved' ? DL.green : isError ? DL.red : DL.tS;
  const statusText  = autoSaveStatus === 'saving' ? 'Guardando...' : autoSaveStatus === 'saved' ? '✓ Guardado' : isError ? ('✗ ' + (autoSaveStatus.slice(6) || 'Error al guardar')) : '';

  return (
    <>
    {pwdOpen && <ChangePasswordModal userId={userId} adminId={adminId} onClose={() => setPwdOpen(false)} onDone={onAuditRefresh} />}
    <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
      <Box sx={{ px:'16px', py:'12px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
        <Typography sx={{ fontSize:14, fontWeight: 500, color:DL.tH, fontFamily:FONT, flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {isNew ? t('admin.nuevoUsuario') : form.name || t('admin.nuevoUsuario')}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          {/* Auto-save status (existing users) */}
          {!isNew && statusText && (
            <Typography sx={{ fontSize:10, fontWeight: 500, color:statusColor, fontFamily:FONT, transition:'opacity .3s' }}>
              {statusText}
            </Typography>
          )}
          {/* Change password (existing users) */}
          {!isNew && (
            <Box component="button" onClick={() => setPwdOpen(true)}
              sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:DL.tS, background:'transparent', border:`1px solid ${DL.border}`, borderRadius:'7px', px:'10px', py:'5px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', '&:hover':{ borderColor:DL.blue, color:DL.blue, background:`${DL.blue}08` }, transition:'all .15s' }}>
              🔑 Contraseña
            </Box>
          )}
          {/* Create button (new users only) */}
          {isNew && (
            <Button variant="contained" size="small" onClick={onSave} disabled={saving}
              sx={{ background:DL.blue, color:'#fff', fontSize:10, px:'14px', py:'6px', fontFamily:FONT, fontWeight: 500, '&:hover':{ background:'#46695a' }, textTransform:'none' }}>
              {saving ? <CircularProgress size={12} sx={{ color:'#fff' }} /> : 'Crear Usuario'}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ p:'16px', display:'flex', flexDirection:'column', gap:'20px' }}>
        <Box>
          <SectionLabel>{t('admin.secInfoUsuario')}</SectionLabel>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', mb:'12px' }}>
            <Box>
              <FieldLabel>{t('admin.lbl.nombreCompleto')}</FieldLabel>
              <Box component="input" type="text" placeholder={t('admin.placeholder.nombre')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} sx={inputSx} />
            </Box>
            <Box>
              <FieldLabel>{t('admin.lbl.correo')}</FieldLabel>
              <Box component="input" type="email" placeholder={t('admin.placeholder.email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} sx={inputSx} />
            </Box>
          </Box>
          <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', mb:'12px' }}>
            <Box>
              <FieldLabel>Empresa</FieldLabel>
              <CompanySelect
                value={form.company || ''}
                onChange={val => setForm(f => ({ ...f, company: val }))}
                companies={companies}
              />
            </Box>
            <Box>
              <FieldLabel>{t('admin.lbl.cargoRol')}</FieldLabel>
              <Box component="input" type="text" placeholder={t('admin.placeholder.cargo')} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} sx={inputSx} />
            </Box>
          </Box>
          {isNew && (
            <Box sx={{ mb:'14px' }}>
              <FieldLabel>{t('admin.lbl.contrasena')}</FieldLabel>
              <Box component="input" type="password" placeholder={t('admin.placeholder.pass')} value={form.pass} onChange={e => setForm(f => ({ ...f, pass: e.target.value }))} sx={{ ...inputSx, maxWidth:'50%' }} />
            </Box>
          )}
          <Box sx={{ display:'flex', gap:'24px', alignItems:'center', flexWrap:'wrap' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Switch checked={!!form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} size="small"
                sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:DL.green }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ backgroundColor:DL.green } }} />
              <Box>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, lineHeight:1.2 }}>{t('admin.lbl.usuarioActivo')}</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{form.active ? t('admin.lbl.puedeLogin') : t('admin.lbl.accesoBlock')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Switch checked={!!form.isAdmin} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))} size="small"
                sx={{ '& .MuiSwitch-switchBase.Mui-checked':{ color:'#4d3f32' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':{ backgroundColor:'#4d3f32' } }} />
              <Box>
                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, lineHeight:1.2 }}>{t('admin.lbl.accesoAdmin')}</Typography>
                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{form.isAdmin ? t('admin.lbl.adminHab') : t('admin.lbl.sinAcceso')}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor:DL.border }} />

        <Box>
          <SectionLabel>{t('admin.secPermisos')}</SectionLabel>

          <Typography sx={{ fontSize:10, color:DL.tS, mb:'16px', fontFamily:FONT }}>{t('admin.permisos.desc')}</Typography>
          <Box sx={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {PERM_GROUPS.map(group => {
            const allOn = group.items.every(it => form.permissions[it.id]);
            return (
              <Box key={group.labelKey} sx={{ border:`1.5px solid ${group.color}28`, borderRadius:'10px', overflow:'hidden' }}>
                {/* Card header */}
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', px:'12px', py:'8px', background:`${group.color}08`, borderBottom:`1px solid ${group.color}20` }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <Box sx={{ width:8, height:8, borderRadius:'50%', background:group.color }} />
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:group.color, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>
                      {t(group.labelKey)}
                    </Typography>
                  </Box>
                  <Box component="button" onClick={() => toggleGroupAll(group)}
                    sx={{ fontFamily:FONT, fontSize:10, fontWeight: 500, color:group.color, background:'transparent', border:'none', cursor:'pointer', p:0, opacity:.8, '&:hover':{ opacity:1, textDecoration:'underline' } }}>
                    {allOn ? t('admin.lbl.quitarTodos') : t('admin.lbl.todos')}
                  </Box>
                </Box>
                {/* Card body */}
                <Box sx={{ p:'10px', display:'grid', gridTemplateColumns: group.items.length >= 6 ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap:'6px', background:'#fff' }}>
                  {group.items.map(item => (
                    <PermItem key={item.id} item={item} checked={!!form.permissions[item.id]} groupColor={group.color} onToggle={() => togglePerm(item.id)} tFn={t} />
                  ))}
                </Box>
              </Box>
            );
          })}
          </Box>
        </Box>

      </Box>
    </Box>
    </>
  );
}

// ─── Activity Panel ───────────────────────────────────────────────────────────
function ActivityPanel() {
  const [log,      setLog]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [feedTab,  setFeedTab]  = useState('detalle'); // 'detalle' | 'logins'

  useEffect(() => {
    getActivityLog({ limit: 500 })
      .then(data => { setLog(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today       = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return log.filter(e => new Date(e.created_at) >= d); }, [log]);
  const loginEvents = useMemo(() => log.filter(e => e.event === 'login'), [log]);
  const leaveEvents = useMemo(() => log.filter(e => e.event === 'page_leave' && e.duration_seconds), [log]);
  const todayLogins = today.filter(e => e.event === 'login').length;
  const uniqueToday = new Set(today.filter(e => e.event === 'login').map(e => e.user_id)).size;
  const avgTime     = leaveEvents.length ? Math.round(leaveEvents.reduce((s,e) => s + e.duration_seconds, 0) / leaveEvents.length) : 0;

  // Per-page time breakdown
  const pageStats = useMemo(() => {
    const m = {};
    leaveEvents.forEach(e => {
      const lbl = e.page_label || e.page;
      if (!m[lbl]) m[lbl] = { label:lbl, totalSecs:0, visits:0 };
      m[lbl].totalSecs += e.duration_seconds; m[lbl].visits++;
    });
    return Object.values(m).sort((a,b) => b.totalSecs - a.totalSecs).slice(0,8);
  }, [leaveEvents]);
  const maxSecs = pageStats[0]?.totalSecs || 1;

  // Per-user stats
  const [actTab,      setActTab]      = useState('usuario');
  const [ingresoView, setIngresoView] = useState('grafico'); // 'grafico' | 'tabla'

  const userStats = useMemo(() => {
    const m = {};
    log.forEach(e => {
      const uid = e.user_id; const profile = e.profiles;
      if (!m[uid]) m[uid] = { name: profile?.name || uid, initials: profile?.initials || '?', role: profile?.role || '', sessions:0, totalSecs:0, lastSeen:null };
      if (e.event === 'login') m[uid].sessions++;
      if (e.event === 'page_leave' && e.duration_seconds) m[uid].totalSecs += e.duration_seconds;
      if (!m[uid].lastSeen || new Date(e.created_at) > new Date(m[uid].lastSeen)) m[uid].lastSeen = e.created_at;
    });
    return Object.values(m).sort((a,b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  }, [log]);

  // Per-company stats (domain from email)
  const companyStats = useMemo(() => {
    const m = {};
    log.forEach(e => {
      const email = e.profiles?.email || e.email || '';
      const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : 'desconocido';
      if (!m[domain]) m[domain] = { domain, sessions:0, totalSecs:0, users: new Set(), lastSeen:null };
      if (e.event === 'login') m[domain].sessions++;
      if (e.event === 'page_leave' && e.duration_seconds) m[domain].totalSecs += e.duration_seconds;
      if (e.user_id) m[domain].users.add(e.user_id);
      if (!m[domain].lastSeen || new Date(e.created_at) > new Date(m[domain].lastSeen)) m[domain].lastSeen = e.created_at;
    });
    return Object.values(m)
      .map(c => ({ ...c, userCount: c.users.size }))
      .sort((a,b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  }, [log]);

  // Daily logins per user — last 7 days
  const { days, dailyData } = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - i);
      days.push(d);
    }
    const users = {};
    loginEvents.forEach(e => {
      const uid = e.user_id;
      const name = e.profiles?.name || uid;
      const initials = e.profiles?.initials || '?';
      if (!users[uid]) users[uid] = { name, initials, days: {} };
      const d = new Date(e.created_at); d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0,10);
      users[uid].days[key] = (users[uid].days[key] || 0) + 1;
    });
    return { days, dailyData: Object.values(users).sort((a,b) => a.name.localeCompare(b.name)) };
  }, [loginEvents]);

  const dayLabel = (d) => d.toLocaleDateString('es-SV', { weekday:'short', day:'numeric' });
  const dayKey   = (d) => d.toISOString().slice(0,10);

  const KpiBox = ({ icon, label, value, color = DL.blue }) => (
    <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', p:'14px 16px', flex:1, minWidth:0 }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:'8px', mb:'8px' }}>
        <Box sx={{ width:28, height:28, borderRadius:'8px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</Box>
        <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize:22, fontWeight: 500, color:DL.tH, letterSpacing:'-0.04em', fontFamily:FONT }}>{value}</Typography>
    </Box>
  );

  const tabPill = (active) => ({
    px:'12px', py:'4px', borderRadius:'6px', cursor:'pointer', border:'none', outline:'none',
    fontFamily:FONT, fontSize:10, fontWeight: 500,
    color: active ? '#fff' : DL.tS,
    background: active ? DL.blue : 'transparent',
    transition:'all .15s',
  });

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'300px' }}><CircularProgress size={28} /></Box>;

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:'14px' }}>

      {/* KPI row */}
      <Box sx={{ display:'flex', gap:'12px' }}>
        <KpiBox icon={<LoginIcon sx={{ fontSize:14, color:DL.blue }} />}      label="Logins hoy"         value={todayLogins} />
        <KpiBox icon={<PeopleIcon sx={{ fontSize:14, color:'#059669' }} />}   label="Usuarios hoy"       value={uniqueToday}         color="#059669" />
        <KpiBox icon={<ClockIcon sx={{ fontSize:14, color:'#4d3f32' }} />}    label="Tiempo prom/página" value={fmtDur(avgTime)}      color="#4d3f32" />
        <KpiBox icon={<ActivityIcon sx={{ fontSize:14, color:'#d97706' }} />} label="Total logins"       value={loginEvents.length}  color="#d97706" />
      </Box>

      {/* Per-user + time per page */}
      <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
          {/* Header + tabs */}
          <Box sx={{ px:'14px', py:'8px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Actividad</Typography>
            <Box sx={{ display:'flex', gap:'4px', background:DL.subtle, borderRadius:'8px', p:'3px' }}>
              {[{ key:'usuario', label:'Por Usuario' }, { key:'empresa', label:'Por Empresa' }].map(t => (
                <Box key={t.key} component="button" onClick={() => setActTab(t.key)} sx={{ ...tabPill(actTab === t.key), px:'10px', py:'4px', borderRadius:'6px' }}>
                  {t.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Per-user list */}
          {actTab === 'usuario' && (
            <Box sx={{ overflowY:'auto', maxHeight:280 }}>
              {userStats.length === 0 && <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, p:'20px', textAlign:'center' }}>Sin actividad aún</Typography>}
              {userStats.map((u, i) => (
                <Box key={i} sx={{ display:'flex', alignItems:'center', gap:'10px', px:'12px', py:'9px', borderBottom:`1px solid ${DL.border}`, '&:last-child':{ borderBottom:'none' } }}>
                  <Box sx={{ width:30, height:30, borderRadius:'50%', background:AVATAR_COLORS[i%AVATAR_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:'#fff', fontFamily:FONT }}>{u.initials}</Typography>
                  </Box>
                  <Box sx={{ flex:1, minWidth:0 }}>
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name}</Typography>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{u.role}</Typography>
                  </Box>
                  <Box sx={{ textAlign:'right', flexShrink:0 }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{u.sessions} sesiones · {fmtDur(u.totalSecs)}</Typography>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtDateShort(u.lastSeen)}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Per-company list */}
          {actTab === 'empresa' && (
            <Box sx={{ overflowY:'auto', maxHeight:280 }}>
              {companyStats.length === 0 && <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, p:'20px', textAlign:'center' }}>Sin actividad aún</Typography>}
              {companyStats.map((c, i) => (
                <Box key={i} sx={{ display:'flex', alignItems:'center', gap:'10px', px:'12px', py:'9px', borderBottom:`1px solid ${DL.border}`, '&:last-child':{ borderBottom:'none' } }}>
                  {/* Domain favicon-style badge */}
                  <Box sx={{ width:30, height:30, borderRadius:'8px', background:AVATAR_COLORS[i%AVATAR_COLORS.length]+'18', border:`1.5px solid ${AVATAR_COLORS[i%AVATAR_COLORS.length]}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Typography sx={{ fontSize:9, fontWeight: 500, color:AVATAR_COLORS[i%AVATAR_COLORS.length], fontFamily:FONT }}>
                      {c.domain.slice(0,2).toUpperCase()}
                    </Typography>
                  </Box>
                  <Box sx={{ flex:1, minWidth:0 }}>
                    <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.domain}</Typography>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{c.userCount} {c.userCount === 1 ? 'usuario' : 'usuarios'}</Typography>
                  </Box>
                  <Box sx={{ textAlign:'right', flexShrink:0 }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{c.sessions} sesiones · {fmtDur(c.totalSecs)}</Typography>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtDateShort(c.lastSeen)}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
          <Box sx={{ px:'14px', py:'10px', borderBottom:`1px solid ${DL.border}` }}>
            <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Tiempo por Dashboard</Typography>
          </Box>
          <Box sx={{ p:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {pageStats.length === 0 && <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, textAlign:'center', py:'40px' }}>Sin datos aún</Typography>}
            {pageStats.map((p, i) => (
              <Box key={i}>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:'3px' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{p.label}</Typography>
                  <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtDur(p.totalSecs)} · {p.visits} visitas</Typography>
                </Box>
                <Box sx={{ height:6, background:'rgba(26,26,26,.07)', borderRadius:5, overflow:'hidden' }}>
                  <Box sx={{ height:'100%', borderRadius:5, background:AVATAR_COLORS[i%AVATAR_COLORS.length], width:`${(p.totalSecs/maxSecs)*100}%`, transition:'width .6s ease' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Ingresos por día ── */}
      <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
        <Box sx={{ px:'14px', py:'8px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Ingresos por Día · Últimos 7 días</Typography>
          <Box sx={{ display:'flex', gap:'4px', background:DL.subtle, borderRadius:'8px', p:'3px' }}>
            {[{ key:'grafico', label:'Gráfico' }, { key:'tabla', label:'Tabla' }].map(v => (
              <Box key={v.key} component="button" onClick={() => setIngresoView(v.key)} sx={{ ...tabPill(ingresoView === v.key), px:'10px', py:'4px', borderRadius:'6px' }}>
                {v.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Chart view ── */}
        {ingresoView === 'grafico' && (
          <Box sx={{ p:'14px 16px' }}>
            {dailyData.length === 0
              ? <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT, textAlign:'center', py:'40px' }}>Sin logins registrados aún</Typography>
              : <ReactECharts
                  style={{ height: 220 }}
                  option={{
                    tooltip: {
                      trigger: 'axis',
                      backgroundColor: '#fff',
                      borderColor: '#e3e3e3',
                      borderWidth: 1,
                      textStyle: { fontFamily: FONT, fontSize: 11, color: '#1a1a1a' },
                    },
                    legend: {
                      bottom: 0,
                      type: 'scroll',
                      textStyle: { fontFamily: FONT, fontSize: 10, color: '#6a6a6a' },
                      icon: 'circle',
                      itemWidth: 8, itemHeight: 8,
                    },
                    grid: { top: 16, left: 8, right: 8, bottom: 40, containLabel: true },
                    xAxis: {
                      type: 'category',
                      data: days.map(d => d.toLocaleDateString('es-SV', { weekday:'short', day:'numeric' })),
                      axisLine: { lineStyle: { color: '#e3e3e3' } },
                      axisTick: { show: false },
                      axisLabel: { fontFamily: FONT, fontSize: 10, color: '#6a6a6a' },
                    },
                    yAxis: {
                      type: 'value',
                      minInterval: 1,
                      axisLabel: { fontFamily: FONT, fontSize: 10, color: '#8d8d8d' },
                      splitLine: { lineStyle: { color: '#f6f6f6' } },
                    },
                    series: dailyData.map((u, i) => ({
                      name: u.name,
                      type: 'line',
                      smooth: true,
                      symbol: 'circle',
                      symbolSize: 8,
                      lineStyle: { width: 2, color: AVATAR_COLORS[i % AVATAR_COLORS.length] },
                      itemStyle: { color: AVATAR_COLORS[i % AVATAR_COLORS.length], borderWidth: 2, borderColor: '#fff' },
                      data: days.map(d => u.days[dayKey(d)] || 0),
                    })),
                  }}
                />
            }
          </Box>
        )}

        {/* ── Table view ── */}
        {ingresoView === 'tabla' && (
        <Box sx={{ overflowX:'auto' }}>
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:DL.subtle }}>
                <Box component="th" sx={{ px:'14px', py:'8px', textAlign:'left', minWidth:160 }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>Usuario</Typography>
                </Box>
                {days.map((d,i) => (
                  <Box component="th" key={i} sx={{ px:'10px', py:'8px', textAlign:'center' }}>
                    <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FONT, whiteSpace:'nowrap' }}>{dayLabel(d)}</Typography>
                  </Box>
                ))}
                <Box component="th" sx={{ px:'10px', py:'8px', textAlign:'center' }}>
                  <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:FONT }}>Total</Typography>
                </Box>
              </Box>
            </Box>
            <Box component="tbody">
              {dailyData.length === 0 && (
                <Box component="tr">
                  <Box component="td" colSpan={9} sx={{ px:'14px', py:'20px', textAlign:'center' }}>
                    <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT }}>Sin logins registrados aún</Typography>
                  </Box>
                </Box>
              )}
              {dailyData.map((u, i) => {
                const total = Object.values(u.days).reduce((s,v) => s+v, 0);
                return (
                  <Box component="tr" key={i} sx={{ borderTop:`1px solid ${DL.border}`, '&:hover':{ background:DL.subtle } }}>
                    <Box component="td" sx={{ px:'14px', py:'8px' }}>
                      <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <Box sx={{ width:26, height:26, borderRadius:'50%', background:AVATAR_COLORS[i%AVATAR_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff', fontFamily:FONT }}>{u.initials}</Typography>
                        </Box>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT, whiteSpace:'nowrap' }}>{u.name}</Typography>
                      </Box>
                    </Box>
                    {days.map((d, di) => {
                      const cnt = u.days[dayKey(d)] || 0;
                      return (
                        <Box component="td" key={di} sx={{ px:'10px', py:'8px', textAlign:'center' }}>
                          {cnt > 0 ? (
                            <Box sx={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:'6px', background:`${DL.blue}18` }}>
                              <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.blue, fontFamily:FONT }}>{cnt}</Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize:10, color:'rgba(0,0,0,.15)', fontFamily:FONT }}>—</Typography>
                          )}
                        </Box>
                      );
                    })}
                    <Box component="td" sx={{ px:'10px', py:'8px', textAlign:'center' }}>
                      <Box sx={{ display:'inline-flex', alignItems:'center', justifyContent:'center', px:'8px', py:'2px', borderRadius:'4px', background:`${DL.blue}`, minWidth:24 }}>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:'#fff', fontFamily:FONT }}>{total}</Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
        )}
      </Box>

      {/* ── Feed con tabs Detalle / Logins ── */}
      <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
        <Box sx={{ px:'14px', py:'9px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography sx={{ fontSize:12, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Actividad Reciente</Typography>
          <Box sx={{ display:'flex', gap:'4px', background:DL.subtle, borderRadius:'8px', p:'3px' }}>
            <Box component="button" sx={tabPill(feedTab==='detalle')} onClick={() => setFeedTab('detalle')}>Detalle</Box>
            <Box component="button" sx={tabPill(feedTab==='logins')}  onClick={() => setFeedTab('logins')}>Logins</Box>
          </Box>
        </Box>
        <Box sx={{ overflowY:'auto', maxHeight:300 }}>
          <Box component="table" sx={{ width:'100%', borderCollapse:'collapse' }}>
            <Box component="thead">
              <Box component="tr" sx={{ background:DL.subtle }}>
                {feedTab === 'detalle'
                  ? ['Usuario','Empresa','Evento','Página','Duración','Fecha'].map(h => (
                      <Box component="th" key={h} sx={{ px:'12px', py:'6px', textAlign:'left' }}>
                        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>{h}</Typography>
                      </Box>
                    ))
                  : ['Usuario','Empresa','Fecha y Hora','Sesión'].map(h => (
                      <Box component="th" key={h} sx={{ px:'12px', py:'6px', textAlign:'left' }}>
                        <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:FONT }}>{h}</Typography>
                      </Box>
                    ))
                }
              </Box>
            </Box>
            <Box component="tbody">
              {feedTab === 'detalle' && log.slice(0,60).map((e, i) => {
                const evtColor = e.event==='login' ? DL.green : e.event==='logout' ? DL.red : DL.blue;
                const evtLabel = { login:'Ingreso', logout:'Salida', page_enter:'Entró a', page_leave:'Salió de' }[e.event] || e.event;
                const email  = e.profiles?.email || '';
                const domain = email.includes('@') ? email.split('@')[1] : '—';
                return (
                  <Box component="tr" key={i} sx={{ borderTop:`1px solid ${DL.border}`, '&:hover':{ background:DL.subtle } }}>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}><Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{e.profiles?.name || '—'}</Typography></Box>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}>
                      <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, whiteSpace:'nowrap' }}>{domain}</Typography>
                    </Box>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}>
                      <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:`${evtColor}18` }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color:evtColor, fontFamily:FONT }}>{evtLabel}</Typography>
                      </Box>
                    </Box>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}><Typography sx={{ fontSize:10, color:DL.tM, fontFamily:FONT }}>{e.page_label || e.page || '—'}</Typography></Box>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}><Typography sx={{ fontSize:10, color:DL.tS, fontFamily:FONT }}>{fmtDur(e.duration_seconds)}</Typography></Box>
                    <Box component="td" sx={{ px:'12px', py:'7px' }}><Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtDate(e.created_at)}</Typography></Box>
                  </Box>
                );
              })}
              {feedTab === 'logins' && loginEvents.slice(0,60).map((e, i) => {
                const email  = e.profiles?.email || '';
                const domain = email.includes('@') ? email.split('@')[1] : '—';
                return (
                <Box component="tr" key={i} sx={{ borderTop:`1px solid ${DL.border}`, '&:hover':{ background:DL.subtle } }}>
                  <Box component="td" sx={{ px:'12px', py:'8px' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <Box sx={{ width:26, height:26, borderRadius:'50%', background:AVATAR_COLORS[i%AVATAR_COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Typography sx={{ fontSize:9, fontWeight: 500, color:'#fff', fontFamily:FONT }}>{e.profiles?.initials || '?'}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{e.profiles?.name || '—'}</Typography>
                        <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{e.profiles?.role || ''}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box component="td" sx={{ px:'12px', py:'8px' }}>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, whiteSpace:'nowrap' }}>{domain}</Typography>
                  </Box>
                  <Box component="td" sx={{ px:'12px', py:'8px' }}>
                    <Typography sx={{ fontSize:10, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>{fmtDate(e.created_at)}</Typography>
                    <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>{fmtDateShort(e.created_at)}</Typography>
                  </Box>
                  <Box component="td" sx={{ px:'12px', py:'8px' }}>
                    <Box sx={{ display:'inline-flex', px:'6px', py:'1px', borderRadius:'4px', background:`${DL.green}18` }}>
                      <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.green, fontFamily:FONT }}>✓ Exitoso</Typography>
                    </Box>
                  </Box>
                </Box>
                );
              })}
              {((feedTab==='detalle' && log.length===0) || (feedTab==='logins' && loginEvents.length===0)) && (
                <Box component="tr"><Box component="td" colSpan={5} sx={{ px:'14px', py:'20px', textAlign:'center' }}>
                  <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT }}>Sin datos aún</Typography>
                </Box></Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const { t } = useT();
  const [tab, setTab]             = useState('usuarios'); // 'usuarios' | 'actividad'
  const [users, setUsers]         = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isNew, setIsNew]         = useState(false);
  const [form, setForm]           = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '' | 'saving' | 'saved' | 'error'
  const [adminId, setAdminId]       = useState(null);
  const [auditKey, setAuditKey]     = useState(0);
  const loadedFormRef  = useRef(null);
  const autoSaveTimer  = useRef(null);

  const loadUsers = useCallback(() => {
    getAllUsers().then(data => { setUsers(data || []); setLoadingUsers(false); }).catch(() => setLoadingUsers(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAdminId(data?.user?.id || null));
  }, []);

  const companies = useMemo(() =>
    [...new Set(users.map(u => u.company).filter(Boolean))].sort()
  , [users]);

  const handleSelectUser = useCallback((user) => {
    setSelectedId(user.id);
    setIsNew(false);
    // Merge DB permissions with defaults so new keys always have a value
    const dbPerms = user.permissions || {};
    const loaded = {
      name:        user.name     || '',
      email:       user.email    || '',
      role:        user.role     || '',
      company:     user.company  || '',
      isAdmin:     user.is_admin || false,
      active:      user.active   ?? true,
      permissions: { ...DEFAULT_PERMISSIONS, ...dbPerms },
    };
    setForm(loaded);
    loadedFormRef.current = JSON.stringify(loaded);
    setAutoSaveStatus('');
    clearTimeout(autoSaveTimer.current);
    setSaveMsg('');
  }, []);

  const handleNewUser = useCallback(() => {
    setSelectedId(null);
    setIsNew(true);
    setForm({ ...BLANK, permissions: { ...DEFAULT_PERMISSIONS } });
    loadedFormRef.current = null;
    setAutoSaveStatus('');
  }, []);

  // ── Auto-save for existing users ──────────────────────────────────────────
  useEffect(() => {
    if (!form || isNew || !selectedId) return;
    if (JSON.stringify(form) === loadedFormRef.current) return; // no change
    setAutoSaveStatus('saving');
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const initials = form.name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0,2).toUpperCase();
        await adminUpdateProfile(selectedId, {
          name:        form.name,
          initials,
          role:        form.role,
          company:     form.company || null,
          email:       form.email,
          is_admin:    form.isAdmin,
          active:      form.active,
          permissions: form.permissions,
        });

        // ── Detect what changed and log it (non-blocking) ──
        try {
          const FIELD_LABELS = { name:'Nombre', email:'Correo', role:'Cargo', company:'Empresa', isAdmin:'Acceso Admin', active:'Usuario Activo' };
          const oldForm = JSON.parse(loadedFormRef.current || '{}');
          const auditChanges = {};
          Object.keys(FIELD_LABELS).forEach(k => {
            if (oldForm[k] !== form[k]) auditChanges[k] = { from: oldForm[k], to: form[k] };
          });
          if (Object.keys(auditChanges).length > 0) {
            const desc = Object.entries(auditChanges)
              .map(([k, v]) => `${FIELD_LABELS[k]}: "${v.from ?? '—'}" → "${v.to ?? '—'}"`)
              .join(' · ');
            await logAudit(selectedId, adminId, 'profile_update', desc, auditChanges);
            setAuditKey(k => k + 1);
          }
        } catch (auditErr) {
          console.warn('Audit log failed (non-critical):', auditErr);
        }

        loadedFormRef.current = JSON.stringify(form);
        setAutoSaveStatus('saved');
        loadUsers();
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('error:' + (err?.message || 'unknown'));
      }
    }, 700);
    return () => clearTimeout(autoSaveTimer.current);
  }, [form, isNew, selectedId, loadUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async () => {
    if (!form || !isNew) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const newUser = await createUser({ email: form.email, password: form.pass, name: form.name, role: form.role, isAdmin: form.isAdmin });
      if (newUser?.id) await logAudit(newUser.id, adminId, 'user_created', `Usuario creado: ${form.name} (${form.email})`);
      setSaveMsg('✓ Usuario creado. Puede iniciar sesión ahora.');
      setIsNew(false);
      setSelectedId(null);
      setForm(null);
      loadUsers();
    } catch (err) {
      setSaveMsg('✗ ' + (err.message || 'Error al guardar.'));
    } finally {
      setSaving(false);
    }
  }, [form, isNew, loadUsers]);

  const showDetail = isNew || (selectedId && form);

  // Tab pill style
  const tabSx = (active) => ({
    px:'14px', py:'6px', borderRadius:'7px', cursor:'pointer',
    fontFamily:FONT, fontSize:11, fontWeight: 500,
    color: active ? '#fff' : DL.tS,
    background: active ? DL.blue : 'transparent',
    border:'none', outline:'none',
    transition:'all .15s',
    '&:hover':{ background: active ? DL.blue : DL.subtle },
  });

  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <PageHeader title={t('admin.titulo')} subtitle={t('admin.subtitle')} live={false} />

      {/* Tab bar */}
      <Box sx={{ px:'16px', py:'8px', display:'flex', gap:'6px', borderBottom:`1px solid ${DL.border}`, background:'#fff' }}>
        <Box component="button" sx={tabSx(tab==='usuarios')} onClick={() => setTab('usuarios')}>
          Usuarios
        </Box>
        <Box component="button" sx={tabSx(tab==='actividad')} onClick={() => setTab('actividad')}>
          Actividad & Sesiones
        </Box>
      </Box>

      <Box sx={{ flex:1, overflow:'hidden', p:'16px', display:'flex', flexDirection:'column' }}>

        {/* ── USUARIOS TAB ── */}
        {tab === 'usuarios' && (
          <Box sx={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:'16px', alignItems:'start', flex:1, minHeight:0 }}>
            {/* User list */}
            <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden', display:'flex', flexDirection:'column', height:'calc(100vh - 140px)' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:'8px', px:'14px', py:'12px', borderBottom:`1px solid ${DL.border}`, flexShrink:0 }}>
                <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, flex:1, fontFamily:FONT }}>{t('admin.usuarios')}</Typography>
                <Box sx={{ background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', borderRadius:'4px', px:'7px', py:'2px', display:'inline-flex', alignItems:'center' }}>
                  <Typography sx={{ fontSize:10, fontWeight: 500, fontFamily:FONT }}>{users.length}</Typography>
                </Box>
                <Button variant="contained" size="small" onClick={handleNewUser}
                  sx={{ background:DL.blue, color:'#fff', fontSize:10, fontWeight: 500, px:'10px', py:'5px', fontFamily:FONT, textTransform:'none', borderRadius:'7px', '&:hover':{ background:'#46695a' } }}>
                  {t('admin.nuevoUsuario')}
                </Button>
              </Box>

              {loadingUsers ? (
                <Box sx={{ display:'flex', justifyContent:'center', p:'24px' }}><CircularProgress size={20} /></Box>
              ) : (() => {
                // Group users by company, sorted alphabetically. "Sin empresa" at the end.
                const groups = {};
                users.forEach((user, index) => {
                  const key = user.company || '— Sin empresa';
                  if (!groups[key]) groups[key] = [];
                  groups[key].push({ user, index });
                });
                const sortedKeys = Object.keys(groups).sort((a, b) => {
                  if (a === '— Sin empresa') return 1;
                  if (b === '— Sin empresa') return -1;
                  return a.localeCompare(b);
                });
                return (
                  <Box sx={{ overflowY:'auto', flex:1 }}>
                    {sortedKeys.map(companyKey => (
                      <Box key={companyKey}>
                        {/* Company header */}
                        <Box sx={{ px:'12px', py:'6px', background:DL.subtle, borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:1 }}>
                          <Typography sx={{ fontSize:9, fontWeight: 500, color:DL.tS, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:FONT }}>
                            {companyKey}
                          </Typography>
                          <Box sx={{ background:'rgba(0,0,0,.08)', borderRadius:'4px', px:'6px', py:'1px' }}>
                            <Typography sx={{ fontSize:8, fontWeight: 500, color:DL.tS, fontFamily:FONT }}>{groups[companyKey].length}</Typography>
                          </Box>
                        </Box>
                        {/* Users in this company */}
                        {groups[companyKey].map(({ user, index }) => {
                          const isSelected = !isNew && selectedId === user.id;
                          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                          const initials = user.initials || user.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '??';
                          return (
                            <Box key={user.id} onClick={() => handleSelectUser(user)} sx={{
                              display:'flex', alignItems:'center', gap:'10px', px:'12px', py:'9px', cursor:'pointer',
                              borderBottom:`1px solid ${DL.border}`, borderLeft:`3px solid ${isSelected ? DL.blue : 'transparent'}`,
                              background: isSelected ? DL.subtle : '#fff', transition:'all .12s',
                              '&:hover':{ background:DL.subtle }, '&:last-child':{ borderBottom:'none' },
                            }}>
                              <Box sx={{ width:30, height:30, borderRadius:'50%', flexShrink:0, background:avatarColor, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Typography sx={{ fontSize:10, fontWeight: 500, color:'#fff', fontFamily:FONT, letterSpacing:'-0.02em' }}>{initials}</Typography>
                              </Box>
                              <Box sx={{ flex:1, minWidth:0 }}>
                                <Typography sx={{ fontSize:11, fontWeight: 500, color:DL.tH, fontFamily:FONT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                  {user.name || '—'}
                                </Typography>
                                <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                  {user.role || user.email || '—'}
                                </Typography>
                              </Box>
                              <Box sx={{ display:'flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
                                {user.is_admin && (
                                  <Box sx={{ background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', borderRadius:'4px', px:'5px', py:'1px' }}>
                                    <Typography sx={{ fontSize:7, fontWeight: 500, fontFamily:FONT, letterSpacing:'0.04em' }}>Admin</Typography>
                                  </Box>
                                )}
                                <Box sx={{ width:7, height:7, borderRadius:'50%', background: user.active !== false ? DL.green : DL.red }} />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                );
              })()}
            </Box>

            {/* Detail panel + audit log */}
            <Box sx={{ overflowY:'auto', height:'calc(100vh - 140px)', display:'flex', flexDirection:'column', gap:'14px' }}>
              {showDetail && form ? (
                <>
                  {saveMsg && (
                    <Box sx={{ px:'12px', py:'8px', borderRadius:'8px', background: saveMsg.startsWith('✓') ? DL.greenBg : DL.redBg }}>
                      <Typography sx={{ fontSize:11, fontWeight: 500, color: saveMsg.startsWith('✓') ? DL.green : DL.red, fontFamily:FONT }}>{saveMsg}</Typography>
                    </Box>
                  )}

                  {/* ── User info + permissions ── */}
                  <UserDetailPanel form={form} setForm={setForm} isNew={isNew} onSave={handleSave} saving={saving} autoSaveStatus={autoSaveStatus} userId={selectedId} adminId={adminId} onAuditRefresh={() => setAuditKey(k => k + 1)} companies={companies} />

                  {/* ── Audit log card (existing users only) ── */}
                  {!isNew && (
                    <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', overflow:'hidden' }}>
                      <Box sx={{ px:'16px', py:'11px', borderBottom:`1px solid ${DL.border}`, display:'flex', alignItems:'center', gap:'8px' }}>
                        <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, fontFamily:FONT }}>Historial de Cambios</Typography>
                        <Typography sx={{ fontSize:9, color:DL.tS, fontFamily:FONT }}>más reciente primero</Typography>
                      </Box>
                      <Box sx={{ p:'4px 0' }}>
                        <AuditLogSection userId={selectedId} refreshKey={auditKey} />
                      </Box>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ background:'#fff', border:`1px solid ${DL.border}`, borderRadius:'10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'340px', gap:'12px' }}>
                  <Box sx={{ width:52, height:52, borderRadius:'50%', background:DL.subtle, border:`1px solid ${DL.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <PeopleIcon sx={{ fontSize:24, color:DL.tS }} />
                  </Box>
                  <Box sx={{ textAlign:'center' }}>
                    <Typography sx={{ fontSize:13, fontWeight: 500, color:DL.tH, mb:'4px', fontFamily:FONT }}>{t('admin.empty.titulo')}</Typography>
                    <Typography sx={{ fontSize:11, color:DL.tS, fontFamily:FONT }}>{t('admin.empty.sub')}</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* ── ACTIVIDAD TAB ── */}
        {tab === 'actividad' && (
          <Box sx={{ overflowY:'auto', flex:1 }}>
            <ActivityPanel />
          </Box>
        )}
      </Box>
    </Box>
  );
}
