import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Car,
  ClipboardCheck,
  LogOut,
  Menu,
  QrCode,
  ShieldCheck,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cerrarSesion, getUsuario } from "../utils/auth";

function Layout({ children, titulo, subtitulo }) {
  const [abierto, setAbierto] = useState(false);
  const usuario = getUsuario();
  const navigate = useNavigate();
  const esAdmin = usuario?.rol === "ADMIN";

  const salir = () => {
    cerrarSesion();
    navigate("/admin", { replace: true });
  };

  const enlaces = [
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    ...(esAdmin ? [{ to: "/escanear-qr", label: "Escanear QR", icon: QrCode }] : []),
    { to: "/vehiculos", label: "Vehículos", icon: Car },
    ...(esAdmin ? [{ to: "/validacion", label: "Validaciones", icon: ClipboardCheck }] : []),
    ...(esAdmin ? [{ to: "/usuarios", label: "Usuarios", icon: Users }] : []),
  ];

  return (
    <div className="app-shell">
      <button className="mobile-menu-btn" onClick={() => setAbierto(true)} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      <aside className={`sidebar ${abierto ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><ShieldCheck size={24} /></div>
          <div>
            <strong>ADUANAS</strong>
            <span>Chile · Los Libertadores</span>
          </div>
          <button className="sidebar-close" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        <nav className="side-nav">
          {enlaces.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setAbierto(false)}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <UserCircle size={38} />
          <div>
            <strong>{usuario?.nombre}</strong>
            <span>{esAdmin ? "Administrador Aduana" : "Persona"}</span>
          </div>
        </div>

        <button className="logout-btn" onClick={salir}>
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </aside>

      {abierto && <button className="overlay" onClick={() => setAbierto(false)} aria-label="Cerrar menú" />}

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sistema Integrado de Gestión Aduanera</p>
            <h1>{titulo}</h1>
            {subtitulo && <p className="topbar-subtitle">{subtitulo}</p>}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default Layout;
