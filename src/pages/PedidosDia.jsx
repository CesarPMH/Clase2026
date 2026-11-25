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

const DIAS_LARGO  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MESES_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const ANIO_BASE    = new Date().getFullYear();
const ANIO_OPTIONS = [-2,-1,0,1,2].map(d => ANIO_BASE + d);

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate(); // month is 1-based
}

export default function PedidosDia() {
  const { fecha } = useParams(); // '2026-06-10'
  const navigate  = useNavigate();

  const [colsVisibles, setColsVisibles] = useState(DEFAULT_COLS_VISIBLES);
  const [search,     setSearch]     = useState('');
  const [vendedor,   setVendedor]   = useState('');
  const [estado,     setEstado]     = useState('');
  const [tipo,       setTipo]       = useState('');
  const [tipoPedido, setTipoPedido] = useState('');
  const [tipoOrden,  setTipoOrden]  = useState('');

  // Parse date
  const d     = new Date(fecha + 'T12:00:00');
  const dia   = d.getDate();
  const mes   = d.getMonth() + 1; // 1-based
  const anio  = d.getFullYear();
  const titulo = `${DIAS_LARGO[d.getDay()]} ${dia} de ${MESES_LARGO[d.getMonth()]}`;

  const numDias = daysInMonth(mes, anio);

  const goToDate = (newDia, newMes, newAnio) => {
    const clamped = Math.min(newDia, daysInMonth(newMes, newAnio));
    const pad = n => String(n).padStart(2, '0');
    navigate(`/pedidos/dia/${newAnio}-${pad(newMes)}-${pad(clamped)}`);
  };

  const todosBase = useMemo(() => {
    const guardados = JSON.parse(localStorage.getItem('pedidos_nuevos') || '[]');
    return aplicarOverrides([...PEDIDOS_INICIALES, ...guardados]);
  }, []);
  const todos    = todosBase.filter(p => p.entrega.startsWith(fecha) && p.estadoPago !== 'Pendiente');
  const natural  = todos.filter(p => p.tipoCliente === 'Natural').length;
  const juridico = todos.filter(p => p.tipoCliente === 'Jurídico').length;
  const vendedores = [...new Set(todos.map(p => p.vendedor))];
  const estados    = [...new Set(todos.map(p => p.estadoPago))];

  function pedidoTieneOrden(p, to) {
    if (!to) return true;
    const tipos = (p.lineas || []).map(l => l.tipo);
    if (to === 'Catálogo')      return tipos.includes('Catálogo');
    if (to === 'Accesorios')    return tipos.includes('Accesorios');
    if (to === 'Personalizado') return tipos.includes('Pastel Personalizado');
    return true;
  }

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
        {/* Selector de fecha */}
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
              <TablaPedidos pedidos={rows} onEdit={p => navigate(`/pedidos/nuevo?id=${encodeURIComponent(p.id)}`)} showPagination colsVisibles={colsVisibles} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
