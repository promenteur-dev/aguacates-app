import React from 'react';
import jsPDF from 'jspdf';
import { X, Download, Share2 } from 'lucide-react';
import { formatoCOP } from '../../hooks/useFinanzas';

export default function ModalCuentaCobro({ modalCuentaCobro, setModalCuentaCobro }) {
  if (!modalCuentaCobro) return null;

  function generarPDFExacto1Pagina(envio) {
    const doc = new jsPDF({ format: 'letter', unit: 'mm' });
    const kilos = Number(envio.kilos_calc || envio.kilos || 0);
    const cajas = Number(envio.cajas_calc || envio.cajas || 0);
    const pVenta = Number(envio.precio_venta_kg_calc || envio.precio_venta_kg || 11200);
    const vFruta = Number(envio.total_venta_fruta_calc || envio.total_venta_fruta || (kilos * pVenta));
    const vFlete = Number(envio.total_flete_calc || envio.total_flete || (cajas * 32000));
    const vTotal = Number(envio.total_facturado_calc || envio.total_facturado_cliente || (vFruta + vFlete));

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

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.3);
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

    doc.setDrawColor(226, 232, 240);
    doc.line(25, 102, 190, 102);

    doc.setFillColor(248, 250, 252);
    doc.rect(25, 103, 165, 10.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL A PAGAR', 29, 110);
    doc.text(formatoCOP(vTotal), 186, 110, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(25, 122, 165, 18, 2, 2);
    doc.text('Forma de Pago: Bancolombia Ahorros # 554 879 253 72', 29, 130);
    doc.text('A nombre de: Elkin Bohórquez Tarud (CC 72.271.189)', 29, 136);

    try {
      const img = new Image();
      img.src = '/firma.png';
      doc.addImage(img, 'PNG', 25, 155, 45, 16);
    } catch (e) {
      console.log('Firma gráfica omitida');
    }

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.4);
    doc.line(25, 173, 85, 173);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('Elkin Bohórquez Tarud', 25, 178.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text('C.C. 72.271.189', 25, 184);

    return doc;
  }

  function descargarPDF() {
    const doc = generarPDFExacto1Pagina(modalCuentaCobro);
    doc.save(`Cuenta_Cobro_${modalCuentaCobro.consecutivo}_Aguacates.pdf`);
  }

  async function compartirPDF() {
    try {
      const doc = generarPDFExacto1Pagina(modalCuentaCobro);
      const pdfBlob = doc.output('blob');
      const nombreArchivo = `Cuenta_Cobro_${modalCuentaCobro.consecutivo}_Aguacates.pdf`;
      const archivo = new File([pdfBlob], nombreArchivo, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: `Cuenta de Cobro #${modalCuentaCobro.consecutivo}`,
          text: `Hola, adjunto la Cuenta de Cobro #${modalCuentaCobro.consecutivo}.`
        });
        return;
      }
    } catch (err) {
      console.log('Compartir cancelado o no soportado:', err);
    }

    descargarPDF();
    const texto = encodeURIComponent(`Hola, adjunto la Cuenta de Cobro #${modalCuentaCobro.consecutivo} de Aguacates.`);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
  }

  return (
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={descargarPDF} 
              style={{ padding: '7px 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Download size={15} /> Descargar PDF
            </button>
            <button 
              onClick={compartirPDF} 
              style={{ padding: '7px 14px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Share2 size={15} /> Compartir PDF WhatsApp
            </button>
          </div>
          <button 
            onClick={() => setModalCuentaCobro(null)} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            CUENTA DE COBRO # {modalCuentaCobro.consecutivo}
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginTop: '2px' }}>
            Fecha: {modalCuentaCobro.fecha_envio}
          </div>
        </div>

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

        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div>Forma de Pago: <b>Bancolombia Ahorros # 554 879 253 72</b></div>
          <div>A nombre de: <b>Elkin Bohórquez Tarud</b> (CC 72.271.189)</div>
        </div>

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
  );
}