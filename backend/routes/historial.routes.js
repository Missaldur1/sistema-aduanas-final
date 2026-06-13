const express = require("express");
const router = express.Router();

const { listarHistorial } = require("../controllers/historial.controller");
const { autenticar, autorizar } = require("../middleware/auth.middleware");

router.get("/", autenticar, autorizar("ADMIN"), listarHistorial);

module.exports = router;