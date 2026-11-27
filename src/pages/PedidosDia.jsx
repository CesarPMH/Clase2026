// ─── Pedidos del día ────────────────────────────────────────────────────────────
// Qué hace: muestra la lista de pedidos CONFIRMADOS que se entregan en una fecha
// concreta (la que viene en la URL, '/pedidos/dia/AAAA-MM-DD'), con filtros,
// contadores de cliente Natural/Jurídico y la tabla de pedidos.
// De dónde salen los datos: PEDIDOS_INICIALES (pedidosMock) + los pedidos nuevos
// guardados en localStorage ('pedidos_nuevos'), con los cambios aprobados aplicados.
// Quién lo usa: App.jsx (ruta '/pedidos/dia/:fecha'); se llega desde la vista
// calendario de Pedidos.jsx al elegir un día.
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, InputAdornment,
  IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon, Download as DownloadIcon,
} from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { PEDIDOS_INICIALES } from '../data/pedidosMock';
import { aplicarOverrides } from '../data/solicitudesCambio';
import TablaPedidos, { ColsButton, DEFAULT_COLS_VISIBLES } from '../components/common/TablaPedidos';

const F = "'Inter', ui-sans-serif, system-ui, sans-serif";

// Nombres de días y meses en español para armar el título (ej. "Miércoles 10 de Junio")
const DIAS_LARGO  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Rango de años que se puede elegir: dos hacia atrás y dos hacia adelante del actual
const ANIO_BASE    = new Date().getFullYear();
const ANIO_OPTIONS = [-2,-1,0,1,2].map(d => ANIO_BASE + d);

// Cantidad de días de un mes (month va de 1 a 12). Con día 0 del mes siguiente,
// JavaScript devuelve el último día del mes actual, incluyendo años bisiestos.
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate(); // month is 1-based
}

// OBJETIVO: pantalla de detalle de un día del calendario de pedidos.
// No recibe props; toma la fecha de la URL (useParams). Devuelve el encabezado con
// filtros y la tabla; al editar un pedido navega al formulario de pedido.
export default function PedidosDia() {
  const { fecha } = useParams(); // '2026-06-10'
  const navigate  = useNavigate();

  // Estado de los filtros; '' significa "Todos"
  const [colsVisibles, setColsVisibles] = useState(DEFAULT_COLS_VISIBLES);
  const [search,     setSearch]     = useState('');
  const [vendedor,   setVendedor]   = useState('');
  const [estado,     setEstado]     = useState('');
  const [tipo,       setTipo]       = useState('');
  const [tipoPedido, setTipoPedido] = useState('');
  const [tipoOrden,  setTipoOrden]  = useState('');

  // Parse date
  // Se usa el mediodía para que la zona horaria no mueva la fecha al día anterior/siguiente
  const d     = new Date(fecha + 'T12:00:00');
  const dia   = d.getDate();
  const mes   = d.getMonth() + 1; // 1-based
  const anio  = d.getFullYear();
  const titulo = `${DIAS_LARGO[d.getDay()]} ${dia} de ${MESES_LARGO[d.getMonth()]}`;

  const numDias = daysInMonth(mes, anio);

  // Navega a otro día ajustando el número si no existe en ese mes (ej. 31 -> 30)
  const goToDate = (newDia, newMes, newAnio) => {
    const clamped = Math.min(newDia, daysInMonth(newMes, newAnio));
    const pad = n => String(n).padStart(2, '0');
    navigate(`/pedidos/dia/${newAnio}-${pad(newMes)}-${pad(clamped)}`);
  };

  // Pedidos base: los de ejemplo + los creados por el usuario, ya con los cambios
  // aprobados aplicados (aplicarOverrides) para ver siempre la versión vigente.
  const todosBase = useMemo(() => {
    const guardados = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]');
    return aplicarOverrides([...PEDIDOS_INICIALES, ...guardados]);
  }, []);
  // Solo pedidos de este día y con pago registrado: los de estadoPago 'Pendiente' son
  // cotizaciones (no se producen sin pago) y se excluyen de esta vista de producción.
  const todos    = todosBase.filter(p => p.entrega.startsWith(fecha) && p.estadoPago !== 'Pendiente');
  const natural  = todos.filter(p => p.tipoCliente === 'Natural').length;
  const juridico = todos.filter(p => p.tipoCliente === 'Jurídico').length;
  // Opciones de los filtros Vendedor y Estado pago, sacadas de los pedidos del día
  const vendedores = [...new Set(todos.map(p => p.vendedor))];
  const estados    = [...new Set(todos.map(p => p.estadoPago))];

  // Indica si el pedido contiene al menos una orden del tipo elegido en el filtro.
  // Sin filtro (to vacío) todos pasan. El filtro "Personalizado" corresponde a las
  // líneas de tipo 'Pastel Personalizado'.
  function pedidoTieneOrden(p, to) {
    if (!to) return true;
    const tipos = (p.lineas || []).map(l => l.tipo);
    if (to === 'Catálogo')      return tipos.includes('Catálogo');
    if (to === 'Accesorios')    return tipos.includes('Accesorios');
    if (to === 'Personalizado') return tipos.includes('Pastel Personalizado');
    return true;
  }

  // Filas finales de la tabla: aplica búsqueda (cliente o id) y todos los filtros a la vez
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return todos.filter(p =>
      (!q || p.cliente.nombre.toLowerCase().includes(q) || p.id.includes(q))
      && (!vendedor   || p.vendedor === vendedor)
      && (!estado     || p.estadoPago === estado)
      && (!tipo       || p.tipoCliente === tipo)
      && (!tipoPedido || p.tipoPedido === tipoPedido)
      && pedidoTieneOrden(p, tipoOrden)
    );
  }, [todos, search, vendedor, estado, tipo, tipoPedido, tipoOrden]);

  return (
    <Box>
      <PageHeader
        title={titulo}
        onBack={() => navigate('/pedidos?vista=calendario')}
        showShare={false}
      >
        {/* Selector de fecha: permite saltar a otro día sin volver al calendario */}
        <Box component="input" type="date" value={fecha}
          onChange={e => { if (e.target.value) navigate(`/pedidos/dia/${e.target.value}`); }}
          sx={{
            fontFamily:F, fontSize:11, fontWeight: 500, color:DL.navy,
            background:'#fff', border:`1px solid ${DL.border2}`,
            borderRadius:'7px', px:'10px', py:'7px',
            outline:'none', cursor:'pointer', appearance:'none',
            transition:'border-color .15s',
            '&:hover':{ borderColor:DL.blue },
            '&:focus':{ borderColor:DL.blue },
          }} />
        <MiniSelect label="Tipo pedido" value={tipoPedido} onChange={setTipoPedido} minWidth={110} options={[
          { value:'', label:'Todos' },
          { value:'Reserva', label:'Reserva' },
          { value:'Producción', label:'Producción' },
        ]} />
        <MiniSelect label="Tipo orden" value={tipoOrden} onChange={setTipoOrden} minWidth={120} options={[
          { value:'', label:'Todos' },
          { value:'Catálogo', label:'Catálogo' },
          { value:'Accesorios', label:'Accesorios' },
          { value:'Personalizado', label:'Personalizado' },
        ]} />
        <MiniSelect label="Estado pago" value={estado} onChange={setEstado} minWidth={120} options={[
          { value:'', label:'Todos' },
          ...estados.map(v => ({ value:v, label:v })),
        ]} />
        <MiniSelect label="Vendedor" value={vendedor} onChange={setVendedor} minWidth={110} options={[
          { value:'', label:'Todos' },
          ...vendedores.map(v => ({ value:v, label:v })),
        ]} />
        <MiniSelect label="Cliente" value={tipo} onChange={setTipo} minWidth={100} options={[
          { value:'', label:'Todos' },
          { value:'Natural', label:'Natural' },
          { value:'Jurídico', label:'Jurídico' },
        ]} />
      </PageHeader>

      {/* ── Contenido ──────────────────────────────────────────── */}
      <Box sx={{ p:{ xs:'12px', md:'20px 24px' } }}>
        <Box sx={{ background:'#fff',borderRadius:'12px',border:`1px solid ${DL.border}`,boxShadow:DL.e2,overflow:'hidden' }}>

          {/* Card header: stats + Descargar + Buscador */}
          <Box sx={{ px:'20px',py:'12px',borderBottom:`1px solid ${DL.border}`,display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap' }}>
            {/* Stats */}
            <Typography sx={{ fontSize:13,fontWeight: 500,color:DL.tH,fontFamily:F,whiteSpace:'nowrap' }}>
              Pedidos totales: {todos.length}
            </Typography>
            <Box sx={{ px:'10px',py:'3px',borderRadius:'5px',background:'rgba(3,105,161,.12)',flexShrink:0 }}>
              <Typography sx={{ fontSize:9,fontWeight: 500,color:'#515151',fontFamily:F }}>Natural: {natural}</Typography>
            </Box>
            <Box sx={{ px:'10px',py:'3px',borderRadius:'5px',background:'rgba(13,148,136,.12)',flexShrink:0 }}>
              <Typography sx={{ fontSize:9,fontWeight: 500,color:'#0d9488',fontFamily:F }}>Jurídico: {juridico}</Typography>
            </Box>

            <Box sx={{ flex:1 }} />

            {/* Descargar */}
            <Tooltip title="Descargar Excel" arrow>
              <IconButton size="small" sx={{
                border:`1px solid ${DL.border2}`,borderRadius:'8px',p:'7px',
                color:DL.tM,background:'#fff','&:hover':{background:DL.bg,color:DL.navy},
              }}>
                <DownloadIcon sx={{ fontSize:16 }}/>
              </IconButton>
            </Tooltip>

            {/* Buscador */}
            <TextField size="small" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              slotProps={{input:{startAdornment:<InputAdornment position="start"><SearchIcon sx={{fontSize:14,color:DL.tS}}/></InputAdornment>}}}
              sx={{ width:180,'& .MuiOutlinedInput-root':{fontSize:11,borderRadius:'8px',fontFamily:F,background:'#fff'} }} />
            <ColsButton colsVisibles={colsVisibles} onChange={setColsVisibles} />
          </Box>

          {/* Tabla */}
          <Box sx={{ p:'12px' }}>
            <Box sx={{ border:`1px solid ${DL.border}`,borderRadius:'8px',overflow:'hidden' }}>
              {/* Editar lleva al formulario de pedido en modo edición (?id=...) */}
              <TablaPedidos pedidos={rows} onEdit={p => navigate(`/pedidos/nuevo?id=${encodeURIComponent(p.id)}`)} showPagination colsVisibles={colsVisibles} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
