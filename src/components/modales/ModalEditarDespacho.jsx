import React from 'react';
import { X } from 'lucide-react';

export default function ModalEditarDespacho({
  modalEditarDespachoCompleto,
  setModalEditarDespachoCompleto,
  formEdicion,
  setFormEdicion,
  guardarEdicionDespacho,
  tema
}) {
  if (!modalEditarDespachoCompleto) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Editar Despacho #{formEdicion.consecutivo}</h3>
          <button onClick={() => setModalEditarDespachoCompleto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <form onSubmit={guardarEdicionDespacho} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Cajas</label>
              <input type="number" step="any" required value={formEdicion.cajas} onChange={(e) => setFormEdicion({...formEdicion, cajas: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Kilos</label>
              <input type="number" step="any" required value={formEdicion.kilos} onChange={(e) => setFormEdicion({...formEdicion, kilos: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Compra/Kg Edison</label>
              <input type="number" required value={formEdicion.precio_compra_kg} onChange={(e) => setFormEdicion({...formEdicion, precio_compra_kg: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#ef4444', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Venta/Kg Innovative</label>
              <input type="number" required value={formEdicion.precio_venta_kg} onChange={(e) => setFormEdicion({...formEdicion, precio_venta_kg: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setModalEditarDespachoCompleto(false)} style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 16px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}