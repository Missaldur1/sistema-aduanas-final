const db = require("../database/db");
const registrarAccion = require("../utils/registrarAccion");

const limpiarRegistros = (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM validaciones");
    db.run("DELETE FROM alertas");
    db.run("DELETE FROM declaraciones");
    db.run("DELETE FROM tramites");
    db.run("DELETE FROM vehiculos");
    db.run("DELETE FROM personas");

    db.run("DELETE FROM sqlite_sequence WHERE name = 'validaciones'");
    db.run("DELETE FROM sqlite_sequence WHERE name = 'alertas'");
    db.run("DELETE FROM sqlite_sequence WHERE name = 'declaraciones'");
    db.run("DELETE FROM sqlite_sequence WHERE name = 'tramites'");
    db.run("DELETE FROM sqlite_sequence WHERE name = 'vehiculos'");

    db.run("DELETE FROM sqlite_sequence WHERE name = 'personas'", [], (error) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al limpiar los registros de prueba.",
        });
      }

      registrarAccion({
        usuario: req.usuario,
        accion: "LIMPIAR_REGISTROS",
        modulo: "Mantenimiento",
        detalle:
          "Eliminó trámites, personas, vehículos, declaraciones, alertas y validaciones de prueba.",
      });

      return res.json({
        mensaje:
          "Registros eliminados correctamente. El usuario administrador se mantiene.",
      });
    });
  });
};

module.exports = {
  limpiarRegistros,
};