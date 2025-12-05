const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Conectado al servidor MongoDB');
        
        const dbName = mongoose.connection.db.databaseName;
        console.log(`Base de datos: ${dbName}`);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        if (collections.length > 0) {
            console.log('Colecciones encontradas:');
            collections.forEach(col => console.log(`   - ${col.name}`));
        } else {
            console.log('La base de datos está vacía');
        }
    })
    .catch((error) => {
        console.error('ERROR: No se pudo conectar a MongoDB');
        console.error(`Razón: ${error.message}`);
        process.exit(1);
    });

// Rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const citasRoutes = require('./routes/citas');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/citas', citasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
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

// Middleware de manejo de errores (debe ir después de todas las rutas)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensaje: 'Ruta no encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
