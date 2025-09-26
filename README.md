# 🌱 Semillero Digital - Plataforma Educativa

<div align="center">

![Semillero Digital](public/SVG/Asset%203mvpx.svg)

**Plataforma educativa moderna para el seguimiento del progreso estudiantil integrada con Google Classroom**

[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Classroom](https://img.shields.io/badge/Google%20Classroom-API-4285F4?style=flat-square&logo=google)](https://developers.google.com/classroom)

</div>

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [🔐 Instrucciones para Iniciar Sesión](#-instrucciones-para-iniciar-sesión)
- [👥 Roles y Funcionalidades](#-roles-y-funcionalidades)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎨 Componentes Principales](#-componentes-principales)
- [📊 Integración con Google Classroom](#-integración-con-google-classroom)
- [📱 PWA y Características Móviles](#-pwa-y-características-móviles)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🎯 Descripción

**Semillero Digital** es una plataforma educativa moderna diseñada para facilitar el seguimiento del progreso estudiantil y la gestión académica. La aplicación se integra completamente con **Google Classroom** para proporcionar datos en tiempo real y una experiencia unificada para estudiantes, profesores y coordinadores.

### 🌟 Características Destacadas

- **🔗 Integración Total con Google Classroom**: Sincronización automática de cursos, tareas y calificaciones
- **👥 Multi-Rol**: Interfaces especializadas para estudiantes, profesores y coordinadores
- **📊 Análisis en Tiempo Real**: Reportes y estadísticas basados en datos reales
- **📱 PWA Ready**: Funciona como aplicación nativa en dispositivos móviles
- **🎨 Diseño Moderno**: Interfaz responsive con modo claro/oscuro
- **🔔 Notificaciones Inteligentes**: Sistema de alertas contextual por rol
- **📈 Reportes Avanzados**: Visualización de datos con gráficos interactivos

## ✨ Características Principales

### 🎯 Para Estudiantes
- **📚 Dashboard Personalizado**: Vista de cursos y tareas pendientes
- **📊 Seguimiento de Progreso**: Estadísticas de rendimiento académico
- **🔔 Notificaciones Inteligentes**: Alertas de tareas próximas a vencer
- **📱 Perfil Completo**: Información personal con datos reales de Google Classroom

### 👨‍🏫 Para Profesores
- **🎛️ Panel de Control**: Gestión completa de cursos y estudiantes
- **📝 Filtros Avanzados**: Sistema de filtros por estado de tareas
- **👥 Gestión de Estudiantes**: Seguimiento individual del progreso
- **📊 Reportes Detallados**: Análisis de rendimiento de la clase

### 👨‍💼 Para Coordinadores
- **📈 Vista Ejecutiva**: Análisis general de múltiples cursos
- **📊 Reportes Institucionales**: Métricas de rendimiento global
- **👥 Supervisión de Profesores**: Seguimiento de la actividad docente
- **📋 Gestión Administrativa**: Herramientas de coordinación académica

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  🎨 UI Components (Radix UI + Tailwind CSS)               │
│  🔄 State Management (React Context)                       │
│  🛡️ Authentication (NextAuth.js)                          │
├─────────────────────────────────────────────────────────────┤
│                    API Routes (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  🔗 Google Classroom API Integration                       │
│  🔐 OAuth 2.0 Authentication                              │
│  📊 Data Processing & Analytics                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ 
- **npm** o **pnpm**
- **Cuenta de Google** con acceso a Google Classroom
- **Proyecto en Google Cloud Console**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/altovisual/semillerodigital.git
cd semillero-dashboard
```

### 2. Instalar Dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Application Settings
NEXT_PUBLIC_MOCK_MODE=false
```

### 4. Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs necesarias:
   - Google Classroom API
   - Google People API
4. Configura OAuth 2.0:
   - Agrega `http://localhost:3000` a los orígenes autorizados
   - Agrega `http://localhost:3000/api/auth/callback/google` a las URIs de redirección

### 5. Ejecutar la Aplicación

```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🔐 Instrucciones para Iniciar Sesión

Al hacer clic en **"Acceder con Google"**, verás una pantalla de advertencia de seguridad que dice *"Google no ha verificado esta aplicación"*. Esto es normal para proyectos en desarrollo.

### Para continuar, por favor sigue estos pasos:

1. **Haz clic en "Configuración avanzada"**
2. **Haz clic en el enlace de abajo que dice "Ir a Semillero Digital Progress Tracker (no seguro)"**

> ⚠️ **Nota**: Esta advertencia aparece porque la aplicación está en modo de desarrollo. En producción, la aplicación estaría verificada por Google.

**¡Gracias por evaluar nuestro proyecto!** 🙏

## 👥 Roles y Funcionalidades

### 👨‍🎓 Estudiante

| Funcionalidad | Descripción |
|---------------|-------------|
| 📚 **Dashboard Personal** | Vista de cursos matriculados y tareas pendientes |
| 📊 **Progreso Académico** | Estadísticas de rendimiento y calificaciones |
| 🔔 **Notificaciones** | Alertas de tareas próximas a vencer |
| 👤 **Perfil Completo** | Información personal con datos reales |
| 📱 **Vista Móvil** | Interfaz optimizada para dispositivos móviles |

### 👨‍🏫 Profesor

| Funcionalidad | Descripción |
|---------------|-------------|
| 🎛️ **Panel de Control** | Gestión completa de cursos y estudiantes |
| 📝 **Filtros de Tareas** | Sistema avanzado de filtros por estado |
| 👥 **Gestión de Estudiantes** | Seguimiento individual del progreso |
| 📊 **Reportes Detallados** | Análisis de rendimiento de la clase |
| 📈 **Estadísticas Avanzadas** | Métricas de enseñanza y aprendizaje |

### 👨‍💼 Coordinador

| Funcionalidad | Descripción |
|---------------|-------------|
| 📈 **Vista Ejecutiva** | Análisis general de múltiples cursos |
| 📊 **Reportes Institucionales** | Métricas de rendimiento global |
| 👥 **Supervisión Docente** | Seguimiento de la actividad de profesores |
| 📋 **Gestión Administrativa** | Herramientas de coordinación académica |
| 🔍 **Análisis Comparativo** | Comparación entre cursos y profesores |

## 🛠️ Tecnologías Utilizadas

### Frontend
- **⚛️ React 18** - Biblioteca de interfaz de usuario
- **🔼 Next.js 14.2.16** - Framework de React con SSR/SSG
- **🎨 Tailwind CSS 4.1.9** - Framework de CSS utilitario
- **🧩 Radix UI** - Componentes accesibles y sin estilos
- **📊 Recharts** - Biblioteca de gráficos para React
- **🎭 Lucide React** - Iconos SVG modernos

### Autenticación y APIs
- **🔐 NextAuth.js 4.24.11** - Autenticación para Next.js
- **🏫 Google Classroom API** - Integración con Google Classroom
- **👤 Google People API** - Información de perfil de usuario
- **🔑 OAuth 2.0** - Protocolo de autorización

### Desarrollo y Herramientas
- **📘 TypeScript 5** - Superset tipado de JavaScript
- **🎯 ESLint** - Linter para código JavaScript/TypeScript
- **🎨 Prettier** - Formateador de código
- **📦 pnpm** - Gestor de paquetes rápido

### PWA y Móvil
- **📱 PWA Support** - Aplicación web progresiva
- **🔔 Web Push Notifications** - Notificaciones push
- **📴 Offline Support** - Funcionalidad sin conexión
- **🏠 Add to Home Screen** - Instalación en dispositivos

## 📁 Estructura del Proyecto

```
semillero-dashboard/
├── 📁 app/                          # App Router de Next.js
│   ├── 📁 api/                      # API Routes
│   │   ├── 📁 auth/                 # Autenticación NextAuth
│   │   └── 📁 classroom/            # API de Google Classroom
│   ├── 📁 dashboard/                # Dashboards por rol
│   │   ├── 📁 coordinator/          # Dashboard del coordinador
│   │   ├── 📁 student/              # Dashboard del estudiante
│   │   └── 📁 teacher/              # Dashboard del profesor
│   ├── 📁 profile/                  # Página de perfil
│   ├── 📁 reports/                  # Sistema de reportes
│   ├── 📄 layout.tsx                # Layout principal
│   └── 📄 page.tsx                  # Página de inicio
├── 📁 components/                   # Componentes React
│   ├── 📁 dashboards/               # Componentes de dashboards
│   ├── 📁 filters/                  # Filtros y búsquedas
│   ├── 📁 notifications/            # Sistema de notificaciones
│   ├── 📁 reports/                  # Componentes de reportes
│   ├── 📁 shared/                   # Componentes compartidos
│   └── 📁 ui/                       # Componentes base de UI
├── 📁 contexts/                     # Contextos de React
│   ├── 📄 auth-context.tsx          # Contexto de autenticación
│   ├── 📄 notifications-context.tsx # Contexto de notificaciones
│   └── 📄 theme-context.tsx         # Contexto de tema
├── 📁 hooks/                        # Hooks personalizados
├── 📁 lib/                          # Utilidades y configuraciones
├── 📁 public/                       # Archivos estáticos
│   ├── 📁 SVG/                      # Logos y gráficos
│   ├── 📄 site.webmanifest          # Manifest PWA
│   └── 📄 favicon.ico               # Favicon
├── 📁 scripts/                      # Scripts de utilidad
└── 📁 styles/                       # Estilos globales
```

## 🎨 Componentes Principales

### 🎛️ Dashboards
- **CoordinatorDashboard**: Panel ejecutivo con métricas institucionales
- **TeacherDashboard**: Gestión de cursos y estudiantes con filtros avanzados
- **StudentDashboard**: Vista personal de progreso académico

### 🔔 Sistema de Notificaciones
- **NotificationCenter**: Centro de notificaciones con configuraciones
- **NotificationsProvider**: Contexto global de notificaciones
- **Generación Automática**: Notificaciones basadas en datos de Google Classroom

### 📊 Reportes y Análisis
- **ReportFilters**: Filtros dinámicos para reportes
- **DataVisualization**: Gráficos interactivos con Recharts
- **ExportFunctionality**: Exportación a CSV con datos reales

### 🎨 UI Components
- **TaskStatusFilter**: Filtros avanzados por estado de tareas
- **ProfileMenu**: Menú de perfil dinámico por rol
- **ThemeToggle**: Alternador de tema claro/oscuro
- **AppLogo**: Logo adaptativo según el tema

## 📊 Integración con Google Classroom

### 🔗 APIs Utilizadas

| API | Propósito | Endpoints |
|-----|-----------|-----------|
| **Courses** | Gestión de cursos | `/api/classroom/courses` |
| **Students** | Lista de estudiantes | `/api/classroom/courses/[id]/students` |
| **Coursework** | Tareas y asignaciones | `/api/classroom/courses/[id]/coursework` |
| **Submissions** | Entregas de estudiantes | `/api/classroom/courses/[id]/submissions` |

### 📈 Datos Sincronizados

- ✅ **Cursos**: Información completa de cursos
- ✅ **Estudiantes**: Perfiles y datos de contacto
- ✅ **Tareas**: Asignaciones y fechas de entrega
- ✅ **Entregas**: Estados y calificaciones
- ✅ **Calificaciones**: Notas y retroalimentación

### 🔄 Actualización en Tiempo Real

La aplicación sincroniza automáticamente con Google Classroom para mantener los datos actualizados:

- **🔄 Sincronización Automática**: Cada vez que se carga un dashboard
- **⚡ Carga Optimizada**: Requests paralelos y limitados para mejor rendimiento
- **🛡️ Manejo de Errores**: Fallback graceful en caso de problemas de conexión

## 📱 PWA y Características Móviles

### 🏠 Progressive Web App

La aplicación está optimizada como PWA con las siguientes características:

- **📱 Instalable**: Se puede instalar en dispositivos móviles y desktop
- **📴 Offline Ready**: Funcionalidad básica sin conexión
- **🔔 Push Notifications**: Notificaciones push nativas
- **⚡ Carga Rápida**: Service Worker para caching inteligente

### 📋 Manifest PWA

```json
{
  "name": "Semillero Digital",
  "short_name": "Semillero",
  "description": "Plataforma educativa para el seguimiento del progreso estudiantil",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4fc096",
  "icons": [...]
}
```

### 📱 Características Móviles

- **🎨 Responsive Design**: Adaptable a todas las pantallas
- **👆 Touch Optimized**: Interfaz optimizada para touch
- **🔄 Pull to Refresh**: Actualización por deslizamiento
- **📊 Mobile Charts**: Gráficos optimizados para móvil

## 🔧 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Inicia el servidor de desarrollo
npm run build        # Construye la aplicación para producción
npm run start        # Inicia el servidor de producción
npm run lint         # Ejecuta el linter
```

### Utilidades
```bash
# Generar favicons (requiere Sharp)
npm install sharp
node scripts/generate-favicons.js

# Generador web de favicons
open scripts/create-basic-favicons.html
```

### Deployment
```bash
npm run build        # Construir para producción
npm run start        # Servidor de producción
```

## 🎯 Roadmap y Características Futuras

### 🚀 Próximas Funcionalidades

- [ ] **📧 Integración con Email**: Notificaciones por correo electrónico
- [ ] **📱 App Móvil Nativa**: Aplicación React Native
- [ ] **🤖 IA y ML**: Predicciones de rendimiento estudiantil
- [ ] **📊 Analytics Avanzado**: Métricas más detalladas
- [ ] **🔗 Más Integraciones**: Canvas, Moodle, etc.
- [ ] **👥 Colaboración**: Herramientas de trabajo en equipo
- [ ] **📝 Evaluaciones**: Sistema de exámenes integrado

### 🛠️ Mejoras Técnicas

- [ ] **⚡ Performance**: Optimizaciones adicionales
- [ ] **🔒 Security**: Auditorías de seguridad
- [ ] **♿ Accessibility**: Mejoras de accesibilidad
- [ ] **🌐 i18n**: Soporte multiidioma
- [ ] **📊 Real-time**: WebSockets para datos en tiempo real

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. **🍴 Fork** el proyecto
2. **🌿 Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **📤 Push** a la rama (`git push origin feature/AmazingFeature`)
5. **🔄 Abre** un Pull Request

### 📋 Guidelines

- Sigue las convenciones de código existentes
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos y claros

## 📞 Soporte y Contacto

- **📧 Email**: soporte@semillerodigital.com
- **🐛 Issues**: [GitHub Issues](https://github.com/altovisual/semillerodigital/issues)
- **📖 Documentación**: [Wiki del Proyecto](https://github.com/altovisual/semillerodigital/wiki)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ por el equipo de Semillero Digital**

[![GitHub](https://img.shields.io/badge/GitHub-altovisual-black?style=flat-square&logo=github)](https://github.com/altovisual)
[![Website](https://img.shields.io/badge/Website-semillerodigital.com-blue?style=flat-square&logo=google-chrome)](https://semillerodigital.com)

</div>
