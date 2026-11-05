import React from 'react';
import { 
  Edit2, FileText, Share2, DollarSign, CheckCircle2, 
  CheckCheck, Trash2, Coins, Truck 
} from 'lucide-react';
import { formatoCOP } from '../hooks/useFinanzas';

export default function TarjetasMovil({
  tema,
  darkMode,
  loading,
  pedidosPendientes,
  enviosFiltrados,
  obtenerEstadoEdison,
  abrirModalEditarPedido,
  abrirModalFruta,
  abrirModalFlete,
  iniciarLiquidacionPedido,
  cancelarPedido,
  abrirModalEditarDespacho,
  abrirModalCuentaSeguro,
  compartirPDFWhatsApp,
  abrirModalAbono,
  abrirModalHistorial,
  setProvSeleccionadoId,
  setDespachosProvSeleccionados,
  setFechaPagoProv,
  setNotasPagoProv,
  setModalPagoProvAbierto,
  proveedores
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Tarjetas de Pedidos Pendientes */}
      {pedidosPendientes.map((p) => {
        const costoFleteTotal = Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000);
        const costoFrutaTotal = Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000);
        const fletePago = p.flete_pagado;
        const frutaPaga = p.fruta_pagada;
        const esEnRuta = p.estado_fase === 'en_ruta';

        return (
          <div 
            key={p.id}
            style={{
              background: tema.cardBg,
              borderRadius: '14px',
              padding: '14px',
              border: esEnRuta ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)',
              borderLeft: `5px solid ${esEnRuta ? '#38bdf8' : '#eab308'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '900', fontSize: '17px', color: esEnRuta ? '#38bdf8' : '#eab308' }}>
                    #{p.consecutivo}
                  </span>
                  <span style={{ 
                    padding: '3px 8px', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: esEnRuta ? 'rgba(56, 189, 248, 0.18)' : 'rgba(234, 179, 8, 0.18)',
                    color: esEnRuta ? '#38bdf8' : '#eab308',
                    border: `1px solid ${esEnRuta ? '#38bdf8' : '#eab308'}`
                  }}>
                    {esEnRuta ? '🚚 EN RUTA' : '🟡 SOLICITADO'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>
                  Fecha: {p.fecha_pedido} • {p.cajas} cajas
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}>
                  ⏳ Por pesar
                </span>
                <button
                  onClick={() => abrirModalEditarPedido(p)}
                  title="Editar pedido"
                  style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}
                >
                  <Edit2 size={13} color="#38bdf8" />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
              <div>
                <span style={{ color: tema.textMuted }}>Fruta Edison:</span><br />
                {frutaPaga ? (
                  <b style={{ color: '#22c55e' }}>✅ PAGA ({formatoCOP(p.monto_fruta_pagado || costoFrutaTotal)})</b>
                ) : (
                  <b style={{ color: '#ef4444' }}>⚠️ PEND ({formatoCOP(costoFrutaTotal)})</b>
                )}
              </div>
              <div>
                <span style={{ color: tema.textMuted }}>Flete Macareo:</span><br />
                {fletePago ? (
                  <b style={{ color: '#22c55e' }}>✅ PAGO ({formatoCOP(p.monto_flete_pagado || costoFleteTotal)})</b>
                ) : (
                  <b style={{ color: '#f97316' }}>⚠️ PEND ({formatoCOP(costoFleteTotal)})</b>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              {!frutaPaga ? (
                <button
                  onClick={() => abrirModalFruta(p)}
                  style={{ padding: '9px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Coins size={13} /> Pagar Edison
                </button>
              ) : (
                <button
                  onClick={() => abrirModalFruta(p)}
                  style={{ padding: '9px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                >
                  Fruta Paga
                </button>
              )}

              {!fletePago ? (
                <button
                  onClick={() => abrirModalFlete(p)}
                  style={{ padding: '9px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <Truck size={13} /> Pagar Macareo
                </button>
              ) : (
                <button
                  onClick={() => abrirModalFlete(p)}
                  style={{ padding: '9px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                >
                  Flete Pago
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => iniciarLiquidacionPedido(p)}
                style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} /> Recibir báscula
              </button>
              <button
                onClick={() => cancelarPedido(p.id)}
                style={{ padding: '10px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        );
      })}

      {/* Tarjetas de Despachos Facturados */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: tema.textMuted }}>Cargando registros...</div>
      ) : enviosFiltrados.length === 0 && pedidosPendientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: tema.textMuted }}>No hay registros.</div>
      ) : (
        enviosFiltrados.map((r) => {
          const saldo = Number(r.saldo_pendiente || 0);
          const infoEd = obtenerEstadoEdison(r);

          return (
            <div
              key={r.id}
              style={{
                background: tema.cardBg,
                borderRadius: '14px',
                padding: '14px',
                border: `1px solid ${saldo > 0 ? 'rgba(249, 115, 22, 0.4)' : tema.border}`,
                borderLeft: `4px solid ${saldo > 0 ? '#f97316' : '#22c55e'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '900', fontSize: '17px' }}>#{r.consecutivo}</span>
                    <span style={{ padding: '2px 6px', background: saldo > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: saldo > 0 ? '#f97316' : '#22c55e', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                      {saldo > 0 ? 'CARTERA INNOVATIVE' : 'SALDADO INNOVATIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>{r.fecha_envio}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '16px', color: saldo > 0 ? '#f97316' : '#22c55e' }}>
                    {saldo > 0 ? formatoCOP(saldo) : '✅ Pagado'}
                  </div>
                  <div style={{ fontSize: '10px', color: tema.textMuted }}>Saldo Innovative</div>
                </div>
              </div>

              {/* Desglose de Edison y Macareo */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ color: tema.textMuted }}>Deuda Fruta Edison:</span><br />
                  <b style={{ color: infoEd.estaSaldado ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
                    {infoEd.estaSaldado ? '✅ Fruta Paga' : `Debo ${formatoCOP(infoEd.saldoPendiente)}`}
                  </b>
                  <div style={{ fontSize: '10px', color: tema.textMuted }}>Total: {formatoCOP(infoEd.costoFrutaTotal)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: tema.textMuted }}>Flete Macareo:</span><br />
                  <b style={{ color: '#22c55e', fontSize: '13px' }}>{formatoCOP(r.total_flete)}</b>
                  <div style={{ fontSize: '10px', color: tema.textMuted }}>{r.cajas} cjs @ $32k</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '6px' }}>
                <button
                  onClick={() => abrirModalEditarDespacho(r)}
                  style={{ padding: '9px 12px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Edit2 size={14} color="#38bdf8" />
                </button>

                <button
                  onClick={() => abrirModalCuentaSeguro(r)}
                  style={{ padding: '9px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                >
                  <FileText size={14} /> Cuenta
                </button>

                <button
                  onClick={() => compartirPDFWhatsApp(r)}
                  style={{ padding: '9px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Share2 size={14} /> PDF
                </button>

                {!infoEd.estaSaldado ? (
                  <button
                    onClick={() => {
                      setProvSeleccionadoId(proveedores.find(p => p.tipo !== 'transporte')?.id || '');
                      setDespachosProvSeleccionados([r.id]);
                      setFechaPagoProv(new Date().toISOString().split('T')[0]);
                      setNotasPagoProv(`Abono fruta despacho #${r.consecutivo}`);
                      setModalPagoProvAbierto(true);
                    }}
                    style={{ padding: '9px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Abonar Edison
                  </button>
                ) : (
                  <button
                    onClick={() => abrirModalHistorial(r)}
                    style={{ padding: '9px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}