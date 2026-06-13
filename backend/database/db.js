const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const dbPath = path.join(__dirname, "..", "aduanas.db");
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Error al conectar con SQLite:", error.message);
  } else {
    console.log("Base de datos SQLite conectada");
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

async function crearTablas() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      institucion TEXT NOT NULL,
      rol TEXT NOT NULL CHECK (rol IN ('ADMIN', 'PERSONA')),
      documento TEXT,
      telefono TEXT,
      email TEXT,
      activo INTEGER DEFAULT 1,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      documento_tipo TEXT NOT NULL,
      documento_numero TEXT NOT NULL UNIQUE,
      nacionalidad TEXT NOT NULL,
      fecha_nacimiento TEXT,
      telefono TEXT,
      email TEXT,
      antecedente_penal INTEGER DEFAULT 0,
      detalle_antecedente TEXT DEFAULT '',
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      tipo TEXT NOT NULL,
      patente TEXT NOT NULL UNIQUE,
      pais_origen TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      anio INTEGER,
      color TEXT,
      chasis TEXT,
      motor TEXT,
      antecedente_vehiculo INTEGER DEFAULT 0,
      detalle_antecedente TEXT DEFAULT '',
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS tramites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_id INTEGER NOT NULL,
      vehiculo_id INTEGER NOT NULL,
      usuario_id INTEGER,
      frontera TEXT DEFAULT 'Complejo Los Libertadores',
      motivo_viaje TEXT NOT NULL,
      destino TEXT NOT NULL,
      estado TEXT DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','EN_REVISION','APROBADO','RECHAZADO','OBSERVADO')),
      resultado_pdi TEXT DEFAULT 'PENDIENTE',
      resultado_sag TEXT DEFAULT 'PENDIENTE',
      resultado_aduana TEXT DEFAULT 'PENDIENTE',
      observaciones TEXT DEFAULT '',
      codigo_tramite TEXT,
      puntaje_riesgo INTEGER DEFAULT 0,
      nivel_riesgo TEXT DEFAULT 'VERDE',
      motivo_riesgo TEXT DEFAULT '',
      accion_recomendada TEXT DEFAULT '',
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (persona_id) REFERENCES personas(id),
      FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS menores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tramite_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      documento_tipo TEXT NOT NULL,
      documento_numero TEXT NOT NULL,
      nacionalidad TEXT NOT NULL,
      fecha_nacimiento TEXT,
      parentesco TEXT NOT NULL,
      autorizacion_viaje TEXT DEFAULT '',
      observaciones TEXT DEFAULT '',
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tramite_id) REFERENCES tramites(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS declaraciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tramite_id INTEGER NOT NULL,
      transporta_alimentos INTEGER DEFAULT 0,
      transporta_vegetales INTEGER DEFAULT 0,
      transporta_animales INTEGER DEFAULT 0,
      dinero_mayor_declarable INTEGER DEFAULT 0,
      observaciones TEXT DEFAULT '',
      FOREIGN KEY (tramite_id) REFERENCES tramites(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tramite_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      prioridad TEXT DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA','MEDIA','ALTA')),
      mensaje TEXT NOT NULL,
      estado TEXT DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA','CERRADA')),
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tramite_id) REFERENCES tramites(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS validaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tramite_id INTEGER,
      resultado_pdi TEXT,
      resultado_sag TEXT,
      resultado_final TEXT,
      observaciones TEXT,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tramite_id) REFERENCES tramites(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS historial_acciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      usuario_nombre TEXT,
      accion TEXT NOT NULL,
      modulo TEXT NOT NULL,
      detalle TEXT DEFAULT '',
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);
}

async function seed() {
  const adminHash = bcrypt.hashSync("admin123", 10);

  await run(
    `
    INSERT OR IGNORE INTO usuarios
    (id, nombre, usuario, password_hash, institucion, rol, documento, telefono, email)
    VALUES
    (1, 'Funcionario Aduanas', 'admin', ?, 'Aduanas Chile', 'ADMIN', '11111111-1', '+56 9 1111 1111', 'admin@aduanas.cl')
  `,
    [adminHash]
  );
}

crearTablas()
  .then(seed)
  .catch((error) => console.error("Error preparando base de datos:", error.message));

module.exports = db;