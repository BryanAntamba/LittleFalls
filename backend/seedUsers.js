const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Importar el modelo de Usuario
const Usuario = require('./models/Usuario');

const crearUsuariosIniciales = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Verificar si ya existen usuarios
        const usuariosExistentes = await Usuario.find({ 
            tipoUsuario: { $in: ['admin', 'veterinario'] } 
        });

        if (usuariosExistentes.length > 0) {
            console.log('Ya existen usuarios admin o veterinario:');
            usuariosExistentes.forEach(u => {
                console.log(`   - ${u.tipoUsuario}: ${u.correo}`);
            });
            
            const respuesta = await preguntarSiContinuar();
            if (!respuesta) {
                console.log('Operación cancelada');
                process.exit(0);
            }
        }

        // Hashear contraseñas (mínimo 8 caracteres: solo letras y números)
        const passwordAdmin = await bcrypt.hash('admin123', 10);
        const passwordVeterinario = await bcrypt.hash('vet12345', 10);

        // Crear usuario Administrador
        const admin = new Usuario({
            nombre: 'Admin',
            apellido: 'Sistema',
            edad: 30,
            correo: 'admin@littlefalls.com',
            password: passwordAdmin,
            tipoUsuario: 'admin',
            verificado: true,
            activo: true
        });

        // Crear usuario Veterinario
        const veterinario = new Usuario({
            nombre: 'Dr. Carlos',
            apellido: 'Veterinario',
            edad: 35,
            correo: 'veterinario@littlefalls.com',
            password: passwordVeterinario,
            tipoUsuario: 'veterinario',
            verificado: true,
            activo: true
        });

        // Guardar usuarios
        await admin.save();
        console.log('Usuario Administrador creado:');
        console.log('Correo: admin@littlefalls.com');
        console.log('Contraseña: admin123');

        await veterinario.save();
        console.log('Usuario Veterinario creado:');
        console.log('Correo: veterinario@littlefalls.com');
        console.log('Contraseña: vet12345');

        console.log('\nUsuarios creados exitosamente!');
        console.log('\nPuedes iniciar sesión con:');
        console.log('─────────────────────────────────────────────');
        console.log('ADMINISTRADOR');
        console.log('Correo: admin@littlefalls.com');
        console.log('Contraseña: admin123');
        console.log('─────────────────────────────────────────────');
        console.log('VETERINARIO');
        console.log('Correo: veterinario@littlefalls.com');
        console.log('Contraseña: vet12345');

    } catch (error) {
        if (error.code === 11000) {
            console.error('Error: Ya existe un usuario con ese correo');
            console.log('\nUsuarios existentes en la base de datos:');
            const usuarios = await Usuario.find({});
            usuarios.forEach(u => {
                console.log(`   - ${u.tipoUsuario}: ${u.correo}`);
            });
        } else {
            console.error('Error al crear usuarios:', error.message);
        }
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
};

// Función para preguntar si continuar (simple versión sin readline)
async function preguntarSiContinuar() {
    // Por simplicidad, retornamos true. Si quieres confirmación manual, 
    // puedes comentar esta línea y descomentar la siguiente sección
    return true;
    
    /* Si quieres confirmación manual, descomenta esto:
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise(resolve => {
        readline.question('¿Deseas crear nuevos usuarios de todas formas? (s/n): ', respuesta => {
            readline.close();
            resolve(respuesta.toLowerCase() === 's');
        });
    });
    */
}

// Ejecutar
crearUsuariosIniciales();
