// ========== IMPORTACIONES ==========
// Importar Express para crear el enrutador
const express = require('express');
// Crear instancia del enrutador para rutas de citas
const router = express.Router();

// Importar controlador con la lógica de negocio de citas
const citaController = require('../controllers/citaController');
// Importar middlewares de autenticación y autorización JWT
const { verificarToken, verificarRol } = require('../middlewares/jwtMiddleware');
// Importar middlewares de validación específicos para citas
const { validarCreacionCita, validarActualizacionCita } = require('../middlewares/validators/citaValidator');

// ========== RUTAS PÚBLICAS (sin autenticación) ==========

// POST /api/citas/verificar-disponibilidad
// Verificar si una fecha y hora están disponibles para agendar
// Public: cualquiera puede verificar disponibilidad antes de registrarse
router.post('/verificar-disponibilidad', 
    // .bind(citaController) asegura que 'this' dentro del método apunte al controlador
    citaController.verificarDisponibilidad.bind(citaController)
);

// ========== MIDDLEWARE GLOBAL PARA RUTAS PROTEGIDAS ==========
// router.use() aplica middleware a TODAS las rutas definidas DESPUÉS de esta línea
// Todas las rutas siguientes requieren token JWT válido
router.use(verificarToken);

// ========== RUTAS PROTEGIDAS (requieren autenticación) ==========

// POST /api/citas
// Crear nueva cita en el sistema
// Acceso: pacientes (para ellos mismos) y admin
router.post('/', 
    verificarRol('paciente', 'admin'),  // Solo estos roles pueden crear citas
    validarCreacionCita,                 // Valida campos requeridos de la cita
    citaController.crearCita.bind(citaController)
);

// GET /api/citas
// Obtener listado completo de todas las citas
// Acceso: admin (gestión completa) y veterinario (ver todas para asignación)
router.get('/', 
    verificarRol('admin', 'veterinario'),
    citaController.obtenerTodasCitas.bind(citaController)
);

// GET /api/citas/paciente/:pacienteId
// Obtener todas las citas de un paciente específico
// :pacienteId = parámetro dinámico en la URL
// Acceso: el mismo paciente o admin (controlador valida que sea el mismo usuario)
router.get('/paciente/:pacienteId', 
    citaController.obtenerCitasPorPaciente.bind(citaController)
);

// GET /api/citas/veterinario/:veterinarioId
// Obtener citas asignadas a un veterinario específico
// Acceso: veterinarios (sus propias citas) y admin
router.get('/veterinario/:veterinarioId', 
    verificarRol('veterinario', 'admin'),
    citaController.obtenerCitasPorVeterinario.bind(citaController)
);

// PATCH /api/citas/:citaId/estado
// Actualizar el estado de una cita (pendiente, confirmada, cancelada, completada)
// PATCH = actualización parcial (solo el estado)
// Acceso: veterinarios y admin
router.patch('/:citaId/estado', 
    verificarRol('veterinario', 'admin'),
    citaController.actualizarEstadoCita.bind(citaController)
);

// PATCH /api/citas/:citaId/asignar
// Asignar un veterinario a una cita
// Acceso: solo admin (gestión de recursos)
router.patch('/:citaId/asignar', 
    verificarRol('admin'),
    citaController.asignarVeterinario.bind(citaController)
);

// POST /api/citas/:citaId/registro-clinico
// Guardar el registro clínico de una consulta (diagnóstico, tratamiento, etc.)
// Acceso: solo veterinarios (documentación médica)
router.post('/:citaId/registro-clinico', 
    verificarRol('veterinario'),
    citaController.guardarRegistroClinico.bind(citaController)
);

// PUT /api/citas/:citaId/registro-clinico
// Actualizar un registro clínico existente
// PUT = actualización completa del registro
// Acceso: solo veterinarios
router.put('/:citaId/registro-clinico', 
    verificarRol('veterinario'),
    citaController.actualizarRegistroClinico.bind(citaController)
);

// Actualizar cita completa (admin y veterinario)
router.put('/:citaId', 
    verificarRol('veterinario', 'admin'),
    validarActualizacionCita,
    citaController.actualizarCita.bind(citaController)
);

// Eliminar cita (admin)
router.delete('/:citaId', 
    verificarRol('admin'),
    citaController.eliminarCita.bind(citaController)
);

// Marcar cita como revisada (veterinario)
router.patch('/:citaId/revisada', 
    verificarRol('veterinario'),
    citaController.marcarComoRevisada.bind(citaController)
);

// Obtener citas activas (no revisadas) por veterinario
router.get('/veterinario/:veterinarioId/activas', 
    verificarRol('veterinario', 'admin'),
    citaController.obtenerCitasActivas.bind(citaController)
);

// Obtener historial de citas revisadas por veterinario
router.get('/veterinario/:veterinarioId/historial', 
    verificarRol('veterinario', 'admin'),
    citaController.obtenerHistorialCitas.bind(citaController)
);

module.exports = router;
