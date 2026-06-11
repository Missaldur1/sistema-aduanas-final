import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";

function Vehiculos() {
  
  useEffect(() => {
    document.title = "Aduanas Chile - Vehículos";
  }, []);

  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/vehiculos")
      .then((res) => setVehiculos(res.data))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Layout titulo="Vehículos registrados" subtitulo="Consulta de vehículos asociados al control fronterizo.">
      <section className="panel-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">Registro vehicular</p>
            <h2>Listado de vehículos</h2>
          </div>
          <Car size={26} />
        </div>

        <div className="card-list mobile-only-list">
          {vehiculos.map((v) => (
            <article className="record-card" key={v.id}>
              <strong>{v.patente}</strong>
              <span>{v.marca} {v.modelo} · {v.tipo}</span>
              <small>{v.pais_origen} · {v.antecedente_vehiculo ? "Con alerta" : "Sin alerta"}</small>
            </article>
          ))}
        </div>

        <div className="responsive-table desktop-table">
          <table>
            <thead>
              <tr>
                <th>Patente</th>
                <th>Tipo</th>
                <th>Marca/Modelo</th>
                <th>País</th>
                <th>Año</th>
                <th>Alerta</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id}>
                  <td>{v.patente}</td>
                  <td>{v.tipo}</td>
                  <td>{v.marca} {v.modelo}</td>
                  <td>{v.pais_origen}</td>
                  <td>{v.anio || "-"}</td>
                  <td><span className={`status-pill ${v.antecedente_vehiculo ? "observado" : "aprobado"}`}>{v.antecedente_vehiculo ? "Con alerta" : "Sin alerta"}</span></td>
                </tr>
              ))}
              {!vehiculos.length && !cargando && <tr><td colSpan="6">No hay vehículos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Vehiculos;
