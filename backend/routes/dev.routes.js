const express = require("express");
const router = express.Router();

const { limpiarRegistros } = require("../controllers/dev.controller");

router.delete("/limpiar-registros", limpiarRegistros);

module.exports = router;