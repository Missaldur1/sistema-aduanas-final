const personasPrueba = [
  {
    documento: "12.345.678-9",
    nombre: "Carlos Soto",
    tiene_antecedentes: true,
    detalle: "Registra antecedente penal simulado por orden de revisión PDI."
  },
  {
    documento: "11.111.111-1",
    nombre: "Pedro Morales",
    tiene_antecedentes: true,
    detalle: "Persona con restricción simulada para salir del país."
  },
  {
    documento: "22.222.222-2",
    nombre: "Ana Torres",
    tiene_antecedentes: false,
    detalle: ""
  },
  {
    documento: "33.333.333-3",
    nombre: "María González",
    tiene_antecedentes: false,
    detalle: ""
  }
];

function normalizarDocumento(documento = "") {
  return documento
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s/g, "");
}

function buscarPersonaPrueba(documento) {
  const documentoNormalizado = normalizarDocumento(documento);

  return personasPrueba.find(
    (persona) => normalizarDocumento(persona.documento) === documentoNormalizado
  );
}

module.exports = {
  personasPrueba,
  buscarPersonaPrueba
};