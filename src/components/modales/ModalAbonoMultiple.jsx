import React from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { formatoCOP } from '../../hooks/useFinanzas';

export default function ModalAbonoMultiple({
  modalAbonoMultipleAbierto,
  setModalAbonoMultipleAbierto,
  guardarAbonoMultiple,
  despachosPendientesCliente,
  cuentasSeleccionadasModal,
  toggleSeleccionCuentaModal,
  montoRealRecibido,
  setMontoRealRecibido,
  totalSeleccionadoAbonoMultiple,
  diferenciaDescuento,
  esDescuentoDefinitivo,
  setEsDescuentoDefinitivo,
  tema
}) {
  if (!modalAbonoMultipleAbierto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '480px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pago Conjunto Innovative</h3>
          <button onClick={() => setModalAbonoMultipleAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={guardarAbonoMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {despachosPendientesCliente.map(e => {
              const seleccionada = cuentasSeleccionadasModal.includes(e.id);
              return (
                <div key={e.id} onClick={() => toggleSeleccionCuentaModal(e.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', border: `1px solid ${seleccionada ? '#0284c7' : tema.border}`, background: seleccionada ? 'rgba(2, 132, 199, 0.15)' : tema.inputBg, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {seleccionada ? <CheckSquare size={16} color="#0284c7" /> : <Square size={16} color={tema.textMuted} />}
                    <span>#{e.consecutivo} ({e.fecha_envio})</span>
                  </div>
                  <b style={{ color: '#f97316' }}>{formatoCOP(e.saldo_pendiente)}</b>
                </div>
              );
            })}
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e' }}>Monto Real Transferido por Innovative:</label>
            <input type="number" step="any" value={montoRealRecibido} onChange={(e) => setMontoRealRecibido(e.target.value)} placeholder={String(totalSeleccionadoAbonoMultiple)} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${diferenciaDescuento > 0 ? '#f97316' : tema.inputBorder}`, color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          {diferenciaDescuento > 0 && (
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #f97316', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316', fontWeight: 'bold', marginBottom: '4px' }}>
                <span>Diferencia por bajas / merma:</span>
                <span>-{formatoCOP(diferenciaDescuento)}</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={esDescuentoDefinitivo} onChange={(e) => setEsDescuentoDefinitivo(e.target.checked)} />
                <span>Absorber diferencia y saldar cuentas a $0</span>
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setModalAbonoMultipleAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={cuentasSeleccionadasModal.length === 0} style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar Pago</button>
          </div>
        </form>
      </div>
    </div>
  );
}