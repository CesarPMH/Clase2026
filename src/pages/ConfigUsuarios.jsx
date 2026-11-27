// ─── Configuración › Usuarios ───────────────────────────────────────────────────
// Se pueden agregar, editar y quitar usuarios del sistema.
// Reglas de validación: el correo debe ser único, la contraseña debe tener al menos 6 caracteres
// y nunca se puede dejar al sistema sin administrador (ni quitando ni cambiando de rol al único).
// Guarda con data/configuracion.js (getUsuarios / saveUsuarios) y usa las piezas de ConfigUI.jsx.
import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon, Visibility as VerIcon, VisibilityOff as NoVerIcon } from '@mui/icons-material';
import { DL } from '../theme';
import PageHeader, { MiniSelect } from '../components/common/PageHeader';
import { getUsuarios, saveUsuarios, nuevoIdUsuario, ROLES, SUCURSALES } from '../data/configuracion';
import { BotonIcono, IconoMas, MenuAcciones, ConfigShell, F, th, td, BtnOutline, Card, TableWrap, Etiqueta, Campo, inputSx, Dialogo, Confirmar } from '../components/common/ConfigUI';

// Valores iniciales del formulario para un usuario nuevo (rol Vendedor y la primera sucursal de la lista).
const VACIO = { nombre: '', email: '', password: '', rol: 'Vendedor', sucursal: SUCURSALES[1] };
// Color de la etiqueta de rol en la tabla: así se distingue de un vistazo quién es administrador o de producción.
const colorRol = (r) => (r === 'Administrador' ? DL.navy : r === 'Producción' ? DL.yellow : DL.tM);

// ConfigUsuarios: pantalla para administrar los usuarios del sistema (listar, filtrar por rol,
// buscar, agregar, editar y quitar). No recibe props.
export default function ConfigUsuarios() {
  // Estados: lista de usuarios, filtros, formulario abierto (null = cerrado), id en edición, errores y aviso general.
  const [lista, setLista] = useState(() => getUsuarios());
  const [search, setSearch] = useState('');
  const [rol, setRol] = useState('');
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [borrar, setBorrar] = useState(null);
  const [aviso, setAviso] = useState('');
  const [verPass, setVerPass] = useState(true);

  // rows: usuarios filtrados por rol y por texto (nombre o correo).
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return lista.filter(u => (!rol || u.rol === rol) && (!q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [lista, search, rol]);

  // Abre el diálogo vacío para crear un usuario.
  const abrirNuevo = () => { setEditId(null); setForm({ ...VACIO }); setErrores({}); setVerPass(true); };
  // Abre el diálogo con los datos del usuario elegido.
  const abrirEditar = (u) => { setEditId(u.id); setForm({ nombre: u.nombre, email: u.email, password: u.password || '', rol: u.rol, sucursal: u.sucursal }); setErrores({}); setVerPass(true); };
  const set = (p) => setForm(f => ({ ...f, ...p }));

  // Control del único administrador: se cuentan los administradores y esUltimoAdmin dice si este
  // usuario es el último. Se usa al guardar y al quitar para que el sistema nunca se quede sin uno.
  const admins = lista.filter(u => u.rol === 'Administrador').length;
  const esUltimoAdmin = (u) => u.rol === 'Administrador' && admins <= 1;

  // guardar: valida y guarda el usuario. Reglas:
  //  - nombre obligatorio; correo obligatorio, con formato válido y único (se compara sin
  //    distinguir mayúsculas e ignorando al propio usuario cuando se edita);
  //  - contraseña obligatoria y de mínimo 6 caracteres;
  //  - no se puede cambiar de rol al único administrador.
  // Si hay errores se muestran en cada campo y no se guarda nada.
  const guardar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.email.trim()) e.email = 'El correo es obligatorio.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Correo no válido.';
    else if (lista.some(u => u.id !== editId && u.email.toLowerCase() === form.email.trim().toLowerCase())) e.email = 'Ya existe un usuario con este correo.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 6) e.password = 'Debe tener al menos 6 caracteres.';
    const actual = lista.find(u => u.id === editId);
    if (actual && esUltimoAdmin(actual) && form.rol !== 'Administrador') e.rol = 'Debe quedar al menos un administrador.';
    setErrores(e);
    if (Object.keys(e).length) return;
    // Objeto final del usuario. En una edición se conserva la fecha de creación original.
    const u = { id: editId ?? nuevoIdUsuario(lista), nombre: form.nombre.trim(), email: form.email.trim(), password: form.password, rol: form.rol, sucursal: form.sucursal, creado: actual?.creado || new Date().toISOString().slice(0, 10) };
    setLista(saveUsuarios(editId == null ? [...lista, u] : lista.map(x => (x.id === editId ? u : x))));
    setForm(null);
  };

  // quitar: elimina al usuario confirmado y guarda la lista.
  const quitar = () => { setLista(saveUsuarios(lista.filter(u => u.id !== borrar.id))); setBorrar(null); };
  // pedirQuitar: primero revisa que no sea el único administrador; si lo es, muestra un aviso y no
  // abre la confirmación. Si no, pide confirmar.
  const pedirQuitar = (u) => {
    if (esUltimoAdmin(u)) { setAviso('No se puede quitar al único administrador del sistema.'); return; }
    setAviso(''); setBorrar(u);
  };

  return (
    <ConfigShell>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', background: DL.bg, overflow: 'hidden' }}>
      {/* Encabezado con el filtro por rol. */}
      <PageHeader title="Usuarios" live={false} showShare={false}>
        <MiniSelect label="Rol" value={rol} onChange={setRol} minWidth={130}
          options={[{ value: '', label: 'Todos' }, ...ROLES.map(r => ({ value: r, label: r }))]} />
      </PageHeader>

      <Box sx={{ flex: 1, overflowY: 'auto', p: '16px 20px' }}>
        <Card>
          <Box sx={{ p: '10px 16px', borderBottom: `1px solid ${DL.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: DL.tH, fontFamily: F, mr: 'auto' }}>Total de usuarios: {rows.length}</Typography>
            <TextField size="small" placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 14, color: DL.tS }} /></InputAdornment> } }}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { fontSize: 11, borderRadius: '8px', fontFamily: F, background: '#fff' } }} />
            <BotonIcono filled titulo="Agregar usuario" icono={IconoMas} onClick={abrirNuevo} />
          </Box>
          {aviso && (
            <Box sx={{ px: '16px', py: '8px', background: '#fdf3f2', borderBottom: `1px solid ${DL.border}` }}>
              <Typography sx={{ fontSize: 11, color: DL.red, fontFamily: F }}>{aviso}</Typography>
            </Box>
          )}

          {/* Tabla de usuarios. */}
          <TableWrap minWidth={760}>
            <thead><tr>{['Usuario', 'Correo', 'Rol', 'Sucursal', 'Creado', 'Acciones'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(u => (
                <tr key={u.id}>
                  <td style={{ ...td, color: DL.tH, fontWeight: 500 }}>{u.nombre}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><Etiqueta color={colorRol(u.rol)}>{u.rol}</Etiqueta></td>
                  <td style={td}>{u.sucursal}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>{u.creado}</td>
                  <td style={td}>
                    <MenuAcciones opciones={[
                      { label: 'Editar', onClick: () => abrirEditar(u) },
                      { label: 'Quitar usuario', color: DL.red, separadorAntes: true, onClick: () => pedirQuitar(u) },
                    ]} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: DL.tS, padding: '36px' }}>No hay usuarios con estos filtros.</td></tr>}
            </tbody>
          </TableWrap>
        </Card>
      </Box>

      {/* Diálogo para agregar o editar. El mensaje de la contraseña aclara que es solo de ejemplo. */}
      <Dialogo abierto={!!form} onCerrar={() => setForm(null)}
        titulo={editId == null ? 'Agregar usuario' : 'Editar usuario'}
        subtitulo="El rol define lo que la persona puede hacer en el sistema."
        acciones={<><BtnOutline color={DL.tM} onClick={() => setForm(null)}>Cancelar</BtnOutline><BtnOutline filled onClick={guardar}>Guardar</BtnOutline></>}>
        {form && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Campo label="Nombre" requerido error={errores.nombre}>
              <Box component="input" value={form.nombre} onChange={e => set({ nombre: e.target.value })} sx={inputSx(errores.nombre)} />
            </Campo>
            <Campo label="Correo" requerido error={errores.email}>
              <Box component="input" value={form.email} onChange={e => set({ email: e.target.value })} placeholder="nombre@puntocero.com" sx={inputSx(errores.email)} />
            </Campo>
            <Campo label="Contraseña" requerido error={errores.password}>
              <Box sx={{ position: 'relative' }}>
                <Box component="input" type={verPass ? 'text' : 'password'} value={form.password} onChange={e => set({ password: e.target.value })}
                  placeholder="Mínimo 6 caracteres" sx={{ ...inputSx(errores.password), pr: '42px' }} />
                <Box component="button" type="button" onClick={() => setVerPass(v => !v)} aria-label={verPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: DL.tS, display: 'flex', p: 0, '&:hover': { color: DL.tH } }}>
                  {verPass ? <NoVerIcon sx={{ fontSize: 18 }} /> : <VerIcon sx={{ fontSize: 18 }} />}
                </Box>
              </Box>
              <Typography sx={{ fontSize: 10, color: DL.tS, fontFamily: F, mt: '4px' }}>Contraseña de ejemplo: el prototipo no tiene base de datos y no guarda nada en ningún servidor.</Typography>
            </Campo>
            <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Campo label="Rol" error={errores.rol} flex="1 1 160px">
                <Box component="select" value={form.rol} onChange={e => set({ rol: e.target.value })} sx={inputSx(errores.rol)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </Box>
              </Campo>
              <Campo label="Sucursal" flex="1 1 160px">
                <Box component="select" value={form.sucursal} onChange={e => set({ sucursal: e.target.value })} sx={inputSx()}>
                  {SUCURSALES.map(s => <option key={s}>{s}</option>)}
                </Box>
              </Campo>
            </Box>
          </Box>
        )}
      </Dialogo>

      {/* Confirmación antes de quitar al usuario. */}
      <Confirmar abierto={!!borrar} onCerrar={() => setBorrar(null)} onConfirmar={quitar} textoBoton="Quitar"
        titulo="Quitar usuario" texto={borrar ? `${borrar.nombre} ya no podrá entrar al sistema.` : ''} />
    </Box>
    </ConfigShell>
  );
}
