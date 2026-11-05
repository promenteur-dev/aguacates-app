import { supabase } from '../supabase';

export const tesoreriaApi = {
  // Proveedores
  async obtenerProveedores() {
    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('tipo');
    if (error) throw error;
    return data || [];
  },

  // Historial de pagos a proveedores (Edison / Macareo)
  async obtenerPagosProveedores() {
    const { data, error } = await supabase
      .from('pagos_proveedor')
      .select('*')
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Registrar pago individual o masivo a proveedor
  async registrarPagoProveedor(pagos) {
    const payload = Array.isArray(pagos) ? pagos : [pagos];
    const { data, error } = await supabase
      .from('pagos_proveedor')
      .insert(payload)
      .select();
    if (error) throw error;
    return data;
  },

  // Historial de abonos recibidos de Innovative Kitchen
  async obtenerAbonosCliente() {
    const { data, error } = await supabase
      .from('abonos_cliente')
      .select('*')
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Registrar abono individual o masivo de Innovative
  async registrarAbonoCliente(abonos) {
    const payload = Array.isArray(abonos) ? abonos : [abonos];
    const { data, error } = await supabase
      .from('abonos_cliente')
      .insert(payload)
      .select();
    if (error) throw error;
    return data;
  }
};