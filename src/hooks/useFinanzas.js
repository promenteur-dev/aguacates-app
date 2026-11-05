import { useState, useEffect, useMemo, useCallback } from 'react';
import { enviosApi } from '../api/enviosApi';
import { pedidosApi } from '../api/pedidosApi';
import { tesoreriaApi } from '../api/tesoreriaApi';

export const formatoCOP = (val) => '$' + Math.round(Number(val || 0)).toLocaleString('es-CO');

export function useFinanzas() {
  const [envios, setEnvios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [pagosProveedores, setPagosProveedores] = useState([]);
  const [abonosCliente, setAbonosCliente] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [dataEnv, dataPed, dataProv, dataPagos, dataAbonos] = await Promise.all([
        enviosApi.obtenerEnvios(),
        pedidosApi.obtenerPedidos(),
        tesoreriaApi.obtenerProveedores(),
        tesoreriaApi.obtenerPagosProveedores(),
        tesoreriaApi.obtenerAbonosCliente()
      ]);

      setEnvios(dataEnv);
      setPedidos(dataPed);
      setProveedores(dataProv);
      setPagosProveedores(dataPagos);
      setAbonosCliente(dataAbonos);
    } catch (err) {
      console.error('Error cargando finanzas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cálculo individual de deuda de fruta por despacho a Edison
  const obtenerEstadoEdison = useCallback((envio) => {
    const costoFrutaTotal = Number(
      envio.total_compra_fruta || (Number(envio.cajas || 0) * 25 * Number(envio.precio_compra_kg || 6000))
    );
    const pagadoAbonos = pagosProveedores
      .filter(p => p.envio_id === envio.id && p.concepto === 'fruta')
      .reduce((sum, p) => sum + Number(p.monto || 0), 0);
    const saldoPendiente = Math.max(0, costoFrutaTotal - pagadoAbonos);

    return {
      costoFrutaTotal,
      pagadoAbonos,
      saldoPendiente,
      estaSaldado: saldoPendiente <= 0
    };
  }, [pagosProveedores]);

  // Consolidado total deuda Edison
  const deudaEdison = useMemo(() => {
    const totalCostoFruta = envios.reduce((acc, e) => acc + Number(e.total_compra_fruta || 0), 0);
    const pagadoFruta = pagosProveedores
      .filter(p => p.concepto === 'fruta')
      .reduce((acc, p) => acc + Number(p.monto || 0), 0);
    const frutaPedidosPendientes = pedidos
      .filter(p => p.estado !== 'liquidado' && !p.fruta_pagada)
      .reduce((sum, p) => sum + (Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000)), 0);

    return Math.max(0, totalCostoFruta - pagadoFruta) + frutaPedidosPendientes;
  }, [envios, pagosProveedores, pedidos]);

  // Consolidado total deuda Macareo (calculado estrictamente sobre $20.000 por caja)
  const deudaMacareo = useMemo(() => {
    const totalCostoFleteReal = envios.reduce((acc, e) => acc + (Number(e.cajas || 0) * 20000), 0);
    const pagadoFlete = pagosProveedores
      .filter(p => p.concepto === 'transporte')
      .reduce((acc, p) => acc + Number(p.monto || 0), 0);
    const fletesPedidosPendientes = pedidos
      .filter(p => p.estado !== 'liquidado' && !p.flete_pagado)
      .reduce((sum, p) => sum + (Number(p.cajas || 0) * 20000), 0);

    return Math.max(0, totalCostoFleteReal - pagadoFlete) + fletesPedidosPendientes;
  }, [envios, pagosProveedores, pedidos]);

  // Consecutivo inteligente
  const calcularSiguienteConsecutivo = useCallback(() => {
    let max = 0;
    envios.forEach(e => {
      const num = parseInt(String(e?.consecutivo || '').replace(/\D/g, ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    pedidos.forEach(p => {
      const num = parseInt(String(p?.consecutivo || '').replace(/\D/g, ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    return String((max || 596) + 1).padStart(6, '0');
  }, [envios, pedidos]);

  return {
    envios,
    pedidos,
    proveedores,
    pagosProveedores,
    abonosCliente,
    loading,
    cargarDatos,
    deudaEdison,
    deudaMacareo,
    obtenerEstadoEdison,
    calcularSiguienteConsecutivo
  };
}