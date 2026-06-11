const express = require("express");
const router = express.Router();

const { limpiarRegistros } = require("../controllers/dev.controller");
const { autenticar, autorizar } = require("../middleware/auth.middleware");

router.delete("/limpiar-registros", autenticar, autorizar("ADMIN"), limpiarRegistros);

module.exports = router;