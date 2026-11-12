
process.env.JWT_SECRET = 'secreto-pruebas-jest';

jest.mock('../controllers/historialController', () => ({
  obtenerHistorial: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Historial obtenido correctamente'
    });
  })
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const { obtenerHistorial } = require('../controllers/historialController');
const historialRoutes = require('../routes/historialRoutes');

describe('historialRoutes', () => {
  let app;

  const generarToken = () => {
    return jwt.sign(
      {
        id: 'usuario123',
        rol: 'usuario'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/historial', historialRoutes);
  });

  describe('GET /', () => {
    test('debe obtener el historial con un token válido', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .get('/api/historial')
        .set('Authorization', `Bearer ${token}`);

      expect(obtenerHistorial).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Historial obtenido correctamente'
      });
    });

    test('debe rechazar la petición sin token', async () => {
      const respuesta = await request(app)
        .get('/api/historial');

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token no proporcionado'
      });

      expect(obtenerHistorial).not.toHaveBeenCalled();
    });

    test('debe rechazar un token inválido', async () => {
      const respuesta = await request(app)
        .get('/api/historial')
        .set('Authorization', 'Bearer token-invalido');

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token invalido o expirado'
      });

      expect(obtenerHistorial).not.toHaveBeenCalled();
    });
  });

  test('debe responder 404 ante una ruta inexistente', async () => {
    const token = generarToken();

    const respuesta = await request(app)
      .get('/api/historial/ruta-inexistente')
      .set('Authorization', `Bearer ${token}`);

    expect(respuesta.status).toBe(404);
    expect(obtenerHistorial).not.toHaveBeenCalled();
  });
});
