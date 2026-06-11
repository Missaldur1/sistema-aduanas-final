import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/login.css";
import "./styles/dashboard.css";
import "./styles/registroPaso.css";
import "./styles/registroVehiculo.css";
import "./styles/validacion.css";
import "./styles/detalleTramite.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);