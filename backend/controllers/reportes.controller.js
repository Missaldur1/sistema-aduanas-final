const db = require("../database/db");

const obtenerResumen = (req, res) => {
  const resumen = {};

  db.serialize(() => {
    db.get("SELECT COUNT(*) AS total FROM vehiculos", [], (error, row) => {
      if (error) return res.status(500).json({ mensaje: "Error al obtener vehículos" });
      resumen.vehiculos = row.total;
    });

    db.get("SELECT COUNT(*) AS total FROM tramites", [], (error, row) => {
      if (error) return res.status(500).json({ mensaje: "Error al obtener trámites" });
      resumen.tramites = row.total;
    });

    db.get("SELECT COUNT(*) AS total FROM tramites WHERE estado = 'APROBADO'", [], (error, row) => {
      if (error) return res.status(500).json({ mensaje: "Error al obtener aprobados" });
      resumen.aprobados = row.total;
    });

    db.get("SELECT COUNT(*) AS total FROM alertas WHERE estado = 'ABIERTA'", [], (error, row) => {
      if (error) return res.status(500).json({ mensaje: "Error al obtener alertas" });
      resumen.alertas = row.total;

      db.all(
        `SELECT a.*, p.nombre || ' ' || p.apellido AS persona_nombre, v.patente
         FROM alertas a
         LEFT JOIN tramites t ON t.id = a.tramite_id
         LEFT JOIN personas p ON p.id = t.persona_id
         LEFT JOIN vehiculos v ON v.id = t.vehiculo_id
         ORDER BY a.id DESC LIMIT 5`,
        [],
        (err, alertas) => {
          if (err) return res.status(500).json({ mensaje: "Error al obtener últimas alertas" });
          resumen.ultimas_alertas = alertas;
          res.json(resumen);
        }
      );
    });
  });
};

module.exports = { obtenerResumen };
