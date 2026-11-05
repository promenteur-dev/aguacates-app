import React from 'react';
import { X } from 'lucide-react';

export default function ModalEditarPedido({
  modalEditarPedido,
  setModalEditarPedido,
  formEditarPed,
  setFormEditarPed,
  guardarEdicionPedido,
  tema
}) {
  if (!modalEditarPedido) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Editar Pedido #{formEditarPed.consecutivo}</h3>
          <button onClick={() => setModalEditarPedido(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={guardarEdicionPedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Consecutivo</label>
              <input required value={formEditarPed.consecutivo} onChange={(e) => setFormEditarPed({...formEditarPed, consecutivo: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha Pedido</label>
              <input type="date" required value={formEditarPed.fecha_pedido} onChange={(e) => setFormEditarPed({...formEditarPed, fecha_pedido: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#eab308' }}>Número de Cajas</label>
            <input type="number" step="any" required value={formEditarPed.cajas} onChange={(e) => setFormEditarPed({...formEditarPed, cajas: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#eab308', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Compra/Kg Edison</label>
              <input type="number" required value={formEditarPed.precio_compra_kg} onChange={(e) => setFormEditarPed({...formEditarPed, precio_compra_kg: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#ef4444', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Flete/Caja Macareo</label>
              <input type="number" required value={formEditarPed.costo_flete_caja} onChange={(e) => setFormEditarPed({...formEditarPed, costo_flete_caja: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#22c55e', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: tema.textMuted }}>Notas</label>
            <input value={formEditarPed.notas} onChange={(e) => setFormEditarPed({...formEditarPed, notas: e.target.value})} placeholder="Observaciones..." style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setModalEditarPedido(null)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}