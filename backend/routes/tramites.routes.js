const express = require("express");
const router = express.Router();

const {
  crearTramite,
  listarTramites,
  validarTramite,
  obtenerDetalleTramite
} = require("../controllers/tramites.controller");

const { autenticar, autorizar } = require("../middleware/auth.middleware");

// Ruta pública: cualquier persona puede registrar su paso sin iniciar sesión
router.post("/", crearTramite);

// Rutas privadas: solo Aduana/Admin puede revisar y validar
router.get("/", autenticar, listarTramites);
router.get("/:id", autenticar, autorizar("ADMIN"), obtenerDetalleTramite);
router.patch("/:id/validar", autenticar, autorizar("ADMIN"), validarTramite);

module.exports = router;