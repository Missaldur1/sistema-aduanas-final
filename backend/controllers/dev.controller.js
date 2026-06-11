const db = require("../database/db");

const limpiarRegistros = (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      mensaje: "Esta acción no está disponible en producción"
    });
  }

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
    db.run("DELETE FROM sqlite_sequence WHERE name = 'personas'");

    res.json({
      mensaje: "Registros eliminados correctamente"
    });
  });
};

module.exports = {
  limpiarRegistros
};