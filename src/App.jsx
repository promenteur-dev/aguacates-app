import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { 
  PlusCircle, Package, TrendingUp, AlertCircle, RefreshCw, Moon, Sun, X, 
  BarChart3, ListFilter, Search, Filter, DollarSign, CheckCircle2, 
  ArrowUpRight, Truck, Check, Edit2, FileText, Printer, Send, CheckSquare, Square,
  ArrowUpDown, ArrowUp, ArrowDown, Download, Trash2, Clock, CheckCheck, Fingerprint, Scale
} from 'lucide-react';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorBiometria, setErrorBiometria] = useState('');

  // Detección directa de pantalla móvil
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

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
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [modalLiquidarPedido, setModalLiquidarPedido] = useState(null);
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

  // Formularios
  const [formLiquidar, setFormLiquidar] = useState({
    consecutivo: '',
    fecha_envio: new Date().toISOString().split('T')[0],
    kilos: '',
    notas: ''
  });

  const [formPedido, setFormPedido] = useState({
    fecha_pedido: new Date().toISOString().split('T')[0],
    cajas: '',
    precio_compra_kg: 6000,
    precio_venta_kg: 11200,
    costo_flete_caja: 32000,
    notas: ''
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

  // Gráfico
  const [agrupacionRunChart, setAgrupacionRunChart] = useState('mes');
  const [seriesVisibles, setSeriesVisibles] = useState({
    venta: true,
    margen: true,
    costoFruta: true,
    flete: false,
    saldo: false
  });

  const PRECIOS_COMPRA = [6000, 6500, 7000, 7500, 8000, 8500, 9000];
  const PRECIOS_VENTA = [9500, 10000, 10200, 10500, 11000, 11200, 11500, 12000, 15750];
  const TARIFAS_FLETE = [32000, 30000, 35000];

  useEffect(() => {
    const sesionValida = sessionStorage.getItem('aguacates_auth');
    if (sesionValida === 'true') {
      setAutenticado(true);
      cargarDatos();
    } else {
      intentarBiometria();
    }
  }, []);

  async function intentarBiometria() {
    setErrorBiometria('');
    try {
      if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const disponible = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (disponible) {
          sessionStorage.setItem('aguacates_auth', 'true');
          setAutenticado(true);
          cargarDatos();
        }
      }
    } catch (err) {
      console.log('Biometría cancelada o no disponible:', err);
    }
  }

  function desbloquearConPin(e) {
    e.preventDefault();
    if (pinInput === '7227' || pinInput === '0000') {
      sessionStorage.setItem('aguacates_auth', 'true');
      setAutenticado(true);
      cargarDatos();
    } else {
      setErrorBiometria('PIN incorrecto. Intenta de nuevo.');
      setPinInput('');
    }
  }

  function calcularSiguienteConsecutivo(listaEnvios) {
    if (!listaEnvios || listaEnvios.length === 0) return '000001';
    const numeros = listaEnvios.map(e => {
      const limpio = String(e.consecutivo || '').replace(/\D/g, '');
      return limpio ? parseInt(limpio, 10) : 0;
    });
    return String(Math.max(...numeros, 0) + 1).padStart(6, '0');
  }

  async function cargarDatos() {
    setLoading(true);

    const { data: dataEnvios } = await supabase
      .from('v_resumen_envios')
      .select('*')
      .order('consecutivo', { ascending: false });

    if (dataEnvios) {
      setEnvios(dataEnvios);
    }

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

  function enviarWhatsApp(envio) {
    const texto = `Hola, adjunto los detalles de la Cuenta de Cobro #${envio.consecutivo} con fecha ${envio.fecha_envio}:%0A%0A` +
      `🥑 *Concepto:* Aguacate Hass - Grueso%0A` +
      `📦 *Cantidad:* ${envio.kilos} Kg (${envio.cajas} Cajas)%0A` +
      `💰 *Subtotal Fruta:* ${formatoCOP(envio.total_venta_fruta)}%0A` +
      `🚚 *Flete (${envio.cajas} cajas):* ${formatoCOP(envio.total_flete)}%0A` +
      `🧾 *TOTAL A PAGAR:* ${formatoCOP(envio.total_facturado_cliente)}%0A%0A` +
      `💳 *Datos Bancarios:*%0A` +
      `Bancolombia Ahorros # 554 879 253 72%0A` +
      `Elkin Bohórquez Tarud - CC 72.271.189%0A%0A` +
      `Quedo atento a la confirmación de la transferencia. ¡Muchas gracias!`;

    const urlApp = `whatsapp://send?text=${texto}`;
    const urlWeb = `https://web.whatsapp.com/send?text=${texto}`;

    const win = window.open(urlApp, '_self');
    setTimeout(() => {
      if (!win || win.closed) {
        window.open(urlWeb, '_blank');
      }
    }, 400);
  }

  function abrirModalCrearPedido() {
    setFormPedido({
      fecha_pedido: new Date().toISOString().split('T')[0],
      cajas: '',
      precio_compra_kg: 6000,
      precio_venta_kg: 11200,
      costo_flete_caja: 32000,
      notas: ''
    });
    setModalNuevoPedido(true);
  }

  async function guardarNuevoPedido(e) {
    e.preventDefault();
    const { error } = await supabase.from('pedidos').insert([{
      fecha_pedido: formPedido.fecha_pedido,
      cajas: Number(formPedido.cajas),
      precio_compra_kg: Number(formPedido.precio_compra_kg),
      precio_venta_kg: Number(formPedido.precio_venta_kg),
      costo_flete_caja: Number(formPedido.costo_flete_caja),
      notas: formPedido.notas
    }]);

    if (!error) {
      setModalNuevoPedido(false);
      await cargarDatos();
    } else {
      alert('Error guardando pedido: ' + error.message);
    }
  }

  function iniciarLiquidacionPedido(pedidoItem) {
    setModalLiquidarPedido(pedidoItem);
    setFormLiquidar({
      consecutivo: pedidoItem.consecutivo_asignado || calcularSiguienteConsecutivo(envios),
      fecha_envio: pedidoItem.fecha_pedido,
      kilos: '',
      notas: pedidoItem.notas || ''
    });
  }

  async function confirmarLiquidacionPedido(e) {
    e.preventDefault();
    if (!modalLiquidarPedido || !formLiquidar.kilos || Number(formLiquidar.kilos) <= 0) return;

    const { error: errorEnvio } = await supabase.from('envios').insert([{
      consecutivo: formLiquidar.consecutivo,
      fecha_envio: formLiquidar.fecha_envio,
      cajas: Number(modalLiquidarPedido.cajas),
      kilos: Number(formLiquidar.kilos),
      precio_compra_kg: Number(modalLiquidarPedido.precio_compra_kg),
      precio_venta_kg: Number(modalLiquidarPedido.precio_venta_kg),
      costo_flete_caja: Number(modalLiquidarPedido.costo_flete_caja),
      notas: formLiquidar.notas
    }]);

    if (!errorEnvio) {
      await supabase.from('pedidos').update({ estado: 'liquidado' }).eq('id', modalLiquidarPedido.id);
      setModalLiquidarPedido(null);
      await cargarDatos();
    } else {
      alert('Error liquidando pedido: ' + errorEnvio.message);
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
    setNotasPagoProv('Transferencia Bancolombia liquidación despachos');
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
      alert('Error actualizando precio: ' + error.message);
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
          notas: notasAbonoMultiple || `Abono parcial recibido (${formatoCOP(valorReal)})`
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

  const formatoMesEspanol = (yyyyMm) => {
    if (!yyyyMm || yyyyMm === 'todos') return 'Todos los meses';
    const partes = yyyyMm.split('-');
    if (partes.length < 2) return yyyyMm;
    const year = partes[0];
    const month = parseInt(partes[1], 10);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[month - 1]} ${year}`;
  };

  const totalCostoFruta = envios.reduce((acc, e) => acc + Number(e.total_compra_fruta || 0), 0);
  const totalCostoFlete = envios.reduce((acc, e) => acc + Number(e.total_flete || 0), 0);

  const pagadoFruta = pagosProveedores
    .filter(p => p.concepto === 'fruta')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const pagadoFlete = pagosProveedores
    .filter(p => p.concepto === 'transporte')
    .reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const deudaEdison = Math.max(0, totalCostoFruta - pagadoFruta);
  const deudaMacareo = Math.max(0, totalCostoFlete - pagadoFlete);

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
    const pedidosActivos = pedidos.filter(p => p.estado === 'pendiente');
    let baseNum = envios.length > 0 
      ? Math.max(...envios.map(e => parseInt(String(e.consecutivo || '').replace(/\D/g, '') || '0', 10)), 0)
      : 0;

    return pedidosActivos.map((p, idx) => ({
      ...p,
      esPedido: true,
      consecutivo: String(baseNum + idx + 1).padStart(6, '0'),
      consecutivo_asignado: String(baseNum + idx + 1).padStart(6, '0'),
      fecha_envio: p.fecha_pedido
    }));
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
  const promedioMargenDespacho = enviosParaMetricas.length > 0 ? (margenTotal / enviosParaMetricas.length) : 0;

  const abonosDelEnvioModal = useMemo(() => {
    if (!modalHistorialAbonos) return [];
    return abonosCliente.filter(a => a.envio_id === modalHistorialAbonos.id);
  }, [modalHistorialAbonos, abonosCliente]);

  const datosAgrupados = useMemo(() => {
    if (agrupacionRunChart === 'envio') {
      return [...enviosFiltrados].sort((a,b) => a.consecutivo.localeCompare(b.consecutivo)).map((e) => ({
        label: `#${e.consecutivo}`,
        fecha: e.fecha_envio,
        venta: Number(e.total_facturado_cliente || 0),
        margen: Number(e.margen_bruto || 0),
        costoFruta: Number(e.total_compra_fruta || 0),
        flete: Number(e.total_flete || 0),
        saldo: Number(e.saldo_pendiente || 0)
      }));
    }

    const mapa = {};
    enviosFiltrados.forEach(e => {
      let clave = e.fecha_envio;
      let labelLegible = e.fecha_envio;

      if (agrupacionRunChart === 'mes') {
        clave = e.fecha_envio.substring(0, 7);
        const [y, m] = clave.split('-');
        const nombresCortos = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        labelLegible = `${nombresCortos[parseInt(m, 10) - 1]} ${y}`;
      }
      if (agrupacionRunChart === 'ano') {
        clave = e.fecha_envio.substring(0, 4);
        labelLegible = clave;
      }
      if (agrupacionRunChart === 'semana') {
        const d = new Date(e.fecha_envio);
        const inicioAno = new Date(d.getFullYear(), 0, 1);
        const sem = Math.ceil((((d - inicioAno) / 86400000) + inicioAno.getDay() + 1) / 7);
        clave = `${d.getFullYear()}-W${sem}`;
        labelLegible = `Sem ${sem}`;
      }

      if (!mapa[clave]) {
        mapa[clave] = { label: labelLegible, venta: 0, margen: 0, costoFruta: 0, flete: 0, saldo: 0, claveSort: clave };
      }
      mapa[clave].venta += Number(e.total_facturado_cliente || 0);
      mapa[clave].margen += Number(e.margen_bruto || 0);
      mapa[clave].costoFruta += Number(e.total_compra_fruta || 0);
      mapa[clave].flete += Number(e.total_flete || 0);
      mapa[clave].saldo += Number(e.saldo_pendiente || 0);
    });

    return Object.values(mapa).sort((a,b) => a.claveSort?.localeCompare(b.claveSort));
  }, [enviosFiltrados, agrupacionRunChart]);

  const chartWidth = 720;
  const chartHeight = 260;
  const padX = 40;
  const padY = 30;

  const maxGrafico = useMemo(() => {
    let max = 100000;
    datosAgrupados.forEach(d => {
      if (seriesVisibles.venta && d.venta > max) max = d.venta;
      if (seriesVisibles.margen && d.margen > max) max = d.margen;
      if (seriesVisibles.costoFruta && d.costoFruta > max) max = d.costoFruta;
      if (seriesVisibles.flete && d.flete > max) max = d.flete;
      if (seriesVisibles.saldo && d.saldo > max) max = d.saldo;
    });
    return max * 1.1;
  }, [datosAgrupados, seriesVisibles]);

  function generarPath(clave) {
    if (datosAgrupados.length === 0) return '';
    return datosAgrupados.map((d, i) => {
      const x = padX + (i / (datosAgrupados.length > 1 ? datosAgrupados.length - 1 : 1)) * (chartWidth - padX * 2);
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

  const montoRecibidoNum = Number(montoRealRecibido || totalSeleccionadoAbonoMultiple);
  const diferenciaDescuento = Math.max(0, totalSeleccionadoAbonoMultiple - montoRecibidoNum);

  // Pantalla de bloqueo
  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '24px', padding: '32px 20px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '44px', marginBottom: '8px' }}>🥑</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Aguacates & Tesorería</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>Acceso seguro biométrico</p>

          <button
            onClick={intentarBiometria}
            style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}
          >
            <Fingerprint size={22} /> Desbloquear con Huella
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
              style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }}
            />
            {errorBiometria && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errorBiometria}</span>}
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Ingresar
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

      {/* TARJETAS KPI (2 COLUMNAS EN CELULAR) */}
      <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', marginBottom: '14px' }}>
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

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>MARGEN BRUTO</span>
            <TrendingUp size={13} color="#22c55e" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e', marginTop: '4px' }}>{formatoCOP(margenTotal)}</div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            Prom: {formatoCOP(promedioMargenDespacho)}/env
          </div>
        </div>

        <div style={{ background: tema.cardBg, padding: '12px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '10px', fontWeight: '800' }}>
            <span>FRUTA DESPACHADA</span>
            <Package size={13} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: tema.textMain, marginTop: '4px' }}>
            {Number(totalKilos).toFixed(1)} Kg
          </div>
          <div style={{ fontSize: '10px', color: tema.textMuted, marginTop: '2px' }}>
            En {totalCajas} cajas
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
          Registros ({enviosFiltrados.length})
        </button>
        <button onClick={() => setPestanaActiva('dashboard')} style={{ flex: 1, padding: '8px', background: pestanaActiva === 'dashboard' ? tema.cardBg : 'transparent', border: `1px solid ${pestanaActiva === 'dashboard' ? '#38bdf8' : tema.border}`, borderRadius: '8px', color: pestanaActiva === 'dashboard' ? '#38bdf8' : tema.textMuted, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
          Gráfica
        </button>
      </div>

      {/* VISTA 1: REGISTROS */}
      {pestanaActiva === 'registros' && (
        esMovil ? (
          /* ==================== A) VISTA MÓVIL (TARJETAS INDEPENDIENTES) ==================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* PEDIDOS PENDIENTES */}
            {pedidosPendientesConConsecutivo.map((p) => (
              <div 
                key={p.id}
                style={{
                  background: tema.cardBg,
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  borderLeft: '4px solid #eab308'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '900', fontSize: '17px', color: '#eab308' }}>#{p.consecutivo}</span>
                      <span style={{ padding: '2px 6px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>PEDIDO</span>
                    </div>
                    <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>Fecha: {p.fecha_pedido}</div>
                  </div>

                  <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308' }}>
                    ⏳ Por pesar
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: tema.textMuted }}>Cajas:</span> <b>{p.cajas} cajas</b>
                  </div>
                  <div>
                    <span style={{ color: tema.textMuted }}>Compra Edison:</span> <b style={{ color: '#ef4444' }}>{formatoCOP(p.precio_compra_kg)}/Kg</b>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => iniciarLiquidacionPedido(p)}
                    style={{ flex: 1, padding: '11px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CheckCheck size={16} /> Recibir báscula
                  </button>
                  <button
                    onClick={() => cancelarPedido(p.id)}
                    style={{ padding: '11px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

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
                        <div style={{ fontWeight: '900', fontSize: '17px' }}>#{r.consecutivo}</div>
                        <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '2px' }}>{r.fecha_envio}</div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', fontSize: '16px', color: saldo > 0 ? '#f97316' : '#22c55e' }}>
                          {saldo > 0 ? formatoCOP(saldo) : '✅ Pagado'}
                        </div>
                        <div style={{ fontSize: '10px', color: tema.textMuted }}>{saldo > 0 ? 'Saldo pendiente' : 'Saldado'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: tema.textMuted }}>Cajas:</span> <b>{r.cajas}</b> | <span style={{ color: tema.textMuted }}>Kilos:</span> <b>{r.kilos} Kg</b>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: tema.textMuted }}>Margen:</span> <b style={{ color: '#38bdf8' }}>{formatoCOP(r.margen_bruto)}</b>
                      </div>
                    </div>

                    {/* Botones al ancho del pulgar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '6px' }}>
                      <button
                        onClick={() => abrirModalEditarDespacho(r)}
                        style={{ padding: '9px 12px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit2 size={14} color="#38bdf8" />
                      </button>

                      <button
                        onClick={() => setModalCuentaCobro(r)}
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
          /* ==================== B) VISTA PC (TABLA COMPLETA) ==================== */
          <div style={{ background: tema.cardBg, borderRadius: '14px', border: `1px solid ${tema.border}`, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: tema.thBg, borderBottom: `1px solid ${tema.border}`, color: tema.textMuted }}>
                  <th style={{ padding: '12px 14px', width: '36px', textAlign: 'center' }}>
                    <div onClick={() => toggleSeleccionarTodoTabla(enviosFiltrados.map(e => e.id))} style={{ cursor: 'pointer' }}>
                      {seleccionadosTabla.length > 0 && seleccionadosTabla.length === enviosFiltrados.length ? <CheckSquare size={16} color="#38bdf8" /> : <Square size={16} color={tema.textMuted} />}
                    </div>
                  </th>
                  <th onClick={() => handleOrdenar('consecutivo')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Consecutivo</th>
                  <th onClick={() => handleOrdenar('fecha_envio')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Fecha</th>
                  <th onClick={() => handleOrdenar('cajas')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Cajas</th>
                  <th onClick={() => handleOrdenar('kilos')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Kilos</th>
                  <th onClick={() => handleOrdenar('precio_compra_kg')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Compra Edison</th>
                  <th onClick={() => handleOrdenar('total_facturado_cliente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Facturado</th>
                  <th onClick={() => handleOrdenar('saldo_pendiente')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Saldo Cliente</th>
                  <th onClick={() => handleOrdenar('margen_bruto')} style={{ padding: '12px 14px', cursor: 'pointer' }}>Margen</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientesConConsecutivo.map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${tema.rowBorder}`, background: 'rgba(234, 179, 8, 0.08)', borderLeft: '3px solid #eab308' }}>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}><Clock size={16} color="#eab308" /></td>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#eab308' }}>#{p.consecutivo} <span style={{ fontSize: '10px' }}>(PEDIDO)</span></td>
                    <td style={{ padding: '12px 14px', color: tema.textMuted }}>{p.fecha_pedido}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{p.cajas} cajas</td>
                    <td style={{ padding: '12px 14px' }}><span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '11px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', fontWeight: 'bold' }}>⏳ Por pesar</span></td>
                    <td style={{ padding: '12px 14px', color: '#ef4444', fontWeight: 'bold' }}>{formatoCOP(p.precio_compra_kg)}</td>
                    <td style={{ padding: '12px 14px', color: tema.textMuted }}>Báscula pendiente</td>
                    <td style={{ padding: '12px 14px', color: '#eab308', fontWeight: 'bold' }}>Por cobrar</td>
                    <td style={{ padding: '12px 14px', color: tema.textMuted }}>-</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => iniciarLiquidacionPedido(p)} style={{ padding: '6px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCheck size={14} /> Recibir báscula
                        </button>
                        <button onClick={() => cancelarPedido(p.id)} style={{ padding: '6px 8px', background: 'transparent', border: `1px solid ${tema.border}`, color: '#ef4444', borderRadius: '6px', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

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
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>#{r.consecutivo}</td>
                      <td style={{ padding: '12px 14px', color: tema.textMuted }}>{r.fecha_envio}</td>
                      <td style={{ padding: '12px 14px' }}>{r.cajas}</td>
                      <td style={{ padding: '12px 14px' }}>{r.kilos} Kg</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => setModalEditarPrecioCompra(r)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                          {formatoCOP(r.precio_compra_kg)} <Edit2 size={11} color={tema.textMuted} />
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '600' }}>{formatoCOP(r.total_facturado_cliente)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold', color: saldo > 0 ? '#f97316' : '#22c55e' }}>{formatoCOP(saldo)}</td>
                      <td style={{ padding: '12px 14px', color: '#38bdf8', fontWeight: '600' }}>{formatoCOP(r.margen_bruto)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => abrirModalEditarDespacho(r)} style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, borderRadius: '6px', cursor: 'pointer' }}>
                            <Edit2 size={12} color="#38bdf8" />
                          </button>
                          <button onClick={() => setModalCuentaCobro(r)} style={{ padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
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

      {/* VISTA 2: GRÁFICO */}
      {pestanaActiva === 'dashboard' && (
        <div style={{ background: tema.cardBg, padding: '16px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Run Chart</h3>
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

          <div style={{ overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', minWidth: '550px' }}>
              <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke={tema.chartGrid} />
              {seriesVisibles.venta && <path d={generarPath('venta')} fill="none" stroke="#3b82f6" strokeWidth="2" />}
              {seriesVisibles.margen && <path d={generarPath('margen')} fill="none" stroke="#22c55e" strokeWidth="2.5" />}
              {seriesVisibles.costoFruta && <path d={generarPath('costoFruta')} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />}

              {datosAgrupados.map((d, i) => {
                const x = padX + (i / (datosAgrupados.length > 1 ? datosAgrupados.length - 1 : 1)) * (chartWidth - padX * 2);
                const yMargen = chartHeight - padY - (d.margen / maxGrafico) * (chartHeight - padY * 2);
                return (
                  <g key={i}>
                    <circle cx={x} cy={yMargen} r="4" fill="#22c55e" />
                    <text x={x} y={chartHeight - padY + 16} fill={tema.textMuted} fontSize="10" textAnchor="middle">{d.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ==================== MODALES ==================== */}

      {/* MODAL: NUEVO PEDIDO */}
      {modalNuevoPedido && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Nuevo Pedido Solicitado</h3>
              <button onClick={() => setModalNuevoPedido(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarNuevoPedido} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: tema.textMuted }}>Fecha Pedido</label>
                  <input type="date" required value={formPedido.fecha_pedido} onChange={(e) => setFormPedido({...formPedido, fecha_pedido: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#eab308' }}>Número de Cajas *</label>
                  <input type="number" step="any" required placeholder="0" autoFocus value={formPedido.cajas} onChange={(e) => setFormPedido({...formPedido, cajas: e.target.value})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#eab308', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', border: `1px solid ${tema.border}`, fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: tema.textMuted }}>Kilos Teóricos Edison:</span>
                  <b>{Number(formPedido.cajas || 0) * 25} Kg (25 Kg / cja)</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: tema.textMuted }}>Costo Fruta (@ {formatoCOP(formPedido.precio_compra_kg)}):</span>
                  <b style={{ color: '#ef4444' }}>{formatoCOP(Number(formPedido.cajas || 0) * 25 * formPedido.precio_compra_kg)}</b>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: tema.textMuted }}>Compra/Kg Edison</label>
                  <select value={formPedido.precio_compra_kg} onChange={(e) => setFormPedido({...formPedido, precio_compra_kg: Number(e.target.value)})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px' }}>
                    {PRECIOS_COMPRA.map(p => <option key={p} value={p}>{formatoCOP(p)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: tema.textMuted }}>Venta/Kg Innovative</label>
                  <select value={formPedido.precio_venta_kg} onChange={(e) => setFormPedido({...formPedido, precio_venta_kg: Number(e.target.value)})} style={{ width: '100%', padding: '8px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px' }}>
                    {PRECIOS_VENTA.map(p => <option key={p} value={p}>{formatoCOP(p)}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalNuevoPedido(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#eab308', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LIQUIDAR BÁSCULA */}
      {modalLiquidarPedido && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Confirmar Báscula Innovative</h3>
              <button onClick={() => setModalLiquidarPedido(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '10px', borderRadius: '8px', border: `1px solid ${tema.border}`, marginBottom: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span>Cajas:</span> <b>{modalLiquidarPedido.cajas} cajas</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Costo Edison (25 Kg/cja):</span>
                <b style={{ color: '#ef4444' }}>{formatoCOP(Number(modalLiquidarPedido.cajas) * 25 * modalLiquidarPedido.precio_compra_kg)}</b>
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
                <button type="submit" style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Crear Despacho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABONO CLIENTE INDIVIDUAL */}
      {modalAbonoAbierto && envioSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '380px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Registrar Pago #{envioSeleccionado.consecutivo}</h3>
              <button onClick={() => setModalAbonoAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: tema.textMuted }}>Monto Recibido (COP)</label>
                <input type="number" step="any" required autoFocus value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setModalAbonoAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABONO CLIENTE MÚLTIPLE */}
      {modalAbonoMultipleAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '480px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pago Conjunto Innovative</h3>
              <button onClick={() => setModalAbonoMultipleAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarAbonoMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {despachosPendientesCliente.map(e => {
                  const seleccionada = cuentasSeleccionadasModal.includes(e.id);
                  return (
                    <div key={e.id} onClick={() => toggleSeleccionCuentaModal(e.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', border: `1px solid ${seleccionada ? '#0284c7' : tema.border}`, background: seleccionada ? 'rgba(2, 132, 199, 0.15)' : tema.inputBg, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {seleccionada ? <CheckSquare size={16} color="#0284c7" /> : <Square size={16} color={tema.textMuted} />}
                        <span>#{e.consecutivo} ({e.fecha_envio})</span>
                      </div>
                      <b style={{ color: '#f97316' }}>{formatoCOP(e.saldo_pendiente)}</b>
                    </div>
                  );
                })}
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#22c55e' }}>Monto Real Transferido por Innovative:</label>
                <input type="number" step="any" value={montoRealRecibido} onChange={(e) => setMontoRealRecibido(e.target.value)} placeholder={String(totalSeleccionadoAbonoMultiple)} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${diferenciaDescuento > 0 ? '#f97316' : tema.inputBorder}`, color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              {diferenciaDescuento > 0 && (
                <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid #f97316', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Diferencia por bajas / merma:</span>
                    <span>-{formatoCOP(diferenciaDescuento)}</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={esDescuentoDefinitivo} onChange={(e) => setEsDescuentoDefinitivo(e.target.checked)} />
                    <span>Absorber diferencia y saldar cuentas a $0</span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalAbonoMultipleAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={cuentasSeleccionadasModal.length === 0} style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAGAR PROVEEDOR */}
      {modalPagoProvAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '480px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Pago a Proveedor</h3>
              <button onClick={() => setModalPagoProvAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={guardarPagoProveedorMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <select value={provSeleccionadoId} onChange={(e) => { setProvSeleccionadoId(e.target.value); setDespachosProvSeleccionados([]); }} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontWeight: 'bold' }}>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.tipo === 'transporte' ? 'Fletes Macareo' : 'Fruta Edison'})</option>
                ))}
              </select>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {despachosPendientesParaProveedor.map(e => {
                  const sel = despachosProvSeleccionados.includes(e.id);
                  return (
                    <div key={e.id} onClick={() => toggleSeleccionDespachoProv(e.id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', border: `1px solid ${sel ? '#dc2626' : tema.border}`, background: sel ? 'rgba(220, 38, 38, 0.15)' : tema.inputBg, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {sel ? <CheckSquare size={16} color="#dc2626" /> : <Square size={16} color={tema.textMuted} />}
                        <span>#{e.consecutivo} ({e.fecha_envio})</span>
                      </div>
                      <b style={{ color: '#ef4444' }}>{formatoCOP(e.saldoPendienteProv)}</b>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: darkMode ? '#0b1120' : '#f8fafc', borderRadius: '8px', border: `1px solid ${tema.border}` }}>
                <span>Total a Transferir:</span>
                <b style={{ color: '#ef4444', fontSize: '18px' }}>{formatoCOP(totalSeleccionadoPagoProv)}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setModalPagoProvAbierto(false)} style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={despachosProvSeleccionados.length === 0} style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Pagar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CUENTA DE COBRO IMPRIMIBLE */}
      {modalCuentaCobro && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 150, padding: '16px' }}>
          <div style={{ background: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '600px', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => imprimirConNombre(modalCuentaCobro)} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Printer size={14} /> PDF
                </button>
                <button onClick={() => enviarWhatsApp(modalCuentaCobro)} style={{ padding: '6px 12px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Send size={14} /> WhatsApp
                </button>
              </div>
              <button onClick={() => setModalCuentaCobro(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase' }}>CUENTA DE COBRO # {modalCuentaCobro.consecutivo}</h2>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Fecha: {modalCuentaCobro.fecha_envio}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '16px' }}>
              <div>
                <b>Cliente:</b> Innovative Kitchen SAS<br />
                <span>NIT # 901.069.237-4</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b>Beneficiario:</b> Elkin Bohórquez Tarud<br />
                <span>C.C. 72.271.189</span>
              </div>
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
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(modalCuentaCobro.total_venta_fruta)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #0f172a' }}>
                  <td style={{ padding: '8px' }}>Envío Transporte ({modalCuentaCobro.cajas} cajas)</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{modalCuentaCobro.cajas} cjs</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(modalCuentaCobro.total_flete)}</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td colSpan="2" style={{ padding: '10px 8px', fontWeight: 'bold' }}>TOTAL A PAGAR</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '900', fontSize: '15px' }}>{formatoCOP(modalCuentaCobro.total_facturado_cliente)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div>Bancolombia Ahorros: <b>554 879 253 72</b></div>
              <div>Titular: <b>Elkin Bohórquez Tarud</b> (CC 72.271.189)</div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '12px' }}>
              <img src="/firma.png" alt="Firma" style={{ maxHeight: '50px', maxWidth: '180px', mixBlendMode: 'multiply' }} />
              <div style={{ width: '180px', borderTop: '1px solid #334155', paddingTop: '4px' }}>
                <b>Elkin Bohórquez Tarud</b>
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