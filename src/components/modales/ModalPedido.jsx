import React from 'react';
import { X } from 'lucide-react';
import { formatoCOP } from '../../hooks/useFinanzas';

export default function ModalPedido({
  modalNuevoPedido,
  setModalNuevoPedido,
  formPedido,
  setFormPedido,
  guardarNuevoPedido,
  tema,
  PRECIOS_COMPRA,
  TARIFAS_FLETE
}) {
  if (!modalNuevoPedido) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Nuevo Pedido Solicitado</h3>
          <button onClick={() => setModalNuevoPedido(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={guardarNuevoPedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Consecutivo</label>
              <input required value={formPedido.consecutivo} onChange={(e) => setFormPedido({...formPedido, consecutivo: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha Pedido</label>
              <input type="date" required value={formPedido.fecha_pedido} onChange={(e) => setFormPedido({...formPedido, fecha_pedido: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#eab308' }}>Número de Cajas *</label>
            <input type="number" step="any" required placeholder="0" autoFocus value={formPedido.cajas} onChange={(e) => setFormPedido({...formPedido, cajas: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#eab308', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Compra/Kg Edison</label>
              <select value={formPedido.precio_compra_kg} onChange={(e) => setFormPedido({...formPedido, precio_compra_kg: Number(e.target.value)})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px' }}>
                {PRECIOS_COMPRA.map(p => <option key={p} value={p}>{formatoCOP(p)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Flete/Caja Macareo</label>
              <select value={formPedido.costo_flete_caja} onChange={(e) => setFormPedido({...formPedido, costo_flete_caja: Number(e.target.value)})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px' }}>
                {TARIFAS_FLETE.map(t => <option key={t} value={t}>{formatoCOP(t)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: tema.textMuted }}>Notas</label>
            <input value={formPedido.notas} onChange={(e) => setFormPedido({...formPedido, notas: e.target.value})} placeholder="Ej: 4 maduro, 2 pintón" style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setModalNuevoPedido(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#eab308', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
}