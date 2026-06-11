const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { firmarToken } = require("../utils/jwt");

const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ mensaje: "Usuario y contraseña son obligatorios" });
  }

  db.get("SELECT * FROM usuarios WHERE usuario = ? AND activo = 1", [usuario], (error, user) => {
    if (error) return res.status(500).json({ mensaje: "Error en el servidor" });
    if (!user) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

    const passwordOk = bcrypt.compareSync(password, user.password_hash || "");
    if (!passwordOk) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

    const usuarioSeguro = {
      id: user.id,
      nombre: user.nombre,
      usuario: user.usuario,
      institucion: user.institucion,
      rol: user.rol,
      email: user.email
    };

    res.json({
      mensaje: "Inicio de sesión exitoso",
      token: firmarToken(usuarioSeguro),
      usuario: usuarioSeguro
    });
  });
};

const registrarPersona = (req, res) => {
  const {
    nombre,
    usuario,
    password,
    repetirPassword,
    documento,
    telefono,
    email
  } = req.body;

  if (!nombre || !usuario || !password || !repetirPassword || !documento || !email) {
    return res.status(400).json({
      mensaje: "Nombre, usuario, contraseña, documento y email son obligatorios"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      mensaje: "La contraseña debe tener al menos 6 caracteres"
    });
  }

  if (password !== repetirPassword) {
    return res.status(400).json({
      mensaje: "Las contraseñas no coinciden"
    });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `
    INSERT INTO usuarios
    (nombre, usuario, password_hash, institucion, rol, documento, telefono, email, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `,
    [
      nombre.trim(),
      usuario.trim().toLowerCase(),
      passwordHash,
      "Persona Natural",
      "PERSONA",
      documento.trim(),
      telefono || "",
      email.trim().toLowerCase()
    ],
    function (error) {
      if (error) {
        if (error.message.includes("UNIQUE")) {
          return res.status(409).json({
            mensaje: "El nombre de usuario ya existe. Usa otro usuario."
          });
        }

        return res.status(500).json({
          mensaje: "Error al registrar la persona"
        });
      }

      res.status(201).json({
        mensaje: "Persona registrada correctamente",
        usuario: {
          id: this.lastID,
          nombre,
          usuario,
          rol: "PERSONA",
          email
        }
      });
    }
  );
};

const perfil = (req, res) => {
  db.get(
    "SELECT id, nombre, usuario, institucion, rol, documento, telefono, email FROM usuarios WHERE id = ?",
    [req.usuario.id],
    (error, user) => {
      if (error) return res.status(500).json({ mensaje: "Error al obtener perfil" });
      if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado" });
      res.json(user);
    }
  );
};

module.exports = {
  login,
  registrarPersona,
  perfil
};