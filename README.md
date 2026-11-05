# 🗂️ TaskFlow

> Organiza tus tareas, alcanza tus objetivos.

**TaskFlow** es una aplicación web para gestionar tareas personales de forma sencilla y visual. Permite crear, editar, completar y eliminar tareas, clasificarlas por prioridad y categoría, y mantener siempre a la vista lo que está pendiente o vencido.

![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![.NET](https://img.shields.io/badge/.NET-10-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

---

## ✨ ¿Qué es TaskFlow?

TaskFlow es un proyecto full stack formado por dos partes que trabajan juntas:

- **To-Do-App**: la interfaz que usa la persona, construida con **Angular 22**, **TypeScript** y **Tailwind CSS 4**.
- **To-Dot_API**: la API REST que guarda y administra los datos, hecha en **C# / .NET 10** con **MongoDB** y consultas con **LINQ**.

La aplicación funciona en **modo monousuario**: no requiere iniciar sesión y todas las tareas se guardan en una misma colección de la base de datos.

## 🚀 Funcionalidades

- ✅ Crear, editar, completar y eliminar tareas.
- 🏷️ Clasificar por **prioridad** (Baja, Media, Alta) y **categoría** (Estudio, Trabajo, Personal, Salud, Deporte, Finanzas).
- 🔎 Buscar por título o descripción y filtrar por estado, prioridad o categoría.
- 📅 Asignar fecha límite y detectar automáticamente las tareas **vencidas**.
- 🔃 Ordenar por fecha límite, prioridad o fecha de creación.
- 📊 Ver contadores de tareas totales, pendientes y completadas.
- ⚡ Actualización inmediata de la pantalla gracias a los **signals** de Angular.

## 🧰 Tecnologías

| Capa | Tecnología |
|---|---|
| Interfaz | Angular 22, TypeScript, Tailwind CSS 4 |
| Comunicación | API REST + HttpClient |
| Backend | ASP.NET Core (.NET 10), Minimal APIs, LINQ |
| Base de datos | MongoDB |
| Documentación de API | OpenAPI + Scalar |

## 📁 Estructura del proyecto

```text
ToDoList-Web/
├── To-Do-App/                 # Frontend en Angular
│   └── src/app/
│       ├── components/        # Navbar, lista de tareas y footer
│       ├── models/            # Interfaces y enums de tareas
│       └── services/          # Comunicación con la API
│
└── To-Dot_API/                # Backend en .NET
    └── To-Dot_API/
        ├── Endpoint/          # Endpoints de tareas
        ├── Model/             # Modelo TaskItem
        └── Services/          # Servicios de la API
```

## ⚙️ Cómo ejecutar el proyecto

### 1. Backend

Antes de iniciar, configura la cadena de conexión de MongoDB en `To-Dot_API/To-Dot_API/Program.cs`.

```bash
cd To-Dot_API/To-Dot_API
dotnet run
```

La API estará disponible en `https://localhost:7049` y su documentación en `https://localhost:7049/scalar` (solo en desarrollo).

### 2. Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd To-Do-App
npm install
npm start
```

Abre `http://localhost:4200/` en el navegador. La aplicación se recarga automáticamente al modificar los archivos.

> 💡 El backend ya tiene CORS configurado para `http://localhost:4200`, así que ambos deben ejecutarse en esos puertos.

## 🔌 Endpoints principales

| Método | Ruta | Acción |
|---|---|---|
| `GET` | `/api/tasks` | Listar tareas (con filtros y orden) |
| `GET` | `/api/tasks/{id}` | Obtener una tarea |
| `POST` | `/api/tasks` | Crear una tarea |
| `PUT` | `/api/tasks/{id}` | Actualizar una tarea |
| `DELETE` | `/api/tasks/{id}` | Eliminar una tarea |

## 🧪 Comandos útiles del frontend

Desde la carpeta `To-Do-App`:

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm test` | Ejecuta las pruebas unitarias con Vitest |

---

Hecho con 💜 para mantener tus pendientes bajo control.
