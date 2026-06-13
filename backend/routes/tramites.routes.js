const express = require("express");
const router = express.Router();

const {
  crearTramite,
  listarTramites,
  validarTramite,
  obtenerDetalleTramite,
  obtenerTramitePorCodigo
} = require("../controllers/tramites.controller");

const { autenticar, autorizar } = require("../middleware/auth.middleware");

// Ruta pública: cualquier persona puede registrar su paso sin iniciar sesión
router.post("/", crearTramite);

// Rutas privadas: solo Aduana/Admin puede revisar y validar
router.get("/", autenticar, autorizar("ADMIN"), listarTramites);
router.get("/codigo/:codigo", autenticar, autorizar("ADMIN"), obtenerTramitePorCodigo);
router.get("/:id", autenticar, autorizar("ADMIN"), obtenerDetalleTramite);
router.patch("/:id/validar", autenticar, autorizar("ADMIN"), validarTramite);

module.exports = router;