import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabase';
import { 
  PlusCircle, Package, TrendingUp, AlertCircle, RefreshCw, Moon, Sun, X, 
  BarChart3, ListFilter, Search, Filter, DollarSign, CheckCircle2, 
  ArrowUpRight, Truck, Check, Edit2, FileText, Printer, Send, CheckSquare, Square,
  ArrowUpDown, ArrowUp, ArrowDown, Download, Trash2
} from 'lucide-react';

export default function App() {
  const [envios, setEnvios] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [pagosProveedores, setPagosProveedores] = useState([]);
  const [abonosCliente, setAbonosCliente] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalAbonoAbierto, setModalAbonoAbierto] = useState(false);
  const [modalAbonoMultipleAbierto, setModalAbonoMultipleAbierto] = useState(false);
  const [modalPagoProvAbierto, setModalPagoProvAbierto] = useState(false);
  const [modalEditarPrecioCompra, setModalEditarPrecioCompra] = useState(null);
  const [modalEditarDespachoCompleto, setModalEditarDespachoCompleto] = useState(null);
  const [modalHistorialAbonos, setModalHistorialAbonos] = useState(null);
  const [modalCuentaCobro, setModalCuentaCobro] = useState(null);

  // Checkboxes de selección en la tabla principal
  const [seleccionadosTabla, setSeleccionadosTabla] = useState([]);

  // Estados Abono Individual Cliente
  const [envioSeleccionado, setEnvioSeleccionado] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [fechaAbono, setFechaAbono] = useState(new Date().toISOString().split('T')[0]);

  // Estados Abono Múltiple Cliente (Modal)
  const [cuentasSeleccionadasModal, setCuentasSeleccionadasModal] = useState([]);
  const [fechaAbonoMultiple, setFechaAbonoMultiple] = useState(new Date().toISOString().split('T')[0]);
  const [notasAbonoMultiple, setNotasAbonoMultiple] = useState('');
  const [montoRealRecibido, setMontoRealRecibido] = useState('');
  const [esDescuentoDefinitivo, setEsDescuentoDefinitivo] = useState(true);

  // Formulario de edición de despacho completo
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

  // Estados Pago Proveedor (Modal)
  const [provSeleccionadoId, setProvSeleccionadoId] = useState('');
  const [despachosProvSeleccionados, setDespachosProvSeleccionados] = useState([]);
  const [fechaPagoProv, setFechaPagoProv] = useState(new Date().toISOString().split('T')[0]);
  const [notasPagoProv, setNotasPagoProv] = useState('');

  const [darkMode, setDarkMode] = useState(true);
  const [pestanaActiva, setPestanaActiva] = useState('tabla');

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');

  // Ordenamiento interactivo
  const [columnaOrden, setColumnaOrden] = useState('consecutivo');
  const [direccionOrden, setDireccionOrden] = useState('desc');

  // Run Chart
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

  const [formData, setFormData] = useState({
    consecutivo: '000593',
    fecha_envio: new Date().toISOString().split('T')[0],
    cajas: '',
    kilos: '',
    precio_compra_kg: 8000,
    precio_venta_kg: 11200,
    costo_flete_caja: 32000,
    notas: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

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
      setFormData(prev => ({
        ...prev,
        consecutivo: calcularSiguienteConsecutivo(dataEnvios)
      }));
    }

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

  // Impresión asignando el nombre de archivo con consecutivo
  function imprimirConNombre(envio) {
    const tituloOriginal = document.title;
    document.title = `${envio.consecutivo} - Cuenta de cobro - aguacates`;
    window.print();
    setTimeout(() => {
      document.title = tituloOriginal;
    }, 1000);
  }

  // Envío a WhatsApp abriendo la app nativa o WhatsApp Web
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

  function abrirModalNuevo() {
    setFormData(prev => ({
      ...prev,
      consecutivo: calcularSiguienteConsecutivo(envios),
      fecha_envio: new Date().toISOString().split('T')[0],
      cajas: '',
      kilos: '',
      precio_compra_kg: 8000,
      precio_venta_kg: 11200,
      costo_flete_caja: 32000,
      notas: ''
    }));
    setModalAbierto(true);
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

  async function eliminarAbono(abonoId) {
    if (!window.confirm('¿Seguro que deseas anular este abono? El saldo volverá a quedar pendiente.')) return;

    const { error } = await supabase
      .from('abonos_cliente')
      .delete()
      .eq('id', abonoId);

    if (!error) {
      await cargarDatos();
      setModalHistorialAbonos(null);
    } else {
      alert('Error anulando abono: ' + error.message);
    }
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

  async function guardarEnvio(e) {
    e.preventDefault();
    const { error } = await supabase.from('envios').insert([{
      consecutivo: formData.consecutivo,
      fecha_envio: formData.fecha_envio,
      cajas: Number(formData.cajas),
      kilos: Number(formData.kilos),
      precio_compra_kg: Number(formData.precio_compra_kg),
      precio_venta_kg: Number(formData.precio_venta_kg),
      costo_flete_caja: Number(formData.costo_flete_caja),
      notas: formData.notas
    }]);

    if (!error) {
      setModalAbierto(false);
      await cargarDatos();
    } else {
      alert('Error guardando envío: ' + error.message);
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

  const haySeleccionActiva = seleccionadosTabla.length > 0;
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

  const chartWidth = 920;
  const chartHeight = 320;
  const padX = 60;
  const padY = 40;

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

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1280px', margin: '0 auto', background: tema.bg, color: tema.textMain, minHeight: '100vh', transition: 'all 0.2s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>🥑</span>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Control de Aguacates & Tesorería</h1>
          </div>
          <p style={{ margin: '4px 0 0 36px', color: tema.textMuted, fontSize: '14px' }}>Liquidación de cuentas de cobro, fruta Edison y fletes Macareo</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setDarkMode(!darkMode)} title="Cambiar tema" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '10px', color: tema.textMain, cursor: 'pointer' }}>
            {darkMode ? <Sun size={18} color="#eab308" /> : <Moon size={18} color="#64748b" />}
          </button>

          <button onClick={cargarDatos} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '10px', color: tema.textMain, cursor: 'pointer', fontWeight: '500' }}>
            <RefreshCw size={16} /> Refrescar
          </button>

          <button 
            onClick={exportarCSV}
            title="Descargar datos en formato CSV para abrir en Excel o Drive"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '10px', color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}
          >
            <Download size={16} /> Exportar CSV
          </button>

          <button 
            onClick={abrirModalAbonoMultiple} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)' }}
          >
            <CheckSquare size={18} /> + Abono Cliente (Múltiple)
          </button>

          <button 
            onClick={abrirModalPagoProveedor} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)' }}
          >
            <ArrowUpRight size={18} /> Pagar Proveedor
          </button>

          <button onClick={abrirModalNuevo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
            <PlusCircle size={18} /> Nuevo Despacho
          </button>
        </div>
      </div>

      {/* TARJETAS KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setFiltroEstado(filtroEstado === 'pendientes' ? 'todos' : 'pendientes')}
          title="Haz clic para filtrar despachos pendientes"
          style={{ 
            background: tema.cardBg, 
            padding: '20px', 
            borderRadius: '14px', 
            border: `1px solid ${haySeleccionActiva ? '#38bdf8' : (filtroEstado === 'pendientes' ? '#f97316' : tema.border)}`, 
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '11px', fontWeight: '800' }}>
            <span>POR COBRAR (INNOVATIVE)</span>
            <AlertCircle size={17} color="#f97316" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#f97316', marginTop: '8px' }}>{formatoCOP(totalPorCobrar)}</div>
          <div style={{ fontSize: '12px', color: haySeleccionActiva ? '#38bdf8' : tema.textMuted, marginTop: '6px', fontWeight: haySeleccionActiva ? 'bold' : 'normal' }}>
            {haySeleccionActiva 
              ? `🎯 Sumando ${seleccionadosTabla.length} seleccionados`
              : (enviosConDeudaCliente > 0 ? `⚠️ ${enviosConDeudaCliente} de ${enviosParaMetricas.length} cuentas pendientes` : '✅ Cartera al día')
            }
          </div>
        </div>

        <div style={{ background: tema.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '11px', fontWeight: '800' }}>
            <span>DEBO A EDISON (FRUTA)</span>
            <ArrowUpRight size={17} color="#ef4444" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444', marginTop: '8px' }}>{formatoCOP(deudaEdison)}</div>
          <div style={{ fontSize: '12px', color: tema.textMuted, marginTop: '6px' }}>
            {deudaEdison > 0 ? `${despachosPendientesParaProveedor.length} despachos por liquidar` : '✅ Fruta 100% paga'}
          </div>
        </div>

        <div style={{ background: tema.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '11px', fontWeight: '800' }}>
            <span>DEBO A MACAREO (FLETES)</span>
            <Truck size={17} color="#22c55e" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: deudaMacareo === 0 ? '#22c55e' : '#eab308', marginTop: '8px' }}>
            {formatoCOP(deudaMacareo)}
          </div>
          <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px', fontWeight: '600' }}>
            ✅ Fletes al día ($0 pendientes)
          </div>
        </div>

        <div style={{ background: tema.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${haySeleccionActiva ? '#38bdf8' : tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '11px', fontWeight: '800' }}>
            <span>MARGEN BRUTO GENERADO</span>
            <TrendingUp size={17} color="#22c55e" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#22c55e', marginTop: '8px' }}>{formatoCOP(margenTotal)}</div>
          <div style={{ fontSize: '12px', color: haySeleccionActiva ? '#38bdf8' : tema.textMuted, marginTop: '6px', fontWeight: haySeleccionActiva ? 'bold' : 'normal' }}>
            {haySeleccionActiva 
              ? `🎯 De los ${seleccionadosTabla.length} despachos marcados`
              : `Promedio: ${formatoCOP(promedioMargenDespacho)} / envío`
            }
          </div>
        </div>

        <div style={{ background: tema.cardBg, padding: '20px', borderRadius: '14px', border: `1px solid ${haySeleccionActiva ? '#38bdf8' : tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: tema.textMuted, fontSize: '11px', fontWeight: '800' }}>
            <span>FRUTA DESPACHADA</span>
            <Package size={17} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: tema.textMain, marginTop: '8px' }}>
            {Number(totalKilos).toFixed(2)} Kg
          </div>
          <div style={{ fontSize: '12px', color: haySeleccionActiva ? '#38bdf8' : tema.textMuted, marginTop: '6px', fontWeight: haySeleccionActiva ? 'bold' : 'normal' }}>
            {haySeleccionActiva 
              ? `🎯 ${totalCajas} cajas en ${seleccionadosTabla.length} marcados`
              : `En ${totalCajas} cajas (${enviosParaMetricas.length} despachos)`
            }
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div style={{ background: tema.cardBg, padding: '14px 18px', borderRadius: '12px', border: `1px solid ${tema.border}`, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '700', fontSize: '13px' }}>
          <Filter size={16} /> FILTROS:
        </div>

        <div style={{ position: 'relative', minWidth: '180px', flex: '1' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: tema.textMuted }} />
          <input 
            type="text" 
            placeholder="Buscar # o fecha..." 
            value={filtroTexto} 
            onChange={(e) => setFiltroTexto(e.target.value)} 
            style={{ width: '100%', padding: '8px 10px 8px 32px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setFiltroEstado('todos')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: filtroEstado === 'todos' ? '#38bdf8' : tema.inputBg, color: filtroEstado === 'todos' ? '#090d16' : tema.textMuted, border: `1px solid ${tema.border}` }}>Todos</button>
          <button onClick={() => setFiltroEstado('pendientes')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: filtroEstado === 'pendientes' ? '#f97316' : tema.inputBg, color: filtroEstado === 'pendientes' ? '#090d16' : tema.textMuted, border: `1px solid ${tema.border}` }}>Pendientes</button>
          <button onClick={() => setFiltroEstado('saldados')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: filtroEstado === 'saldados' ? '#22c55e' : tema.inputBg, color: filtroEstado === 'saldados' ? '#090d16' : tema.textMuted, border: `1px solid ${tema.border}` }}>Saldados</button>
        </div>

        {mesesDisponibles.length > 0 && (
          <select 
            value={filtroMes} 
            onChange={(e) => setFiltroMes(e.target.value)} 
            style={{ padding: '8px 14px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
          >
            <option value="todos">Todos los meses</option>
            {mesesDisponibles.map(m => (
              <option key={m} value={m}>{formatoMesEspanol(m)}</option>
            ))}
          </select>
        )}

        {haySeleccionActiva && (
          <button 
            onClick={() => setSeleccionadosTabla([])}
            style={{ padding: '6px 12px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Deseleccionar ({seleccionadosTabla.length})
          </button>
        )}

        {(filtroTexto || filtroEstado !== 'todos' || filtroMes !== 'todos') && (
          <button onClick={() => { setFiltroTexto(''); setFiltroEstado('todos'); setFiltroMes('todos'); }} style={{ padding: '6px 10px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>Limpiar filtros</button>
        )}
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', borderBottom: `1px solid ${tema.border}`, paddingBottom: '8px' }}>
        <button onClick={() => setPestanaActiva('tabla')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: pestanaActiva === 'tabla' ? tema.cardBg : 'transparent', border: `1px solid ${pestanaActiva === 'tabla' ? tema.border : 'transparent'}`, borderRadius: '8px', color: pestanaActiva === 'tabla' ? '#38bdf8' : tema.textMuted, fontWeight: '700', cursor: 'pointer' }}>
          <ListFilter size={16} /> Registro de Despachos ({enviosFiltrados.length})
        </button>

        <button onClick={() => setPestanaActiva('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: pestanaActiva === 'dashboard' ? tema.cardBg : 'transparent', border: `1px solid ${pestanaActiva === 'dashboard' ? tema.border : 'transparent'}`, borderRadius: '8px', color: pestanaActiva === 'dashboard' ? '#38bdf8' : tema.textMuted, fontWeight: '700', cursor: 'pointer' }}>
          <BarChart3 size={16} /> Run Chart Multivariable
        </button>
      </div>

      {/* VISTA 1: TABLA */}
      {pestanaActiva === 'tabla' && (
        <div style={{ background: tema.cardBg, borderRadius: '14px', border: `1px solid ${tema.border}`, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: tema.thBg, borderBottom: `1px solid ${tema.border}`, color: tema.textMuted }}>
                
                <th style={{ padding: '14px 12px 14px 18px', width: '36px', textAlign: 'center' }}>
                  <div 
                    onClick={() => toggleSeleccionarTodoTabla(enviosFiltrados.map(e => e.id))}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={seleccionadosTabla.length === enviosFiltrados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                  >
                    {seleccionadosTabla.length > 0 && seleccionadosTabla.length === enviosFiltrados.length ? (
                      <CheckSquare size={18} color="#38bdf8" />
                    ) : (
                      <Square size={18} color={tema.textMuted} />
                    )}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('consecutivo')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Consecutivo {renderIconoOrden('consecutivo')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('fecha_envio')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Fecha {renderIconoOrden('fecha_envio')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('cajas')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Cajas {renderIconoOrden('cajas')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('kilos')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Kilos {renderIconoOrden('kilos')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('precio_compra_kg')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Compra/Kg (Edison) {renderIconoOrden('precio_compra_kg')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('total_facturado_cliente')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Facturado {renderIconoOrden('total_facturado_cliente')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('saldo_pendiente')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Saldo Cliente {renderIconoOrden('saldo_pendiente')}
                  </div>
                </th>

                <th onClick={() => handleOrdenar('margen_bruto')} style={{ padding: '14px 14px', cursor: 'pointer', userSelect: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Margen {renderIconoOrden('margen_bruto')}
                  </div>
                </th>

                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: tema.textMuted }}>Cargando registros...</td></tr>
              ) : enviosFiltrados.length === 0 ? (
                <tr><td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: tema.textMuted }}>No se encontraron registros.</td></tr>
              ) : (
                enviosFiltrados.map((r) => {
                  const saldo = Number(r.saldo_pendiente || 0);
                  const estaSeleccionado = seleccionadosTabla.includes(r.id);

                  return (
                    <tr 
                      key={r.id} 
                      style={{ 
                        borderBottom: `1px solid ${tema.rowBorder}`,
                        background: estaSeleccionado ? (darkMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.05)') : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 12px 14px 18px', textAlign: 'center' }}>
                        <div 
                          onClick={() => toggleSeleccionFila(r.id)}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {estaSeleccionado ? (
                            <CheckSquare size={18} color="#38bdf8" />
                          ) : (
                            <Square size={18} color={tema.textMuted} />
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 14px', fontWeight: '700', color: tema.textMain }}>#{r.consecutivo}</td>
                      <td style={{ padding: '14px 14px', color: tema.textMuted }}>{r.fecha_envio}</td>
                      <td style={{ padding: '14px 14px' }}>{r.cajas}</td>
                      <td style={{ padding: '14px 14px' }}>{r.kilos} Kg</td>
                      
                      <td style={{ padding: '14px 14px' }}>
                        <button
                          onClick={() => setModalEditarPrecioCompra(r)}
                          title="Clic para editar precio de compra a Edison"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                        >
                          {formatoCOP(r.precio_compra_kg)} <Edit2 size={12} color={tema.textMuted} />
                        </button>
                      </td>

                      <td style={{ padding: '14px 14px', fontWeight: '600' }}>{formatoCOP(r.total_facturado_cliente)}</td>
                      <td style={{ padding: '14px 14px', fontWeight: '700', color: saldo > 0 ? '#f97316' : '#22c55e' }}>{formatoCOP(saldo)}</td>
                      <td style={{ padding: '14px 14px', color: '#38bdf8', fontWeight: '600' }}>{formatoCOP(r.margen_bruto)}</td>
                      
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          
                          {/* Botón Editar Despacho Completo (Lápiz) */}
                          <button
                            onClick={() => abrirModalEditarDespacho(r)}
                            title="Editar datos del despacho (fecha, kilos, cajas, precios)"
                            style={{ padding: '6px 8px', background: tema.inputBg, border: `1px solid ${tema.border}`, color: tema.textMain, borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Edit2 size={13} color="#38bdf8" />
                          </button>

                          {/* Botón Ver Cuenta de Cobro */}
                          <button
                            onClick={() => setModalCuentaCobro(r)}
                            title="Generar Cuenta de Cobro Formal / PDF"
                            style={{ padding: '6px 10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <FileText size={13} /> Cuenta
                          </button>

                          {/* Botón WhatsApp */}
                          <button
                            onClick={() => enviarWhatsApp(r)}
                            title="Enviar por WhatsApp a Innovative Kitchen"
                            style={{ padding: '6px 10px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Send size={13} /> WhatsApp
                          </button>

                          {/* Botón Abono o Botón Pagado con Reversión */}
                          {saldo > 0 ? (
                            <button onClick={() => abrirModalAbono(r)} style={{ padding: '6px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <DollarSign size={13} /> Abono
                            </button>
                          ) : (
                            <button 
                              onClick={() => abrirModalHistorial(r)}
                              title="Haz clic para ver el abono o anularlo si fue un error"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              <CheckCircle2 size={13} /> Pagado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PARA VER Y ANULAR ABONOS */}
      {modalHistorialAbonos && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 130, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '440px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>Historial de Pagos</h3>
                <p style={{ margin: '4px 0 0', color: tema.textMuted, fontSize: '13px' }}>Despacho #{modalHistorialAbonos.consecutivo}</p>
              </div>
              <button onClick={() => setModalHistorialAbonos(null)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {abonosDelEnvioModal.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: tema.textMuted, fontSize: '13px' }}>
                  No hay abonos registrados para este despacho.
                </div>
              ) : (
                abonosDelEnvioModal.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: tema.inputBg, border: `1px solid ${tema.border}` }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#22c55e' }}>{formatoCOP(a.monto)}</div>
                      <div style={{ fontSize: '12px', color: tema.textMuted }}>{a.fecha} • {a.metodo_pago}</div>
                      {a.notas && <div style={{ fontSize: '11px', color: tema.textMuted, marginTop: '2px' }}>{a.notas}</div>}
                    </div>

                    <button 
                      onClick={() => eliminarAbono(a.id)}
                      title="Anular este abono y devolver la deuda a pendiente"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} /> Anular Pago
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalHistorialAbonos(null)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR DESPACHO COMPLETO */}
      {modalEditarDespachoCompleto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '520px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Editar Datos del Despacho</h3>
                <p style={{ margin: '4px 0 0', color: tema.textMuted, fontSize: '13px' }}>Modifica cualquier parámetro de esta cuenta de cobro</p>
              </div>
              <button onClick={() => setModalEditarDespachoCompleto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={guardarEdicionDespacho} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Consecutivo</label>
                  <input required value={formEdicion.consecutivo} onChange={(e) => setFormEdicion({...formEdicion, consecutivo: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Fecha Despacho</label>
                  <input type="date" required value={formEdicion.fecha_envio} onChange={(e) => setFormEdicion({...formEdicion, fecha_envio: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e' }}>Número de Cajas</label>
                  <input type="number" step="any" required value={formEdicion.cajas} onChange={(e) => setFormEdicion({...formEdicion, cajas: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e' }}>Kilos Netos</label>
                  <input type="number" step="any" required value={formEdicion.kilos} onChange={(e) => setFormEdicion({...formEdicion, kilos: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Compra/Kg (Edison)</label>
                  <input type="number" required value={formEdicion.precio_compra_kg} onChange={(e) => setFormEdicion({...formEdicion, precio_compra_kg: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#ef4444', borderRadius: '8px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Venta/Kg (Innovative)</label>
                  <input type="number" required value={formEdicion.precio_venta_kg} onChange={(e) => setFormEdicion({...formEdicion, precio_venta_kg: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', borderRadius: '8px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Flete por Caja (Macareo)</label>
                <input type="number" required value={formEdicion.costo_flete_caja} onChange={(e) => setFormEdicion({...formEdicion, costo_flete_caja: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Notas / Observaciones</label>
                <input value={formEdicion.notas} onChange={(e) => setFormEdicion({...formEdicion, notas: e.target.value})} placeholder="Opcional..." style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalEditarDespachoCompleto(false)} style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISTA 2: RUN CHART MULTIVARIABLE */}
      {pestanaActiva === 'dashboard' && (
        <div style={{ background: tema.cardBg, padding: '24px', borderRadius: '14px', border: `1px solid ${tema.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Run Chart Multivariable de Rendimiento</h3>
              <p style={{ margin: '4px 0 0', color: tema.textMuted, fontSize: '13px' }}>Tendencia temporal de ventas, compra a Edison y márgenes</p>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: tema.inputBg, padding: '4px', borderRadius: '8px', border: `1px solid ${tema.border}` }}>
              {['envio', 'semana', 'mes', 'ano'].map(modo => (
                <button
                  key={modo}
                  onClick={() => setAgrupacionRunChart(modo)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: agrupacionRunChart === modo ? '#38bdf8' : 'transparent',
                    color: agrupacionRunChart === modo ? '#090d16' : tema.textMuted,
                    border: 'none'
                  }}
                >
                  {modo === 'envio' ? 'Por Envío' : modo === 'semana' ? 'Semanas' : modo === 'mes' ? 'Meses' : 'Años'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', padding: '12px', background: darkMode ? '#0b1120' : '#f8fafc', borderRadius: '10px', border: `1px solid ${tema.border}` }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: tema.textMuted, alignSelf: 'center' }}>Líneas:</span>
            
            <button onClick={() => setSeriesVisibles(s => ({ ...s, venta: !s.venta }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #3b82f6', background: seriesVisibles.venta ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: '#60a5fa', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></span> Venta Facturada
            </button>

            <button onClick={() => setSeriesVisibles(s => ({ ...s, margen: !s.margen }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #22c55e', background: seriesVisibles.margen ? 'rgba(34, 197, 94, 0.2)' : 'transparent', color: '#22c55e', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span> Margen Bruto
            </button>

            <button onClick={() => setSeriesVisibles(s => ({ ...s, costoFruta: !s.costoFruta }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: seriesVisibles.costoFruta ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Compra Edison
            </button>

            <button onClick={() => setSeriesVisibles(s => ({ ...s, saldo: !s.saldo }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid #f97316', background: seriesVisibles.saldo ? 'rgba(249, 115, 22, 0.2)' : 'transparent', color: '#f97316', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f97316' }}></span> Cartera Pendiente
            </button>
          </div>

          {datosAgrupados.length < 2 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: tema.textMuted }}>
              Se requieren al menos 2 periodos para graficar la tendencia.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto', minWidth: '650px' }}>
                <line x1={padX} y1={padY} x2={chartWidth - padX} y2={padY} stroke={tema.chartGrid} strokeDasharray="3 3" />
                <line x1={padX} y1={chartHeight / 2} x2={chartWidth - padX} y2={chartHeight / 2} stroke={tema.chartGrid} strokeDasharray="3 3" />
                <line x1={padX} y1={chartHeight - padY} x2={chartWidth - padX} y2={chartHeight - padY} stroke={tema.chartGrid} />

                {seriesVisibles.venta && <path d={generarPath('venta')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />}
                {seriesVisibles.margen && <path d={generarPath('margen')} fill="none" stroke="#22c55e" strokeWidth="3" />}
                {seriesVisibles.costoFruta && <path d={generarPath('costoFruta')} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />}
                {seriesVisibles.saldo && <path d={generarPath('saldo')} fill="none" stroke="#f97316" strokeWidth="2" />}

                {datosAgrupados.map((d, i) => {
                  const x = padX + (i / (datosAgrupados.length > 1 ? datosAgrupados.length - 1 : 1)) * (chartWidth - padX * 2);
                  const yMargen = chartHeight - padY - (d.margen / maxGrafico) * (chartHeight - padY * 2);

                  return (
                    <g key={i}>
                      {seriesVisibles.margen && (
                        <>
                          <circle cx={x} cy={yMargen} r="5" fill="#22c55e" stroke={tema.cardBg} strokeWidth="2" />
                          <text x={x} y={yMargen - 10} fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">{formatoCOP(d.margen)}</text>
                        </>
                      )}
                      <text x={x} y={chartHeight - padY + 18} fill={tema.textMuted} fontSize="11" textAnchor="middle">{d.label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      )}

      {/* MODAL IMPRIMIBLE / PDF */}
      {modalCuentaCobro && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 150, padding: '16px' }}>
          <div style={{ background: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '680px', borderRadius: '16px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '94vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => imprimirConNombre(modalCuentaCobro)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <Printer size={16} /> Imprimir / Guardar como PDF
                </button>
                <button
                  onClick={() => enviarWhatsApp(modalCuentaCobro)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  <Send size={16} /> Enviar a WhatsApp
                </button>
              </div>

              <button onClick={() => setModalCuentaCobro(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div id="area-impresion" style={{ padding: '10px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#0f172a' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  CUENTA DE COBRO # {modalCuentaCobro.consecutivo}
                </h1>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                  Fecha de Expedición: {modalCuentaCobro.fecha_envio}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Cliente:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>Innovative Kitchen SAS</div>
                  <div style={{ color: '#334155' }}>NIT # 901.069.237-4</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Beneficiario:</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>Elkin Bohórquez Tarud</div>
                  <div style={{ color: '#334155' }}>C.C. # 72.271.189</div>
                </div>
              </div>

              <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
                POR CONCEPTO DE:
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px', color: '#0f172a' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }}>
                    <th style={{ padding: '10px 8px', textAlign: 'left', color: '#0f172a' }}>Concepto</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#0f172a' }}>Cantidad</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#0f172a' }}>Cajas</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center', color: '#0f172a' }}>Fecha Envío</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right', color: '#0f172a' }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 8px' }}>Aguacate Hass - Grueso ({formatoCOP(modalCuentaCobro.precio_venta_kg)}/Kg)</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{modalCuentaCobro.kilos} Kg</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{modalCuentaCobro.cajas}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{modalCuentaCobro.fecha_envio}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(modalCuentaCobro.total_venta_fruta)}</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #0f172a' }}>
                    <td style={{ padding: '12px 8px' }}>Envío Transporte ({formatoCOP(modalCuentaCobro.costo_flete_caja)} X Caja)</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>-</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{modalCuentaCobro.cajas}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{modalCuentaCobro.fecha_envio}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatoCOP(modalCuentaCobro.total_flete)}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan="4" style={{ padding: '12px 8px', fontWeight: 'bold', fontSize: '15px' }}>TOTAL A PAGAR</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '17px', color: '#0f172a' }}>
                      {formatoCOP(modalCuentaCobro.total_facturado_cliente)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '28px', fontSize: '13px', lineHeight: '1.6', color: '#0f172a' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Forma de Pago:</div>
                <div>Páguese a cuenta de ahorros <b>Bancolombia # 554 879 253 72</b></div>
                <div>A nombre de: <b>Elkin Bohórquez Tarud</b> (CC 72.271.189)</div>
              </div>

              <div style={{ marginTop: '24px', fontSize: '13px', lineHeight: '1.6', color: '#0f172a' }}>
                <div>Atentamente,</div>
                
                <div style={{ marginTop: '4px', minHeight: '65px', display: 'flex', alignItems: 'flex-end' }}>
                  <img 
                    src="/firma.png" 
                    alt="Firma Digital Elkin Bohórquez" 
                    style={{ 
                      maxHeight: '65px', 
                      maxWidth: '220px', 
                      objectFit: 'contain',
                      mixBlendMode: 'multiply'
                    }} 
                  />
                </div>

                <div style={{ width: '220px', borderTop: '1px solid #334155', marginTop: '2px', paddingTop: '6px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Elkin Bohórquez Tarud</div>
                  <div>C.C. 72.271.189</div>
                  <div>Cel: 318 421 8873</div>
                  <div>Email: elkinbt@gmail.com</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: ABONO CLIENTE MÚLTIPLE */}
      {modalAbonoMultipleAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '540px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Registrar Pago Conjunto Cliente</h3>
                <p style={{ margin: '4px 0 0', color: tema.textMuted, fontSize: '13px' }}>Selecciona con check las cuentas cubiertas por Innovative</p>
              </div>
              <button onClick={() => setModalAbonoMultipleAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={guardarAbonoMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Fecha del Pago</label>
                  <input type="date" required value={fechaAbonoMultiple} onChange={(e) => setFechaAbonoMultiple(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Referencia / Banco</label>
                  <input placeholder="Ej: Transferencia Bancolombia" value={notasAbonoMultiple} onChange={(e) => setNotasAbonoMultiple(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8' }}>
                    CUENTAS PENDIENTES INNOVATIVE ({despachosPendientesCliente.length})
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (cuentasSeleccionadasModal.length === despachosPendientesCliente.length) {
                        setCuentasSeleccionadasModal([]);
                        setMontoRealRecibido('');
                      } else {
                        const todos = despachosPendientesCliente.map(e => e.id);
                        setCuentasSeleccionadasModal(todos);
                        const total = despachosPendientesCliente.reduce((sum, e) => sum + Number(e.saldo_pendiente || 0), 0);
                        setMontoRealRecibido(total);
                      }
                    }} 
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {cuentasSeleccionadasModal.length === despachosPendientesCliente.length ? 'Deseleccionar todas' : 'Marcar todas'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {despachosPendientesCliente.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: tema.textMuted, fontSize: '13px' }}>
                      No hay cuentas pendientes por cobrar actualmente.
                    </div>
                  ) : (
                    despachosPendientesCliente.map(e => {
                      const seleccionada = cuentasSeleccionadasModal.includes(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={() => toggleSeleccionCuentaModal(e.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${seleccionada ? '#0284c7' : tema.border}`,
                            background: seleccionada ? 'rgba(2, 132, 199, 0.15)' : tema.inputBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {seleccionada ? <CheckSquare size={18} color="#0284c7" /> : <Square size={18} color={tema.textMuted} />}
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Despacho #{e.consecutivo}</div>
                              <div style={{ fontSize: '12px', color: tema.textMuted }}>{e.fecha_envio} ({e.cajas} cajas, {e.kilos} Kg)</div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: '#f97316', fontSize: '14px' }}>{formatoCOP(e.saldo_pendiente)}</div>
                            <div style={{ fontSize: '11px', color: tema.textMuted }}>Saldo cuenta</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Ajuste por menor valor / merma */}
              <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${tema.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: tema.textMuted }}>Total Cuentas Marcadas:</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: tema.textMain }}>{formatoCOP(totalSeleccionadoAbonoMultiple)}</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e', display: 'block', marginBottom: '4px' }}>
                    Monto Real Transferido por Innovative (COP):
                  </label>
                  <input 
                    type="number"
                    step="any"
                    value={montoRealRecibido}
                    onChange={(e) => setMontoRealRecibido(e.target.value)}
                    placeholder={String(totalSeleccionadoAbonoMultiple)}
                    style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${diferenciaDescuento > 0 ? '#f97316' : tema.inputBorder}`, color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>

                {diferenciaDescuento > 0 && (
                  <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid #f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f97316', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>
                      <span>Diferencia no consignada:</span>
                      <span>-{formatoCOP(diferenciaDescuento)}</span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: tema.textMain }}>
                      <input 
                        type="checkbox" 
                        checked={esDescuentoDefinitivo} 
                        onChange={(e) => setEsDescuentoDefinitivo(e.target.checked)} 
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span><b>Descuento definitivo por bajas / merma</b> (Saldar cuentas a $0 y absorber la diferencia)</span>
                    </label>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalAbonoMultipleAbierto(false)} style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button 
                  type="submit" 
                  disabled={cuentasSeleccionadasModal.length === 0} 
                  style={{ 
                    padding: '10px 20px', 
                    background: cuentasSeleccionadasModal.length === 0 ? '#64748b' : '#0284c7', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    cursor: cuentasSeleccionadasModal.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PAGAR A PROVEEDOR */}
      {modalPagoProvAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '540px', border: `1px solid ${tema.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Liquidación / Pago a Proveedor</h3>
                <p style={{ margin: '4px 0 0', color: tema.textMuted, fontSize: '13px' }}>Selecciona los despachos a pagar a Edison o Macareo</p>
              </div>
              <button onClick={() => setModalPagoProvAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={guardarPagoProveedorMultiple} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Proveedor Destino *</label>
                <select 
                  required
                  value={provSeleccionadoId} 
                  onChange={(e) => {
                    setProvSeleccionadoId(e.target.value);
                    setDespachosProvSeleccionados([]);
                  }}
                  style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}
                >
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.tipo === 'transporte' ? 'Fletes Macareo' : 'Fruta Edison'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Fecha de Pago</label>
                  <input type="date" required value={fechaPagoProv} onChange={(e) => setFechaPagoProv(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Referencia Bancolombia / Comprobante</label>
                  <input placeholder="Ej: Transf #18492 Bancolombia" value={notasPagoProv} onChange={(e) => setNotasPagoProv(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#ef4444' }}>
                    DESPACHOS POR LIQUIDAR ({despachosPendientesParaProveedor.length})
                  </label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (despachosProvSeleccionados.length === despachosPendientesParaProveedor.length) {
                        setDespachosProvSeleccionados([]);
                      } else {
                        setDespachosProvSeleccionados(despachosPendientesParaProveedor.map(e => e.id));
                      }
                    }} 
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {despachosProvSeleccionados.length === despachosPendientesParaProveedor.length ? 'Deseleccionar todos' : 'Marcar todos'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {despachosPendientesParaProveedor.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#22c55e', fontSize: '13px', fontWeight: 'bold' }}>
                      ✅ No hay despachos pendientes con este proveedor. ¡Todo al día!
                    </div>
                  ) : (
                    despachosPendientesParaProveedor.map(e => {
                      const seleccionada = despachosProvSeleccionados.includes(e.id);
                      return (
                        <div
                          key={e.id}
                          onClick={() => toggleSeleccionDespachoProv(e.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${seleccionada ? '#dc2626' : tema.border}`,
                            background: seleccionada ? 'rgba(220, 38, 38, 0.15)' : tema.inputBg,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {seleccionada ? <CheckSquare size={18} color="#dc2626" /> : <Square size={18} color={tema.textMuted} />}
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Despacho #{e.consecutivo}</div>
                              <div style={{ fontSize: '12px', color: tema.textMuted }}>
                                {e.fecha_envio} • {provSeleccionadoObj?.tipo === 'transporte' ? `${e.cajas} cajas (Flete)` : `${e.kilos} Kg @ ${formatoCOP(e.precio_compra_kg)}`}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '800', color: '#ef4444', fontSize: '14px' }}>{formatoCOP(e.saldoPendienteProv)}</div>
                            <div style={{ fontSize: '11px', color: tema.textMuted }}>Por transferir</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '16px', borderRadius: '12px', border: `1px solid ${tema.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', color: tema.textMuted }}>Monto Total a Transferir:</span>
                  <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>{despachosProvSeleccionados.length} despacho(s) marcado(s)</div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444' }}>
                  {formatoCOP(totalSeleccionadoPagoProv)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalPagoProvAbierto(false)} style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button 
                  type="submit" 
                  disabled={despachosProvSeleccionados.length === 0} 
                  style={{ 
                    padding: '10px 20px', 
                    background: despachosProvSeleccionados.length === 0 ? '#64748b' : '#dc2626', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    cursor: despachosProvSeleccionados.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Registrar Pago a Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Precio de Compra a Edison */}
      {modalEditarPrecioCompra && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 120, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '380px', border: `1px solid ${tema.border}` }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 'bold' }}>Actualizar Precio Compra Edison</h3>
            <p style={{ margin: '0 0 16px', color: tema.textMuted, fontSize: '13px' }}>
              Despacho #{modalEditarPrecioCompra.consecutivo} ({modalEditarPrecioCompra.cajas} cajas, {modalEditarPrecioCompra.kilos} Kg)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[8000, 9000, 7500, 7000, 6500, 6000].map(pr => (
                <button
                  key={pr}
                  onClick={() => actualizarPrecioCompra(modalEditarPrecioCompra.id, pr)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${modalEditarPrecioCompra.precio_compra_kg === pr ? '#ef4444' : tema.border}`,
                    background: modalEditarPrecioCompra.precio_compra_kg === pr ? 'rgba(239, 68, 68, 0.2)' : tema.inputBg,
                    color: tema.textMain,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{formatoCOP(pr)} / Kg</span>
                  {modalEditarPrecioCompra.precio_compra_kg === pr && <Check size={16} color="#ef4444" />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalEditarPrecioCompra(null)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Despacho */}
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '28px', borderRadius: '18px', width: '100%', maxWidth: '540px', border: `1px solid ${tema.border}`, maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Nuevo Despacho de Aguacate</h2>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={guardarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Consecutivo / Cuenta</label>
                  <input required value={formData.consecutivo} onChange={(e) => setFormData({...formData, consecutivo: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#38bdf8', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Fecha Despacho</label>
                  <input type="date" required value={formData.fecha_envio} onChange={(e) => setFormData({...formData, fecha_envio: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e' }}>Número de Cajas *</label>
                  <input type="number" step="any" required placeholder="0" autoFocus value={formData.cajas} onChange={(e) => setFormData({...formData, cajas: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e' }}>Kilos Netos *</label>
                  <input type="number" step="any" required placeholder="0.00" value={formData.kilos} onChange={(e) => setFormData({...formData, kilos: e.target.value})} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px', fontWeight: 'bold' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Compra/Kg (Edison)</label>
                  <select value={formData.precio_compra_kg} onChange={(e) => setFormData({...formData, precio_compra_kg: Number(e.target.value)})} style={{ padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', width: '100%', marginTop: '4px' }}>
                    {PRECIOS_COMPRA.map(p => <option key={p} value={p}>{formatoCOP(p)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Venta/Kg (Innovative)</label>
                  <select value={formData.precio_venta_kg} onChange={(e) => setFormData({...formData, precio_venta_kg: Number(e.target.value)})} style={{ padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', width: '100%', marginTop: '4px' }}>
                    {PRECIOS_VENTA.map(p => <option key={p} value={p}>{formatoCOP(p)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Flete por Caja (Macareo)</label>
                <select value={formData.costo_flete_caja} onChange={(e) => setFormData({...formData, costo_flete_caja: Number(e.target.value)})} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px' }}>
                  {TARIFAS_FLETE.map(t => <option key={t} value={t}>{formatoCOP(t)} por caja</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalAbierto(false)} style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Despacho</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Abono Individual */}
      {modalAbonoAbierto && envioSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 110, padding: '16px' }}>
          <div style={{ background: tema.cardBg, color: tema.textMain, padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: `1px solid ${tema.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>Registrar Pago de Innovative</h3>
              <button onClick={() => setModalAbonoAbierto(false)} style={{ background: 'none', border: 'none', color: tema.textMuted, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ background: darkMode ? '#0b1120' : '#f8fafc', padding: '12px', borderRadius: '10px', border: `1px solid ${tema.border}`, marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: tema.textMuted }}>Despacho:</span><b>#{envioSeleccionado.consecutivo}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: tema.textMuted }}>Facturado:</span><b>{formatoCOP(envioSeleccionado.total_facturado_cliente)}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#f97316' }}>Saldo Pendiente:</span><b style={{ color: '#f97316' }}>{formatoCOP(envioSeleccionado.saldo_pendiente)}</b>
              </div>
            </div>

            <form onSubmit={guardarAbono} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Fecha del Abono</label>
                <input type="date" required value={fechaAbono} onChange={(e) => setFechaAbono(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '4px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: tema.textMain, borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: tema.textMuted }}>Monto Recibido (COP)</label>
                  <button type="button" onClick={() => setMontoAbono(envioSeleccionado.saldo_pendiente)} style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Saldar Total</button>
                </div>
                <input type="number" step="any" required autoFocus value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} style={{ width: '100%', padding: '10px', background: tema.inputBg, border: `1px solid ${tema.inputBorder}`, color: '#22c55e', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setModalAbonoAbierto(false)} style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${tema.border}`, color: tema.textMuted, borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 18px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Abono</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}