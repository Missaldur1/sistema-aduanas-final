const db = require("../database/db");

const listarValidaciones = (req, res) => {
  const sql = `
    SELECT
      val.id, val.tramite_id, val.resultado_pdi, val.resultado_sag,
      val.resultado_final, val.observaciones, val.fecha,
      p.nombre || ' ' || p.apellido AS persona_nombre,
      p.documento_numero,
      v.patente
    FROM validaciones val
    LEFT JOIN tramites t ON t.id = val.tramite_id
    LEFT JOIN personas p ON p.id = t.persona_id
    LEFT JOIN vehiculos v ON v.id = t.vehiculo_id
    ORDER BY val.id DESC
  `;

  db.all(sql, [], (error, rows) => {
    if (error) return res.status(500).json({ mensaje: "Error al listar validaciones" });
    res.json(rows);
  });
};

module.exports = { listarValidaciones };
