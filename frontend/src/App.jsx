import { Navigate, Route, Routes } from "react-router-dom";
import { estaAutenticado, getUsuario } from "./utils/auth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistroPaso from "./pages/RegistroPaso";
import Vehiculos from "./pages/Vehiculos";
import Validacion from "./pages/Validacion";
import Usuarios from "./pages/Usuarios";
import DetalleTramite from "./pages/DetalleTramite";

function RutaPrivada({ children, roles }) {
  if (!estaAutenticado()) return <Navigate to="/admin" replace />;

  const usuario = getUsuario();

  if (roles && !roles.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Página pública para personas */}
      <Route path="/" element={<RegistroPaso publico />} />
      <Route path="/registro" element={<RegistroPaso publico />} />

      {/* Login solo para Aduana/Admin */}
      <Route path="/admin" element={<Login />} />

      {/* Rutas privadas del administrador */}
      <Route
        path="/dashboard"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Dashboard />
          </RutaPrivada>
        }
      />

      <Route
        path="/vehiculos"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Vehiculos />
          </RutaPrivada>
        }
      />

      <Route
        path="/validacion"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Validacion />
          </RutaPrivada>
        }
      />

      <Route
        path="/tramites/:id"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <DetalleTramite />
          </RutaPrivada>
        }
      />

      <Route
        path="/usuarios"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Usuarios />
          </RutaPrivada>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;