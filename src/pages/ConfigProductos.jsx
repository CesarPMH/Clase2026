// ─── Configuración › Productos ──────────────────────────────────────────────────
// Los productos vienen de SAP: aquí NO se agregan ni se eliminan. Solo se activan
// o desactivan para que aparezcan (o no) al crear un pedido.
// Relación con el resto: getProductos y setProductosActivo (data/configuracion.js) guardan qué
// SKU están desactivados y actualizan el catálogo de "Pedido Nuevo", por eso un producto
// desactivado ya no se puede elegir al crear un pedido.
import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import { getProductos, setProductosActivo } from '../data/configuracion';
import { ConfigShell, F, th, td, BtnOutline, Card, Tabs, TableWrap, Interruptor, Etiqueta, Aviso } from '../components/common/ConfigUI';

// Formatea un número como dinero (ej. $12.50); si el valor falta, muestra $0.00.
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ConfigProductos: lista de productos (catálogo, accesorios y toppers) con filtros y un interruptor
// para activarlos o desactivarlos. No hay botones de agregar o eliminar porque vienen de SAP.
export default function ConfigProductos() {
  // Estados: lista de productos y filtros (pestaña por tipo, estado activo/inactivo, búsqueda y paginación).
  const [lista, setLista] = useState(() => getProductos());
  const [tab, setTab] = useState('');
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // cuenta: cantidad de productos de un tipo, para mostrarla en cada pestaña.
  const cuenta = (t) => lista.filter(p => !t || p.tipo === t).length;
  // rows: productos que cumplen pestaña, estado y búsqueda (por nombre, SKU o categoría).
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return lista.filter(p => (!tab || p.tipo === tab)
      && (!estado || (estado === 'activo' ? p.activo : !p.activo))
      && (!q || p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.categoria || '').toLowerCase().includes(q)));
  }, [lista, tab, estado, search]);
  // Productos de la página actual.
  const pagina = rows.slice((page - 1) * pageSize, page * pageSize);
  const activos = lista.filter(p => p.activo).length;

  // cambiar: activa o desactiva uno o varios SKU. setProductosActivo guarda el cambio y devuelve
  // la lista actualizada, que reemplaza al estado para que la tabla se refresque.
  const cambiar = (skus, activo) => setLista(setProductosActivo(skus, activo));
  // Al cambiar de pestaña se vuelve a la página 1 para no quedar en una página que ya no existe.
  const cambiarVista = (t) => { setTab(t); setPage(1); };

  return (
    <ConfigShell>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      <PageHeader title="Productos" live={false} showShare={false}>
        <MiniSelect label="Estado" value={estado} onChange={(v) => { setEstado(v); setPage(1); }} minWidth={120}
          options={[{ value: '', label: 'Todos' }, { value: 'activo', label: 'Activos' }, { value: 'inactivo', label: 'Inactivos' }]} />
      </PageHeader>

      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 20px' }}>
        <Card>
          {/* Aviso fijo: explica que los productos vienen de SAP y que solo se activan o desactivan. */}
          <Aviso>
            Los productos se sincronizan desde <b>SAP</b>, por eso no se pueden agregar ni eliminar aquí. Puedes <b>activarlos o desactivarlos</b>:
            los productos desactivados no aparecen al crear un pedido nuevo.
          </Aviso>
          <Box sx={{ p: '10px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, mr: 'auto' }}>
              {activos} activos de {lista.length} productos
            </Typography>
            <TextField size="small" placeholder="Buscar producto o SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 220, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
            {/* Acciones masivas: afectan solo a los productos visibles con los filtros actuales. Se deshabilitan si no hay nada que cambiar. */}
            <BtnOutline disabled={!rows.some(p => !p.activo)} onClick={() => cambiar(rows.filter(p => !p.activo).map(p => p.sku), true)}>Activar los {rows.length} visibles</BtnOutline>
            <BtnOutline color={DL.red} disabled={!rows.some(p => p.activo)} onClick={() => cambiar(rows.filter(p => p.activo).map(p => p.sku), false)}>Desactivar los {rows.length} visibles</BtnOutline>
          </Box>
          {/* Pestañas por tipo de producto, con el conteo de cada una. */}
          <Tabs value={tab} onChange={cambiarVista} tabs={[
            { id: '', label: 'Todos', count: cuenta('') },
            { id: 'Catálogo', label: 'Catálogo', count: cuenta('Catálogo') },
            { id: 'Accesorio', label: 'Accesorios', count: cuenta('Accesorio') },
            { id: 'Topper', label: 'Toppers', count: cuenta('Topper') },
          ]} />

          <TableWrap minWidth={820}>
            <thead><tr>{['SKU', 'Producto', 'Tipo', 'Categoría', 'Precio', 'Origen', 'Activo'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {pagina.map(p => (
                <tr key={p.sku} style={{ opacity: p.activo ? 1 : 0.55 }}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{p.sku}</td>
                  <td style={{ ...td, color: DL.tH, fontWeight: 500 }}>{p.nombre}</td>
                  <td style={td}>{p.tipo}</td>
                  <td style={td}>{p.categoria}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{money(p.precio)}</td>
                  <td style={td}><Etiqueta>SAP</Etiqueta></td>
                  <td style={td}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Interruptor activo/inactivo; las filas inactivas se ven atenuadas. */}
                      <Interruptor activo={p.activo} onChange={(v) => cambiar(p.sku, v)} />
                      <Typography sx={{ fontSize: 11, color: p.activo ? DL.green : DL.tS, fontFamily: F, minWidth: 52 }}>{p.activo ? 'Activo' : 'Inactivo'}</Typography>
                    </Box>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: DL.tS, padding: '36px' }}>No hay productos con estos filtros.</td></tr>}
            </tbody>
          </TableWrap>
          <Pagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} pageSizeOptions={[10, 25, 50]} />
        </Card>
      </Box>
    </Box>
    </ConfigShell>
  );
}
