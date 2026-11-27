// ─── Configuración › Clientes ───────────────────────────────────────────────────
// Administración de clientes: se pueden agregar, editar y eliminar.
// Relación con el resto: lee y guarda con data/configuracion.js (getClientes / saveClientes),
// que además actualiza el catálogo de clientes que usa "Pedido Nuevo". Los componentes visuales
// (tabla, diálogo, campos) vienen de components/common/ConfigUI.jsx.
import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon, PersonAddAlt1 as PersonAddIcon, EditOutlined as EditIcon, DeleteOutlined as TrashIcon, AddLocationAlt as AddLocIcon } from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import Pagination from '../components/common/Pagination';
import { getClientes, saveClientes, nuevoIdCliente } from '../data/configuracion';
import { BotonIcono, IconoMas, MenuAcciones, Seccion, Segmentado, ConfigShell, F, th, td, BtnOutline, Card, TableWrap, Etiqueta, Campo, inputSx, Dialogo, Confirmar } from '../components/common/ConfigUI';

// Formulario en blanco para un cliente nuevo (por defecto, persona Natural y sin direcciones).
const VACIO = { tipo: 'Natural', nombre: '', documento: '', telefono: '', email: '', direcciones: [] };
// Opciones del selector de departamento al capturar una dirección de entrega.
const DEPARTAMENTOS = ['San Salvador', 'La Libertad', 'Santa Ana', 'San Miguel', 'Sonsonate', 'Usulután', 'Ahuachapán', 'Cuscatlán', 'La Paz'];

// ConfigClientes: pantalla para administrar clientes (listar, buscar, agregar, editar, eliminar).
// No recibe props. Devuelve la tabla paginada con sus diálogos de edición y de confirmación.
export default function ConfigClientes() {
  // Estado principal: la lista completa de clientes, tomada del almacén local al abrir la pantalla.
  const [lista, setLista] = useState(() => getClientes());
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form, setForm] = useState(null);         // cliente en edición (null = cerrado)
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [borrar, setBorrar] = useState(null);

  // rows: clientes que pasan los filtros de tipo y de búsqueda (por nombre, DUI/NIT, correo o
  // teléfono). useMemo evita recalcular el filtro si no cambió ninguno de sus datos.
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return lista.filter(c => (!tipo || c.tipo === tipo)
      && (!q || c.nombre.toLowerCase().includes(q) || (c.dui || c.nit || '').includes(q) || (c.email || '').toLowerCase().includes(q) || (c.telefono || '').includes(q)));
  }, [lista, search, tipo]);
  // Solo los clientes de la página actual, para no pintar toda la tabla de una vez.
  const pagina = rows.slice((page - 1) * pageSize, page * pageSize);

  // abrirNuevo: abre el diálogo con el formulario vacío (editId en null indica que es un alta).
  const abrirNuevo = () => { setEditId(null); setForm({ ...VACIO, direcciones: [] }); setErrores({}); };
  // abrirEditar: carga los datos del cliente en el formulario. Un jurídico usa NIT y un natural DUI,
  // por eso ambos se muestran en el mismo campo "documento". Se copian las direcciones para no
  // modificar la lista original hasta que se guarde.
  const abrirEditar = (c) => {
    setEditId(c.id); setErrores({});
    setForm({ tipo: c.tipo, nombre: c.nombre, documento: c.tipo === 'Jurídico' ? (c.nit || '') : (c.dui || ''), telefono: c.telefono || '', email: c.email || '', direcciones: (c.direcciones || []).map(d => ({ ...d })) });
  };
  // Helpers para actualizar el formulario: set cambia campos del cliente y setDir cambia la dirección número i.
  const set = (patch) => setForm(f => ({ ...f, ...patch }));
  const setDir = (i, patch) => setForm(f => ({ ...f, direcciones: f.direcciones.map((d, k) => (k === i ? { ...d, ...patch } : d)) }));

  // guardar: valida el formulario y, si todo está bien, guarda el cliente.
  // Reglas: nombre y teléfono obligatorios; el correo es opcional pero debe tener formato válido;
  // el DUI/NIT no se puede repetir en otro cliente. Si hay errores se muestran y no se guarda.
  const guardar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Correo no válido.';
    const doc = form.documento.trim();
    if (doc && lista.some(c => c.id !== editId && (c.dui === doc || c.nit === doc))) e.documento = 'Ya existe un cliente con este documento.';
    setErrores(e);
    if (Object.keys(e).length) return;
    // Objeto final del cliente: se ignoran las direcciones vacías y se renumeran. El documento
    // se guarda como "nit" o "dui" según el tipo.
    const base = {
      id: editId ?? nuevoIdCliente(lista), nombre: form.nombre.trim(), tipo: form.tipo, telefono: form.telefono.trim(), email: form.email.trim(),
      direcciones: form.direcciones.filter(d => d.direccion.trim()).map((d, i) => ({ ...d, id: i + 1, direccion: d.direccion.trim() })),
    };
    if (doc) base[form.tipo === 'Jurídico' ? 'nit' : 'dui'] = doc;
    // Alta: el cliente nuevo va al principio de la lista. Edición: se reemplaza el que tiene el mismo id.
    const nueva = editId == null ? [base, ...lista] : lista.map(c => (c.id === editId ? base : c));
    setLista(saveClientes(nueva)); setForm(null);
  };

  // eliminar: quita al cliente y guarda. Los pedidos ya registrados guardan su propia copia del
  // nombre y teléfono, por eso no cambian.
  const eliminar = () => { setLista(saveClientes(lista.filter(c => c.id !== borrar.id))); setBorrar(null); };

  return (
    <ConfigShell>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      {/* Encabezado de la página con el filtro por tipo de cliente. */}
      <PageHeader title="Clientes" live={false} showShare={false}>
        <MiniSelect label="Tipo" value={tipo} onChange={(v) => { setTipo(v); setPage(1); }} minWidth={120}
          options={[{ value: '', label: 'Todos' }, { value: 'Natural', label: 'Natural' }, { value: 'Jurídico', label: 'Jurídico' }]} />
      </PageHeader>

      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 20px' }}>
        <Card>
          <Box sx={{ p: '10px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, mr: 'auto' }}>Total de clientes: {rows.length}</Typography>
            <TextField size="small" placeholder="Buscar cliente..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
            <BotonIcono filled titulo="Agregar cliente" icono={IconoMas} onClick={abrirNuevo} />
          </Box>

          {/* Tabla de clientes (se muestra solo la página actual). */}
          <TableWrap minWidth={880}>
            <thead>
              <tr>{['Cliente', 'Tipo', 'DUI / NIT', 'Teléfono', 'Correo', 'Direcciones', 'Acciones'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {pagina.map(c => (
                <tr key={c.id}>
                  <td style={{ ...td, color: DL.tH, fontWeight: 500 }}>{c.nombre}</td>
                  <td style={td}><Etiqueta color={c.tipo === 'Jurídico' ? DL.navy : DL.tM}>{c.tipo}</Etiqueta></td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{c.dui || c.nit || '—'}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{c.telefono || '—'}</td>
                  <td style={td}>{c.email || '—'}</td>
                  <td style={td}>{(c.direcciones || []).length}</td>
                  <td style={td}>
                    <MenuAcciones opciones={[
                      { label: 'Editar', onClick: () => abrirEditar(c) },
                      { label: 'Eliminar cliente', color: DL.red, separadorAntes: true, onClick: () => setBorrar(c) },
                    ]} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: DL.tS, padding: '36px' }}>No hay clientes con estos filtros.</td></tr>}
            </tbody>
          </TableWrap>
          {/* Paginación: al cambiar el tamaño de página se vuelve a la primera. */}
          <Pagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        </Card>
      </Box>

      {/* Agregar / editar */}
      <Dialogo abierto={!!form} onCerrar={() => setForm(null)} ancho="md"
        icono={editId == null ? <PersonAddIcon sx={{ fontSize: 22 }} /> : <EditIcon sx={{ fontSize: 22 }} />}
        titulo={editId == null ? 'Nuevo cliente' : 'Editar cliente'}
        subtitulo="Los clientes guardados aparecen al crear un pedido nuevo."
        acciones={<><BtnOutline color={DL.tM} onClick={() => setForm(null)}>Cancelar</BtnOutline><BtnOutline filled onClick={guardar}>{editId == null ? 'Guardar cliente' : 'Guardar cambios'}</BtnOutline></>}>
        {form && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* Primera sección del formulario. La etiqueta de nombre y documento cambia según sea Natural o Jurídico. */}
            <Seccion titulo="Datos del cliente">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Campo label="Tipo de cliente">
                  <Segmentado opciones={['Natural', 'Jurídico']} valor={form.tipo} onChange={(v) => set({ tipo: v })} />
                </Campo>
                <Box sx={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Campo label={form.tipo === 'Jurídico' ? 'Razón social' : 'Nombre completo'} requerido error={errores.nombre} flex="2 1 260px">
                    <Box component="input" value={form.nombre} onChange={e => set({ nombre: e.target.value })} sx={inputSx(errores.nombre)} />
                  </Campo>
                  <Campo label={form.tipo === 'Jurídico' ? 'NIT' : 'DUI'} error={errores.documento} flex="1 1 170px">
                    <Box component="input" value={form.documento} onChange={e => set({ documento: e.target.value })} placeholder={form.tipo === 'Jurídico' ? '0614-000000-000-0' : '000000000'} sx={inputSx(errores.documento)} />
                  </Campo>
                </Box>
              </Box>
            </Seccion>

            <Seccion titulo="Contacto">
              <Box sx={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Campo label="Teléfono" requerido error={errores.telefono} flex="1 1 200px">
                  <Box component="input" value={form.telefono} onChange={e => set({ telefono: e.target.value })} placeholder="+503 7000 0000" sx={inputSx(errores.telefono)} />
                </Campo>
                <Campo label="Correo electrónico" error={errores.email} flex="1 1 240px">
                  <Box component="input" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="cliente@correo.com" sx={inputSx(errores.email)} />
                </Campo>
              </Box>
            </Seccion>

            {/* Direcciones de entrega: se pueden agregar varias y luego elegirlas al crear un pedido a domicilio. */}
            <Seccion titulo="Direcciones de entrega"
              extra={<BotonIcono titulo="Agregar dirección" icono={IconoMas} onClick={() => set({ direcciones: [...form.direcciones, { direccion: '', departamento: 'San Salvador', municipio: '', comentario: '' }] })} />}>
              {form.direcciones.length === 0 ? (
                <Box sx={{ border: `1px dashed ${DL.border2}`, borderRadius: '10px', p: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: DL.tS }}>
                  <AddLocIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontSize: 12, fontFamily: F, color: DL.tS }}>Aún no hay direcciones. Agrégalas para elegirlas al entregar a domicilio.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.direcciones.map((d, i) => (
                    <Box key={i} sx={{ border: `1px solid ${DL.border}`, borderRadius: '12px', p: '14px', background: '#fcfcfb', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: DL.tM, fontFamily: F }}>Dirección {i + 1}</Typography>
                        <Box onClick={() => set({ direcciones: form.direcciones.filter((_, k) => k !== i) })} sx={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: DL.red, '&:hover': { opacity: .7 } }}>
                          <TrashIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: 11, fontFamily: F, color: DL.red }}>Quitar</Typography>
                        </Box>
                      </Box>
                      <Box component="input" value={d.direccion} onChange={e => setDir(i, { direccion: e.target.value })} placeholder="Calle, colonia, número" sx={inputSx()} />
                      <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Box component="select" value={d.departamento} onChange={e => setDir(i, { departamento: e.target.value })} sx={{ ...inputSx(), flex: '1 1 150px', width: 'auto' }}>
                          {DEPARTAMENTOS.map(x => <option key={x}>{x}</option>)}
                        </Box>
                        <Box component="input" value={d.municipio} onChange={e => setDir(i, { municipio: e.target.value })} placeholder="Municipio" sx={{ ...inputSx(), flex: '1 1 150px', width: 'auto' }} />
                      </Box>
                      <Box component="input" value={d.comentario || ''} onChange={e => setDir(i, { comentario: e.target.value })} placeholder="Referencia (opcional): portón azul, timbre derecho…" sx={inputSx()} />
                    </Box>
                  ))}
                </Box>
              )}
            </Seccion>
          </Box>
        )}
      </Dialogo>

      {/* Confirmación antes de eliminar, para evitar borrados por accidente. */}
      <Confirmar abierto={!!borrar} onCerrar={() => setBorrar(null)} onConfirmar={eliminar}
        titulo="Eliminar cliente" texto={borrar ? `Se eliminará a ${borrar.nombre}. Los pedidos que ya registró no se modifican.` : ''} />
    </Box>
    </ConfigShell>
  );
}
