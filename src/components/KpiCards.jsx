import React from 'react';
import { AlertCircle, ArrowUpRight, Truck, Scale, TrendingUp, Package } from 'lucide-react';
import { formatoCOP } from '../hooks/useFinanzas';

export default function KpiCards({ 
  tema, 
  esMovil, 
  totalPorCobrar, 
  enviosConDeudaCliente, 
  filtroEstado, 
  setFiltroEstado,
  deudaEdison,
  deudaMacareo,
  metricaMerma,
  margenTotal,
  margenPromedioPorKilo,
  porcentajeRentabilidadGlobal,
  totalKilos,
  totalCajas,
  cantidadEnvios,
  despachosPendientesEdisonCount
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '14px' }}>
      
      {/* 1. Por Cobrar */}
      <div 
        onClick={() => setFiltroEstado(filtroEstado === 'pendientes' ? 'todos' : 'pendientes')}
        style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${filtroEstado === 'pendientes' ? '#f97316' : tema.border}`, cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
          <span>POR COBRAR</span>
          <AlertCircle size={13} color="#f97316" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#f97316', marginTop: '4px' }}>{formatoCOP(totalPorCobrar)}</div>
        <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
          {enviosConDeudaCliente > 0 ? `⚠️ ${enviosConDeudaCliente} pend.` : '✅ Al día'}
        </div>
      </div>

      {/* 2. Debo a Edison */}
      <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
          <span>DEBO A EDISON</span>
          <ArrowUpRight size={13} color="#ef4444" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{formatoCOP(deudaEdison)}</div>
        <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
          {deudaEdison > 0 ? `${despachosPendientesEdisonCount} por liquidar` : '✅ Fruta paga'}
        </div>
      </div>

      {/* 3. Debo a Macareo */}
      <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
          <span>DEBO A MACAREO</span>
          <Truck size={13} color={deudaMacareo === 0 ? '#22c55e' : '#f97316'} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: deudaMacareo === 0 ? '#22c55e' : '#f97316', marginTop: '4px' }}>
          {formatoCOP(deudaMacareo)}
        </div>
        <div style={{ fontSize: '10px', color: deudaMacareo === 0 ? '#22c55e' : '#f97316', marginTop: '2px', fontWeight: '600' }}>
          {deudaMacareo === 0 ? '✅ Fletes al día ($0)' : '⚠️ Fletes pendientes'}
        </div>
      </div>

      {/* 4. Merma / Báscula */}
      <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#eab308', fontSize: '10px', fontWeight: '800' }}>
          <span>MERMA / BÁSCULA</span>
          <Scale size={13} color="#eab308" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: metricaMerma.kilosDiferencia > 0 ? '#f97316' : '#22c55e', marginTop: '4px' }}>
          {metricaMerma.kilosDiferencia > 0 ? `-${metricaMerma.kilosDiferencia.toFixed(1)} Kg` : `+${Math.abs(metricaMerma.kilosDiferencia).toFixed(1)} Kg`}
        </div>
        <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
          {metricaMerma.kilosDiferencia > 0 ? `${metricaMerma.porcentajeMerma.toFixed(1)}% vs 25Kg teór.` : '✅ Cubierto por Edison'}
        </div>
      </div>

      {/* 5. Margen Bruto */}
      <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
          <span>MARGEN BRUTO</span>
          <TrendingUp size={13} color="#22c55e" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>{formatoCOP(margenTotal)}</div>
        <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
          {formatoCOP(margenPromedioPorKilo)} / Kg ({porcentajeRentabilidadGlobal.toFixed(1)}%)
        </div>
      </div>

      {/* 6. Fruta Despachada */}
      <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
          <span>FRUTA DESPACHADA</span>
          <Package size={13} color="#38bdf8" />
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', color: tema.textMain, marginTop: '4px' }}>
          {Number(totalKilos).toFixed(1)} Kg
        </div>
        <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
          En {totalCajas} cajas ({cantidadEnvios} envíos)
        </div>
      </div>

    </div>
  );
}