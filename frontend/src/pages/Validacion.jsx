import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, RefreshCcw } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";

function Validacion() {
  useEffect(() => {
  document.title = "Aduanas Chile - Validaciones";
}, []);
  const [tramites, setTramites] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    const res = await api.get("/tramites");
    setTramites(res.data);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const validar = async (id) => {
    setMensaje("");
    try {
      const res = await api.patch(`/tramites/${id}/validar`);
      setMensaje(`${res.data.mensaje}: ${res.data.estado}`);
      cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No se pudo validar el trámite");
    }
  };

  return (
    <Layout titulo="Validación PDI / SAG / Aduana" subtitulo="Simulación de validación automática y emisión de alertas.">
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      <section className="panel-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Revisión operativa</p>
            <h2>Trámites pendientes y observados</h2>
          </div>
          <ClipboardCheck size={26} />
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Persona</th>
                <th>Documento</th>
                <th>Vehículo</th>
                <th>Riesgo</th>
                <th>Puntaje</th>
                <th>Acción recomendada</th>
                <th>Estado</th>
                <th>Validar</th>
              </tr>
            </thead>
            <tbody>
              {tramites.map((t) => (
                <tr key={t.id}>
                  <td>{t.codigo_tramite || `#${t.id}`}</td>
                  <td>{t.persona_nombre}</td>
                  <td>{t.documento_numero}</td>
                  <td>{t.patente}</td>
                  <td>
                    <span className={`risk-pill ${t.nivel_riesgo?.toLowerCase()}`}>
                      {t.nivel_riesgo || "VERDE"}
                    </span>
                  </td>
                  <td>{t.puntaje_riesgo ?? 0}</td>
                  <td>{t.accion_recomendada || "Revisión estándar"}</td>
                  <td>
                    <span className={`status-pill ${t.estado?.toLowerCase()}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/tramites/${t.id}`} className="detail-btn">
                        Ver detalle
                      </Link>
                                  
                      <button
                        className="primary-btn small-btn"
                        onClick={() => validar(t.id)}
                      >
                        Validar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!tramites.length && !cargando && <tr><td colSpan="9">No hay trámites para validar.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Validacion;
