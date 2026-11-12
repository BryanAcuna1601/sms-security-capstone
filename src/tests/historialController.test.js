
jest.mock('../models/HistorialAnalisis');

const HistorialAnalisis = require('../models/HistorialAnalisis');

const {
  obtenerHistorial
} = require('../controllers/historialController');

describe('historialController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      usuario: {
        id: 'usuario123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('obtenerHistorial', () => {
    test('debe obtener el historial del usuario correctamente', async () => {
      const historial = [
        {
          mensaje: 'Mensaje de prueba 1',
          nivel_riesgo: 'alto'
        },
        {
          mensaje: 'Mensaje de prueba 2',
          nivel_riesgo: 'bajo'
        }
      ];

      const sortMock = jest.fn().mockResolvedValue(historial);

      HistorialAnalisis.find.mockReturnValue({
        sort: sortMock
      });

      await obtenerHistorial(req, res);

      expect(HistorialAnalisis.find).toHaveBeenCalledWith({
        usuario: 'usuario123'
      });

      expect(sortMock).toHaveBeenCalledWith({
        fecha_analisis: -1
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(historial);
    });

    test('debe devolver una lista vacía si el usuario no tiene historial', async () => {
      const sortMock = jest.fn().mockResolvedValue([]);

      HistorialAnalisis.find.mockReturnValue({
        sort: sortMock
      });

      await obtenerHistorial(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('debe responder con error 500 si ocurre un error', async () => {
      HistorialAnalisis.find.mockImplementation(() => {
        throw new Error('Error al consultar el historial');
      });

      await obtenerHistorial(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Error al consultar el historial'
      });
    });
  });
});
