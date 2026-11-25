import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logActivity } from '../lib/supabase';

// Human-readable labels for each route
const PAGE_LABELS = {
  '/':              'Inicio',
  '/resumen':       'Resumen de Ventas',
  '/ventas':        'Ventas',
  '/clientes':      'Clientes',
  '/productos':     'Productos',
  '/tienda':        'Tienda',
  '/vendedor':      'Vendedor',
  '/desempeno':     'Desempeño',
  '/metas':         'Metas',
  '/metas/todo':    'Metas — Todo',
  '/finanzas':      'Financiero',
  '/flujo-caja':    'Flujo de Caja',
  '/estado':        'Estado de Resultados',
  '/cuentas-cobrar':'Cuentas por Cobrar',
  '/cuentas-pagar': 'Cuentas por Pagar',
  '/aging-saldos':  'Antigüedad de Saldos',
  '/inventarios':   'Inventarios',
  '/compras':       'Compras',
  '/egresos':       'Egresos',
  '/balance':       'Balance General',
  '/produccion':    'Producción',
  '/costos':        'Costos de Producción',
  '/admin':         'Administración',
  '/soporte':       'Soporte',
};

function getLabel(pathname) {
  // Exact match first
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  // Partial match (e.g. /clientes/123)
  const base = '/' + pathname.split('/')[1];
  return PAGE_LABELS[base] || pathname;
}

export function useActivityTracking(user) {
  const location  = useLocation();
  const enterTime = useRef(null);
  const prevPath  = useRef(null);

  // Flush duration for previous page then log enter for new page
  useEffect(() => {
    if (!user?.id) return;

    const now = Date.now();

    // Log leave for the page we're leaving
    if (prevPath.current !== null && enterTime.current !== null) {
      const secs = Math.round((now - enterTime.current) / 1000);
      if (secs >= 2) {
        logActivity(user.id, 'page_leave', {
          page:             prevPath.current,
          page_label:       getLabel(prevPath.current),
          duration_seconds: secs,
        });
      }
    }

    // Log enter for new page
    logActivity(user.id, 'page_enter', {
      page:       location.pathname,
      page_label: getLabel(location.pathname),
    });

    prevPath.current  = location.pathname;
    enterTime.current = now;
  }, [location.pathname, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flush on unmount (tab close / navigate away from SPA)
  useEffect(() => {
    const flush = () => {
      if (!user?.id || prevPath.current === null || enterTime.current === null) return;
      const secs = Math.round((Date.now() - enterTime.current) / 1000);
      if (secs >= 2) {
        // Use sendBeacon for reliability on unload
        const payload = JSON.stringify({
          user_id:          user.id,
          event:            'page_leave',
          page:             prevPath.current,
          page_label:       getLabel(prevPath.current),
          duration_seconds: secs,
        });
        // fallback — best-effort
        logActivity(user.id, 'page_leave', {
          page:             prevPath.current,
          page_label:       getLabel(prevPath.current),
          duration_seconds: secs,
        });
        _ = payload; // suppress lint
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}
