// ─── main.jsx: punto de entrada de la aplicación ───────────────────────────────
// Vite carga este archivo desde index.html. Su trabajo es montar el componente App
// dentro del <div id="root"> de la página.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Redirección de la SPA: al estar publicada en un hosting estático, entrar directo a una
// ruta como /pedidos devuelve 404.html. Esa página guarda la ruta pedida en sessionStorage
// y regresa a "/"; aquí se lee y se restaura la URL original para que React Router la
// muestre. Se borra después para que no se repita en la siguiente carga.
const spaRedirect = sessionStorage.getItem('spa_redirect');
if (spaRedirect) {
  sessionStorage.removeItem('spa_redirect');
  window.history.replaceState(null, '', spaRedirect);
}

// StrictMode ayuda a detectar errores en desarrollo (renderiza dos veces); no afecta la versión publicada.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
