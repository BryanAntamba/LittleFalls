// Importación de Express - framework web para Node.js
const express = require('express');
// Importación de Mongoose - ODM para MongoDB
const mongoose = require('mongoose');
// Importación de CORS - permite peticiones cross-origin desde el frontend
const cors = require('cors');
// Carga variables de entorno desde archivo .env
require('dotenv').config();

// Crear instancia de la aplicación Express
const app = express();

// ========== MIDDLEWARES GLOBALES ==========
// Se ejecutan en todas las peticiones HTTP

// CORS: permite que el frontend (puerto 4200) se comunique con el backend (puerto 3000)
app.use(cors());
// Parsea el body de las peticiones con formato JSON
app.use(express.json());
// Parsea datos de formularios URL-encoded (application/x-www-form-urlencoded)
// extended: true permite objetos anidados y arrays
app.use(express.urlencoded({ extended: true }));

// ========== CONFIGURACIÓN DEL SERVIDOR ==========
// Puerto del servidor: usa variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;

// ========== CONEXIÓN A MONGODB ==========
// process.env.MONGODB_URI debe estar definida en .env
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        // Callback ejecutado cuando la conexión es exitosa
        console.log('Conectado al servidor MongoDB');
        
        // Obtener nombre de la base de datos conectada
        const dbName = mongoose.connection.db.databaseName;
        console.log(`Base de datos: ${dbName}`);
        
        // Listar todas las colecciones (tablas) en la base de datos
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        // Mostrar colecciones encontradas
        if (collections.length > 0) {
            console.log('Colecciones encontradas:');
            // forEach itera sobre cada colección
            collections.forEach(col => console.log(`   - ${col.name}`));
        } else {
            console.log('La base de datos está vacía');
        }
    })
    .catch((error) => {
        // Callback ejecutado si hay error en la conexión
        console.error('ERROR: No se pudo conectar a MongoDB');
        console.error(`Razón: ${error.message}`);
        // Terminar proceso con código de error 1
        process.exit(1);
    });

// ========== IMPORTACIÓN DE RUTAS ==========
// Cada archivo de rutas maneja un grupo de endpoints relacionados
const authRoutes = require('./routes/auth');         // Rutas de autenticación
const usuariosRoutes = require('./routes/usuarios'); // Rutas de usuarios
const citasRoutes = require('./routes/citas');       // Rutas de citas

// ========== REGISTRO DE RUTAS ==========
// app.use() monta las rutas en sus respectivos paths base
app.use('/api/auth', authRoutes);           // /api/auth/login, /api/auth/registro, etc.
app.use('/api/usuarios', usuariosRoutes);   // /api/usuarios, /api/usuarios/:id, etc.
app.use('/api/citas', citasRoutes);         // /api/citas, /api/citas/:id, etc.

// ========== RUTA RAÍZ (DOCUMENTACIÓN) ==========
// GET http://localhost:3000/
app.get('/', (req, res) => {
    // Retorna información sobre la API en formato JSON
    res.json({ 
        mensaje: 'API LittleFalls - Clínica Veterinaria',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                registro: 'POST /api/auth/registro',
                logout: 'POST /api/auth/logout',
                verify: 'GET /api/auth/verify'
            }
        }
    });
});

// ========== MIDDLEWARE DE MANEJO DE ERRORES ==========
// IMPORTANTE: Debe ir DESPUÉS de todas las rutas
// Captura errores lanzados por cualquier ruta o middleware anterior
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// ========== MANEJO DE RUTAS NO ENCONTRADAS (404) ==========
// Este middleware se ejecuta si ninguna ruta anterior coincidió
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: 'Ruta no encontrada'
    });
});

// ========== INICIAR SERVIDOR ==========
// Escucha peticiones HTTP en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
