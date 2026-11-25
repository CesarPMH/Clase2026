// ─── KPI Intelligence Layer — Contexto accionable por KPI ─────────────────────
// Cada entrada tiene: definición, fórmula, por qué importa, benchmark de industria.
// Usado por KpiDrawer.jsx para mostrar contexto al hacer clic en cualquier KPI card.

export const KPI_INTEL = {

  // ─── Ventas ───────────────────────────────────────────────────────────────────
  ventas: {
    que: 'Total de ingresos por ventas facturadas en el período seleccionado, antes de descuentos y devoluciones.',
    formula: 'Σ (Precio × Cantidad) de todas las facturas emitidas en el período',
    porque: 'Confirma si el negocio está creciendo y si el equipo comercial está cumpliendo su cuota. Una caída sostenida en ventas es la primera señal de un problema estructural.',
    accion: 'Si estás bajo meta, analiza qué canales o vendedores están jalando hacia abajo. Activa incentivos en las últimas semanas del período.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Crecimiento YoY',
      unidad: '%',
      min: -10, max: 30,
      zonas: [
        { from: -10, to: 0,  color: '#dc2626', label: 'Contracción' },
        { from: 0,   to: 8,  color: '#d97706', label: 'Bajo' },
        { from: 8,   to: 18, color: '#16a34a', label: 'Saludable' },
        { from: 18,  to: 30, color: '#547e69', label: 'Alto crecimiento' },
      ],
      tuPos: 12.3,
      tuLabel: '+12.3%',
      nota: 'Tu crecimiento YoY de +12.3% está en la zona saludable. El rango de referencia para distribución agroindustrial en LATAM es 8–18% anual.',
    },
  },

  margen: {
    que: 'Porcentaje que queda de cada quetzal vendido después de restar el costo directo del producto (COGS).',
    formula: '(Ventas − Costo de Ventas) ÷ Ventas × 100',
    porque: 'Determina si el negocio tiene capacidad de cubrir sus gastos operativos y generar utilidad real. Un margen bajo puede esconder pérdidas aunque las ventas suban.',
    accion: 'Revisa los productos con margen negativo o menor al 15% (PILAROUND en rojo). Evalúa si el precio de lista está por debajo del costo actualizado o si los descuentos comerciales están erosionando el margen.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Margen Bruto',
      unidad: '%',
      min: 0, max: 40,
      zonas: [
        { from: 0,  to: 15, color: '#dc2626', label: 'Crítico' },
        { from: 15, to: 20, color: '#d97706', label: 'Riesgo' },
        { from: 20, to: 32, color: '#16a34a', label: 'Saludable' },
        { from: 32, to: 40, color: '#547e69', label: 'Excelente' },
      ],
      tuPos: 18.1,
      tuLabel: '18.1%',
      nota: 'Tu margen de 18.1% está en zona de riesgo. El benchmark saludable para distribución es 20–32%. La diferencia de ~2pp vs. el umbral mínimo representa ~$31K en margen perdido sobre el volumen actual.',
    },
  },

  ticket: {
    que: 'Valor promedio de cada factura emitida en el período. Refleja el tamaño típico de cada transacción.',
    formula: 'Ventas Totales ÷ Número de Facturas',
    porque: 'Revela si los clientes están comprando más por transacción o menos. Un ticket promedio creciente indica éxito en estrategias de venta adicional (upsell/cross-sell).',
    accion: 'Si el ticket está bajo meta, implementa combos de productos complementarios o mínimos de pedido por canal. Revisa si los vendedores están ofreciendo líneas completas o solo los productos de siempre.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Ticket Promedio (USD)',
      unidad: '',
      min: 200, max: 600,
      zonas: [
        { from: 200, to: 280, color: '#dc2626', label: 'Bajo' },
        { from: 280, to: 340, color: '#d97706', label: 'Aceptable' },
        { from: 340, to: 480, color: '#16a34a', label: 'Saludable' },
        { from: 480, to: 600, color: '#547e69', label: 'Alto valor' },
      ],
      tuPos: 349,
      tuLabel: '$349',
      nota: 'Tu ticket promedio de $349 está en la zona saludable pero 6.7% bajo tu meta interna de $374. Un incremento de $25/ticket multiplicado por las 43 facturas del mes = $1,075 adicionales en ingresos.',
    },
  },

  clientes: {
    que: 'Número de clientes únicos que realizaron al menos una compra en el período seleccionado.',
    formula: 'Count(clientes únicos con facturas emitidas en el período)',
    porque: 'Mide el tamaño real de tu base activa. Una base estable o creciente es señal de salud; una base que se contrae aunque las ventas suban indica concentración de riesgo en pocos clientes.',
    accion: 'Si la base no crece, analiza la distribución: ¿cuántos clientes representan el 80% de tus ventas? Si son menos de 10, tienes riesgo de concentración. Activa plan de diversificación.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Crecimiento base activa YoY',
      unidad: '%',
      min: -5, max: 30,
      zonas: [
        { from: -5, to: 0,  color: '#dc2626', label: 'Contracción' },
        { from: 0,  to: 8,  color: '#d97706', label: 'Estancado' },
        { from: 8,  to: 20, color: '#16a34a', label: 'Saludable' },
        { from: 20, to: 30, color: '#547e69', label: 'Alto crecimiento' },
      ],
      tuPos: 16.5,
      tuLabel: '+16.5%',
      nota: 'Tu base activa creció +16.5% YoY (de 109 a 127 clientes), superando el rango saludable de referencia de 8–20%. Esto indica buena tracción de adquisición de clientes.',
    },
  },

  facturas: {
    que: 'Total de facturas emitidas en el período, independientemente del estado de pago. Refleja el ritmo de actividad transaccional.',
    formula: 'Count(facturas con fecha de emisión dentro del período)',
    porque: 'Indica la velocidad de operación del negocio. Un volumen consistente de facturas muestra regularidad comercial; picos o caídas revelan estacionalidad o problemas operativos.',
    accion: 'Cruza el número de facturas con el ticket promedio. Si facturas sube pero ventas totales no se mueven, el ticket está cayendo — los clientes están comprando más frecuente pero menos por visita.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Crecimiento en facturas YoY',
      unidad: '%',
      min: -10, max: 40,
      zonas: [
        { from: -10, to: 0,  color: '#dc2626', label: 'Contracción' },
        { from: 0,   to: 10, color: '#d97706', label: 'Bajo' },
        { from: 10,  to: 30, color: '#16a34a', label: 'Saludable' },
        { from: 30,  to: 40, color: '#547e69', label: 'Alto' },
      ],
      tuPos: 26.5,
      tuLabel: '+26.5%',
      nota: 'Tus facturas crecieron +26.5% YoY (de 34 a 43), superando el ritmo de crecimiento de ventas (+12.3%). Esto puede indicar que el ticket promedio está bajando — más transacciones, menor tamaño por pedido.',
    },
  },

  nuevos: {
    que: 'Clientes que realizaron su primera compra con la empresa dentro del período seleccionado.',
    formula: 'Count(clientes cuya primera factura histórica cae dentro del período)',
    porque: 'Define la capacidad de adquisición del negocio. Sin entrada de nuevos clientes, el crecimiento depende exclusivamente de que los existentes compren más — lo cual tiene límite.',
    accion: 'Si estás bajo meta de nuevos clientes, activa esfuerzo en canales de prospección. Identifica qué segmentos o zonas geográficas tienen menor penetración y dirígete ahí.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Nuevos como % de base activa',
      unidad: '%',
      min: 0, max: 20,
      zonas: [
        { from: 0,  to: 3,  color: '#dc2626', label: 'Crítico' },
        { from: 3,  to: 6,  color: '#d97706', label: 'Bajo' },
        { from: 6,  to: 14, color: '#16a34a', label: 'Saludable' },
        { from: 14, to: 20, color: '#547e69', label: 'Alto crecimiento' },
      ],
      tuPos: 6.3, // 8/127 = 6.3%
      tuLabel: '6.3%',
      nota: 'Tus 8 clientes nuevos representan el 6.3% de tu base activa — en el límite inferior del rango saludable. Estás 2 clientes bajo tu meta mensual de 10. En el año, alcanzar la meta mensual consistentemente generaría ~24 nuevos clientes adicionales.',
    },
  },

  abandon: {
    que: 'Clientes que compraron en períodos anteriores pero no registran compras en el período actual — están en proceso de alejarse.',
    formula: 'Count(clientes con última compra > umbral de días definido y sin factura en el período)',
    porque: 'El abandono de clientes destruye valor de forma silenciosa. Retener un cliente existente cuesta 5–7x menos que adquirir uno nuevo. Cada cliente abandonado es ingreso futuro perdido.',
    accion: 'Activa contacto inmediato con los 6 clientes abandonados: llamada directa, oferta de reactivación, identificación del motivo. El 60–70% de clientes abandonados pueden recuperarse si el contacto es en los primeros 30 días.',
    benchmark: {
      industria: 'Distribución Agroindustrial · LATAM',
      label: 'Abandono como % de base activa',
      unidad: '%',
      min: 0, max: 15,
      zonas: [
        { from: 0,  to: 3,  color: '#16a34a', label: 'Excelente' },
        { from: 3,  to: 5,  color: '#d97706', label: 'Aceptable' },
        { from: 5,  to: 9,  color: '#dc2626', label: 'Riesgo' },
        { from: 9,  to: 15, color: '#7f1d1d', label: 'Crítico' },
      ],
      tuPos: 4.7, // 6/127 = 4.7%
      tuLabel: '4.7%',
      nota: 'Tus 6 clientes abandonados representan el 4.7% de tu base activa — ligeramente sobre el umbral máximo de 5 definido. Esta cifra mejoró vs. año anterior (9 abandonados), pero sigue siendo un punto de atención.',
      invertido: true, // lower is better
    },
  },
};
