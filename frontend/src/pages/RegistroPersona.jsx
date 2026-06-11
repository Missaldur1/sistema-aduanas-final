import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, IdCard, Lock, Mail, Phone, UserPlus } from "lucide-react";
import api from "../api/api";

function RegistroPersona() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    password: "",
    repetirPassword: "",
    documento: "",
    telefono: "",
    email: ""
  });

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiarDato = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const registrarPersona = async (e) => {
    e.preventDefault();
    setMensaje("");
    setTipoMensaje("");
    setCargando(true);

    try {
      await api.post("/auth/registro-persona", form);

      setTipoMensaje("success");
      setMensaje("Registro exitoso. Ahora puedes iniciar sesión.");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(error.response?.data?.mensaje || "No se pudo registrar la persona");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-hero-panel">
        <div className="login-badge">
          <UserPlus size={34} />
        </div>

        <p>Registro de Persona</p>
        <h1>Registra tu cuenta para iniciar un trámite aduanero</h1>
        <span>
          Este registro crea una cuenta tipo Persona. Luego podrás iniciar sesión,
          registrar tu vehículo, declarar información y solicitar revisión aduanera.
        </span>
      </section>

      <section className="login-card">
        <div className="login-card-header">
          <strong>ADUANAS CHILE</strong>
          <h2>Crear cuenta</h2>
          <p>Completa tus datos para quedar registrado en la base de datos.</p>
        </div>

        <form onSubmit={registrarPersona} className="form-stack">
          <label>
            Nombre completo
            <div className="input-with-icon">
              <UserPlus size={18} />
              <input
                name="nombre"
                value={form.nombre}
                onChange={cambiarDato}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          </label>

          <label>
            Nombre de usuario
            <div className="input-with-icon">
              <UserPlus size={18} />
              <input
                name="usuario"
                value={form.usuario}
                onChange={cambiarDato}
                placeholder="Ej: juanperez"
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            Documento / RUT / Pasaporte
            <div className="input-with-icon">
              <IdCard size={18} />
              <input
                name="documento"
                value={form.documento}
                onChange={cambiarDato}
                placeholder="Ej: 12.345.678-9"
              />
            </div>
          </label>

          <label>
            Email
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={cambiarDato}
                placeholder="Ej: persona@mail.com"
              />
            </div>
          </label>

          <label>
            Teléfono
            <div className="input-with-icon">
              <Phone size={18} />
              <input
                name="telefono"
                value={form.telefono}
                onChange={cambiarDato}
                placeholder="Ej: +56 9 1234 5678"
              />
            </div>
          </label>

          <label>
            Contraseña
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={cambiarDato}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
          </label>

          <label>
            Repetir contraseña
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                name="repetirPassword"
                type="password"
                value={form.repetirPassword}
                onChange={cambiarDato}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
              />
            </div>
          </label>

          {mensaje && (
            <div className={`alert ${tipoMensaje === "success" ? "alert-success" : "alert-error"}`}>
              {mensaje}
            </div>
          )}

          <button className="primary-btn" disabled={cargando} type="submit">
            {cargando ? "Registrando..." : "Registrarme como persona"}
          </button>

          <Link to="/" className="secondary-link">
            <ArrowLeft size={17} />
            Volver al inicio de sesión
          </Link>
        </form>
      </section>
    </main>
  );
}

export default RegistroPersona;