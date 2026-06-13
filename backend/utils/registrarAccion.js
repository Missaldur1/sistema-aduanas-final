const db = require("../database/db");

const registrarAccion = ({ usuario, accion, modulo, detalle = "" }) => {
  const usuarioId = usuario?.id || null;
  const usuarioNombre = usuario?.nombre || usuario?.usuario || "Sistema";

  db.run(
    `INSERT INTO historial_acciones 
     (usuario_id, usuario_nombre, accion, modulo, detalle)
     VALUES (?, ?, ?, ?, ?)`,
    [usuarioId, usuarioNombre, accion, modulo, detalle],
    (error) => {
      if (error) {
        console.error("Error registrando acción:", error.message);
      }
    }
  );
};

module.exports = registrarAccion;