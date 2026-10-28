import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { 
  Package, TrendingUp, AlertCircle, RefreshCw, Moon, Sun, X, 
  BarChart3, ListFilter, Search, DollarSign, CheckCircle2, 
  ArrowUpRight, Truck, Check, Edit2, FileText, Printer, Send, CheckSquare, Square,
  ArrowUpDown, ArrowUp, ArrowDown, Download, Trash2, Clock, CheckCheck, Fingerprint, Scale, Lock, Coins
} from 'lucide-react';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorBiometria, setErrorBiometria] = useState('');

  const [esMovil, setEsMovil] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [envios, setEnvios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [pagosProveedores, setPagosProveedores] = useState([]);
  const [abonosCliente, setAbonosCliente] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [modalEditarPedido, setModalEditarPedido] = useState(null);
  const [modalLiquidarPedido, setModalLiquidarPedido] = useState(null);
  const [modalPagarFletePedido, setModalPagarFletePedido] = useState(null);
  const [modalPagarFrutaPedido, setModalPagarFrutaPedido] = useState(null);
  const [modalAbonoAbierto, setModalAbonoAbierto] = useState(false);
  const [modalAbonoMultipleAbierto, setModalAbonoMultipleAbierto] = useState(false);
  const [modalPagoProvAbierto, setModalPagoProvAbierto] = useState(false);
  const [modalEditarPrecioCompra, setModalEditarPrecioCompra] = useState(null);
  const [modalEditarDespachoCompleto, setModalEditarDespachoCompleto] = useState(null);
  const [modalHistorialAbonos, setModalHistorialAbonos] = useState(null);
  const [modalCuentaCobro, setModalCuentaCobro] = useState(null);

  const [seleccionadosTabla, setSeleccionadosTabla] = useState([]);

  // Estados Abonos
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [fechaAbono, setFechaAbono] = useState(new Date().toISOString().split('T')[0]);

  const [cuentasSeleccionadasModal, setCuentasSeleccionadasModal] = useState([]);
  const [fechaAbonoMultiple, setFechaAbonoMultiple] = useState(new Date().toISOString().split('T')[0]);
  const [notasAbonoMultiple, setNotasAbonoMultiple] = useState('');
  const [montoRealRecibido, setMontoRealRecibido] = useState('');
  const [esDescuentoDefinitivo, setEsDescuentoDefinitivo] = useState(true);

  // Formulario Flete Pedido (Macareo)
  const [formFletePedido, setFormFletePedido] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Formulario Fruta Pedido (Edison)
  const [formFrutaPedido, setFormFrutaPedido] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  // Formulario Liquidación
  const [formLiquidar, setFormLiquidar] = useState({
    consecutivo: '',
    fecha_envio: new Date().toISOString().split('T')[0],
    kilos: '',
    flete_cliente_caja: 32000,
    notas: ''
  });

  // Formulario Editar Pedido
  const [formEditarPed, setFormEditarPed] = useState({
    id: '',
    consecutivo: '',
    fecha_pedido: '',
    cajas: '',
    precio_compra_kg: 6000,
    costo_flete_caja: 20000,
    notas: ''
  });

  const [formPedido, setFormPedido] = useState({
    fecha_pedido: new Date().toISOString().split('T')[0],
    cajas: '',
    precio_compra_kg: 6000,
    precio_venta_kg: 11200,
    costo_flete_caja: 20000,
    notas: '',
    consecutivo: ''
  });

  const [formEdicion, setFormEdicion] = useState({
    id: '',
    consecutivo: '',
    fecha_envio: '',
    cajas: '',
    kilos: '',
    precio_compra_kg: '',
    precio_venta_kg: '',
    costo_flete_caja: '',
    notas: ''
  });

  const [provSeleccionadoId, setProvSeleccionadoId] = useState('');
  const [despachosProvSeleccionados, setDespachosProvSeleccionados] = useState([]);
  const [fechaPagoProv, setFechaPagoProv] = useState(new Date().toISOString().split('T')[0]);
  const [notasPagoProv, setNotasPagoProv] = useState('');

  const [darkMode, setDarkMode] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('registros');

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');

  // Ordenamiento
  const [columnaOrden, setColumnaOrden] = useState('consecutivo');
  const [direccionOrden, setDireccionOrden] = useState('desc');

  // Gráfico Run Chart
  const [agrupacionRunChart, setAgrupacionRunChart] = useState('mes');
  const [seriesVisibles, setSeriesVisibles] = useState({
    venta: true,
    costoFruta: true,
    margen: true
  });

  const PRECIOS_COMPRA = [6000, 6500, 7000, 7500, 8000, 8500, 9000];
  const PRECIOS_VENTA = [9500, 10000, 10200, 10500, 11000, 11200, 11500, 12000, 15750];
  const TARIFAS_FLETE = [20000, 30000, 32000, 35000];

  useEffect(() => {
    const sesion = sessionStorage.getItem('aguacates_auth_ok');
    if (sesion === 'true') {
      setAutenticado(true);
      cargarDatos();
    }
  }, []);

  async function activarHuellaBiometrica() {
    setErrorBiometria('');
    try {
      if (window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        const cred = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "Aguacates & Tesorería" },
            user: {
              id: new Uint8Array([1, 2, 3, 4]),
              name: "elkinbt@gmail.com",
              displayName: "Elkin Bohorquez"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: { userVerification: "required" },
            timeout: 60000
          }
        });

        if (cred) {
          sessionStorage.setItem('aguacates_auth_ok', 'true');
          setAutenticado(true);
          cargarDatos();
          return;
        }
      }
      throw new Error('Sin biometria');
    } catch (err) {
      setErrorBiometria('Usa tu PIN de acceso.');
    }
  }

  function desbloquearConPin(e) {
    e.preventDefault();
    if (pinInput === '7227' || pinInput === '0000') {
      sessionStorage.setItem('aguacates_auth_ok', 'true');
      setAutenticado(true);
      cargarDatos();
    } else {
      setErrorBiometria('PIN incorrecto.');
      setPinInput('');
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem('aguacates_auth_ok');
    setAutenticado(false);
    setPinInput('');
  }

  function calcularSiguienteConsecutivo(listaEnvios, listaPedidos) {
    const numerosEnvios = (listaEnvios || []).map(e => parseInt(String(e.consecutivo || '').replace(/\D/g, '') || '0', 10));
    const numerosPedidos = (listaPedidos || []).map(p => parseInt(String(p.consecutivo || '').replace(/\D/g, '') || '0', 10));
    const maximo = Math.max(...numerosEnvios, ...numerosPedidos, 0);
    return String(maximo + 1).padStart(6, '0');
  }

  async function cargarDatos() {
    setLoading(true);

    const { data: dataEnvios } = await supabase
      .from('v_resumen_envios')
      .select('*')
      .order('consecutivo', { ascending: false });

    if (dataEnvios) setEnvios(dataEnvios);

    const { data: dataPedidos } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha_pedido', { ascending: true });

    if (dataPedidos) setPedidos(dataPedidos);

    const { data: dataProv } = await supabase.from('proveedores').select('*').order('tipo');
    if (dataProv) {
      setProveedores(dataProv);
      if (dataProv.length > 0 && !provSeleccionadoId) {
        setProvSeleccionadoId(dataProv[0].id);
      }
    }

    const { data: dataPagos } = await supabase.from('pagos_proveedor').select('*');
    if (dataPagos) setPagosProveedores(dataPagos);

    const { data: dataAbonos } = await supabase.from('abonos_cliente').select('*');
    if (dataAbonos) setAbonosCliente(dataAbonos);

    setLoading(false);
  }

  function handleOrdenar(columna) {
    if (columnaOrden === columna) {
      setDireccionOrden(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setColumnaOrden(columna);
      setDireccionOrden('asc');
    }
  }

  function toggleSeleccionFila(id) {
    setSeleccionadosTabla(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  function toggleSeleccionarTodoTabla(listaIds) {
    if (seleccionadosTabla.length === listaIds.length) {
      setSeleccionadosTabla([]);
    } else {
      setSeleccionadosTabla(listaIds);
    }
  }

  function exportarCSV() {
    const dataAExportar = seleccionadosTabla.length > 0
      ? envios.filter(e => seleccionadosTabla.includes(e.id))
      : enviosFiltrados;

    if (dataAExportar.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const encabezados = ['Consecutivo', 'Fecha', 'Cajas', 'Kilos', 'Precio Compra/Kg', 'Precio Venta/Kg', 'Flete/Caja', 'Facturado Cliente', 'Total Abonado', 'Saldo Pendiente', 'Margen Bruto'];
    
    const filas = dataAExportar.map(r => [
      `#${r.consecutivo}`,
      r.fecha_envio,
      r.cajas,
      r.kilos,
      r.precio_compra_kg,
      r.precio_venta_kg,
      r.costo_flete_caja,
      r.total_facturado_cliente,
      r.total_abonado,
      r.saldo_pendiente,
      r.margen_bruto
    ]);

    const contenidoCSV = '\uFEFF' + [encabezados.join(';'), ...filas.map(f => f.join(';'))].join('\n');
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Despachos_Aguacate_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function imprimirConNombre(envio) {
    const tituloOriginal = document.title;
    document.title = `${envio.consecutivo} - Cuenta de cobro - aguacates`;
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
    }, 1000);
  }

  function abrirModalCuentaSeguro(r) {
    const kilos = Number(r.kilos || 0);
    const cajas = Number(r.cajas || 0);
    const precioVenta = Number(r.precio_venta_kg || 11200);
    const fleteCaja = Number(r.costo_flete_caja || 32000);

    const ventaFruta = Number(r.total_venta_fruta) || (kilos * precioVenta);
    const fleteTotal = Number(r.total_flete) || (cajas * fleteCaja);
    const totalFacturado = Number(r.total_facturado_cliente) || (ventaFruta + fleteTotal);

    setModalCuentaCobro({
      ...r,
      total_venta_fruta_calc: ventaFruta,
      total_flete_calc: fleteTotal,
      total_facturado_calc: totalFacturado,
      precio_venta_kg_calc: precioVenta,
      kilos_calc: kilos,
      cajas_calc: cajas
    });
  }

  function enviarWhatsApp(envio) {
    const kilos = Number(envio.kilos_calc || envio.kilos || 0);
    const cajas = Number(envio.cajas_calc || envio.cajas || 0);
    const fruta = Number(envio.total_venta_fruta_calc || envio.total_venta_fruta || (kilos * (envio.precio_venta_kg || 11200)));
    const flete = Number(envio.total_flete_calc || envio.total_flete || (cajas * 32000));
    const total = Number(envio.total_facturado_calc || envio.total_facturado_cliente || (fruta + flete));

    const lineas = [
      `*CUENTA DE COBRO #${envio.consecutivo}*`,
      `📅 Fecha: ${envio.fecha_envio}`,
      `🥑 Concepto: Aguacate Hass - Grueso`,
      `📦 Cantidad: ${kilos} Kg (${cajas} Cajas)`,
      `💵 Fruta: ${formatoCOP(fruta)}`,
      `🚚 Flete (${cajas} cajas @ $32.000): ${formatoCOP(flete)}`,
      `---------------------------------`,
      `💰 *TOTAL A PAGAR: ${formatoCOP(total)}*`,
      `---------------------------------`,
      `💳 *Datos Bancarios:*`,
      `Bancolombia Ahorros # 554 879 253 72`,
      `Elkin Bohórquez Tarud - CC 72.271.189`,
      ``,
      `Quedo atento a la confirmación de la transferencia. ¡Muchas gracias!`
    ];

    const mensajeCompleto = lineas.join('\n');
    const textoCodificado = encodeURIComponent(mensajeCompleto);
    const urlApi = `https://api.whatsapp.com/send?text=${textoCodificado}`;

    window.open(urlApi, '_blank');
  }

  function abrirModalCrearPedido() {
    const proxConsecutivo = calcularSiguienteConsecutivo(envios, pedidos);
    setFormPedido({
      fecha_pedido: new Date().toISOString().split('T')[0],
      cajas: '',
      precio_compra_kg: 6000,
      precio_venta_kg: 11200,
      costo_flete_caja: 20000,
      notas: '',
      consecutivo: proxConsecutivo
    });
    setModalNuevoPedido(true);
  }

  async function guardarNuevoPedido(e) {
    e.preventDefault();
    const { error } = await supabase.from('pedidos').insert([{
      consecutivo: formPedido.consecutivo,
      fecha_pedido: formPedido.fecha_pedido,
      cajas: Number(formPedido.cajas),
      precio_compra_kg: Number(formPedido.precio_compra_kg),
      precio_venta_kg: Number(formPedido.precio_venta_kg),
      costo_flete_caja: Number(formPedido.costo_flete_caja),
      notas: formPedido.notas,
      estado_fase: 'solicitado',
      flete_pagado: false,
      monto_flete_pagado: 0,
      fruta_pagada: false,
      monto_fruta_pagado: 0
    }]);

    if (!error) {
      setModalNuevoPedido(false);
      await cargarDatos();
    } else {
      alert('Error: ' + error.message);
    }
  }

  function abrirModalEditarPedido(pedido) {
    setFormEditarPed({
      id: pedido.id,
      consecutivo: pedido.consecutivo || '',
      fecha_pedido: pedido.fecha_pedido || '',
      cajas: pedido.cajas || '',
      precio_compra_kg: pedido.precio_compra_kg || 6000,
      costo_flete_caja: pedido.costo_flete_caja || 20000,
      notas: pedido.notas || ''
    });
    setModalEditarPedido(pedido);
  }

  async function guardarEdicionPedido(e) {
    e.preventDefault();
    if (!formEditarPed.id) return;

    const { error } = await supabase
      .from('pedidos')
      .update({
        consecutivo: formEditarPed.consecutivo,
        fecha_pedido: formEditarPed.fecha_pedido,
        cajas: Number(formEditarPed.cajas),
        precio_compra_kg: Number(formEditarPed.precio_compra_kg),
        costo_flete_caja: Number(formEditarPed.costo_flete_caja),
        notas: formEditarPed.notas
      })
      .eq('id', formEditarPed.id);

    if (!error) {
      setModalEditarPedido(null);
      await cargarDatos();
    } else {
      alert('Error editando pedido: ' + error.message);
    }
  }

  function abrirModalFlete(pedido) {
    setModalPagarFletePedido(pedido);
    const montoCalculado = Number(pedido.cajas || 0) * Number(pedido.costo_flete_caja || 20000);
    setFormFletePedido({
      monto: pedido.monto_flete_pagado && Number(pedido.monto_flete_pagado) > 0 ? pedido.monto_flete_pagado : montoCalculado,
      fecha: pedido.fecha_pago_flete || new Date().toISOString().split('T')[0]
    });
  }

  async function guardarFletePedido(e) {
    e.preventDefault();
    if (!modalPagarFletePedido) return;

    const { error } = await supabase
      .from('pedidos')
      .update({
        flete_pagado: true,
        monto_flete_pagado: Number(formFletePedido.monto),
        fecha_pago_flete: formFletePedido.fecha,
        estado_fase: 'en_ruta'
      })
      .eq('id', modalPagarFletePedido.id);

    if (!error) {
      setModalPagarFletePedido(null);
      await cargarDatos();
    } else {
      alert('Error guardando flete: ' + error.message);
    }
  }

  function abrirModalFruta(pedido) {
    setModalPagarFrutaPedido(pedido);
    const montoCalculado = Number(pedido.cajas || 0) * 25 * Number(pedido.precio_compra_kg || 6000);
    setFormFrutaPedido({
      monto: pedido.monto_fruta_pagado && Number(pedido.monto_fruta_pagado) > 0 ? pedido.monto_fruta_pagado : montoCalculado,
      fecha: pedido.fecha_pago_fruta || new Date().toISOString().split('T')[0]
    });
  }

  async function guardarFrutaPedido(e) {
    e.preventDefault();
    if (!modalPagarFrutaPedido) return;

    const { error } = await supabase
      .from('pedidos')
      .update({
        fruta_pagada: true,
        monto_fruta_pagado: Number(formFrutaPedido.monto),
        fecha_pago_fruta: formFrutaPedido.fecha
      })
      .eq('id', modalPagarFrutaPedido.id);

    if (!error) {
      setModalPagarFrutaPedido(null);
      await cargarDatos();
    } else {
      alert('Error guardando pago a Edison: ' + error.message);
    }
  }

  function iniciarLiquidacionPedido(pedidoItem) {
    setModalLiquidarPedido(pedidoItem);
    setFormLiquidar({
      consecutivo: pedidoItem.consecutivo || calcularSiguienteConsecutivo(envios, pedidos),
      fecha_envio: pedidoItem.fecha_pedido,
      kilos: '',
      flete_cliente_caja: 32000,
      notas: pedidoItem.notas || ''
    });
  }

  async function confirmarLiquidacionPedido(e) {
    e.preventDefault();
    if (!modalLiquidarPedido || !formLiquidar.kilos || Number(formLiquidar.kilos) <= 0) return;

    const { data: envioCreado, error: errorEnvio } = await supabase.from('envios').insert([{
      consecutivo: formLiquidar.consecutivo,
      fecha_envio: formLiquidar.fecha_envio,
      cajas: Number(modalLiquidarPedido.cajas),
      kilos: Number(formLiquidar.kilos),
      precio_compra_kg: Number(modalLiquidarPedido.precio_compra_kg),
      precio_venta_kg: Number(modalLiquidarPedido.precio_venta_kg || 11200),
      costo_flete_caja: 32000,
      notas: formLiquidar.notas
    }]).select();

    if (!errorEnvio && envioCreado && envioCreado.length > 0) {
      const nuevoId = envioCreado[0].id;

      if (modalLiquidarPedido.flete_pagado) {
        const provMacareo = proveedores.find(p => p.tipo === 'transporte');
        if (provMacareo) {
          await supabase.from('pagos_proveedor').insert([{
            proveedor_id: provMacareo.id,
            envio_id: nuevoId,
            monto: Number(modalLiquidarPedido.monto_flete_pagado || (modalLiquidarPedido.cajas * 20000)),
            fecha: modalLiquidarPedido.fecha_pago_flete || formLiquidar.fecha_envio,
            concepto: 'transporte',
            notas: `Flete Macareo (#${modalLiquidarPedido.consecutivo})`
          }]);
        }
      }

      if (modalLiquidarPedido.fruta_pagada) {
        const provEdison = proveedores.find(p => p.tipo !== 'transporte');
        if (provEdison) {
          await supabase.from('pagos_proveedor').insert([{
            proveedor_id: provEdison.id,
            envio_id: nuevoId,
            monto: Number(modalLiquidarPedido.monto_fruta_pagado || (modalLiquidarPedido.cajas * 25 * modalLiquidarPedido.precio_compra_kg)),
            fecha: modalLiquidarPedido.fecha_pago_fruta || formLiquidar.fecha_envio,
            concepto: 'fruta',
            notas: `Fruta anticipada (#${modalLiquidarPedido.consecutivo})`
          }]);
        }
      }

      await supabase.from('pedidos').update({ estado: 'liquidado', estado_fase: 'liquidado' }).eq('id', modalLiquidarPedido.id);
      setModalLiquidarPedido(null);
      await cargarDatos();
    } else {
      alert('Error liquidando: ' + (errorEnvio?.message || 'Error'));
    }
  }

  async function cancelarPedido(pedidoId) {
    if (!window.confirm('¿Deseas cancelar y eliminar este pedido?')) return;
    await supabase.from('pedidos').delete().eq('id', pedidoId);
    await cargarDatos();
  }

  function abrirModalEditarDespacho(envio) {
    setFormEdicion({
      id: envio.id,
      consecutivo: envio.consecutivo,
      fecha_envio: envio.fecha_envio,
      cajas: envio.cajas,
      kilos: envio.kilos,
      precio_compra_kg: envio.precio_compra_kg,
      precio_venta_kg: envio.precio_venta_kg,
      costo_flete_caja: envio.costo_flete_caja,
      notas: envio.notas || ''
    });
    setModalEditarDespachoCompleto(true);
  }

  async function guardarEdicionDespacho(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('envios')
      .update({
        consecutivo: formEdicion.consecutivo,
        fecha_envio: formEdicion.fecha_envio,
        cajas: Number(formEdicion.cajas),
        kilos: Number(formEdicion.kilos),
        precio_compra_kg: Number(formEdicion.precio_compra_kg),
        precio_venta_kg: Number(formEdicion.precio_venta_kg),
        costo_flete_caja: Number(formEdicion.costo_flete_caja),
        notas: formEdicion.notas
      })
      .eq('id', formEdicion.id);

    if (!error) {
      setModalEditarDespachoCompleto(false);
      await cargarDatos();
    } else {
      alert('Error guardando cambios: ' + error.message);
    }
  }

  function abrirModalHistorial(envio) {
    setModalHistorialAbonos(envio);
  }

  function abrirModalPagoProveedor() {
    setDespachosProvSeleccionados([]);
    setFechaPagoProv(new Date().toISOString().split('T')[0]);
    setNotasPagoProv('Transferencia Bancolombia liquidación');
    setModalPagoProvAbierto(true);
  }

  async function actualizarPrecioCompra(envioId, nuevoPrecio) {
    const { error } = await supabase
      .from('envios')
      .update({ precio_compra_kg: Number(nuevoPrecio) })
      .eq('id', envioId);

    if (!error) {
      setModalEditarPrecioCompra(null);
      await cargarDatos();
    } else {
      alert('Error: ' + error.message);
    }
  }

  function abrirModalAbono(envio) {
    setEnvioSeleccionado(envio);
    setMontoAbono(envio.saldo_pendiente > 0 ? envio.saldo_pendiente : '');
    setFechaAbono(new Date().toISOString().split('T')[0]);
    setModalAbonoAbierto(true);
  }

  function abrirModalAbonoMultiple() {
    const preseleccion = seleccionadosTabla.length > 0 ? seleccionadosTabla : [];
    setCuentasSeleccionadasModal(preseleccion);
    setFechaAbonoMultiple(new Date().toISOString().split('T')[0]);
    setNotasAbonoMultiple('Transferencia Bancolombia pago conjunto');

    const totalEsperado = preseleccion.reduce((acc, id) => {
      const eObj = envios.find(e => e.id === id);
      return acc + Number(eObj?.saldo_pendiente || 0);
    }, 0);

    setMontoRealRecibido(totalEsperado > 0 ? totalEsperado : '');
    setEsDescuentoDefinitivo(true);
    setModalAbonoMultipleAbierto(true);
  }

  function toggleSeleccionCuentaModal(envioId) {
    setCuentasSeleccionadasModal(prev => {
      const nueva = prev.includes(envioId) ? prev.filter(id => id !== envioId) : [...prev, envioId];
      const nuevoTotal = nueva.reduce((acc, id) => {
        const eObj = envios.find(e => e.id === id);
        return acc + Number(eObj?.saldo_pendiente || 0);
      }, 0);
      setMontoRealRecibido(nuevoTotal > 0 ? nuevoTotal : '');
      return nueva;
    });
  }

  function toggleSeleccionDespachoProv(envioId) {
    setDespachosProvSeleccionados(prev => 
      prev.includes(envioId) ? prev.filter(id => id !== envioId) : [...prev, envioId]
    );
  }

  async function guardarAbono(e) {
    e.preventDefault();
    if (!envioSeleccionado || !montoAbono || Number(montoAbono) <= 0) return;

    const { error } = await supabase.from('abonos_cliente').insert([{
      envio_id: envioSeleccionado.id,
      monto: Number(montoAbono),
      fecha: fechaAbono,
      metodo_pago: 'Transferencia',
      notas: `Abono despacho #${envioSeleccionado.consecutivo}`
    }]);

    if (!error) {
      setModalAbonoAbierto(false);
      setEnvioSeleccionado(null);
      await cargarDatos();
    } else {
      alert('Error: ' + error.message);
    }
  }

  async function guardarAbonoMultiple(e) {
    e.preventDefault();
    if (cuentasSeleccionadasModal.length === 0) return;

    const valorReal = Number(montoRealRecibido || totalSeleccionadoAbonoMultiple);
    const diferencia = totalSeleccionadoAbonoMultiple - valorReal;

    let abonosAInsertar = [];

    if (esDescuentoDefinitivo && diferencia > 0) {
      abonosAInsertar = cuentasSeleccionadasModal.map((envioId, idx) => {
        const envioObj = envios.find(e => e.id === envioId);
        const esUltimo = idx === cuentasSeleccionadasModal.length - 1;
        const notaDetalle = esUltimo && diferencia > 0
          ? `${notasAbonoMultiple} (Aplicado descuento por merma/baja de ${formatoCOP(diferencia)})`
          : notasAbonoMultiple;

        return {
          envio_id: envioId,
          monto: Number(envioObj?.saldo_pendiente || 0),
          fecha: fechaAbonoMultiple,
          metodo_pago: 'Transferencia',
          notas: notaDetalle
        };
      });
    } else {
      let remanente = valorReal;
      abonosAInsertar = cuentasSeleccionadasModal.map(envioId => {
        const envioObj = envios.find(e => e.id === envioId);
        const deudaEste = Number(envioObj?.saldo_pendiente || 0);
        const montoParaEste = Math.min(remanente, deudaEste);
        remanente = Math.max(0, remanente - montoParaEste);

        return {
          envio_id: envioId,
          monto: montoParaEste,
          fecha: fechaAbonoMultiple,
          metodo_pago: 'Transferencia',
          notas: notasAbonoMultiple || `Abono parcial (${formatoCOP(valorReal)})`
        };
      }).filter(a => a.monto > 0);
    }

    const { error } = await supabase.from('abonos_cliente').insert(abonosAInsertar);

    if (!error) {
      setModalAbonoMultipleAbierto(false);
      setCuentasSeleccionadasModal([]);
      setSeleccionadosTabla([]);
      await cargarDatos();
    } else {
      alert('Error registrando abono múltiple: ' + error.message);
    }
  }

  async function guardarPagoProveedorMultiple(e) {
    e.preventDefault();
    if (despachosProvSeleccionados.length === 0) return;

    const provSel = proveedores.find(p => p.id === provSeleccionadoId);
    const esFlete = provSel?.tipo === 'transporte';

    const pagosAInsertar = despachosProvSeleccionados.map(envioId => {
      const eObj = envios.find(x => x.id === envioId);
      const pagadoYa = pagosProveedores
        .filter(p => p.envio_id === envioId && (esFlete ? p.concepto === 'transporte' : p.concepto === 'fruta'))
        .reduce((sum, p) => sum + Number(p.monto || 0), 0);

      const costoTotal = esFlete ? Number(eObj?.total_flete || 0) : Number(eObj?.total_compra_fruta || 0);
      const saldoPendienteDespacho = Math.max(0, costoTotal - pagadoYa);

      return {
        proveedor_id: provSeleccionadoId,
        envio_id: envioId,
        monto: saldoPendienteDespacho,
        fecha: fechaPagoProv,
        concepto: esFlete ? 'transporte' : 'fruta',
        notas: notasPagoProv || `Liquidación despacho #${eObj?.consecutivo}`
      };
    });

    const { error } = await supabase.from('pagos_proveedor').insert(pagosAInsertar);

    if (!error) {
      setModalPagoProvAbierto(false);
      setDespachosProvSeleccionados([]);
      await cargarDatos();
    } else {
      alert('Error registrando pago a proveedor: ' + error.message);
    }
  }

  const formatoCOP = (val) => '$' + Math.round(Number(val || 0)).toLocaleString('es-CO');

  const totalCostoFruta = envios.reduce((acc, e) => acc + Number(e.total_compra_fruta || 0), 0);
  const totalCostoFlete = envios.reduce((acc, e) => acc + Number(e.total_flete || 0), 0);

  const pagadoFruta = pagosProveedores
    .filter(p => p.concepto === 'fruta')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const pagadoFlete = pagosProveedores
    .filter(p => p.concepto === 'transporte')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const frutaPedidosPendientes = pedidos
    .filter(p => p.estado !== 'liquidado' && !p.fruta_pagada)
    .reduce((sum, p) => sum + (Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000)), 0);

  const deudaEdison = Math.max(0, totalCostoFruta - pagadoFruta) + frutaPedidosPendientes;
  
  const fletesPedidosPendientes = pedidos
    .filter(p => p.estado !== 'liquidado' && !p.flete_pagado)
    .reduce((sum, p) => sum + (Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000)), 0);

  const deudaMacareo = Math.max(0, totalCostoFlete - pagadoFlete) + fletesPedidosPendientes;

  const despachosPendientesCliente = useMemo(() => {
    return envios.filter(e => Number(e.saldo_pendiente || 0) > 0);
  }, [envios]);

  const totalSeleccionadoAbonoMultiple = useMemo(() => {
    return cuentasSeleccionadasModal.reduce((acc, id) => {
      const eObj = envios.find(e => e.id === id);
      return acc + Number(eObj?.saldo_pendiente || 0);
    }, 0);
  }, [cuentasSeleccionadasModal, envios]);

  const provSeleccionadoObj = useMemo(() => {
    return proveedores.find(p => p.id === provSeleccionadoId);
  }, [proveedores, provSeleccionadoId]);

  const despachosPendientesParaProveedor = useMemo(() => {
    const esFlete = provSeleccionadoObj?.tipo === 'transporte';

    return envios.map(e => {
      const costoObjetivo = esFlete ? Number(e.total_flete || 0) : Number(e.total_compra_fruta || 0);
      const pagadoEsteEnvio = pagosProveedores
        .filter(p => p.envio_id === e.id && (esFlete ? p.concepto === 'transporte' : p.concepto === 'fruta'))
        .reduce((sum, p) => sum + Number(p.monto || 0), 0);
      const saldoPendiente = Math.max(0, costoObjetivo - pagadoEsteEnvio);

      return {
        ...e,
        saldoPendienteProv: saldoPendiente,
        costoObjetivoProv: costoObjetivo
      };
    }).filter(e => e.saldoPendienteProv > 0)
      .sort((a, b) => a.consecutivo.localeCompare(b.consecutivo));
  }, [envios, provSeleccionadoObj, pagosProveedores]);

  const totalSeleccionadoPagoProv = useMemo(() => {
    return despachosProvSeleccionados.reduce((acc, id) => {
      const item = despachosPendientesParaProveedor.find(e => e.id === id);
      return acc + Number(item?.saldoPendienteProv || 0);
    }, 0);
  }, [despachosProvSeleccionados, despachosPendientesParaProveedor]);

  const mesesDisponibles = useMemo(() => {
    const meses = new Set();
    envios.forEach(e => {
      if (e.fecha_envio) meses.add(e.fecha_envio.substring(0, 7));
    });
    return Array.from(meses).sort().reverse();
  }, [envios]);

  const pedidosPendientesConConsecutivo = useMemo(() => {
    const pedidosActivos = pedidos.filter(p => p.estado !== 'liquidado');
    return pedidosActivos.map((p, idx) => {
      let num = p.consecutivo;
      if (!num) {
        let baseNum = envios.length > 0 
          ? Math.max(...envios.map(e => parseInt(String(e.consecutivo || '').replace(/\D/g, '') || '0', 10)), 0)
          : 0;
        num = String(baseNum + idx + 1).padStart(6, '0');
      }
      return {
        ...p,
        consecutivo: num,
        esPedido: true,
        fecha_envio: p.fecha_pedido
      };
    });
  }, [pedidos, envios]);

  const enviosFiltrados = useMemo(() => {
    const filtrados = envios.filter(r => {
      const coincideTexto = r.consecutivo?.toLowerCase().includes(filtroTexto.toLowerCase()) || r.fecha_envio?.includes(filtroTexto);
      const saldo = Number(r.saldo_pendiente || 0);
      let coincideEstado = true;
      if (filtroEstado === 'pendientes') coincideEstado = saldo > 0;
      if (filtroEstado === 'saldados') coincideEstado = saldo <= 0;
      let coincideMes = true;
      if (filtroMes !== 'todos') coincideMes = r.fecha_envio?.startsWith(filtroMes);
      return coincideTexto && coincideEstado && coincideMes;
    });

    return filtrados.sort((a, b) => {
      let valA = a[columnaOrden];
      let valB = b[columnaOrden];

      if (['cajas', 'kilos', 'total_facturado_cliente', 'saldo_pendiente', 'margen_bruto', 'precio_compra_kg'].includes(columnaOrden)) {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      } else {
        valA = String(valA || '');
        valB = String(valB || '');
      }

      if (valA < valB) return direccionOrden === 'asc' ? -1 : 1;
      if (valA > valB) return direccionOrden === 'asc' ? 1 : -1;
      return 0;
    });
  }, [envios, filtroTexto, filtroEstado, filtroMes, columnaOrden, direccionOrden]);

  const enviosParaMetricas = useMemo(() => {
    if (seleccionadosTabla.length > 0) {
      return envios.filter(e => seleccionadosTabla.includes(e.id));
    }
    return enviosFiltrados;
  }, [seleccionadosTabla, envios, enviosFiltrados]);

  const enviosConDeudaCliente = enviosParaMetricas.filter(e => Number(e.saldo_pendiente || 0) > 0).length;
  const totalPorCobrar = enviosParaMetricas.reduce((acc, r) => acc + Number(r.saldo_pendiente || 0), 0);
  const margenTotal = enviosParaMetricas.reduce((acc, r) => acc + Number(r.margen_bruto || 0), 0);
  const totalKilos = enviosParaMetricas.reduce((acc, r) => acc + Number(r.kilos || 0), 0);
  const totalCajas = enviosParaMetricas.reduce((acc, r) => acc + Number(r.cajas || 0), 0);

  // Analítica Enriquecida
  const margenPromedioPorKilo = totalKilos > 0 ? (margenTotal / totalKilos) : 0;
  const totalFacturadoAnalitica = enviosParaMetricas.reduce((acc, r) => acc + Number(r.total_facturado_cliente || 0), 0);
  const porcentajeRentabilidadGlobal = totalFacturadoAnalitica > 0 ? ((margenTotal / totalFacturadoAnalitica) * 100) : 0;
  const costoFrutaTotalAnalitica = enviosParaMetricas.reduce((acc, r) => acc + Number(r.total_compra_fruta || 0), 0);
  const costoPromedioFrutaKg = totalKilos > 0 ? (costoFrutaTotalAnalitica / totalKilos) : 0;
  const totalFleteAnalitica = enviosParaMetricas.reduce((acc, r) => acc + Number(r.total_flete || 0), 0);
  const porcentajeIncidenciaFlete = totalFacturadoAnalitica > 0 ? ((totalFleteAnalitica / totalFacturadoAnalitica) * 100) : 0;
  const gananciaPromedioDespacho = enviosParaMetricas.length > 0 ? (margenTotal / enviosParaMetricas.length) : 0;

  const metricaMerma = useMemo(() => {
    const kilosTeoricosEdison = enviosParaMetricas.reduce((acc, e) => acc + (Number(e.cajas || 0) * 25), 0);
    const kilosRealesBascula = enviosParaMetricas.reduce((acc, e) => acc + Number(e.kilos || 0), 0);
    const kilosDiferencia = kilosTeoricosEdison - kilosRealesBascula;
    const porcentajeMerma = kilosTeoricosEdison > 0 ? ((kilosDiferencia / kilosTeoricosEdison) * 100) : 0;

    return {
      kilosTeoricosEdison,
      kilosRealesBascula,
      kilosDiferencia,
      porcentajeMerma,
      valorDineroMerma: kilosDiferencia * 6000
    };
  }, [enviosParaMetricas]);

  const abonosDelEnvioModal = useMemo(() => {
    if (!modalHistorialAbonos) return [];
    return abonosCliente.filter(a => a.envio_id === modalHistorialAbonos.id);
  }, [modalHistorialAbonos, abonosCliente]);

  // CÁLCULO PARA EL RUN CHART
  const datosGrafico = useMemo(() => {
    const mapa = {};
    enviosFiltrados.forEach(e => {
      let clave = e.fecha_envio;
      let label = e.fecha_envio;

      if (agrupacionRunChart === 'mes') {
        clave = e.fecha_envio.substring(0, 7);
        const [y, m] = clave.split('-');
        const nombresCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        label = `${nombresCortos[parseInt(m, 10) - 1]} ${y}`;
      }
      if (agrupacionRunChart === 'ano') {
        clave = e.fecha_envio.substring(0, 4);
        label = clave;
      }
      if (agrupacionRunChart === 'semana') {
        const d = new Date(e.fecha_envio);
        const inicioAno = new Date(d.getFullYear(), 0, 1);
        const sem = Math.ceil((((d - inicioAno) / 86400000) + inicioAno.getDay() + 1) / 7);
        clave = `${d.getFullYear()}-W${sem}`;
        label = `Sem ${sem}`;
      }

      if (!mapa[clave]) {
        mapa[clave] = { clave, label, venta: 0, margen: 0, costoFruta: 0, kilos: 0, count: 0 };
      }
      mapa[clave].venta += Number(e.total_facturado_cliente || 0);
      mapa[clave].margen += Number(e.margen_bruto || 0);
      mapa[clave].costoFruta += Number(e.total_compra_fruta || 0);
      mapa[clave].kilos += Number(e.kilos || 0);
      mapa[clave].count += 1;
    });

    return Object.values(mapa).sort((a, b) => a.clave.localeCompare(b.clave));
  }, [enviosFiltrados, agrupacionRunChart]);

  const chartWidth = 860;
  const chartHeight = 330;
  const padX = 65;
  const padY = 50;

  const maxGrafico = useMemo(() => {
    let max = 1000000;
    datosGrafico.forEach(d => {
      if (d.venta > max) max = d.venta;
      if (d.costoFruta > max) max = d.costoFruta;
      if (d.margen > max) max = d.margen;
    });
    return max * 1.18;
  }, [datosGrafico]);

  function generarPath(clave) {
    if (datosGrafico.length === 0) return '';
    return datosGrafico.map((d, i) => {
      const x = padX + (i / (datosGrafico.length > 1 ? datosGrafico.length - 1 : 1)) * (chartWidth - padX * 2);
      const y = chartHeight - padY - (d[clave] / maxGrafico) * (chartHeight - padY * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  const tema = darkMode ? {
    bg: '#090d16',
    cardBg: '#131b2e',
    cardHover: '#18223a',
    border: '#1e293b',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    thBg: '#0f172a',
    rowBorder: '#1e293b',
    chartGrid: '#1e293b'
  } : {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardHover: '#f1f5f9',
    border: '#e2e8f0',
    textMain: '#0f172a',
    textMuted: '#64748b',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    thBg: '#f1f5f9',
    rowBorder: '#f1f5f9',
    chartGrid: '#e2e8f0'
  };

  const renderIconoOrden = (columna) => {
    if (columnaOrden !== columna) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
    return direccionOrden === 'asc' ? <ArrowUp size={12} color="#38bdf8" /> : <ArrowDown size={12} color="#38bdf8" />;
  };

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '24px', padding: '36px 24px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🥑</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Aguacates & Tesorería</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px' }}>Identifícate para ingresar</p>

          <button
            onClick={activarHuellaBiometrica}
            style={{ width: '100%', padding: '15px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)' }}
          >
            <Fingerprint size={22} /> Tocar Huella / FaceID
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0', color: '#64748b', fontSize: '11px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e293b' }}></div>
            <span>O DIGITA TU PIN</span>
            <div style={{ flex: 1, height: '1px', background: '#1e293b' }}></div>
          </div>

          <form onSubmit={desbloquearConPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              placeholder="PIN de 4 dígitos"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '8px', fontSize: '22px', fontWeight: 'bold', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }}
            />
            {errorBiometria && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errorBiometria}</span>}
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Ingresar con PIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1280px', margin: '0 auto', background: tema.bg, color: tema.textMain, minHeight: '100vh', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '26px' }}>🥑</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Aguacates & Tesorería</h1>
              <p style={{ margin: '1px 0 0', color: tema.textMuted, fontSize: '11px' }}>Edison • Innovative • Macareo</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {darkMode ? <Sun size={15} color="#eab308" /> : <Moon size={15} color="#64748b" />}
            </button>
            <button onClick={cargarDatos} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={15} />
            </button>
            <button onClick={exportarCSV} title="Exportar CSV" style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={15} />
            </button>
            <button onClick={cerrarSesion} title="Bloquear App" style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={15} />
            </button>
          </div>
        </div>

        {/* BOTONERA ACCIONES */}
        <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(3, auto)', gap: '8px' }}>
          <button 
            onClick={abrirModalCrearPedido}
            style={{ padding: '11px', background: '#eab308', color: '#090d16', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Clock size={16} /> + Pedido
          </button>

          <button 
            onClick={abrirModalAbonoMultiple} 
            style={{ padding: '11px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <CheckSquare size={16} /> + Abono
          </button>

          <button 
            onClick={abrirModalPagoProveedor} 
            style={{ gridColumn: esMovil ? 'span 2' : 'auto', padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <ArrowUpRight size={16} /> Pagar Proveedor
          </button>
        </div>
      </div>

      {/* 6 TARJETAS KPI PRINCIPALES */}
      <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        
        {/* 1. Por Cobrar */}
        <div 
          onClick={() => setFiltroEstado(filtroEstado === 'pendientes' ? 'todos' : 'pendientes')}
          style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${filtroEstado === 'pendientes' ? '#f97316' : tema.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>POR COBRAR</span>
            <AlertCircle size={13} color="#f97316" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#f97316', marginTop: '4px' }}>{formatoCOP(totalPorCobrar)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            {enviosConDeudaCliente > 0 ? `⚠️ ${enviosConDeudaCliente} pend.` : '✅ Al día'}
          </div>
        </div>

        {/* 2. Debo a Edison */}
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>DEBO A EDISON</span>
            <ArrowUpRight size={13} color="#ef4444" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{formatoCOP(deudaEdison)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            {deudaEdison > 0 ? `${despachosPendientesParaProveedor.length} por liquidar` : '✅ Fruta paga'}
          </div>
        </div>

        {/* 3. Debo a Macareo */}
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>DEBO A MACAREO</span>
            <Truck size={13} color={deudaMacareo === 0 ? '#22c55e' : '#f97316'} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: deudaMacareo === 0 ? '#22c55e' : '#f97316', marginTop: '4px' }}>
            {formatoCOP(deudaMacareo)}
          </div>
          <div style={{ fontSize: '10px', color: deudaMacareo === 0 ? '#22c55e' : '#f97316', marginTop: '2px', fontWeight: '600' }}>
            {deudaMacareo === 0 ? '✅ Fletes al día ($0)' : '⚠️ Flete pendiente (#594)'}
          </div>
        </div>

        {/* 4. Merma / Rendimiento */}
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#eab308', fontSize: '10px', fontWeight: '800' }}>
            <span>MERMA / BÁSCULA</span>
            <Scale size={13} color="#eab308" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: metricaMerma.kilosDiferencia > 0 ? '#f97316' : '#22c55e', marginTop: '4px' }}>
            {metricaMerma.kilosDiferencia > 0 ? `-${metricaMerma.kilosDiferencia.toFixed(1)} Kg` : `+${Math.abs(metricaMerma.kilosDiferencia).toFixed(1)} Kg`}
          </div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            {metricaMerma.kilosDiferencia > 0 ? `${metricaMerma.porcentajeMerma.toFixed(1)}% vs 25Kg teór.` : '✅ Cubierto por Edison'}
          </div>
        </div>

        {/* 5. Margen Bruto */}
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>MARGEN BRUTO</span>
            <TrendingUp size={13} color="#22c55e" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>{formatoCOP(margenTotal)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            {formatoCOP(margenPromedioPorKilo)} / Kg ({porcentajeRentabilidadGlobal.toFixed(1)}%)
          </div>
        </div>

        {/* 6. Fruta Despachada */}
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>FRUTA DESPACHADA</span>
            <Package size={13} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: tema.textMain, marginTop: '4px' }}>
            {Number(totalKilos).toFixed(1)} Kg
          </div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            En {totalCajas} cajas ({enviosParaMetricas.length} envíos)
          </div>
        </div>

      </div>

      {/* FILTROS */}
      <div style={{ background: tema.cardBg, padding: '8px 10px', borderRadius: '10px', border: `1px solid ${tema.border}`, marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1' }}>
          <Search size={13} style={{ position: 'absolute', left: '8px', top: '9px', color: tema.textMuted }} />
          <input 
            type="text" 
            placeholder="Buscar # o fecha..." 
            value={filtroTexto} 
            onChange={(e) => setFiltroTexto(e.target.value)} 
            style={{ width: '100%', padding: '6px 8px 6px 26px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '3px' }}>
          <button onClick={() => setFiltroEstado('todos')} style={{ padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: filtroEstado === 'todos' ? '#38bdf8' : tema.inputBg, color: filtroEstado === 'todos' ? '#090d16' : tema.textMuted, border: 'none', cursor: 'pointer' }}>Todos</button>
          <button onClick={() => setFiltroEstado('pendientes')} style={{ padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: filtroEstado === 'pendientes' ? '#f97316' : tema.inputBg, color: filtroEstado === 'pendientes' ? '#090d16' : tema.textMuted, border: 'none', cursor: 'pointer' }}>Pend.</button>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <button onClick={() => setPestanaActiva('registros')} style={{ flex: 1, padding: '8px', background: pestanaActiva === 'registros' ? tema.cardBg : 'transparent', border: `1px solid ${pestanaActiva === 'registros' ? '#38bdf8' : tema.border}`, borderRadius: '8px', color: pestanaActiva === 'registros' ? '#38bdf8' : tema.textMuted, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          Registros ({enviosFiltrados.length + pedidosPendientesConConsecutivo.length})
        </button>
        <button onClick={() => setPestanaActiva('dashboard')} style={{ flex: 1, padding: '8px', background: pestanaActiva === 'dashboard' ? tema.cardBg : 'transparent', border: `1px solid ${pestanaActiva === 'dashboard' ? '#38bdf8' : tema.border}`, borderRadius: '8px', color: pestanaActiva === 'dashboard' ? '#38bdf8' : tema.textMuted, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          Run Chart & Analítica
        </button>
      </div>

      {/* VISTA 1: REGISTROS */}
      {pestanaActiva === 'registros' && (
        esMovil ? (
          /* ==================== VISTA MÓVIL EN TARJETAS ==================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedidosPendientesConConsecutivo.map((p) => {
              const costoFleteTotal = Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000);
              const costoFrutaTotal = Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000);
              const fletePago = p.flete_pagado;
              const frutaPaga = p.fruta_pagada;
              const esEnRuta = p.estado_fase === 'en_ruta';

              return (
                <div 
                  key={p.id}
                  style={{
                    background: tema.cardBg,
                    borderRadius: '14px',
                    padding: '14px',
                    border: esEnRuta ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(234, 179, 8, 0.4)',
                    borderLeft: `5px solid ${esEnRuta ? '#38bdf8' : '#eab308'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '900', fontSize: '17px', color: esEnRuta ? '#38bdf8' : '#eab308' }}>#{p.consecutivo}</span>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          fontSize: '11px', 
                          fontWeight: '800',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: esEnRuta ? 'rgba(56, 189, 248, 0.18)' : 'rgba(234, 179, 8, 0.18)',
                          color: esEnRuta ? '#38bdf8' : '#eab308',
                          border: `1px solid ${esEnRuta ? '#38bdf8' : '#eab308'}`
                        }}>
                          {esEnRuta ? '🚚 EN RUTA' : '🟡 SOLICITADO'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>Fecha: {p.fecha_pedido} • {p.cajas} cajas</div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}>
                        ⏳ Por pesar
                      </span>
                      <button
                        onClick={() => abrirModalEditarPedido(p)}
                        title="Editar pedido"
                        style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Edit2 size={13} color="#38bdf8" />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: tema.textMuted }}>Fruta Edison:</span><br />
                      {frutaPaga ? (
                        <b style={{ color: '#22c55e' }}>✅ PAGA ({formatoCOP(p.monto_fruta_pagado || costoFrutaTotal)})</b>
                      ) : (
                        <b style={{ color: '#ef4444' }}>⚠️ PEND ({formatoCOP(costoFrutaTotal)})</b>
                      )}
                    </div>
                    <div>
                      <span style={{ color: tema.textMuted }}>Flete Macareo:</span><br />
                      {fletePago ? (
                        <b style={{ color: '#22c55e' }}>✅ PAGO ({formatoCOP(p.monto_flete_pagado || costoFleteTotal)})</b>
                      ) : (
                        <b style={{ color: '#f97316' }}>⚠️ PEND ({formatoCOP(costoFleteTotal)})</b>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    {!frutaPaga ? (
                      <button
                        onClick={() => abrirModalFruta(p)}
                        style={{ padding: '9px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Coins size={13} /> Pagar Edison
                      </button>
                    ) : (
                      <button
                        onClick={() => abrirModalFruta(p)}
                        style={{ padding: '9px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Fruta Paga
                      </button>
                    )}

                    {!fletePago ? (
                      <button
                        onClick={() => abrirModalFlete(p)}
                        style={{ padding: '9px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Truck size={13} /> Pagar Macareo
                      </button>
                    ) : (
                      <button
                        onClick={() => abrirModalFlete(p)}
                        style={{ padding: '9px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Flete Pago
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => iniciarLiquidacionPedido(p)}
                      style={{ flex: 1, padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <CheckCheck size={14} /> Recibir báscula
                    </button>

                    <button
                      onClick={() => cancelarPedido(p.id)}
                      style={{ padding: '10px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* DESPACHOS FACTURADOS */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: tema.textMuted }}>Cargando registros...</div>
            ) : enviosFiltrados.length === 0 && pedidosPendientesConConsecutivo.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: tema.textMuted }}>No hay registros.</div>
            ) : (
              enviosFiltrados.map((r) => {
                const saldo = Number(r.saldo_pendiente || 0);

                return (
                  <div
                    key={r.id}
                    style={{
                      background: tema.cardBg,
                      borderRadius: '14px',
                      padding: '14px',
                      border: `1px solid ${saldo > 0 ? 'rgba(249, 115, 22, 0.4)' : tema.border}`,
                      borderLeft: `4px solid ${saldo > 0 ? '#f97316' : '#22c55e'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '900', fontSize: '17px' }}>#{r.consecutivo}</span>
                          <span style={{ padding: '2px 6px', background: saldo > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: saldo > 0 ? '#f97316' : '#22c55e', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                            {saldo > 0 ? 'EN CARTERA' : 'SALDADO'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>{r.fecha_envio}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: saldo > 0 ? '#f97316' : '#22c55e' }}>
                          {saldo > 0 ? formatoCOP(saldo) : '✅ Pagado'}
                        </div>
                        <div style={{ fontSize: '10px', color: tema.textMuted }}>{saldo > 0 ? 'Saldo Innovative' : 'Saldado'}</div>
                      </div>
                    </div>

                    {/* Flete Macareo visible en la tarjeta móvil */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: tema.textMuted }}>Cajas:</span> <b>{r.cajas}</b> | <b>{r.kilos} Kg</b><br />
                        <span style={{ color: tema.textMuted }}>Flete Macareo:</span> <b style={{ color: '#22c55e' }}>{formatoCOP(r.total_flete)}</b>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: tema.textMuted }}>Margen:</span> <b style={{ color: '#38bdf8' }}>{formatoCOP(r.margen_bruto)}</b><br />
                        <span style={{ color: tema.textMuted }}>Compra:</span> <b>{formatoCOP(r.precio_compra_kg)}/Kg</b>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '6px' }}>
                      <button
                        onClick={() => abrirModalEditarDespacho(r)}
                        style={{ padding: '9px 12px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={14} color="#38bdf8" />
                      </button>

                      <button
                        onClick={() => abrirModalCuentaSeguro(r)}
                        style={{ padding: '9px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <FileText size={14} /> Cuenta
                      </button>

                      <button
                        onClick={() => enviarWhatsApp(r)}
                        style={{ padding: '9px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Send size={14} /> WhatsApp
                      </button>

                      {saldo > 0 ? (
                        <button
                          onClick={() => abrirModalAbono(r)}
                          style={{ padding: '9px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <DollarSign size={14} /> Abono
                        </button>
                      ) : (
                        <button
                          onClick={() => abrirModalHistorial(r)}
                          style={{ padding: '9px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ==================== VISTA PC EN TABLA ==================== */
          <div style={{ background: tema.cardBg, borderRadius: '14px', border: `1px solid ${tema.border}`, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: tema.thBg, borderBottom: `1px solid ${tema.border}`, color: tema.textMuted }}>
                  <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
                    <div onClick={() => toggleSeleccionarTodoTabla(enviosFiltrados.map(e => e.id))} style={{ cursor: 'pointer' }}>
                      {seleccionadosTabla.length > 0 && seleccionadosTabla.length === enviosFiltrados.length ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                    </div>
                  </th>
                  <th onClick={() => handleOrdenar('consecutivo')} style={{ padding: '12px 14px', cursor: 'pointer' }}># / Fase</th>
                  <th onClick={() => handleOrdenar('fecha_envio')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Fecha</th>
                  <th onClick={() => handleOrdenar('cajas')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Cajas</th>
                  <th onClick={() => handleOrdenar('kilos')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Kilos</th>
                  <th>Compra Edison</th>
                  <th>Flete Macareo</th>
                  <th onClick={() => handleOrdenar('total_facturado_cliente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Facturado Innovative</th>
                  <th onClick={() => handleOrdenar('saldo_pendiente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Saldo Innovative</th>
                  <th onClick={() => handleOrdenar('margen_bruto')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Margen</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientesConConsecutivo.map((p) => {
                  const costoFleteTotal = Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000);
                  const costoFrutaTotal = Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000);
                  const fletePago = p.flete_pagado;
                  const frutaPaga = p.fruta_pagada;
                  const esEnRuta = p.estado_fase === 'en_ruta';

                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${tema.rowBorder}`, background: esEnRuta ? 'rgba(56, 189, 248, 0.08)' : 'rgba(234, 179, 8, 0.08)', borderLeft: `4px solid ${esEnRuta ? '#38bdf8' : '#eab308'}` }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}><Clock size={16} color={esEnRuta ? '#38bdf8' : '#eab308'} /></td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', color: esEnRuta ? '#38bdf8' : '#eab308' }}>
                        #{p.consecutivo}
                        <div style={{ 
                          fontSize: '10px', 
                          fontWeight: '800', 
                          color: esEnRuta ? '#38bdf8' : '#eab308',
                          marginTop: '2px' 
                        }}>
                          {esEnRuta ? '🚚 EN RUTA' : '🟡 SOLICITADO'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: tema.textMuted }}>{p.fecha_pedido}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{p.cajas} cajas</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '11px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', fontWeight: 'bold' }}>⏳ Por pesar</span></td>
                      
                      {/* Edison */}
                      <td style={{ padding: '12px 14px' }}>
                        {frutaPaga ? (
                          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Paga ({formatoCOP(p.monto_fruta_pagado || costoFrutaTotal)})</span>
                        ) : (
                          <button onClick={() => abrirModalFruta(p)} style={{ padding: '4px 8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Pagar {formatoCOP(costoFrutaTotal)}
                          </button>
                        )}
                      </td>

                      {/* Macareo */}
                      <td style={{ padding: '12px 14px' }}>
                        {fletePago ? (
                          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Pago ({formatoCOP(p.monto_flete_pagado || costoFleteTotal)})</span>
                        ) : (
                          <button onClick={() => abrirModalFlete(p)} style={{ padding: '4px 8px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Pagar {formatoCOP(costoFleteTotal)}
                          </button>
                        )}
                      </td>

                      <td style={{ padding: '12px 14px', color: tema.textMuted }}>Báscula pendiente</td>
                      <td style={{ padding: '12px 14px', color: '#eab308', fontWeight: 'bold' }}>Por cobrar</td>
                      <td style={{ padding: '12px 14px', color: tema.textMuted }}>-</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => abrirModalEditarPedido(p)} title="Editar pedido" style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}>
                            <Edit2 size={12} color="#38bdf8" />
                          </button>
                          <button onClick={() => iniciarLiquidacionPedido(p)} style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCheck size={14} /> Recibir báscula
                          </button>
                          <button onClick={() => cancelarPedido(p.id)} style={{ padding: '6px 8px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Despachos */}
                {enviosFiltrados.map((r) => {
                  const saldo = Number(r.saldo_pendiente || 0);
                  const estaSeleccionado = seleccionadosTabla.includes(r.id);

                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${tema.rowBorder}`, background: estaSeleccionado ? 'rgba(56, 189, 248, 0.08)' : 'transparent' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div onClick={() => toggleSeleccionFila(r.id)} style={{ cursor: 'pointer' }}>
                          {estaSeleccionado ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>
                        #{r.consecutivo}
                        <div style={{ fontSize: '10px', color: saldo > 0 ? '#f97316' : '#22c55e' }}>{saldo > 0 ? 'EN CARTERA' : 'SALDADO'}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: tema.textMuted }}>{r.fecha_envio}</td>
                      <td style={{ padding: '12px 14px' }}>{r.cajas}</td>
                      <td style={{ padding: '12px 14px' }}>{r.kilos} Kg</td>
                      <td style={{ padding: '12px 14px', color: '#ef4444', fontWeight: 'bold' }}>
                        <button onClick={() => setModalEditarPrecioCompra(r)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                          {formatoCOP(r.precio_compra_kg)} <Edit2 size={11} color={tema.textMuted} />
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: '600' }}>{formatoCOP(r.total_flete)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>{formatoCOP(r.total_facturado_cliente)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', color: saldo > 0 ? '#f97316' : '#22c55e' }}>{formatoCOP(saldo)}</td>
                      <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: '600' }}>{formatoCOP(r.margen_bruto)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => abrirModalEditarDespacho(r)} style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}>
                            <Edit2 size={12} color="#38bdf8" />
                          </button>
                          <button onClick={() => abrirModalCuentaSeguro(r)} style={{ padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <FileText size={13} /> Cuenta
                          </button>
                          <button onClick={() => enviarWhatsApp(r)} style={{ padding: '6px 10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <Send size={13} /> WhatsApp
                          </button>
                          {saldo > 0 ? (
                            <button onClick={() => abrirModalAbono(r)} style={{ padding: '6px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <DollarSign size={13} /> Abono
                            </button>
                          ) : (
                            <button onClick={() => abrirModalHistorial(r)} style={{ padding: '5px 8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                              <CheckCircle2 size={13} /> Pagado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ==================== VISTA 2: RUN CHART CLARO & ANALÍTICA REAL ==================== */}
      {pestanaActiva === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 6 TARJETAS ANALÍTICAS ACCIONABLES */}
          <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>MARGEN PROMEDIO / KG</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#22c55e', marginTop: '4px' }}>
                {formatoCOP(margenPromedioPorKilo)}
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>Ganancia neta limpia por kilo</span>
            </div>

            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>RENTABILIDAD GLOBAL</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>
                {porcentajeRentabilidadGlobal.toFixed(1)}%
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>Margen bruto sobre venta</span>
            </div>

            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>COSTO MEDIO EDISON</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>
                {formatoCOP(costoPromedioFrutaKg)} / Kg
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>Precio ponderado de compra</span>
            </div>

            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>INCIDENCIA DE FLETE</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#eab308', marginTop: '4px' }}>
                {porcentajeIncidenciaFlete.toFixed(1)}%
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>De la venta se va en fletes</span>
            </div>

            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>IMPACTO MERMA ($ COP)</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: metricaMerma.kilosDiferencia > 0 ? '#f97316' : '#22c55e', marginTop: '4px' }}>
                {formatoCOP(Math.abs(metricaMerma.valorDineroMerma))}
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>
                {metricaMerma.kilosDiferencia > 0 ? `${metricaMerma.kilosDiferencia.toFixed(1)} Kg no cobrados` : 'Cubierto por Edison'}
              </span>
            </div>

            <div style={{ background: tema.cardBg, padding: '14px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: tema.textMuted }}>UTILIDAD / DESPACHO</span>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#22c55e', marginTop: '4px' }}>
                {formatoCOP(gananciaPromedioDespacho)}
              </div>
              <span style={{ fontSize: '11px', color: tema.textMuted }}>Ganancia media por camión</span>
            </div>
          </div>

          {/* Gráfico Run Chart con Números en las 3 Curvas */}
          <div style={{ background: tema.cardBg, padding: '20px', borderRadius: '16px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Evolución Financiera Histórica</h3>
                <p style={{ margin: '3px 0 0', color: tema.textMuted, fontSize: '12px' }}>Facturación vs Costo de Fruta vs Ganancia Real</p>
              </div>

              <div style={{ display: 'flex', gap: '4px', background: tema.inputBg, padding: '2px', borderRadius: '6px' }}>
                {['envio', 'semana', 'mes', 'ano'].map(modo => (
                  <button
                    key={modo}
                    onClick={() => setAgrupacionRunChart(modo)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      background: agrupacionRunChart === modo ? '#38bdf8' : 'transparent',
                      color: agrupacionRunChart === modo ? '#090d16' : tema.textMuted,
                      border: 'none'
                    }}
                  >
                    {modo}
                  </button>
                ))}
              </div>
            </div>

            {/* Leyenda interactiva */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px', padding: '10px 14px', background: darkMode ? '#0b1120' : '#f8fafc', borderRadius: '10px', border: `1px solid ${tema.border}` }}>
              <div 
                onClick={() => setSeriesVisibles(s => ({ ...s, venta: !s.venta }))}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', cursor: 'pointer', opacity: seriesVisibles.venta ? 1 : 0.4 }}
              >
                <span style={{ width: '12px', height: '3px', background: '#38bdf8', borderRadius: '2px' }}></span> 🔵 Facturado Innovative
              </div>
              <div 
                onClick={() => setSeriesVisibles(s => ({ ...s, costoFruta: !s.costoFruta }))}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444', cursor: 'pointer', opacity: seriesVisibles.costoFruta ? 1 : 0.4 }}
              >
                <span style={{ width: '12px', height: '3px', background: '#ef4444', borderRadius: '2px', borderBottom: '1px dashed #ef4444' }}></span> 🔴 Costo Fruta Edison
              </div>
              <div 
                onClick={() => setSeriesVisibles(s => ({ ...s, margen: !s.margen }))}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#22c55e', cursor: 'pointer', opacity: seriesVisibles.margen ? 1 : 0.4 }}
              >
                <span style={{ width: '12px', height: '3px', background: '#22c55e', borderRadius: '2px' }}></span> 🟢 Margen Bruto Real
              </div>
            </div>

            {datosGrafico.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: tema.textMuted }}>Sin datos para graficar.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', minWidth: '600px' }}>
                  <line x1={padX} y1={padY} x2={chartWidth - padX} y2={padY} stroke={tema.chartGrid} strokeDasharray="3 3" />
                  <line x1={padX} y1={(chartHeight - padY * 2) / 2 + padY} x2={chartWidth - padX} y2={(chartHeight - padY * 2) / 2 + padY} stroke={tema.chartGrid} strokeDasharray="3 3" />
                  <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke={tema.chartGrid} />

                  {/* Curvas */}
                  {seriesVisibles.venta && <path d={generarPath('venta')} fill="none" stroke="#38bdf8" strokeWidth="2.5" />}
                  {seriesVisibles.costoFruta && <path d={generarPath('costoFruta')} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />}
                  {seriesVisibles.margen && <path d={generarPath('margen')} fill="none" stroke="#22c55e" strokeWidth="3" />}

                  {/* NÚMEROS Y PUNTOS EN CADA LÍNEA */}
                  {datosGrafico.map((d, i) => {
                    const x = padX + (i / (datosGrafico.length > 1 ? datosGrafico.length - 1 : 1)) * (chartWidth - padX * 2);
                    const yVenta = chartHeight - padY - (d.venta / maxGrafico) * (chartHeight - padY * 2);
                    const yCosto = chartHeight - padY - (d.costoFruta / maxGrafico) * (chartHeight - padY * 2);
                    const yMargen = chartHeight - padY - (d.margen / maxGrafico) * (chartHeight - padY * 2);

                    return (
                      <g key={i}>
                        {seriesVisibles.venta && (
                          <>
                            <circle cx={x} cy={yVenta} r="4" fill="#38bdf8" stroke={tema.cardBg} strokeWidth="1.5" />
                            <text x={x} y={yVenta - 10} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">{formatoCOP(d.venta)}</text>
                          </>
                        )}

                        {seriesVisibles.costoFruta && (
                          <>
                            <circle cx={x} cy={yCosto} r="3.5" fill="#ef4444" stroke={tema.cardBg} strokeWidth="1.5" />
                            <text x={x} y={yCosto - 8} fill="#ef4444" fontSize="9.5" fontWeight="bold" textAnchor="middle">{formatoCOP(d.costoFruta)}</text>
                          </>
                        )}

                        {seriesVisibles.margen && (
                          <>
                            <circle cx={x} cy={yMargen} r="4.5" fill="#22c55e" stroke={tema.cardBg} strokeWidth="1.5" />
                            <text x={x} y={yMargen + 16} fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">{formatoCOP(d.margen)}</text>
                          </>
                        )}

                        <text x={x} y={chartHeight - padY + 28} fill={tema.textMuted} fontSize="10" textAnchor="middle">{d.label}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODAL: EDITAR PEDIDO (LÁPIZ #593 / #594) */}
      {modalEditarPedido && (
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
      )}

      {/* MODAL: PAGAR FLETE A MACAREO */}
      {modalPagarFletePedido && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '380px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pagar Flete a Macareo</h3>
              <button onClick={() => setModalPagarFletePedido(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
              <span>Pedido: <b>#{modalPagarFletePedido.consecutivo}</b> ({modalPagarFletePedido.cajas} cajas)</span>
            </div>

            <form onSubmit={guardarFletePedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha del Pago</label>
                <input type="date" required value={formFletePedido.fecha} onChange={(e) => setFormFletePedido({...formFletePedido, fecha: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e' }}>Monto Pagado a Macareo (COP)</label>
                <input type="number" step="any" required autoFocus value={formFletePedido.monto} onChange={(e) => setFormFletePedido({...formFletePedido, monto: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: '1px solid #22c55e', color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalPagarFletePedido(null)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Pago Flete</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAGAR FRUTA A EDISON */}
      {modalPagarFrutaPedido && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '380px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pagar Fruta a Edison</h3>
              <button onClick={() => setModalPagarFrutaPedido(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
              <span>Pedido: <b>#{modalPagarFrutaPedido.consecutivo}</b> ({modalPagarFrutaPedido.cajas} cajas • 25 Kg/cja)</span>
            </div>

            <form onSubmit={guardarFrutaPedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha del Pago</label>
                <input type="date" required value={formFrutaPedido.fecha} onChange={(e) => setFormFrutaPedido({...formFrutaPedido, fecha: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444' }}>Monto Pagado a Edison (COP)</label>
                <input type="number" step="any" required autoFocus value={formFrutaPedido.monto} onChange={(e) => setFormFrutaPedido({...formFrutaPedido, monto: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: '1px solid #ef4444', color: '#ef4444', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalPagarFrutaPedido(null)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar Pago Fruta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL CUENTA DE COBRO BLINDADO Y ALINEADO ==================== */}
      {modalCuentaCobro && (
        <div 
          onClick={() => setModalCuentaCobro(null)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.88)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 9999, 
            padding: '16px' 
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: '#ffffff', 
              color: '#0f172a', 
              width: '100%', 
              maxWidth: '560px', 
              borderRadius: '16px', 
              padding: '24px', 
              maxHeight: '92vh', 
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            {/* Botonera superior */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => imprimirConNombre(modalCuentaCobro)} 
                  style={{ padding: '7px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Printer size={15} /> Imprimir / PDF
                </button>
                <button 
                  onClick={() => enviarWhatsApp(modalCuentaCobro)} 
                  style={{ padding: '7px 14px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                >
                  <Send size={15} /> WhatsApp
                </button>
              </div>
              <button 
                onClick={() => setModalCuentaCobro(null)} 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Cabecera */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                CUENTA DE COBRO # {modalCuentaCobro.consecutivo}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginTop: '2px' }}>
                Fecha: {modalCuentaCobro.fecha_envio}
              </div>
            </div>

            {/* Datos Cliente / Beneficiario */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px', lineHeight: '1.4' }}>
              <div>
                <b>Cliente:</b> Innovative Kitchen SAS<br />
                <span>NIT # 901.069.237-4</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b>Beneficiario:</b> Elkin Bohórquez Tarud<br />
                <span>C.C. 72.271.189</span>
              </div>
            </div>

            {/* Tabla Conceptos */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Cant</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>
                    Aguacate Hass - Grueso ({formatoCOP(modalCuentaCobro.precio_venta_kg_calc)}/Kg)
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {modalCuentaCobro.kilos_calc} Kg
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatoCOP(modalCuentaCobro.total_venta_fruta_calc)}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '8px' }}>
                    Envío Transporte ({modalCuentaCobro.cajas_calc} cajas @ $32.000)
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {modalCuentaCobro.cajas_calc} cjs
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatoCOP(modalCuentaCobro.total_flete_calc)}
                  </td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan="2" style={{ padding: '10px 8px', fontWeight: 'bold' }}>TOTAL A PAGAR</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '900', fontSize: '15px' }}>
                    {formatoCOP(modalCuentaCobro.total_facturado_calc)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Banco */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div>Forma de Pago: <b>Bancolombia Ahorros # 554 879 253 72</b></div>
              <div>A nombre de: <b>Elkin Bohórquez Tarud</b> (CC 72.271.189)</div>
            </div>

            {/* Firma alineada estrictamente a la izquierda */}
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ minHeight: '52px', display: 'flex', alignItems: 'flex-end' }}>
                  <img 
                    src="/firma.png" 
                    alt="Firma" 
                    style={{ 
                      maxHeight: '50px', 
                      maxWidth: '180px', 
                      objectFit: 'contain',
                      mixBlendMode: 'multiply',
                      display: 'block',
                      marginBottom: '-4px'
                    }} 
                  />
                </div>
                <div style={{ width: '100%', borderTop: '1.5px solid #0f172a', paddingTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Elkin Bohórquez Tarud</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>C.C. 72.271.189</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: EDITAR PRECIO COMPRA EDISON */}
      {modalEditarPrecioCompra && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '340px', border: `1px solid ${tema.border}` }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 'bold' }}>Precio Compra Edison</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {[6000, 6500, 7000, 7500, 8000, 8500, 9000].map(pr => (
                <button key={pr} onClick={() => actualizarPrecioCompra(modalEditarPrecioCompra.id, pr)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${modalEditarPrecioCompra.precio_compra_kg === pr ? '#ef4444' : tema.border}`, background: modalEditarPrecioCompra.precio_compra_kg === pr ? 'rgba(239, 68, 68, 0.2)' : tema.inputBg, color: tema.textMain, fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatoCOP(pr)} / Kg</span>
                  {modalEditarPrecioCompra.precio_compra_kg === pr && <Check size={14} color="#ef4444" />}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalEditarPrecioCompra(null)} style={{ padding: '6px 12px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DESPACHO */}
      {modalEditarDespachoCompleto && (
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
                  <label style={{ fontSize: '11px', color: tema.textMuted }}>Compra/Kg</label>
                  <input type="number" required value={formEdicion.precio_compra_kg} onChange={(e) => setFormEdicion({...formEdicion, precio_compra_kg: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#ef4444', borderRadius: '6px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: tema.textMuted }}>Venta/Kg</label>
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
      )}
    </div>
  );
}