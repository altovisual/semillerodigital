-- Seed data for Semillero Digital Progress Tracker
-- This script populates the database with initial test data

-- Insert users (coordinators, teachers, students)
INSERT INTO users (email, password_hash, name, role, avatar_url) VALUES
-- Coordinators
('coordinator@semillero.com', '$2b$10$example_hash_1', 'Ana Coordinadora', 'coordinator', '/coordinator-ana.jpg'),

-- Teachers
('juan.perez@semillero.com', '$2b$10$example_hash_2', 'Juan Pérez', 'teacher', '/placeholder-w3xp6.png'),
('maria.gomez@semillero.com', '$2b$10$example_hash_3', 'María Gómez', 'teacher', '/student-ana.jpg'),

-- Students
('maria.gonzalez@email.com', '$2b$10$example_hash_4', 'María González', 'student', '/student-maria.png'),
('carlos.rodriguez@email.com', '$2b$10$example_hash_5', 'Carlos Rodríguez', 'student', '/placeholder-w3xp6.png'),
('juan.perez.student@email.com', '$2b$10$example_hash_6', 'Juan Pérez', 'student', '/placeholder-y1fn1.png'),
('ana.martinez@email.com', '$2b$10$example_hash_7', 'Ana Martínez', 'student', '/student-ana.jpg'),
('diego.lopez@email.com', '$2b$10$example_hash_8', 'Diego López', 'student', '/student-diego.jpg'),
('sofia.herrera@email.com', '$2b$10$example_hash_9', 'Sofia Herrera', 'student', '/student-sofia.jpg');

-- Insert cohorts
INSERT INTO cohorts (name, description, start_date, end_date, status) VALUES
('Desarrollo Web - 2025 Q1', 'Cohorte de desarrollo web frontend y backend', '2025-01-15', '2025-04-15', 'active'),
('Diseño UX/UI - 2025 Q1', 'Cohorte de diseño de experiencia e interfaz de usuario', '2025-01-15', '2025-04-15', 'active'),
('Data Science - 2024 Q4', 'Cohorte de ciencia de datos y análisis', '2024-10-15', '2025-01-15', 'completed');

-- Insert subjects
INSERT INTO subjects (name, description, color) VALUES
('JavaScript Fundamentals', 'Conceptos básicos de JavaScript y programación', '#f59e0b'),
('React Components', 'Desarrollo de componentes en React', '#3b82f6'),
('Node.js Backend', 'Desarrollo de APIs con Node.js', '#10b981'),
('Database Design', 'Diseño y modelado de bases de datos', '#8b5cf6'),
('UI/UX Principles', 'Principios de diseño de interfaz y experiencia', '#ec4899'),
('Data Analysis', 'Análisis de datos con Python', '#06b6d4');

-- Enroll students in cohorts
INSERT INTO student_cohorts (student_id, cohort_id, enrollment_date, status) VALUES
-- Desarrollo Web cohort
(4, 1, '2025-01-15', 'active'), -- María González
(5, 1, '2025-01-15', 'active'), -- Carlos Rodríguez
(8, 1, '2025-01-15', 'active'), -- Diego López

-- UX/UI cohort
(6, 2, '2025-01-15', 'active'), -- Juan Pérez
(9, 2, '2025-01-15', 'active'), -- Sofia Herrera

-- Data Science cohort
(7, 3, '2024-10-15', 'completed'); -- Ana Martínez

-- Assign teachers to cohorts and subjects
INSERT INTO teacher_assignments (teacher_id, cohort_id, subject_id, assigned_date) VALUES
-- Juan Pérez teaching JavaScript and Node.js to Web Dev cohort
(2, 1, 1, '2025-01-15'), -- JavaScript Fundamentals
(2, 1, 3, '2025-01-15'), -- Node.js Backend

-- María Gómez teaching React to Web Dev cohort and UI/UX to UX cohort
(3, 1, 2, '2025-01-15'), -- React Components
(3, 2, 5, '2025-01-15'); -- UI/UX Principles

-- Create sample tasks
INSERT INTO tasks (title, description, subject_id, cohort_id, teacher_id, due_date, max_score, instructions) VALUES
('Proyecto Final React', 'Desarrollar una aplicación completa en React con componentes reutilizables', 2, 1, 3, '2025-02-15 23:59:00', 100.00, 'Crear una aplicación de gestión de tareas usando React, React Router y Context API'),
('Ejercicios JavaScript', 'Completar ejercicios de funciones, arrays y objetos', 1, 1, 2, '2025-01-25 23:59:00', 50.00, 'Resolver los ejercicios del módulo 3 disponibles en la plataforma'),
('API REST con Node.js', 'Crear una API REST completa con autenticación', 3, 1, 2, '2025-03-01 23:59:00', 80.00, 'Desarrollar una API con CRUD completo y middleware de autenticación'),
('Diseño de Wireframes', 'Crear wireframes para una aplicación móvil', 5, 2, 3, '2025-02-10 23:59:00', 60.00, 'Diseñar wireframes de baja y alta fidelidad para una app de delivery'),
('Análisis de Datos', 'Análisis exploratorio de dataset de ventas', 6, 3, 2, '2024-12-15 23:59:00', 70.00, 'Realizar análisis completo con visualizaciones en Python');

-- Create sample task submissions
INSERT INTO task_submissions (task_id, student_id, submission_url, submission_text, submitted_at, score, feedback, status, graded_at, graded_by) VALUES
-- Completed submissions
(2, 4, 'https://github.com/maria/js-exercises', 'Ejercicios completados con todas las funciones implementadas', '2025-01-24 18:30:00', 48.00, 'Excelente trabajo, muy bien estructurado', 'graded', '2025-01-25 10:00:00', 2),
(2, 5, 'https://github.com/carlos/js-exercises', 'Ejercicios resueltos', '2025-01-25 22:45:00', 42.00, 'Buen trabajo, revisar la función de ordenamiento', 'graded', '2025-01-26 09:00:00', 2),
(4, 6, 'https://figma.com/wireframes-juan', 'Wireframes completos para app de delivery', '2025-02-09 16:20:00', 55.00, 'Muy buen diseño, considerar más estados de la aplicación', 'graded', '2025-02-10 11:00:00', 3),
(5, 7, 'https://github.com/ana/data-analysis', 'Análisis completo con visualizaciones', '2024-12-14 20:15:00', 68.00, 'Análisis muy detallado, excelentes insights', 'graded', '2024-12-16 14:00:00', 2),

-- Pending submissions
(1, 4, 'https://github.com/maria/react-project', 'Proyecto en desarrollo, falta testing', '2025-02-14 19:30:00', NULL, NULL, 'submitted', NULL, NULL),
(3, 5, NULL, NULL, NULL, NULL, NULL, 'missing', NULL, NULL);

-- Create sample classes
INSERT INTO classes (title, description, subject_id, cohort_id, teacher_id, start_time, end_time, location, meeting_url, status) VALUES
('JavaScript Fundamentals - Introducción', 'Primera clase de JavaScript, variables y funciones', 1, 1, 2, '2025-01-15 09:00:00', '2025-01-15 11:00:00', 'Aula Virtual 1', 'https://meet.google.com/abc-defg-hij', 'completed'),
('React Components Workshop', 'Taller práctico de componentes React', 2, 1, 3, '2025-01-22 14:00:00', '2025-01-22 16:00:00', 'Laboratorio 2', 'https://meet.google.com/xyz-uvwx-yz', 'completed'),
('Node.js Backend - APIs', 'Desarrollo de APIs REST con Node.js', 3, 1, 2, '2025-01-29 09:00:00', '2025-01-29 11:00:00', 'Aula Virtual 1', 'https://meet.google.com/node-api-class', 'scheduled'),
('UX Research Methods', 'Métodos de investigación en UX', 5, 2, 3, '2025-01-30 10:00:00', '2025-01-30 12:00:00', 'Aula de Diseño', 'https://meet.google.com/ux-research', 'scheduled');

-- Record class attendance
INSERT INTO class_attendance (class_id, student_id, status, marked_at, marked_by, notes) VALUES
-- JavaScript class attendance
(1, 4, 'present', '2025-01-15 09:05:00', 2, NULL),
(1, 5, 'present', '2025-01-15 09:10:00', 2, NULL),
(1, 8, 'absent', '2025-01-15 11:00:00', 2, 'Sin justificación'),

-- React workshop attendance
(2, 4, 'present', '2025-01-22 14:02:00', 3, NULL),
(2, 5, 'present', '2025-01-22 14:05:00', 3, NULL),
(2, 8, 'late', '2025-01-22 14:25:00', 3, 'Llegó 25 minutos tarde');

-- Create sample notifications
INSERT INTO notifications (user_id, title, message, type, priority, read_at, created_at) VALUES
(4, 'Nueva tarea asignada', 'Se ha asignado una nueva tarea: Proyecto Final React', 'task', 'high', NULL, '2025-01-20 10:00:00'),
(4, 'Recordatorio de entrega', 'La tarea "Ejercicios JavaScript" vence mañana', 'reminder', 'medium', NULL, '2025-01-24 08:00:00'),
(4, 'Calificación disponible', 'Tu tarea "Ejercicios JavaScript" ha sido calificada: 48/50', 'grade', 'low', '2025-01-25 12:00:00', '2025-01-25 10:30:00'),
(5, 'Nueva tarea asignada', 'Se ha asignado una nueva tarea: API REST con Node.js', 'task', 'medium', NULL, '2025-01-25 15:00:00'),
(8, 'Recordatorio de asistencia', 'Tienes clase de Node.js mañana a las 09:00', 'attendance', 'medium', NULL, '2025-01-28 18:00:00');

-- Set up notification preferences
INSERT INTO notification_preferences (user_id, email_enabled, whatsapp_enabled, telegram_enabled, task_updates, reminders, grades, attendance) VALUES
(4, true, false, false, true, true, true, true),
(5, true, true, false, true, true, true, false),
(6, true, false, true, true, true, true, true),
(7, true, true, true, true, true, true, true),
(8, true, false, false, true, false, true, true),
(9, true, true, false, true, true, true, true);

-- Calculate and insert student progress
INSERT INTO student_progress (student_id, cohort_id, subject_id, progress_percentage, last_activity, total_tasks, completed_tasks, on_time_submissions, late_submissions, missing_submissions, average_score) VALUES
-- María González progress
(4, 1, 1, 95.0, '2025-01-24 18:30:00', 2, 2, 2, 0, 0, 48.0),
(4, 1, 2, 85.0, '2025-02-14 19:30:00', 1, 0, 0, 0, 0, NULL),

-- Carlos Rodríguez progress  
(5, 1, 1, 78.0, '2025-01-25 22:45:00', 2, 1, 1, 0, 1, 42.0),
(5, 1, 3, 0.0, NULL, 1, 0, 0, 0, 1, NULL),

-- Juan Pérez progress
(6, 2, 5, 88.0, '2025-02-09 16:20:00', 1, 1, 1, 0, 0, 55.0),

-- Ana Martínez progress
(7, 3, 6, 95.0, '2024-12-14 20:15:00', 1, 1, 1, 0, 0, 68.0),

-- Diego López progress
(8, 1, 1, 67.0, '2025-01-20 10:00:00', 2, 0, 0, 0, 2, NULL);
