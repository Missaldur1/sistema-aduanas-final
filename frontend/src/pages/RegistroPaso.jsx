import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Moon, ShieldCheck, Sun } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { escenariosPrueba } from "../utils/escenariosPrueba";

function RegistroPaso({ publico = false }) {
  useEffect(() => {
    if (publico) {
      document.title = "Aduanas Chile - Registro";
    }
  }, [publico]);

  const [modoOscuro, setModoOscuro] = useState(() => {
      return localStorage.getItem("modoRegistro") === "oscuro";
  });

  const cambiarModo = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem("modoRegistro", nuevoModo ? "oscuro" : "claro");
  };

  const [form, setForm] = useState({
    persona: {
      nombre: "",
      apellido: "",
      documento_tipo: "RUT",
      documento_numero: "",
      nacionalidad: "",
      fecha_nacimiento: "",
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
  });

  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [camposFaltantes, setCamposFaltantes] = useState({});

  const cambiar = (seccion, campo, valor) => {
    setForm({
      ...form,
      [seccion]: {
        ...form[seccion],
        [campo]: valor
      }
    });
  };

  const marcarCampo = (ruta) => {
  return camposFaltantes[ruta] ? "input-error" : "";
};

const validarFormulario = () => {
  const errores = {};

  if (!form.persona.nombre.trim()) {
    errores["persona.nombre"] = "El nombre es obligatorio.";
  }

  if (!form.persona.apellido.trim()) {
    errores["persona.apellido"] = "El apellido es obligatorio.";
  }

  if (!form.persona.documento_numero.trim()) {
    errores["persona.documento_numero"] = "El número de documento es obligatorio.";
  }

  if (!form.persona.nacionalidad.trim()) {
    errores["persona.nacionalidad"] = "La nacionalidad es obligatoria.";
  }

  if (!form.persona.fecha_nacimiento) {
    errores["persona.fecha_nacimiento"] = "La fecha de nacimiento es obligatoria.";
  }

  if (!form.vehiculo.patente.trim()) {
    errores["vehiculo.patente"] = "La patente es obligatoria.";
  }

  if (!form.vehiculo.pais_origen.trim()) {
    errores["vehiculo.pais_origen"] = "El país de origen es obligatorio.";
  }

  if (!form.vehiculo.marca.trim()) {
    errores["vehiculo.marca"] = "La marca es obligatoria.";
  }

  if (!form.vehiculo.modelo.trim()) {
    errores["vehiculo.modelo"] = "El modelo es obligatorio.";
  }

  if (form.motivo_viaje === "Otro" && !form.motivo_viaje_otro.trim()) {
    errores["motivo_viaje_otro"] = "Debes especificar el motivo del viaje.";
  }

  if (!form.destino.trim()) {
    errores["destino"] = "El destino es obligatorio.";
  }

  setCamposFaltantes(errores);

  if (Object.keys(errores).length > 0) {
    setMensaje({
      tipo: "error",
      texto: "Faltan datos obligatorios. Revisa los campos marcados en rojo."
    });

    return false;
  }

  return true;
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

  const cambiarSimple = (campo, valor) => {
    setForm({
      ...form,
      [campo]: valor
    });
  };

  const cargarEscenario = (escenario) => {
    if (!escenario) return;

    setForm({
      ...escenario.data,
      frontera: "Complejo Los Libertadores"
    });

    setCamposFaltantes({});
    setComprobante(null);

    setMensaje({
      tipo: "ok",
      texto: `Escenario cargado: ${escenario.nombre}. Ahora puedes guardar el registro.`
    });
  };

  const limpiarRegistrosBD = async () => {
    const confirmar = window.confirm(
      "Esto eliminará personas, vehículos, trámites, declaraciones, alertas y validaciones. El usuario admin se mantiene. ¿Deseas continuar?"
    );

    if (!confirmar) return;

    try {
      await api.delete("/dev/limpiar-registros");

      setMensaje({
        tipo: "ok",
        texto: "Registros eliminados correctamente de la base de datos."
      });

      setComprobante(null);
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.mensaje || "No se pudieron eliminar los registros."
      });
    }
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

      const response = await api.post("/tramites", {
        ...form,
        motivo_viaje: motivoViajeFinal,
        frontera: "Complejo Los Libertadores"
      });

      const codigo = response.data?.codigo_tramite;

      setMensaje({
        tipo: "ok",
        texto: `${response.data?.mensaje || "Trámite registrado correctamente."} Código de trámite: ${codigo}. Guarda este código para consultar con Aduanas.`
      });

      setComprobante({
        id: response.data?.id,
        codigo,
        fecha: new Date().toLocaleString("es-CL")
      });


      setForm({
        persona: {
          nombre: "",
          apellido: "",
          documento_tipo: "RUT",
          documento_numero: "",
          nacionalidad: "",
          fecha_nacimiento: "",
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
      });
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: error.response?.data?.mensaje || "No se pudo registrar el trámite."
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
          </label>

          <label>
            Apellido
            <input
              className={marcarCampo("persona.apellido")}
              value={form.persona.apellido}
              onChange={(e) => cambiar("persona", "apellido", e.target.value)}
              placeholder="Ej: Soto"
            />
          </label>

          <label>
            Tipo de documento
            <select
              value={form.persona.documento_tipo}
              onChange={(e) => cambiar("persona", "documento_tipo", e.target.value)}
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
              onChange={(e) => cambiar("persona", "documento_numero", e.target.value)}
              placeholder="Ej: 12.345.678-9"
            />
          </label>

          <label>
            Nacionalidad
            <input
              className={marcarCampo("persona.nacionalidad")}
              value={form.persona.nacionalidad}
              onChange={(e) => cambiar("persona", "nacionalidad", e.target.value)}
              placeholder="Ej: Chilena"
            />
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
              className={`date-picker-input ${marcarCampo("persona.fecha_nacimiento")}`}
              calendarClassName="aduanas-calendar"
            />
          </label>

          <label>
            Teléfono
            <input
              value={form.persona.telefono}
              onChange={(e) => cambiar("persona", "telefono", e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.persona.email}
              onChange={(e) => cambiar("persona", "email", e.target.value)}
              placeholder="Ej: persona@mail.com"
            />
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
              onChange={(e) => cambiar("vehiculo", "patente", e.target.value.toUpperCase())}
              placeholder="Ej: AB1234"
            />
          </label>

          <label>
            País de origen
            <input
              className={marcarCampo("vehiculo.pais_origen")}
              value={form.vehiculo.pais_origen}
              onChange={(e) => cambiar("vehiculo", "pais_origen", e.target.value)}
              placeholder="Ej: Chile"
            />
          </label>

          <label>
            Marca
            <input
              className={marcarCampo("vehiculo.marca")}
              value={form.vehiculo.marca}
              onChange={(e) => cambiar("vehiculo", "marca", e.target.value)}
              placeholder="Ej: Toyota"
            />
          </label>

          <label>
            Modelo
            <input
              className={marcarCampo("vehiculo.modelo")}
              value={form.vehiculo.modelo}
              onChange={(e) => cambiar("vehiculo", "modelo", e.target.value)}
              placeholder="Ej: Yaris"
            />
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
              onChange={(e) => {
                cambiarSimple("motivo_viaje", e.target.value);
              
                if (e.target.value !== "Otro") {
                  cambiarSimple("motivo_viaje_otro", "");
                }
              }}
            >
              <option>Turismo</option>
              <option>Trabajo</option>
              <option>Comercio</option>
              <option>Residencia</option>
              <option>Otro</option>
            </select>
          </label>
            
          {form.motivo_viaje === "Otro" && (
            <label className="otro-motivo-field">
              Especifique el motivo del viaje
              <input
                type="text"
                placeholder="Ej: visita familiar, estudio, trámite personal"
                value={form.motivo_viaje_otro}
                onChange={(e) => cambiarSimple("motivo_viaje_otro", e.target.value)}
                className={marcarCampo("motivo_viaje_otro")}
              />
              {camposFaltantes["motivo_viaje_otro"] && (
                <small className="campo-error">
                  {camposFaltantes["motivo_viaje_otro"]}
                </small>
              )}
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

        <textarea
          placeholder="Observaciones adicionales"
          value={form.declaracion.observaciones}
          onChange={(e) => cambiar("declaracion", "observaciones", e.target.value)}
        />
      </section>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === "ok" ? "alert-success" : "alert-error"}`}>
          {mensaje.texto}
        </div>
      )}

      {comprobante && (
        <section className="qr-ticket-card">
          <div className="qr-ticket-info">
            <p className="eyebrow">Comprobante digital</p>
            <h3>{comprobante.codigo}</h3>
            <p>
              Guarda este código. Aduana podrá usarlo para revisar tu trámite registrado.
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
              Carga datos automáticamente para probar distintos casos de validación aduanera.
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