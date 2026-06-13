const db = require("../database/db");

const listarHistorial = (req, res) => {
  db.all(
    `SELECT 
      id,
      usuario_id,
      usuario_nombre,
      accion,
      modulo,
      detalle,
      fecha
    FROM historial_acciones
    ORDER BY fecha DESC
    LIMIT 50`,
    [],
    (error, filas) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al obtener el historial de acciones",
        });
      }

      return res.json(filas);
    }
  );
};

module.exports = {
  listarHistorial,
};