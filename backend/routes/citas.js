const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verificarToken, verificarRol } = require('../middlewares/jwtMiddleware');
const { validarCreacionCita, validarActualizacionCita } = require('../middlewares/validators/citaValidator');

// Verificar disponibilidad de fecha y hora (sin autenticación)
router.post('/verificar-disponibilidad', 
    citaController.verificarDisponibilidad.bind(citaController)
);

// TODAS las rutas de citas siguientes requieren autenticación
router.use(verificarToken);

// Crear nueva cita (pacientes y admin)
router.post('/', 
    verificarRol('paciente', 'admin'),
    validarCreacionCita,
    citaController.crearCita.bind(citaController)
);

// Obtener todas las citas (admin y veterinarios)
router.get('/', 
    verificarRol('admin', 'veterinario'),
    citaController.obtenerTodasCitas.bind(citaController)
);

// Obtener citas por paciente (el mismo paciente o admin)
router.get('/paciente/:pacienteId', 
    citaController.obtenerCitasPorPaciente.bind(citaController)
);

// Obtener citas por veterinario (veterinario y admin)
router.get('/veterinario/:veterinarioId', 
    verificarRol('veterinario', 'admin'),
    citaController.obtenerCitasPorVeterinario.bind(citaController)
);

// Actualizar estado de cita (veterinario y admin)
router.patch('/:citaId/estado', 
    verificarRol('veterinario', 'admin'),
    citaController.actualizarEstadoCita.bind(citaController)
);

// Asignar veterinario a cita (admin)
router.patch('/:citaId/asignar', 
    verificarRol('admin'),
    citaController.asignarVeterinario.bind(citaController)
);

// Guardar registro clínico (veterinario)
router.post('/:citaId/registro-clinico', 
    verificarRol('veterinario'),
    citaController.guardarRegistroClinico.bind(citaController)
);

// Actualizar registro clínico (veterinario)
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
