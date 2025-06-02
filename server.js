require('dotenv').config(); // Carga variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors()); // Habilita CORS para todas las rutas
// Si tienes CSS/JS en una carpeta 'public', puedes servirla así:
// app.use('/public', express.static(path.join(__dirname, 'public')));
// Si no, esta línea de arriba no es estrictamente necesaria para este proyecto.

// Servir la página HTML principal
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

// Configurar Multer para manejar la subida de archivos
// Para este proyecto, solo necesitamos metadatos, no guardar el archivo físicamente.
// Usar memoryStorage es eficiente para esto.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite opcional de 10MB por archivo
});
// Alternativamente, para casos simples, `const upload = multer();` también funciona
// ya que por defecto usará memoryStorage si no se especifica `dest`.

// Endpoint de la API para el análisis de archivos
// upload.single('upfile') espera un solo archivo del campo de formulario llamado 'upfile'
app.post('/api/fileanalyse', upload.single('upfile'), (req, res) => {
  // --- INICIO DE DEBUGGING ---
  console.log('--- Nueva solicitud a /api/fileanalyse ---');
  console.log('req.file:', req.file); // Muestra el objeto del archivo procesado por Multer
  console.log('req.body:', req.body); // Muestra otros campos del formulario (debería estar vacío o con campos no-archivo)
  // --- FIN DE DEBUGGING ---

  // Verificar si se subió un archivo
  if (!req.file) {
    console.error('Error: No se subió ningún archivo o req.file no está poblado.');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construir el objeto de respuesta JSON con los metadatos requeridos
  // Las claves DEBEN ser 'name', 'type', y 'size' en minúsculas.
  const fileMetadata = {
    name: req.file.originalname, // Nombre original del archivo
    type: req.file.mimetype,    // Tipo MIME del archivo
    size: req.file.size         // Tamaño del archivo en bytes (ya es un número)
  };

  // --- INICIO DE DEBUGGING ---
  console.log('Enviando respuesta JSON:', fileMetadata);
  // --- FIN DE DEBUGGING ---

  // Enviar la respuesta JSON
  res.json(fileMetadata);
});

// Manejador para rutas no encontradas (opcional pero buena práctica)
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// Manejador de errores (opcional pero buena práctica)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});