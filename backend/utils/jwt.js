const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cambiar-esta-clave-en-produccion";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

function firmarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      usuario: usuario.usuario,
      rol: usuario.rol,
      institucion: usuario.institucion
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { firmarToken, verificarToken };
