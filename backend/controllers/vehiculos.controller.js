const db = require("../database/db");

function puedeVer(usuario, row) {
  return usuario.rol === "ADMIN" || row.usuario_id === usuario.id;
}

const crearVehiculo = (req, res) => {
  const {
    tipo,
    patente,
    pais_origen,
    marca,
    modelo,
    anio,
    color,
    chasis,
    motor,
    antecedente_vehiculo,
    detalle_antecedente
  } = req.body;

  if (!tipo || !patente || !pais_origen || !marca || !modelo) {
    return res.status(400).json({ mensaje: "Tipo, patente, país de origen, marca y modelo son obligatorios" });
  }

  const sql = `
    INSERT INTO vehiculos (
      usuario_id, tipo, patente, pais_origen, marca, modelo, anio, color, chasis, motor,
      antecedente_vehiculo, detalle_antecedente
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      req.usuario.id,
      tipo,
      patente.toUpperCase(),
      pais_origen,
      marca,
      modelo,
      anio || null,
      color || "",
      chasis || "",
      motor || "",
      antecedente_vehiculo ? 1 : 0,
      detalle_antecedente || ""
    ],
    function (error) {
      if (error) {
        if (String(error.message).includes("UNIQUE")) {
          return res.status(409).json({ mensaje: "La patente ya se encuentra registrada" });
        }
        return res.status(500).json({ mensaje: "Error al registrar vehículo" });
      }

      res.status(201).json({ mensaje: "Vehículo registrado correctamente", id: this.lastID });
    }
  );
};

const listarVehiculos = (req, res) => {
  const params = [];
  let sql = "SELECT * FROM vehiculos";

  if (req.usuario.rol === "PERSONA") {
    sql += " WHERE usuario_id = ?";
    params.push(req.usuario.id);
  }

  sql += " ORDER BY id DESC";

  db.all(sql, params, (error, rows) => {
    if (error) return res.status(500).json({ mensaje: "Error al listar vehículos" });
    res.json(rows);
  });
};

const obtenerVehiculo = (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM vehiculos WHERE id = ?", [id], (error, row) => {
    if (error) return res.status(500).json({ mensaje: "Error al buscar vehículo" });
    if (!row) return res.status(404).json({ mensaje: "Vehículo no encontrado" });
    if (!puedeVer(req.usuario, row)) return res.status(403).json({ mensaje: "No puedes ver este vehículo" });
    res.json(row);
  });
};

module.exports = { crearVehiculo, listarVehiculos, obtenerVehiculo };
