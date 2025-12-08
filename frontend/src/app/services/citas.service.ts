// Importación del decorador Injectable desde el core de Angular
// Este decorador permite que la clase sea inyectable como servicio en otros componentes
import { Injectable } from '@angular/core';

// Decorador que marca esta clase como un servicio inyectable
// providedIn: 'root' significa que Angular creará una única instancia (singleton)
// que estará disponible en toda la aplicación
@Injectable({
    providedIn: 'root'
})
export class CitasService {
    // URL base de la API REST del backend para el módulo de citas
    // private: solo accesible dentro de esta clase
    private apiUrl = 'http://localhost:3000/api/citas';

    // Constructor vacío - no requiere inyección de dependencias
    constructor() { }

    /**
     * Método privado que construye los headers HTTP necesarios para las peticiones
     * Incluye el token de autenticación JWT almacenado en localStorage
     * @returns HeadersInit - Objeto con los headers de la petición HTTP
     */
    private getHeaders(): HeadersInit {
        // Obtiene el token de acceso JWT del almacenamiento local del navegador
        const token = localStorage.getItem('accessToken');
        // Retorna un objeto con los headers necesarios
        return {
            // Indica que el contenido enviado/recibido es JSON
            'Content-Type': 'application/json',
            // Operador ternario: si existe token, envía "Bearer {token}", sino envía string vacío
            // El formato "Bearer" es el estándar para JWT en HTTP Authorization header
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    /**
     * Crea una nueva cita médica en el sistema
     * @param datos - Objeto con la información de la cita (mascota, fecha, motivo, etc.)
     * @returns Promise<any> - Promesa que resuelve con la respuesta del servidor
     */
    async crearCita(datos: any): Promise<any> {
        try {
            // Realiza una petición HTTP POST al endpoint de citas
            // fetch es una API nativa del navegador para hacer peticiones HTTP
            const response = await fetch(this.apiUrl, {
                method: 'POST', // Método HTTP POST para crear recursos
                headers: this.getHeaders(), // Headers con autenticación y content-type
                body: JSON.stringify(datos) // Convierte el objeto datos a JSON string
            });
            // await pausa la ejecución hasta que la promesa se resuelva
            // .json() parsea la respuesta HTTP como JSON
            return await response.json();
        } catch (error) {
            // Captura cualquier error de red o del servidor
            // Retorna un objeto estandarizado de error para mantener consistencia
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene todas las citas del sistema
     * Solo accesible para administradores y veterinarios
     * @returns Promise<any> - Promesa con el array de todas las citas
     */
    async obtenerTodasCitas(): Promise<any> {
        try {
            // Petición HTTP GET (método por defecto de fetch)
            const response = await fetch(this.apiUrl, {
                headers: this.getHeaders() // Solo headers, sin body en GET
            });
            // Parsea y retorna la respuesta JSON
            return await response.json();
        } catch (error) {
            // Manejo de errores consistente
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene todas las citas de un paciente específico
     * @param pacienteId - ID del usuario paciente
     * @returns Promise<any> - Promesa con las citas del paciente
     */
    async obtenerCitasPorPaciente(pacienteId: string): Promise<any> {
        try {
            // Template literal (backticks) permite interpolar variables en strings
            // Construye URL dinámica: /api/citas/paciente/{id}
            const response = await fetch(`${this.apiUrl}/paciente/${pacienteId}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene todas las citas asignadas a un veterinario específico
     * @param veterinarioId - ID del usuario veterinario
     * @returns Promise<any> - Promesa con las citas del veterinario
     */
    async obtenerCitasPorVeterinario(veterinarioId: string): Promise<any> {
        try {
            // URL: /api/citas/veterinario/{id}
            const response = await fetch(`${this.apiUrl}/veterinario/${veterinarioId}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene solo las citas activas (pendientes/en curso) de un veterinario
     * Excluye citas completadas o canceladas
     * @param veterinarioId - ID del usuario veterinario
     * @returns Promise<any> - Promesa con las citas activas
     */
    async obtenerCitasActivas(veterinarioId: string): Promise<any> {
        try {
            // URL: /api/citas/veterinario/{id}/activas
            // Endpoint específico para filtrar solo citas activas
            const response = await fetch(`${this.apiUrl}/veterinario/${veterinarioId}/activas`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene el historial de citas completadas de un veterinario
     * @param veterinarioId - ID del usuario veterinario
     * @returns Promise<any> - Promesa con el historial de citas
     */
    async obtenerHistorialCitas(veterinarioId: string): Promise<any> {
        try {
            // URL: /api/citas/veterinario/{id}/historial
            // Endpoint para citas históricas (completadas)
            const response = await fetch(`${this.apiUrl}/veterinario/${veterinarioId}/historial`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Actualiza el estado de una cita (pendiente, en curso, completada, cancelada)
     * @param citaId - ID de la cita a actualizar
     * @param estado - Nuevo estado de la cita
     * @returns Promise<any> - Promesa con la confirmación de actualización
     */
    async actualizarEstadoCita(citaId: string, estado: string): Promise<any> {
        try {
            // URL: /api/citas/{id}/estado
            const response = await fetch(`${this.apiUrl}/${citaId}/estado`, {
                method: 'PATCH', // PATCH para actualización parcial (solo un campo)
                headers: this.getHeaders(),
                // Shorthand property: { estado } es equivalente a { estado: estado }
                body: JSON.stringify({ estado })
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Asigna un veterinario a una cita que inicialmente no tenía uno
     * Solo accesible para administradores
     * @param citaId - ID de la cita
     * @param veterinarioId - ID del veterinario a asignar
     * @returns Promise<any> - Promesa con la confirmación de asignación
     */
    async asignarVeterinario(citaId: string, veterinarioId: string): Promise<any> {
        try {
            // URL: /api/citas/{id}/asignar
            const response = await fetch(`${this.apiUrl}/${citaId}/asignar`, {
                method: 'PATCH', // PATCH para actualización parcial
                headers: this.getHeaders(),
                body: JSON.stringify({ veterinarioId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Elimina permanentemente una cita del sistema
     * Solo accesible para administradores
     * @param citaId - ID de la cita a eliminar
     * @returns Promise<any> - Promesa con la confirmación de eliminación
     */
    async eliminarCita(citaId: string): Promise<any> {
        try {
            // URL: /api/citas/{id}
            const response = await fetch(`${this.apiUrl}/${citaId}`, {
                method: 'DELETE', // DELETE para eliminación de recursos
                headers: this.getHeaders()
                // DELETE no lleva body
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // ========== MÉTODOS DE CACHE LOCAL ==========
    // Los siguientes métodos manejan un cache local de citas
    // para mejorar el performance y permitir operaciones sin conexión

    /**
     * Array privado que almacena las citas en memoria
     * Actúa como cache local para evitar peticiones repetidas al servidor
     */
    private citasData: any[] = [];

    /**
     * Carga todas las citas desde el servidor y las almacena en cache local
     * Método principal para inicializar el cache de citas
     * @returns Promise<void> - No retorna valor, modifica citasData internamente
     */
    async cargarCitas(): Promise<void> {
        // Log para debugging - indica inicio de carga
        console.log('Servicio - Cargando citas desde API...');
        // Llama al método que hace la petición HTTP
        const resultado = await this.obtenerTodasCitas();
        // Log del resultado completo para debugging
        console.log('Servicio - Resultado de API:', resultado);
        // Verifica si la petición fue exitosa
        if (resultado.success) {
            // Asigna el array de citas al cache local
            this.citasData = resultado.citas;
            // Log de confirmación con cantidad de citas cargadas
            console.log('Servicio - Citas almacenadas:', this.citasData.length);
        } else {
            // Si falla, registra el error en consola
            console.error('Servicio - Error al cargar citas:', resultado);
        }
    }

    /**
     * Obtiene una cita específica del cache local por su índice
     * @param indice - Posición de la cita en el array citasData
     * @returns La cita en esa posición o undefined si no existe
     */
    getCita(indice: number) {
        // Acceso directo por índice al array
        // Retorna undefined automáticamente si el índice no existe
        return this.citasData[indice];
    }

    /**
     * Obtiene el array completo de citas del cache local
     * @returns Array con todas las citas almacenadas en memoria
     */
    getCitas() {
        // Retorna referencia directa al array (no es una copia)
        return this.citasData;
    }

    /**
     * Agrega un nuevo registro clínico a una cita en el cache local
     * @param indice - Posición de la cita en citasData
     * @param registro - Objeto con el registro clínico (diagnóstico, tratamiento, etc.)
     * @returns El registro agregado
     */
    agregarRegistroClinico(indice: number, registro: any) {
        // Verifica que la cita existe en el índice especificado
        if (this.citasData[indice]) {
            // Si la cita no tiene el array de registros clínicos, lo inicializa
            if (!this.citasData[indice].registrosClinicosHistorial) {
                // Inicializa como array vacío
                this.citasData[indice].registrosClinicosHistorial = [];
            }
            // Agrega el nuevo registro al final del array usando push()
            this.citasData[indice].registrosClinicosHistorial.push(registro);
        }
        // Retorna el registro para confirmación
        return registro;
    }

    /**
     * Actualiza los datos de una cita en el cache local
     * Usa spread operator para merge de propiedades
     * @param indice - Posición de la cita en citasData
     * @param datos - Objeto con las propiedades a actualizar
     */
    actualizarCita(indice: number, datos: any) {
        // Verifica que la cita existe
        if (this.citasData[indice]) {
            // Spread operator (...) crea un nuevo objeto combinando:
            // 1. Todas las propiedades de la cita existente
            // 2. Todas las propiedades de datos (sobrescribe las existentes)
            this.citasData[indice] = { ...this.citasData[indice], ...datos };
        }
    }

    /**
     * Actualiza un registro clínico específico dentro de una cita
     * @param indice - Posición de la cita en citasData
     * @param registro - Nuevo objeto de registro clínico
     * @param indiceRegistro - Posición del registro a actualizar (opcional)
     *                         Si no se provee, actualiza el último registro
     */
    actualizarRegistroClinico(indice: number, registro: any, indiceRegistro?: number) {
        // Verifica que la cita existe Y que tiene array de registros
        if (this.citasData[indice] && this.citasData[indice].registrosClinicosHistorial) {
            // Operador ternario para determinar qué registro actualizar:
            // Si indiceRegistro !== undefined, usa ese valor
            // Si no, calcula el índice del último elemento (length - 1)
            const idx = indiceRegistro !== undefined 
                ? indiceRegistro 
                : this.citasData[indice].registrosClinicosHistorial.length - 1;
            
            // Valida que el índice calculado está dentro de los límites del array
            // idx >= 0: no es negativo
            // idx < length: no excede el tamaño del array
            if (idx >= 0 && idx < this.citasData[indice].registrosClinicosHistorial.length) {
                // Reemplaza el registro en la posición especificada
                this.citasData[indice].registrosClinicosHistorial[idx] = registro;
            }
        }
    }

    /**
     * Elimina una cita del cache local (no la elimina del servidor)
     * @param indice - Posición de la cita a eliminar en citasData
     */
    eliminarCitaLocal(indice: number) {
        // Valida que el índice está dentro del rango válido del array
        if (indice >= 0 && indice < this.citasData.length) {
            // splice() modifica el array original
            // Parámetros: (posición, cantidad_a_eliminar)
            // Elimina 1 elemento en la posición 'indice'
            this.citasData.splice(indice, 1);
        }
    }
}
