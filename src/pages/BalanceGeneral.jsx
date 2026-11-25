// ─── Balance General ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
  ExpandMore as ChevronDown,
  ChevronRight as ChevronRight,
  AccountBalance as BalanceIcon,
  TrendingUp as TrendingIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { DL } from '../theme';

const ff = "'Inter', ui-sans-serif, system-ui, sans-serif";
const fmt$ = v => {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}$${(abs/1000000).toFixed(2)}M`;
  if (abs >= 1000)    return `${sign}$${(abs/1000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const PERIODS = ['Dic 2024', 'Mar 2025', 'Jun 2025', 'Sep 2025', 'Dic 2025', 'Mar 2026'];

// ─── Balance data ─────────────────────────────────────────────────────────────
const BALANCE = {
  activos: {
    corrientes: [
      { label: 'Caja y Bancos',           val: 285400 },
      { label: 'Cuentas por Cobrar',       val: 412600 },
      { label: 'Inventarios',              val: 198200 },
      { label: 'Gastos Prepagados',        val:  28400 },
      { label: 'Otros activos corrientes', val:  14800 },
    ],
    noCorrientes: [
      { label: 'Propiedades y Equipos',    val: 1840000 },
      { label: 'Depreciación Acumulada',   val: -320400 },
      { label: 'Intangibles',              val:  85000 },
      { label: 'Inversiones a LP',         val: 240000 },
      { label: 'Otros activos no ctes.',   val:  32000 },
    ],
  },
  pasivos: {
    corrientes: [
      { label: 'Cuentas por Pagar',        val: 198400 },
      { label: 'Préstamos Corto Plazo',    val: 145000 },
      { label: 'IVA por Pagar',            val:  48200 },
      { label: 'Gastos Acumulados',        val:  36800 },
      { label: 'Otros pasivos corrientes', val:  22400 },
    ],
    noCorrientes: [
      { label: 'Préstamos Largo Plazo',    val: 680000 },
      { label: 'Deuda Hipotecaria',        val: 420000 },
      { label: 'Obligaciones Financieras', val:  98400 },
      { label: 'Otros pasivos no ctes.',   val:  24200 },
    ],
  },
  patrimonio: [
    { label: 'Capital Social',             val: 800000 },
    { label: 'Reserva Legal',              val:  95000 },
    { label: 'Utilidades Retenidas',       val: 482600 },
    { label: 'Resultado del Período',      val: 146000 },
    { label: 'Otras Reservas',             val:  86800 },
  ],
};

// ─── Section components ───────────────────────────────────────────────────────
function Row({ label, val, depth = 0, isTotal = false, color }) {
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      pl: depth === 0 ? 0 : `${depth * 16}px`,
      py: isTotal ? '7px' : '5px',
      borderTop: isTotal ? `1px solid ${DL.border2}` : 'none',
      mt: isTotal ? '2px' : 0,
    }}>
      <Typography sx={{
        fontFamily: ff, fontSize: isTotal ? 11 : 10.5,
        fontWeight: isTotal ? 500 : 500,
        color: color || (isTotal ? DL.tH : DL.tM),
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontFamily: ff, fontSize: isTotal ? 12 : 11,
        fontWeight: isTotal ? 500 : 500,
        color: color || (isTotal ? DL.tH : DL.tM),
        letterSpacing: '-0.02em',
      }}>
        {fmt$(val)}
      </Typography>
    </Box>
  );
}

function Section({ title, color, icon: Icon, children, total, totalLabel = 'Total', defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Box sx={{ background: '#fff', borderRadius: '10px', border: `1px solid ${DL.border}`, boxShadow: DL.e1, overflow: 'hidden', flex: 1, minWidth: 0 }}>
      {/* Section header */}
      <Box component="button" onClick={() => setOpen(o => !o)} sx={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
        px: '16px', py: '12px', background: `${color}0d`,
        borderBottom: open ? `1px solid ${color}22` : 'none',
        border: 'none', cursor: 'pointer',
        borderRadius: open ? '10px 10px 0 0' : '10px',
      }}>
        <Box sx={{ color, display: 'flex' }}><Icon sx={{ fontSize: 18 }} /></Box>
        <Typography sx={{ fontFamily: ff, fontSize: 13, fontWeight: 500, color, flex: 1, textAlign: 'left' }}>
          {title}
        </Typography>
        <Typography sx={{ fontFamily: ff, fontSize: 14, fontWeight: 500, color, letterSpacing: '-0.03em' }}>
          {fmt$(total)}
        </Typography>
        <Box sx={{ color, display: 'flex', ml: '4px' }}>
          {open ? <ChevronDown sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
        </Box>
      </Box>

      {open && (
        <Box sx={{ px: '16px', pb: '12px', pt: '8px' }}>
          {children}
          <Row label={totalLabel} val={total} isTotal color={color} />
        </Box>
      )}
    </Box>
  );
}

function SubSection({ title, rows }) {
  const [open, setOpen] = useState(true);
  const total = rows.reduce((s, r) => s + r.val, 0);

  return (
    <Box sx={{ mb: '4px' }}>
      <Box component="button" onClick={() => setOpen(o => !o)} sx={{
        display: 'flex', alignItems: 'center', gap: '4px',
        background: 'none', border: 'none', cursor: 'pointer', py: '5px',
      }}>
        <Box sx={{ color: DL.tS, display: 'flex' }}>
          {open ? <ChevronDown sx={{ fontSize: 14 }} /> : <ChevronRight sx={{ fontSize: 14 }} />}
        </Box>
        <Typography sx={{ fontFamily: ff, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: DL.tS }}>
          {title}
        </Typography>
      </Box>

      {open && (
        <Box sx={{ pl: '14px', borderLeft: `2px solid ${DL.border2}`, ml: '6px' }}>
          {rows.map(r => <Row key={r.label} label={r.label} val={r.val} depth={0} />)}
          <Row label={`Total ${title}`} val={total} isTotal />
        </Box>
      )}
    </Box>
  );
}

// ─── KPI summary ──────────────────────────────────────────────────────────────
function SummaryKpi({ label, value, color, bg }) {
  return (
    <Box sx={{ flex: 1, background: bg || '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', p: '14px 16px', boxShadow: DL.e1 }}>
      <Typography sx={{ fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: DL.tS, mb: '4px' }}>{label}</Typography>
      <Typography sx={{ fontFamily: ff, fontSize: 22, fontWeight: 500, color: color || DL.tH, letterSpacing: '-0.04em', lineHeight: 1 }}>{fmt$(value)}</Typography>
    </Box>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BalanceGeneral() {
  const [period, setPeriod] = useState('Mar 2026');

  const totalActCte   = BALANCE.activos.corrientes.reduce((s, r) => s + r.val, 0);
  const totalActNoCte = BALANCE.activos.noCorrientes.reduce((s, r) => s + r.val, 0);
  const totalActivos  = totalActCte + totalActNoCte;

  const totalPasCte   = BALANCE.pasivos.corrientes.reduce((s, r) => s + r.val, 0);
  const totalPasNoCte = BALANCE.pasivos.noCorrientes.reduce((s, r) => s + r.val, 0);
  const totalPasivos  = totalPasCte + totalPasNoCte;

  const totalPatrimonio = BALANCE.patrimonio.reduce((s, r) => s + r.val, 0);
  const totalPasPatrim  = totalPasivos + totalPatrimonio;

  const balanced = Math.abs(totalActivos - totalPasPatrim) < 1; // float tolerance

  return (
    <Box sx={{ p: '0 0 28px', fontFamily: ff }}>
      <PageHeader title="Balance General" live={false} showShare={false}>
        {/* Period selector */}
        <Box sx={{ position: 'relative' }}>
          <Typography sx={{ position: 'absolute', top: -7, left: 8, zIndex: 1, fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, background: '#fff', px: '3px' }}>Período</Typography>
          <Box component="select" value={period} onChange={e => setPeriod(e.target.value)}
            sx={{ fontFamily: ff, fontSize: 11, fontWeight: 500, color: DL.blue, background: '#fff', border: `1px solid ${DL.blue}`, borderRadius: '7px', py: '7px', pl: '10px', pr: '26px', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
            {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </Box>
          <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: DL.tS, fontSize: 10 }}>▾</Box>
        </Box>
      </PageHeader>

      <Box sx={{ px: '20px', pt: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Summary KPIs */}
        <Box sx={{ display: 'flex', gap: '12px' }}>
          <SummaryKpi label="Total Activos"       value={totalActivos}   color={DL.blue}  />
          <SummaryKpi label="Total Pasivos"        value={totalPasivos}   color={DL.red}   />
          <SummaryKpi label="Patrimonio Neto"      value={totalPatrimonio} color={DL.green} />
          <Box sx={{ flex: 1, background: balanced ? `${DL.green}0d` : `${DL.red}0d`, border: `1px solid ${balanced ? DL.green : DL.red}33`, borderRadius: '10px', p: '14px 16px', boxShadow: DL.e1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography sx={{ fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: DL.tS, mb: '4px' }}>Balance</Typography>
            <Typography sx={{ fontFamily: ff, fontSize: 16, fontWeight: 500, color: balanced ? DL.green : DL.red }}>
              {balanced ? '✓ Balanceado' : '⚠ Diferencia'}
            </Typography>
            <Typography sx={{ fontFamily: ff, fontSize: 10, color: DL.tS, mt: '2px' }}>
              Activos = Pasivos + Patrimonio
            </Typography>
          </Box>
        </Box>

        {/* Two column layout: Activos | Pasivos + Patrimonio */}
        <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

          {/* LEFT — Activos */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Section title="Activos" color={DL.blue} icon={BalanceIcon} total={totalActivos} totalLabel="Total Activos">
              <SubSection title="Corrientes"     rows={BALANCE.activos.corrientes} />
              <SubSection title="No Corrientes"  rows={BALANCE.activos.noCorrientes} />
            </Section>
          </Box>

          {/* RIGHT — Pasivos + Patrimonio */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Section title="Pasivos" color={DL.red} icon={TrendingIcon} total={totalPasivos} totalLabel="Total Pasivos">
              <SubSection title="Corrientes"     rows={BALANCE.pasivos.corrientes} />
              <SubSection title="No Corrientes"  rows={BALANCE.pasivos.noCorrientes} />
            </Section>

            <Section title="Patrimonio" color={DL.green} icon={SavingsIcon} total={totalPatrimonio} totalLabel="Total Patrimonio">
              {BALANCE.patrimonio.map(r => <Row key={r.label} label={r.label} val={r.val} />)}
            </Section>

            {/* Pasivos + Patrimonio total */}
            <Box sx={{ background: '#fff', borderRadius: '10px', border: `2px solid ${DL.border2}`, p: '14px 16px', boxShadow: DL.e1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: ff, fontSize: 12, fontWeight: 500, color: DL.tH }}>Total Pasivos + Patrimonio</Typography>
                <Typography sx={{ fontFamily: ff, fontSize: 15, fontWeight: 500, color: DL.blue, letterSpacing: '-0.03em' }}>{fmt$(totalPasPatrim)}</Typography>
              </Box>
              <Box sx={{ mt: '6px', height: 3, borderRadius: '3px', background: balanced ? DL.green : DL.red, opacity: 0.7 }} />
            </Box>
          </Box>
        </Box>

        {/* Ratios strip */}
        <Box sx={{ display: 'flex', gap: '12px' }}>
          {[
            { label: 'Razón Corriente',     val: (totalActCte / totalPasCte).toFixed(2) + 'x',  note: 'Activo Cte / Pasivo Cte',  ok: totalActCte / totalPasCte >= 1.5 },
            { label: 'Endeudamiento',        val: ((totalPasivos / totalActivos) * 100).toFixed(1) + '%', note: 'Pasivos / Activos', ok: totalPasivos / totalActivos <= 0.5 },
            { label: 'Capital de Trabajo',   val: fmt$(totalActCte - totalPasCte), note: 'Activo Cte − Pasivo Cte',               ok: totalActCte > totalPasCte },
            { label: 'Apalancamiento',       val: (totalActivos / totalPatrimonio).toFixed(2) + 'x', note: 'Activos / Patrimonio', ok: totalActivos / totalPatrimonio <= 2 },
          ].map(r => (
            <Box key={r.label} sx={{ flex: 1, background: '#fff', border: `1px solid ${DL.border}`, borderRadius: '10px', p: '12px 14px', boxShadow: DL.e1 }}>
              <Typography sx={{ fontFamily: ff, fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', color: DL.tS, mb: '4px' }}>{r.label}</Typography>
              <Typography sx={{ fontFamily: ff, fontSize: 20, fontWeight: 500, color: r.ok ? DL.green : DL.red, letterSpacing: '-0.03em', lineHeight: 1 }}>{r.val}</Typography>
              <Typography sx={{ fontFamily: ff, fontSize: 9, color: DL.tS, mt: '4px' }}>{r.note}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
