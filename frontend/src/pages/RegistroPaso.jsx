import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Moon, ShieldCheck, Sun } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { escenariosPrueba } from "../utils/escenariosPrueba";

const nacionalidades = [
  "Chilena",
  "Argentina",
  "Boliviana",
  "Brasileña",
  "Colombiana",
  "Ecuatoriana",
  "Paraguaya",
  "Peruana",
  "Uruguaya",
  "Venezolana",
  "Mexicana",
  "Española",
  "Estadounidense",
  "Canadiense",
  "Francesa",
  "Alemana",
  "Italiana",
  "China",
  "Japonesa",
  "Coreana",
  "Otra"
];

const prefijosTelefonicos = [
  { codigo: "+56", pais: "Chile" },
  { codigo: "+54", pais: "Argentina" },
  { codigo: "+591", pais: "Bolivia" },
  { codigo: "+55", pais: "Brasil" },
  { codigo: "+57", pais: "Colombia" },
  { codigo: "+593", pais: "Ecuador" },
  { codigo: "+595", pais: "Paraguay" },
  { codigo: "+51", pais: "Perú" },
  { codigo: "+598", pais: "Uruguay" },
  { codigo: "+58", pais: "Venezuela" },
  { codigo: "+52", pais: "México" },
  { codigo: "+1", pais: "Estados Unidos / Canadá" },
  { codigo: "+34", pais: "España" }
];

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

  const formularioInicial = {
    persona: {
      nombre: "",
      apellido: "",
      documento_tipo: "RUT",
      documento_numero: "",
      nacionalidad: "Chilena",
      nacionalidad_otro: "",
      fecha_nacimiento: "",
      prefijo_telefono: "+56",
      telefono: "",
      email: ""
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
      motor: ""
    },
    declaracion: {
      transporta_alimentos: false,
      transporta_vegetales: false,
      transporta_animales: false,
      dinero_mayor_declarable: false,
      observaciones: ""
    },
    motivo_viaje: "Turismo",
    motivo_viaje_otro: "",
    destino: "",
    frontera: "Complejo Los Libertadores"
  };

  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("modoRegistro") === "oscuro";
  });

  const [form, setForm] = useState(formularioInicial);
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
        [campo]: valor
      }
    }));

    quitarError(`${seccion}.${campo}`);
  };

  const cambiarSimple = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor
    }));

    quitarError(campo);
  };

  const cambiarTipoDocumento = (valor) => {
    setForm((prev) => ({
      ...prev,
      persona: {
        ...prev.persona,
        documento_tipo: valor,
        documento_numero: ""
      }
    }));

    setCamposFaltantes((prev) => {
      const nuevosErrores = { ...prev };
      delete nuevosErrores["persona.documento_numero"];
      return nuevosErrores;
    });
  };

  const cambiarNacionalidad = (valor) => {
    setForm((prev) => ({
      ...prev,
      persona: {
        ...prev.persona,
        nacionalidad: valor,
        nacionalidad_otro: valor === "Otra" ? prev.persona.nacionalidad_otro : ""
      }
    }));

    setCamposFaltantes((prev) => {
      const nuevosErrores = { ...prev };

      delete nuevosErrores["persona.nacionalidad"];
      delete nuevosErrores["persona.nacionalidad_otro"];

      return nuevosErrores;
    });
  };

  const limpiarTextoSoloLetras = (texto) => {
    return texto.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  };

  const cambiarMotivoViaje = (valor) => {
    setForm((prev) => ({
      ...prev,
      motivo_viaje: valor,
      motivo_viaje_otro: valor === "Otro" ? prev.motivo_viaje_otro : ""
    }));

    setCamposFaltantes((prev) => {
      const nuevosErrores = { ...prev };

      delete nuevosErrores["motivo_viaje"];

      if (valor !== "Otro") {
        delete nuevosErrores["motivo_viaje_otro"];
      }

      return nuevosErrores;
    });
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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarTelefono = (telefono) => {
    return /^[0-9\s-]{6,15}$/.test(telefono);
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
  

  const cambiarDocumento = (valor) => {
    const valorFinal =
      form.persona.documento_tipo === "RUT" ? formatearRut(valor) : valor;

    cambiar("persona", "documento_numero", valorFinal);
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

    const edadAproximada = hoy.getFullYear() - fecha.getFullYear();

    if (edadAproximada > 120) {
      return "La fecha de nacimiento no puede superar los 120 años.";
    }

    return null;
  };

  const separarTelefonoEscenario = (telefono = "") => {
    const telefonoLimpio = telefono.trim();

    const prefijoEncontrado = prefijosTelefonicos.find((item) =>
      telefonoLimpio.startsWith(item.codigo)
    );

    if (!prefijoEncontrado) {
      return {
        prefijo_telefono: "+56",
        telefono: telefonoLimpio
      };
    }

    return {
      prefijo_telefono: prefijoEncontrado.codigo,
      telefono: telefonoLimpio.replace(prefijoEncontrado.codigo, "").trim()
    };
  };

  const validarFormulario = () => {
    const errores = {};

    const nombre = form.persona.nombre.trim();
    const apellido = form.persona.apellido.trim();
    const documento = form.persona.documento_numero.trim();
    const nacionalidad = form.persona.nacionalidad.trim();
    const nacionalidadOtro = form.persona.nacionalidad_otro.trim();
    const telefono = form.persona.telefono.trim();
    const email = form.persona.email.trim();

    const patente = form.vehiculo.patente.trim();
    const paisOrigen = form.vehiculo.pais_origen.trim();
    const marca = form.vehiculo.marca.trim();
    const modelo = form.vehiculo.modelo.trim();
    const anio = form.vehiculo.anio.toString().trim();
    const color = form.vehiculo.color.trim();
    const chasis = form.vehiculo.chasis.trim();
    const motor = form.vehiculo.motor.trim();

    const destino = form.destino.trim();
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
    } else if (form.persona.documento_tipo === "RUT" && !validarRutChileno(documento)) {
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
    } else if (nacionalidad === "Otra") {
      if (!nacionalidadOtro) {
        errores["persona.nacionalidad_otro"] = "Debes indicar la nacionalidad.";
      } else if (nacionalidadOtro.length < 3) {
        errores["persona.nacionalidad_otro"] =
          "La nacionalidad debe tener al menos 3 caracteres.";
      } else if (!soloLetras(nacionalidadOtro)) {
        errores["persona.nacionalidad_otro"] =
          "La nacionalidad no debe contener números ni caracteres especiales.";
      }
    } else if (!soloLetras(nacionalidad)) {
      errores["persona.nacionalidad"] =
        "La nacionalidad solo debe contener letras.";
    }

    const errorFecha = validarFechaNacimiento(form.persona.fecha_nacimiento);

    if (errorFecha) {
      errores["persona.fecha_nacimiento"] = errorFecha;
    }

    if (telefono && !validarTelefono(telefono)) {
      errores["persona.telefono"] =
        "Ingresa un número válido. Ej: 9 1234 5678.";
    }

    if (email && !validarEmail(email)) {
      errores["persona.email"] = "Ingresa un correo electrónico válido.";
    }

    if (!patente) {
      errores["vehiculo.patente"] = "La patente es obligatoria.";
    } else if (!/^[A-Z0-9-]{4,10}$/.test(patente.toUpperCase())) {
      errores["vehiculo.patente"] =
        "La patente debe tener entre 4 y 10 caracteres, solo letras y números.";
    }

    if (!paisOrigen) {
      errores["vehiculo.pais_origen"] = "El país de origen es obligatorio.";
    } else if (paisOrigen.length < 3) {
      errores["vehiculo.pais_origen"] =
        "El país de origen debe tener al menos 3 caracteres.";
    } else if (!soloLetras(paisOrigen)) {
      errores["vehiculo.pais_origen"] =
        "El país de origen solo debe contener letras.";
    }

    if (!marca) {
      errores["vehiculo.marca"] = "La marca es obligatoria.";
    } else if (marca.length < 2) {
      errores["vehiculo.marca"] = "La marca debe tener al menos 2 caracteres.";
    }

    if (!modelo) {
      errores["vehiculo.modelo"] = "El modelo es obligatorio.";
    }

    if (anio) {
      const anioNumero = Number(anio);
      const anioActual = new Date().getFullYear();

      if (!Number.isInteger(anioNumero)) {
        errores["vehiculo.anio"] = "El año debe ser un número válido.";
      } else if (anioNumero < 1950 || anioNumero > anioActual + 1) {
        errores["vehiculo.anio"] =
          `El año debe estar entre 1950 y ${anioActual + 1}.`;
      }
    }

    if (color && !soloLetras(color)) {
      errores["vehiculo.color"] = "El color solo debe contener letras.";
    }

    if (chasis && chasis.length < 5) {
      errores["vehiculo.chasis"] =
        "El número de chasis debe tener al menos 5 caracteres.";
    }

    if (motor && motor.length < 3) {
      errores["vehiculo.motor"] =
        "El número de motor debe tener al menos 3 caracteres.";
    }

    if (!form.motivo_viaje) {
      errores["motivo_viaje"] = "El motivo del viaje es obligatorio.";
    }

    if (form.motivo_viaje === "Otro" && !form.motivo_viaje_otro.trim()) {
      errores["motivo_viaje_otro"] =
        "Debes especificar el motivo del viaje.";
    } else if (
      form.motivo_viaje === "Otro" &&
      form.motivo_viaje_otro.trim().length < 3
    ) {
      errores["motivo_viaje_otro"] =
        "El motivo personalizado debe tener al menos 3 caracteres.";
    }

    if (!destino) {
      errores["destino"] = "El destino es obligatorio.";
    } else if (destino.length < 3) {
      errores["destino"] = "El destino debe tener al menos 3 caracteres.";
    }

    if (observaciones.length > 300) {
      errores["declaracion.observaciones"] =
        "Las observaciones no pueden superar los 300 caracteres.";
    }

    setCamposFaltantes(errores);

    if (Object.keys(errores).length > 0) {
      setMensaje({
        tipo: "error",
        texto:
          "Faltan datos o existen campos con formato incorrecto. Revisa los campos marcados en rojo."
      });

      return false;
    }

    return true;
  };

  const cargarEscenario = (escenario) => {
    if (!escenario) return;

    const telefonoEscenario = separarTelefonoEscenario(
      escenario.data.persona?.telefono || ""
    );

    setForm({
      ...escenario.data,
      persona: {
        ...escenario.data.persona,
        nacionalidad_otro: "",
        prefijo_telefono: telefonoEscenario.prefijo_telefono,
        telefono: telefonoEscenario.telefono
      },
      motivo_viaje_otro: escenario.data.motivo_viaje_otro || "",
      frontera: "Complejo Los Libertadores"
    });

    setCamposFaltantes({});
    setComprobante(null);

    setMensaje({
      tipo: "ok",
      texto: `Escenario cargado: ${escenario.nombre}. Ahora puedes guardar el registro.`
    });
  };

  const limpiarFormulario = () => {
    setForm(formularioInicial);
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
      const motivoViajeFinal =
        form.motivo_viaje === "Otro"
          ? `Otro: ${form.motivo_viaje_otro.trim()}`
          : form.motivo_viaje;

      const nacionalidadFinal =
        form.persona.nacionalidad === "Otra"
          ? form.persona.nacionalidad_otro.trim()
          : form.persona.nacionalidad;

      const { prefijo_telefono, nacionalidad_otro, ...personaSinPrefijo } = form.persona;

      const telefonoFinal = form.persona.telefono.trim()
        ? `${form.persona.prefijo_telefono} ${form.persona.telefono.trim()}`
        : "";

      const response = await api.post("/tramites", {
        ...form,
        persona: {
          ...personaSinPrefijo,
          nacionalidad: nacionalidadFinal,
          telefono: telefonoFinal
        },
        motivo_viaje: motivoViajeFinal,
        frontera: "Complejo Los Libertadores"
      });

      const codigo = response.data?.codigo_tramite;

      setMensaje({
        tipo: "ok",
        texto: `${
          response.data?.mensaje || "Trámite registrado correctamente."
        } Código de trámite: ${codigo}. Guarda este código para consultar con Aduanas.`
      });

      setComprobante({
        id: response.data?.id,
        codigo,
        fecha: new Date().toLocaleString("es-CL")
      });

      limpiarFormulario();
      setCamposFaltantes({});
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto:
          error.response?.data?.mensaje || "No se pudo registrar el trámite."
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
              onChange={(e) => cambiarTipoDocumento(e.target.value)}
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
              onChange={(e) => cambiarDocumento(e.target.value)}
              placeholder={obtenerPlaceholderDocumento(form.persona.documento_tipo)}
            />
            {mostrarError("persona.documento_numero")}
          </label>

          <label>
            Nacionalidad
            <select
              className={marcarCampo("persona.nacionalidad")}
              value={form.persona.nacionalidad}
              onChange={(e) => cambiarNacionalidad(e.target.value)}
            >
              {nacionalidades.map((nacionalidad) => (
                <option key={nacionalidad} value={nacionalidad}>
                  {nacionalidad}
                </option>
              ))}
            </select>
            {mostrarError("persona.nacionalidad")}
          </label>

          {form.persona.nacionalidad === "Otra" && (
            <label className="otro-motivo-field">
              Indique su nacionalidad
              <input
                className={marcarCampo("persona.nacionalidad_otro")}
                value={form.persona.nacionalidad_otro}
                onChange={(e) =>
                  cambiar(
                    "persona",
                    "nacionalidad_otro",
                    limpiarTextoSoloLetras(e.target.value)
                  )
                }
                placeholder="Ej: Cubana, Hondureña, Panameña"
              />
              {mostrarError("persona.nacionalidad_otro")}
            </label>
          )}

          <label>
            Fecha de nacimiento
            <DatePicker
              selected={convertirFechaParaInput(
                form.persona.fecha_nacimiento
              )}
              onChange={(fecha) =>
                cambiar(
                  "persona",
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
                "persona.fecha_nacimiento"
              )}`}
              calendarClassName="aduanas-calendar"
            />
            {mostrarError("persona.fecha_nacimiento")}
          </label>

          <label>
            Teléfono
            <div className="phone-field">
              <select
                value={form.persona.prefijo_telefono}
                onChange={(e) =>
                  cambiar("persona", "prefijo_telefono", e.target.value)
                }
              >
                {prefijosTelefonicos.map((item) => (
                  <option key={`${item.codigo}-${item.pais}`} value={item.codigo}>
                    {item.codigo} · {item.pais}
                  </option>
                ))}
              </select>

              <input
                className={marcarCampo("persona.telefono")}
                value={form.persona.telefono}
                onChange={(e) => cambiar("persona", "telefono", e.target.value)}
                placeholder="Ej: 9 1234 5678"
              />
            </div>
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
              onChange={(e) =>
                cambiar("vehiculo", "pais_origen", e.target.value)
              }
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
              className={marcarCampo("vehiculo.anio")}
              type="number"
              min="1950"
              max="2030"
              value={form.vehiculo.anio}
              onChange={(e) => cambiar("vehiculo", "anio", e.target.value)}
              placeholder="Ej: 2020"
            />
            {mostrarError("vehiculo.anio")}
          </label>

          <label>
            Color
            <input
              className={marcarCampo("vehiculo.color")}
              value={form.vehiculo.color}
              onChange={(e) => cambiar("vehiculo", "color", e.target.value)}
              placeholder="Ej: Blanco"
            />
            {mostrarError("vehiculo.color")}
          </label>

          <label>
            Número de chasis
            <input
              className={marcarCampo("vehiculo.chasis")}
              value={form.vehiculo.chasis}
              onChange={(e) => cambiar("vehiculo", "chasis", e.target.value)}
              placeholder="Opcional"
            />
            {mostrarError("vehiculo.chasis")}
          </label>

          <label>
            Número de motor
            <input
              className={marcarCampo("vehiculo.motor")}
              value={form.vehiculo.motor}
              onChange={(e) => cambiar("vehiculo", "motor", e.target.value)}
              placeholder="Opcional"
            />
            {mostrarError("vehiculo.motor")}
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
              className={marcarCampo("motivo_viaje")}
              value={form.motivo_viaje}
              onChange={(e) => cambiarMotivoViaje(e.target.value)}
            >
              <option value="Turismo">Turismo</option>
              <option value="Trabajo">Trabajo</option>
              <option value="Comercio">Comercio</option>
              <option value="Residencia">Residencia</option>
              <option value="Otro">Otro</option>
            </select>
            {mostrarError("motivo_viaje")}
          </label>

          {form.motivo_viaje === "Otro" && (
            <label className="otro-motivo-field">
              Especifique el motivo del viaje
              <input
                type="text"
                placeholder="Ej: visita familiar, estudio, trámite personal"
                value={form.motivo_viaje_otro}
                onChange={(e) =>
                  cambiarSimple("motivo_viaje_otro", e.target.value)
                }
                className={marcarCampo("motivo_viaje_otro")}
              />
              {mostrarError("motivo_viaje_otro")}
            </label>
          )}

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
                cambiar(
                  "declaracion",
                  "transporta_alimentos",
                  e.target.checked
                )
              }
            />
            Transporta alimentos
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_vegetales}
              onChange={(e) =>
                cambiar(
                  "declaracion",
                  "transporta_vegetales",
                  e.target.checked
                )
              }
            />
            Transporta vegetales
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_animales}
              onChange={(e) =>
                cambiar(
                  "declaracion",
                  "transporta_animales",
                  e.target.checked
                )
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
              Completa tus datos personales, información del vehículo y declaración
              jurada para que Aduanas pueda revisar tu solicitud.
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
              Carga datos automáticamente para probar distintos casos de validación
              aduanera.
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
      subtitulo="Formulario para registrar persona, vehículo y declaración jurada digital."
    >
      {contenidoFormulario}
    </Layout>
  );
}

export default RegistroPaso;