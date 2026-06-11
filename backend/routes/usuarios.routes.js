const express = require("express");
const router = express.Router();
const { listarUsuarios, crearUsuario, cambiarEstadoUsuario } = require("../controllers/usuarios.controller");
const { autenticar, autorizar } = require("../middleware/auth.middleware");

router.get("/", autenticar, autorizar("ADMIN"), listarUsuarios);
router.post("/", autenticar, autorizar("ADMIN"), crearUsuario);
router.patch("/:id/estado", autenticar, autorizar("ADMIN"), cambiarEstadoUsuario);

module.exports = router;
