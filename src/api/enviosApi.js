import { supabase } from '../supabase';

export const enviosApi = {
  // Obtener despachos desde la vista consolidada
  async obtenerEnvios() {
    const { data, error } = await supabase
      .from('v_resumen_envios')
      .select('*')
      .order('consecutivo', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Liquidar báscula y crear despacho oficial
  async liquidarDespacho(datos) {
    const { data, error } = await supabase
      .from('envios')
      .insert([{
        consecutivo: datos.consecutivo,
        fecha_envio: datos.fecha_envio,
        cajas: Number(datos.cajas),
        kilos: Number(datos.kilos),
        precio_compra_kg: Number(datos.precio_compra_kg),
        precio_venta_kg: Number(datos.precio_venta_kg || 11200),
        costo_flete_caja: 32000,
        notas: datos.notas || ''
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  // Actualizar un despacho existente
  async actualizarDespacho(id, cambios) {
    const { data, error } = await supabase
      .from('envios')
      .update(cambios)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  // Actualizar precio de compra de Edison rápidamente
  async actualizarPrecioCompra(id, nuevoPrecio) {
    const { data, error } = await supabase
      .from('envios')
      .update({ precio_compra_kg: Number(nuevoPrecio) })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  }
};