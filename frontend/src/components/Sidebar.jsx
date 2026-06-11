import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>ADUANAS</h2>
        <p>CHILE</p>
      </div>

      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/vehiculos">Vehículos</Link>
        <Link to="/validacion">Validaciones</Link>
        <Link to="/">Cerrar Sesión</Link>
      </nav>
    </aside>
  );
}

export default Sidebar;