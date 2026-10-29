require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const reporteRoutes = require('./routes/reporteRoutes');
const authRoutes = require('./routes/authRoutes');
const historialRoutes = require('./routes/historialRoutes');
// 1. Importas la nueva ruta del asistente IA
const asistenteRoutes = require("./routes/asistenteRoutes");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/reportes', reporteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/historial', historialRoutes);
// 2. Registras el endpoint para que reciba las consultas
app.use('/api/asistente', asistenteRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error.message));

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend SMS Security funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});