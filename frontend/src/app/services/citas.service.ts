import { Injectable } from '@angular/core';

/**
 * Servicio compartido para gestionar las citas y sus registros clínicos
 * Este servicio actúa como fuente única de verdad para los datos
 * y permite compartir información entre componentes
 */
@Injectable({
    providedIn: 'root' // Hace que el servicio esté disponible en toda la aplicación
})
export class CitasService {

    // Array principal que almacena todas las citas con sus historiales
    private citas = [
        {
            nombre: 'Bryan',
            apellido: 'Justin',
            correo: 'bryan123@gmail.com',
            telefono: '0995336712',
            nombreMascota: 'Maxi',
            edadMascota: '3',
            generoMascota: 'Macho',
            tipoMascota: 'Gato',
            descripcion: 'Mi mascota es un gato angora de 3 años que esta teniendo problemas al caminar y nose que es y necesito su ayuda para que le revicen porfavor.',
            registroClinico: {
                fechaConsulta: '2025-11-15',
                motivoConsulta: 'Dificultad para caminar',
                sintomas: 'El gato presenta cojera en la pata trasera derecha, muestra dolor al saltar y camina con dificultad',
                peso: '4.5',
                temperatura: '38.5',
                frecuenciaCardiaca: '140',
                frecuenciaRespiratoria: '30',
                condicionCorporal: '3',
                diagnostico: 'Esguince leve en la articulación de la pata trasera derecha',
                tratamiento: 'Antiinflamatorio (Meloxicam 0.1mg/kg) una vez al día durante 5 días. Reposo relativo.',
                procedimientos: 'Examen físico completo, palpación de extremidades',
                proximaCita: '2025-11-22',
                tipoVacuna: '',
                fechaVacuna: '',
                proximaDosis: '',
                fotoCarnet: null,
                imagenesExamenes: []
            }
        },
        {
            nombre: 'María',
            apellido: 'Gómez',
            correo: 'maria4000@gmail.com',
            telefono: '09178126643',
            nombreMascota: 'Kary',
            edadMascota: '5',
            generoMascota: 'Hembra',
            tipoMascota: 'Perro',
            descripcion: 'Buenas noches, necesito su ayuda ya que mi perrito de 5 añitos no quiere comer nada y solo pasa acostado y canzado, necesito que me ayuden con mi mascota, les agradeceria mucho.',
            registroClinico: {
                fechaConsulta: '2025-11-18',
                motivoConsulta: 'Pérdida de apetito y letargo',
                sintomas: 'La perra no ha comido en 2 días, se muestra apática, duerme más de lo habitual, rechaza el alimento y las golosinas',
                peso: '12.8',
                temperatura: '39.2',
                frecuenciaCardiaca: '110',
                frecuenciaRespiratoria: '35',
                condicionCorporal: '2',
                diagnostico: 'Gastroenteritis leve, posiblemente causada por cambio de alimentación o ingesta inadecuada',
                tratamiento: 'Metoclopramida 0.5mg/kg cada 8 horas durante 3 días. Omeprazol 1mg/kg cada 24 horas durante 5 días. Dieta blanda (pollo hervido con arroz) durante 3 días.',
                procedimientos: 'Examen físico, palpación abdominal, toma de temperatura',
                proximaCita: '2025-11-21',
                tipoVacuna: '',
                fechaVacuna: '',
                proximaDosis: '',
                fotoCarnet: null,
                imagenesExamenes: []
            }
        }
    ];

    /**
     * Obtiene todas las citas
     * Retorna una referencia directa al array para mantener reactividad
     */
    getCitas() {
        return this.citas;
    }

    /**
     * Obtiene una cita específica por índice
     */
    getCita(indice: number) {
        return this.citas[indice];
    }

    /**
     * Actualiza una cita completa
     */
    actualizarCita(indice: number, cita: any) {
        if (indice >= 0 && indice < this.citas.length) {
            this.citas[indice] = cita;
        }
    }

    /**
     * Elimina una cita
     */
    eliminarCita(indice: number) {
        if (indice >= 0 && indice < this.citas.length) {
            this.citas.splice(indice, 1);
        }
    }

    /**
     * Agrega un nuevo registro clínico a una cita específica
     * Como solo hay un registro por mascota, esto reemplaza el registro existente
     */
    agregarRegistroClinico(indiceCita: number, registro: any) {
        if (indiceCita >= 0 && indiceCita < this.citas.length) {
            this.citas[indiceCita].registroClinico = {
                ...registro
            };
            return this.citas[indiceCita].registroClinico;
        }
        return null;
    }

    /**
     * Actualiza el registro clínico de una mascota
     */
    actualizarRegistroClinico(indiceCita: number, registro: any) {
        if (indiceCita >= 0 && indiceCita < this.citas.length) {
            this.citas[indiceCita].registroClinico = {
                ...registro
            };
        }
    }

    /**
     * Busca una mascota por nombre
     */
    buscarMascotaPorNombre(nombre: string) {
        return this.citas.filter(cita =>
            cita.nombreMascota.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}
