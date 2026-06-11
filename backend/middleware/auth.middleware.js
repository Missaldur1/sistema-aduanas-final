const { verificarToken } = require("../utils/jwt");

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "Token no enviado" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.usuario = verificarToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}

function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tienes permisos para acceder a este recurso" });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
