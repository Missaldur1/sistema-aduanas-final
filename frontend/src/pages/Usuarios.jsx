import { useEffect, useState } from "react";
import { UserPlus, Users as UsersIcon } from "lucide-react";
import api from "../api/api";
import Layout from "../components/Layout";

const nuevoInicial = {
  nombre: "",
  usuario: "",
  password: "",
  rol: "ADMIN",
  institucion: "Aduanas Chile",
  documento: "",
  telefono: "",
  email: "",
};

function Usuarios() {
  useEffect(() => {
    document.title = "Aduanas Chile - Usuarios";
  }, []);

  const [usuarios, setUsuarios] = useState([]);
  const [nuevo, setNuevo] = useState(nuevoInicial);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await api.get("/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      setMensaje("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/usuarios", nuevo);

      setNuevo(nuevoInicial);
      setMensaje("Usuario creado correctamente");
      cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No se pudo crear el usuario");
    }
  };

  return (
    <Layout
      titulo="Gestión de usuarios"
      subtitulo="Administración de cuentas para funcionarios de Aduana."
    >
      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <section className="usuarios-page-grid">
        <article className="panel-card usuarios-form-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Nuevo acceso</p>
              <h2>Crear usuario</h2>
            </div>

            <UserPlus size={24} />
          </div>

          <form className="form-stack" onSubmit={crear}>
            <label>
              Nombre
              <input
                value={nuevo.nombre}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    nombre: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Usuario
              <input
                value={nuevo.usuario}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    usuario: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={nuevo.password}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    password: e.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Rol
              <select
                value={nuevo.rol}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    rol: e.target.value,
                    institucion: "Aduanas Chile",
                  })
                }
              >
                <option value="ADMIN">Administrador Aduana</option>
              </select>
            </label>

            <label>
              Email
              <input
                type="email"
                value={nuevo.email}
                onChange={(e) =>
                  setNuevo({
                    ...nuevo,
                    email: e.target.value,
                  })
                }
              />
            </label>

            <button className="primary-btn" type="submit">
              Crear usuario
            </button>
          </form>
        </article>

        <article className="panel-card usuarios-list-card">
          <div className="section-title usuarios-title">
            <div>
              <p className="eyebrow">Control de accesos</p>
              <h2>Usuarios registrados</h2>
            </div>

            <UsersIcon size={24} />
          </div>

          <div className="responsive-table usuarios-desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Institución</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.usuario}</td>
                    <td>{u.rol}</td>
                    <td>{u.institucion}</td>
                    <td>
                      <span
                        className={`user-status ${
                          u.activo ? "active" : "inactive"
                        }`}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}

                {!usuarios.length && !cargando && (
                  <tr>
                    <td colSpan="5">No hay usuarios registrados.</td>
                  </tr>
                )}

                {cargando && (
                  <tr>
                    <td colSpan="5">Cargando usuarios...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="usuarios-mobile-list">
            {usuarios.map((u) => (
              <article className="usuario-mobile-card" key={u.id}>
                <div className="usuario-mobile-top">
                  <div>
                    <span>Nombre</span>
                    <strong>{u.nombre}</strong>
                  </div>

                  <span
                    className={`user-status ${u.activo ? "active" : "inactive"}`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="usuario-mobile-info">
                  <div>
                    <span>Usuario</span>
                    <strong>{u.usuario}</strong>
                  </div>

                  <div>
                    <span>Rol</span>
                    <strong>{u.rol}</strong>
                  </div>

                  <div>
                    <span>Institución</span>
                    <strong>{u.institucion}</strong>
                  </div>

                  {u.email && (
                    <div>
                      <span>Email</span>
                      <strong>{u.email}</strong>
                    </div>
                  )}
                </div>
              </article>
            ))}

            {!usuarios.length && !cargando && (
              <div className="usuarios-empty-mobile">
                No hay usuarios registrados.
              </div>
            )}

            {cargando && (
              <div className="usuarios-empty-mobile">
                Cargando usuarios...
              </div>
            )}
          </div>
        </article>
      </section>
    </Layout>
  );
}

export default Usuarios;