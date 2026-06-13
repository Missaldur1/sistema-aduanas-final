const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { firmarToken } = require("../utils/jwt");

const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({
      mensaje: "Usuario y contraseña son obligatorios",
    });
  }

  db.get(
    "SELECT * FROM usuarios WHERE usuario = ? AND activo = 1",
    [usuario],
    (error, user) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error en el servidor",
        });
      }

      if (!user) {
        return res.status(401).json({
          mensaje: "Credenciales incorrectas",
        });
      }

      const passwordOk = bcrypt.compareSync(password, user.password_hash || "");

      if (!passwordOk) {
        return res.status(401).json({
          mensaje: "Credenciales incorrectas",
        });
      }

      if (user.rol !== "ADMIN") {
        return res.status(403).json({
          mensaje: "Solo funcionarios de Aduana pueden iniciar sesión",
        });
      }

      const usuarioSeguro = {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        institucion: user.institucion,
        rol: user.rol,
        email: user.email,
      };

      return res.json({
        mensaje: "Inicio de sesión exitoso",
        token: firmarToken(usuarioSeguro),
        usuario: usuarioSeguro,
      });
    }
  );
};

const perfil = (req, res) => {
  db.get(
    "SELECT id, nombre, usuario, institucion, rol, documento, telefono, email FROM usuarios WHERE id = ?",
    [req.usuario.id],
    (error, user) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al obtener perfil",
        });
      }

      if (!user) {
        return res.status(404).json({
          mensaje: "Usuario no encontrado",
        });
      }

      return res.json(user);
    }
  );
};

module.exports = {
  login,
  perfil,
};