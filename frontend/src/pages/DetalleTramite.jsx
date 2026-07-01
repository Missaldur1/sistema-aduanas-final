import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Paperclip,
  ShieldAlert,
  User,
  Users,
} from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";

function valorSiNo(valor) {
  return valor ? "Sí" : "No";
}

function formatearTamanoArchivo(tamano = 0) {
  const bytes = Number(tamano || 0);

  if (!bytes) return "Tamaño no registrado";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function obtenerUrlDocumento(documento) {
  if (!documento?.contenido_base64) return "#";

  if (documento.contenido_base64.startsWith("data:")) {
    return documento.contenido_base64;
  }

  return `data:${documento.mime_type};base64,${documento.contenido_base64}`;
}

function DetalleTramite() {
  useEffect(() => {
    document.title = "Aduanas Chile - Detalle Trámite";
  }, []);

  const { id } = useParams();

  const [tramite, setTramite] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      const response = await api.get(`/tramites/${id}`);
      setTramite(response.data);
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.mensaje ||
          "No se pudo cargar el detalle del trámite"
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  if (cargando) {
    return (
      <Layout
        titulo="Detalle del trámite"
        subtitulo="Cargando información del trámite aduanero."
      >
        <div className="panel-card">
          <p>Cargando detalle...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        titulo="Detalle del trámite"
        subtitulo="No se pudo obtener la información solicitada."
      >
        <div className="panel-card">
          <div className="alert alert-error">{error}</div>

          <Link to="/validacion" className="secondary-link detail-back-link">
            <ArrowLeft size={17} />
            Volver a validación
          </Link>
        </div>
      </Layout>
    );
  }

  const menores = tramite?.menores || [];
  const documentos = tramite?.documentos || [];
  const esPasajero = tramite?.rol_viajero === "PASAJERO";

  return (
    <Layout
      titulo={`Trámite ${tramite.codigo_tramite || `#${tramite.id}`}`}
      subtitulo="Vista completa para revisión de Aduanas."
    >
      <div className="detail-actions">
        <Link to="/validacion" className="secondary-link detail-back-link">
          <ArrowLeft size={17} />
          Volver a validación
        </Link>
      </div>

      <section className="detail-hero panel-card">
        <div>
          <p className="eyebrow">Resumen del trámite</p>
          <h2>{tramite.codigo_tramite || `#${tramite.id}`}</h2>

          <p>
            Estado actual:{" "}
            <span className={`status-pill ${tramite.estado?.toLowerCase()}`}>
              {tramite.estado}
            </span>
          </p>

          <p>
            Menores acompañantes:{" "}
            <strong>{tramite.menores_count || menores.length || 0}</strong>
          </p>

          <p>
            Documentos adjuntos:{" "}
            <strong>{tramite.documentos_count || documentos.length || 0}</strong>
          </p>
        </div>

        <div className="detail-side-summary">
          <div className="risk-summary-card">
            <span
              className={`risk-pill ${tramite.nivel_riesgo?.toLowerCase()}`}
            >
              {tramite.nivel_riesgo || "VERDE"}
            </span>
            <strong>Semáforo de revisión</strong>
            <small>{tramite.accion_recomendada || "Revisión estándar"}</small>
          </div>

          <div className="admin-qr-card">
            <QRCodeSVG
              value={tramite.codigo_tramite || `TRAMITE-${tramite.id}`}
              size={132}
              level="H"
              includeMargin
            />
            <span>QR del trámite</span>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <article className="panel-card detail-card">
          <div className="detail-card-title">
            <User size={22} />
            <h3>Datos de la persona</h3>
          </div>

          <div className="detail-list">
            <p>
              <strong>Nombre:</strong> {tramite.persona_nombre}{" "}
              {tramite.persona_apellido}
            </p>
            <p>
              <strong>Documento:</strong> {tramite.documento_tipo}{" "}
              {tramite.documento_numero}
            </p>
            <p>
              <strong>Nacionalidad:</strong>{" "}
              {tramite.nacionalidad || "No registrada"}
            </p>
            <p>
              <strong>Fecha nacimiento:</strong>{" "}
              {tramite.fecha_nacimiento || "No registrada"}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              {tramite.persona_telefono || "No registrado"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {tramite.persona_email || "No registrado"}
            </p>
            <p>
              <strong>Antecedente penal:</strong>{" "}
              {valorSiNo(tramite.antecedente_penal)}
            </p>
            <p>
              <strong>Detalle antecedente:</strong>{" "}
              {tramite.persona_detalle_antecedente || "Sin detalle"}
            </p>
          </div>
        </article>

        <article className="panel-card detail-card">
          <div className="detail-card-title">
            <Car size={22} />
            <h3>Datos del vehículo</h3>
          </div>

          <div className="detail-list">
            <p>
              <strong>Condición del viajero:</strong>{" "}
              {tramite.condicion_viajero ||
                (esPasajero ? "Acompañante / Pasajero" : "Chofer / Conductor")}
            </p>

            {esPasajero ? (
              <>
                <p>
                  <strong>Datos del vehículo:</strong> No requeridos para pasajero.
                </p>
                <p>
                  <strong>Observación:</strong>{" "}
                  {tramite.observacion_pasajero ||
                    "La persona indicó que viaja como acompañante o pasajero."}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Tipo:</strong> {tramite.vehiculo_tipo}
                </p>
                <p>
                  <strong>Patente:</strong> {tramite.patente}
                </p>
                <p>
                  <strong>País de origen:</strong> {tramite.pais_origen}
                </p>
                <p>
                  <strong>Marca:</strong> {tramite.marca}
                </p>
                <p>
                  <strong>Modelo:</strong> {tramite.modelo}
                </p>
                <p>
                  <strong>Año:</strong> {tramite.anio || "No registrado"}
                </p>
                <p>
                  <strong>Color:</strong> {tramite.color || "No registrado"}
                </p>
                <p>
                  <strong>Chasis:</strong> {tramite.chasis || "No registrado"}
                </p>
                <p>
                  <strong>Motor:</strong> {tramite.motor || "No registrado"}
                </p>
                <p>
                  <strong>Antecedente vehículo:</strong>{" "}
                  {valorSiNo(tramite.antecedente_vehiculo)}
                </p>
                <p>
                  <strong>Detalle antecedente:</strong>{" "}
                  {tramite.vehiculo_detalle_antecedente || "Sin detalle"}
                </p>
              </>
            )}
          </div>
        </article>

        <article className="panel-card detail-card">
          <div className="detail-card-title">
            <ClipboardCheck size={22} />
            <h3>Declaración jurada</h3>
          </div>

          <div className="detail-list">
            <p>
              <strong>Transporta alimentos:</strong>{" "}
              {valorSiNo(tramite.transporta_alimentos)}
            </p>
            <p>
              <strong>Transporta vegetales:</strong>{" "}
              {valorSiNo(tramite.transporta_vegetales)}
            </p>
            <p>
              <strong>Transporta animales:</strong>{" "}
              {valorSiNo(tramite.transporta_animales)}
            </p>
            <p>
              <strong>Dinero o valores declarables:</strong>{" "}
              {valorSiNo(tramite.dinero_mayor_declarable)}
            </p>
            <p>
              <strong>Observaciones:</strong>{" "}
              {tramite.declaracion_observaciones || "Sin observaciones"}
            </p>
          </div>
        </article>

        <article className="panel-card detail-card">
          <div className="detail-card-title">
            <FileText size={22} />
            <h3>Información del viaje</h3>
          </div>

          <div className="detail-list">
            <p>
              <strong>Frontera:</strong> {tramite.frontera}
            </p>
            <p>
              <strong>Motivo:</strong> {tramite.motivo_viaje}
            </p>
            <p>
              <strong>Destino:</strong> {tramite.destino}
            </p>
            <p>
              <strong>Fecha:</strong> {tramite.fecha}
            </p>
            <p>
              <strong>Resultado PDI:</strong> {tramite.resultado_pdi}
            </p>
            <p>
              <strong>Resultado SAG:</strong> {tramite.resultado_sag}
            </p>
            <p>
              <strong>Resultado Aduana:</strong> {tramite.resultado_aduana}
            </p>
            <p>
              <strong>Observaciones Aduana:</strong>{" "}
              {tramite.observaciones || "Sin observaciones"}
            </p>
          </div>
        </article>
      </section>

      <section className="panel-card minors-detail-panel">
        <div className="detail-card-title">
          <Users size={24} />
          <h3>Menores acompañantes</h3>
        </div>

        {menores.length > 0 ? (
          <div className="minors-detail-list">
            {menores.map((menor, index) => (
              <article className="minor-detail-card" key={menor.id || index}>
                <div className="minor-detail-header">
                  <div>
                    <span>Menor {index + 1}</span>
                    <strong>
                      {menor.nombre} {menor.apellido}
                    </strong>
                  </div>

                  <small>{menor.parentesco || "Relación no registrada"}</small>
                </div>

                <div className="minor-detail-grid">
                  <p>
                    <strong>Documento:</strong> {menor.documento_tipo}{" "}
                    {menor.documento_numero}
                  </p>
                  <p>
                    <strong>Nacionalidad:</strong>{" "}
                    {menor.nacionalidad || "No registrada"}
                  </p>
                  <p>
                    <strong>Fecha nacimiento:</strong>{" "}
                    {menor.fecha_nacimiento || "No registrada"}
                  </p>
                  <p>
                    <strong>Parentesco:</strong>{" "}
                    {menor.parentesco || "No registrado"}
                  </p>
                  <p>
                    <strong>Autorización viaje:</strong>{" "}
                    {menor.autorizacion_viaje || "No registrada"}
                  </p>
                  <p>
                    <strong>Observaciones:</strong>{" "}
                    {menor.observaciones || "Sin observaciones"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="minor-empty-box">
            Este trámite no registra menores acompañantes.
          </div>
        )}
      </section>

      <section className="panel-card documents-detail-panel">
        <div className="detail-card-title">
          <Paperclip size={24} />
          <h3>Documentos adjuntos</h3>
        </div>

        {documentos.length > 0 ? (
          <div className="documents-detail-list">
            {documentos.map((documento, index) => {
              const urlDocumento = obtenerUrlDocumento(documento);

              return (
                <article
                  className="document-detail-card"
                  key={documento.id || index}
                >
                  <div className="document-detail-header">
                    <div>
                      <span>Documento {index + 1}</span>
                      <strong>{documento.tipo_documento}</strong>
                      <small>{documento.nombre_archivo}</small>
                    </div>

                    <div className="document-type-pill">
                      {documento.mime_type || "Archivo"}
                    </div>
                  </div>

                  <div className="document-detail-grid">
                    <p>
                      <strong>Nombre archivo:</strong>{" "}
                      {documento.nombre_archivo || "No registrado"}
                    </p>
                    <p>
                      <strong>Tipo archivo:</strong>{" "}
                      {documento.mime_type || "No registrado"}
                    </p>
                    <p>
                      <strong>Tamaño:</strong>{" "}
                      {formatearTamanoArchivo(documento.tamano)}
                    </p>
                    <p>
                      <strong>Observaciones:</strong>{" "}
                      {documento.observaciones || "Sin observaciones"}
                    </p>
                  </div>

                  <div className="document-actions">
                    <a
                      className="document-action-btn"
                      href={urlDocumento}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye size={17} />
                      Ver archivo
                    </a>

                    <a
                      className="document-action-btn document-download-btn"
                      href={urlDocumento}
                      download={documento.nombre_archivo || "documento-adjunto"}
                    >
                      <Download size={17} />
                      Descargar
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="document-empty-box">
            Este trámite no registra documentos adjuntos.
          </div>
        )}
      </section>

      <section className="panel-card risk-detail-panel">
        <div className="detail-card-title">
          {tramite.nivel_riesgo === "ROJO" ? (
            <ShieldAlert size={24} />
          ) : (
            <AlertTriangle size={24} />
          )}
          <h3>Semáforo de revisión</h3>
        </div>

        <div className="risk-analysis-box">
          <div>
            <span
              className={`risk-pill ${tramite.nivel_riesgo?.toLowerCase()}`}
            >
              {tramite.nivel_riesgo || "VERDE"}
            </span>
          </div>

          <div>
            <p>
              <strong>Motivos:</strong>{" "}
              {tramite.motivo_riesgo || "Sin factores de riesgo detectados"}
            </p>
            <p>
              <strong>Acción recomendada:</strong>{" "}
              {tramite.accion_recomendada || "Revisión estándar"}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default DetalleTramite;