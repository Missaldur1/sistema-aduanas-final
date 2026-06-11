# Sistema Informático Integrado para Aduanas

Sistema web desarrollado en JavaScript para apoyar el registro y control de pasos fronterizos en el Complejo Los Libertadores. Permite registrar personas, vehículos, declaraciones juradas y trámites aduaneros, además de entregar herramientas de validación para funcionarios de Aduana.

El proyecto cuenta con una interfaz responsive compatible con computadores, tablets y smartphones.

---

## Objetivo del sistema

El objetivo principal es digitalizar y centralizar el registro de personas y vehículos que desean cruzar por aduanas, permitiendo que el personal de Aduana pueda revisar antecedentes, declaraciones, alertas y niveles de riesgo de manera más rápida y ordenada.

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

### Backend

* Node.js
* Express
* SQLite
* JWT
* bcryptjs
* CORS
* dotenv

### Base de datos

* SQLite local para desarrollo y pruebas.

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
* Revisar alertas.
* Consultar datos de personas y vehículos.
* Ver nivel de riesgo aduanero.
* Gestionar usuarios.
* Limpiar registros de prueba en modo desarrollo.

### Persona

La persona no necesita iniciar sesión. Ingresa directamente al formulario público de registro de paso fronterizo.

Funciones principales:

* Registrar datos personales.
* Registrar datos del vehículo.
* Completar declaración jurada.
* Enviar el trámite a Aduana.
* Recibir código de trámite.
* Recibir comprobante con código QR.

---

## Accesos principales

### Registro público de paso fronterizo

```txt
http://localhost:5173/
```

Esta pantalla es pública y permite registrar un nuevo paso fronterizo.

### Login de Aduana

```txt
http://localhost:5173/admin
```

Pantalla de acceso para funcionarios de Aduana.

### Panel de Aduana

```txt
http://localhost:5173/dashboard
```

Panel privado para revisar estadísticas, trámites y alertas.

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
* Código único de trámite.
* Comprobante digital con código QR.
* Modo claro y modo oscuro.
* Diseño responsive para smartphone.
* Semáforo inteligente de riesgo aduanero.
* Detección automática de antecedentes por RUT/documento.
* Detección automática de alertas vehiculares por patente.
* Alertas internas visibles solo para Aduana.
* Vista de detalle completo del trámite.
* Validación simulada PDI/SAG/Aduana.
* Herramientas de prueba para cargar escenarios automáticamente.
* Botón de limpieza de registros para pruebas en desarrollo.

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

Esto permite probar el sistema de forma rápida sin tener que escribir todos los datos manualmente.

---

## Ejecutar el proyecto

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

## Base de datos

El sistema usa SQLite en desarrollo.

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

## Posible despliegue gratuito

Para publicar el sistema gratuitamente se recomienda:

```txt
Frontend: Vercel o Netlify
Backend: Render
Base de datos: SQLite para demo o PostgreSQL para uso más estable
```

Para una presentación o demo, Vercel + Render es suficiente.

---

## Estado actual del proyecto

El sistema actualmente cuenta con:

* Registro público funcional.
* Login administrativo.
* Panel de Aduana.
* Registro en base de datos.
* Validaciones simuladas.
* Riesgo automático.
* Alertas internas.
* QR de trámite.
* Modo oscuro.
* Diseño responsive.
* Herramientas de prueba.
* Limpieza automática de registros en desarrollo.

---

## Autor

Proyecto desarrollado por Misael Rojas, como parte del Sistema Informático Integrado para Aduanas.
