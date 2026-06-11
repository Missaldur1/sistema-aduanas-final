import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Car, CheckCircle2, Clock3, FileText, Trash2 } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";
import { getUsuario } from "../utils/auth";

function Dashboard() {
  const usuario = getUsuario();

  useEffect(() => {
    document.title = "Aduanas Chile - Panel";
  }, []);

  const esAdmin = usuario?.rol === "ADMIN";

  const [tramites, setTramites] = useState([]);
  const [resumen, setResumen] = useState({
    vehiculos: 0,
    tramites: 0,
    aprobados: 0,
    alertas: 0,
    ultimas_alertas: []
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);

      const [tramitesRes, resumenRes] = await Promise.all([
        api.get("/tramites"),
        esAdmin ? api.get("/reportes/resumen") : Promise.resolve({ data: null })
      ]);

      setTramites(tramitesRes.data);

      if (resumenRes.data) {
        setResumen(resumenRes.data);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setCargando(false);
    }
  }, [esAdmin]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const limpiarRegistrosBD = async () => {
    const confirmar = window.confirm(
      "Esto eliminará trámites, personas, vehículos, declaraciones, alertas y validaciones. El usuario admin se mantiene. ¿Deseas continuar?"
    );

    if (!confirmar) return;

    try {
      await api.delete("/dev/limpiar-registros");

      alert("Registros eliminados correctamente. El usuario admin se mantiene.");

      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.mensaje || "No se pudieron eliminar los registros.");
    }
  };

  const datosPersona = useMemo(() => {
    const total = tramites.length;

    return {
      total,
      aprobados: tramites.filter((t) => t.estado === "APROBADO").length,
      observados: tramites.filter(
        (t) => t.estado === "OBSERVADO" || t.estado === "RECHAZADO"
      ).length,
      pendientes: tramites.filter(
        (t) => t.estado === "PENDIENTE" || t.estado === "EN_REVISION"
      ).length
    };
  }, [tramites]);

  const cards = esAdmin
    ? [
        { titulo: "Vehículos registrados", valor: resumen.vehiculos, icon: Car, clase: "blue" },
        { titulo: "Trámites totales", valor: resumen.tramites, icon: FileText, clase: "orange" },
        { titulo: "Aprobados", valor: resumen.aprobados, icon: CheckCircle2, clase: "green" },
        { titulo: "Alertas abiertas", valor: resumen.alertas, icon: AlertTriangle, clase: "red" }
      ]
    : [
        { titulo: "Mis trámites", valor: datosPersona.total, icon: FileText, clase: "blue" },
        { titulo: "Aprobados", valor: datosPersona.aprobados, icon: CheckCircle2, clase: "green" },
        { titulo: "Observados", valor: datosPersona.observados, icon: AlertTriangle, clase: "red" },
        { titulo: "Pendientes", valor: datosPersona.pendientes, icon: Clock3, clase: "orange" }
      ];

  return (
    <Layout
      titulo={esAdmin ? "Panel de Aduana" : "Mi paso por aduanas"}
      subtitulo={
        esAdmin
          ? "Control de registros, validaciones y alertas operativas."
          : "Registra tu vehículo y consulta el estado de tu trámite."
      }
    >
      {esAdmin && (
        <section className="admin-actions-card">
          <div>
            <p className="eyebrow">Mantenimiento</p>
            <h2>Limpiar registros de prueba</h2>
            <p>
              Elimina trámites, personas, vehículos, declaraciones, alertas y validaciones.
              El usuario administrador se mantiene activo.
            </p>
          </div>

          <button type="button" className="danger-action" onClick={limpiarRegistrosBD}>
            <Trash2 size={18} />
            Eliminar registros BD
          </button>
        </section>
      )}

      <section className="stats-grid">
        {cards.map(({ titulo, valor, icon: Icon, clase }) => (
          <article className="stat-card" key={titulo}>
            <div>
              <span>{titulo}</span>
              <strong>{cargando ? "..." : valor}</strong>
            </div>
            <div className={`stat-icon ${clase}`}>
              <Icon size={25} />
            </div>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel-card wide-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Flujo fronterizo</p>
              <h2>{esAdmin ? "Últimos trámites registrados" : "Mis últimos trámites"}</h2>
            </div>
          </div>

          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Persona</th>
                  <th>Vehículo</th>
                  <th>Destino</th>
                  <th>Riesgo</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {tramites.slice(0, 8).map((t) => (
                  <tr key={t.id}>
                    <td>{t.codigo_tramite || `#${t.id}`}</td>
                    <td>{t.persona_nombre}</td>
                    <td>
                      {t.patente} · {t.marca}
                    </td>
                    <td>{t.destino}</td>
                    <td>
                      <span className={`risk-pill ${t.nivel_riesgo?.toLowerCase()}`}>
                        {t.nivel_riesgo || "VERDE"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${t.estado?.toLowerCase()}`}>
                        {t.estado}
                      </span>
                    </td>
                  </tr>
                ))}

                {!tramites.length && !cargando && (
                  <tr>
                    <td colSpan="6">Aún no hay trámites registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel-card">
          <p className="eyebrow">Alertas y revisión</p>
          <h2>{esAdmin ? "Alertas recientes" : "Consejos antes de cruzar"}</h2>

          {esAdmin ? (
            <div className="alert-list">
              {resumen.ultimas_alertas?.length ? (
                resumen.ultimas_alertas.map((a) => (
                  <div className="mini-alert" key={a.id}>
                    <strong>
                      {a.prioridad} · {a.patente}
                    </strong>
                    <span>{a.mensaje}</span>
                  </div>
                ))
              ) : (
                <p className="muted">No hay alertas abiertas.</p>
              )}
            </div>
          ) : (
            <div className="tips-list">
              <span>Completa tus datos personales sin abreviaciones.</span>
              <span>Declara alimentos, vegetales, animales o dinero declarable.</span>
              <span>Revisa que la patente y documentos del vehículo estén correctos.</span>
            </div>
          )}
        </article>
      </section>
    </Layout>
  );
}

export default Dashboard;