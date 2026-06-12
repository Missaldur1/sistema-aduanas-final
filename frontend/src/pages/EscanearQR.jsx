import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  QrCode,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";

function EscanearQR() {
  const navigate = useNavigate();

  const lectorRef = useRef(null);
  const escaneadoRef = useRef(false);

  const [camaraActiva, setCamaraActiva] = useState(false);
  const [cargandoCamara, setCargandoCamara] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [codigoManual, setCodigoManual] = useState("");

  useEffect(() => {
    document.title = "Aduanas Chile - Escanear QR";

    lectorRef.current = new Html5Qrcode("qr-reader-custom");

    return () => {
      detenerCamara();
    };
  }, []);

  const normalizarCodigo = (texto) => {
    return texto.toString().trim().toUpperCase();
  };

  const buscarTramite = async (codigoLeido) => {
    const codigo = normalizarCodigo(codigoLeido);

    if (!codigo) {
      setMensaje({
        tipo: "error",
        texto: "No se detectó ningún código.",
      });
      escaneadoRef.current = false;
      return;
    }

    if (!/^ADU-\d{4}-\d{5}$/.test(codigo)) {
      setMensaje({
        tipo: "error",
        texto: "El QR leído no corresponde a un código de trámite válido.",
      });
      escaneadoRef.current = false;
      return;
    }

    try {
      setMensaje({
        tipo: "ok",
        texto: `Código leído correctamente: ${codigo}. Redirigiendo al trámite...`,
      });

      await detenerCamara();

      const response = await api.get(
        `/tramites/codigo/${encodeURIComponent(codigo)}`
      );

      navigate(`/tramites/${response.data.id}`);
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.response?.data?.mensaje ||
          "No se pudo encontrar el trámite escaneado.",
      });

      escaneadoRef.current = false;
    }
  };

  const iniciarCamara = async () => {
    try {
      setMensaje(null);
      setCargandoCamara(true);
      escaneadoRef.current = false;

      if (!lectorRef.current) {
        lectorRef.current = new Html5Qrcode("qr-reader-custom");
      }

      await lectorRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
        },
        async (decodedText) => {
          if (escaneadoRef.current) return;

          escaneadoRef.current = true;
          await buscarTramite(decodedText);
        },
        () => {}
      );

      setCamaraActiva(true);
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          "No se pudo abrir la cámara. Revisa los permisos del navegador o intenta desde un celular.",
      });
    } finally {
      setCargandoCamara(false);
    }
  };

  const detenerCamara = async () => {
    try {
      if (lectorRef.current?.isScanning) {
        await lectorRef.current.stop();
      }

      if (lectorRef.current) {
        await lectorRef.current.clear();
      }
    } catch (error) {
      // Evita errores si la cámara ya estaba detenida
    } finally {
      setCamaraActiva(false);
    }
  };

  const buscarManual = async (e) => {
    e.preventDefault();
    escaneadoRef.current = true;
    await buscarTramite(codigoManual);
  };

  return (
    <Layout
      titulo="Escanear QR"
      subtitulo="Escanea el comprobante digital presentado por la persona para revisar su trámite."
    >
      <section className="qr-admin-page">
        <article className="qr-admin-hero">
          <div className="qr-admin-hero-icon">
            <ShieldCheck size={30} />
          </div>

          <div>
            <p className="eyebrow">Control Aduanero</p>
            <h2>Escáner de comprobantes digitales</h2>
            <p>
              Usa la cámara del dispositivo para leer el QR del comprobante y
              abrir automáticamente el detalle del trámite registrado.
            </p>
          </div>
        </article>

        <section className="qr-admin-grid">
          <article className="qr-scanner-card">
            <div className="qr-card-header">
              <div>
                <div className="qr-title-row">
                  <QrCode size={24} />
                  <h2>Lector QR</h2>
                </div>
                <p>
                  Presiona el botón para activar la cámara y apunta al código QR
                  del usuario.
                </p>
              </div>

              <span
                className={`qr-status ${
                  camaraActiva ? "qr-status-active" : ""
                }`}
              >
                {camaraActiva ? "Cámara activa" : "Cámara detenida"}
              </span>
            </div>

            <div className="qr-camera-frame">
              {!camaraActiva && (
                <div className="qr-camera-placeholder">
                  <div className="qr-camera-icon">
                    <Camera size={42} />
                  </div>
                  <h3>Cámara lista para escanear</h3>
                  <p>
                    El navegador solicitará permiso para utilizar la cámara del
                    dispositivo.
                  </p>
                </div>
              )}

              <div id="qr-reader-custom" className="qr-reader-custom"></div>
            </div>

            {mensaje && (
              <div
                className={`qr-message ${
                  mensaje.tipo === "ok" ? "qr-message-ok" : "qr-message-error"
                }`}
              >
                {mensaje.tipo === "ok" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                <span>{mensaje.texto}</span>
              </div>
            )}

            <div className="qr-actions">
              {!camaraActiva ? (
                <button
                  type="button"
                  className="primary-btn qr-main-btn"
                  onClick={iniciarCamara}
                  disabled={cargandoCamara}
                >
                  <Camera size={18} />
                  {cargandoCamara ? "Abriendo cámara..." : "Iniciar escaneo"}
                </button>
              ) : (
                <button
                  type="button"
                  className="secondary-btn qr-main-btn"
                  onClick={detenerCamara}
                >
                  <CameraOff size={18} />
                  Detener cámara
                </button>
              )}
            </div>
          </article>

          <article className="qr-manual-card">
            <div className="qr-title-row">
              <Search size={24} />
              <h2>Búsqueda manual</h2>
            </div>

            <p>
              Si el QR no puede ser leído, ingresa manualmente el código del
              comprobante.
            </p>

            <form className="manual-code-form" onSubmit={buscarManual}>
              <label>
                Código de trámite
                <input
                  value={codigoManual}
                  onChange={(e) =>
                    setCodigoManual(e.target.value.toUpperCase())
                  }
                  placeholder="Ej: ADU-2026-00001"
                />
              </label>

              <button type="submit" className="primary-btn">
                <Search size={18} />
                Buscar trámite
              </button>
            </form>

            <div className="qr-help-box">
              <h3>Recomendaciones</h3>
              <ul>
                <li>Escanea el QR con buena iluminación.</li>
                <li>Evita reflejos sobre la pantalla del usuario.</li>
                <li>Mantén el QR dentro del recuadro de la cámara.</li>
                <li>Usa la búsqueda manual si la cámara no detecta el código.</li>
              </ul>
            </div>
          </article>
        </section>
      </section>
    </Layout>
  );
}

export default EscanearQR;