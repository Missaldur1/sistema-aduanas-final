import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  FileText,
  Moon,
  Paperclip,
  Plus,
  Printer,
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
  "Otra",
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
  { codigo: "+34", pais: "España" },
];

const tiposDocumentosAdjuntos = [
  "Autorización notarial para menor",
  "Certificado de nacimiento",
  "Documento de identidad del menor",
  "Permiso de circulación",
  "Revisión técnica",
  "Seguro obligatorio",
  "Documento adicional",
];

const tiposArchivosPermitidos = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

const MAX_DOCUMENTOS_TRAMITE = 5;
const MAX_TAMANO_DOCUMENTO = 2 * 1024 * 1024;

const menorInicial = {
  nombre: "",
  apellido: "",
  documento_tipo: "RUT",
  documento_numero: "",
  nacionalidad: "Chilena",
  nacionalidad_otro: "",
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
    nacionalidad: "Chilena",
    nacionalidad_otro: "",
    fecha_nacimiento: "",
    prefijo_telefono: "+56",
    telefono: "",
    email: "",
  },
  vehiculo: {
    rol_viajero: "CHOFER",
    observacion_pasajero: "",
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
  motivo_viaje_otro: "",
  destino: "",
  frontera: "Complejo Los Libertadores",
  menores: [],
  documentos: [],
});

const obtenerPlaceholderDocumento = (tipoDocumento) => {
  if (tipoDocumento === "RUT") return "Ej: 12.345.678-5";
  if (tipoDocumento === "DNI") return "Ej: 12.345.678";
  if (tipoDocumento === "Pasaporte") return "Ej: AB123456";
  return "Ingrese número de documento";
};

const formatearTamanoArchivo = (bytes = 0) => {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function EtiquetaCampo({ children, requerido = false }) {
  return (
    <span className="field-label-text">
      {children}
      {requerido && <span className="required-star"> *</span>}
    </span>
  );
}

function SeccionDesplegable({ id, titulo, descripcion, icono, abierto, onToggle, className = "", children }) {
  return (
    <section className={`panel-card form-section collapsible-form-section ${className} ${abierto ? "is-open" : ""}`}>
      <button
        type="button"
        className="collapsible-section-header"
        onClick={() => onToggle(id)}
        aria-expanded={abierto}
      >
        <div className="collapsible-title-row">
          <div className="collapsible-icon-box">{icono}</div>
          <div>
            <h2>{titulo}</h2>
            {descripcion && <p>{descripcion}</p>}
          </div>
        </div>

        <ChevronDown size={22} className="collapsible-chevron" />
      </button>

      {abierto && <div className="collapsible-section-body">{children}</div>}
    </section>
  );
}

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
  const [mensajeComprobante, setMensajeComprobante] = useState("");
  const [tipoDocumentoAdjunto, setTipoDocumentoAdjunto] = useState("Autorización notarial para menor");
  const [observacionDocumentoAdjunto, setObservacionDocumentoAdjunto] = useState("");
  const [procesandoDocumento, setProcesandoDocumento] = useState(false);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    persona: true,
    menores: false,
    vehiculo: false,
    documentos: false,
    viaje: false,
  });

  const comprobanteRef = useRef(null);
  const archivoInputRef = useRef(null);

  const cambiarModo = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem("modoRegistro", nuevoModo ? "oscuro" : "claro");
  };

  const toggleSeccion = (id) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const abrirSeccionesConErrores = (errores) => {
    const rutas = Object.keys(errores);

    setSeccionesAbiertas((prev) => ({
      ...prev,
      persona: prev.persona || rutas.some((ruta) => ruta.startsWith("persona.")),
      menores: prev.menores || rutas.some((ruta) => ruta.startsWith("menores.")),
      vehiculo: prev.vehiculo || rutas.some((ruta) => ruta.startsWith("vehiculo.")),
      documentos: prev.documentos || rutas.some((ruta) => ruta.startsWith("documentos")),
      viaje:
        prev.viaje ||
        rutas.some(
          (ruta) =>
            ruta.startsWith("declaracion.") ||
            ruta === "motivo_viaje" ||
            ruta === "motivo_viaje_otro" ||
            ruta === "destino"
        ),
    }));
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

  const cambiarRolVehiculo = (valor) => {
    setForm((prev) => ({
      ...prev,
      vehiculo: {
        ...prev.vehiculo,
        rol_viajero: valor,
      },
    }));

    setCamposFaltantes((prev) => {
      const nuevosErrores = { ...prev };

      Object.keys(nuevosErrores).forEach((ruta) => {
        if (ruta.startsWith("vehiculo.")) {
          delete nuevosErrores[ruta];
        }
      });

      return nuevosErrores;
    });
  };

  const cambiarMotivoViaje = (valor) => {
    setForm((prev) => ({
      ...prev,
      motivo_viaje: valor,
      motivo_viaje_otro: valor === "Otro" ? prev.motivo_viaje_otro : "",
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

  const limpiarTextoSoloLetras = (texto) => {
    return texto.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validarTelefono = (telefono) => {
    return /^[0-9\s-]{6,15}$/.test(telefono);
  };

  const limpiarRut = (rut = "") => {
    return rut.replace(/\./g, "").replace(/-/g, "").trim().toUpperCase();
  };

  const formatearRut = (valor = "") => {
    const rutLimpio = valor
      .replace(/[^0-9kK]/g, "")
      .toUpperCase()
      .slice(0, 9);

    if (rutLimpio.length <= 1) return rutLimpio;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpoFormateado}-${dv}`;
  };

  const formatearDni = (valor = "") => {
    const dniLimpio = valor.replace(/\D/g, "").slice(0, 8);
    return dniLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatearPasaporte = (valor = "") => {
    return valor.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 9);
  };

  const limpiarDni = (dni = "") => {
    return dni.replace(/\./g, "").replace(/\D/g, "");
  };

  const formatearDocumentoPorTipo = (tipoDocumento, valor) => {
    if (tipoDocumento === "RUT") return formatearRut(valor);
    if (tipoDocumento === "DNI") return formatearDni(valor);
    if (tipoDocumento === "Pasaporte") return formatearPasaporte(valor);
    return valor;
  };

  const validarRutChileno = (rut) => {
    const rutLimpio = limpiarRut(rut);

    if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) return false;

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

  const validarDocumentoPorTipo = (tipoDocumento, documento, etiqueta = "documento") => {
    const valor = documento.trim();

    if (!valor) return `El número de ${etiqueta} es obligatorio.`;

    if (tipoDocumento === "RUT") {
      if (!validarRutChileno(valor)) {
        return "Ingresa un RUT válido. Ej: 12.345.678-5.";
      }

      return null;
    }

    if (tipoDocumento === "DNI") {
      const dniLimpio = limpiarDni(valor);

      if (!/^\d{7,8}$/.test(dniLimpio)) {
        return "El DNI debe tener solo números, mínimo 7 y máximo 8 dígitos.";
      }

      return null;
    }

    if (tipoDocumento === "Pasaporte") {
      const pasaporte = valor.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

      if (!/^[A-Z0-9]{6,9}$/.test(pasaporte)) {
        return "El pasaporte debe tener entre 6 y 9 caracteres alfanuméricos.";
      }

      return null;
    }

    return "El tipo de documento no es válido.";
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
    cambiar(
      "persona",
      "documento_numero",
      formatearDocumentoPorTipo(form.persona.documento_tipo, valor)
    );
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

    if (!fecha || Number.isNaN(fecha.getTime())) return null;

    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad -= 1;
    }

    return edad;
  };

  const validarFechaNacimiento = (fechaTexto) => {
    if (!fechaTexto) return "La fecha de nacimiento es obligatoria.";

    const fecha = convertirFechaParaInput(fechaTexto);
    const hoy = new Date();

    if (!fecha || Number.isNaN(fecha.getTime())) return "La fecha de nacimiento no es válida.";
    if (fecha > hoy) return "La fecha de nacimiento no puede ser futura.";

    const edad = calcularEdad(fechaTexto);

    if (edad > 120) return "La fecha de nacimiento no puede superar los 120 años.";

    return null;
  };

  const validarFechaNacimientoMenor = (fechaTexto) => {
    const errorFecha = validarFechaNacimiento(fechaTexto);

    if (errorFecha) return errorFecha;

    const edad = calcularEdad(fechaTexto);

    if (edad === null) return "La fecha de nacimiento no es válida.";
    if (edad >= 18) return "El acompañante registrado como menor debe tener menos de 18 años.";

    return null;
  };

  const separarTelefonoEscenario = (telefono = "") => {
    const telefonoLimpio = telefono.trim();
    const prefijoEncontrado = prefijosTelefonicos.find((item) => telefonoLimpio.startsWith(item.codigo));

    if (!prefijoEncontrado) {
      return {
        prefijo_telefono: "+56",
        telefono: telefonoLimpio,
      };
    }

    return {
      prefijo_telefono: prefijoEncontrado.codigo,
      telefono: telefonoLimpio.replace(prefijoEncontrado.codigo, "").trim(),
    };
  };

  const normalizarNacionalidadEscenario = (valor = "") => {
    if (!valor) {
      return {
        nacionalidad: "Chilena",
        nacionalidad_otro: "",
      };
    }

    if (nacionalidades.includes(valor)) {
      return {
        nacionalidad: valor,
        nacionalidad_otro: "",
      };
    }

    return {
      nacionalidad: "Otra",
      nacionalidad_otro: valor,
    };
  };

  const agregarMenor = () => {
    setForm((prev) => ({
      ...prev,
      menores: [...(prev.menores || []), { ...menorInicial }],
    }));

    setSeccionesAbiertas((prev) => ({ ...prev, menores: true }));
  };

  const eliminarMenor = (index) => {
    setForm((prev) => ({
      ...prev,
      menores: (prev.menores || []).filter((_, i) => i !== index),
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
      menores: (prev.menores || []).map((menor, i) =>
        i === index ? { ...menor, [campo]: valor } : menor
      ),
    }));

    quitarError(`menores.${index}.${campo}`);
  };

  const cambiarTipoDocumentoMenor = (index, valor) => {
    setForm((prev) => ({
      ...prev,
      menores: (prev.menores || []).map((menor, i) =>
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
    const menor = form.menores?.[index];

    cambiarMenor(
      index,
      "documento_numero",
      formatearDocumentoPorTipo(menor?.documento_tipo, valor)
    );
  };

  const leerArchivoComoBase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = () => reject(new Error("No se pudo leer el archivo."));
      lector.readAsDataURL(archivo);
    });
  };

  const agregarDocumentoAdjunto = async (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setMensaje(null);

    if ((form.documentos || []).length >= MAX_DOCUMENTOS_TRAMITE) {
      setCamposFaltantes((prev) => ({
        ...prev,
        documentos: `Solo puedes adjuntar hasta ${MAX_DOCUMENTOS_TRAMITE} documentos por trámite.`,
      }));
      e.target.value = "";
      return;
    }

    if (!tiposArchivosPermitidos.includes(archivo.type)) {
      setCamposFaltantes((prev) => ({
        ...prev,
        documentos: "Solo se permiten archivos PDF, JPG, JPEG o PNG.",
      }));
      e.target.value = "";
      return;
    }

    if (archivo.size > MAX_TAMANO_DOCUMENTO) {
      setCamposFaltantes((prev) => ({
        ...prev,
        documentos: "El archivo no puede superar los 2 MB.",
      }));
      e.target.value = "";
      return;
    }

    try {
      setProcesandoDocumento(true);

      const contenidoBase64 = await leerArchivoComoBase64(archivo);

      setForm((prev) => ({
        ...prev,
        documentos: [
          ...(prev.documentos || []),
          {
            tipo_documento: tipoDocumentoAdjunto,
            nombre_archivo: archivo.name,
            mime_type: archivo.type,
            tamano: archivo.size,
            contenido_base64: contenidoBase64,
            observaciones: observacionDocumentoAdjunto.trim(),
          },
        ],
      }));

      setObservacionDocumentoAdjunto("");
      quitarError("documentos");
    } catch (error) {
      setCamposFaltantes((prev) => ({
        ...prev,
        documentos: "No se pudo leer el archivo seleccionado.",
      }));
    } finally {
      setProcesandoDocumento(false);
      e.target.value = "";
    }
  };

  const eliminarDocumentoAdjunto = (index) => {
    setForm((prev) => ({
      ...prev,
      documentos: (prev.documentos || []).filter((_, i) => i !== index),
    }));

    quitarError("documentos");
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

    const rolViajero = form.vehiculo.rol_viajero || "CHOFER";
    const esChofer = rolViajero === "CHOFER";
    const observacionPasajero = (form.vehiculo.observacion_pasajero || "").trim();

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

    const errorDocumentoPersona = validarDocumentoPorTipo(form.persona.documento_tipo, documento, "documento");

    if (errorDocumentoPersona) {
      errores["persona.documento_numero"] = errorDocumentoPersona;
    }

    if (!nacionalidad) {
      errores["persona.nacionalidad"] = "La nacionalidad es obligatoria.";
    } else if (nacionalidad === "Otra") {
      if (!nacionalidadOtro) {
        errores["persona.nacionalidad_otro"] = "Debes indicar la nacionalidad.";
      } else if (nacionalidadOtro.length < 3) {
        errores["persona.nacionalidad_otro"] = "La nacionalidad debe tener al menos 3 caracteres.";
      } else if (!soloLetras(nacionalidadOtro)) {
        errores["persona.nacionalidad_otro"] = "La nacionalidad no debe contener números ni caracteres especiales.";
      }
    } else if (!soloLetras(nacionalidad)) {
      errores["persona.nacionalidad"] = "La nacionalidad solo debe contener letras.";
    }

    const errorFecha = validarFechaNacimiento(form.persona.fecha_nacimiento);

    if (errorFecha) {
      errores["persona.fecha_nacimiento"] = errorFecha;
    }

    if (!telefono) {
      errores["persona.telefono"] = "El teléfono es obligatorio.";
    } else if (!validarTelefono(telefono)) {
      errores["persona.telefono"] = "Ingresa un número válido. Ej: 9 1234 5678.";
    }

    if (!email) {
      errores["persona.email"] = "El email es obligatorio.";
    } else if (!validarEmail(email)) {
      errores["persona.email"] = "Ingresa un correo electrónico válido.";
    }

    if (!rolViajero) {
      errores["vehiculo.rol_viajero"] = "Debes indicar si viajas como chofer o pasajero.";
    }

    if (esChofer) {
      if (!patente) {
        errores["vehiculo.patente"] = "La patente es obligatoria.";
      } else if (!/^[A-Z0-9-]{4,10}$/.test(patente.toUpperCase())) {
        errores["vehiculo.patente"] = "La patente debe tener entre 4 y 10 caracteres, solo letras y números.";
      }

      if (!paisOrigen) {
        errores["vehiculo.pais_origen"] = "El país de origen es obligatorio.";
      } else if (paisOrigen.length < 3) {
        errores["vehiculo.pais_origen"] = "El país de origen debe tener al menos 3 caracteres.";
      } else if (!soloLetras(paisOrigen)) {
        errores["vehiculo.pais_origen"] = "El país de origen solo debe contener letras.";
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
          errores["vehiculo.anio"] = `El año debe estar entre 1950 y ${anioActual + 1}.`;
        }
      }

      if (color && !soloLetras(color)) {
        errores["vehiculo.color"] = "El color solo debe contener letras.";
      }

      if (chasis && chasis.length < 5) {
        errores["vehiculo.chasis"] = "El número de chasis debe tener al menos 5 caracteres.";
      }

      if (motor && motor.length < 3) {
        errores["vehiculo.motor"] = "El número de motor debe tener al menos 3 caracteres.";
      }
    } else if (observacionPasajero.length > 300) {
      errores["vehiculo.observacion_pasajero"] = "La observación de pasajero no puede superar los 300 caracteres.";
    }

    (form.menores || []).forEach((menor, index) => {
      const nombreMenor = menor.nombre.trim();
      const apellidoMenor = menor.apellido.trim();
      const documentoMenor = menor.documento_numero.trim();
      const nacionalidadMenor = menor.nacionalidad.trim();
      const nacionalidadOtroMenor = (menor.nacionalidad_otro || "").trim();
      const parentescoMenor = menor.parentesco.trim();
      const autorizacionMenor = menor.autorizacion_viaje.trim();
      const observacionesMenor = menor.observaciones.trim();

      if (!nombreMenor) {
        errores[`menores.${index}.nombre`] = "El nombre del menor es obligatorio.";
      } else if (nombreMenor.length < 2) {
        errores[`menores.${index}.nombre`] = "El nombre debe tener al menos 2 caracteres.";
      } else if (!soloLetras(nombreMenor)) {
        errores[`menores.${index}.nombre`] = "El nombre solo debe contener letras.";
      }

      if (!apellidoMenor) {
        errores[`menores.${index}.apellido`] = "El apellido del menor es obligatorio.";
      } else if (apellidoMenor.length < 2) {
        errores[`menores.${index}.apellido`] = "El apellido debe tener al menos 2 caracteres.";
      } else if (!soloLetras(apellidoMenor)) {
        errores[`menores.${index}.apellido`] = "El apellido solo debe contener letras.";
      }

      const errorDocumentoMenor = validarDocumentoPorTipo(menor.documento_tipo, documentoMenor, "documento del menor");

      if (errorDocumentoMenor) {
        errores[`menores.${index}.documento_numero`] = errorDocumentoMenor;
      }

      if (!nacionalidadMenor) {
        errores[`menores.${index}.nacionalidad`] = "La nacionalidad del menor es obligatoria.";
      } else if (nacionalidadMenor === "Otra") {
        if (!nacionalidadOtroMenor) {
          errores[`menores.${index}.nacionalidad_otro`] = "Debes indicar la nacionalidad del menor.";
        } else if (nacionalidadOtroMenor.length < 3) {
          errores[`menores.${index}.nacionalidad_otro`] = "La nacionalidad debe tener al menos 3 caracteres.";
        } else if (!soloLetras(nacionalidadOtroMenor)) {
          errores[`menores.${index}.nacionalidad_otro`] = "La nacionalidad no debe contener números ni caracteres especiales.";
        }
      } else if (!soloLetras(nacionalidadMenor)) {
        errores[`menores.${index}.nacionalidad`] = "La nacionalidad solo debe contener letras.";
      }

      const errorFechaMenor = validarFechaNacimientoMenor(menor.fecha_nacimiento);

      if (errorFechaMenor) {
        errores[`menores.${index}.fecha_nacimiento`] = errorFechaMenor;
      }

      if (!parentescoMenor) {
        errores[`menores.${index}.parentesco`] = "El parentesco o relación es obligatorio.";
      }

      if (!autorizacionMenor) {
        errores[`menores.${index}.autorizacion_viaje`] = "Debes indicar la autorización o documento de viaje.";
      }

      if (observacionesMenor.length > 300) {
        errores[`menores.${index}.observaciones`] = "Las observaciones del menor no pueden superar los 300 caracteres.";
      }
    });

    if (!form.motivo_viaje) {
      errores["motivo_viaje"] = "El motivo del viaje es obligatorio.";
    }

    if (form.motivo_viaje === "Otro" && !form.motivo_viaje_otro.trim()) {
      errores["motivo_viaje_otro"] = "Debes especificar el motivo del viaje.";
    } else if (form.motivo_viaje === "Otro" && form.motivo_viaje_otro.trim().length < 3) {
      errores["motivo_viaje_otro"] = "El motivo personalizado debe tener al menos 3 caracteres.";
    }

    if (!destino) {
      errores["destino"] = "El destino es obligatorio.";
    } else if (destino.length < 3) {
      errores["destino"] = "El destino debe tener al menos 3 caracteres.";
    }

    if (observaciones.length > 300) {
      errores["declaracion.observaciones"] = "Las observaciones no pueden superar los 300 caracteres.";
    }

    setCamposFaltantes(errores);

    if (Object.keys(errores).length > 0) {
      abrirSeccionesConErrores(errores);

      setMensaje({
        tipo: "error",
        texto: "Faltan datos obligatorios o existen campos con formato incorrecto. Revisa los campos marcados en rojo.",
      });

      return false;
    }

    return true;
  };

  const prepararVehiculoParaEnvio = () => {
    const rolViajero = form.vehiculo.rol_viajero || "CHOFER";

    if (rolViajero === "PASAJERO") {
      return {
        rol_viajero: "PASAJERO",
        condicion_viajero: "Acompañante / Pasajero",
        tipo: "Pasajero",
        patente: "",
        pais_origen: "",
        marca: "",
        modelo: "",
        anio: "",
        color: "",
        chasis: "",
        motor: "",
        observacion_pasajero:
          form.vehiculo.observacion_pasajero.trim() ||
          "La persona indicó que viaja como acompañante o pasajero.",
      };
    }

    return {
      ...form.vehiculo,
      rol_viajero: "CHOFER",
      condicion_viajero: "Chofer / Conductor",
      observacion_pasajero: "",
      tipo: form.vehiculo.tipo,
      patente: form.vehiculo.patente.trim().toUpperCase(),
      pais_origen: form.vehiculo.pais_origen.trim(),
      marca: form.vehiculo.marca.trim(),
      modelo: form.vehiculo.modelo.trim(),
      anio: form.vehiculo.anio.toString().trim(),
      color: form.vehiculo.color.trim(),
      chasis: form.vehiculo.chasis.trim(),
      motor: form.vehiculo.motor.trim(),
    };
  };

  const prepararPersonaParaEnvio = () => {
    const nacionalidadFinal =
      form.persona.nacionalidad === "Otra"
        ? form.persona.nacionalidad_otro.trim()
        : form.persona.nacionalidad.trim();

    return {
      ...form.persona,
      nombre: form.persona.nombre.trim(),
      apellido: form.persona.apellido.trim(),
      documento_numero: form.persona.documento_numero.trim(),
      nacionalidad: nacionalidadFinal,
      telefono: `${form.persona.prefijo_telefono} ${form.persona.telefono.trim()}`.trim(),
      email: form.persona.email.trim(),
    };
  };

  const prepararMenoresParaEnvio = () => {
    return (form.menores || []).map((menor) => ({
      nombre: menor.nombre.trim(),
      apellido: menor.apellido.trim(),
      documento_tipo: menor.documento_tipo,
      documento_numero: menor.documento_numero.trim(),
      nacionalidad:
        menor.nacionalidad === "Otra"
          ? (menor.nacionalidad_otro || "").trim()
          : menor.nacionalidad.trim(),
      fecha_nacimiento: menor.fecha_nacimiento,
      parentesco: menor.parentesco,
      autorizacion_viaje: menor.autorizacion_viaje,
      observaciones: menor.observaciones.trim(),
    }));
  };

  const cargarEscenario = (escenario) => {
    if (!escenario) return;

    const telefonoEscenario = separarTelefonoEscenario(escenario.data.persona?.telefono || "");
    const nacionalidadPersona = normalizarNacionalidadEscenario(escenario.data.persona?.nacionalidad || "Chilena");

    const menoresEscenario = (escenario.data.menores || []).map((menor) => {
      const nacionalidadMenor = normalizarNacionalidadEscenario(menor.nacionalidad || "Chilena");

      return {
        ...menorInicial,
        ...menor,
        ...nacionalidadMenor,
        documento_numero: formatearDocumentoPorTipo(menor.documento_tipo || "RUT", menor.documento_numero || ""),
      };
    });

    setForm({
      ...crearFormularioInicial(),
      ...escenario.data,
      persona: {
        ...crearFormularioInicial().persona,
        ...escenario.data.persona,
        ...nacionalidadPersona,
        documento_numero: formatearDocumentoPorTipo(
          escenario.data.persona?.documento_tipo || "RUT",
          escenario.data.persona?.documento_numero || ""
        ),
        prefijo_telefono: telefonoEscenario.prefijo_telefono,
        telefono: telefonoEscenario.telefono,
      },
      vehiculo: {
        ...crearFormularioInicial().vehiculo,
        ...(escenario.data.vehiculo || {}),
      },
      declaracion: {
        ...crearFormularioInicial().declaracion,
        ...(escenario.data.declaracion || {}),
      },
      menores: menoresEscenario,
      documentos: escenario.data.documentos || [],
      motivo_viaje_otro: escenario.data.motivo_viaje_otro || "",
      frontera: "Complejo Los Libertadores",
    });

    setCamposFaltantes({});
    setComprobante(null);
    setMensajeComprobante("");
    setSeccionesAbiertas({
      persona: true,
      menores: menoresEscenario.length > 0,
      vehiculo: true,
      documentos: (escenario.data.documentos || []).length > 0,
      viaje: true,
    });

    setMensaje({
      tipo: "ok",
      texto: `Escenario cargado: ${escenario.nombre}. Ahora puedes guardar el registro.`,
    });
  };

  const limpiarFormulario = () => {
    setForm(crearFormularioInicial());
    setCamposFaltantes({});
    setMensaje(null);
    setMensajeComprobante("");
    setSeccionesAbiertas({
      persona: true,
      menores: false,
      vehiculo: false,
      documentos: false,
      viaje: false,
    });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setComprobante(null);
    setMensajeComprobante("");

    const formularioValido = validarFormulario();

    if (!formularioValido) return;

    setCargando(true);

    try {
      const response = await api.post("/tramites", {
        ...form,
        persona: prepararPersonaParaEnvio(),
        vehiculo: prepararVehiculoParaEnvio(),
        frontera: "Complejo Los Libertadores",
        motivo_viaje:
          form.motivo_viaje === "Otro"
            ? form.motivo_viaje_otro.trim()
            : form.motivo_viaje,
        menores: prepararMenoresParaEnvio(),
        documentos: form.documentos || [],
      });

      const codigo = response.data?.codigo_tramite;

      setComprobante({
        id: response.data?.id,
        codigo,
        fecha: new Date().toLocaleString("es-CL"),
        menores_registrados: response.data?.menores_registrados || 0,
        documentos_registrados: response.data?.documentos_registrados || 0,
      });

      setMensaje(null);
      limpiarFormulario();
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

  const escaparHTML = (texto = "") => {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const copiarCodigoComprobante = async () => {
    if (!comprobante?.codigo) return;

    try {
      await navigator.clipboard.writeText(comprobante.codigo);
      setMensajeComprobante("Código copiado correctamente.");
    } catch (error) {
      const inputTemporal = document.createElement("textarea");
      inputTemporal.value = comprobante.codigo;
      document.body.appendChild(inputTemporal);
      inputTemporal.select();
      document.execCommand("copy");
      inputTemporal.remove();
      setMensajeComprobante("Código copiado correctamente.");
    }
  };

  const imprimirComprobante = () => {
    window.print();
  };

  const descargarComprobante = () => {
    if (!comprobante) return;

    const qrSvg = comprobanteRef.current?.querySelector(".qr-box svg")?.outerHTML || "";

    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Comprobante ${escaparHTML(comprobante.codigo)}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f1f5f9; padding: 30px; color: #0f172a; }
            .ticket { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #dbeafe; border-radius: 20px; padding: 28px; }
            .eyebrow { color: #1d4ed8; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; }
            h1 { margin: 10px 0; font-size: 34px; color: #0f172a; }
            p { line-height: 1.6; color: #334155; }
            .data { margin-top: 18px; display: grid; gap: 8px; }
            .data span { padding: 10px 12px; border-radius: 12px; background: #eff6ff; color: #1e3a8a; font-weight: 700; }
            .qr { margin-top: 24px; padding: 20px; border-radius: 18px; background: #f8fafc; display: inline-block; }
          </style>
        </head>
        <body>
          <main class="ticket">
            <div class="eyebrow">Comprobante digital</div>
            <h1>${escaparHTML(comprobante.codigo)}</h1>
            <p>Guarda este código. Aduana podrá usarlo para revisar tu trámite registrado.</p>
            <div class="data">
              <span>Fecha: ${escaparHTML(comprobante.fecha)}</span>
              <span>Estado: En revisión aduanera</span>
              <span>Menores registrados: ${escaparHTML(comprobante.menores_registrados || 0)}</span>
              <span>Documentos registrados: ${escaparHTML(comprobante.documentos_registrados || 0)}</span>
            </div>
            <div class="qr">${qrSvg}</div>
          </main>
        </body>
      </html>
    `;

    const blob = new Blob([contenido], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comprobante-${comprobante.codigo}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const volverAlFormulario = () => {
    setComprobante(null);
    setMensajeComprobante("");
    setMensaje(null);
  };

  const comprobanteDigital = (
    <section className="comprobante-only-page">
      <section className="qr-ticket-card printable-comprobante" ref={comprobanteRef}>
        <div className="qr-ticket-info">
          <p className="eyebrow">Comprobante digital</p>
          <h3>{comprobante?.codigo}</h3>
          <p>Guarda este código. Aduana podrá usarlo para revisar tu trámite registrado.</p>

          <div className="qr-ticket-data">
            <span>Fecha: {comprobante?.fecha}</span>
            <span>Estado: En revisión aduanera</span>
            <span>Menores registrados: {comprobante?.menores_registrados || 0}</span>
            <span>Documentos registrados: {comprobante?.documentos_registrados || 0}</span>
          </div>
        </div>

        <div className="qr-box">
          <QRCodeSVG value={comprobante?.codigo || ""} size={150} level="H" includeMargin />
        </div>
      </section>

      {mensajeComprobante && (
        <div className="comprobante-feedback">
          <CheckCircle2 size={18} />
          {mensajeComprobante}
        </div>
      )}

      <div className="comprobante-actions">
        <button type="button" className="comprobante-action-btn" onClick={copiarCodigoComprobante}>
          <Copy size={18} />
          Copiar código
        </button>

        <button type="button" className="comprobante-action-btn" onClick={imprimirComprobante}>
          <Printer size={18} />
          Imprimir
        </button>

        <button type="button" className="comprobante-action-btn" onClick={descargarComprobante}>
          <Download size={18} />
          Descargar
        </button>

        <button type="button" className="comprobante-action-btn comprobante-back-btn" onClick={volverAlFormulario}>
          <ArrowLeft size={18} />
          Volver al formulario
        </button>
      </div>
    </section>
  );

  const formularioRegistro = (
    <form className="form-page" onSubmit={enviar} noValidate>
      <div className="required-help-text">
        Los campos marcados con <span className="required-star">*</span> son obligatorios.
      </div>

      <SeccionDesplegable
        id="persona"
        className="person-form-section"
        titulo="Datos de la persona"
        icono={<ClipboardList size={22} />}
        abierto={seccionesAbiertas.persona}
        onToggle={toggleSeccion}
      >
        <div className="form-grid">
          <label>
            <EtiquetaCampo requerido>Nombre</EtiquetaCampo>
            <input
              className={marcarCampo("persona.nombre")}
              value={form.persona.nombre}
              onChange={(e) => cambiar("persona", "nombre", limpiarTextoSoloLetras(e.target.value))}
              placeholder="Ej: Carlos"
            />
            {mostrarError("persona.nombre")}
          </label>

          <label>
            <EtiquetaCampo requerido>Apellido</EtiquetaCampo>
            <input
              className={marcarCampo("persona.apellido")}
              value={form.persona.apellido}
              onChange={(e) => cambiar("persona", "apellido", limpiarTextoSoloLetras(e.target.value))}
              placeholder="Ej: Soto"
            />
            {mostrarError("persona.apellido")}
          </label>

          <label>
            <EtiquetaCampo requerido>Tipo de documento</EtiquetaCampo>
            <select value={form.persona.documento_tipo} onChange={(e) => cambiarTipoDocumentoPersona(e.target.value)}>
              <option value="RUT">RUT</option>
              <option value="DNI">DNI</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </label>

          <label>
            <EtiquetaCampo requerido>Número de documento</EtiquetaCampo>
            <input
              className={marcarCampo("persona.documento_numero")}
              value={form.persona.documento_numero}
              onChange={(e) => cambiarDocumentoPersona(e.target.value)}
              placeholder={obtenerPlaceholderDocumento(form.persona.documento_tipo)}
            />
            {mostrarError("persona.documento_numero")}
          </label>

          <label>
            <EtiquetaCampo requerido>Nacionalidad</EtiquetaCampo>
            <select
              className={marcarCampo("persona.nacionalidad")}
              value={form.persona.nacionalidad}
              onChange={(e) => cambiar("persona", "nacionalidad", e.target.value)}
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
            <label>
              <EtiquetaCampo requerido>Indique nacionalidad</EtiquetaCampo>
              <input
                className={marcarCampo("persona.nacionalidad_otro")}
                value={form.persona.nacionalidad_otro}
                onChange={(e) => cambiar("persona", "nacionalidad_otro", limpiarTextoSoloLetras(e.target.value))}
                placeholder="Ej: Cubana"
              />
              {mostrarError("persona.nacionalidad_otro")}
            </label>
          )}

          <label>
            <EtiquetaCampo requerido>Fecha de nacimiento</EtiquetaCampo>
            <DatePicker
              selected={convertirFechaParaInput(form.persona.fecha_nacimiento)}
              onChange={(fecha) => cambiar("persona", "fecha_nacimiento", convertirFechaParaBD(fecha))}
              dateFormat="dd/MM/yyyy"
              locale={es}
              placeholderText="dd/mm/aaaa"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              maxDate={new Date()}
              className={`date-picker-input ${marcarCampo("persona.fecha_nacimiento")}`}
              calendarClassName="aduanas-calendar"
            />
            {mostrarError("persona.fecha_nacimiento")}
          </label>

          <label>
            <EtiquetaCampo requerido>Teléfono</EtiquetaCampo>
            <div className="phone-row">
              <select
                value={form.persona.prefijo_telefono}
                onChange={(e) => cambiar("persona", "prefijo_telefono", e.target.value)}
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
                onChange={(e) => cambiar("persona", "telefono", e.target.value.replace(/[^0-9\s-]/g, ""))}
                placeholder="Ej: 9 1234 5678"
              />
            </div>
            {mostrarError("persona.telefono")}
          </label>

          <label>
            <EtiquetaCampo requerido>Email</EtiquetaCampo>
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
      </SeccionDesplegable>

      <SeccionDesplegable
        id="menores"
        className="minors-form-section"
        titulo="Menores acompañantes"
        descripcion="Si viajas con menores de edad, agrégalos al mismo trámite para que Aduanas pueda revisarlos junto al adulto responsable."
        icono={<Users size={22} />}
        abierto={seccionesAbiertas.menores}
        onToggle={toggleSeccion}
      >
        {(form.menores || []).length === 0 ? (
          <div className="minor-empty-register">
            <p>No has agregado menores acompañantes.</p>
            <button type="button" className="secondary-action-btn" onClick={agregarMenor}>
              <Plus size={17} />
              Agregar menor acompañante
            </button>
          </div>
        ) : (
          <div className="minors-register-list">
            {(form.menores || []).map((menor, index) => (
              <article className="minor-register-card" key={index}>
                <div className="minor-register-header">
                  <div>
                    <span>Menor {index + 1}</span>
                    <strong>
                      {menor.nombre || "Nuevo menor"} {menor.apellido}
                    </strong>
                  </div>

                  <button type="button" className="remove-minor-btn" onClick={() => eliminarMenor(index)}>
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>

                <div className="form-grid">
                  <label>
                    <EtiquetaCampo requerido>Nombre del menor</EtiquetaCampo>
                    <input
                      className={marcarCampo(`menores.${index}.nombre`)}
                      value={menor.nombre}
                      onChange={(e) => cambiarMenor(index, "nombre", limpiarTextoSoloLetras(e.target.value))}
                      placeholder="Ej: Sofía"
                    />
                    {mostrarError(`menores.${index}.nombre`)}
                  </label>

                  <label>
                    <EtiquetaCampo requerido>Apellido del menor</EtiquetaCampo>
                    <input
                      className={marcarCampo(`menores.${index}.apellido`)}
                      value={menor.apellido}
                      onChange={(e) => cambiarMenor(index, "apellido", limpiarTextoSoloLetras(e.target.value))}
                      placeholder="Ej: González"
                    />
                    {mostrarError(`menores.${index}.apellido`)}
                  </label>

                  <label>
                    <EtiquetaCampo requerido>Tipo de documento</EtiquetaCampo>
                    <select value={menor.documento_tipo} onChange={(e) => cambiarTipoDocumentoMenor(index, e.target.value)}>
                      <option value="RUT">RUT</option>
                      <option value="DNI">DNI</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </label>

                  <label>
                    <EtiquetaCampo requerido>Número de documento</EtiquetaCampo>
                    <input
                      className={marcarCampo(`menores.${index}.documento_numero`)}
                      value={menor.documento_numero}
                      onChange={(e) => cambiarDocumentoMenor(index, e.target.value)}
                      placeholder={obtenerPlaceholderDocumento(menor.documento_tipo)}
                    />
                    {mostrarError(`menores.${index}.documento_numero`)}
                  </label>

                  <label>
                    <EtiquetaCampo requerido>Nacionalidad</EtiquetaCampo>
                    <select
                      className={marcarCampo(`menores.${index}.nacionalidad`)}
                      value={menor.nacionalidad}
                      onChange={(e) => cambiarMenor(index, "nacionalidad", e.target.value)}
                    >
                      {nacionalidades.map((nacionalidad) => (
                        <option key={nacionalidad} value={nacionalidad}>
                          {nacionalidad}
                        </option>
                      ))}
                    </select>
                    {mostrarError(`menores.${index}.nacionalidad`)}
                  </label>

                  {menor.nacionalidad === "Otra" && (
                    <label>
                      <EtiquetaCampo requerido>Indique nacionalidad</EtiquetaCampo>
                      <input
                        className={marcarCampo(`menores.${index}.nacionalidad_otro`)}
                        value={menor.nacionalidad_otro || ""}
                        onChange={(e) => cambiarMenor(index, "nacionalidad_otro", limpiarTextoSoloLetras(e.target.value))}
                        placeholder="Ej: Cubana"
                      />
                      {mostrarError(`menores.${index}.nacionalidad_otro`)}
                    </label>
                  )}

                  <label>
                    <EtiquetaCampo requerido>Fecha de nacimiento</EtiquetaCampo>
                    <DatePicker
                      selected={convertirFechaParaInput(menor.fecha_nacimiento)}
                      onChange={(fecha) => cambiarMenor(index, "fecha_nacimiento", convertirFechaParaBD(fecha))}
                      dateFormat="dd/MM/yyyy"
                      locale={es}
                      placeholderText="dd/mm/aaaa"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      maxDate={new Date()}
                      className={`date-picker-input ${marcarCampo(`menores.${index}.fecha_nacimiento`)}`}
                      calendarClassName="aduanas-calendar"
                    />
                    {mostrarError(`menores.${index}.fecha_nacimiento`)}
                  </label>

                  <label>
                    <EtiquetaCampo requerido>Parentesco o relación</EtiquetaCampo>
                    <select
                      className={marcarCampo(`menores.${index}.parentesco`)}
                      value={menor.parentesco}
                      onChange={(e) => cambiarMenor(index, "parentesco", e.target.value)}
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
                    <EtiquetaCampo requerido>Autorización o documento de viaje</EtiquetaCampo>
                    <select
                      className={marcarCampo(`menores.${index}.autorizacion_viaje`)}
                      value={menor.autorizacion_viaje}
                      onChange={(e) => cambiarMenor(index, "autorizacion_viaje", e.target.value)}
                    >
                      <option value="Presenta autorización de viaje">Presenta autorización de viaje</option>
                      <option value="Viaja con ambos padres">Viaja con ambos padres</option>
                      <option value="Documento pendiente de revisión">Documento pendiente de revisión</option>
                      <option value="No aplica">No aplica</option>
                    </select>
                    {mostrarError(`menores.${index}.autorizacion_viaje`)}
                  </label>

                  <label className="minor-observations-field">
                    <EtiquetaCampo>Observaciones del menor</EtiquetaCampo>
                    <textarea
                      className={marcarCampo(`menores.${index}.observaciones`)}
                      placeholder="Opcional"
                      value={menor.observaciones}
                      onChange={(e) => cambiarMenor(index, "observaciones", e.target.value)}
                      maxLength={300}
                    />
                    {mostrarError(`menores.${index}.observaciones`)}
                  </label>
                </div>
              </article>
            ))}

            <button type="button" className="secondary-action-btn" onClick={agregarMenor}>
              <Plus size={17} />
              Agregar otro menor
            </button>
          </div>
        )}
      </SeccionDesplegable>

      <SeccionDesplegable
        id="vehiculo"
        className="vehicle-form-section"
        titulo="Datos del vehículo"
        descripcion="Indica si eres chofer o pasajero para mostrar solo los datos necesarios."
        icono={<ClipboardList size={22} />}
        abierto={seccionesAbiertas.vehiculo}
        onToggle={toggleSeccion}
      >
        <div className="vehicle-role-box">
          <label className="vehicle-role-field">
            <EtiquetaCampo requerido>Rol en el vehículo</EtiquetaCampo>
            <select
              className={marcarCampo("vehiculo.rol_viajero")}
              value={form.vehiculo.rol_viajero}
              onChange={(e) => cambiarRolVehiculo(e.target.value)}
            >
              <option value="CHOFER">Chofer / Conductor</option>
              <option value="PASAJERO">Acompañante / Pasajero</option>
            </select>
            {mostrarError("vehiculo.rol_viajero")}
          </label>

          <div className="vehicle-role-help">
            {form.vehiculo.rol_viajero === "CHOFER" ? (
              <p>
                Como chofer debes registrar los datos principales del vehículo que cruzará la frontera.
              </p>
            ) : (
              <p>
                Como acompañante o pasajero no necesitas completar todos los datos del vehículo.
                El trámite quedará registrado indicando tu condición de viaje.
              </p>
            )}
          </div>
        </div>

        {form.vehiculo.rol_viajero === "CHOFER" ? (
          <div className="form-grid">
            <label>
              <EtiquetaCampo requerido>Tipo de vehículo</EtiquetaCampo>
              <select value={form.vehiculo.tipo} onChange={(e) => cambiar("vehiculo", "tipo", e.target.value)}>
                <option value="Particular">Particular</option>
                <option value="Carga">Carga</option>
                <option value="Bus">Bus</option>
                <option value="Moto">Moto</option>
              </select>
            </label>

            <label>
              <EtiquetaCampo requerido>Patente</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.patente")}
                value={form.vehiculo.patente}
                onChange={(e) => cambiar("vehiculo", "patente", e.target.value.toUpperCase())}
                placeholder="Ej: AB1234"
              />
              {mostrarError("vehiculo.patente")}
            </label>

            <label>
              <EtiquetaCampo requerido>País de origen</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.pais_origen")}
                value={form.vehiculo.pais_origen}
                onChange={(e) => cambiar("vehiculo", "pais_origen", limpiarTextoSoloLetras(e.target.value))}
                placeholder="Ej: Chile"
              />
              {mostrarError("vehiculo.pais_origen")}
            </label>

            <label>
              <EtiquetaCampo requerido>Marca</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.marca")}
                value={form.vehiculo.marca}
                onChange={(e) => cambiar("vehiculo", "marca", e.target.value)}
                placeholder="Ej: Toyota"
              />
              {mostrarError("vehiculo.marca")}
            </label>

            <label>
              <EtiquetaCampo requerido>Modelo</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.modelo")}
                value={form.vehiculo.modelo}
                onChange={(e) => cambiar("vehiculo", "modelo", e.target.value)}
                placeholder="Ej: Yaris"
              />
              {mostrarError("vehiculo.modelo")}
            </label>

            <label>
              <EtiquetaCampo>Año</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.anio")}
                type="number"
                min="1950"
                max="2030"
                value={form.vehiculo.anio}
                onChange={(e) => cambiar("vehiculo", "anio", e.target.value)}
                placeholder="Opcional"
              />
              {mostrarError("vehiculo.anio")}
            </label>

            <label>
              <EtiquetaCampo>Color</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.color")}
                value={form.vehiculo.color}
                onChange={(e) => cambiar("vehiculo", "color", limpiarTextoSoloLetras(e.target.value))}
                placeholder="Opcional"
              />
              {mostrarError("vehiculo.color")}
            </label>

            <label>
              <EtiquetaCampo>Número de chasis</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.chasis")}
                value={form.vehiculo.chasis}
                onChange={(e) => cambiar("vehiculo", "chasis", e.target.value)}
                placeholder="Opcional"
              />
              {mostrarError("vehiculo.chasis")}
            </label>

            <label>
              <EtiquetaCampo>Número de motor</EtiquetaCampo>
              <input
                className={marcarCampo("vehiculo.motor")}
                value={form.vehiculo.motor}
                onChange={(e) => cambiar("vehiculo", "motor", e.target.value)}
                placeholder="Opcional"
              />
              {mostrarError("vehiculo.motor")}
            </label>
          </div>
        ) : (
          <div className="passenger-vehicle-box">
            <div className="passenger-vehicle-notice">
              <Users size={22} />
              <div>
                <strong>Viajas como acompañante o pasajero</strong>
                <p>
                  En este caso el sistema no solicitará los datos completos del vehículo.
                  Esta información quedará visible para revisión de Aduanas.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                <EtiquetaCampo requerido>Condición de viaje</EtiquetaCampo>
                <input
                  value="Acompañante / Pasajero"
                  readOnly
                  className="readonly-input"
                />
              </label>

              <label className="full-width-label">
                <EtiquetaCampo>Observación del viaje</EtiquetaCampo>
                <textarea
                  className={marcarCampo("vehiculo.observacion_pasajero")}
                  value={form.vehiculo.observacion_pasajero}
                  onChange={(e) => cambiar("vehiculo", "observacion_pasajero", e.target.value)}
                  placeholder="Opcional. Ej: viajo como acompañante en vehículo familiar."
                  maxLength={300}
                />
                {mostrarError("vehiculo.observacion_pasajero")}
              </label>
            </div>
          </div>
        )}
      </SeccionDesplegable>

      <SeccionDesplegable
        id="documentos"
        className="documents-form-section"
        titulo="Documentos adjuntos"
        descripcion="Adjunta autorizaciones notariales, certificados o documentos que puedan ser solicitados durante el control aduanero."
        icono={<FileText size={22} />}
        abierto={seccionesAbiertas.documentos}
        onToggle={toggleSeccion}
      >
        <div className="documents-upload-panel">
          <div className="form-grid">
            <label>
              <EtiquetaCampo>Tipo de documento</EtiquetaCampo>
              <select value={tipoDocumentoAdjunto} onChange={(e) => setTipoDocumentoAdjunto(e.target.value)}>
                {tiposDocumentosAdjuntos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <EtiquetaCampo>Observaciones del documento</EtiquetaCampo>
              <input
                value={observacionDocumentoAdjunto}
                onChange={(e) => setObservacionDocumentoAdjunto(e.target.value)}
                placeholder="Opcional"
                maxLength={300}
              />
            </label>
          </div>

          <div className="file-upload-box">
            <input
              ref={archivoInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={agregarDocumentoAdjunto}
              disabled={procesandoDocumento}
            />

            <div>
              <Paperclip size={22} />
              <strong>Selecciona un archivo</strong>
              <span>PDF, JPG, JPEG o PNG · Máximo 2 MB por archivo</span>
            </div>
          </div>

          {mostrarError("documentos")}

          {procesandoDocumento && <div className="document-upload-message">Cargando documento...</div>}
        </div>

        {(form.documentos || []).length > 0 ? (
          <div className="documents-list">
            {(form.documentos || []).map((documento, index) => (
              <article className="document-card" key={`${documento.nombre_archivo}-${index}`}>
                <div className="document-card-info">
                  <FileText size={20} />
                  <div>
                    <strong>{documento.tipo_documento}</strong>
                    <span>{documento.nombre_archivo}</span>
                    <small>
                      {documento.mime_type} · {formatearTamanoArchivo(documento.tamano)}
                    </small>
                    {documento.observaciones && <p>{documento.observaciones}</p>}
                  </div>
                </div>

                <button type="button" className="remove-document-btn" onClick={() => eliminarDocumentoAdjunto(index)}>
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="documents-empty-box">
            No has adjuntado documentos. Puedes continuar sin archivos si no corresponde.
          </div>
        )}
      </SeccionDesplegable>

      <SeccionDesplegable
        id="viaje"
        className="travel-form-section"
        titulo="Declaración y viaje"
        icono={<ShieldCheck size={22} />}
        abierto={seccionesAbiertas.viaje}
        onToggle={toggleSeccion}
      >
        <div className="form-grid">
          <label>
            <EtiquetaCampo requerido>Motivo del viaje</EtiquetaCampo>
            <select className={marcarCampo("motivo_viaje")} value={form.motivo_viaje} onChange={(e) => cambiarMotivoViaje(e.target.value)}>
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
              <EtiquetaCampo requerido>Especifique el motivo del viaje</EtiquetaCampo>
              <input
                type="text"
                placeholder="Ej: visita familiar, estudio, trámite personal"
                value={form.motivo_viaje_otro}
                onChange={(e) => cambiarSimple("motivo_viaje_otro", e.target.value)}
                className={marcarCampo("motivo_viaje_otro")}
              />
              {mostrarError("motivo_viaje_otro")}
            </label>
          )}

          <label>
            <EtiquetaCampo requerido>Destino</EtiquetaCampo>
            <input
              className={marcarCampo("destino")}
              value={form.destino}
              onChange={(e) => cambiarSimple("destino", limpiarTextoSoloLetras(e.target.value))}
              placeholder="Ej: Argentina"
            />
            {mostrarError("destino")}
          </label>

          <label>
            <EtiquetaCampo requerido>Frontera</EtiquetaCampo>
            <input value="Complejo Los Libertadores" readOnly className="readonly-input" />
          </label>
        </div>

        <div className="checkbox-grid">
          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_alimentos}
              onChange={(e) => cambiar("declaracion", "transporta_alimentos", e.target.checked)}
            />
            Transporta alimentos
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_vegetales}
              onChange={(e) => cambiar("declaracion", "transporta_vegetales", e.target.checked)}
            />
            Transporta vegetales
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.transporta_animales}
              onChange={(e) => cambiar("declaracion", "transporta_animales", e.target.checked)}
            />
            Transporta animales
          </label>

          <label className="checkbox-card">
            <input
              type="checkbox"
              checked={form.declaracion.dinero_mayor_declarable}
              onChange={(e) => cambiar("declaracion", "dinero_mayor_declarable", e.target.checked)}
            />
            Dinero o valores declarables
          </label>
        </div>

        <label className="full-width-label">
          <EtiquetaCampo>Observaciones adicionales</EtiquetaCampo>
          <textarea
            className={marcarCampo("declaracion.observaciones")}
            placeholder="Opcional"
            value={form.declaracion.observaciones}
            onChange={(e) => cambiar("declaracion", "observaciones", e.target.value)}
            maxLength={300}
          />
          {mostrarError("declaracion.observaciones")}
        </label>
      </SeccionDesplegable>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === "ok" ? "alert-success" : "alert-error"}`}>
          {mensaje.texto}
        </div>
      )}

      <button className="primary-btn submit-btn" disabled={cargando} type="submit">
        <CheckCircle2 size={19} />
        {cargando ? "Guardando..." : "Guardar registro de paso"}
      </button>
    </form>
  );

  const contenidoFormulario = comprobante ? comprobanteDigital : formularioRegistro;

  if (publico) {
    return (
      <main className={`public-register-page ${modoOscuro ? "dark-register" : ""}`}>
        <header className="public-register-header">
          <div>
            <p className="eyebrow">Sistema Integrado de Gestión Aduanera</p>
            <h1>Registro de paso fronterizo</h1>
            <p>
              Completa tus datos personales, información del vehículo, menores acompañantes,
              documentos adjuntos si corresponde y declaración jurada para que Aduanas pueda revisar tu solicitud.
            </p>
          </div>

          <div className="public-header-actions">
            <button type="button" className="theme-toggle-btn" onClick={cambiarModo}>
              {modoOscuro ? <Sun size={14} /> : <Moon size={14} />}
              {modoOscuro ? "Modo claro" : "Modo oscuro"}
            </button>
          </div>

            
        </header>

        {!comprobante && (
          <section className="testing-tools-card">
            <div>
              <p className="eyebrow">Herramientas de prueba</p>
              <h2>Escenarios rápidos</h2>
              <p>Carga datos automáticamente para probar distintos casos de validación aduanera.</p>
            </div>

            <div className="testing-tools-actions">
              <select
                defaultValue=""
                onChange={(e) => {
                  const escenario = escenariosPrueba.find((item) => item.nombre === e.target.value);
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
        )}

        {contenidoFormulario}
      </main>
    );
  }

  return (
    <Layout
      titulo="Nuevo trámite fronterizo"
      subtitulo="Formulario para registrar persona, vehículo, menores acompañantes, documentos adjuntos y declaración jurada digital."
    >
      {contenidoFormulario}
    </Layout>
  );
}

export default RegistroPaso;
