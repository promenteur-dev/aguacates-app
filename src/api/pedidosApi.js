import { supabase } from '../supabase';

export const pedidosApi = {
  // Obtener pedidos ordenados
  async obtenerPedidos() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_pedido', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // Crear nuevo pedido
  async crearPedido(pedido) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        consecutivo: pedido.consecutivo,
        fecha_pedido: pedido.fecha_pedido,
        cajas: Number(pedido.cajas),
        precio_compra_kg: Number(pedido.precio_compra_kg || 6000),
        precio_venta_kg: Number(pedido.precio_venta_kg || 11200),
        costo_flete_caja: Number(pedido.costo_flete_caja || 20000),
        notas: pedido.notas || '',
        estado_fase: 'solicitado',
        flete_pagado: Boolean(pedido.flete_pagado),
        monto_flete_pagado: Number(pedido.monto_flete_pagado || 0),
        fruta_pagada: false,
        monto_fruta_pagado: 0
      }])
      .select();
    if (error) throw error;
    return data;
  },

  // Actualizar pedido
  async actualizarPedido(id, cambios) {
    const { data, error } = await supabase
      .from('pedidos')
      .update(cambios)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  // Eliminar pedido
  async eliminarPedido(id) {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
