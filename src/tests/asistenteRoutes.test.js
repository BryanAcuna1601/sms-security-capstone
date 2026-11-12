
jest.mock('../controllers/asistenteController', () => ({
  consultarAsistente: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Respuesta del asistente'
    });
  })
}));

const express = require('express');
const request = require('supertest');

const { consultarAsistente } = require('../controllers/asistenteController');
const asistenteRoutes = require('../routes/asistenteRoutes');

describe('asistenteRoutes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/asistente', asistenteRoutes);
  });

  describe('POST /chat', () => {
    test('debe ejecutar consultarAsistente correctamente', async () => {
      const respuesta = await request(app)
        .post('/api/asistente/chat')
        .send({
          mensaje: 'Hola, ¿cómo estás?'
        });

      expect(consultarAsistente).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Respuesta del asistente'
      });
    });

    test('debe permitir consultar el asistente sin token', async () => {
      const respuesta = await request(app)
        .post('/api/asistente/chat')
        .send({
          mensaje: 'Necesito ayuda'
        });

      expect(respuesta.status).toBe(200);
      expect(consultarAsistente).toHaveBeenCalledTimes(1);
    });
  });

  test('debe responder 404 ante una ruta inexistente', async () => {
    const respuesta = await request(app)
      .get('/api/asistente/ruta-inexistente');

    expect(respuesta.status).toBe(404);
    expect(consultarAsistente).not.toHaveBeenCalled();
  });
});
