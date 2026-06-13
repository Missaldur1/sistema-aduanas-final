import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Moon,
  Plus,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { escenariosPrueba } from "../utils/escenariosPrueba";

const menorInicial = {
  nombre: "",
  apellido: "",
  documento_tipo: "RUT",
  documento_numero: "",
  nacionalidad: "",
  fecha_nacimiento: "",
  parentesco: "Hijo/a",
  autorizacion_viaje: "Presenta autorización de viaje",
  observaciones: "",
};

const crearFormularioInicial = () => ({
  persona: {
    nombre: "",
    apellido: "",
    documento_tipo: "RUT",
    documento_numero: "",
    nacionalidad: "",
    fecha_nacimiento: "",
    telefono: "",
    email: "",
  },
  vehiculo: {
    tipo: "Particular",
    patente: "",
    pais_origen: "",
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    chasis: "",
    motor: "",
  },
  declaracion: {
    transporta_alimentos: false,
    transporta_vegetales: false,
    transporta_animales: false,
    dinero_mayor_declarable: false,
    observaciones: "",
  },
  motivo_viaje: "Turismo",
  destino: "",
  frontera: "Complejo Los Libertadores",
  menores: [],
});

const obtenerPlaceholderDocumento = (tipoDocumento) => {
  if (tipoDocumento === "RUT") return "Ej: 12.345.678-5";
  if (tipoDocumento === "Pasaporte") return "Ej: PA1234567";
  if (tipoDocumento === "DNI") return "Ej: 12345678";
  return "Ingrese número de documento";
};

function RegistroPaso({ publico = false }) {
  useEffect(() => {
    if (publico) {
      document.title = "Aduanas Chile - Registro";
    }
  }, [publico]);

  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("modoRegistro") === "oscuro";
  });

  const [form, setForm] = useState(crearFormularioInicial);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [camposFaltantes, setCamposFaltantes] = useState({});

  const cambiarModo = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem("modoRegistro", nuevoModo ? "oscuro" : "claro");
  };

  const quitarError = (ruta) => {
    setCamposFaltantes((prev) => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores[ruta];
      return nuevosErrores;
    });
  };

  const cambiar = (seccion, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor,
      },
    }));

    quitarError(`${seccion}.${campo}`);
  };

  const cambiarSimple = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    quitarError(campo);
  };

  const marcarCampo = (ruta) => {
    return camposFaltantes[ruta] ? "input-error" : "";
  };

  const mostrarError = (ruta) => {
    return camposFaltantes[ruta] ? (
      <small className="campo-error">{camposFaltantes[ruta]}</small>
    ) : null;
  };

  const soloLetras = (texto) => {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto);
  };

  const validarEmail = (email) => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const limpiarRut = (rut) => {
    return rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
  };

  const formatearRut = (valor) => {
    const rutLimpio = valor
      .replace(/[^0-9kK]/g, "")
      .toUpperCase()
      .slice(0, 9);

    if (rutLimpio.length <= 1) {
      return rutLimpio;
    }

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpoFormateado}-${dv}`;
  };

  const validarRutChileno = (rut) => {
    const rutLimpio = limpiarRut(rut);

    if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) {
      return false;
    }

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

  const convertirFechaParaInput = (fechaTexto) => {
    if (!fechaTexto) return null;

    const [anio, mes, dia] = fechaTexto.split("-");
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  };

  const convertirFechaParaBD = (fecha) => {
    if (!fecha) return "";

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  };

  const calcularEdad = (fechaTexto) => {
    const fecha = convertirFechaParaInput(fechaTexto);

    if (!fecha || Number.isNaN(fecha.getTime())) {
      return null;
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad -= 1;
    }

    return edad;
  };

  const validarFechaNacimiento = (fechaTexto) => {
    if (!fechaTexto) {
      return "La fecha de nacimiento es obligatoria.";
    }

    const fecha = convertirFechaParaInput(fechaTexto);
    const hoy = new Date();

    if (!fecha || Number.isNaN(fecha.getTime())) {
      return "La fecha de nacimiento no es válida.";
    }

    if (fecha > hoy) {
      return "La fecha de nacimiento no puede ser futura.";
    }

    const edad = calcularEdad(fechaTexto);

    if (edad > 120) {
      return "La fecha de nacimiento no puede superar los 120 años.";
    }

    return null;
  };

  const validarFechaNacimientoMenor = (fechaTexto) => {
    const errorFecha = validarFechaNacimiento(fechaTexto);

    if (errorFecha) {
      return errorFecha;
    }

    const edad = calcularEdad(fechaTexto);

    if (edad === null) {
      return "La fecha de nacimiento no es válida.";
    }

    if (edad >= 18) {
      return "El acompañante registrado como menor debe tener menos de 18 años.";
    }

    return null;
  };

  const cambiarTipoDocumentoPersona = (valor) => {
    setForm((prev) => ({
      ...prev,
      persona: {
        ...prev.persona,
        documento_tipo: valor,
        documento_numero: "",
      },
    }));

    quitarError("persona.documento_numero");
  };

  const cambiarDocumentoPersona = (valor) => {
    const valorFinal =
      form.persona.documento_tipo === "RUT" ? formatearRut(valor) : valor;

    cambiar("persona", "documento_numero", valorFinal);
  };

  const agregarMenor = () => {
    setForm((prev) => ({
      ...prev,
      menores: [...prev.menores, { ...menorInicial }],
    }));
  };

  const eliminarMenor = (index) => {
    setForm((prev) => ({
      ...prev,
      menores: prev.menores.filter((_, i) => i !== index),
    }));

    setCamposFaltantes((prev) => {
      const nuevosErrores = {};

      Object.entries(prev).forEach(([ruta, mensajeError]) => {
        if (!ruta.startsWith("menores.")) {
          nuevosErrores[ruta] = mensajeError;
          return;
        }

        const partes = ruta.split(".");
        const indiceActual = Number(partes[1]);

        if (indiceActual < index) {
          nuevosErrores[ruta] = mensajeError;
        } else if (indiceActual > index) {
          partes[1] = String(indiceActual - 1);
          nuevosErrores[partes.join(".")] = mensajeError;
        }
      });

      return nuevosErrores;
    });
  };

  const cambiarMenor = (index, campo, valor) => {
    setForm((prev) => ({
      ...prev,
      menores: prev.menores.map((menor, i) =>
        i === index ? { ...menor, [campo]: valor } : menor
      ),
    }));

    quitarError(`menores.${index}.${campo}`);
  };

  const cambiarTipoDocumentoMenor = (index, valor) => {
    setForm((prev) => ({
      ...prev,
      menores: prev.menores.map((menor, i) =>
        i === index
          ? {
              ...menor,
              documento_tipo: valor,
              documento_numero: "",
            }
          : menor
      ),
    }));

    quitarError(`menores.${index}.documento_numero`);
  };

  const cambiarDocumentoMenor = (index, valor) => {
    const menor = form.menores[index];

    const valorFinal =
      menor?.documento_tipo === "RUT" ? formatearRut(valor) : valor;

    cambiarMenor(index, "documento_numero", valorFinal);
  };

  const validarFormulario = () => {
    const errores = {};

    const nombre = form.persona.nombre.trim();
    const apellido = form.persona.apellido.trim();
    const documento = form.persona.documento_numero.trim();
    const nacionalidad = form.persona.nacionalidad.trim();
    const telefono = form.persona.telefono.trim();
    const email = form.persona.email.trim();

    const patente = form.vehiculo.patente.trim();
    const paisOrigen = form.vehiculo.pais_origen.trim();
    const marca = form.vehiculo.marca.trim();
    const modelo = form.vehiculo.modelo.trim();
    const observaciones = form.declaracion.observaciones.trim();

    if (!nombre) {
      errores["persona.nombre"] = "El nombre es obligatorio.";
    } else if (nombre.length < 2) {
      errores["persona.nombre"] = "El nombre debe tener al menos 2 caracteres.";
    } else if (!soloLetras(nombre)) {
      errores["persona.nombre"] = "El nombre solo debe contener letras.";
    }

    if (!apellido) {
      errores["persona.apellido"] = "El apellido es obligatorio.";
    } else if (apellido.length < 2) {
      errores["persona.apellido"] = "El apellido debe tener al menos 2 caracteres.";
    } else if (!soloLetras(apellido)) {
      errores["persona.apellido"] = "El apellido solo debe contener letras.";
    }

    if (!documento) {
      errores["persona.documento_numero"] = "El número de documento es obligatorio.";
    } else if (
      form.persona.documento_tipo === "RUT" &&
      !validarRutChileno(documento)
    ) {
      errores["persona.documento_numero"] =
        "Ingresa un RUT válido. Ej: 12.345.678-5.";
    } else if (
      form.persona.documento_tipo !== "RUT" &&
      !/^[A-Za-z0-9-]{5,20}$/.test(documento)
    ) {
      errores["persona.documento_numero"] =
        "El documento debe tener entre 5 y 20 caracteres.";
    }

    if (!nacionalidad) {
      errores["persona.nacionalidad"] = "La nacionalidad es obligatoria.";
    } else if (!soloLetras(nacionalidad)) {
      errores["persona.nacionalidad"] = "La nacionalidad solo debe contener letras.";
    }

    const errorFechaPersona = validarFechaNacimiento(form.persona.fecha_nacimiento);

    if (errorFechaPersona) {
      errores["persona.fecha_nacimiento"] = errorFechaPersona;
    }

    if (telefono && !/^[0-9+\s-]{6,20}$/.test(telefono)) {
      errores["persona.telefono"] =
        "Ingresa un número válido. Ej: +56 9 1234 5678.";
    }

    if (email && !validarEmail(email)) {
      errores["persona.email"] = "Ingresa un correo electrónico válido.";
    }

    if (!patente) {
      errores["vehiculo.patente"] = "La patente es obligatoria.";
    } else if (!/^[A-Z0-9-]{4,10}$/.test(patente.toUpperCase())) {
      errores["vehiculo.patente"] =
        "La patente debe tener entre 4 y 10 caracteres.";
    }

    if (!paisOrigen) {
      errores["vehiculo.pais_origen"] = "El país de origen es obligatorio.";
    } else if (paisOrigen.length < 3) {
      errores["vehiculo.pais_origen"] =
        "El país de origen debe tener al menos 3 caracteres.";
    }

    if (!marca) {
      errores["vehiculo.marca"] = "La marca es obligatoria.";
    }

    if (!modelo) {
      errores["vehiculo.modelo"] = "El modelo es obligatorio.";
    }

    if (!form.destino.trim()) {
      errores["destino"] = "El destino es obligatorio.";
    }

    if (observaciones.length > 300) {
      errores["declaracion.observaciones"] =
        "Las observaciones no pueden superar los 300 caracteres.";
    }

    form.menores.forEach((menor, index) => {
      const nombreMenor = menor.nombre.trim();
      const apellidoMenor = menor.apellido.trim();
      const documentoMenor = menor.documento_numero.trim();
      const nacionalidadMenor = menor.nacionalidad.trim();
      const parentescoMenor = menor.parentesco.trim();
      const autorizacionMenor = menor.autorizacion_viaje.trim();
      const observacionesMenor = menor.observaciones.trim();

      if (!nombreMenor) {
        errores[`menores.${index}.nombre`] = "El nombre del menor es obligatorio.";
      } else if (nombreMenor.length < 2) {
        errores[`menores.${index}.nombre`] =
          "El nombre debe tener al menos 2 caracteres.";
      } else if (!soloLetras(nombreMenor)) {
        errores[`menores.${index}.nombre`] =
          "El nombre solo debe contener letras.";
      }

      if (!apellidoMenor) {
        errores[`menores.${index}.apellido`] =
          "El apellido del menor es obligatorio.";
      } else if (apellidoMenor.length < 2) {
        errores[`menores.${index}.apellido`] =
          "El apellido debe tener al menos 2 caracteres.";
      } else if (!soloLetras(apellidoMenor)) {
        errores[`menores.${index}.apellido`] =
          "El apellido solo debe contener letras.";
      }

      if (!documentoMenor) {
        errores[`menores.${index}.documento_numero`] =
          "El documento del menor es obligatorio.";
      } else if (
        menor.documento_tipo === "RUT" &&
        !validarRutChileno(documentoMenor)
      ) {
        errores[`menores.${index}.documento_numero`] =
          "Ingresa un RUT válido para el menor.";
      } else if (
        menor.documento_tipo !== "RUT" &&
        !/^[A-Za-z0-9-]{5,20}$/.test(documentoMenor)
      ) {
        errores[`menores.${index}.documento_numero`] =
          "El documento debe tener entre 5 y 20 caracteres.";
      }

      if (!nacionalidadMenor) {
        errores[`menores.${index}.nacionalidad`] =
          "La nacionalidad del menor es obligatoria.";
      } else if (!soloLetras(nacionalidadMenor)) {
        errores[`menores.${index}.nacionalidad`] =
          "La nacionalidad solo debe contener letras.";
      }

      const errorFechaMenor = validarFechaNacimientoMenor(menor.fecha_nacimiento);

      if (errorFechaMenor) {
        errores[`menores.${index}.fecha_nacimiento`] = errorFechaMenor;
      }

      if (!parentescoMenor) {
        errores[`menores.${index}.parentesco`] =
          "El parentesco o relación es obligatorio.";
      }

      if (!autorizacionMenor) {
        errores[`menores.${index}.autorizacion_viaje`] =
          "Debes indicar la autorización o documento de viaje.";
      }

      if (observacionesMenor.length > 300) {
        errores[`menores.${index}.observaciones`] =
          "Las observaciones del menor no pueden superar los 300 caracteres.";
      }
    });

    setCamposFaltantes(errores);

    if (Object.keys(errores).length > 0) {
      setMensaje({
        tipo: "error",
        texto:
          "Faltan datos obligatorios o existen campos con formato incorrecto. Revisa los campos marcados en rojo.",
      });

      return false;
    }

    return true;
  };

  const cargarEscenario = (escenario) => {
    if (!escenario) return;

    setForm({
      ...escenario.data,
      frontera: "Complejo Los Libertadores",
      menores: escenario.data.menores || [],
    });

    setCamposFaltantes({});
    setComprobante(null);

    setMensaje({
      tipo: "ok",
      texto: `Escenario cargado: ${escenario.nombre}. Ahora puedes guardar el registro.`,
    });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setComprobante(null);

    const formularioValido = validarFormulario();

    if (!formularioValido) {
      return;
    }

    setCargando(true);

    try {
      const response = await api.post("/tramites", {
        ...form,
        frontera: "Complejo Los Libertadores",
        menores: form.menores.map((menor) => ({
          nombre: menor.nombre.trim(),
          apellido: menor.apellido.trim(),
          documento_tipo: menor.documento_tipo,
          documento_numero: menor.documento_numero.trim(),
          nacionalidad: menor.nacionalidad.trim(),
          fecha_nacimiento: menor.fecha_nacimiento,
          parentesco: menor.parentesco,
          autorizacion_viaje: menor.autorizacion_viaje,
          observaciones: menor.observaciones.trim(),
        })),
      });

      const codigo = response.data?.codigo_tramite;

      setMensaje({
        tipo: "ok",
        texto: `${
          response.data?.mensaje || "Trámite registrado correctamente."
        } Código de trámite: ${codigo}. Guarda este código para consultar con Aduanas.`,
      });

      setComprobante({
        id: response.data?.id,
        codigo,
        fecha: new Date().toLocaleString("es-CL"),
        menores_registrados: response.data?.menores_registrados || 0,
      });

      setForm(crearFormularioInicial());
      setCamposFaltantes({});
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.response?.data?.errores?.join(" ") ||
          error.response?.data?.mensaje ||
          "No se pudo registrar el trámite.",
      });
    } finally {
      setCargando(false);
    }
  };

  const contenidoFormulario = (
    <form className="form-page" onSubmit={enviar} noValidate>
      <section className="panel-card form-section">
        <div className="form-section-title">
          <ClipboardList size={22} />
          <h2>Datos de la persona</h2>
        </div>

        <div className="form-grid">
          <label>
            Nombre
            <input
              className={marcarCampo("persona.nombre")}
              value={form.persona.nombre}
              onChange={(e) => cambiar("persona", "nombre", e.target.value)}
              placeholder="Ej: Carlos"
            />
            {mostrarError("persona.nombre")}
          </label>

          <label>
            Apellido
            <input
              className={marcarCampo("persona.apellido")}
              value={form.persona.apellido}
              onChange={(e) => cambiar("persona", "apellido", e.target.value)}
              placeholder="Ej: Soto"
            />
            {mostrarError("persona.apellido")}
          </label>

          <label>
            Tipo de documento
            <select
              value={form.persona.documento_tipo}
              onChange={(e) => cambiarTipoDocumentoPersona(e.target.value)}
            >
              <option value="RUT">RUT</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="DNI">DNI</option>
            </select>
          </label>

          <label>
            Número de documento
            <input
              className={marcarCampo("persona.documento_numero")}
              value={form.persona.documento_numero}
              onChange={(e) => cambiarDocumentoPersona(e.target.value)}
              placeholder={obtenerPlaceholderDocumento(form.persona.documento_tipo)}
            />
            {mostrarError("persona.documento_numero")}
          </label>

          <label>
            Nacionalidad
            <input
              className={marcarCampo("persona.nacionalidad")}
              value={form.persona.nacionalidad}
              onChange={(e) => cambiar("persona", "nacionalidad", e.target.value)}
              placeholder="Ej: Chilena"
            />
            {mostrarError("persona.nacionalidad")}
          </label>

          <label>
            Fecha de nacimiento
            <DatePicker
              selected={convertirFechaParaInput(form.persona.fecha_nacimiento)}
              onChange={(fecha) =>
                cambiar("persona", "fecha_nacimiento", convertirFechaParaBD(fecha))
              }
              dateFormat="dd/MM/yyyy"
              locale={es}
              placeholderText="dd/mm/aaaa"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              className={`date-picker-input ${marcarCampo(
                "persona.fecha_nacimiento"
              )}`}
              calendarClassName="aduanas-calendar"
            />
            {mostrarError("persona.fecha_nacimiento")}
          </label>

          <label>
            Teléfono
            <input
              className={marcarCampo("persona.telefono")}
              value={form.persona.telefono}
              onChange={(e) => cambiar("persona", "telefono", e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
            />
            {mostrarError("persona.telefono")}
          </label>

          <label>
            Email
            <input
              className={marcarCampo("persona.email")}
              type="email"
              value={form.persona.email}
              onChange={(e) => cambiar("persona", "email", e.target.value)}
              placeholder="Ej: persona@mail.com"
            />
            {mostrarError("persona.email")}
          </label>
        </div>
      </section>

      <section className="panel-card form-section minors-form-section">
        <div className="form-section-title minors-section-title">
          <Users size={22} />
          <div>
            <h2>Menores acompañantes</h2>
            <p>
              Si viajas con menores de edad, agrégalos al mismo trámite para que
              Aduanas pueda revisarlos junto al adulto responsable.
            </p>
          </div>
        </div>

        {form.menores.length === 0 ? (
          <div className="minor-empty-register">
            <p>No has agregado menores acompañantes.</p>

            <button
              type="button"
              className="secondary-action-btn"
              onClick={agregarMenor}
            >
              <Plus size={17} />
              Agregar menor acompañante
            </button>
          </div>
        ) : (
          <div className="minors-register-list">
            {form.menores.map((menor, index) => (
              <article className="minor-register-card" key={index}>
                <div className="minor-register-header">
                  <div>
                    <span>Menor {index + 1}</span>
                    <strong>
                      {menor.nombre || "Nuevo menor"} {menor.apellido}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="remove-minor-btn"
                    onClick={() => eliminarMenor(index)}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>

                <div className="form-grid">
                  <label>
                    Nombre del menor
                    <input
                      className={marcarCampo(`menores.${index}.nombre`)}
                      value={menor.nombre}
                      onChange={(e) =>
                        cambiarMenor(index, "nombre", e.target.value)
                      }
                      placeholder="Ej: Sofía"
                    />
                    {mostrarError(`menores.${index}.nombre`)}
                  </label>

                  <label>
                    Apellido del menor
                    <input
                      className={marcarCampo(`menores.${index}.apellido`)}
                      value={menor.apellido}
                      onChange={(e) =>
                        cambiarMenor(index, "apellido", e.target.value)
                      }
                      placeholder="Ej: González"
                    />
                    {mostrarError(`menores.${index}.apellido`)}
                  </label>

                  <label>
                    Tipo de documento
                    <select
                      value={menor.documento_tipo}
                      onChange={(e) =>
                        cambiarTipoDocumentoMenor(index, e.target.value)
                      }
                    >
                      <option value="RUT">RUT</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="DNI">DNI</option>
                    </select>
                  </label>

                  <label>
                    Número de documento
                    <input
                      className={marcarCampo(`menores.${index}.documento_numero`)}
                      value={menor.documento_numero}
                      onChange={(e) => cambiarDocumentoMenor(index, e.target.value)}
                      placeholder={obtenerPlaceholderDocumento(menor.documento_tipo)}
                    />
                    {mostrarError(`menores.${index}.documento_numero`)}
                  </label>

                  <label>
                    Nacionalidad
                    <input
                      className={marcarCampo(`menores.${index}.nacionalidad`)}
                      value={menor.nacionalidad}
                      onChange={(e) =>
                        cambiarMenor(index, "nacionalidad", e.target.value)
                      }
                      placeholder="Ej: Chilena"
                    />
                    {mostrarError(`menores.${index}.nacionalidad`)}
                  </label>

                  <label>
                    Fecha de nacimiento
                    <DatePicker
                      selected={convertirFechaParaInput(menor.fecha_nacimiento)}
                      onChange={(fecha) =>
                        cambiarMenor(
                          index,
                          "fecha_nacimiento",
                          convertirFechaParaBD(fecha)
                        )
                      }
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      placeholderText="dd/mm/aaaa"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      className={`date-picker-input ${marcarCampo(
                        `menores.${index}.fecha_nacimiento`
                      )}`}
                      calendarClassName="aduanas-calendar"
                    />
                    {mostrarError(`menores.${index}.fecha_nacimiento`)}
                  </label>

                  <label>
                    Parentesco o relación
                    <select
                      className={marcarCampo(`menores.${index}.parentesco`)}
                      value={menor.parentesco}
                      onChange={(e) =>
                        cambiarMenor(index, "parentesco", e.target.value)
                      }
                    >
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Nieto/a">Nieto/a</option>
                      <option value="Sobrino/a">Sobrino/a</option>
                      <option value="Tutor legal">Tutor legal</option>
                      <option value="Otro">Otro</option>
                    </select>
                    {mostrarError(`menores.${index}.parentesco`)}
                  </label>

                  <label>
                    Autorización o documento de viaje
                    <select
                      className={marcarCampo(`menores.${index}.autorizacion_viaje`)}
                      value={menor.autorizacion_viaje}
                      onChange={(e) =>
                        cambiarMenor(index, "autorizacion_viaje", e.target.value)
                      }
                    >
                      <option value="Presenta autorización de viaje">
                        Presenta autorización de viaje
                      </option>
                      <option value="Viaja con ambos padres">
                        Viaja con ambos padres
                      </option>
                      <option value="Documento pendiente de revisión">
                        Documento pendiente de revisión
                      </option>
                      <option value="No aplica">No aplica</option>
                    </select>
                    {mostrarError(`menores.${index}.autorizacion_viaje`)}
                  </label>

                  <label className="minor-observations-field">
                    Observaciones del menor
                    <textarea
                      className={marcarCampo(`menores.${index}.observaciones`)}
                      placeholder="Ej: viaja con autorización notarial o documento adicional."
                      value={menor.observaciones}
                      onChange={(e) =>
                        cambiarMenor(index, "observaciones", e.target.value)
                      }
                      maxLength={300}
                    />
                    {mostrarError(`menores.${index}.observaciones`)}
                  </label>
                </div>
              </article>
            ))}

            <button
              type="button"
              className="secondary-action-btn"
              onClick={agregarMenor}
            >
              <Plus size={17} />
              Agregar otro menor
            </button>
          </div>
        )}
      </section>

      <section className="panel-card form-section">
        <div className="form-section-title">
          <ClipboardList size={22} />
          <h2>Datos del vehículo</h2>
        </div>

        <div className="form-grid">
          <label>
            Tipo de vehículo
            <select
              value={form.vehiculo.tipo}
              onChange={(e) => cambiar("vehiculo", "tipo", e.target.value)}
            >
              <option value="Particular">Particular</option>
              <option value="Carga">Carga</option>
              <option value="Bus">Bus</option>
              <option value="Moto">Moto</option>
            </select>
          </label>

          <label>
            Patente
            <input
              className={marcarCampo("vehiculo.patente")}
              value={form.vehiculo.patente}
              onChange={(e) =>
                cambiar("vehiculo", "patente", e.target.value.toUpperCase())
              }
              placeholder="Ej: AB1234"
            />
            {mostrarError("vehiculo.patente")}
          </label>

          <label>
            País de origen
            <input
              className={marcarCampo("vehiculo.pais_origen")}
              value={form.vehiculo.pais_origen}
              onChange={(e) => cambiar("vehiculo", "pais_origen", e.target.value)}
              placeholder="Ej: Chile"
            />
            {mostrarError("vehiculo.pais_origen")}
          </label>

          <label>
            Marca
            <input
              className={marcarCampo("vehiculo.marca")}
              value={form.vehiculo.marca}
              onChange={(e) => cambiar("vehiculo", "marca", e.target.value)}
              placeholder="Ej: Toyota"
            />
            {mostrarError("vehiculo.marca")}
          </label>

          <label>
            Modelo
            <input
              className={marcarCampo("vehiculo.modelo")}
              value={form.vehiculo.modelo}
              onChange={(e) => cambiar("vehiculo", "modelo", e.target.value)}
              placeholder="Ej: Yaris"
            />
            {mostrarError("vehiculo.modelo")}
          </label>

          <label>
            Año
            <input
              type="number"
              min="1950"
              max="2030"
              value={form.vehiculo.anio}
              onChange={(e) => cambiar("vehiculo", "anio", e.target.value)}
              placeholder="Ej: 2020"
            />
          </label>

          <label>
            Color
            <input
              value={form.vehiculo.color}
              onChange={(e) => cambiar("vehiculo", "color", e.target.value)}
              placeholder="Ej: Blanco"
            />
          </label>

          <label>
            Número de chasis
            <input
              value={form.vehiculo.chasis}
              onChange={(e) => cambiar("vehiculo", "chasis", e.target.value)}
              placeholder="Opcional"
            />
          </label>

          <label>
            Número de motor
            <input
              value={form.vehiculo.motor}
              onChange={(e) => cambiar("vehiculo", "motor", e.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
      </section>

      <section className="panel-card form-section">
        <div className="form-section-title">
          <ShieldCheck size={22} />
          <h2>Declaración y viaje</h2>
        </div>

        <div className="form-grid">
          <label>
            Motivo del viaje
            <select
              value={form.motivo_viaje}
              onChange={(e) => cambiarSimple("motivo_viaje", e.target.value)}
            >
              <option value="Turismo">Turismo</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Comercio">Comercio</option>
              <option value="Residencia">Residencia</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label>
            Destino
            <input
              className={marcarCampo("destino")}
              value={form.destino}
              onChange={(e) => cambiarSimple("destino", e.target.value)}
              placeholder="Ej: Argentina"
            />
            {mostrarError("destino")}
          </label>

          <label>
            Frontera
            <input
              value="Complejo Los Libertadores"
              readOnly
              className="readonly-input"
            />
          </label>
        </div>

        <div className="checkbox-grid">
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_alimentos}
              onChange={(e) =>
                cambiar("declaracion", "transporta_alimentos", e.target.checked)
              }
            />
            Transporta alimentos
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_vegetales}
              onChange={(e) =>
                cambiar("declaracion", "transporta_vegetales", e.target.checked)
              }
            />
            Transporta vegetales
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_animales}
              onChange={(e) =>
                cambiar("declaracion", "transporta_animales", e.target.checked)
              }
            />
            Transporta animales
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.dinero_mayor_declarable}
              onChange={(e) =>
                cambiar(
                  "declaracion",
                  "dinero_mayor_declarable",
                  e.target.checked
                )
              }
            />
            Dinero o valores declarables
          </label>
        </div>

        <textarea
          className={marcarCampo("declaracion.observaciones")}
          placeholder="Observaciones adicionales"
          value={form.declaracion.observaciones}
          onChange={(e) =>
            cambiar("declaracion", "observaciones", e.target.value)
          }
          maxLength={300}
        />
        {mostrarError("declaracion.observaciones")}
      </section>

      {mensaje && (
        <div
          className={`alert ${
            mensaje.tipo === "ok" ? "alert-success" : "alert-error"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {comprobante && (
        <section className="qr-ticket-card">
          <div className="qr-ticket-info">
            <p className="eyebrow">Comprobante digital</p>
            <h3>{comprobante.codigo}</h3>
            <p>
              Guarda este código. Aduana podrá usarlo para revisar tu trámite
              registrado.
            </p>

            <div className="qr-ticket-data">
              <span>Fecha: {comprobante.fecha}</span>
              <span>Estado: En revisión aduanera</span>
              <span>
                Menores registrados: {comprobante.menores_registrados || 0}
              </span>
            </div>
          </div>

          <div className="qr-box">
            <QRCodeSVG
              value={comprobante.codigo}
              size={150}
              level="H"
              includeMargin
            />
          </div>
        </section>
      )}

      <button className="primary-btn submit-btn" disabled={cargando} type="submit">
        <CheckCircle2 size={19} />
        {cargando ? "Guardando..." : "Guardar registro de paso"}
      </button>
    </form>
  );

  if (publico) {
    return (
      <main className={`public-register-page ${modoOscuro ? "dark-register" : ""}`}>
        <header className="public-register-header">
          <div>
            <p className="eyebrow">Sistema Integrado de Gestión Aduanera</p>
            <h1>Registro de paso fronterizo</h1>
            <p>
              Completa tus datos personales, información del vehículo,
              menores acompañantes si corresponde y declaración jurada para que
              Aduanas pueda revisar tu solicitud.
            </p>
          </div>

          <div className="public-header-actions">
            <button type="button" className="theme-toggle-btn" onClick={cambiarModo}>
              {modoOscuro ? <Sun size={14} /> : <Moon size={14} />}
              {modoOscuro ? "Modo claro" : "Modo oscuro"}
            </button>

            <a className="quick-action" href="/admin">
              Ingreso Aduana
            </a>
          </div>
        </header>

        <section className="testing-tools-card">
          <div>
            <p className="eyebrow">Herramientas de prueba</p>
            <h2>Escenarios rápidos</h2>
            <p>
              Carga datos automáticamente para probar distintos casos de
              validación aduanera.
            </p>
          </div>
            
          <div className="testing-tools-actions">
            <select
              defaultValue=""
              onChange={(e) => {
                const escenario = escenariosPrueba.find(
                  (item) => item.nombre === e.target.value
                );
              
                cargarEscenario(escenario);
                e.target.value = "";
              }}
            >
              <option value="" disabled>
                Seleccionar escenario
              </option>
            
              {escenariosPrueba.map((escenario) => (
                <option key={escenario.nombre} value={escenario.nombre}>
                  {escenario.nombre}
                </option>
              ))}
            </select>
          </div>
        </section>

        {contenidoFormulario}
      </main>
    );
  }

  return (
    <Layout
      titulo="Nuevo trámite fronterizo"
      subtitulo="Formulario para registrar persona, vehículo, menores acompañantes y declaración jurada digital."
    >
      {contenidoFormulario}
    </Layout>
  );
}

export default RegistroPaso;