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

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/vehiculos", vehiculosRoutes);
app.use("/api/tramites", tramitesRoutes);
app.use("/api/dev", devRoutes);
app.use("/api/validaciones", validacionesRoutes);
app.use("/api/reportes", reportesRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API Sistema Aduanas funcionando correctamente", version: "2.0.0" });
});

app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
