import { useEffect, useRef, useState } from "react";
import { Camera, QrCode, Search, XCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";

function EscanearQR() {
  const navigate = useNavigate();

  const scannerRef = useRef(null);
  const escaneadoRef = useRef(false);

  const [mensaje, setMensaje] = useState(null);
  const [codigoManual, setCodigoManual] = useState("");

  useEffect(() => {
    document.title = "Aduanas Chile - Escanear QR";

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 260,
          height: 260
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        if (escaneadoRef.current) return;

        escaneadoRef.current = true;
        await buscarTramite(decodedText);
      },
      () => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
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
        texto: "No se detectó ningún código."
      });
      escaneadoRef.current = false;
      return;
    }

    if (!/^ADU-\d{4}-\d{5}$/.test(codigo)) {
      setMensaje({
        tipo: "error",
        texto: "El QR leído no corresponde a un código de trámite válido."
      });
      escaneadoRef.current = false;
      return;
    }

    try {
      setMensaje({
        tipo: "ok",
        texto: `Código leído: ${codigo}. Buscando trámite...`
      });

      const response = await api.get(`/tramites/codigo/${encodeURIComponent(codigo)}`);

      if (scannerRef.current) {
        await scannerRef.current.clear().catch(() => {});
      }

      navigate(`/tramites/${response.data.id}`);
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.response?.data?.mensaje ||
          "No se pudo encontrar el trámite escaneado."
      });

      escaneadoRef.current = false;
    }
  };

  const buscarManual = async (e) => {
    e.preventDefault();
    escaneadoRef.current = true;
    await buscarTramite(codigoManual);
  };

  const reiniciarEscaneo = () => {
    window.location.reload();
  };

  return (
    <Layout
      titulo="Escanear QR"
      subtitulo="Escanea el comprobante digital presentado por la persona para revisar su trámite."
    >
      <section className="scanner-grid">
        <article className="panel-card scanner-card">
          <div className="form-section-title">
            <QrCode size={22} />
            <h2>Lector QR Aduana</h2>
          </div>

          <p className="muted">
            Permite el uso de la cámara y apunta al código QR del comprobante digital.
          </p>

          <div id="qr-reader" className="qr-reader-box"></div>

          {mensaje && (
            <div
              className={`alert ${
                mensaje.tipo === "ok" ? "alert-success" : "alert-error"
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          <button type="button" className="secondary-btn scanner-reset-btn" onClick={reiniciarEscaneo}>
            <Camera size={18} />
            Reiniciar cámara
          </button>
        </article>

        <article className="panel-card scanner-card">
          <div className="form-section-title">
            <Search size={22} />
            <h2>Búsqueda manual</h2>
          </div>

          <p className="muted">
            También puedes ingresar manualmente el código del comprobante.
          </p>

          <form className="manual-code-form" onSubmit={buscarManual}>
            <label>
              Código de trámite
              <input
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                placeholder="Ej: ADU-2026-00001"
              />
            </label>

            <button type="submit" className="primary-btn">
              <Search size={18} />
              Buscar trámite
            </button>
          </form>

          <div className="scanner-help">
            <XCircle size={18} />
            <span>
              Si la cámara no abre, revisa que el navegador tenga permiso de cámara.
            </span>
          </div>
        </article>
      </section>
    </Layout>
  );
}

export default EscanearQR;