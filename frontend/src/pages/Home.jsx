import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  LockKeyhole,
  MapPin,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

function Home() {
  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem("modoHomeAduanas") === "oscuro";
  });

  useEffect(() => {
    document.title = "Aduanas Chile - Inicio";
  }, []);

  const cambiarModo = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem("modoHomeAduanas", nuevoModo ? "oscuro" : "claro");
  };

  return (
    <main className={`home-page ${modoOscuro ? "dark-home" : ""}`}>
      <section className="home-hero">
        <nav className="home-navbar">
          <div className="home-brand">
            <div className="home-brand-logo">
              <img src="/AduanasChile.webp" alt="Logo Aduanas Chile" />
            </div>
            <div>
              <strong>Aduanas Chile</strong>
              <span>Complejo Los Libertadores</span>
            </div>
          </div>

          <div className="home-nav-actions">
            <button type="button" className="home-theme-btn" onClick={cambiarModo}>
              {modoOscuro ? <Sun size={16} /> : <Moon size={16} />}
              {modoOscuro ? "Modo claro" : "Modo oscuro"}
            </button>

            <Link to="/registro" className="home-nav-link">
              Registro
            </Link>
            <Link to="/admin" className="home-nav-link admin-link">
              Admin
            </Link>
          </div>
        </nav>

        <div className="home-hero-content">
          <div className="home-hero-text">
            <p className="home-eyebrow">Sistema Integrado de Gestión Aduanera</p>
            <h1>Registro digital para paso fronterizo</h1>
            <p>
              Completa tu información antes de cruzar la frontera. Registra tus datos,
              vehículo, menores acompañantes, documentos y declaración jurada para facilitar
              la revisión de Aduanas.
            </p>

            <div className="home-main-actions">
              <Link to="/registro" className="home-primary-btn">
                Iniciar registro
                <ArrowRight size={18} />
              </Link>

              <Link to="/admin" className="home-secondary-btn">
                <LockKeyhole size={18} />
                Ingreso administrador
              </Link>
            </div>
          </div>

          <aside className="home-hero-card">
            <div className="home-card-header">
              <MapPin size={24} />
              <div>
                <strong>Complejo Los Libertadores</strong>
                <span>Control fronterizo y revisión documental</span>
              </div>
            </div>

            <div className="home-status-box">
              <CheckCircle2 size={20} />
              <div>
                <strong>Registro disponible</strong>
                <span>Formulario público habilitado para trámites de paso.</span>
              </div>
            </div>

            <div className="home-mini-list">
              <span>Registro de persona</span>
              <span>Datos de vehículo o condición de pasajero</span>
              <span>Menores acompañantes</span>
              <span>Documentos adjuntos</span>
              <span>Comprobante digital con QR</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-title">
          <p className="home-eyebrow">Información importante</p>
          <h2>Avisos y consejos antes de registrar tu viaje</h2>
          <p>
            Revisa estas recomendaciones para completar el formulario correctamente y evitar
            errores durante el proceso de revisión.
          </p>
        </div>

        <div className="home-info-grid">
          <article className="home-info-card">
            <div className="home-info-icon warning">
              <AlertTriangle size={22} />
            </div>
            <h3>Declaración de productos</h3>
            <p>
              Declara alimentos, vegetales, animales, dinero o valores cuando corresponda.
              Esto ayuda a que la revisión sea más clara para Aduanas.
            </p>
          </article>

          <article className="home-info-card">
            <div className="home-info-icon">
              <Users size={22} />
            </div>
            <h3>Viaje con menores</h3>
            <p>
              Si viajas con menores de edad, registra sus datos y adjunta documentos de
              autorización cuando sea necesario.
            </p>
          </article>

          <article className="home-info-card">
            <div className="home-info-icon">
              <Car size={22} />
            </div>
            <h3>Chofer o pasajero</h3>
            <p>
              Si eres chofer, debes registrar los datos del vehículo. Si viajas como pasajero,
              solo indica tu condición de viaje.
            </p>
          </article>

          <article className="home-info-card">
            <div className="home-info-icon">
              <FileText size={22} />
            </div>
            <h3>Documentos adjuntos</h3>
            <p>
              Puedes adjuntar documentos en PDF, JPG, JPEG o PNG. Usa archivos claros y
              legibles para facilitar la revisión.
            </p>
          </article>
        </div>
      </section>

      <section className="home-section home-split-section">
        <div className="home-panel">
          <div className="home-panel-title">
            <ClipboardCheck size={24} />
            <div>
              <h2>Antes de iniciar el registro</h2>
              <p>Ten a mano la información necesaria.</p>
            </div>
          </div>

          <ul className="home-check-list">
            <li>Documento de identidad o pasaporte.</li>
            <li>Correo electrónico y teléfono de contacto.</li>
            <li>Datos del vehículo si viajas como chofer.</li>
            <li>Datos de menores acompañantes si corresponde.</li>
            <li>Documentos de autorización o respaldo si corresponde.</li>
          </ul>
        </div>

        <div className="home-panel dark-panel">
          <div className="home-panel-title">
            <CalendarDays size={24} />
            <div>
              <h2>Consejo para el trámite</h2>
              <p>Completa el registro con calma y revisa los datos antes de guardar.</p>
            </div>
          </div>

          <p>
            Al finalizar, el sistema entregará un comprobante digital con código QR. Guarda ese
            código, ya que puede ser utilizado por Aduanas para consultar el trámite registrado.
          </p>

          <Link to="/registro" className="home-panel-btn">
            Ir al formulario
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="home-final-cta">
        <div>
          <p className="home-eyebrow">Accesos principales</p>
          <h2>Selecciona cómo deseas ingresar</h2>
          <p>
            Usa el registro público para crear un trámite o ingresa al panel si eres
            administrador de Aduanas.
          </p>
        </div>

        <div className="home-final-actions">
          <Link to="/registro" className="home-primary-btn">
            Registro público
            <ArrowRight size={18} />
          </Link>

          <Link to="/admin" className="home-secondary-btn light-secondary">
            <LockKeyhole size={18} />
            Ingreso Aduana
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <Info size={16} />
        <span>
          Prototipo académico del Sistema Integrado de Gestión Aduanera para el Complejo Los Libertadores.
        </span>
      </footer>
    </main>
  );
}

export default Home;
