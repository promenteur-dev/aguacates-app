import React from 'react';
import { 
  Square, CheckSquare, Clock, Edit2, FileText, Share2, 
  DollarSign, CheckCircle2, CheckCheck, Trash2 
} from 'lucide-react';
import { formatoCOP } from '../hooks/useFinanzas';

export default function TablaEnvios({
  tema,
  enviosFiltrados,
  pedidosPendientes,
  seleccionadosTabla,
  toggleSeleccionFila,
  toggleSeleccionarTodoTabla,
  handleOrdenar,
  renderIconoOrden,
  obtenerEstadoEdison,
  abrirModalFruta,
  abrirModalFlete,
  abrirModalEditarPedido,
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
    <div style={{ background: tema.cardBg, borderRadius: '14px', border: `1px solid ${tema.border}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: tema.thBg, borderBottom: `1px solid ${tema.border}`, color: tema.textMuted }}>
            <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
              <div onClick={() => toggleSeleccionarTodoTabla(enviosFiltrados.map(e => e.id))} style={{ cursor: 'pointer' }}>
                {seleccionadosTabla.length > 0 && seleccionadosTabla.length === enviosFiltrados.length ? (
                  <CheckSquare size={16} color="#38bdf8" />
                ) : (
                  <Square size={16} color={tema.textMuted} />
                )}
              </div>
            </th>
            <th onClick={() => handleOrdenar('consecutivo')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              # / Cartera Innovative {renderIconoOrden('consecutivo')}
            </th>
            <th onClick={() => handleOrdenar('fecha_envio')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Fecha {renderIconoOrden('fecha_envio')}
            </th>
            <th onClick={() => handleOrdenar('cajas')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Cajas {renderIconoOrden('cajas')}
            </th>
            <th onClick={() => handleOrdenar('kilos')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Kilos {renderIconoOrden('kilos')}
            </th>
            <th style={{ padding: '12px 14px', color: '#ef4444' }}>Deuda Fruta Edison</th>
            <th style={{ padding: '12px 14px', color: '#22c55e' }}>Flete Macareo</th>
            <th onClick={() => handleOrdenar('total_facturado_cliente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Facturado Innovative {renderIconoOrden('total_facturado_cliente')}
            </th>
            <th onClick={() => handleOrdenar('saldo_pendiente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Saldo Innovative {renderIconoOrden('saldo_pendiente')}
            </th>
            <th onClick={() => handleOrdenar('margen_bruto')} style={{ padding: '12px 14px', cursor: 'pointer' }}>
              Margen {renderIconoOrden('margen_bruto')}
            </th>
            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Fila de Pedidos Solicitados / En Ruta */}
          {pedidosPendientes.map((p) => {
            const costoFleteTotal = Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000);
            const costoFrutaTotal = Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000);
            const fletePago = p.flete_pagado;
            const frutaPaga = p.fruta_pagada;
            const esEnRuta = p.estado_fase === 'en_ruta';

            return (
              <tr 
                key={p.id} 
                style={{ 
                  borderBottom: `1px solid ${tema.rowBorder}`, 
                  background: esEnRuta ? 'rgba(56, 189, 248, 0.08)' : 'rgba(234, 179, 8, 0.08)', 
                  borderLeft: `4px solid ${esEnRuta ? '#38bdf8' : '#eab308'}` 
                }}
              >
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <Clock size={16} color={esEnRuta ? '#38bdf8' : '#eab308'} />
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: esEnRuta ? '#38bdf8' : '#eab308' }}>
                  #{p.consecutivo}
                  <div style={{ fontSize: '10px', fontWeight: '800', color: esEnRuta ? '#38bdf8' : '#eab308', marginTop: '2px' }}>
                    {esEnRuta ? '🚚 EN RUTA' : '🟡 SOLICITADO'}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: tema.textMuted }}>{p.fecha_pedido}</td>
                <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{p.cajas} cajas</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '11px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', fontWeight: 'bold' }}>
                    ⏳ Por pesar
                  </span>
                </td>
                
                {/* Fruta Edison */}
                <td style={{ padding: '12px 14px' }}>
                  {frutaPaga ? (
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                      ✅ Paga ({formatoCOP(p.monto_fruta_pagado || costoFrutaTotal)})
                    </span>
                  ) : (
                    <button 
                      onClick={() => abrirModalFruta(p)} 
                      style={{ padding: '4px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Pagar {formatoCOP(costoFrutaTotal)}
                    </button>
                  )}
                </td>

                {/* Flete Macareo */}
                <td style={{ padding: '12px 14px' }}>
                  {fletePago ? (
                    <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                      ✅ Pago ({formatoCOP(p.monto_flete_pagado || costoFleteTotal)})
                    </span>
                  ) : (
                    <button 
                      onClick={() => abrirModalFlete(p)} 
                      style={{ padding: '4px 8px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Pagar {formatoCOP(costoFleteTotal)}
                    </button>
                  )}
                </td>

                <td style={{ padding: '12px 14px', color: tema.textMuted }}>Báscula pendiente</td>
                <td style={{ padding: '12px 14px', color: '#eab308', fontWeight: 'bold' }}>Por cobrar</td>
                <td style={{ padding: '12px 14px', color: tema.textMuted }}>-</td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button 
                      onClick={() => abrirModalEditarPedido(p)} 
                      title="Editar pedido" 
                      style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit2 size={12} color="#38bdf8" />
                    </button>
                    <button 
                      onClick={() => iniciarLiquidacionPedido(p)} 
                      style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <CheckCheck size={14} /> Recibir báscula
                    </button>
                    <button 
                      onClick={() => cancelarPedido(p.id)} 
                      style={{ padding: '6px 8px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {/* Fila de Despachos Oficiales */}
          {enviosFiltrados.map((r) => {
            const saldo = Number(r.saldo_pendiente || 0);
            const estaSeleccionado = seleccionadosTabla.includes(r.id);
            const infoEd = obtenerEstadoEdison(r);

            return (
              <tr 
                key={r.id} 
                style={{ 
                  borderBottom: `1px solid ${tema.rowBorder}`, 
                  background: estaSeleccionado ? 'rgba(56, 189, 248, 0.08)' : 'transparent' 
                }}
              >
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div onClick={() => toggleSeleccionFila(r.id)} style={{ cursor: 'pointer' }}>
                    {estaSeleccionado ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>
                  #{r.consecutivo}
                  <div style={{ fontSize: '10px', color: saldo > 0 ? '#f97316' : '#22c55e' }}>
                    {saldo > 0 ? 'EN CARTERA' : 'SALDADO'}
                  </div>
                </td>
                <td style={{ padding: '12px 14px', color: tema.textMuted }}>{r.fecha_envio}</td>
                <td style={{ padding: '12px 14px' }}>{r.cajas}</td>
                <td style={{ padding: '12px 14px' }}>{r.kilos} Kg</td>

                {/* Deuda Fruta Edison */}
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <b style={{ color: infoEd.estaSaldado ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
                      {infoEd.estaSaldado ? '✅ Saldado' : formatoCOP(infoEd.saldoPendiente)}
                    </b>
                    {!infoEd.estaSaldado && (
                      <button
                        onClick={() => {
                          setProvSeleccionadoId(proveedores.find(p => p.tipo !== 'transporte')?.id || '');
                          setDespachosProvSeleccionados([r.id]);
                          setFechaPagoProv(new Date().toISOString().split('T')[0]);
                          setNotasPagoProv(`Abono fruta despacho #${r.consecutivo}`);
                          setModalPagoProvAbierto(true);
                        }}
                        style={{ padding: '3px 6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Abonar
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
                    Total: {formatoCOP(infoEd.costoFrutaTotal)} ({formatoCOP(r.precio_compra_kg)}/Kg)
                  </div>
                </td>

                {/* Flete Macareo */}
                <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: 'bold' }}>
                  {formatoCOP(r.total_flete)}
                </td>

                <td style={{ padding: '12px 14px', fontWeight: '600' }}>{formatoCOP(r.total_facturado_cliente)}</td>
                <td style={{ padding: '12px 14px', fontWeight: 'bold', color: saldo > 0 ? '#f97316' : '#22c55e' }}>{formatoCOP(saldo)}</td>
                <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: '600' }}>{formatoCOP(r.margen_bruto)}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button 
                      onClick={() => abrirModalEditarDespacho(r)} 
                      style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Edit2 size={12} color="#38bdf8" />
                    </button>
                    <button 
                      onClick={() => abrirModalCuentaSeguro(r)} 
                      style={{ padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <FileText size={13} /> Cuenta
                    </button>
                    <button 
                      onClick={() => compartirPDFWhatsApp(r)} 
                      style={{ padding: '6px 10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Share2 size={13} /> PDF
                    </button>
                    {saldo > 0 ? (
                      <button 
                        onClick={() => abrirModalAbono(r)} 
                        style={{ padding: '6px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        <DollarSign size={13} /> Abono
                      </button>
                    ) : (
                      <button 
                        onClick={() => abrirModalHistorial(r)} 
                        style={{ padding: '5px 8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        <CheckCircle2 size={13} /> Pagado
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}