# Sistema Integrado de Gestión Aduanera

Proyecto web desarrollado como prototipo funcional para apoyar el registro y revisión de trámites de paso fronterizo en Aduanas Chile, enfocado en el Complejo Los Libertadores.

El sistema permite que una persona registre su paso fronterizo de forma digital, ingresando datos personales, información del vehículo o condición de pasajero, menores acompañantes, documentos adjuntos y declaración jurada. Además, cuenta con un panel administrativo para que Aduanas pueda revisar, validar y consultar los trámites registrados.

---

## Descripción del proyecto

El objetivo principal del sistema es digitalizar parte del proceso de registro fronterizo, permitiendo centralizar la información del viajero antes de cruzar la frontera.

El proyecto cuenta con dos flujos principales:

1. **Usuario público**

   * Ingresa a la página principal.
   * Accede al formulario de registro.
   * Completa sus datos personales.
   * Indica si viaja como chofer o pasajero.
   * Registra menores acompañantes si corresponde.
   * Adjunta documentos si es necesario.
   * Completa la declaración jurada.
   * Recibe un comprobante digital con código QR.

2. **Administrador Aduana**

   * Ingresa al login administrativo.
   * Accede al dashboard.
   * Revisa trámites registrados.
   * Valida solicitudes.
   * Consulta el detalle completo de cada trámite.
   * Revisa menores, documentos adjuntos y declaración.
   * Puede buscar trámites mediante código o QR.

---

## Funcionalidades principales

### Página principal

El sistema cuenta con una página inicial antes del registro, donde se muestran avisos, consejos e información útil para el viajero.

Incluye:

* Información del Complejo Los Libertadores.
* Avisos antes de registrar el viaje.
* Consejos sobre declaración de productos.
* Información sobre menores acompañantes.
* Información sobre documentos adjuntos.
* Botón para iniciar registro público.
* Botón para ingreso administrador.
* Modo claro y modo oscuro.
* Logo de Aduanas Chile.

---

### Registro público de paso fronterizo

El formulario público permite registrar un trámite completo de paso fronterizo.

Secciones del formulario:

* Datos de la persona.
* Menores acompañantes.
* Datos del vehículo.
* Documentos adjuntos.
* Declaración y viaje.

Cada sección funciona como menú desplegable para mejorar el orden visual del formulario.

---

### Datos de la persona

Campos principales:

* Nombre.
* Apellido.
* Tipo de documento.
* Número de documento.
* Nacionalidad.
* Fecha de nacimiento.
* Teléfono.
* Email.

El sistema valida documentos según el tipo seleccionado:

* **RUT:** acepta entre 8 y 9 dígitos considerando dígito verificador, con formato automático.
* **DNI:** acepta mínimo 7 y máximo 8 números, con puntos automáticos.
* **Pasaporte:** acepta formato alfanumérico en mayúsculas, con largo similar a un pasaporte real.

El teléfono y el email son obligatorios.

---

### Menores acompañantes

El sistema permite agregar uno o más menores acompañantes al trámite.

Cada menor registra:

* Nombre.
* Apellido.
* Tipo de documento.
* Número de documento.
* Nacionalidad.
* Fecha de nacimiento.
* Parentesco o relación.
* Autorización o documento de viaje.
* Observaciones opcionales.

El RUT del menor se comporta igual que el RUT de la persona principal, con formato automático y validación.

---

### Datos del vehículo

La sección de vehículo permite seleccionar primero el rol del viajero:

* Chofer / Conductor.
* Acompañante / Pasajero.

Si el usuario selecciona **Chofer / Conductor**, debe ingresar los datos principales del vehículo:

* Tipo de vehículo.
* Patente.
* País de origen.
* Marca.
* Modelo.
* Año.
* Color.
* Número de chasis.
* Número de motor.

Si el usuario selecciona **Acompañante / Pasajero**, el sistema no exige todos los datos del vehículo. En ese caso, se muestra un menú más simple indicando que la persona viaja como pasajero, junto con una observación opcional.

---

### Documentos adjuntos

El sistema permite adjuntar documentos relacionados con el trámite.

Tipos de documentos aceptados:

* PDF.
* JPG.
* JPEG.
* PNG.

Restricciones:

* Máximo 5 documentos por trámite.
* Máximo 2 MB por archivo.

Ejemplos de documentos:

* Autorización notarial para menor.
* Certificado de nacimiento.
* Documento de identidad del menor.
* Permiso de circulación.
* Revisión técnica.
* Seguro obligatorio.
* Documento adicional.

---

### Declaración y viaje

El usuario debe registrar información del viaje:

* Motivo del viaje.
* Destino.
* Frontera.
* Declaración de alimentos.
* Declaración de vegetales.
* Declaración de animales.
* Declaración de dinero o valores.
* Observaciones adicionales.

La frontera queda definida como:

```txt
Complejo Los Libertadores
```

---

### Comprobante digital

Al finalizar el registro, el sistema genera un comprobante digital con:

* Código del trámite.
* Fecha de registro.
* Estado inicial.
* Cantidad de menores registrados.
* Cantidad de documentos adjuntos.
* Código QR.

Acciones disponibles:

* Copiar código.
* Imprimir comprobante.
* Descargar comprobante.
* Volver al formulario.

---

### Panel administrador

El administrador puede ingresar al sistema mediante login.

Desde el panel puede:

* Visualizar trámites registrados.
* Consultar resumen general.
* Revisar detalles de cada trámite.
* Validar trámites.
* Ver documentos adjuntos.
* Revisar menores acompañantes.
* Buscar trámites por código.
* Escanear QR.
* Gestionar usuarios.
* Exportar información en CSV.
* Consultar historial de acciones.

---

## Tecnologías utilizadas

### Frontend

* React.
* Vite.
* React Router DOM.
* Axios.
* Lucide React.
* React DatePicker.
* QRCode React.
* HTML.
* CSS.

### Backend

* Node.js.
* Express.
* SQLite.
* JSON Web Token.
* bcryptjs.
* CORS.
* dotenv.

### Herramientas de desarrollo

* Visual Studio Code.
* Git.
* GitHub.
* Postman.
* Vercel.
* Render.

---

## Arquitectura del sistema

El sistema utiliza una arquitectura cliente-servidor.

```txt
Usuario público
     ↓
Frontend React + Vite
     ↓
API REST Node.js + Express
     ↓
Base de datos SQLite
```

```txt
Administrador Aduana
     ↓
Login con JWT
     ↓
Dashboard / Validaciones / Detalle / Escáner QR
     ↓
API REST
     ↓
SQLite
```

El frontend se encarga de la interfaz visual y la interacción del usuario.
El backend procesa la lógica de negocio, autenticación, validaciones y almacenamiento de datos.
La base de datos SQLite guarda la información del prototipo.

---

## Estructura general del proyecto

```txt
sistema-aduanas-final/
├── backend/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── tramites.controller.js
│   │   ├── usuarios.controller.js
│   │   ├── vehiculos.controller.js
│   │   ├── validaciones.controller.js
│   │   ├── reportes.controller.js
│   │   ├── historial.controller.js
│   │   └── dev.controller.js
│   ├── database/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── tramites.routes.js
│   │   ├── usuarios.routes.js
│   │   ├── vehiculos.routes.js
│   │   ├── validaciones.routes.js
│   │   ├── reportes.routes.js
│   │   ├── historial.routes.js
│   │   └── dev.routes.js
│   ├── utils/
│   │   └── registrarAccion.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── AduanasChile.webp
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RegistroPaso.jsx
│   │   │   ├── DetalleTramite.jsx
│   │   │   ├── Validacion.jsx
│   │   │   ├── Vehiculos.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   └── EscanearQR.jsx
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── home.css
│   │   │   ├── login.css
│   │   │   ├── dashboard.css
│   │   │   ├── registroPaso.css
│   │   │   ├── detalleTramite.css
│   │   │   ├── validacion.css
│   │   │   └── responsive.css
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   ├── escenariosPrueba.js
│   │   │   └── exportarCSV.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vercel.json
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Base de datos

El sistema utiliza SQLite para el almacenamiento de datos.

Tablas principales:

| Tabla              | Descripción                                             |
| ------------------ | ------------------------------------------------------- |
| usuarios           | Guarda las cuentas de administrador                     |
| personas           | Guarda datos personales del viajero                     |
| vehiculos          | Guarda información del vehículo o condición de pasajero |
| tramites           | Guarda el trámite principal                             |
| menores            | Guarda menores acompañantes asociados al trámite        |
| documentos_tramite | Guarda documentos adjuntos                              |
| declaraciones      | Guarda la declaración jurada                            |
| alertas            | Guarda alertas generadas por el sistema                 |
| validaciones       | Guarda validaciones administrativas                     |
| historial_acciones | Guarda acciones realizadas por el administrador         |

---

## Rutas principales del frontend

| Ruta            | Descripción                         |
| --------------- | ----------------------------------- |
| `/`             | Página principal                    |
| `/registro`     | Registro público de paso fronterizo |
| `/admin`        | Login administrador                 |
| `/dashboard`    | Panel principal administrador       |
| `/validacion`   | Validación de trámites              |
| `/tramites/:id` | Detalle del trámite                 |
| `/vehiculos`    | Gestión o consulta de vehículos     |
| `/usuarios`     | Gestión de usuarios                 |
| `/escanear-qr`  | Escaneo o búsqueda por QR           |

---

## Endpoints principales del backend

| Método | Ruta                           | Descripción                   |
| ------ | ------------------------------ | ----------------------------- |
| POST   | `/api/auth/login`              | Iniciar sesión administrador  |
| POST   | `/api/tramites`                | Crear trámite público         |
| GET    | `/api/tramites`                | Listar trámites               |
| GET    | `/api/tramites/:id`            | Obtener detalle de trámite    |
| GET    | `/api/tramites/codigo/:codigo` | Buscar trámite por código     |
| PATCH  | `/api/tramites/:id/validar`    | Validar trámite               |
| GET    | `/api/usuarios`                | Listar usuarios               |
| POST   | `/api/usuarios`                | Crear usuario                 |
| GET    | `/api/reportes`                | Obtener reportes              |
| GET    | `/api/historial`               | Obtener historial de acciones |

---

## Instalación y ejecución local

### Requisitos previos

Tener instalado:

* Node.js.
* npm.
* Git.

---

### Clonar repositorio

```bash
git clone https://github.com/Missaldur1/sistema-aduanas-final.git
cd sistema-aduanas-final
```

---

## Ejecutar backend

Entrar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env` en la carpeta `backend`:

```env
PORT=3001
JWT_SECRET=aduanas_chile_sistema_2026_clave_segura
FRONTEND_URLS=http://localhost:5173
NODE_ENV=development
```

Ejecutar backend:

```bash
npm run dev
```

El backend quedará disponible en:

```txt
http://localhost:3001
```

---

## Ejecutar frontend

En otra terminal, entrar a la carpeta del frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:3001/api
```

Ejecutar frontend:

```bash
npm run dev
```

El frontend quedará disponible en:

```txt
http://localhost:5173
```

---

## Credenciales de administrador

Para ingresar al panel administrativo:

```txt
Usuario: admin
Contraseña: admin123
```

Estas credenciales son de prueba para el prototipo académico.

---

## Despliegue

### Frontend

El frontend fue desplegado en Vercel.

```txt
https://sistema-aduanas-final.vercel.app/
```

### Backend

El backend fue desplegado en Render.

```txt
https://sistema-aduanas-backend.onrender.com
```

### Variable de entorno frontend en Vercel

```env
VITE_API_URL=https://sistema-aduanas-backend.onrender.com/api
```

### Variables de entorno backend en Render

```env
NODE_ENV=production
NODE_VERSION=20
JWT_SECRET=aduanas_chile_sistema_2026_clave_segura
FRONTEND_URLS=http://localhost:5173,https://sistema-aduanas-final.vercel.app
```

---

## Pruebas realizadas

Se realizaron pruebas funcionales sobre los principales módulos del sistema.

| ID     | Módulo     | Prueba                            | Resultado esperado          | Estado   |
| ------ | ---------- | --------------------------------- | --------------------------- | -------- |
| CP-001 | Login      | Iniciar sesión como administrador | Acceso al dashboard         | Aprobado |
| CP-002 | Login      | Contraseña incorrecta             | Mostrar mensaje de error    | Aprobado |
| CP-003 | Registro   | Registrar trámite sin menores     | Generar comprobante QR      | Aprobado |
| CP-004 | Registro   | Registrar trámite con menor       | Guardar menor asociado      | Aprobado |
| CP-005 | Vehículo   | Registrar como chofer             | Exigir datos del vehículo   | Aprobado |
| CP-006 | Vehículo   | Registrar como pasajero           | No exigir vehículo completo | Aprobado |
| CP-007 | Documentos | Adjuntar PDF válido               | Guardar documento           | Aprobado |
| CP-008 | Documentos | Adjuntar archivo no permitido     | Mostrar error               | Aprobado |
| CP-009 | QR         | Buscar trámite por código         | Mostrar trámite encontrado  | Aprobado |
| CP-010 | Admin      | Ver detalle del trámite           | Mostrar datos completos     | Aprobado |
| CP-011 | Admin      | Validar trámite                   | Cambiar estado del trámite  | Aprobado |
| CP-012 | Responsive | Probar en celular                 | Adaptar interfaz            | Aprobado |

---

## Validaciones implementadas

### Persona

* Nombre obligatorio.
* Apellido obligatorio.
* Documento obligatorio.
* Nacionalidad obligatoria.
* Fecha de nacimiento obligatoria.
* Teléfono obligatorio.
* Email obligatorio.

### Documentos de identidad

* RUT con formato automático y validación.
* DNI con mínimo 7 y máximo 8 números.
* DNI con puntos automáticos.
* Pasaporte alfanumérico, en mayúsculas, entre 6 y 9 caracteres.

### Menores

* Nombre obligatorio.
* Apellido obligatorio.
* Documento obligatorio.
* Nacionalidad obligatoria.
* Fecha de nacimiento obligatoria.
* Parentesco obligatorio.
* Autorización o documento de viaje obligatorio.

### Vehículo

Si el usuario es chofer:

* Tipo de vehículo obligatorio.
* Patente obligatoria.
* País de origen obligatorio.
* Marca obligatoria.
* Modelo obligatorio.

Si el usuario es pasajero:

* No se exigen datos completos del vehículo.
* Se registra la condición de pasajero.
* Puede agregar observación opcional.

### Documentos adjuntos

* Máximo 5 documentos.
* Máximo 2 MB por archivo.
* Solo PDF, JPG, JPEG o PNG.

---

## Control de cambios

| Versión | Cambio               | Descripción                                         |
| ------- | -------------------- | --------------------------------------------------- |
| v1.0    | Estructura inicial   | Creación de frontend, backend y base SQLite         |
| v1.1    | Login administrador  | Implementación de autenticación con JWT             |
| v1.2    | Registro público     | Creación del formulario de paso fronterizo          |
| v1.3    | Dashboard            | Implementación del panel administrativo             |
| v1.4    | Validaciones         | Revisión y validación de trámites                   |
| v1.5    | Comprobante QR       | Generación de comprobante digital                   |
| v1.6    | Menores acompañantes | Registro de menores asociados al trámite            |
| v1.7    | Documentos adjuntos  | Carga de documentos PDF e imágenes                  |
| v1.8    | Diseño responsive    | Adaptación a dispositivos móviles                   |
| v1.9    | Escáner QR           | Búsqueda de trámites por código QR                  |
| v2.0    | Página principal     | Incorporación de home previo al registro            |
| v2.1    | Modo claro/oscuro    | Tema visual en página principal y registro          |
| v2.2    | Chofer o pasajero    | Diferenciación del formulario según rol en vehículo |
| v2.3    | Exportación CSV      | Descarga de información administrativa              |
| v2.4    | Historial            | Registro de acciones administrativas                |

---

## Capturas sugeridas

Para documentar el sistema se recomienda agregar capturas de:

```txt
1. Página principal.
2. Modo oscuro de la página principal.
3. Formulario de registro público.
4. Sección datos de la persona.
5. Sección menores acompañantes.
6. Sección chofer / pasajero.
7. Sección documentos adjuntos.
8. Declaración y viaje.
9. Comprobante digital con QR.
10. Login administrador.
11. Dashboard administrador.
12. Validaciones.
13. Detalle del trámite.
14. Documentos adjuntos vistos por el administrador.
15. Vista responsive desde celular.
```

---

## Limitaciones del prototipo

Este sistema corresponde a un prototipo académico, por lo que algunas funcionalidades fueron simuladas.

Limitaciones actuales:

* No existe integración real con servicios de PDI, SAG o Aduanas.
* Las validaciones de riesgo son internas y simuladas.
* SQLite se utiliza como base de datos del prototipo.
* Los documentos se almacenan en Base64 dentro de la base de datos.
* Las credenciales de administrador son de prueba.

---

## Mejoras futuras

Algunas mejoras que podrían implementarse son:

* Integración real con organismos externos.
* Uso de PostgreSQL o MySQL para producción.
* Almacenamiento externo seguro para documentos.
* Firma digital de documentos.
* Notificaciones por correo electrónico.
* Reportes PDF.
* Roles separados para Aduanas, PDI y SAG.
* Auditoría avanzada.
* Panel estadístico más completo.
* Historial detallado por trámite.

---

## Autor

Proyecto desarrollado por:

```txt
Misael Rojas
Estudiante de Ingeniería en Informática
DuocUc - PAO
```

---

## Estado del proyecto

```txt
Prototipo funcional terminado
```

El sistema cuenta con frontend, backend, base de datos, autenticación administrativa, registro público, comprobante QR, carga de documentos, menores acompañantes, diferenciación entre chofer y pasajero, validaciones y despliegue web.
