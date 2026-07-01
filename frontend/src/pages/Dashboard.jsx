import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Trash2,
} from "lucide-react";
import { exportarCSV } from "../utils/exportarCSV";
import api from "../api/api";
import Layout from "../components/Layout";
import { getUsuario } from "../utils/auth";

function obtenerTextoVehiculo(tramite = {}) {
  if (tramite.rol_viajero === "PASAJERO") {
    return "Acompañante / Pasajero";
  }

  const patente = tramite.patente || "Sin patente";
  const marca = tramite.marca || "Sin marca";
  return `${patente} · ${marca}`;
}

function Dashboard() {
  const usuario = getUsuario();

  useEffect(() => {
    document.title = "Aduanas Chile - Panel";
  }, []);

  const esAdmin = usuario?.rol === "ADMIN";
  const mostrarMantenimiento = esAdmin && import.meta.env.DEV;

  const [tramites, setTramites] = useState([]);
  const [resumen, setResumen] = useState({
    vehiculos: 0,
    tramites: 0,
    aprobados: 0,
    alertas: 0,
    ultimas_alertas: [],
  });
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);

      const [tramitesRes, resumenRes] = await Promise.all([
        api.get("/tramites"),
        esAdmin ? api.get("/reportes/resumen") : Promise.resolve({ data: null }),
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
      ).length,
    };
  }, [tramites]);

  const cards = esAdmin
    ? [
        { titulo: "Vehículos registrados", valor: resumen.vehiculos, icon: Car, clase: "blue" },
        { titulo: "Trámites totales", valor: resumen.tramites, icon: FileText, clase: "orange" },
        { titulo: "Aprobados", valor: resumen.aprobados, icon: CheckCircle2, clase: "green" },
        { titulo: "Alertas abiertas", valor: resumen.alertas, icon: AlertTriangle, clase: "red" },
      ]
    : [
        { titulo: "Mis trámites", valor: datosPersona.total, icon: FileText, clase: "blue" },
        { titulo: "Aprobados", valor: datosPersona.aprobados, icon: CheckCircle2, clase: "green" },
        { titulo: "Observados", valor: datosPersona.observados, icon: AlertTriangle, clase: "red" },
        { titulo: "Pendientes", valor: datosPersona.pendientes, icon: Clock3, clase: "orange" },
      ];
  const tramitesRecientes = tramites.slice(0, 8);

  const exportarDashboard = () => {
    const datosExportar = tramites.map((t) => ({
      codigo: t.codigo_tramite || `#${t.id}`,
      persona: t.persona_nombre || "",
      documento: t.documento_numero || "",
      vehiculo: obtenerTextoVehiculo(t),
      destino: t.destino || "",
      semaforo: t.nivel_riesgo || "VERDE",
      estado: t.estado || "",
      fecha: t.fecha || "",
    }));

    exportarCSV("reporte-dashboard-aduanas", datosExportar);
  };

  return (
    <Layout
      titulo={esAdmin ? "Panel de Aduana" : "Mi paso por aduanas"}
      subtitulo={
        esAdmin
          ? "Control de registros, validaciones y alertas operativas."
          : "Registra tu vehículo y consulta el estado de tu trámite."
      }
    >
      {mostrarMantenimiento && (
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
          <div className="section-title dashboard-section-title">
            <div>
              <p className="eyebrow">Flujo fronterizo</p>
              <h2>{esAdmin ? "Últimos trámites registrados" : "Mis últimos trámites"}</h2>
            </div>
          </div>

          {esAdmin && (
            <div className="dashboard-export-row">
              <button type="button" className="export-btn dashboard-export-btn" onClick={exportarDashboard}>
                <Download size={17} />
                Exportar CSV
              </button>
            </div>
          )}

          <div className="responsive-table dashboard-desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Persona</th>
                  <th>Vehículo</th>
                  <th>Destino</th>
                  <th>Riesgo</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
                  
              <tbody>
                {tramitesRecientes.map((t) => (
                  <tr key={t.id}>
                    <td>{t.codigo_tramite || `#${t.id}`}</td>
                    <td>{t.persona_nombre}</td>
                    <td>{obtenerTextoVehiculo(t)}</td>
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
                    <td>
                      <Link to={`/tramites/${t.id}`} className="detail-btn">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
          
                {!tramites.length && !cargando && (
                  <tr>
                    <td colSpan="7">Aún no hay trámites registrados.</td>
                  </tr>
                )}
          
                {cargando && (
                  <tr>
                    <td colSpan="7">Cargando trámites...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
              
          <div className="dashboard-mobile-list">
            {tramitesRecientes.map((t) => (
              <article className="mobile-tramite-card" key={t.id}>
                <div className="mobile-tramite-top">
                  <div>
                    <span className="mobile-label">Código</span>
                    <strong>{t.codigo_tramite || `#${t.id}`}</strong>
                  </div>
            
                  <span className={`risk-pill ${t.nivel_riesgo?.toLowerCase()}`}>
                    {t.nivel_riesgo || "VERDE"}
                  </span>
                </div>
            
                <div className="mobile-tramite-info">
                  <div>
                    <span>Persona</span>
                    <strong>{t.persona_nombre}</strong>
                  </div>
            
                  <div>
                    <span>Vehículo</span>
                    <strong>{obtenerTextoVehiculo(t)}</strong>
                  </div>
            
                  <div>
                    <span>Destino</span>
                    <strong>{t.destino}</strong>
                  </div>
            
                  <div>
                    <span>Estado</span>
                    <strong>
                      <span className={`status-pill ${t.estado?.toLowerCase()}`}>
                        {t.estado}
                      </span>
                    </strong>
                  </div>
                </div>
            
                <Link to={`/tramites/${t.id}`} className="detail-btn mobile-detail-btn">
                  Ver detalle
                </Link>
              </article>
            ))}
          
            {!tramites.length && !cargando && (
              <div className="mobile-empty-message">
                Aún no hay trámites registrados.
              </div>
            )}
          
            {cargando && (
              <div className="mobile-empty-message">
                Cargando trámites...
              </div>
            )}
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