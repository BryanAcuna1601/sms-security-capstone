require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const reporteRoutes = require('./routes/reporteRoutes');

const { analizarUrl } = require('./services/virustotalService');
const { consultarAntiguedadDominio } = require('./services/dominioService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/reportes', reporteRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error.message));

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend SMS Security funcionando correctamente' });
});

app.get('/api/test/analizar-url', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Debes pasar una URL como query param, ej: ?url=https://google.com' });
    }
    const resultado = await analizarUrl(url);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/antiguedad-dominio', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Debes pasar una URL como query param, ej: ?url=google.com' });
    }
    const resultado = await consultarAntiguedadDominio(url);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

