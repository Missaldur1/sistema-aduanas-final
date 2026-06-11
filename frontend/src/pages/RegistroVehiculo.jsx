// ==========================================
// IMPORTACIONES
// ==========================================

import { useState } from "react";

import {
  Bell,
  UserCircle,
  Home,
  Car,
  FileText,
  ShieldCheck,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  CalendarDays,
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../api/api";
import "../styles/registroVehiculo.css";

// ==========================================
// COMPONENTE REGISTRO DE VEHÍCULO
// ==========================================

function RegistroVehiculo() {
  const [form, setForm] = useState({
    tipo: "Particular",
    patente: "ABCD12",
    pais_origen: "Chile",
    marca: "Toyota",
    modelo: "RAV4",
    anio: "2021",
    color: "Blanco",
    chasis: "JTMBFREV1MJ123456",
    motor: "2AR456789",
    conductor_nombre: "Juan Pérez González",
    conductor_nacionalidad: "Chilena",
    conductor_documento: "12.345.678-5",
    documento_tipo: "Permiso de Circulación",
    documento_numero: "123456789",
    vencimiento: "2024-12-31",
  });

  const cambiar = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiar = () => {
    setForm({
      tipo: "Particular",
      patente: "",
      pais_origen: "Chile",
      marca: "",
      modelo: "",
      anio: "",
      color: "",
      chasis: "",
      motor: "",
      conductor_nombre: "",
      conductor_nacionalidad: "Chilena",
      conductor_documento: "",
      documento_tipo: "Permiso de Circulación",
      documento_numero: "",
      vencimiento: "",
    });
  };

  const guardar = async (e) => {
    e.preventDefault();

    try {
      const vehiculo = await api.post("/vehiculos", form);

      await api.post("/tramites", {
        vehiculo_id: vehiculo.data.id,
        observaciones: "Trámite generado desde registro vehicular",
      });

      alert("Vehículo y trámite registrados correctamente");
    } catch (error) {
      alert("Error al registrar vehículo");
    }
  };

  return (
    <div className="vehicle-layout">
      <aside className="vehicle-sidebar">
        <div className="vehicle-sidebar-header">
          <div className="vehicle-logo">★</div>

          <div>
            <h2>ADUANAS</h2>
            <span>CHILE</span>
          </div>

          <Menu size={18} className="vehicle-menu-icon" />
        </div>

        <nav className="vehicle-menu">
          <Link to="/dashboard">
            <Home size={18} /> Dashboard
          </Link>

          <Link className="active" to="/vehiculos">
            <Car size={18} /> Vehículos
          </Link>

          <Link to="#">
            <FileText size={18} /> Trámites
          </Link>

          <Link to="/validacion">
            <ShieldCheck size={18} /> Validaciones
          </Link>

          <Link to="#">
            <Bell size={18} /> Alertas
          </Link>

          <Link to="#">
            <BarChart3 size={18} /> Reportes
          </Link>

          <Link to="#">
            <Users size={18} /> Usuarios
          </Link>

          <Link to="#">
            <Settings size={18} /> Configuración
          </Link>
        </nav>

        <div className="vehicle-logout">
          <Link to="/">
            <LogOut size={18} /> Cerrar Sesión
          </Link>
        </div>
      </aside>

      <main className="vehicle-main">
        <header className="vehicle-topbar">
          <div>
            <h1>Registro de Vehículo</h1>
            <p>Vehículos &gt; Nuevo Registro</p>
          </div>

          <div className="vehicle-user">
            <div className="vehicle-notification">
              <Bell size={24} />
              <span>3</span>
            </div>

            <UserCircle size={38} />

            <div>
              <strong>Funcionario Aduanas</strong>
              <p>Administrador</p>
            </div>

            <span className="vehicle-arrow">⌄</span>
          </div>
        </header>

        <section className="vehicle-card">
          <form onSubmit={guardar}>
            <h2>Información del Vehículo</h2>

            <div className="vehicle-grid">
              <div className="field">
                <label>Tipo de Vehículo</label>
                <select name="tipo" value={form.tipo} onChange={cambiar}>
                  <option>Particular</option>
                  <option>De Carga</option>
                  <option>Bus</option>
                  <option>Camión</option>
                </select>
              </div>

              <div className="field">
                <label>Patente</label>
                <input
                  name="patente"
                  value={form.patente}
                  onChange={cambiar}
                />
              </div>

              <div className="field">
                <label>País de Origen</label>
                <select
                  name="pais_origen"
                  value={form.pais_origen}
                  onChange={cambiar}
                >
                  <option>Chile</option>
                  <option>Argentina</option>
                  <option>Perú</option>
                  <option>Bolivia</option>
                </select>
              </div>

              <div className="field">
                <label>Marca</label>
                <input name="marca" value={form.marca} onChange={cambiar} />
              </div>

              <div className="field">
                <label>Modelo</label>
                <input name="modelo" value={form.modelo} onChange={cambiar} />
              </div>

              <div className="field">
                <label>Año</label>
                <input name="anio" value={form.anio} onChange={cambiar} />
              </div>

              <div className="field">
                <label>Color</label>
                <input name="color" value={form.color} onChange={cambiar} />
              </div>

              <div className="field">
                <label>N° Chasis</label>
                <input name="chasis" value={form.chasis} onChange={cambiar} />
              </div>

              <div className="field">
                <label>N° Motor</label>
                <input name="motor" value={form.motor} onChange={cambiar} />
              </div>
            </div>

            <div className="section-line"></div>

            <h2>Información del Conductor</h2>

            <div className="vehicle-grid conductor-grid">
              <div className="field">
                <label>Nombre Completo</label>
                <input
                  name="conductor_nombre"
                  value={form.conductor_nombre}
                  onChange={cambiar}
                />
              </div>

              <div className="field">
                <label>Nacionalidad</label>
                <select
                  name="conductor_nacionalidad"
                  value={form.conductor_nacionalidad}
                  onChange={cambiar}
                >
                  <option>Chilena</option>
                  <option>Argentina</option>
                  <option>Peruana</option>
                  <option>Boliviana</option>
                </select>
              </div>

              <div className="field">
                <label>N° Documento</label>
                <input
                  name="conductor_documento"
                  value={form.conductor_documento}
                  onChange={cambiar}
                />
              </div>
            </div>

            <div className="section-line"></div>

            <h2>Documentos</h2>

            <div className="vehicle-grid document-grid">
              <div className="field">
                <label>Tipo de Documento</label>
                <select
                  name="documento_tipo"
                  value={form.documento_tipo}
                  onChange={cambiar}
                >
                  <option>Permiso de Circulación</option>
                  <option>Seguro Obligatorio</option>
                  <option>Revisión Técnica</option>
                  <option>Padrón del Vehículo</option>
                </select>
              </div>

              <div className="field">
                <label>N° Documento</label>
                <input
                  name="documento_numero"
                  value={form.documento_numero}
                  onChange={cambiar}
                />
              </div>

              <div className="field date-field">
                <label>Vencimiento</label>

                <div className="date-wrapper">
                  <input
                    type="date"
                    name="vencimiento"
                    value={form.vencimiento}
                    onChange={cambiar}
                  />

                  <CalendarDays size={18} />
                </div>
              </div>
            </div>

            <div className="vehicle-actions">
              <button type="button" className="btn-clear" onClick={limpiar}>
                Limpiar
              </button>

              <button type="submit" className="btn-save">
                Guardar
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default RegistroVehiculo;