const express = require("express");
const router = express.Router();

const { login, perfil } = require("../controllers/auth.controller");
const { autenticar } = require("../middleware/auth.middleware");

router.post("/login", login);
router.get("/perfil", autenticar, perfil);

module.exports = router;