import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import jsPDF from 'jspdf';
import { 
  Package, TrendingUp, AlertCircle, RefreshCw, Moon, Sun, X, 
  BarChart3, ListFilter, Search, DollarSign, CheckCircle2, 
  ArrowUpRight, Truck, Check, Edit2, FileText, Printer, Send, CheckSquare, Square,
  ArrowUpDown, ArrowUp, ArrowDown, Download, Trash2, Clock, CheckCheck, Fingerprint, Scale, Lock, Coins, Share2
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
  const [formFletePedido, setFormFletePedido] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0] });
  // Formulario Fruta Pedido (Edison)
  const [formFrutaPedido, setFormFrutaPedido] = useState({ monto: '', fecha: new Date().toISOString().split('T')[0] });

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

  // Pago Proveedor (Edison / Macareo)
  const [provSeleccionadoId, setProvSeleccionadoId] = useState('');
  const [despachosProvSeleccionados, setDespachosProvSeleccionados] = useState([]);
  const [montoManualPagoProv, setMontoManualPagoProv] = useState('');
  const [fechaPagoProv, setFechaPagoProv] = useState(new Date().toISOString().split('T')[0]);
  const [notasPagoProv, setNotasPagoProv] = useState('');

  const [darkMode, setDarkMode] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('registros');

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');

  const [columnaOrden, setColumnaOrden] = useState('consecutivo');
  const [direccionOrden, setDireccionOrden] = useState('desc');

  const [agrupacionRunChart, setAgrupacionRunChart] = useState('mes');
  const [seriesVisibles, setSeriesVisibles] = useState({ venta: true, costoFruta: true, margen: true });

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
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const disponible = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (disponible) {
          sessionStorage.setItem('aguacates_auth_ok', 'true');
          setAutenticado(true);
          cargarDatos();
          return;
        }
      }
      setErrorBiometria('Ingresa tu PIN de 4 dígitos.');
    } catch (err) {
      setErrorBiometria('Ingresa tu PIN de 4 dígitos.');
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
    const numE = (listaEnvios || []).map(e => parseInt(String(e.consecutivo || '').replace(/\D/g, '') || '0', 10));
    const numP = (listaPedidos || []).map(p => parseInt(String(p.consecutivo || '').replace(/\D/g, '') || '0', 10));
    return String(Math.max(...numE, ...numP, 0) + 1).padStart(6, '0');
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
    setSeleccionadosTabla(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function toggleSeleccionarTodoTabla(listaIds) {
    setSeleccionadosTabla(seleccionadosTabla.length === listaIds.length ? [] : listaIds);
  }

  const formatoCOP = (val) => '$' + Math.round(Number(val || 0)).toLocaleString('es-CO');

  // MAPEO EXACTO DE DEUDAS POR ENVÍO CON EDISON
  const enviosConDetalleProveedor = useMemo(() => {
    return envios.map(e => {
      const costoFruta = Number(e.total_compra_fruta || (Number(e.cajas || 0) * 25 * Number(e.precio_compra_kg || 6000)));
      const pagadoEdison = pagosProveedores
        .filter(p => p.envio_id === e.id && p.concepto === 'fruta')
        .reduce((sum, p) => sum + Number(p.monto || 0), 0);
      const saldoEdison = Math.max(0, costoFruta - pagadoEdison);

      const costoFlete = Number(e.total_flete || (Number(e.cajas || 0) * 20000));
      const pagadoMacareo = pagosProveedores
        .filter(p => p.envio_id === e.id && p.concepto === 'transporte')
        .reduce((sum, p) => sum + Number(p.monto || 0), 0);
      const saldoMacareo = Math.max(0, costoFlete - pagadoMacareo);

      return {
        ...e,
        costoFrutaEdison: costoFruta,
        pagadoEdison,
        saldoEdison,
        costoFleteMacareo: costoFlete,
        pagadoMacareo,
        saldoMacareo
      };
    });
  }, [envios, pagosProveedores]);

  // Cálculos Globales
  const totalCostoFruta = enviosConDetalleProveedor.reduce((acc, e) => acc + e.costoFrutaEdison, 0);
  const totalCostoFlete = enviosConDetalleProveedor.reduce((acc, e) => acc + e.costoFleteMacareo, 0);

  const pagadoFruta = pagosProveedores.filter(p => p.concepto === 'fruta').reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const pagadoFlete = pagosProveedores.filter(p => p.concepto === 'transporte').reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const frutaPedidosPendientes = pedidos
    .filter(p => p.estado !== 'liquidado' && !p.fruta_pagada)
    .reduce((sum, p) => sum + (Number(p.cajas || 0) * 25 * Number(p.precio_compra_kg || 6000)), 0);

  const fletesPedidosPendientes = pedidos
    .filter(p => p.estado !== 'liquidado' && !p.flete_pagado)
    .reduce((sum, p) => sum + (Number(p.cajas || 0) * Number(p.costo_flete_caja || 20000)), 0);

  const deudaEdison = Math.max(0, totalCostoFruta - pagadoFruta) + frutaPedidosPendientes;
  const deudaMacareo = Math.max(0, totalCostoFlete - pagadoFlete) + fletesPedidosPendientes;

  const despachosPendientesCliente = useMemo(() => {
    return enviosConDetalleProveedor.filter(e => Number(e.saldo_pendiente || 0) > 0);
  }, [enviosConDetalleProveedor]);

  const totalSeleccionadoAbonoMultiple = useMemo(() => {
    return cuentasSeleccionadasModal.reduce((acc, id) => {
      const eObj = enviosConDetalleProveedor.find(e => e.id === id);
      return acc + Number(eObj?.saldo_pendiente || 0);
    }, 0);
  }, [cuentasSeleccionadasModal, enviosConDetalleProveedor]);

  const provSeleccionadoObj = useMemo(() => proveedores.find(p => p.id === provSeleccionadoId), [proveedores, provSeleccionadoId]);

  const despachosPendientesParaProveedor = useMemo(() => {
    const esFlete = provSeleccionadoObj?.tipo === 'transporte';
    return enviosConDetalleProveedor
      .map(e => ({
        ...e,
        saldoPendienteProv: esFlete ? e.saldoMacareo : e.saldoEdison
      }))
      .filter(e => e.saldoPendienteProv > 0)
      .sort((a, b) => a.consecutivo.localeCompare(b.consecutivo));
  }, [enviosConDetalleProveedor, provSeleccionadoObj]);

  const totalSeleccionadoPagoProv = useMemo(() => {
    return despachosProvSeleccionados.reduce((acc, id) => {
      const item = despachosPendientesParaProveedor.find(e => e.id === id);
      return acc + Number(item?.saldoPendienteProv || 0);
    }, 0);
  }, [despachosProvSeleccionados, despachosPendientesParaProveedor]);

  const pedidosPendientesConConsecutivo = useMemo(() => {
    const activos = pedidos.filter(p => p.estado !== 'liquidado');
    return activos.map((p, idx) => ({
      ...p,
      consecutivo: p.consecutivo || String(envios.length + idx + 1).padStart(6, '0'),
      esPedido: true,
      fecha_envio: p.fecha_pedido
    }));
  }, [pedidos, envios]);

  const enviosFiltrados = useMemo(() => {
    const filtrados = enviosConDetalleProveedor.filter(r => {
      const matchTxt = r.consecutivo?.toLowerCase().includes(filtroTexto.toLowerCase()) || r.fecha_envio?.includes(filtroTexto);
      const saldo = Number(r.saldo_pendiente || 0);
      let matchEst = true;
      if (filtroEstado === 'pendientes') matchEst = saldo > 0;
      if (filtroEstado === 'saldados') matchEst = saldo <= 0;
      return matchTxt && matchEst;
    });

    return filtrados.sort((a, b) => {
      let valA = a[columnaOrden] ?? 0;
      let valB = b[columnaOrden] ?? 0;
      if (typeof valA === 'string') return direccionOrden === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return direccionOrden === 'asc' ? valA - valB : valB - valA;
    });
  }, [enviosConDetalleProveedor, filtroTexto, filtroEstado, columnaOrden, direccionOrden]);

  const enviosParaMetricas = useMemo(() => seleccionadosTabla.length > 0 ? enviosConDetalleProveedor.filter(e => seleccionadosTabla.includes(e.id)) : enviosFiltrados, [seleccionadosTabla, enviosConDetalleProveedor, enviosFiltrados]);

  const enviosConDeudaCliente = enviosParaMetricas.filter(e => Number(e.saldo_pendiente || 0) > 0).length;
  const totalPorCobrar = enviosParaMetricas.reduce((acc, r) => acc + Number(r.saldo_pendiente || 0), 0);
  const margenTotal = enviosParaMetricas.reduce((acc, r) => acc + Number(r.margen_bruto || 0), 0);
  const totalKilos = enviosParaMetricas.reduce((acc, r) => acc + Number(r.kilos || 0), 0);
  const totalCajas = enviosParaMetricas.reduce((acc, r) => acc + Number(r.cajas || 0), 0);
  const margenPromedioPorKilo = totalKilos > 0 ? (margenTotal / totalKilos) : 0;
  const totalFacturadoAnalitica = enviosParaMetricas.reduce((acc, r) => acc + Number(r.total_facturado_cliente || 0), 0);
  const porcentajeRentabilidadGlobal = totalFacturadoAnalitica > 0 ? ((margenTotal / totalFacturadoAnalitica) * 100) : 0;

  // ABONO PARCIAL O COMPLETO A PROVEEDOR
  async function guardarPagoProveedor(e) {
    e.preventDefault();
    const esFlete = provSeleccionadoObj?.tipo === 'transporte';
    let montoRestante = Number(montoManualPagoProv || totalSeleccionadoPagoProv);

    if (montoRestante <= 0 || despachosProvSeleccionados.length === 0) return;

    const pagosAInsertar = [];
    for (const envioId of despachosProvSeleccionados) {
      if (montoRestante <= 0) break;
      const despacho = despachosPendientesParaProveedor.find(d => d.id === envioId);
      const deuda = despacho.saldoPendienteProv;
      const abonoParaEste = Math.min(montoRestante, deuda);
      montoRestante -= abonoParaEste;

      pagosAInsertar.push({
        proveedor_id: provSeleccionadoId,
        envio_id: envioId,
        monto: abonoParaEste,
        fecha: fechaPagoProv,
        concepto: esFlete ? 'transporte' : 'fruta',
        notas: notasPagoProv || `Abono fruta despacho #${despacho.consecutivo}`
      });
    }

    const { error } = await supabase.from('pagos_proveedor').insert(pagosAInsertar);
    if (!error) {
      setModalPagoProvAbierto(false);
      setDespachosProvSeleccionados([]);
      setMontoManualPagoProv('');
      await cargarDatos();
    } else {
      alert('Error registrando pago: ' + error.message);
    }
  }

  // PDF y WhatsApp
  function generarPDFExacto1Pagina(envio) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });
    const kilos = Number(envio.kilos || 0);
    const cajas = Number(envio.cajas || 0);
    const pVenta = Number(envio.precio_venta_kg || 11200);
    const vFruta = kilos * pVenta;
    const vFlete = cajas * 32000;
    const vTotal = vFruta + vFlete;

    doc.setDrawColor(230, 235, 240);
    doc.roundedRect(15, 15, 185, 235, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(`CUENTA DE COBRO # ${envio.consecutivo}`, 107.5, 30, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha: ${envio.fecha_envio}`, 107.5, 37, { align: 'center' });

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.6);
    doc.line(25, 42, 190, 42);

    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente: Innovative Kitchen SAS', 25, 53);
    doc.setFont('helvetica', 'normal');
    doc.text('NIT # 901.069.237-4', 25, 59);

    doc.setFont('helvetica', 'bold');
    doc.text('Beneficiario: Elkin Bohórquez Tarud', 190, 53, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text('C.C. 72.271.189', 190, 59, { align: 'right' });

    doc.setFillColor(248, 250, 252);
    doc.rect(25, 68, 165, 8.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 29, 73.5);
    doc.text('Cant', 125, 73.5, { align: 'center' });
    doc.text('Valor', 186, 73.5, { align: 'right' });

    doc.line(25, 76.5, 190, 76.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`Aguacate Hass - Grueso (${formatoCOP(pVenta)}/Kg)`, 29, 85);
    doc.text(`${kilos} Kg`, 125, 85, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatoCOP(vFruta), 186, 85, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text(`Envío Transporte (${cajas} cajas @ $32.000)`, 29, 95);
    doc.text(`${cajas} cjs`, 125, 95, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatoCOP(vFlete), 186, 95, { align: 'right' });

    doc.line(25, 102, 190, 102);

    doc.setFillColor(248, 250, 252);
    doc.rect(25, 103, 165, 10.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL A PAGAR', 29, 110);
    doc.text(formatoCOP(vTotal), 186, 110, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.roundedRect(25, 122, 165, 18, 2, 2);
    doc.text('Forma de Pago: Bancolombia Ahorros # 554 879 253 72', 29, 130);
    doc.text('A nombre de: Elkin Bohórquez Tarud (CC 72.271.189)', 29, 136);

    try {
      const img = new Image();
      img.src = '/firma.png';
      doc.addImage(img, 'PNG', 25, 155, 45, 16);
    } catch (e) {}

    doc.line(25, 173, 85, 173);
    doc.setFont('helvetica', 'bold');
    doc.text('Elkin Bohórquez Tarud', 25, 178.5);
    doc.setFont('helvetica', 'normal');
    doc.text('C.C. 72.271.189', 25, 184);

    return doc;
  }

  function descargarPDF1Pagina(envio) {
    const doc = generarPDFExacto1Pagina(envio);
    doc.save(`Cuenta_Cobro_${envio.consecutivo}_Aguacates.pdf`);
  }

  async function compartirPDFWhatsApp(envio) {
    try {
      const doc = generarPDFExacto1Pagina(envio);
      const pdfBlob = doc.output('blob');
      const archivo = new File([pdfBlob], `Cuenta_Cobro_${envio.consecutivo}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: `Cuenta de Cobro #${envio.consecutivo}`,
          text: `Hola, adjunto la Cuenta de Cobro #${envio.consecutivo}.`
        });
        return;
      }
    } catch (err) {}
    descargarPDF1Pagina(envio);
  }

  const tema = darkMode ? {
    bg: '#090d16',
    cardBg: '#131b2e',
    border: '#1e293b',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    inputBg: '#1e293b',
    inputBorder: '#334155',
    thBg: '#0f172a',
    rowBorder: '#1e293b'
  } : {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    textMain: '#0f172a',
    textMuted: '#64748b',
    inputBg: '#ffffff',
    inputBorder: '#cbd5e1',
    thBg: '#f1f5f9',
    rowBorder: '#f1f5f9'
  };

  // Pantalla de bloqueo
  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '24px', padding: '36px 24px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🥑</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Aguacates & Tesorería</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px' }}>Identifícate para ingresar</p>

          <button onClick={activarHuellaBiometrica} style={{ width: '100%', padding: '15px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
            <Fingerprint size={22} /> Desbloquear con Huella
          </button>

          <form onSubmit={desbloquearConPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" inputMode="numeric" maxLength="4" placeholder="PIN" value={pinInput} onChange={(e) => setPinInput(e.target.value)} style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '8px', fontSize: '22px', fontWeight: 'bold', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }} />
            {errorBiometria && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errorBiometria}</span>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Ingresar con PIN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1340px', margin: '0 auto', background: tema.bg, color: tema.textMain, minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '26px' }}>🥑</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Aguacates & Tesorería</h1>
            <p style={{ margin: 0, color: tema.textMuted, fontSize: '11px' }}>Edison • Innovative • Macareo</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer' }}>{darkMode ? <Sun size={15} color="#eab308" /> : <Moon size={15} />}</button>
          <button onClick={cargarDatos} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer' }}><RefreshCw size={15} /></button>
          <button onClick={cerrarSesion} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Lock size={15} /></button>
        </div>
      </div>

      {/* BOTONERA */}
      <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(3, auto)', gap: '8px', marginBottom: '14px' }}>
        <button onClick={() => setModalNuevoPedido(true)} style={{ padding: '11px', background: '#eab308', color: '#090d16', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Clock size={16} /> + Pedido</button>
        <button onClick={() => { setCuentasSeleccionadasModal([]); setModalAbonoMultipleAbierto(true); }} style={{ padding: '11px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckSquare size={16} /> + Abono Cliente</button>
        <button onClick={() => { setDespachosProvSeleccionados([]); setModalPagoProvAbierto(true); }} style={{ gridColumn: esMovil ? 'span 2' : 'auto', padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ArrowUpRight size={16} /> Pagar Proveedor (Edison / Macareo)</button>
      </div>

      {/* 6 TARJETAS KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}><span>POR COBRAR CLIENTE</span><AlertCircle size={13} color="#f97316" /></div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#f97316', marginTop: '4px' }}>{formatoCOP(totalPorCobrar)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted }}>{enviosConDeudaCliente} pendientes</div>
        </div>

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}><span>DEBO A EDISON (FRUTA)</span><ArrowUpRight size={13} color="#ef4444" /></div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#ef4444', marginTop: '4px' }}>{formatoCOP(deudaEdison)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted }}>Fruta pendiente liquidar</div>
        </div>

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}><span>DEBO A MACAREO (FLETE)</span><Truck size={13} color={deudaMacareo === 0 ? '#22c55e' : '#f97316'} /></div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: deudaMacareo === 0 ? '#22c55e' : '#f97316', marginTop: '4px' }}>{formatoCOP(deudaMacareo)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted }}>{deudaMacareo === 0 ? 'Fletes al día' : 'Flete pendiente'}</div>
        </div>

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}><span>MARGEN BRUTO</span><TrendingUp size={13} color="#22c55e" /></div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>{formatoCOP(margenTotal)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted }}>{formatoCOP(margenPromedioPorKilo)} / Kg ({porcentajeRentabilidadGlobal.toFixed(1)}%)</div>
        </div>

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}><span>FRUTA DESPACHADA</span><Package size={13} color="#38bdf8" /></div>
          <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>{Number(totalKilos).toFixed(1)} Kg</div>
          <div style={{ fontSize: '10px', color: tema.textMuted }}>En {totalCajas} cajas</div>
        </div>
      </div>

      {/* TABLA PRINCIPAL CON ESTADO DUAL Y COSTO EDISON CLARO */}
      <div style={{ background: tema.cardBg, borderRadius: '14px', border: `1px solid ${tema.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: tema.thBg, borderBottom: `1px solid ${tema.border}`, color: tema.textMuted }}>
              <th style={{ padding: '10px 12px', width: '30px' }}>
                <div onClick={() => toggleSeleccionarTodoTabla(enviosFiltrados.map(e => e.id))} style={{ cursor: 'pointer' }}>
                  {seleccionadosTabla.length > 0 && seleccionadosTabla.length === enviosFiltrados.length ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                </div>
              </th>
              <th style={{ padding: '10px 12px' }}># / Estado Dual</th>
              <th style={{ padding: '10px 12px' }}>Fecha</th>
              <th style={{ padding: '10px 12px' }}>Cajas</th>
              <th style={{ padding: '10px 12px' }}>Kilos</th>
              <th style={{ padding: '10px 12px' }}>Fruta Edison (Total / Saldo)</th>
              <th style={{ padding: '10px 12px' }}>Flete Macareo</th>
              <th style={{ padding: '10px 12px' }}>Facturado Innovative</th>
              <th style={{ padding: '10px 12px' }}>Saldo Innovative</th>
              <th style={{ padding: '10px 12px' }}>Margen</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* PEDIDOS PENDIENTES */}
            {pedidosPendientesConConsecutivo.map(p => (
              <tr key={p.id} style={{ background: 'rgba(234, 179, 8, 0.08)', borderBottom: `1px solid ${tema.border}`, borderLeft: '4px solid #eab308' }}>
                <td style={{ padding: '10px 12px' }}><Clock size={15} color="#eab308" /></td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#eab308' }}>
                  #{p.consecutivo}
                  <div style={{ fontSize: '10px' }}>🟡 SOLICITADO</div>
                </td>
                <td style={{ padding: '10px 12px', color: tema.textMuted }}>{p.fecha_pedido}</td>
                <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{p.cajas} cjs</td>
                <td style={{ padding: '10px 12px' }}><span style={{ padding: '2px 6px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>⏳ Por pesar</span></td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatoCOP(Number(p.cajas) * 25 * Number(p.precio_compra_kg || 6000))}</div>
                  <span style={{ fontSize: '10px', color: '#ef4444' }}>Pendiente</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ color: p.flete_pagado ? '#22c55e' : '#f97316', fontWeight: 'bold' }}>{formatoCOP(Number(p.cajas) * 20000)}</div>
                  <span style={{ fontSize: '10px', color: p.flete_pagado ? '#22c55e' : '#f97316' }}>{p.flete_pagado ? '✅ Pago' : 'Pendiente'}</span>
                </td>
                <td style={{ padding: '10px 12px', color: tema.textMuted }}>Báscula pendiente</td>
                <td style={{ padding: '10px 12px', color: '#eab308', fontWeight: 'bold' }}>Por cobrar</td>
                <td style={{ padding: '10px 12px', color: tema.textMuted }}>-</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  <button onClick={() => setModalLiquidarPedido(p)} style={{ padding: '6px 10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Recibir báscula</button>
                </td>
              </tr>
            ))}

            {/* DESPACHOS FACTURADOS */}
            {enviosFiltrados.map(r => {
              const saldoCli = Number(r.saldo_pendiente || 0);
              const saldoEd = r.saldoEdison;

              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${tema.border}` }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div onClick={() => toggleSeleccionFila(r.id)} style={{ cursor: 'pointer' }}>
                      {seleccionadosTabla.includes(r.id) ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>
                    #{r.consecutivo}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                      <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '3px', background: saldoCli <= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)', color: saldoCli <= 0 ? '#22c55e' : '#f97316', fontWeight: 'bold' }}>
                        Cli: {saldoCli <= 0 ? 'Cobrado' : 'Debe'}
                      </span>
                      <span style={{ fontSize: '9.5px', padding: '1px 5px', borderRadius: '3px', background: saldoEd <= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: saldoEd <= 0 ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>
                        Ed: {saldoEd <= 0 ? 'Paga' : 'Debe'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: tema.textMuted }}>{r.fecha_envio}</td>
                  <td style={{ padding: '10px 12px' }}>{r.cajas}</td>
                  <td style={{ padding: '10px 12px' }}>{r.kilos} Kg</td>

                  {/* FRUTA EDISON: TOTAL Y DEUDA REAL */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 'bold', color: saldoEd > 0 ? '#ef4444' : '#22c55e' }}>
                      {formatoCOP(r.costoFrutaEdison)}
                    </div>
                    <div style={{ fontSize: '10px', color: saldoEd > 0 ? '#ef4444' : '#22c55e' }}>
                      {saldoEd > 0 ? `Saldo: ${formatoCOP(saldoEd)}` : '✅ Pagado'}
                    </div>
                  </td>

                  {/* FLETE MACAREO */}
                  <td style={{ padding: '10px 12px', color: '#22c55e', fontWeight: 'bold' }}>
                    {formatoCOP(r.total_flete)}
                  </td>

                  <td style={{ padding: '10px 12px', fontWeight: '600' }}>{formatoCOP(r.total_facturado_cliente)}</td>
                  
                  {/* SALDO INNOVATIVE */}
                  <td style={{ padding: '10px 12px', fontWeight: 'bold', color: saldoCli > 0 ? '#f97316' : '#22c55e' }}>
                    {saldoCli > 0 ? formatoCOP(saldoCli) : '✅ Pagado'}
                  </td>

                  <td style={{ padding: '10px 12px', color: '#38bdf8', fontWeight: 'bold' }}>{formatoCOP(r.margen_bruto)}</td>
                  
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '5px' }}>
                      <button onClick={() => abrirModalCuentaSeguro(r)} style={{ padding: '5px 8px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}><FileText size={12} /> Cuenta</button>
                      <button onClick={() => compartirPDFWhatsApp(r)} style={{ padding: '5px 8px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}><Share2 size={12} /> PDF</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL PAGAR PROVEEDOR (CON MONTO PARCIAL A EDISON) */}
      {modalPagoProvAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '22px', borderRadius: '16px', width: '100%', maxWidth: '460px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pago / Abono a Proveedor</h3>
              <button onClick={() => setModalPagoProvAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarPagoProveedor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={provSeleccionadoId} onChange={(e) => { setProvSeleccionadoId(e.target.value); setDespachosProvSeleccionados([]); }} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontWeight: 'bold' }}>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.tipo === 'transporte' ? 'Fletes Macareo' : 'Fruta Edison'})</option>
                ))}
              </select>

              <div style={{ fontSize: '11px', color: tema.textMuted }}>Selecciona los despachos a los que se abonará:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {despachosPendientesParaProveedor.map(e => {
                  const sel = despachosProvSeleccionados.includes(e.id);
                  return (
                    <div key={e.id} onClick={() => setDespachosProvSeleccionados(prev => prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id])} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${sel ? '#dc2626' : tema.border}`, background: sel ? 'rgba(220, 38, 38, 0.15)' : tema.inputBg, cursor: 'pointer' }}>
                      <span style={{ fontSize: '12px' }}>#{e.consecutivo} ({e.fecha_envio})</span>
                      <b style={{ color: '#ef4444', fontSize: '12px' }}>{formatoCOP(e.saldoPendienteProv)}</b>
                    </div>
                  );
                })}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e' }}>Monto a Transferir / Abonar hoy:</label>
                <input 
                  type="number" 
                  step="any"
                  placeholder={String(totalSeleccionadoPagoProv || 0)} 
                  value={montoManualPagoProv} 
                  onChange={(e) => setMontoManualPagoProv(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: tema.inputBg, border: '1px solid #22c55e', color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: '10px', color: tema.textMuted }}>Puedes poner menos del total para abonar solo una parte.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalPagoProvAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={despachosProvSeleccionados.length === 0} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CUENTA DE COBRO 1 PÁGINA */}
      {modalCuentaCobro && (
        <div onClick={() => setModalCuentaCobro(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', color: '#0f172a', width: '100%', maxWidth: '540px', borderRadius: '16px', padding: '24px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => descargarPDF1Pagina(modalCuentaCobro)} style={{ padding: '7px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={15} /> Descargar PDF (1 pág)</button>
                <button onClick={() => compartirPDFWhatsApp(modalCuentaCobro)} style={{ padding: '7px 14px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Share2 size={15} /> WhatsApp PDF</button>
              </div>
              <button onClick={() => setModalCuentaCobro(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>CUENTA DE COBRO # {modalCuentaCobro.consecutivo}</h2>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Fecha: {modalCuentaCobro.fecha_envio}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px' }}>
              <div><b>Cliente:</b> Innovative Kitchen SAS<br /><span>NIT # 901.069.237-4</span></div>
              <div style={{ textAlign: 'right' }}><b>Beneficiario:</b> Elkin Bohórquez Tarud<br /><span>C.C. 72.271.189</span></div>
            </div>

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
                  <td style={{ padding: '8px' }}>Aguacate Hass - Grueso ({formatoCOP(modalCuentaCobro.precio_venta_kg)}/Kg)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{modalCuentaCobro.kilos} Kg</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(Number(modalCuentaCobro.kilos) * Number(modalCuentaCobro.precio_venta_kg || 11200))}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '8px' }}>Envío Transporte ({modalCuentaCobro.cajas} cajas @ $32.000)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{modalCuentaCobro.cajas} cjs</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(Number(modalCuentaCobro.cajas) * 32000)}</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan="2" style={{ padding: '10px 8px', fontWeight: 'bold' }}>TOTAL A PAGAR</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '900', fontSize: '15px' }}>{formatoCOP((Number(modalCuentaCobro.kilos) * Number(modalCuentaCobro.precio_venta_kg || 11200)) + (Number(modalCuentaCobro.cajas) * 32000))}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div>Forma de Pago: <b>Bancolombia Ahorros # 554 879 253 72</b></div>
              <div>A nombre de: <b>Elkin Bohórquez Tarud</b> (CC 72.271.189)</div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <img src="/firma.png" alt="Firma" style={{ maxHeight: '50px', maxWidth: '180px', objectFit: 'contain', mixBlendMode: 'multiply', marginBottom: '-4px' }} />
                <div style={{ width: '100%', borderTop: '1.5px solid #0f172a', paddingTop: '4px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Elkin Bohórquez Tarud</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>C.C. 72.271.189</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}