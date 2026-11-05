import React from 'react';
import { X } from 'lucide-react';
import { formatoCOP } from '../../hooks/useFinanzas';

export default function ModalLiquidacion({
  modalLiquidarPedido,
  setModalLiquidarPedido,
  formLiquidar,
  setFormLiquidar,
  confirmarLiquidacionPedido,
  tema,
  darkMode
}) {
  if (!modalLiquidarPedido) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
      <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Confirmar Báscula Innovative</h3>
          <button onClick={() => setModalLiquidarPedido(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Cajas:</span> <b>{modalLiquidarPedido.cajas} cajas</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Flete a Cobrar a Innovative:</span>
            <b style={{ color: '#22c55e' }}>$32.000 / caja ({formatoCOP(Number(modalLiquidarPedido.cajas) * 32000)})</b>
          </div>
        </div>

        <form onSubmit={confirmarLiquidacionPedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Consecutivo</label>
              <input required value={formLiquidar.consecutivo} onChange={(e) => setFormLiquidar({...formLiquidar, consecutivo: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha Recepción</label>
              <input type="date" required value={formLiquidar.fecha_envio} onChange={(e) => setFormLiquidar({...formLiquidar, fecha_envio: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e' }}>Kilos Netos Cantados por Innovative *</label>
            <input type="number" step="any" required placeholder="Ej: 148.50" autoFocus value={formLiquidar.kilos} onChange={(e) => setFormLiquidar({...formLiquidar, kilos: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: '1px solid #22c55e', color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={() => setModalLiquidarPedido(null)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Despacho Oficial</button>
          </div>
        </form>
      </div>
    </div>
  );
}