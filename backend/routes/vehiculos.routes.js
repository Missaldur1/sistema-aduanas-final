const express = require("express");
const router = express.Router();
const { crearVehiculo, listarVehiculos, obtenerVehiculo } = require("../controllers/vehiculos.controller");
const { autenticar } = require("../middleware/auth.middleware");

router.post("/", autenticar, crearVehiculo);
router.get("/", autenticar, listarVehiculos);
router.get("/:id", autenticar, obtenerVehiculo);

module.exports = router;
