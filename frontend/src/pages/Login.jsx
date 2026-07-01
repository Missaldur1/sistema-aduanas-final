import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import api from "../api/api";

function Login() {
  useEffect(() => {
    document.title = "Aduanas Chile - Admin";
  }, []);
  
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setMensaje("");
    setCargando(true);

    try {
      const response = await api.post("/auth/login", { usuario, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("usuario", JSON.stringify(response.data.usuario));
      navigate("/dashboard");
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "Usuario o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-hero-panel">
        <div className="login-logo-box">
          <img
            src="/escudo-aduanas.webp"
            alt="Escudo Aduanas Chile"
            className="login-logo-img"
          />
        </div>
        <p>Complejo Fronterizo Los Libertadores</p>
        <h1>Sistema Informático Integrado para Aduanas</h1>
        <span>Registro digital de personas, vehículos, declaraciones y validaciones PDI/SAG.</span>
      </section>

      <section className="login-card">
        <div className="login-card-header">
          <strong>ADUANAS CHILE</strong>
          <h2>Iniciar sesión</h2>
          <p>Accede como funcionario de Aduana para revisar trámites, validar registros y gestionar alertas.</p>
        </div>

        <form onSubmit={iniciarSesion} className="form-stack">
          <label>
            Usuario
            <div className="input-with-icon">
              <User size={18} />
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingrese su usuario"
              />
            </div>
          </label>

          <label>
            Contraseña
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
              />
              <button type="button" className="icon-button" onClick={() => setVerPassword(!verPassword)} aria-label="Mostrar contraseña">
                {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {mensaje && <div className="alert alert-error">{mensaje}</div>}

          <button className="primary-btn" disabled={cargando} type="submit">
            {cargando ? "Ingresando..." : "Ingresar al sistema"}
          </button>
        </form>

      </section>
    </main>
  );
}

export default Login;
