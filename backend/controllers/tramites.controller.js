const db = require("../database/db");
const calcularRiesgo = require("../utils/calcularRiesgo");
const { buscarPersonaPrueba } = require("../utils/personasPrueba");
const { buscarVehiculoPrueba } = require("../utils/vehiculosPrueba");

function generarResultado(row) {
  const problemas = [];
  if (row.antecedente_penal) problemas.push("PDI: persona con antecedente registrado");
  if (row.antecedente_vehiculo) problemas.push("Aduanas: vehículo con antecedente registrado");
  if (row.transporta_alimentos || row.transporta_vegetales || row.transporta_animales) problemas.push("SAG: declaración requiere revisión");
  if (row.dinero_mayor_declarable) problemas.push("Aduanas: dinero/valores requieren declaración");

  return {
    estado: problemas.length ? "OBSERVADO" : "APROBADO",
    resultado_pdi: row.antecedente_penal ? "OBSERVADO" : "APROBADO",
    resultado_sag: (row.transporta_alimentos || row.transporta_vegetales || row.transporta_animales) ? "OBSERVADO" : "APROBADO",
    resultado_aduana: (row.antecedente_vehiculo || row.dinero_mayor_declarable) ? "OBSERVADO" : "APROBADO",
    observaciones: problemas.length ? problemas.join(" | ") : "Sin observaciones"
  };
}

const crearTramite = (req, res) => {
  const { persona, vehiculo, declaracion, motivo_viaje, destino, frontera } = req.body;

const usuarioId = req.usuario?.id || null;

const personaPrueba = buscarPersonaPrueba(persona?.documento_numero);
const vehiculoPrueba = buscarVehiculoPrueba(vehiculo?.patente);

const personaValidada = {
  ...persona,
  antecedente_penal: personaPrueba?.tiene_antecedentes || false,
  detalle_antecedente: personaPrueba?.detalle || ""
};

const vehiculoValidado = {
  ...vehiculo,
  patente: vehiculo?.patente?.toUpperCase() || "",
  antecedente_vehiculo: vehiculoPrueba?.tiene_alerta || false,
  detalle_antecedente: vehiculoPrueba?.detalle || ""
};

const riesgo = calcularRiesgo(personaValidada, vehiculoValidado, declaracion);

  if (!persona || !vehiculo || !motivo_viaje || !destino) {
    return res.status(400).json({ mensaje: "Persona, vehículo, motivo de viaje y destino son obligatorios" });
  }

  const personaCampos = ["nombre", "apellido", "documento_tipo", "documento_numero", "nacionalidad"];
  const vehiculoCampos = ["tipo", "patente", "pais_origen", "marca", "modelo"];
  const faltantesPersona = personaCampos.filter((campo) => !personaValidada[campo]);
  const faltantesVehiculo = vehiculoCampos.filter((campo) => !vehiculo[campo]);

  if (faltantesPersona.length || faltantesVehiculo.length) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios",
      faltantes: [...faltantesPersona.map((c) => `persona.${c}`), ...faltantesVehiculo.map((c) => `vehiculo.${c}`)]
    });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
      `INSERT OR IGNORE INTO personas
       (usuario_id, nombre, apellido, documento_tipo, documento_numero, nacionalidad, fecha_nacimiento, telefono, email, antecedente_penal, detalle_antecedente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        personaValidada.nombre,
        personaValidada.apellido,
        personaValidada.documento_tipo,
        personaValidada.documento_numero,
        personaValidada.nacionalidad,
        personaValidada.fecha_nacimiento || "",
        personaValidada.telefono || "",
        personaValidada.email || "",
        personaValidada.antecedente_penal ? 1 : 0,
        personaValidada.detalle_antecedente || ""
      ]
    );
    db.run(
      `UPDATE personas SET
        nombre = ?, apellido = ?, nacionalidad = ?, fecha_nacimiento = ?, telefono = ?, email = ?,
        antecedente_penal = ?, detalle_antecedente = ?
       WHERE documento_numero = ?`,
      [
        personaValidada.nombre,
        personaValidada.apellido,
        personaValidada.nacionalidad,
        personaValidada.fecha_nacimiento || "",
        personaValidada.telefono || "",
        personaValidada.email || "",
        personaValidada.antecedente_penal ? 1 : 0,
        personaValidada.detalle_antecedente || "",
        personaValidada.documento_numero
      ]
    );

    db.run(
      `INSERT OR IGNORE INTO vehiculos
       (usuario_id, tipo, patente, pais_origen, marca, modelo, anio, color, chasis, motor, antecedente_vehiculo, detalle_antecedente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuarioId,
        vehiculoValidado.tipo,
        vehiculoValidado.patente,
        vehiculoValidado.pais_origen,
        vehiculoValidado.marca,
        vehiculoValidado.modelo,
        vehiculoValidado.anio || "",
        vehiculoValidado.color || "",
        vehiculoValidado.chasis || "",
        vehiculoValidado.motor || "",
        vehiculoValidado.antecedente_vehiculo ? 1 : 0,
        vehiculoValidado.detalle_antecedente || ""
      ]
    );

    db.run(
      `UPDATE vehiculos SET
        tipo = ?, pais_origen = ?, marca = ?, modelo = ?, anio = ?, color = ?, chasis = ?, motor = ?,
        antecedente_vehiculo = ?, detalle_antecedente = ?
       WHERE patente = ?`,
      [
        vehiculoValidado.tipo,
        vehiculoValidado.pais_origen,
        vehiculoValidado.marca,
        vehiculoValidado.modelo,
        vehiculoValidado.anio || "",
        vehiculoValidado.color || "",
        vehiculoValidado.chasis || "",
        vehiculoValidado.motor || "",
        vehiculoValidado.antecedente_vehiculo ? 1 : 0,
        vehiculoValidado.detalle_antecedente || "",
        vehiculoValidado.patente
      ]
    );

    db.get(
      `SELECT p.id AS persona_id, v.id AS vehiculo_id, p.antecedente_penal, v.antecedente_vehiculo
       FROM personas p, vehiculos v
       WHERE p.documento_numero = ? AND v.patente = ?`,
      [personaValidada.documento_numero, vehiculoValidado.patente],
      (error, ids) => {
        if (error || !ids) {
          db.run("ROLLBACK");
          return res.status(500).json({ mensaje: "Error al preparar trámite" });
        }

        db.run(
          `INSERT INTO tramites
           (
            persona_id,
            vehiculo_id,
            usuario_id,
            frontera,
            motivo_viaje,
            destino,
            estado,
            puntaje_riesgo,
            nivel_riesgo,
            motivo_riesgo,
            accion_recomendada
           )
           VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?)`,
          [
            ids.persona_id,
            ids.vehiculo_id,
            usuarioId,
            frontera || "Complejo Los Libertadores",
            motivo_viaje,
            destino,
            riesgo.puntaje,
            riesgo.nivel,
            riesgo.motivos,
            riesgo.accion
          ],
          function (errorTramite) {
            if (errorTramite) {
              db.run("ROLLBACK");
              return res.status(500).json({ mensaje: "Error al crear trámite" });
            }

            const tramiteId = this.lastID;
            const codigoTramite = `ADU-${new Date().getFullYear()}-${String(tramiteId).padStart(5, "0")}`;

            db.run(
              `UPDATE tramites SET codigo_tramite = ? WHERE id = ?`,
              [codigoTramite, tramiteId]
            );
            db.run(
              `INSERT INTO declaraciones
               (tramite_id, transporta_alimentos, transporta_vegetales, transporta_animales, dinero_mayor_declarable, observaciones)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                tramiteId,
                declaracion?.transporta_alimentos ? 1 : 0,
                declaracion?.transporta_vegetales ? 1 : 0,
                declaracion?.transporta_animales ? 1 : 0,
                declaracion?.dinero_mayor_declarable ? 1 : 0,
                declaracion?.observaciones || ""
              ],
              (errorDeclaracion) => {
                if (errorDeclaracion) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ mensaje: "Error al guardar declaración" });
                }

                if (riesgo.nivel !== "VERDE") {
                  db.run(
                    `INSERT INTO alertas (tramite_id, tipo, prioridad, mensaje)
                     VALUES (?, ?, ?, ?)`,
                    [
                      tramiteId,
                      "RIESGO_AUTOMATICO",
                      riesgo.nivel === "ROJO" ? "ALTA" : "MEDIA",
                      `${riesgo.nivel} · ${riesgo.motivos}`
                    ]
                  );
                }

                db.run("COMMIT");

                res.status(201).json({
                  mensaje: "Trámite registrado correctamente",
                  id: tramiteId,
                  codigo_tramite: codigoTramite,
                  riesgo
                });
              }
            );
          }
        );
      }
    );
  });
};

const listarTramites = (req, res) => {
  const params = [];
  let where = "";

  if (req.usuario.rol === "PERSONA") {
    where = "WHERE t.usuario_id = ?";
    params.push(req.usuario.id);
  }

  const sql = `
    SELECT
      t.id,
      t.codigo_tramite,
      t.estado,
      t.fecha,
      t.frontera,
      t.motivo_viaje,
      t.destino,
      t.resultado_pdi,
      t.resultado_sag,
      t.resultado_aduana,
      t.observaciones,
      t.puntaje_riesgo,
      t.nivel_riesgo,
      t.motivo_riesgo,
      t.accion_recomendada,
      p.nombre || ' ' || p.apellido AS persona_nombre,
      p.documento_numero,
      p.nacionalidad, 
      p.antecedente_penal,
      v.patente, 
      v.tipo AS vehiculo_tipo, 
      v.marca, v.modelo, 
      v.antecedente_vehiculo,
      d.transporta_alimentos, 
      d.transporta_vegetales, 
      d.transporta_animales, 
      d.dinero_mayor_declarable,
      u.nombre AS registrado_por
    FROM tramites t
    INNER JOIN personas p ON p.id = t.persona_id
    INNER JOIN vehiculos v ON v.id = t.vehiculo_id
    LEFT JOIN declaraciones d ON d.tramite_id = t.id
    LEFT JOIN usuarios u ON u.id = t.usuario_id
    ${where}
    ORDER BY t.id DESC
  `;

  db.all(sql, params, (error, rows) => {
    if (error) return res.status(500).json({ mensaje: "Error al listar trámites" });
    res.json(rows);
  });
};

const validarTramite = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT t.*, p.antecedente_penal, v.antecedente_vehiculo,
           d.transporta_alimentos, d.transporta_vegetales, d.transporta_animales, d.dinero_mayor_declarable
    FROM tramites t
    INNER JOIN personas p ON p.id = t.persona_id
    INNER JOIN vehiculos v ON v.id = t.vehiculo_id
    LEFT JOIN declaraciones d ON d.tramite_id = t.id
    WHERE t.id = ?
  `;

  db.get(sql, [id], (error, row) => {
    if (error) return res.status(500).json({ mensaje: "Error al buscar trámite" });
    if (!row) return res.status(404).json({ mensaje: "Trámite no encontrado" });

    const resultado = generarResultado(row);

    db.run(
      `UPDATE tramites SET estado = ?, resultado_pdi = ?, resultado_sag = ?, resultado_aduana = ?, observaciones = ? WHERE id = ?`,
      [resultado.estado, resultado.resultado_pdi, resultado.resultado_sag, resultado.resultado_aduana, resultado.observaciones, id],
      (errorUpdate) => {
        if (errorUpdate) return res.status(500).json({ mensaje: "Error al actualizar validación" });

        if (resultado.estado === "OBSERVADO") {
          db.run(
            `INSERT INTO alertas (tramite_id, tipo, prioridad, mensaje) VALUES (?, ?, ?, ?)`,
            [id, "VALIDACION", "ALTA", resultado.observaciones]
          );
        }

        db.run(
          `INSERT INTO validaciones (tramite_id, resultado_pdi, resultado_sag, resultado_final, observaciones)
           VALUES (?, ?, ?, ?, ?)`,
          [id, resultado.resultado_pdi, resultado.resultado_sag, resultado.estado, resultado.observaciones]
        );

        res.json({ mensaje: "Trámite validado correctamente", ...resultado });
      }
    );
  });
};

const obtenerDetalleTramite = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      t.id,
      t.codigo_tramite,
      t.estado,
      t.fecha,
      t.frontera,
      t.motivo_viaje,
      t.destino,
      t.resultado_pdi,
      t.resultado_sag,
      t.resultado_aduana,
      t.observaciones,
      t.puntaje_riesgo,
      t.nivel_riesgo,
      t.motivo_riesgo,
      t.accion_recomendada,

      p.id AS persona_id,
      p.nombre AS persona_nombre,
      p.apellido AS persona_apellido,
      p.documento_tipo,
      p.documento_numero,
      p.nacionalidad,
      p.fecha_nacimiento,
      p.telefono AS persona_telefono,
      p.email AS persona_email,
      p.antecedente_penal,
      p.detalle_antecedente AS persona_detalle_antecedente,

      v.id AS vehiculo_id,
      v.tipo AS vehiculo_tipo,
      v.patente,
      v.pais_origen,
      v.marca,
      v.modelo,
      v.anio,
      v.color,
      v.chasis,
      v.motor,
      v.antecedente_vehiculo,
      v.detalle_antecedente AS vehiculo_detalle_antecedente,

      d.transporta_alimentos,
      d.transporta_vegetales,
      d.transporta_animales,
      d.dinero_mayor_declarable,
      d.observaciones AS declaracion_observaciones

    FROM tramites t
    INNER JOIN personas p ON p.id = t.persona_id
    INNER JOIN vehiculos v ON v.id = t.vehiculo_id
    LEFT JOIN declaraciones d ON d.tramite_id = t.id
    WHERE t.id = ?
  `;

  db.get(sql, [id], (error, tramite) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener el detalle del trámite"
      });
    }

    if (!tramite) {
      return res.status(404).json({
        mensaje: "Trámite no encontrado"
      });
    }

    res.json(tramite);
  });
};

const obtenerTramitePorCodigo = (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({
      mensaje: "Código de trámite requerido"
    });
  }

  db.get(
    `SELECT 
      t.id,
      t.codigo_tramite,
      t.estado,
      t.destino,
      t.frontera,
      t.nivel_riesgo,
      p.nombre || ' ' || p.apellido AS persona_nombre,
      p.documento_numero,
      v.patente,
      v.marca,
      v.modelo
    FROM tramites t
    INNER JOIN personas p ON t.persona_id = p.id
    INNER JOIN vehiculos v ON t.vehiculo_id = v.id
    WHERE t.codigo_tramite = ?`,
    [codigo.trim()],
    (error, tramite) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al buscar el trámite por código"
        });
      }

      if (!tramite) {
        return res.status(404).json({
          mensaje: "No se encontró un trámite con ese código"
        });
      }

      return res.json(tramite);
    }
  );
};

module.exports = {
  crearTramite,
  listarTramites,
  validarTramite,
  obtenerDetalleTramite,
  obtenerTramitePorCodigo
};