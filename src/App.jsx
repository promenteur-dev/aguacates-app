import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Moon, Sun, Search, Download, Clock, CheckSquare, ArrowUpRight, Lock, Fingerprint
} from 'lucide-react';

import { useBiometria } from './hooks/useBiometria';
import { useFinanzas, formatoCOP } from './hooks/useFinanzas';
import { pedidosApi } from './api/pedidosApi';
import { enviosApi } from './api/enviosApi';
import { tesoreriaApi } from './api/tesoreriaApi';

// Componentes modulares
import KpiCards from './components/KpiCards';
import TablaEnvios from './components/TablaEnvios';
import TarjetasMovil from './components/TarjetasMovil';

// Modales modulares
import ModalCuentaCobro from './components/modales/ModalCuentaCobro';
import ModalPedido from './components/modales/ModalPedido';
import ModalLiquidacion from './components/modales/ModalLiquidacion';
import ModalPagoProveedor from './components/modales/ModalPagoProveedor';
import ModalAbonoMultiple from './components/modales/ModalAbonoMultiple';
import ModalEditarDespacho from './components/modales/ModalEditarDespacho';
import ModalEditarPedido from './components/modales/ModalEditarPedido';

export default function App() {
  const { 
    autenticado, pinInput, setPinInput, errorBiometria, 
    activarHuellaBiometrica, desbloquearConPin, cerrarSesion 
  } = useBiometria();

  const {
    envios, pedidos, proveedores, pagosProveedores, loading,
    cargarDatos, deudaEdison, deudaMacareo, obtenerEstadoEdison, calcularSiguienteConsecutivo
  } = useFinanzas();

  const [esMovil, setEsMovil] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [darkMode, setDarkMode] = useState(true);

  // Filtros y ordenamiento
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('todos');
  const [columnaOrden, setColumnaOrden] = useState('consecutivo');
  const [direccionOrden, setDireccionOrden] = useState('desc');
  const [seleccionadosTabla, setSeleccionadosTabla] = useState([]);

  // Estados de Modales
  const [modalNuevoPedido, setModalNuevoPedido] = useState(false);
  const [modalEditarPedido, setModalEditarPedido] = useState(null);
  const [modalLiquidarPedido, setModalLiquidarPedido] = useState(null);
  const [modalAbonoMultipleAbierto, setModalAbonoMultipleAbierto] = useState(false);
  const [modalPagoProvAbierto, setModalPagoProvAbierto] = useState(false);
  const [modalEditarDespachoCompleto, setModalEditarDespachoCompleto] = useState(null);
  const [modalCuentaCobro, setModalCuentaCobro] = useState(null);

  // Formularios
  const [formPedido, setFormPedido] = useState({
    fecha_pedido: new Date().toISOString().split('T')[0],
    cajas: '',
    precio_compra_kg: 6000,
    precio_venta_kg: 11200,
    costo_flete_caja: 20000,
    notas: '',
    consecutivo: ''
  });

  const [formEditarPed, setFormEditarPed] = useState({
    id: '', consecutivo: '', fecha_pedido: '', cajas: '', precio_compra_kg: 6000, costo_flete_caja: 20000, notas: ''
  });

  const [formLiquidar, setFormLiquidar] = useState({
    consecutivo: '', fecha_envio: new Date().toISOString().split('T')[0], kilos: '', flete_cliente_caja: 32000, notas: ''
  });

  const [formEdicion, setFormEdicion] = useState({
    id: '', consecutivo: '', fecha_envio: '', cajas: '', kilos: '', precio_compra_kg: '', precio_venta_kg: '', notas: ''
  });

  const [provSeleccionadoId, setProvSeleccionadoId] = useState('');
  const [despachosProvSeleccionados, setDespachosProvSeleccionados] = useState([]);
  const [fechaPagoProv, setFechaPagoProv] = useState(new Date().toISOString().split('T')[0]);
  const [notasPagoProv, setNotasPagoProv] = useState('');

  const [cuentasSeleccionadasModal, setCuentasSeleccionadasModal] = useState([]);
  const [montoRealRecibido, setMontoRealRecibido] = useState('');
  const [esDescuentoDefinitivo, setEsDescuentoDefinitivo] = useState(true);

  const PRECIOS_COMPRA = [6000, 6500, 7000, 7500, 8000, 8500, 9000];
  const TARIFAS_FLETE = [20000, 30000, 32000, 35000];

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (proveedores.length > 0 && !provSeleccionadoId) {
      setProvSeleccionadoId(proveedores[0].id);
    }
  }, [proveedores, provSeleccionadoId]);

  const tema = darkMode ? {
    bg: '#090d16', cardBg: '#131b2e', cardHover: '#18223a', border: '#1e293b',
    textMain: '#f8fafc', textMuted: '#94a3b8', inputBg: '#1e293b', inputBorder: '#334155',
    thBg: '#0f172a', rowBorder: '#1e293b'
  } : {
    bg: '#f8fafc', cardBg: '#ffffff', cardHover: '#f1f5f9', border: '#e2e8f0',
    textMain: '#0f172a', textMuted: '#64748b', inputBg: '#ffffff', inputBorder: '#cbd5e1',
    thBg: '#f1f5f9', rowBorder: '#f1f5f9'
  };

  // Pedidos activos
  const pedidosPendientes = useMemo(() => {
    return pedidos.filter(p => p.estado !== 'liquidado').map((p, idx) => ({
      ...p,
      consecutivo: p.consecutivo || String(595 + idx).padStart(6, '0'),
      esPedido: true,
      fecha_envio: p.fecha_pedido
    }));
  }, [pedidos]);

  // Filtro y ordenamiento
  const enviosFiltrados = useMemo(() => {
    const res = envios.filter(r => {
      const coincideTexto = r.consecutivo?.toLowerCase().includes(filtroTexto.toLowerCase()) || r.fecha_envio?.includes(filtroTexto);
      const saldo = Number(r.saldo_pendiente || 0);
      let coincideEstado = true;
      if (filtroEstado === 'pendientes') coincideEstado = saldo > 0;
      if (filtroEstado === 'saldados') coincideEstado = saldo <= 0;
      let coincideMes = true;
      if (filtroMes !== 'todos') coincideMes = r.fecha_envio?.startsWith(filtroMes);
      return coincideTexto && coincideEstado && coincideMes;
    });

    return res.sort((a, b) => {
      let valA = a[columnaOrden];
      let valB = b[columnaOrden];
      if (['cajas', 'kilos', 'total_facturado_cliente', 'saldo_pendiente', 'margen_bruto'].includes(columnaOrden)) {
        valA = Number(valA || 0); valB = Number(valB || 0);
      } else {
        valA = String(valA || ''); valB = String(valB || '');
      }
      return direccionOrden === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
  }, [envios, filtroTexto, filtroEstado, filtroMes, columnaOrden, direccionOrden]);

  // Cálculos de KPIs
  const totalPorCobrar = enviosFiltrados.reduce((acc, r) => acc + Number(r.saldo_pendiente || 0), 0);
  const enviosConDeudaCliente = enviosFiltrados.filter(e => Number(e.saldo_pendiente || 0) > 0).length;
  const margenTotal = enviosFiltrados.reduce((acc, r) => acc + Number(r.margen_bruto || 0), 0);
  const totalKilos = enviosFiltrados.reduce((acc, r) => acc + Number(r.kilos || 0), 0);
  const totalCajas = enviosFiltrados.reduce((acc, r) => acc + Number(r.cajas || 0), 0);
  const margenPromedioPorKilo = totalKilos > 0 ? (margenTotal / totalKilos) : 0;
  const totalFacturado = enviosFiltrados.reduce((acc, r) => acc + Number(r.total_facturado_cliente || 0), 0);
  const porcentajeRentabilidadGlobal = totalFacturado > 0 ? ((margenTotal / totalFacturado) * 100) : 0;

  const metricaMerma = useMemo(() => {
    const kilosTeoricos = enviosFiltrados.reduce((acc, e) => acc + (Number(e.cajas || 0) * 25), 0);
    const kilosReales = enviosFiltrados.reduce((acc, e) => acc + Number(e.kilos || 0), 0);
    const kilosDiferencia = kilosTeoricos - kilosReales;
    return {
      kilosDiferencia,
      porcentajeMerma: kilosTeoricos > 0 ? ((kilosDiferencia / kilosTeoricos) * 100) : 0
    };
  }, [enviosFiltrados]);

  // Acciones Handlers
  function handleOrdenar(col) {
    if (columnaOrden === col) setDireccionOrden(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setColumnaOrden(col); setDireccionOrden('asc'); }
  }

  function toggleSeleccionFila(id) {
    setSeleccionadosTabla(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function toggleSeleccionarTodoTabla(listaIds) {
    setSeleccionadosTabla(seleccionadosTabla.length === listaIds.length ? [] : listaIds);
  }

  function abrirModalCrearPedido() {
    setFormPedido({
      fecha_pedido: new Date().toISOString().split('T')[0],
      cajas: '',
      precio_compra_kg: 6000,
      precio_venta_kg: 11200,
      costo_flete_caja: 20000,
      notas: '',
      consecutivo: calcularSiguienteConsecutivo()
    });
    setModalNuevoPedido(true);
  }

  async function guardarNuevoPedido(e) {
    e.preventDefault();
    try {
      await pedidosApi.crearPedido({
        ...formPedido,
        flete_pagado: true,
        monto_flete_pagado: Number(formPedido.cajas) * Number(formPedido.costo_flete_caja)
      });
      setModalNuevoPedido(false);
      await cargarDatos();
    } catch (err) { alert('Error: ' + err.message); }
  }

  function abrirModalEditarPedido(pedido) {
    setFormEditarPed({
      id: pedido.id, consecutivo: pedido.consecutivo, fecha_pedido: pedido.fecha_pedido,
      cajas: pedido.cajas, precio_compra_kg: pedido.precio_compra_kg,
      costo_flete_caja: pedido.costo_flete_caja, notas: pedido.notas || ''
    });
    setModalEditarPedido(pedido);
  }

  async function guardarEdicionPedido(e) {
    e.preventDefault();
    try {
      await pedidosApi.actualizarPedido(formEditarPed.id, {
        consecutivo: formEditarPed.consecutivo,
        fecha_pedido: formEditarPed.fecha_pedido,
        cajas: Number(formEditarPed.cajas),
        precio_compra_kg: Number(formEditarPed.precio_compra_kg),
        costo_flete_caja: Number(formEditarPed.costo_flete_caja),
        notas: formEditarPed.notas
      });
      setModalEditarPedido(null);
      await cargarDatos();
    } catch (err) { alert('Error: ' + err.message); }
  }

  function iniciarLiquidacionPedido(p) {
    setModalLiquidarPedido(p);
    setFormLiquidar({
      consecutivo: p.consecutivo, fecha_envio: p.fecha_pedido, kilos: '', flete_cliente_caja: 32000, notas: p.notas || ''
    });
  }

  async function confirmarLiquidacionPedido(e) {
    e.preventDefault();
    if (!formLiquidar.kilos || Number(formLiquidar.kilos) <= 0) return;
    try {
      const nuevo = await enviosApi.liquidarDespacho({
        ...formLiquidar,
        cajas: modalLiquidarPedido.cajas,
        precio_compra_kg: modalLiquidarPedido.precio_compra_kg
      });
      if (modalLiquidarPedido.flete_pagado) {
        const provM = proveedores.find(x => x.tipo === 'transporte');
        if (provM) {
          await tesoreriaApi.registrarPagoProveedor({
            proveedor_id: provM.id, envio_id: nuevo.id,
            monto: modalLiquidarPedido.cajas * 20000, fecha: formLiquidar.fecha_envio,
            concepto: 'transporte', notas: `Flete Macareo (#${modalLiquidarPedido.consecutivo})`
          });
        }
      }
      await pedidosApi.actualizarPedido(modalLiquidarPedido.id, { estado: 'liquidado', estado_fase: 'liquidado' });
      setModalLiquidarPedido(null);
      await cargarDatos();
    } catch (err) { alert('Error: ' + err.message); }
  }

  async function cancelarPedido(id) {
    if (!window.confirm('¿Cancelar pedido?')) return;
    await pedidosApi.eliminarPedido(id);
    await cargarDatos();
  }

  function abrirModalCuentaSeguro(r) {
    const kilos = Number(r.kilos || 0);
    const cajas = Number(r.cajas || 0);
    const precioVenta = Number(r.precio_venta_kg || 11200);
    const ventaFruta = kilos * precioVenta;
    const fleteTotal = cajas * 32000;
    setModalCuentaCobro({
      ...r, total_venta_fruta_calc: ventaFruta, total_flete_calc: fleteTotal,
      total_facturado_calc: ventaFruta + fleteTotal, precio_venta_kg_calc: precioVenta,
      kilos_calc: kilos, cajas_calc: cajas
    });
  }

  function abrirModalEditarDespacho(r) {
    setFormEdicion({
      id: r.id, consecutivo: r.consecutivo, fecha_envio: r.fecha_envio,
      cajas: r.cajas, kilos: r.kilos, precio_compra_kg: r.precio_compra_kg,
      precio_venta_kg: r.precio_venta_kg, notas: r.notas || ''
    });
    setModalEditarDespachoCompleto(true);
  }

  async function guardarEdicionDespacho(e) {
    e.preventDefault();
    try {
      await enviosApi.actualizarDespacho(formEdicion.id, {
        cajas: Number(formEdicion.cajas), kilos: Number(formEdicion.kilos),
        precio_compra_kg: Number(formEdicion.precio_compra_kg),
        precio_venta_kg: Number(formEdicion.precio_venta_kg)
      });
      setModalEditarDespachoCompleto(false);
      await cargarDatos();
    } catch (err) { alert('Error: ' + err.message); }
  }

  // Despachos con saldo proveedor
  const provSelObj = proveedores.find(p => p.id === provSeleccionadoId);
  const despachosPendientesParaProveedor = useMemo(() => {
    const esFlete = provSelObj?.tipo === 'transporte';
    return envios.map(e => {
      const costo = esFlete ? (Number(e.cajas || 0) * 20000) : Number(e.total_compra_fruta || 0);
      const pagado = pagosProveedores
        .filter(p => p.envio_id === e.id && (esFlete ? p.concepto === 'transporte' : p.concepto === 'fruta'))
        .reduce((s, p) => s + Number(p.monto || 0), 0);
      return { ...e, saldoPendienteProv: Math.max(0, costo - pagado) };
    }).filter(e => e.saldoPendienteProv > 0);
  }, [envios, provSelObj, pagosProveedores]);

  const totalSeleccionadoPagoProv = useMemo(() => {
    return despachosProvSeleccionados.reduce((acc, id) => {
      const item = despachosPendientesParaProveedor.find(e => e.id === id);
      return acc + Number(item?.saldoPendienteProv || 0);
    }, 0);
  }, [despachosProvSeleccionados, despachosPendientesParaProveedor]);

  async function guardarPagoProveedorMultiple(e) {
    e.preventDefault();
    const esFlete = provSelObj?.tipo === 'transporte';
    const payload = despachosProvSeleccionados.map(id => {
      const item = despachosPendientesParaProveedor.find(e => e.id === id);
      return {
        proveedor_id: provSeleccionadoId, envio_id: id,
        monto: item.saldoPendienteProv, fecha: fechaPagoProv,
        concepto: esFlete ? 'transporte' : 'fruta',
        notas: notasPagoProv || `Liquidación #${item.consecutivo}`
      };
    });
    await tesoreriaApi.registrarPagoProveedor(payload);
    setModalPagoProvAbierto(false);
    setDespachosProvSeleccionados([]);
    await cargarDatos();
  }

  const despachosPendientesCliente = useMemo(() => envios.filter(e => Number(e.saldo_pendiente || 0) > 0), [envios]);
  const totalSeleccionadoAbonoMultiple = useMemo(() => {
    return cuentasSeleccionadasModal.reduce((acc, id) => {
      const eObj = envios.find(e => e.id === id);
      return acc + Number(eObj?.saldo_pendiente || 0);
    }, 0);
  }, [cuentasSeleccionadasModal, envios]);

  async function guardarAbonoMultiple(e) {
    e.preventDefault();
    const payload = cuentasSeleccionadasModal.map(id => {
      const eObj = envios.find(e => e.id === id);
      return {
        envio_id: id, monto: Number(eObj?.saldo_pendiente || 0),
        fecha: new Date().toISOString().split('T')[0], metodo_pago: 'Transferencia',
        notas: 'Pago cliente transferido'
      };
    });
    await tesoreriaApi.registrarAbonoCliente(payload);
    setModalAbonoMultipleAbierto(false);
    setCuentasSeleccionadasModal([]);
    await cargarDatos();
  }

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ background: '#131b2e', border: '1px solid #1e293b', borderRadius: '24px', padding: '36px 24px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🥑</div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px' }}>Aguacates & Tesorería</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px' }}>Identifícate para ingresar</p>
          <button onClick={activarHuellaBiometrica} style={{ width: '100%', padding: '15px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
            <Fingerprint size={22} /> Desbloquear con Huella
          </button>
          <form onSubmit={desbloquearConPin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" inputMode="numeric" maxLength="4" placeholder="PIN de 4 dígitos" autoFocus value={pinInput} onChange={(e) => setPinInput(e.target.value)} style={{ width: '100%', padding: '12px', textAlign: 'center', letterSpacing: '8px', fontSize: '22px', fontWeight: 'bold', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' }} />
            {errorBiometria && <span style={{ color: '#ef4444', fontSize: '11px' }}>{errorBiometria}</span>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#38bdf8', color: '#090d16', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1280px', margin: '0 auto', background: tema.bg, color: tema.textMain, minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '26px' }}>🥑</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Aguacates & Tesorería</h1>
            <p style={{ margin: '1px 0 0', color: tema.textMuted, fontSize: '11px' }}>Edison • Innovative • Macareo</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer' }}>{darkMode ? <Sun size={15} color="#eab308" /> : <Moon size={15} color="#64748b" />}</button>
          <button onClick={cargarDatos} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: tema.textMain, cursor: 'pointer' }}><RefreshCw size={15} /></button>
          <button onClick={cerrarSesion} style={{ width: '36px', height: '36px', background: tema.cardBg, border: `1px solid ${tema.border}`, borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}><Lock size={15} /></button>
        </div>
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'grid', gridTemplateColumns: esMovil ? '1fr 1fr' : 'repeat(3, auto)', gap: '8px', marginBottom: '14px' }}>
        <button onClick={abrirModalCrearPedido} style={{ padding: '11px', background: '#eab308', color: '#090d16', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Clock size={16} /> + Pedido</button>
        <button onClick={() => setModalAbonoMultipleAbierto(true)} style={{ padding: '11px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><CheckSquare size={16} /> + Abono</button>
        <button onClick={() => setModalPagoProvAbierto(true)} style={{ gridColumn: esMovil ? 'span 2' : 'auto', padding: '11px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><ArrowUpRight size={16} /> Pagar Proveedor</button>
      </div>

      {/* Tarjetas KPI */}
      <KpiCards 
        tema={tema} esMovil={esMovil} totalPorCobrar={totalPorCobrar}
        enviosConDeudaCliente={enviosConDeudaCliente} filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado} deudaEdison={deudaEdison}
        deudaMacareo={deudaMacareo} metricaMerma={metricaMerma}
        margenTotal={margenTotal} margenPromedioPorKilo={margenPromedioPorKilo}
        porcentajeRentabilidadGlobal={porcentajeRentabilidadGlobal}
        totalKilos={totalKilos} totalCajas={totalCajas}
        cantidadEnvios={enviosFiltrados.length}
        despachosPendientesEdisonCount={despachosPendientesParaProveedor.length}
      />

      {/* Buscador */}
      <div style={{ background: tema.cardBg, padding: '8px 10px', borderRadius: '10px', border: `1px solid ${tema.border}`, marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Search size={13} style={{ color: tema.textMuted }} />
        <input type="text" placeholder="Buscar consecutivo o fecha..." value={filtroTexto} onChange={(e) => setFiltroTexto(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', color: tema.textMain, fontSize: '12px', outline: 'none' }} />
      </div>

      {/* Vistas: PC o Celular */}
      {esMovil ? (
        <TarjetasMovil 
          tema={tema} darkMode={darkMode} loading={loading}
          pedidosPendientes={pedidosPendientes} enviosFiltrados={enviosFiltrados}
          obtenerEstadoEdison={obtenerEstadoEdison}
          abrirModalEditarPedido={abrirModalEditarPedido}
          abrirModalFruta={() => {}} abrirModalFlete={() => {}}
          iniciarLiquidacionPedido={iniciarLiquidacionPedido}
          cancelarPedido={cancelarPedido}
          abrirModalEditarDespacho={abrirModalEditarDespacho}
          abrirModalCuentaSeguro={abrirModalCuentaSeguro}
          compartirPDFWhatsApp={() => {}} abrirModalAbono={() => {}}
          abrirModalHistorial={() => {}}
          setProvSeleccionadoId={setProvSeleccionadoId}
          setDespachosProvSeleccionados={setDespachosProvSeleccionados}
          setFechaPagoProv={setFechaPagoProv} setNotasPagoProv={setNotasPagoProv}
          setModalPagoProvAbierto={setModalPagoProvAbierto}
          proveedores={proveedores}
        />
      ) : (
        <TablaEnvios 
          tema={tema} enviosFiltrados={enviosFiltrados}
          pedidosPendientes={pedidosPendientes} seleccionadosTabla={seleccionadosTabla}
          toggleSeleccionFila={toggleSeleccionFila}
          toggleSeleccionarTodoTabla={toggleSeleccionarTodoTabla}
          handleOrdenar={handleOrdenar} renderIconoOrden={() => null}
          obtenerEstadoEdison={obtenerEstadoEdison}
          abrirModalFruta={() => {}} abrirModalFlete={() => {}}
          abrirModalEditarPedido={abrirModalEditarPedido}
          iniciarLiquidacionPedido={iniciarLiquidacionPedido}
          cancelarPedido={cancelarPedido}
          abrirModalEditarDespacho={abrirModalEditarDespacho}
          abrirModalCuentaSeguro={abrirModalCuentaSeguro}
          compartirPDFWhatsApp={() => {}} abrirModalAbono={() => {}}
          abrirModalHistorial={() => {}}
          setProvSeleccionadoId={setProvSeleccionadoId}
          setDespachosProvSeleccionados={setDespachosProvSeleccionados}
          setFechaPagoProv={setFechaPagoProv} setNotasPagoProv={setNotasPagoProv}
          setModalPagoProvAbierto={setModalPagoProvAbierto}
          proveedores={proveedores}
        />
      )}

      {/* Modales de Control */}
      <ModalCuentaCobro modalCuentaCobro={modalCuentaCobro} setModalCuentaCobro={setModalCuentaCobro} />
      <ModalPedido modalNuevoPedido={modalNuevoPedido} setModalNuevoPedido={setModalNuevoPedido} formPedido={formPedido} setFormPedido={setFormPedido} guardarNuevoPedido={guardarNuevoPedido} tema={tema} PRECIOS_COMPRA={PRECIOS_COMPRA} TARIFAS_FLETE={TARIFAS_FLETE} />
      <ModalLiquidacion modalLiquidarPedido={modalLiquidarPedido} setModalLiquidarPedido={setModalLiquidarPedido} formLiquidar={formLiquidar} setFormLiquidar={setFormLiquidar} confirmarLiquidacionPedido={confirmarLiquidacionPedido} tema={tema} darkMode={darkMode} />
      <ModalPagoProveedor modalPagoProvAbierto={modalPagoProvAbierto} setModalPagoProvAbierto={setModalPagoProvAbierto} guardarPagoProveedorMultiple={guardarPagoProveedorMultiple} provSeleccionadoId={provSeleccionadoId} setProvSeleccionadoId={setProvSeleccionadoId} setDespachosProvSeleccionados={setDespachosProvSeleccionados} despachosProvSeleccionados={despachosProvSeleccionados} toggleSeleccionDespachoProv={(id) => setDespachosProvSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} proveedores={proveedores} despachosPendientesParaProveedor={despachosPendientesParaProveedor} totalSeleccionadoPagoProv={totalSeleccionadoPagoProv} tema={tema} darkMode={darkMode} />
      <ModalAbonoMultiple modalAbonoMultipleAbierto={modalAbonoMultipleAbierto} setModalAbonoMultipleAbierto={setModalAbonoMultipleAbierto} guardarAbonoMultiple={guardarAbonoMultiple} despachosPendientesCliente={despachosPendientesCliente} cuentasSeleccionadasModal={cuentasSeleccionadasModal} toggleSeleccionCuentaModal={(id) => setCuentasSeleccionadasModal(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} montoRealRecibido={montoRealRecibido} setMontoRealRecibido={setMontoRealRecibido} totalSeleccionadoAbonoMultiple={totalSeleccionadoAbonoMultiple} diferenciaDescuento={0} esDescuentoDefinitivo={esDescuentoDefinitivo} setEsDescuentoDefinitivo={setEsDescuentoDefinitivo} tema={tema} />
      <ModalEditarDespacho modalEditarDespachoCompleto={modalEditarDespachoCompleto} setModalEditarDespachoCompleto={setModalEditarDespachoCompleto} formEdicion={formEdicion} setFormEdicion={setFormEdicion} guardarEdicionDespacho={guardarEdicionDespacho} tema={tema} />
      <ModalEditarPedido modalEditarPedido={modalEditarPedido} setModalEditarPedido={setModalEditarPedido} formEditarPed={formEditarPed} setFormEditarPed={setFormEditarPed} guardarEdicionPedido={guardarEdicionPedido} tema={tema} />
    </div>
  );
}