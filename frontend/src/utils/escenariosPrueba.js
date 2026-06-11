export const escenariosPrueba = [
  {
    nombre: "Escenario 1: Persona sin riesgo",
    data: {
      persona: {
        nombre: "Ana",
        apellido: "Torres",
        documento_tipo: "RUT",
        documento_numero: "22.222.222-2",
        nacionalidad: "Chilena",
        fecha_nacimiento: "1995-04-12",
        telefono: "+56 9 2222 2222",
        email: "ana.torres@mail.com"
      },
      vehiculo: {
        tipo: "Particular",
        patente: "AA1122",
        pais_origen: "Chile",
        marca: "Toyota",
        modelo: "Yaris",
        anio: "2020",
        color: "Blanco",
        chasis: "CHASIS-AA1122",
        motor: "MOTOR-AA1122"
      },
      declaracion: {
        transporta_alimentos: false,
        transporta_vegetales: false,
        transporta_animales: false,
        dinero_mayor_declarable: false,
        observaciones: ""
      },
      motivo_viaje: "Turismo",
      destino: "Argentina",
      frontera: "Complejo Los Libertadores"
    }
  },
  {
    nombre: "Escenario 2: Persona con antecedente",
    data: {
      persona: {
        nombre: "Carlos",
        apellido: "Soto",
        documento_tipo: "RUT",
        documento_numero: "12.345.678-5",
        nacionalidad: "Chilena",
        fecha_nacimiento: "1988-09-20",
        telefono: "+56 9 1234 5678",
        email: "carlos.soto@mail.com"
      },
      vehiculo: {
        tipo: "Particular",
        patente: "BB2233",
        pais_origen: "Chile",
        marca: "Hyundai",
        modelo: "Accent",
        anio: "2018",
        color: "Gris",
        chasis: "CHASIS-BB2233",
        motor: "MOTOR-BB2233"
      },
      declaracion: {
        transporta_alimentos: false,
        transporta_vegetales: false,
        transporta_animales: false,
        dinero_mayor_declarable: false,
        observaciones: "Viaje particular."
      },
      motivo_viaje: "Turismo",
      destino: "Mendoza",
      frontera: "Complejo Los Libertadores"
    }
  },
  {
    nombre: "Escenario 3: Declaración SAG",
    data: {
      persona: {
        nombre: "María",
        apellido: "González",
        documento_tipo: "RUT",
        documento_numero: "33.333.333-3",
        nacionalidad: "Chilena",
        fecha_nacimiento: "1990-01-18",
        telefono: "+56 9 3333 3333",
        email: "maria.gonzalez@mail.com"
      },
      vehiculo: {
        tipo: "Particular",
        patente: "CC3344",
        pais_origen: "Chile",
        marca: "Kia",
        modelo: "Rio",
        anio: "2021",
        color: "Azul",
        chasis: "CHASIS-CC3344",
        motor: "MOTOR-CC3344"
      },
      declaracion: {
        transporta_alimentos: true,
        transporta_vegetales: true,
        transporta_animales: false,
        dinero_mayor_declarable: false,
        observaciones: "Transporta frutas y alimentos envasados."
      },
      motivo_viaje: "Turismo",
      destino: "Argentina",
      frontera: "Complejo Los Libertadores"
    }
  },
  {
    nombre: "Escenario 4: Alto riesgo",
    data: {
      persona: {
        nombre: "Pedro",
        apellido: "Morales",
        documento_tipo: "RUT",
        documento_numero: "11.111.111-1",
        nacionalidad: "Chilena",
        fecha_nacimiento: "1982-06-03",
        telefono: "+56 9 1111 1111",
        email: "pedro.morales@mail.com"
      },
      vehiculo: {
        tipo: "Carga",
        patente: "ZZ9999",
        pais_origen: "Chile",
        marca: "Volvo",
        modelo: "FH",
        anio: "2017",
        color: "Rojo",
        chasis: "CHASIS-ZZ9999",
        motor: "MOTOR-ZZ9999"
      },
      declaracion: {
        transporta_alimentos: true,
        transporta_vegetales: true,
        transporta_animales: true,
        dinero_mayor_declarable: true,
        observaciones: "Carga declarada con productos sensibles."
      },
      motivo_viaje: "Comercio",
      destino: "Argentina",
      frontera: "Complejo Los Libertadores"
    }
  }
];