
process.env.JWT_SECRET = 'secreto-pruebas-jest';

jest.mock('../controllers/reporteController', () => ({
  crearReporte: jest.fn((req, res) => {
    res.status(201).json({
      mensaje: 'Reporte creado correctamente'
    });
  }),

  obtenerReportes: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Lista de reportes'
    });
  }),

  actualizarReporte: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Reporte actualizado',
      id: req.params.id
    });
  }),

  eliminarReporte: jest.fn((req, res) => {
    res.status(200).json({
      mensaje: 'Reporte eliminado',
      id: req.params.id
    });
  })
}));

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const {
  crearReporte,
  obtenerReportes,
  actualizarReporte,
  eliminarReporte
} = require('../controllers/reporteController');

const reporteRoutes = require('../routes/reporteRoutes');

describe('reporteRoutes', () => {
  let app;

  const generarToken = (rol = 'admin') => {
    return jwt.sign(
      {
        id: 'usuario123',
        rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use('/api/reportes', reporteRoutes);
  });

  describe('POST /', () => {
    test('debe crear un reporte con token válido', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .post('/api/reportes')
        .set('Authorization', `Bearer ${token}`)
        .send({ mensaje: 'Mensaje de prueba' });

      expect(crearReporte).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        mensaje: 'Reporte creado correctamente'
      });
    });

    test('debe rechazar la petición sin token', async () => {
      const respuesta = await request(app)
        .post('/api/reportes')
        .send({ mensaje: 'Mensaje de prueba' });

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token no proporcionado'
      });

      expect(crearReporte).not.toHaveBeenCalled();
    });

    test('debe rechazar un token inválido', async () => {
      const respuesta = await request(app)
        .post('/api/reportes')
        .set('Authorization', 'Bearer token-invalido')
        .send({ mensaje: 'Mensaje de prueba' });

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        error: 'Token invalido o expirado'
      });

      expect(crearReporte).not.toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    test('debe permitir obtener reportes sin autenticación', async () => {
      const respuesta = await request(app)
        .get('/api/reportes');

      expect(obtenerReportes).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Lista de reportes'
      });
    });
  });

  describe('PATCH /:id', () => {
    test('debe actualizar un reporte con administrador', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .patch('/api/reportes/reporte123')
        .set('Authorization', `Bearer ${token}`)
        .send({ categoria: 'bancario' });

      expect(actualizarReporte).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Reporte actualizado',
        id: 'reporte123'
      });
    });

    test('debe rechazar la actualización sin token', async () => {
      const respuesta = await request(app)
        .patch('/api/reportes/reporte123');

      expect(respuesta.status).toBe(401);
      expect(actualizarReporte).not.toHaveBeenCalled();
    });

    test('debe rechazar la actualización de un usuario normal', async () => {
      const token = generarToken('usuario');

      const respuesta = await request(app)
        .patch('/api/reportes/reporte123')
        .set('Authorization', `Bearer ${token}`);

      expect(respuesta.status).toBe(403);
      expect(respuesta.body).toEqual({
        error: 'Se requiere rol de administrador'
      });

      expect(actualizarReporte).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /:id', () => {
    test('debe eliminar un reporte con administrador', async () => {
      const token = generarToken();

      const respuesta = await request(app)
        .delete('/api/reportes/reporte123')
        .set('Authorization', `Bearer ${token}`);

      expect(eliminarReporte).toHaveBeenCalledTimes(1);
      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        mensaje: 'Reporte eliminado',
        id: 'reporte123'
      });
    });

    test('debe rechazar la eliminación sin token', async () => {
      const respuesta = await request(app)
        .delete('/api/reportes/reporte123');

      expect(respuesta.status).toBe(401);
      expect(eliminarReporte).not.toHaveBeenCalled();
    });

    test('debe rechazar la eliminación de un usuario normal', async () => {
      const token = generarToken('usuario');

      const respuesta = await request(app)
        .delete('/api/reportes/reporte123')
        .set('Authorization', `Bearer ${token}`);

      expect(respuesta.status).toBe(403);
      expect(respuesta.body).toEqual({
        error: 'Se requiere rol de administrador'
      });

      expect(eliminarReporte).not.toHaveBeenCalled();
    });
  });
});
