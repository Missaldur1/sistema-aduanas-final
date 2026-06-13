const db = require("../database/db");
const calcularRiesgo = require("../utils/calcularRiesgo");
const { buscarPersonaPrueba } = require("../utils/personasPrueba");
const { buscarVehiculoPrueba } = require("../utils/vehiculosPrueba");
const registrarAccion = require("../utils/registrarAccion");

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
};

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

const validarFechaNoFutura = (fechaTexto = "") => {
  if (!fechaTexto) return true;

  const fecha = new Date(fechaTexto);
  const hoy = new Date();

  if (Number.isNaN(fecha.getTime())) return false;

  return fecha <= hoy;
};

const validarMenores = (menores = []) => {
  const errores = [];

  if (!Array.isArray(menores)) {
    errores.push("Los menores acompañantes deben enviarse como una lista.");
    return errores;
  }

  menores.forEach((menor, index) => {
    const numeroMenor = index + 1;

    const nombre = limpiarTexto(menor.nombre);
    const apellido = limpiarTexto(menor.apellido);
    const documentoTipo = limpiarTexto(menor.documento_tipo);
    const documentoNumero = limpiarTexto(menor.documento_numero);
    const nacionalidad = limpiarTexto(menor.nacionalidad);
    const parentesco = limpiarTexto(menor.parentesco);
    const observaciones = limpiarTexto(menor.observaciones);

    if (nombre.length < 2) {
      errores.push(
        `Menor ${numeroMenor}: el nombre debe tener al menos 2 caracteres.`
      );
    }

    if (apellido.length < 2) {
      errores.push(
        `Menor ${numeroMenor}: el apellido debe tener al menos 2 caracteres.`
      );
    }

    if (nombre && !soloLetras(nombre)) {
      errores.push(
        `Menor ${numeroMenor}: el nombre solo puede contener letras.`
      );
    }

    if (apellido && !soloLetras(apellido)) {
      errores.push(
        `Menor ${numeroMenor}: el apellido solo puede contener letras.`
      );
    }

    if (!["RUT", "Pasaporte", "DNI"].includes(documentoTipo)) {
      errores.push(`Menor ${numeroMenor}: el tipo de documento no es válido.`);
    }

    if (!documentoNumero) {
      errores.push(
        `Menor ${numeroMenor}: el número de documento es obligatorio.`
      );
    }

    if (documentoTipo === "RUT" && !validarRutChileno(documentoNumero)) {
      errores.push(`Menor ${numeroMenor}: el RUT ingresado no es válido.`);
    }

    if (
      documentoTipo !== "RUT" &&
      documentoNumero &&
      !/^[A-Za-z0-9-]{5,20}$/.test(documentoNumero)
    ) {
      errores.push(
        `Menor ${numeroMenor}: el documento debe tener entre 5 y 20 caracteres.`
      );
    }

    if (!nacionalidad || nacionalidad.length < 3) {
      errores.push(`Menor ${numeroMenor}: la nacionalidad es obligatoria.`);
    }

    if (!validarFechaNoFutura(menor.fecha_nacimiento)) {
      errores.push(
        `Menor ${numeroMenor}: la fecha de nacimiento no puede ser futura.`
      );
    }

    if (!parentesco || parentesco.length < 2) {
      errores.push(
        `Menor ${numeroMenor}: el parentesco o relación es obligatorio.`
      );
    }

    if (observaciones.length > 300) {
      errores.push(
        `Menor ${numeroMenor}: las observaciones no pueden superar los 300 caracteres.`
      );
    }
  });

  return errores;
};

const normalizarMenores = (menores = []) => {
  if (!Array.isArray(menores)) return [];

  return menores.map((menor) => ({
    nombre: limpiarTexto(menor.nombre),
    apellido: limpiarTexto(menor.apellido),
    documento_tipo: limpiarTexto(menor.documento_tipo),
    documento_numero: normalizarDocumento(
      menor.documento_tipo,
      menor.documento_numero
    ),
    nacionalidad: limpiarTexto(menor.nacionalidad),
    fecha_nacimiento: limpiarTexto(menor.fecha_nacimiento),
    parentesco: limpiarTexto(menor.parentesco),
    autorizacion_viaje: limpiarTexto(menor.autorizacion_viaje),
    observaciones: limpiarTexto(menor.observaciones),
  }));
};

const MAX_DOCUMENTOS_TRAMITE = 5;
const MAX_TAMANO_DOCUMENTO = 2 * 1024 * 1024;

const MIME_TYPES_PERMITIDOS = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const validarDocumentos = (documentos = []) => {
  const errores = [];

  if (!Array.isArray(documentos)) {
    errores.push("Los documentos adjuntos deben enviarse como una lista.");
    return errores;
  }

  if (documentos.length > MAX_DOCUMENTOS_TRAMITE) {
    errores.push(
      `Solo se permite adjuntar un máximo de ${MAX_DOCUMENTOS_TRAMITE} documentos por trámite.`
    );
  }

  documentos.forEach((documento, index) => {
    const numeroDocumento = index + 1;

    const tipoDocumento = limpiarTexto(documento.tipo_documento);
    const nombreArchivo = limpiarTexto(documento.nombre_archivo);
    const mimeType = limpiarTexto(documento.mime_type).toLowerCase();
    const tamano = Number(documento.tamano || 0);
    const contenidoBase64 = limpiarTexto(documento.contenido_base64);
    const observaciones = limpiarTexto(documento.observaciones);

    if (!tipoDocumento || tipoDocumento.length < 3) {
      errores.push(
        `Documento ${numeroDocumento}: debes indicar el tipo de documento.`
      );
    }

    if (!nombreArchivo) {
      errores.push(
        `Documento ${numeroDocumento}: el nombre del archivo es obligatorio.`
      );
    }

    if (!MIME_TYPES_PERMITIDOS.includes(mimeType)) {
      errores.push(
        `Documento ${numeroDocumento}: solo se permiten archivos PDF, JPG, JPEG o PNG.`
      );
    }

    if (!Number.isFinite(tamano) || tamano <= 0) {
      errores.push(
        `Documento ${numeroDocumento}: el tamaño del archivo no es válido.`
      );
    }

    if (tamano > MAX_TAMANO_DOCUMENTO) {
      errores.push(
        `Documento ${numeroDocumento}: el archivo no puede superar los 2 MB.`
      );
    }

    if (!contenidoBase64) {
      errores.push(
        `Documento ${numeroDocumento}: el contenido del archivo es obligatorio.`
      );
    }

    if (
      contenidoBase64 &&
      !contenidoBase64.startsWith("data:") &&
      !/^[A-Za-z0-9+/=\n\r]+$/.test(contenidoBase64)
    ) {
      errores.push(
        `Documento ${numeroDocumento}: el archivo no tiene un formato válido.`
      );
    }

    if (observaciones.length > 300) {
      errores.push(
        `Documento ${numeroDocumento}: las observaciones no pueden superar los 300 caracteres.`
      );
    }
  });

  return errores;
};

const normalizarDocumentos = (documentos = []) => {
  if (!Array.isArray(documentos)) return [];

  return documentos.map((documento) => ({
    tipo_documento: limpiarTexto(documento.tipo_documento),
    nombre_archivo: limpiarTexto(documento.nombre_archivo),
    mime_type: limpiarTexto(documento.mime_type).toLowerCase(),
    tamano: Number(documento.tamano || 0),
    contenido_base64: limpiarTexto(documento.contenido_base64),
    observaciones: limpiarTexto(documento.observaciones),
  }));
};

const validarDatosTramite = ({
  persona,
  vehiculo,
  declaracion,
  menores = [],
  documentos = [],
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

  errores.push(...validarMenores(menores));
  errores.push(...validarDocumentos(documentos));

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

const crearTramite = async (req, res) => {
  const {
    persona,
    vehiculo,
    declaracion,
    menores = [],
    documentos = [],
    motivo_viaje,
    destino,
    frontera,
  } = req.body;

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

  const menoresNormalizados = normalizarMenores(menores);
  const documentosNormalizados = normalizarDocumentos(documentos);

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

  try {
    await runQuery("BEGIN TRANSACTION");

    await runQuery(
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

    await runQuery(
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

    await runQuery(
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

    await runQuery(
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

    const ids = await getQuery(
      `SELECT 
        p.id AS persona_id,
        v.id AS vehiculo_id
       FROM personas p, vehiculos v
       WHERE p.documento_numero = ? AND v.patente = ?`,
      [personaValidada.documento_numero, vehiculoValidado.patente]
    );

    if (!ids) {
      await runQuery("ROLLBACK");

      return res.status(500).json({
        mensaje: "Error al preparar trámite",
      });
    }

    const tramiteInsert = await runQuery(
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
      ]
    );

    const tramiteId = tramiteInsert.lastID;
    const codigoTramite = `ADU-${new Date().getFullYear()}-${String(
      tramiteId
    ).padStart(5, "0")}`;

    await runQuery(
      `UPDATE tramites SET codigo_tramite = ? WHERE id = ?`,
      [codigoTramite, tramiteId]
    );

    await runQuery(
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
      ]
    );

    for (const menor of menoresNormalizados) {
      await runQuery(
        `INSERT INTO menores
         (
          tramite_id,
          nombre,
          apellido,
          documento_tipo,
          documento_numero,
          nacionalidad,
          fecha_nacimiento,
          parentesco,
          autorizacion_viaje,
          observaciones
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tramiteId,
          menor.nombre,
          menor.apellido,
          menor.documento_tipo,
          menor.documento_numero,
          menor.nacionalidad,
          menor.fecha_nacimiento || "",
          menor.parentesco,
          menor.autorizacion_viaje || "",
          menor.observaciones || "",
        ]
      );
    }

    for (const documento of documentosNormalizados) {
      await runQuery(
        `INSERT INTO documentos_tramite
         (
          tramite_id,
          tipo_documento,
          nombre_archivo,
          mime_type,
          tamano,
          contenido_base64,
          observaciones
         )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          tramiteId,
          documento.tipo_documento,
          documento.nombre_archivo,
          documento.mime_type,
          documento.tamano,
          documento.contenido_base64,
          documento.observaciones || "",
        ]
      );
    }

    if (riesgo.nivel !== "VERDE") {
      await runQuery(
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

    await runQuery("COMMIT");

    return res.status(201).json({
      mensaje: "Trámite registrado correctamente",
      id: tramiteId,
      codigo_tramite: codigoTramite,
      riesgo,
      menores_registrados: menoresNormalizados.length,
      documentos_registrados: documentosNormalizados.length,
    });
  } catch (error) {
    try {
      await runQuery("ROLLBACK");
    } catch (rollbackError) {
      console.error("Error haciendo rollback:", rollbackError.message);
    }

    console.error("Error creando trámite:", error.message);

    return res.status(500).json({
      mensaje: "Error al crear trámite",
    });
  }
};

const listarTramites = async (req, res) => {
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
      COALESCE(mn.menores_count, 0) AS menores_count,
      COALESCE(dc.documentos_count, 0) AS documentos_count,
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
    LEFT JOIN (
      SELECT tramite_id, COUNT(*) AS menores_count
      FROM menores
      GROUP BY tramite_id
    ) mn ON mn.tramite_id = t.id
    LEFT JOIN (
      SELECT tramite_id, COUNT(*) AS documentos_count
      FROM documentos_tramite
      GROUP BY tramite_id
    ) dc ON dc.tramite_id = t.id
    ${where}
    ORDER BY t.id DESC
  `;

  try {
    const rows = await allQuery(sql, params);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al listar trámites",
    });
  }
};

const validarTramite = async (req, res) => {
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

  try {
    const row = await getQuery(sql, [id]);

    if (!row) {
      return res.status(404).json({
        mensaje: "Trámite no encontrado",
      });
    }

    const resultado = generarResultado(row);

    await runQuery(
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
      ]
    );

    if (resultado.estado === "OBSERVADO") {
      await runQuery(
        `INSERT INTO alertas
         (tramite_id, tipo, prioridad, mensaje)
         VALUES (?, ?, ?, ?)`,
        [id, "VALIDACION", "ALTA", resultado.observaciones]
      );
    }

    await runQuery(
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
      ]
    );

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
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al validar trámite",
    });
  }
};

const obtenerDetalleTramite = async (req, res) => {
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

  try {
    const tramite = await getQuery(sql, [id]);

    if (!tramite) {
      return res.status(404).json({
        mensaje: "Trámite no encontrado",
      });
    }

    const menores = await allQuery(
      `SELECT
        id,
        nombre,
        apellido,
        documento_tipo,
        documento_numero,
        nacionalidad,
        fecha_nacimiento,
        parentesco,
        autorizacion_viaje,
        observaciones,
        creado_en
       FROM menores
       WHERE tramite_id = ?
       ORDER BY id ASC`,
      [id]
    );

    const documentos = await allQuery(
      `SELECT
        id,
        tipo_documento,
        nombre_archivo,
        mime_type,
        tamano,
        contenido_base64,
        observaciones,
        creado_en
       FROM documentos_tramite
       WHERE tramite_id = ?
       ORDER BY id ASC`,
      [id]
    );

    return res.json({
      ...tramite,
      menores: menores || [],
      menores_count: menores?.length || 0,
      documentos: documentos || [],
      documentos_count: documentos?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al obtener el detalle del trámite",
    });
  }
};

const obtenerTramitePorCodigo = async (req, res) => {
  const { codigo } = req.params;

  if (!codigo) {
    return res.status(400).json({
      mensaje: "Código de trámite requerido",
    });
  }

  const codigoNormalizado = codigo.trim().toUpperCase();

  const sql = `
    SELECT 
      t.id,
      t.codigo_tramite,
      t.estado,
      t.destino,
      t.frontera,
      t.nivel_riesgo,
      COALESCE(mn.menores_count, 0) AS menores_count,
      COALESCE(dc.documentos_count, 0) AS documentos_count,
      p.nombre || ' ' || p.apellido AS persona_nombre,
      p.documento_numero,
      v.patente,
      v.marca,
      v.modelo
    FROM tramites t
    INNER JOIN personas p ON t.persona_id = p.id
    INNER JOIN vehiculos v ON t.vehiculo_id = v.id
    LEFT JOIN (
      SELECT tramite_id, COUNT(*) AS menores_count
      FROM menores
      GROUP BY tramite_id
    ) mn ON mn.tramite_id = t.id
    LEFT JOIN (
      SELECT tramite_id, COUNT(*) AS documentos_count
      FROM documentos_tramite
      GROUP BY tramite_id
    ) dc ON dc.tramite_id = t.id
    WHERE t.codigo_tramite = ?
  `;

  try {
    const tramite = await getQuery(sql, [codigoNormalizado]);

    if (!tramite) {
      return res.status(404).json({
        mensaje: "No se encontró un trámite con ese código",
      });
    }

    registrarAccion({
      usuario: req.usuario,
      accion: "BUSCAR_TRAMITE_QR",
      modulo: "QR",
      detalle: `Buscó el trámite ${codigoNormalizado} mediante escáner o búsqueda manual.`,
    });

    return res.json(tramite);
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al buscar el trámite por código",
    });
  }
};

module.exports = {
  crearTramite,
  listarTramites,
  validarTramite,
  obtenerDetalleTramite,
  obtenerTramitePorCodigo,
};