# Sistema Informático Integrado para Aduanas

Proyecto web en JavaScript para registrar personas, vehículos, declaraciones y trámites fronterizos. Incluye dos tipos de usuario: Administrador Aduana y Persona.

## Tecnologías

- Frontend: React, Vite, React Router, Axios, Lucide React.
- Backend: Node.js, Express, SQLite, JWT y bcryptjs.
- Base de datos local gratuita: SQLite.

## Usuarios de prueba

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador Aduana | admin | admin123 |
| Persona | persona | persona123 |

## Ejecutar el proyecto

### Backend

```bash
cd backend
npm install
npm run dev
```

El backend queda en `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda en `http://localhost:5173`.

## Funcionalidades principales

- Login con token JWT.
- Roles ADMIN y PERSONA.
- Dashboard distinto según el rol.
- Registro de paso fronterizo desde smartphone.
- Registro de datos personales, vehículo y declaración jurada.
- Validación simulada PDI/SAG/Aduana.
- Alertas automáticas cuando hay antecedentes o declaración sensible.
- Gestión de usuarios para el administrador.
- Diseño responsive compatible con celulares.

## Recomendación para GitHub

No subir `node_modules`, `.env` ni la base de datos `.db`. Estos archivos ya están ignorados en `.gitignore`.
