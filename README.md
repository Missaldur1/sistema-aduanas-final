# Sistema Informático Integrado para Aduanas

Sistema web desarrollado en JavaScript para apoyar el registro y control de pasos fronterizos en el Complejo Los Libertadores. Permite registrar personas, vehículos, declaraciones juradas y trámites aduaneros, además de entregar herramientas de validación para funcionarios de Aduana.

El sistema cuenta con una interfaz responsive compatible con computadores, tablets y smartphones.

---

## Enlaces del sistema desplegado

### Frontend

```txt
https://sistema-aduanas-final.vercel.app/
```

### Backend

```txt
https://sistema-aduanas-backend.onrender.com
```

### API Backend

```txt
https://sistema-aduanas-backend.onrender.com/api
```

> Nota: Render en plan gratuito puede suspender el backend por inactividad. La primera carga puede tardar algunos segundos.

---

## Objetivo del sistema

El objetivo principal es digitalizar y centralizar el registro de personas y vehículos que desean cruzar por Aduanas, permitiendo que el personal autorizado pueda revisar antecedentes, declaraciones, alertas y niveles de riesgo de manera más rápida y ordenada.

---

## Tecnologías utilizadas

### Frontend

* React
* Vite
* React Router DOM
* Axios
* Lucide React
* React Datepicker
* QR Code React
* CSS modular separado por vistas
* Vercel para despliegue web

### Backend

* Node.js
* Express
* SQLite
* JWT
* bcryptjs
* CORS
* dotenv
* Render para despliegue del servidor

### Base de datos

* SQLite para desarrollo, pruebas y demo web.

---

## Estructura general del proyecto

```txt
sistema-aduanas/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── vercel.json
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## Roles del sistema

### Administrador Aduana

El administrador representa al funcionario de Aduana. Puede ingresar al sistema mediante login y acceder al panel privado.

Funciones principales:

* Ver dashboard general.
* Revisar trámites registrados.
* Ver detalle completo de cada trámite.
* Validar trámites.
* Revisar alertas internas.
* Consultar datos de personas y vehículos.
* Ver nivel de riesgo aduanero.
* Gestionar usuarios.
* Limpiar registros de prueba desde el panel administrativo.

### Persona

La persona no necesita iniciar sesión. Ingresa directamente al formulario público de registro de paso fronterizo.

Funciones principales:

* Registrar datos personales.
* Registrar datos del vehículo.
* Completar declaración jurada.
* Enviar el trámite a Aduana.
* Recibir código de trámite.
* Recibir comprobante digital con código QR.

---

## Accesos principales

### Registro público de paso fronterizo

```txt
http://localhost:5173/
```

En producción:

```txt
https://sistema-aduanas-final.vercel.app/
```

### Login de Aduana

```txt
http://localhost:5173/admin
```

En producción:

```txt
https://sistema-aduanas-final.vercel.app/admin
```

### Panel de Aduana

```txt
http://localhost:5173/dashboard
```

En producción:

```txt
https://sistema-aduanas-final.vercel.app/dashboard
```

---

## Usuario de prueba

| Rol                  | Usuario | Contraseña |
| -------------------- | ------- | ---------- |
| Administrador Aduana | admin   | admin123   |

---

## Funcionalidades principales

* Registro público de paso fronterizo sin login.
* Login privado para Aduana.
* Autenticación con JWT.
* Contraseñas cifradas con bcryptjs.
* Dashboard administrativo.
* Registro de persona, vehículo y declaración jurada.
* Código único de trámite con formato `ADU-2026-00001`.
* Comprobante digital con código QR.
* Modo claro y modo oscuro.
* Diseño responsive compatible con smartphone.
* Validaciones completas en el formulario público.
* Formateo automático de RUT con puntos y guion.
* Validación de RUT chileno mediante dígito verificador.
* Selección de nacionalidad con opción personalizada.
* Selector de prefijo telefónico internacional.
* Campo personalizado para motivo de viaje cuando se selecciona “Otro”.
* Semáforo inteligente de riesgo aduanero.
* Detección automática de antecedentes por RUT/documento.
* Detección automática de alertas vehiculares por patente.
* Alertas internas visibles solo para Aduana.
* Vista de detalle completo del trámite.
* Validación simulada PDI/SAG/Aduana.
* Herramientas de prueba para cargar escenarios automáticamente.
* Limpieza de registros desde el panel de administrador.

---

## Validaciones del formulario público

### Datos de la persona

* Nombre obligatorio.
* Apellido obligatorio.
* Documento obligatorio.
* RUT con formato automático y validación real.
* Pasaporte/DNI con validación de longitud.
* Nacionalidad obligatoria.
* Nacionalidad personalizada sin números ni caracteres especiales.
* Fecha de nacimiento obligatoria.
* Fecha de nacimiento no puede ser futura.
* Teléfono opcional con prefijo internacional.
* Email opcional con formato válido.

### Datos del vehículo

* Patente obligatoria.
* País de origen obligatorio.
* Marca obligatoria.
* Modelo obligatorio.
* Año validado si se ingresa.
* Color validado si se ingresa.
* Número de chasis opcional.
* Número de motor opcional.

### Declaración y viaje

* Motivo del viaje obligatorio.
* Motivo personalizado si se selecciona “Otro”.
* Destino obligatorio.
* Frontera fija: Complejo Los Libertadores.
* Declaración de alimentos, vegetales, animales y dinero declarable.
* Observaciones opcionales.

---

## Semáforo inteligente de riesgo

El sistema calcula automáticamente un nivel de riesgo al registrar un trámite.

Niveles:

```txt
VERDE    = Bajo riesgo
AMARILLO = Requiere revisión
ROJO     = Alto riesgo
```

El cálculo considera factores como:

* Persona con antecedente detectado por documento.
* Vehículo con alerta detectada por patente.
* Transporte de alimentos.
* Transporte de vegetales.
* Transporte de animales.
* Declaración de dinero o valores.
* Información sensible para revisión SAG/PDI/Aduana.

La persona no ve los antecedentes ni el riesgo. Esa información queda disponible solo para el funcionario de Aduana.

---

## Escenarios de prueba

El sistema incluye escenarios rápidos para completar automáticamente el formulario público.

Ejemplos de escenarios:

* Persona sin riesgo.
* Persona con antecedente.
* Declaración SAG.
* Alto riesgo.

Esto permite probar el sistema rápidamente sin escribir todos los datos manualmente.

---

## Ejecutar el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd sistema-aduanas
```

---

## Backend

Entrar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar servidor:

```bash
npm run dev
```

El backend quedará disponible en:

```txt
http://localhost:3001
```

---

## Frontend

Entrar a la carpeta del frontend:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
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

## Ejecutar desde celular en la misma red

Para abrir el sistema desde un celular conectado al mismo WiFi, ejecutar el frontend con:

```bash
npm run dev -- --host 0.0.0.0
```

Luego abrir en el celular la URL de red que muestra Vite, por ejemplo:

```txt
http://192.168.1.35:5173/
```

---

## Variables de entorno

### Frontend en Vercel

```txt
VITE_API_URL=https://sistema-aduanas-backend.onrender.com/api
```

### Backend en Render

```txt
NODE_ENV=production
JWT_SECRET=clave_segura_del_proyecto
FRONTEND_URLS=http://localhost:5173,https://sistema-aduanas-final.vercel.app
NODE_VERSION=20
```

---

## Configuración de despliegue

### Frontend en Vercel

Configuración utilizada:

```txt
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Archivo necesario para rutas de React Router:

```txt
frontend/vercel.json
```

Contenido:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Backend en Render

Configuración utilizada:

```txt
Language: Node
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

El backend usa Node 20 para evitar problemas de compatibilidad con SQLite.

---

## Base de datos

El sistema usa SQLite.

La base de datos se genera en:

```txt
backend/aduanas.db
```

Tablas principales:

```txt
usuarios
personas
vehiculos
tramites
declaraciones
alertas
validaciones
```

En producción demo con Render, SQLite funciona para pruebas, pero para un sistema más estable se recomienda migrar a PostgreSQL, Supabase o Neon.

---

## Archivos importantes

### Frontend

```txt
frontend/src/pages/RegistroPaso.jsx
frontend/src/pages/Login.jsx
frontend/src/pages/Dashboard.jsx
frontend/src/pages/Validacion.jsx
frontend/src/pages/DetalleTramite.jsx
frontend/src/components/Layout.jsx
frontend/src/api/api.js
frontend/src/utils/escenariosPrueba.js
frontend/vercel.json
```

### Backend

```txt
backend/server.js
backend/database/db.js
backend/controllers/tramites.controller.js
backend/controllers/auth.controller.js
backend/controllers/dev.controller.js
backend/routes/tramites.routes.js
backend/routes/auth.routes.js
backend/routes/dev.routes.js
backend/middleware/auth.middleware.js
backend/utils/calcularRiesgo.js
backend/utils/personasPrueba.js
backend/utils/vehiculosPrueba.js
```

---

## Estilos CSS

Los estilos están separados por pantalla o componente:

```txt
frontend/src/styles/global.css
frontend/src/styles/login.css
frontend/src/styles/layout.css
frontend/src/styles/dashboard.css
frontend/src/styles/registroPaso.css
frontend/src/styles/registroVehiculo.css
frontend/src/styles/validacion.css
frontend/src/styles/detalleTramite.css
frontend/src/styles/responsive.css
```

---

## Recomendación para GitHub

No subir archivos pesados, privados o generados automáticamente.

El proyecto debe ignorar:

```txt
node_modules/
.env
backend/.env
frontend/.env
backend/aduanas.db
backend/*.db
dist/
frontend/dist/
```

Estos archivos deben estar incluidos en `.gitignore`.

---

## Comandos útiles de Git

Inicializar repositorio:

```bash
git init
```

Agregar cambios:

```bash
git add .
```

Crear commit:

```bash
git commit -m "Primer commit sistema aduanas"
```

Conectar con GitHub:

```bash
git remote add origin URL_DEL_REPOSITORIO
```

Subir a GitHub:

```bash
git branch -M main
git push -u origin main
```

Para futuros cambios:

```bash
git add .
git commit -m "Descripcion del cambio"
git push
```

---

## Estado actual del proyecto

El sistema actualmente cuenta con:

* Registro público funcional.
* Login administrativo.
* Panel de Aduana.
* Registro en base de datos.
* Validaciones completas de formulario.
* Formateo automático de RUT.
* Selector de nacionalidad y prefijo telefónico.
* Validaciones simuladas PDI/SAG/Aduana.
* Riesgo automático.
* Alertas internas.
* QR de trámite.
* Modo oscuro.
* Diseño responsive.
* Herramientas de prueba.
* Limpieza automática de registros desde el panel administrativo.
* Frontend desplegado en Vercel.
* Backend desplegado en Render.

---

## Autor

Proyecto desarrollado por Misael Rojas, como parte del Sistema Informático Integrado para Aduanas.
