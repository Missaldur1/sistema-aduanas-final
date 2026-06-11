export function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem("usuario"));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export function estaAutenticado() {
  return Boolean(getToken() && getUsuario());
}
