const bcrypt = require("bcryptjs");
const db = require("../database/db");

const camposPublicos = "id, nombre, usuario, institucion, rol, documento, telefono, email, activo, creado_en";

const listarUsuarios = (req, res) => {
  db.all(`SELECT ${camposPublicos} FROM usuarios ORDER BY id DESC`, [], (error, rows) => {
    if (error) return res.status(500).json({ mensaje: "Error al listar usuarios" });
    res.json(rows);
  });
};

const crearUsuario = (req, res) => {
  const { nombre, usuario, password, institucion, rol, documento, telefono, email } = req.body;

  if (!nombre || !usuario || !password || !rol) {
    return res.status(400).json({ mensaje: "Nombre, usuario, contraseña y rol son obligatorios" });
  }

  if (!["ADMIN", "PERSONA"].includes(rol)) {
    return res.status(400).json({ mensaje: "Rol inválido. Use ADMIN o PERSONA" });
  }

  const hash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO usuarios (nombre, usuario, password_hash, institucion, rol, documento, telefono, email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, usuario, hash, institucion || (rol === "ADMIN" ? "Aduanas Chile" : "Persona Natural"), rol, documento || "", telefono || "", email || ""],
    function (error) {
      if (error) {
        if (String(error.message).includes("UNIQUE")) {
          return res.status(409).json({ mensaje: "El nombre de usuario ya existe" });
        }
        return res.status(500).json({ mensaje: "Error al crear usuario" });
      }
      res.status(201).json({ mensaje: "Usuario creado correctamente", id: this.lastID });
    }
  );
};

const cambiarEstadoUsuario = (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  if (Number(id) === req.usuario.id) {
    return res.status(400).json({ mensaje: "No puedes desactivar tu propio usuario" });
  }

  db.run("UPDATE usuarios SET activo = ? WHERE id = ?", [activo ? 1 : 0, id], function (error) {
    if (error) return res.status(500).json({ mensaje: "Error al actualizar usuario" });
    if (this.changes === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json({ mensaje: "Estado actualizado correctamente" });
  });
};

module.exports = { listarUsuarios, crearUsuario, cambiarEstadoUsuario };
