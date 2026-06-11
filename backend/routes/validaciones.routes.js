const express = require("express");
const router = express.Router();
const { listarValidaciones } = require("../controllers/validaciones.controller");
const { autenticar, autorizar } = require("../middleware/auth.middleware");

router.get("/", autenticar, autorizar("ADMIN"), listarValidaciones);

module.exports = router;
