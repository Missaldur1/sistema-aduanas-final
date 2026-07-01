require("dotenv").config();

const express = require("express");
const cors = require("cors");

require("./database/db");

const authRoutes = require("./routes/auth.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const vehiculosRoutes = require("./routes/vehiculos.routes");
const tramitesRoutes = require("./routes/tramites.routes");
const validacionesRoutes = require("./routes/validaciones.routes");
const reportesRoutes = require("./routes/reportes.routes");
const devRoutes = require("./routes/dev.routes");
const historialRoutes = require("./routes/historial.routes");

const app = express();
const PORT = process.env.PORT || 3001;

/*
  FRONTEND_URLS permite varias URLs separadas por coma.

  En local:
  FRONTEND_URLS=http://localhost:5173

  En Render:
  FRONTEND_URLS=http://localhost:5173,https://tu-frontend.vercel.app
*/
const FRONTEND_URLS = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origin, como Postman o navegador directo
      if (!origin) return callback(null, true);

      if (FRONTEND_URLS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("No permitido por CORS"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "15mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/tramites", tramitesRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/validaciones", validacionesRoutes);
app.use("/api/reportes", reportesRoutes);
app.use("/api/historial", historialRoutes);

app.get("/", (req, res) => {
  res.json({
    mensaje: "API Sistema Aduanas funcionando correctamente",
    version: "2.0.0"
  });
});

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    mensaje: "Error interno del servidor"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});