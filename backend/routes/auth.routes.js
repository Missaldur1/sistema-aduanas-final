const express = require("express");
const router = express.Router();

const {
  login,
  registrarPersona,
  perfil
} = require("../controllers/auth.controller");

const { autenticar } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/registro-persona", registrarPersona);
router.get("/perfil", autenticar, perfil);

module.exports = router;