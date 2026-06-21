import { Navigate, Route, Routes } from "react-router-dom";
import { estaAutenticado, getUsuario } from "./utils/auth";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegistroPaso from "./pages/RegistroPaso";
import Vehiculos from "./pages/Vehiculos";
import Validacion from "./pages/Validacion";
import Usuarios from "./pages/Usuarios";
import DetalleTramite from "./pages/DetalleTramite";
import EscanearQR from "./pages/EscanearQR";

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
      <Route path="/" element={<Home />} />
      <Route path="/registro" element={<RegistroPaso publico />} />
      <Route path="/admin" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Dashboard />
          </RutaPrivada>
        }
      />

      <Route
        path="/escanear-qr"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <EscanearQR />
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
        path="/usuarios"
        element={
          <RutaPrivada roles={["ADMIN"]}>
            <Usuarios />
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
