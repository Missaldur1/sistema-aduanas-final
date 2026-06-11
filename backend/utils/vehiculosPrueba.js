const vehiculosPrueba = [
  {
    patente: "ZZ9999",
    tiene_alerta: true,
    detalle: "Vehículo con alerta simulada por revisión documental aduanera."
  },
  {
    patente: "XY1234",
    tiene_alerta: true,
    detalle: "Vehículo asociado a revisión pendiente."
  },
  {
    patente: "AA1122",
    tiene_alerta: false,
    detalle: ""
  },
  {
    patente: "BB2233",
    tiene_alerta: false,
    detalle: ""
  }
];

function normalizarPatente(patente = "") {
  return patente
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s/g, "")
    .replace(/-/g, "");
}

function buscarVehiculoPrueba(patente) {
  const patenteNormalizada = normalizarPatente(patente);

  return vehiculosPrueba.find(
    (vehiculo) => normalizarPatente(vehiculo.patente) === patenteNormalizada
  );
}

module.exports = {
  vehiculosPrueba,
  buscarVehiculoPrueba
};