# Integración con Google Classroom

Este documento resume los endpoints, scopes, rutas internas y notas de prueba/diagnóstico de la integración con Google Classroom en este proyecto.

## Endpoints API (Next.js)

- `GET /api/classroom/courses`
  - Lista cursos visibles para el usuario autenticado. Filtra `ACTIVE/PROVISIONED`.
  - Respuesta: `{ courses: Array<{ id, name, section?, ownerId? }> }`

- `GET /api/classroom/courses/[courseId]/students`
  - Lista estudiantes inscritos en el curso.
  - Respuesta: `{ students: Array<{ userId, profile: { id, name, email, photoUrl } }> }`

- `GET /api/classroom/courses/[courseId]/coursework`
  - Lista tareas del curso (courseWork).
  - Respuesta: `{ coursework: Array<{ id, title, description, state, dueDate, dueTime, maxPoints, workType, alternateLink, creatorUserId, topicId, creationTime, updateTime }> }`

- `GET /api/classroom/courses/[courseId]/submissions?courseworkId=...&userId=...`
  - Lista entregas (studentSubmissions). Si `userId` se omite, devuelve todas las del courseWork.
  - Respuesta: `{ submissions: Array<{ id, userId, state, late, assignedGrade, alternateLink, updateTime }> }`

- `GET /api/classroom/users/me`
  - Devuelve el perfil del usuario en Classroom. Útil para obtener `userId` de alumno sin permisos de roster.

- `GET /api/classroom/courses/[courseId]/teachers`
  - Lista profesores del curso. Usado por el filtro de Profesor en la vista de Coordinador.
  - Respuesta: `{ teachers: Array<{ userId, profile: { name, email, photoUrl } }> }`

## Rutas internas (UI)

- `GET /dashboard/student` – Panel de Estudiante
  - "Mis Tareas": lista consolidada de courseWork + mi submission; filtros por estado; badge de nota.
  - Botones: "Abrir en Classroom" (si aplica) y "Ver detalle" (in‑app).

- `GET /dashboard/teacher` – Panel de Profesor
  - Selector de curso/tarea; resumen por estado; tabla de entregas; nota y links.
  - "Abrir" (Classroom) y "Ver detalle" (in‑app).

- `GET /dashboard/coordinator` – Panel de Coordinador
  - Selector Curso (Cohorte) + Profesor + Estado; resumen por estado; tabla que incluye alumnos sin entrega.
  - Selector de Tarea con porcentaje de entregas completas: `completadas/total (porcentaje%)`.

- `GET /classroom/tasks/[courseId]/[workId]` – Vista de detalle in‑app
  - Muestra título, descripción, fecha de entrega, puntos, materiales (previsualización Drive si disponible).
  - Si el usuario es alumno: "Mi entrega" con estado/nota.
  - Si es profesor/coordinador: resumen y tabla de entregas del curso.
  - Botón "Abrir en Classroom" como respaldo.

## Scopes de OAuth

Actuales (solo lectura):
- Classroom read-only para cursos, tareas, entregas y perfil.
- Opcional: `drive.readonly` si se desea previsualizar archivos de Drive (según implementación).

Opcionales (acciones de escritura – requieren re-consent):
- `https://www.googleapis.com/auth/classroom.coursework.me`
- `https://www.googleapis.com/auth/classroom.coursework.students`
- `https://www.googleapis.com/auth/classroom.student-submissions.me`
- `https://www.googleapis.com/auth/classroom.student-submissions.students`

Con estos scopes se pueden habilitar acciones: `turnIn`, `reclaim`, `return`, calificar (`PATCH studentSubmissions`).

## Pruebas sugeridas

1. Login e ir a `/dashboard/student`. Seleccionar curso y verificar "Mis Tareas" con filtros y notas.
2. Abrir "Ver detalle" de una tarea y comprobar descripción, materiales y estado.
3. Ir a `/dashboard/teacher`, seleccionar curso/tarea y revisar tabla, resumen y enlaces.
4. Ir a `/dashboard/coordinator`, seleccionar Cohorte (curso), Profesor y Estado. Revisar que:
   - El selector Cohorte se filtra por el profesor.
   - El selector Tarea muestra `completadas/total (porcentaje%)`.
   - La tabla incluye alumnos sin entrega como "Faltante".

## Troubleshooting

- Si ves errores de autorización/expiración, re-autentica al usuario; el refresh token está configurado en `lib/auth-options.ts`.
- Si no aparecen estudiantes pero sí submissions, usa `GET /api/classroom/users/me` para asegurar `userId` del usuario activo.
- Si un archivo no previsualiza en Drive, mostrar enlace de apertura en nueva pestaña.
