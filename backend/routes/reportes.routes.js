const express = require("express");
const router = express.Router();
const { obtenerResumen } = require("../controllers/reportes.controller");
const { autenticar, autorizar } = require("../middleware/auth.middleware");

router.get("/resumen", autenticar, autorizar("ADMIN"), obtenerResumen);

module.exports = router;
