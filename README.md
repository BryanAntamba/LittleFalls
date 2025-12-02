# ========================================
# README - Sistema LittleFalls
# Sistema de Gestión Veterinaria
# ========================================

## 📋 Descripción

Sistema web completo para la gestión de una clínica veterinaria que incluye:
- Gestión de usuarios (Admin, Veterinarios, Pacientes)
- Sistema de citas médicas
- Registros clínicos de mascotas
- Historial médico completo
- Recuperación de contraseña
- Autenticación con JWT

## 🏗️ Estructura del Proyecto

```
LittleFalls/
├── backend/          # API REST con Node.js y Express
│   ├── controllers/  # Controladores de rutas
│   ├── middlewares/  # Middlewares de autenticación y validación
│   ├── models/       # Modelos de MongoDB (Mongoose)
│   ├── routes/       # Definición de rutas
│   └── services/     # Lógica de negocio
│
└── frontend/         # Aplicación Angular
    └── src/
        ├── app/
        │   ├── components/  # Componentes de la UI
        │   ├── guards/      # Guards de rutas
        │   └── services/    # Servicios HTTP
        └── assets/
```

## 🚀 Requisitos Previos

- **Node.js** v18 o superior
- **MongoDB** v6 o superior (local o Atlas)
- **npm** v9 o superior
- **Angular CLI** v20 o superior

## ⚙️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/BryanAntamba/LittleFalls.git
cd LittleFalls
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
MONGODB_URI=mongodb://localhost:27017/littlefalls
PORT=3000
JWT_SECRET=tu_clave_secreta_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_aqui
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

**Nota para Gmail:** Necesitas generar una "Contraseña de aplicación":
1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Ve a: https://myaccount.google.com/apppasswords
3. Genera una contraseña de aplicación para "Correo"
4. Usa esa contraseña en `EMAIL_PASSWORD`

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 4. Iniciar la aplicación

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# O para desarrollo con nodemon:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# La aplicación estará en http://localhost:4200
```

## 👥 Usuarios por Defecto

Después de ejecutar `seedUsers.js`, estarán disponibles:

### Administrador
- **Email:** admin@littlefalls.com
- **Contraseña:** Admin123
- **Rol:** Administrador del sistema

### Veterinario
- **Email:** vet@littlefalls.com
- **Contraseña:** Vet123
- **Rol:** Veterinario

### Paciente
- **Email:** paciente@littlefalls.com
- **Contraseña:** Paciente123
- **Rol:** Paciente/Dueño de mascota

## 🔑 Características Principales

### Sistema de Autenticación
- Login con JWT (Access Token + Refresh Token)
- Registro de nuevos usuarios
- Verificación por código de 6 dígitos
- Recuperación de contraseña por email
- Guards de protección de rutas

### Gestión de Usuarios (Admin)
- Crear usuarios (Admin, Veterinarios, Pacientes)
- Editar información de usuarios
- Activar/Desactivar usuarios
- Eliminar usuarios

### Sistema de Citas
- **Pacientes:** Agendar citas para sus mascotas
- **Veterinarios:** 
  - Ver todas sus citas asignadas
  - Crear registros clínicos
  - Actualizar estado de citas
  - Ver historial de mascotas
- **Admin:** Gestión completa de citas y asignación de veterinarios

### Registros Clínicos
- Información de la consulta
- Signos vitales (peso, temperatura, frecuencias)
- Diagnósticos y tratamientos
- Vacunas aplicadas
- Observaciones y recomendaciones
- Historial completo por mascota

## 📡 API Endpoints

### Autenticación (`/api/auth`)
```
POST   /login                          # Iniciar sesión
POST   /registro                       # Registrar paciente
POST   /verificar-codigo               # Verificar código de registro
POST   /reenviar-codigo                # Reenviar código
POST   /refresh                        # Refrescar access token
GET    /verify                         # Verificar sesión activa
POST   /recuperar-password/solicitar   # Solicitar recuperación
POST   /recuperar-password/verificar-codigo
POST   /recuperar-password/restablecer
```

### Usuarios (`/api/usuarios`) - Requiere Auth
```
GET    /                  # Obtener todos (Admin)
GET    /tipo/:tipo        # Filtrar por tipo (Admin)
POST   /                  # Crear usuario (Admin)
PUT    /:id               # Actualizar usuario (Admin)
PATCH  /:id/estado        # Cambiar estado (Admin)
DELETE /:id               # Eliminar usuario (Admin)
```

### Citas (`/api/citas`) - Requiere Auth
```
POST   /                            # Crear cita (Paciente/Admin)
GET    /                            # Todas las citas (Admin/Vet)
GET    /paciente/:id                # Citas de paciente
GET    /veterinario/:id             # Citas de veterinario (Vet/Admin)
PATCH  /:id/estado                  # Actualizar estado (Vet/Admin)
PATCH  /:id/asignar                 # Asignar veterinario (Admin)
POST   /:id/registro-clinico        # Crear registro (Vet)
PUT    /:id/registro-clinico        # Actualizar registro (Vet)
PUT    /:id                         # Actualizar cita (Vet/Admin)
DELETE /:id                         # Eliminar cita (Admin)
```

## 🛡️ Seguridad

- **Autenticación:** JWT con Access y Refresh Tokens
- **Contraseñas:** Encriptadas con bcrypt (12 rondas)
- **Validación:** Validación de entrada en todos los endpoints
- **CORS:** Configurado para peticiones del frontend
- **Guards:** Protección de rutas por roles
- **Sanitización:** Protección contra XSS e inyecciones

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Deployment

### Backend (Render, Railway, etc.)
1. Configurar variables de entorno en la plataforma
2. Conectar repositorio de GitHub
3. Desplegar desde la rama `main`

### Frontend (Vercel, Netlify, etc.)
```bash
cd frontend
npm run build
# Los archivos compilados estarán en dist/
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 👨‍💻 Desarrolladores

- **Bryan Antamba** - [GitHub](https://github.com/BryanAntamba)

## 📧 Contacto

Para preguntas o soporte: stivoter1234567@gmail.com

## 🐛 Problemas Conocidos

- Asegúrate de tener MongoDB corriendo antes de iniciar el backend
- Para Gmail, necesitas habilitar "Contraseñas de aplicación"
- El frontend debe correr en puerto 4200 para que CORS funcione correctamente

## 📚 Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt
- Nodemailer
- Validator

### Frontend
- Angular 20
- TypeScript
- RxJS
- Angular Router
- Angular Forms

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
