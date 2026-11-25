// ─── Listado de Egresos ────────────────────────────────────────────────────────
import { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Typography, Checkbox } from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ViewWeek as ColumnsIcon,
  Description as DescIcon,
  ReceiptLong as ReceiptIcon,
  UploadFile as UploadIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  TaskAlt as TaskAltIcon,
  Numbers as NumIcon,
  CreditCard as SubtotalIcon,
  Percent as PctIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { DL } from '../theme';

const ff = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fmt$ = v => '$' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

// ─── Mock data ───────────────────────────────────────────────────────────────
const CUENTAS = [
  'Equipo de Transporte',
  'Equipo y Herramientas de Trabajo',
  'IVA por Pagar',
  'Capital Suscrito y Pagado',
  'Reserva Legal Acumulada',
  'Utilidades de Ejercicios Anteriores',
  'Utilidad o Pérdida del Ejercicio',
  'Gastos de Administración',
  'Gastos de Ventas',
  'Costo de Ventas',
  'Alquiler de Locales',
  'Servicios Profesionales',
];
const CONDICIONES = ['Contado', 'Crédito 30', 'Crédito 60', 'Crédito 90'];
const ESTADOS_OPT = ['Pagado', 'Pendiente', 'Vencido', 'Anulado'];
const AREAS = ['Todos', 'Administración', 'Ventas', 'Logística', 'Finanzas'];

const MOCK_EGRESOS = [
  { id: 1,  fecha: '11/04/2026', socio: 'Pollo Campero',          cuentaDinero: 'Caja General',    cuenta: null,                     condicion: null,        estado: null,      subtotal:    15.00, iva:     1.72, total:    15.00, registro: 'Factura', statusTab: 'pendiente' },
  { id: 2,  fecha: '08/04/2026', socio: 'Soluciones Tech S.A.',   cuentaDinero: 'Caja General',    cuenta: null,                     condicion: null,        estado: null,      subtotal:   450.00, iva:    54.00, total:   504.00, registro: 'Recibo',  statusTab: 'pendiente' },
  { id: 3,  fecha: '05/04/2026', socio: 'VetPharma GT',           cuentaDinero: 'Banco Industrial',cuenta: 'Gastos de Ventas',       condicion: 'Crédito 60',estado: 'Pagado',  subtotal:  6200.00, iva:   744.00, total:  6944.00, registro: 'Factura', statusTab: 'pendiente' },
  { id: 4,  fecha: '02/04/2026', socio: 'Distribuidora Omega',    cuentaDinero: 'Banco Industrial',cuenta: 'Gastos de Administración',condicion: 'Crédito 30',estado: 'Pagado',  subtotal:  2800.00, iva:   336.00, total:  3136.00, registro: 'Factura', statusTab: 'aplicada'  },
  { id: 5,  fecha: '28/03/2026', socio: 'AgroInsumos S.A.',       cuentaDinero: 'Banco Industrial',cuenta: 'Costo de Ventas',        condicion: 'Contado',   estado: 'Pagado',  subtotal: 18400.00, iva:  2208.00, total: 20608.00, registro: 'Factura', statusTab: 'aplicada'  },
  { id: 6,  fecha: '20/03/2026', socio: 'NutriCampo Ltda.',       cuentaDinero: 'Banco BAM',       cuenta: 'Alquiler de Locales',    condicion: 'Contado',   estado: 'Pagado',  subtotal:  1200.00, iva:   144.00, total:  1344.00, registro: 'Recibo',  statusTab: 'aplicada'  },
  { id: 7,  fecha: '15/03/2026', socio: 'Renta Vehículos S.A.',   cuentaDinero: 'Banco Industrial',cuenta: 'Equipo de Transporte',   condicion: 'Contado',   estado: 'Anulado', subtotal:  3500.00, iva:   420.00, total:  3920.00, registro: 'Factura', statusTab: 'excluida'  },
  { id: 8,  fecha: '10/03/2026', socio: 'ConsultoresABC',         cuentaDinero: 'Caja General',    cuenta: 'Servicios Profesionales',condicion: 'Contado',   estado: 'Anulado', subtotal:  5000.00, iva:   600.00, total:  5600.00, registro: 'Factura', statusTab: 'excluida'  },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function EgresoKpi({ label, value, aplicadas, icon: Icon, color }) {
  return (
    <Box sx={{
      flex: 1, background: '#fff', borderRadius: '10px',
      border: `1px solid ${DL.border}`, p: '14px 16px 12px',
      display: 'flex', flexDirection: 'column', gap: '4px',
      boxShadow: DL.e1,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '2px' }}>
        <Box sx={{ color: color || DL.blue, display: 'flex' }}>
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: color || DL.blue }}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: ff, fontSize: 22, fontWeight: 500, color: DL.tH, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontFamily: ff, fontSize: 10, color: DL.tS }}>
        Aplicadas: {aplicadas}
      </Typography>
    </Box>
  );
}

// ─── Cuenta autocomplete dropdown ────────────────────────────────────────────
function CuentaCell({ value, onChange }) {
  const [open, setOpen]   = useState(false);
  const [q, setQ]         = useState('');
  const ref               = useRef(null);

  const filtered = CUENTAS.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  if (value) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tH }}>{value}</Typography>
        <Box component="button" onClick={() => onChange(null)} sx={{
          background: 'none', border: 'none', cursor: 'pointer', color: DL.tS,
          display: 'flex', p: '1px', lineHeight: 0,
          '&:hover': { color: DL.red },
        }}>
          <CloseIcon sx={{ fontSize: 11 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Box component="button" onClick={() => setOpen(o => !o)} sx={{
        fontFamily: ff, fontSize: 11, color: DL.tS, background: 'none',
        border: `1px solid ${DL.border2}`, borderRadius: '5px',
        px: '8px', py: '4px', cursor: 'pointer', whiteSpace: 'nowrap',
        '&:hover': { borderColor: DL.blue, color: DL.blue },
      }}>
        Sin cuenta contable
      </Box>

      {open && (
        <Box sx={{
          position: 'absolute', top: '100%', left: 0, zIndex: 999,
          background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '8px',
          boxShadow: DL.e2, mt: '4px', width: 220,
          overflow: 'hidden',
        }}>
          {/* Search */}
          <Box sx={{ p: '8px', borderBottom: `1px solid ${DL.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', background: DL.subtle, borderRadius: '6px', px: '8px', py: '5px' }}>
              <SearchIcon sx={{ fontSize: 13, color: DL.tS }} />
              <Box component="input" autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Buscar cuenta contable"
                sx={{ fontFamily: ff, fontSize: 11, border: 'none', background: 'transparent', outline: 'none', flex: 1, color: DL.tH }} />
            </Box>
          </Box>

          {/* Create option */}
          <Box component="button" onClick={() => { setOpen(false); }}
            sx={{ display: 'flex', alignItems: 'center', gap: '6px', px: '12px', py: '9px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${DL.border}`, '&:hover': { background: DL.subtle } }}>
            <AddIcon sx={{ fontSize: 14, color: DL.blue }} />
            <Typography sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.blue }}>Crear cuenta contable</Typography>
          </Box>

          {/* Options */}
          <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>
            {filtered.map(c => (
              <Box key={c} component="button" onClick={() => { onChange(c); setOpen(false); setQ(''); }}
                sx={{ display: 'block', width: '100%', textAlign: 'left', px: '12px', py: '8px', background: 'none', border: 'none', cursor: 'pointer', '&:hover': { background: DL.subtle } }}>
                <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tH }}>{c}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 9, color: DL.tS }}>Sin cuenta superior</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Assign button (condición / estado) ──────────────────────────────────────
function AssignCell({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const ESTADO_COLORS = { Pagado: DL.green, Pendiente: DL.yellow, Vencido: DL.red, Anulado: DL.tS };

  if (value) {
    const color = ESTADO_COLORS[value] || DL.tH;
    return (
      <Box ref={ref} sx={{ position: 'relative' }}>
        <Box component="button" onClick={() => setOpen(o => !o)} sx={{
          fontFamily: ff, fontSize: 10, fontWeight: 500, color,
          background: `${color}18`, border: `1px solid ${color}40`,
          borderRadius: '4px', px: '8px', py: '3px', cursor: 'pointer',
        }}>
          {value}
        </Box>
        {open && (
          <Box sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', boxShadow: DL.e2, mt: '4px', overflow: 'hidden', minWidth: 120 }}>
            {options.map(o => (
              <Box key={o} component="button" onClick={() => { onChange(o); setOpen(false); }}
                sx={{ display: 'block', width: '100%', textAlign: 'left', px: '12px', py: '7px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 11, color: DL.tH, '&:hover': { background: DL.subtle } }}>
                {o}
              </Box>
            ))}
            <Box component="button" onClick={() => { onChange(null); setOpen(false); }}
              sx={{ display: 'block', width: '100%', textAlign: 'left', px: '12px', py: '7px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 10, color: DL.red, borderTop: `1px solid ${DL.border}`, '&:hover': { background: '#fff5f5' } }}>
              Quitar
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box ref={ref} sx={{ position: 'relative' }}>
      <Box component="button" onClick={() => setOpen(o => !o)} sx={{
        fontFamily: ff, fontSize: 10, fontWeight: 500, color: DL.tM,
        background: 'none', border: `1px solid ${DL.border2}`,
        borderRadius: '6px', px: '8px', py: '4px', cursor: 'pointer', whiteSpace: 'nowrap',
        '&:hover': { borderColor: DL.blue, color: DL.blue },
      }}>
        {placeholder}
      </Box>
      {open && (
        <Box sx={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', boxShadow: DL.e2, mt: '4px', overflow: 'hidden', minWidth: 130 }}>
          {options.map(o => (
            <Box key={o} component="button" onClick={() => { onChange(o); setOpen(false); }}
              sx={{ display: 'block', width: '100%', textAlign: 'left', px: '12px', py: '7px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: ff, fontSize: 11, color: DL.tH, '&:hover': { background: DL.subtle } }}>
              {o}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Nuevo Egreso Modal ───────────────────────────────────────────────────────
function NuevoEgresoModal({ onClose }) {
  const opts = [
    { icon: <DescIcon sx={{ fontSize: 22, color: DL.blue }} />, title: 'Registrar detalle', desc: 'Usa el flujo actual para crear un egreso manual con productos internos.' },
    { icon: <ReceiptIcon sx={{ fontSize: 22, color: DL.blue }} />, title: 'Registrar factura simple', desc: 'Crea un egreso con una sola línea contable, sin producto ni inventario.' },
    { icon: <UploadIcon sx={{ fontSize: 22, color: DL.blue }} />, title: 'Cargar factura desde JSON', desc: 'Sube uno o varios archivos JSON para crear nuevos registros de factura.' },
  ];
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)' }}
      onClick={onClose}>
      <Box sx={{ background: '#fff', borderRadius: '14px', p: '28px', width: 480, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
        onClick={e => e.stopPropagation()}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '20px' }}>
          <Box>
            <Typography sx={{ fontFamily: ff, fontSize: 16, fontWeight: 500, color: DL.tH }}>Nuevo egreso</Typography>
            <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tS, mt: '2px' }}>Elige como quieres registrar el nuevo egreso.</Typography>
          </Box>
          <Box component="button" onClick={onClose} sx={{ background: 'none', border: 'none', cursor: 'pointer', color: DL.tS, display: 'flex', '&:hover': { color: DL.tH } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {opts.map(opt => (
            <Box key={opt.title} component="button" onClick={onClose} sx={{
              display: 'flex', alignItems: 'center', gap: '14px',
              p: '14px 16px', background: '#fff', border: `1px solid ${DL.border2}`,
              borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
              transition: 'all .14s',
              '&:hover': { border: `1px solid ${DL.blue}`, background: 'rgba(84,126,105,.03)' },
            }}>
              <Box sx={{ flexShrink: 0 }}>{opt.icon}</Box>
              <Box>
                <Typography sx={{ fontFamily: ff, fontSize: 12, fontWeight: 500, color: DL.tH }}>{opt.title}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 10, color: DL.tS, mt: '2px', lineHeight: 1.4 }}>{opt.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Egresos() {
  const [tab,       setTab]       = useState('pendiente');
  const [search,    setSearch]    = useState('');
  const [area,      setArea]      = useState('Todos');
  const [modal,     setModal]     = useState(false);
  const [selected,  setSelected]  = useState([]);
  const [egresos,   setEgresos]   = useState(MOCK_EGRESOS);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // update a row field
  const updateRow = (id, field, val) => setEgresos(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));

  const tabData = useMemo(() =>
    egresos.filter(e => {
      if (e.statusTab !== tab) return false;
      if (search && !e.socio.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }), [egresos, tab, search]);

  const totalPend = egresos.filter(e => e.statusTab === 'pendiente');
  const totalAplic = egresos.filter(e => e.statusTab === 'aplicada');

  const kpis = {
    count:    tabData.length,
    subtotal: tabData.reduce((s, e) => s + e.subtotal, 0),
    iva:      tabData.reduce((s, e) => s + e.iva, 0),
    total:    tabData.reduce((s, e) => s + e.total, 0),
    aplicCount: totalAplic.length,
    aplicSub: totalAplic.reduce((s, e) => s + e.subtotal, 0),
  };

  const pageData = tabData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(tabData.length / PAGE_SIZE);

  const toggleSel = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const allSel = pageData.length > 0 && pageData.every(r => selected.includes(r.id));

  const TAB_LABELS = { pendiente: 'Pendiente', aplicada: 'Aplicada', excluida: 'Excluida' };
  const TABS = ['pendiente', 'aplicada', 'excluida'];

  const COL = { fecha: 110, socio: 170, cuentaDinero: 130, cuenta: 180, condicion: 140, estado: 130, subtotal: 80, iva: 65, total: 85, registro: 120, acciones: 100 };
  const gridCols = `24px ${COL.fecha}px ${COL.socio}px ${COL.cuentaDinero}px ${COL.cuenta}px ${COL.condicion}px ${COL.estado}px ${COL.subtotal}px ${COL.iva}px ${COL.total}px ${COL.registro}px ${COL.acciones}px 32px`;

  return (
    <Box sx={{ p: '0 0 28px', fontFamily: ff }}>
      {/* Header */}
      <PageHeader title="Listado de Egresos" showShare={false} live={false}>
        <Box component="button" sx={{ display: 'flex', alignItems: 'center', background: 'none', border: `1px solid ${DL.border2}`, borderRadius: '7px', p: '6px 10px', cursor: 'pointer', color: DL.tM, '&:hover': { color: DL.blue, borderColor: DL.blue } }}>
          <DownloadIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box component="button" onClick={() => setModal(true)} sx={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: ff, fontSize: 12, fontWeight: 500, color: '#1a1a1a',
          background: '#fff', border: '1px solid #1a1a1a', borderRadius: '8px',
          px: '14px', py: '8px', cursor: 'pointer',
          '&:hover': { background: '#f6f6f6' },
        }}>
          <AddIcon sx={{ fontSize: 14 }} />
          Registrar
        </Box>
      </PageHeader>

      <Box sx={{ px: '20px', pt: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* KPI cards */}
        <Box sx={{ display: 'flex', gap: '12px' }}>
          <EgresoKpi label="Nº Egresos"  value={kpis.count}           aplicadas={`Aplicadas: ${kpis.aplicCount}`} icon={NumIcon}      color={DL.blue}  />
          <EgresoKpi label="Subtotal"     value={fmt$(kpis.subtotal)}   aplicadas={`Aplicadas: ${fmt$(kpis.aplicSub)}`} icon={SubtotalIcon} color={DL.blue}  />
          <EgresoKpi label="Total IVA"    value={fmt$(kpis.iva)}        aplicadas={`Aplicadas: ${fmt$(0)}`} icon={PctIcon}      color={DL.blue}  />
          <EgresoKpi label="Total Final"  value={fmt$(kpis.total)}      aplicadas={`Aplicadas: ${fmt$(kpis.aplicSub)}`} icon={MoneyIcon}    color={DL.blue}  />
        </Box>

        {/* Table card */}
        <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1, overflow: 'hidden' }}>

          {/* Tab + toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '16px', pt: '2px', borderBottom: `1px solid ${DL.border}`, flexWrap: 'wrap', gap: '8px' }}>
            {/* Tabs */}
            <Box sx={{ display: 'flex' }}>
              {TABS.map(t => (
                <Box key={t} component="button" onClick={() => { setTab(t); setPage(1); }} sx={{
                  fontFamily: ff, fontSize: 12, fontWeight: tab === t ? 500 : 500,
                  color: tab === t ? DL.blue : DL.tM,
                  background: 'none', border: 'none', cursor: 'pointer',
                  px: '14px', py: '14px',
                  borderBottom: `2px solid ${tab === t ? DL.blue : 'transparent'}`,
                  transition: 'all .14s',
                  '&:hover': { color: DL.blue },
                }}>
                  {TAB_LABELS[t]}
                </Box>
              ))}
            </Box>

            {/* Toolbar right */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Search */}
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ position: 'absolute', top: -7, left: 8, zIndex: 1, fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: DL.tS, background: '#fff', px: '3px' }}>Buscar</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${DL.border2}`, borderRadius: '7px', px: '8px', gap: '5px', height: 32 }}>
                  <SearchIcon sx={{ fontSize: 13, color: DL.tS }} />
                  <Box component="input" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Buscar"
                    sx={{ fontFamily: ff, fontSize: 11, border: 'none', outline: 'none', background: 'transparent', width: 110, color: DL.tH, '::placeholder': { color: DL.tS } }} />
                </Box>
              </Box>

              {/* Area */}
              <Box sx={{ position: 'relative' }}>
                <Typography sx={{ position: 'absolute', top: -7, left: 8, zIndex: 1, fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: DL.tS, background: '#fff', px: '3px' }}>Área</Typography>
                <Box component="select" value={area} onChange={e => setArea(e.target.value)}
                  sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tH, background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px', py: '6px', pl: '10px', pr: '24px', outline: 'none', cursor: 'pointer', appearance: 'none', height: 32 }}>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </Box>
                <Box sx={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
              </Box>

              {/* Columns */}
              <Box component="button" sx={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tM,
                background: '#fff', border: `1px solid ${DL.border2}`, borderRadius: '7px',
                px: '10px', height: 32, cursor: 'pointer',
                '&:hover': { borderColor: DL.blue, color: DL.blue },
              }}>
                <ColumnsIcon sx={{ fontSize: 14 }} />
                Columnas
              </Box>
            </Box>
          </Box>

          {/* Table */}
          <Box sx={{ overflowX: 'auto' }}>
            {/* Header */}
            <Box sx={{
              display: 'grid', gridTemplateColumns: gridCols,
              px: '14px', py: '9px', alignItems: 'center',
              borderBottom: `1px solid ${DL.border}`,
              background: DL.subtle,
            }}>
              <Checkbox size="small" checked={allSel} onChange={() => setSelected(allSel ? [] : pageData.map(r => r.id))} sx={{ p: '2px', '& svg': { fontSize: 15 } }} />
              {['Fecha','Socio de negocio','Cuenta dinero','Cuenta','Condicion de pago','Estado','Subtotal','Iva','Total','Registro','Acciones','G.i'].map(h => (
                <Typography key={h} sx={{ fontFamily: ff, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: DL.blue }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {/* Rows */}
            {pageData.length === 0 ? (
              <Box sx={{ py: '40px', textAlign: 'center' }}>
                <Typography sx={{ fontFamily: ff, fontSize: 12, color: DL.tS }}>Sin registros</Typography>
              </Box>
            ) : pageData.map((row, i) => (
              <Box key={row.id} sx={{
                display: 'grid', gridTemplateColumns: gridCols,
                px: '14px', py: '10px', alignItems: 'center',
                borderBottom: i < pageData.length - 1 ? `1px solid ${DL.border}` : 'none',
                background: selected.includes(row.id) ? 'rgba(84,126,105,.04)' : '#fff',
                '&:hover': { background: 'rgba(84,126,105,.03)' },
              }}>
                <Checkbox size="small" checked={selected.includes(row.id)} onChange={() => toggleSel(row.id)} sx={{ p: '2px', '& svg': { fontSize: 15 } }} />
                <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tM }}>{row.fecha}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tH }}>{row.socio}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tM }}>{row.cuentaDinero}</Typography>
                <CuentaCell value={row.cuenta} onChange={v => updateRow(row.id, 'cuenta', v)} />
                <AssignCell value={row.condicion} options={CONDICIONES} placeholder="Asignar condicion" onChange={v => updateRow(row.id, 'condicion', v)} />
                <AssignCell value={row.estado} options={ESTADOS_OPT} placeholder="Asignar estado" onChange={v => updateRow(row.id, 'estado', v)} />
                <Typography sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tH }}>{fmt$(row.subtotal)}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tM }}>{fmt$(row.iva)}</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.tH }}>{fmt$(row.total)}</Typography>

                {/* Registro */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tM }}>{row.registro}</Typography>
                  <Box sx={{ background: '#fff', border: '1px solid #1a1a1a', color: '#1a1a1a', fontSize: 9, fontWeight: 500, px: '7px', py: '2px', borderRadius: '4px', fontFamily: ff }}>Detalle</Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[
                    { icon: <DownloadIcon sx={{ fontSize: 14 }} />, color: DL.tS },
                    { icon: <EditIcon    sx={{ fontSize: 14 }} />, color: DL.tS },
                    { icon: <DeleteIcon  sx={{ fontSize: 14 }} />, color: DL.red },
                  ].map((a, ai) => (
                    <Box key={ai} component="button" sx={{ background: 'none', border: 'none', cursor: 'pointer', color: a.color, display: 'flex', p: '3px', borderRadius: '4px', '&:hover': { background: DL.subtle } }}>
                      {a.icon}
                    </Box>
                  ))}
                </Box>

                {/* G.i checkmark */}
                <Box component="button" sx={{ background: 'none', border: 'none', cursor: 'pointer', color: DL.green, display: 'flex', p: '3px' }}>
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', px: '16px', py: '10px', borderTop: `1px solid ${DL.border}` }}>
            <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tS }}>Tamaño de página</Typography>
            <Box component="select" sx={{ fontFamily: ff, fontSize: 11, border: `1px solid ${DL.border2}`, borderRadius: '5px', px: '6px', py: '3px', outline: 'none', cursor: 'pointer', color: DL.tH }}>
              <option>10</option><option>25</option><option>50</option>
            </Box>
            <Typography sx={{ fontFamily: ff, fontSize: 11, color: DL.tS }}>
              {tabData.length === 0 ? '0–0 of 0' : `${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, tabData.length)} of ${tabData.length}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: '2px' }}>
              {['◀','▶'].map((ch, pi) => (
                <Box key={pi} component="button"
                  onClick={() => setPage(p => pi === 0 ? Math.max(1, p-1) : Math.min(pageCount, p+1))}
                  disabled={pi === 0 ? page === 1 : page === pageCount}
                  sx={{ background: 'none', border: `1px solid ${DL.border2}`, borderRadius: '5px', px: '8px', py: '4px', cursor: 'pointer', color: DL.tS, fontSize: 10, '&:disabled': { opacity: 0.35 }, '&:hover:not(:disabled)': { borderColor: DL.blue, color: DL.blue } }}>
                  {ch}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {modal && <NuevoEgresoModal onClose={() => setModal(false)} />}
    </Box>
  );
}
