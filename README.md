# Au-box

> Plataforma web interna para la gestión y seguimiento de automatizaciones del equipo de Business Process Automation (BPA).

## 📋 Descripción

**Au-box** es una plataforma desarrollada como parte de una **prueba técnica para la posición de Especialista BPA I**.

Su objetivo es centralizar en una sola herramienta la información relacionada con las automatizaciones implementadas por el equipo de BPA, permitiendo consultar su estado, administrar sus datos, registrar incidencias y obtener una visión general mediante un dashboard.

La solución busca reemplazar el manejo disperso de información en hojas de cálculo, memoria del personal u otros medios no centralizados.

---

## 🎯 Objetivo

Proporcionar al equipo de BPA una herramienta sencilla que permita:

- Centralizar el registro de automatizaciones.
- Conocer el estado actual de cada automatización.
- Identificar quién solicitó una automatización y cuándo fue implementada.
- Registrar y consultar incidencias relacionadas con las automatizaciones.
- Buscar y filtrar información rápidamente.
- Obtener estadísticas generales mediante un dashboard.
- Mantener la información restringida a usuarios autorizados.

---

## 🚀 Funcionalidades

### 🔐 Autenticación

- Inicio de sesión.
- Autenticación mediante JWT.
- Protección de rutas y recursos.
- Acceso restringido a usuarios autorizados.

### ⚙️ Automatizaciones

Permite administrar el registro centralizado de las automatizaciones.

- Crear automatizaciones.
- Consultar automatizaciones.
- Ver el detalle de una automatización.
- Editar información.
- Eliminar automatizaciones.
- Registrar solicitante.
- Registrar fecha de implementación.
- Gestionar estado.

#### Estados disponibles

- `ACTIVE` — Activa
- `MAINTENANCE` — En mantenimiento
- `DECOMMISSIONED` — Dada de baja

### 🔎 Búsqueda

Permite localizar rápidamente automatizaciones mediante criterios como:

- Nombre.
- Descripción.

### 🔽 Filtros

Permite filtrar las automatizaciones según su estado:

- Activas.
- En mantenimiento.
- Dadas de baja.

La búsqueda y los filtros pueden utilizarse de manera combinada.

### 📊 Dashboard

Proporciona una visión general del estado de las automatizaciones y sus incidencias.

Incluye estadísticas como:

- Total de automatizaciones.
- Automatizaciones activas.
- Automatizaciones en mantenimiento.
- Automatizaciones dadas de baja.
- Total de incidencias.
- Incidencias abiertas.
- Incidencias resueltas.
- Distribución de automatizaciones por estado.

Los gráficos son implementados utilizando **Recharts**.

### 🚨 Incidencias

Permite registrar y realizar seguimiento de problemas relacionados con las automatizaciones.

- Crear incidencias.
- Consultar incidencias.
- Editar incidencias.
- Asociar una incidencia a una automatización.
- Cambiar estado.
- Establecer prioridad.
- Registrar fecha de reporte.
- Registrar fecha de resolución.

#### Estados

- `OPEN` — Abierta
- `IN_PROGRESS` — En progreso
- `RESOLVED` — Resuelta

#### Prioridades

- `LOW` — Baja
- `MEDIUM` — Media
- `HIGH` — Alta
- `CRITICAL` — Crítica

### 👤 Usuarios

Módulo orientado a la gestión básica del perfil del usuario.

- Consultar información del perfil.
- Editar nombre.
- Cambiar contraseña.

La gestión de usuarios se mantiene intencionalmente sencilla para mantener el alcance del proyecto como un MVP.

---

## 🏗️ Arquitectura

Au-box utiliza una arquitectura cliente-servidor basada en una API REST.

### Backend
NestJS — Framework para construcción de la API REST.

TypeScript — Lenguaje principal.

Prisma — ORM para interacción con la base de datos.

PostgreSQL — Sistema gestor de base de datos.

Supabase — Plataforma utilizada para alojar PostgreSQL.

JWT — Autenticación y autorización.

### Frontend

Next.js — Framework para la aplicación web.

React — Biblioteca para construcción de interfaces.

TypeScript — Tipado estático.

Tailwind CSS — Estilos y diseño responsive.

SweetAlert2 — Alertas y confirmaciones.

Recharts — Visualización de estadísticas.

```text
                         ┌───────────────────┐
                         │      Usuario      │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │     Next.js       │
                         │   Tailwind CSS    │
                         │     Recharts      │
                         └─────────┬─────────┘
                                   │
                              HTTP / REST
                                   │
                                   ▼
                         ┌───────────────────┐
                         │      NestJS       │
                         │                   │
                         │ Auth              │
                         │ Automation        │
                         │ Incident          │
                         │ Dashboard         │
                         │ User              │
                         └─────────┬─────────┘
                                   │
                                Prisma
                                   │
                                   ▼
                         ┌───────────────────┐
                         │    PostgreSQL     │
                         │     Supabase      │
                         └───────────────────┘


                               Git Push
                                   │
                                   ▼
                                GitHub
                                   │
                                   ▼
                             GitHub Actions
                                   │
                                   ├── Lint
                                   ├── Tests
                                   ├── Build
                                   │
                                   ▼
                              Deployment



Cliente solicita crédito
        ↓
Sistema recibe solicitud
        ↓
Validar datos del cliente
        ↓
¿Datos completos?
   ↓             ↓
  NO             SÍ
  ↓               ↓
Solicitar       Evaluar
corrección      capacidad
                crediticia
                    ↓
             Aplicar reglas
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    Bajo riesgo  Riesgo medio  Alto riesgo
        ↓           ↓           ↓
    Aprobar      Revisión      Rechazar
    automático   manual
                    ↓
              Oficial bancario
                    ↓
              Aprobar/Rechazar
                    ↓
              Notificar cliente
                    ↓
              Registrar auditoría
