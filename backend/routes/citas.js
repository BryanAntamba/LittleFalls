const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');

// Crear nueva cita
router.post('/', citaController.crearCita.bind(citaController));

// Obtener todas las citas
router.get('/', citaController.obtenerTodasCitas.bind(citaController));

// Obtener citas por paciente
router.get('/paciente/:pacienteId', citaController.obtenerCitasPorPaciente.bind(citaController));

// Obtener citas por veterinario
router.get('/veterinario/:veterinarioId', citaController.obtenerCitasPorVeterinario.bind(citaController));

// Actualizar estado de cita
router.patch('/:citaId/estado', citaController.actualizarEstadoCita.bind(citaController));

// Asignar veterinario a cita
router.patch('/:citaId/asignar', citaController.asignarVeterinario.bind(citaController));

// Eliminar cita
router.delete('/:citaId', citaController.eliminarCita.bind(citaController));

module.exports = router;
