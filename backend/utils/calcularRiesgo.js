function calcularRiesgo(persona = {}, vehiculo = {}, declaracion = {}) {
  let puntaje = 0;
  const motivos = [];

  if (persona.antecedente_penal) {
    puntaje += 40;
    motivos.push("Persona declara antecedente penal o restricción");
  }

  if (vehiculo.antecedente_vehiculo) {
    puntaje += 35;
    motivos.push("Vehículo declara antecedente o alerta");
  }

  if (declaracion.transporta_animales) {
    puntaje += 20;
    motivos.push("Transporta animales");
  }

  if (declaracion.transporta_vegetales) {
    puntaje += 15;
    motivos.push("Transporta vegetales");
  }

  if (declaracion.transporta_alimentos) {
    puntaje += 10;
    motivos.push("Transporta alimentos");
  }

  if (declaracion.dinero_mayor_declarable) {
    puntaje += 20;
    motivos.push("Declara dinero o valores declarables");
  }

  let nivel = "VERDE";
  let accion = "Paso con revisión estándar";

  if (puntaje >= 60) {
    nivel = "ROJO";
    accion = "Revisión manual obligatoria por Aduanas";
  } else if (puntaje >= 26) {
    nivel = "AMARILLO";
    accion = "Revisión preventiva recomendada";
  }

  return {
    puntaje,
    nivel,
    motivos: motivos.length ? motivos.join(" | ") : "Sin factores de riesgo detectados",
    accion
  };
}

module.exports = calcularRiesgo;