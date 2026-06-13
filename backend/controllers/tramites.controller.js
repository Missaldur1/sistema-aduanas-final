const db = require("../database/db");
const calcularRiesgo = require("../utils/calcularRiesgo");
const { buscarPersonaPrueba } = require("../utils/personasPrueba");
const { buscarVehiculoPrueba } = require("../utils/vehiculosPrueba");
const registrarAccion = require("../utils/registrarAccion");

const limpiarTexto = (valor = "") => {
  return valor.toString().trim();
};

const soloLetras = (texto = "") => {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
};

const validarEmail = (email = "") => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const limpiarRut = (rut = "") => {
  return rut
    .toString()
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
};

const validarRutChileno = (rut = "") => {
  const rutLimpio = limpiarRut(rut);

  if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) return false;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado =
    dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado);

  return dv === dvCalculado;
};

const formatearRut = (rut = "") => {
  const rutLimpio = limpiarRut(rut);

  if (rutLimpio.length <= 1) return rutLimpio;

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `${cuerpoFormateado}-${dv}`;
};

const normalizarDocumento = (tipo = "", numero = "") => {
  const tipoDocumento = limpiarTexto(tipo);

  if (tipoDocumento === "RUT") {
    return formatearRut(numero);
  }

  return limpiarTexto(numero).toUpperCase();
};

const normalizarPatente = (patente = "") => {
  return patente
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/-/g, "");
};

const validarDatosTramite = ({
  persona,
  vehiculo,
  declaracion,
  motivo_viaje,
  destino,
}) => {
  const errores = [];

  if (!persona) errores.push("Los datos de la persona son obligatorios.");
  if (!vehiculo) errores.push("Los datos del vehículo son obligatorios.");
  if (!motivo_viaje) errores.push("El motivo del viaje es obligatorio.");
  if (!destino) errores.push("El destino es obligatorio.");

  if (errores.length) return errores;

  const nombre = limpiarTexto(persona.nombre);
  const apellido = limpiarTexto(persona.apellido);
  const documentoTipo = limpiarTexto(persona.documento_tipo);
  const documentoNumero = limpiarTexto(persona.documento_numero);
  const nacionalidad = limpiarTexto(persona.nacionalidad);
  const email = limpiarTexto(persona.email);

  if (nombre.length < 2) errores.push("El nombre debe tener al menos 2 caracteres.");
  if (apellido.length < 2) errores.push("El apellido debe tener al menos 2 caracteres.");
  if (!soloLetras(nombre)) errores.push("El nombre solo puede contener letras.");
  if (!soloLetras(apellido)) errores.push("El apellido solo puede contener letras.");

  if (!["RUT", "Pasaporte", "DNI"].includes(documentoTipo)) {
    errores.push("El tipo de documento no es válido.");
  }

  if (!documentoNumero) {
    errores.push("El número de documento es obligatorio.");
  }

  if (documentoTipo === "RUT" && !validarRutChileno(documentoNumero)) {
    errores.push("El RUT ingresado no es válido.");
  }

  if (
    documentoTipo !== "RUT" &&
    !/^[A-Za-z0-9-]{5,20}$/.test(documentoNumero)
  ) {
    errores.push("El documento debe tener entre 5 y 20 caracteres.");
  }

  if (!nacionalidad || nacionalidad.length < 3) {
    errores.push("La nacionalidad es obligatoria.");
  }

  if (email && !validarEmail(email)) {
    errores.push("El email no tiene un formato válido.");
  }

  const patente = normalizarPatente(vehiculo.patente);
  const paisOrigen = limpiarTexto(vehiculo.pais_origen);
  const marca = limpiarTexto(vehiculo.marca);
  const modelo = limpiarTexto(vehiculo.modelo);
  const color = limpiarTexto(vehiculo.color);

  if (!patente || !/^[A-Z0-9]{4,10}$/.test(patente)) {
    errores.push("La patente debe tener entre 4 y 10 caracteres alfanuméricos.");
  }

  if (!paisOrigen || paisOrigen.length < 3) {
    errores.push("El país de origen es obligatorio.");
  }

  if (!marca || marca.length < 2) {
    errores.push("La marca del vehículo es obligatoria.");
  }

  if (!modelo || modelo.length < 1) {
    errores.push("El modelo del vehículo es obligatorio.");
  }

  if (vehiculo.anio) {
    const anio = Number(vehiculo.anio);
    const anioActual = new Date().getFullYear();

    if (!Number.isInteger(anio) || anio < 1950 || anio > anioActual + 1) {
      errores.push("El año del vehículo no es válido.");
    }
  }

  if (color && !soloLetras(color)) {
    errores.push("El color solo puede contener letras.");
  }

  if (declaracion?.observaciones && declaracion.observaciones.length > 300) {
    errores.push("Las observaciones no pueden superar los 300 caracteres.");
  }

  return errores;
};

function generarResultado(row) {
  const problemas = [];

  if (row.antecedente_penal) {
    problemas.push("PDI: persona con antecedente registrado");
  }

  if (row.antecedente_vehiculo) {
    problemas.push("Aduanas: vehículo con antecedente registrado");
  }

  if (
    row.transporta_alimentos ||
    row.transporta_vegetales ||
    row.transporta_animales
  ) {
    problemas.push("SAG: declaración requiere revisión");
  }

  if (row.dinero_mayor_declarable) {
    problemas.push("Aduanas: dinero/valores requieren declaración");
  }

  return {
    estado: problemas.length ? "OBSERVADO" : "APROBADO",
    resultado_pdi: row.antecedente_penal ? "OBSERVADO" : "APROBADO",
    resultado_sag:
      row.transporta_alimentos ||
      row.transporta_vegetales ||
      row.transporta_animales
        ? "OBSERVADO"
        : "APROBADO",
    resultado_aduana:
      row.antecedente_vehiculo || row.dinero_mayor_declarable
        ? "OBSERVADO"
        : "APROBADO",
    observaciones: problemas.length ? problemas.join(" | ") : "Sin observaciones",
  };
}

const crearTramite = (req, res) => {
  const { persona, vehiculo, declaracion, motivo_viaje, destino, frontera } =
    req.body;

  const erroresValidacion = validarDatosTramite(req.body);

  if (erroresValidacion.length) {
    return res.status(400).json({
      mensaje: "Existen datos inválidos en el registro.",
      errores: erroresValidacion,
    });
  }

  const usuarioId = req.usuario?.id || null;

  const personaNormalizada = {
    ...persona,
    nombre: limpiarTexto(persona.nombre),
    apellido: limpiarTexto(persona.apellido),
    documento_tipo: limpiarTexto(persona.documento_tipo),
    documento_numero: normalizarDocumento(
      persona.documento_tipo,
      persona.documento_numero
    ),
    nacionalidad: limpiarTexto(persona.nacionalidad),
    fecha_nacimiento: limpiarTexto(persona.fecha_nacimiento),
    telefono: limpiarTexto(persona.telefono),
    email: limpiarTexto(persona.email),
  };

  const vehiculoNormalizado = {
    ...vehiculo,
    tipo: limpiarTexto(vehiculo.tipo),
    patente: normalizarPatente(vehiculo.patente),
    pais_origen: limpiarTexto(vehiculo.pais_origen),
    marca: limpiarTexto(vehiculo.marca),
    modelo: limpiarTexto(vehiculo.modelo),
    anio: vehiculo.anio ? Number(vehiculo.anio) : "",
    color: limpiarTexto(vehiculo.color),
    chasis: limpiarTexto(vehiculo.chasis),
    motor: limpiarTexto(vehiculo.motor),
  };

  const declaracionNormalizada = {
    transporta_alimentos: declaracion?.transporta_alimentos ? 1 : 0,
    transporta_vegetales: declaracion?.transporta_vegetales ? 1 : 0,
    transporta_animales: declaracion?.transporta_animales ? 1 : 0,
    dinero_mayor_declarable: declaracion?.dinero_mayor_declarable ? 1 : 0,
    observaciones: limpiarTexto(declaracion?.observaciones),
  };

  const personaPrueba = buscarPersonaPrueba(personaNormalizada.documento_numero);
  const vehiculoPrueba = buscarVehiculoPrueba(vehiculoNormalizado.patente);

  const personaValidada = {
    ...personaNormalizada,
    antecedente_penal: personaPrueba?.tiene_antecedentes || false,
    detalle_antecedente: personaPrueba?.detalle || "",
  };

  const vehiculoValidado = {
    ...vehiculoNormalizado,
    antecedente_vehiculo: vehiculoPrueba?.tiene_alerta || false,
    detalle_antecedente: vehiculoPrueba?.detalle || "",
  };

  const motivoViajeNormalizado = limpiarTexto(motivo_viaje);
  const destinoNormalizado = limpiarTexto(destino);

  const riesgo = calcularRiesgo(
    personaValidada,
    vehiculoValidado,
    declaracionNormalizada
  );

  const personaCampos = [
    "nombre",
    "apellido",
    "documento_tipo",
    "documento_numero",
    "nacionalidad",
  ];

  const vehiculoCampos = ["tipo", "patente", "pais_origen", "marca", "modelo"];

  const faltantesPersona = personaCampos.filter(
    (campo) => !personaValidada[campo]
  );

  const faltantesVehiculo = vehiculoCampos.filter(
    (campo) => !vehiculoValidado[campo]
  );

  if (faltantesPersona.length || faltantesVehiculo.length) {
    return res.status(400).json({
      mensaje: "Faltan datos obligatorios",
      faltantes: [
        ...faltantesPersona.map((campo) => `persona.${campo}`),
        ...faltantesVehiculo.map((campo) => `vehiculo.${campo}`),
      ],
    });
  }

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
      `INSERT OR IGNORE INTO personas
       (
        usuario_id,
        nombre,
        apellido,
        documento_tipo,
        documento_numero,
        nacionalidad,
        fecha_nacimiento,
        telefono,
        email,
        antecedente_penal,
        detalle_antecedente
       )
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
        personaValidada.detalle_antecedente || "",
      ]
    );

    db.run(
      `UPDATE personas SET
        nombre = ?,
        apellido = ?,
        nacionalidad = ?,
        fecha_nacimiento = ?,
        telefono = ?,
        email = ?,
        antecedente_penal = ?,
        detalle_antecedente = ?
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
        personaValidada.documento_numero,
      ]
    );

    db.run(
      `INSERT OR IGNORE INTO vehiculos
       (
        usuario_id,
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
       )
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
        vehiculoValidado.detalle_antecedente || "",
      ]
    );

    db.run(
      `UPDATE vehiculos SET
        tipo = ?,
        pais_origen = ?,
        marca = ?,
        modelo = ?,
        anio = ?,
        color = ?,
        chasis = ?,
        motor = ?,
        antecedente_vehiculo = ?,
        detalle_antecedente = ?
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
        vehiculoValidado.patente,
      ]
    );

    db.get(
      `SELECT 
        p.id AS persona_id,
        v.id AS vehiculo_id,
        p.antecedente_penal,
        v.antecedente_vehiculo
       FROM personas p, vehiculos v
       WHERE p.documento_numero = ? AND v.patente = ?`,
      [personaValidada.documento_numero, vehiculoValidado.patente],
      (error, ids) => {
        if (error || !ids) {
          db.run("ROLLBACK");
          return res.status(500).json({
            mensaje: "Error al preparar trámite",
          });
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
            motivoViajeNormalizado,
            destinoNormalizado,
            riesgo.puntaje,
            riesgo.nivel,
            riesgo.motivos,
            riesgo.accion,
          ],
          function (errorTramite) {
            if (errorTramite) {
              db.run("ROLLBACK");
              return res.status(500).json({
                mensaje: "Error al crear trámite",
              });
            }

            const tramiteId = this.lastID;
            const codigoTramite = `ADU-${new Date().getFullYear()}-${String(
              tramiteId
            ).padStart(5, "0")}`;

            db.run(
              `UPDATE tramites SET codigo_tramite = ? WHERE id = ?`,
              [codigoTramite, tramiteId],
              (errorCodigo) => {
                if (errorCodigo) {
                  db.run("ROLLBACK");
                  return res.status(500).json({
                    mensaje: "Error al generar código del trámite",
                  });
                }

                db.run(
                  `INSERT INTO declaraciones
                   (
                    tramite_id,
                    transporta_alimentos,
                    transporta_vegetales,
                    transporta_animales,
                    dinero_mayor_declarable,
                    observaciones
                   )
                   VALUES (?, ?, ?, ?, ?, ?)`,
                  [
                    tramiteId,
                    declaracionNormalizada.transporta_alimentos,
                    declaracionNormalizada.transporta_vegetales,
                    declaracionNormalizada.transporta_animales,
                    declaracionNormalizada.dinero_mayor_declarable,
                    declaracionNormalizada.observaciones,
                  ],
                  (errorDeclaracion) => {
                    if (errorDeclaracion) {
                      db.run("ROLLBACK");
                      return res.status(500).json({
                        mensaje: "Error al guardar declaración",
                      });
                    }

                    if (riesgo.nivel !== "VERDE") {
                      db.run(
                        `INSERT INTO alertas
                         (tramite_id, tipo, prioridad, mensaje)
                         VALUES (?, ?, ?, ?)`,
                        [
                          tramiteId,
                          "RIESGO_AUTOMATICO",
                          riesgo.nivel === "ROJO" ? "ALTA" : "MEDIA",
                          `${riesgo.nivel} · ${riesgo.motivos}`,
                        ]
                      );
                    }

                    db.run("COMMIT");

                    return res.status(201).json({
                      mensaje: "Trámite registrado correctamente",
                      id: tramiteId,
                      codigo_tramite: codigoTramite,
                      riesgo,
                    });
                  }
                );
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

  if (req.usuario?.rol === "PERSONA") {
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
      v.marca,
      v.modelo,
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
    if (error) {
      return res.status(500).json({
        mensaje: "Error al listar trámites",
      });
    }

    return res.json(rows);
  });
};

const validarTramite = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      t.*,
      p.antecedente_penal,
      v.antecedente_vehiculo,
      d.transporta_alimentos,
      d.transporta_vegetales,
      d.transporta_animales,
      d.dinero_mayor_declarable
    FROM tramites t
    INNER JOIN personas p ON p.id = t.persona_id
    INNER JOIN vehiculos v ON v.id = t.vehiculo_id
    LEFT JOIN declaraciones d ON d.tramite_id = t.id
    WHERE t.id = ?
  `;

  db.get(sql, [id], (error, row) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al buscar trámite",
      });
    }

    if (!row) {
      return res.status(404).json({
        mensaje: "Trámite no encontrado",
      });
    }

    const resultado = generarResultado(row);

    db.run(
      `UPDATE tramites
       SET estado = ?,
           resultado_pdi = ?,
           resultado_sag = ?,
           resultado_aduana = ?,
           observaciones = ?
       WHERE id = ?`,
      [
        resultado.estado,
        resultado.resultado_pdi,
        resultado.resultado_sag,
        resultado.resultado_aduana,
        resultado.observaciones,
        id,
      ],
      (errorUpdate) => {
        if (errorUpdate) {
          return res.status(500).json({
            mensaje: "Error al actualizar validación",
          });
        }

        if (resultado.estado === "OBSERVADO") {
          db.run(
            `INSERT INTO alertas
             (tramite_id, tipo, prioridad, mensaje)
             VALUES (?, ?, ?, ?)`,
            [id, "VALIDACION", "ALTA", resultado.observaciones]
          );
        }

        db.run(
          `INSERT INTO validaciones
           (
            tramite_id,
            resultado_pdi,
            resultado_sag,
            resultado_final,
            observaciones
           )
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            resultado.resultado_pdi,
            resultado.resultado_sag,
            resultado.estado,
            resultado.observaciones,
          ],
          (errorValidacion) => {
            if (errorValidacion) {
              return res.status(500).json({
                mensaje: "Error al guardar historial de validación",
              });
            }

            registrarAccion({
              usuario: req.usuario,
              accion: "VALIDAR_TRAMITE",
              modulo: "Trámites",
              detalle: `Validó el trámite ID ${id} con estado ${resultado.estado}`,
            });

            return res.json({
              mensaje: "Trámite validado correctamente",
              ...resultado,
            });
          }
        );
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
        mensaje: "Error al obtener el detalle del trámite",
      });
    }

    if (!tramite) {
      return res.status(404).json({
        mensaje: "Trámite no encontrado",
      });
    }

    return res.json(tramite);
  });
};

const obtenerTramitePorCodigo = (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({
      mensaje: "Código de trámite requerido",
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
    [codigo.trim().toUpperCase()],
    (error, tramite) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al buscar el trámite por código",
        });
      }

      if (!tramite) {
        return res.status(404).json({
          mensaje: "No se encontró un trámite con ese código",
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
  obtenerTramitePorCodigo,
};