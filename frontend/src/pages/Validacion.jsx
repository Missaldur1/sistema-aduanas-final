import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Download,
  RefreshCcw,
  Search,
} from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";
import { exportarCSV } from "../utils/exportarCSV";

function obtenerTextoVehiculo(tramite = {}) {
  if (tramite.rol_viajero === "PASAJERO") {
    return "Acompañante / Pasajero";
  }

  return tramite.patente || "Sin patente";
}

function Validacion() {
  useEffect(() => {
    document.title = "Aduanas Chile - Validaciones";
  }, []);

  const [tramites, setTramites] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "TODOS",
    riesgo: "TODOS",
  });

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await api.get("/tramites");
      setTramites(res.data);
    } catch (error) {
      setMensaje("No se pudieron cargar los trámites.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: "",
      estado: "TODOS",
      riesgo: "TODOS",
    });
  };

  const tramitesFiltrados = useMemo(() => {
    const busqueda = filtros.busqueda.trim().toLowerCase();

    return tramites.filter((t) => {
      const coincideBusqueda =
        !busqueda ||
        t.codigo_tramite?.toLowerCase().includes(busqueda) ||
        t.persona_nombre?.toLowerCase().includes(busqueda) ||
        t.documento_numero?.toLowerCase().includes(busqueda) ||
        t.patente?.toLowerCase().includes(busqueda) ||
        t.destino?.toLowerCase().includes(busqueda);

      const coincideEstado =
        filtros.estado === "TODOS" || t.estado === filtros.estado;

      const coincideRiesgo =
        filtros.riesgo === "TODOS" || t.nivel_riesgo === filtros.riesgo;

      return coincideBusqueda && coincideEstado && coincideRiesgo;
    });
  }, [tramites, filtros]);

  const exportarValidaciones = () => {
    const datosExportar = tramitesFiltrados.map((t) => ({
      codigo: t.codigo_tramite || `#${t.id}`,
      persona: t.persona_nombre || "",
      documento: t.documento_numero || "",
      vehiculo: obtenerTextoVehiculo(t),
      destino: t.destino || "",
      semaforo: t.nivel_riesgo || "VERDE",
      estado: t.estado || "",
      accion_recomendada: t.accion_recomendada || "",
      resultado_pdi: t.resultado_pdi || "",
      resultado_sag: t.resultado_sag || "",
      resultado_aduana: t.resultado_aduana || "",
      fecha: t.fecha || "",
    }));

    exportarCSV("reporte-validaciones-aduanas", datosExportar);
  };

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
    <Layout
      titulo="Validación PDI / SAG / Aduana"
      subtitulo="Simulación de validación automática y emisión de alertas."
    >
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <section className="panel-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Revisión operativa</p>
            <h2>Trámites pendientes y observados</h2>
          </div>

          <div className="section-actions">
            <button type="button" className="export-btn" onClick={exportarValidaciones}>
              <Download size={18} />
              Exportar CSV
            </button>

            <ClipboardCheck size={26} />
          </div>
        </div>

        <div className="validation-filters">
          <label>
            Buscar trámite
            <div className="filter-input-icon">
              <Search size={18} />
              <input
                value={filtros.busqueda}
                onChange={(e) => cambiarFiltro("busqueda", e.target.value)}
                placeholder="Código, RUT, persona, patente o destino"
              />
            </div>
          </label>

          <label>
            Estado
            <select
              value={filtros.estado}
              onChange={(e) => cambiarFiltro("estado", e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="OBSERVADO">Observado</option>
            </select>
          </label>

          <label>
            Riesgo
            <select
              value={filtros.riesgo}
              onChange={(e) => cambiarFiltro("riesgo", e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="VERDE">Verde</option>
              <option value="AMARILLO">Amarillo</option>
              <option value="ROJO">Rojo</option>
            </select>
          </label>

          <button type="button" className="filter-clear-btn" onClick={limpiarFiltros}>
            <RefreshCcw size={17} />
            Limpiar filtros
          </button>
        </div>

        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Persona</th>
                <th>Documento</th>
                <th>Vehículo</th>
                <th>Semáforo</th>
                <th>Acción recomendada</th>
                <th>Estado</th>
                <th>Validar</th>
              </tr>
            </thead>

            <tbody>
              {tramitesFiltrados.map((t) => (
                <tr key={t.id}>
                  <td>{t.codigo_tramite || `#${t.id}`}</td>
                  <td>{t.persona_nombre}</td>
                  <td>{t.documento_numero}</td>
                  <td>{obtenerTextoVehiculo(t)}</td>
                  <td>
                    <span className={`risk-pill ${t.nivel_riesgo?.toLowerCase()}`}>
                      {t.nivel_riesgo || "VERDE"}
                    </span>
                  </td>
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

              {!tramitesFiltrados.length && !cargando && (
                <tr>
                  <td colSpan="8">No hay trámites que coincidan con los filtros.</td>
                </tr>
              )}

              {cargando && (
                <tr>
                  <td colSpan="8">Cargando trámites...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Validacion;