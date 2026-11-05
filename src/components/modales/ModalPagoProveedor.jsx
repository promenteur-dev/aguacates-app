import React from 'react';
import { X, CheckSquare, Square } from 'lucide-react';
import { formatoCOP } from '../../hooks/useFinanzas';

export default function ModalPagoProveedor({
  modalPagoProvAbierto,
  setModalPagoProvAbierto,
  guardarPagoProveedorMultiple,
  provSeleccionadoId,
  setProvSeleccionadoId,
  setDespachosProvSeleccionados,
  despachosProvSeleccionados,
  toggleSeleccionDespachoProv,
  proveedores,
  despachosPendientesParaProveedor,
  totalSeleccionadoPagoProv,
  tema,
  darkMode
}) {
  if (!modalPagoProvAbierto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '480px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Registrar Pago a Proveedor</h3>
          <button onClick={() => setModalPagoProvAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={guardarPagoProveedorMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: tema.textMuted }}>Seleccionar Proveedor</label>
            <select value={provSeleccionadoId} onChange={(e) => { setProvSeleccionadoId(e.target.value); setDespachosProvSeleccionados([]); }} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontWeight: 'bold' }}>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} ({p.tipo === 'transporte' ? 'Fletes Macareo' : 'Fruta Edison'})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: tema.textMuted }}>Despachos Pendientes de Pago</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', marginTop: '4px' }}>
              {despachosPendientesParaProveedor.map(e => {
                const sel = despachosProvSeleccionados.includes(e.id);
                return (
                  <div key={e.id} onClick={() => toggleSeleccionDespachoProv(e.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', border: `1px solid ${sel ? '#dc2626' : tema.border}`, background: sel ? 'rgba(220, 38, 38, 0.15)' : tema.inputBg, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {sel ? <CheckSquare size={16} color="#dc2626" /> : <Square size={16} color={tema.textMuted} />}
                      <span>#{e.consecutivo} ({e.fecha_envio})</span>
                    </div>
                    <b style={{ color: '#ef4444' }}>{formatoCOP(e.saldoPendienteProv)}</b>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: darkMode ? '#0b1120' : '#f8fafc', borderRadius: '8px', border: `1px solid ${tema.border}` }}>
            <span>Total a Transferir:</span>
            <b style={{ color: '#ef4444', fontSize: '18px' }}>{formatoCOP(totalSeleccionadoPagoProv)}</b>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={() => setModalPagoProvAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={despachosProvSeleccionados.length === 0} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar Pago</button>
          </div>
        </form>
      </div>
    </div>
  );
}