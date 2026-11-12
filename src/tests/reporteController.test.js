
jest.mock('../models/Reporte');
jest.mock('../models/HistorialAnalisis');

jest.mock('../services/inferenciaService');
jest.mock('../services/desacortadorService');
jest.mock('../services/virustotalService');
jest.mock('../services/dominioService');
jest.mock('../services/scoringService');
jest.mock('../services/cacheDominioService');
jest.mock('../utils/extraerUrl');

const Reporte = require('../models/Reporte');
const HistorialAnalisis = require('../models/HistorialAnalisis');

const {
  inferirCategoriaYEmpresa
} = require('../services/inferenciaService');

const { desacortarUrl } = require('../services/desacortadorService');
const { consultarUrl } = require('../services/virustotalService');

const {
  consultarAntiguedadDominio,
  extraerDominio
} = require('../services/dominioService');

const { calcularScoreRiesgo } = require('../services/scoringService');

const {
  buscarEnCache,
  guardarEnCache
} = require('../services/cacheDominioService');

const {
  extraerUrlDelMensaje
} = require('../utils/extraerUrl');

const {
  crearReporte,
  obtenerReportes,
  actualizarReporte,
  eliminarReporte
} = require('../controllers/reporteController');

describe('reporteController', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        mensaje: 'Mensaje de prueba'
      },
      params: {
        id: '123'
      },
      usuario: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    inferirCategoriaYEmpresa.mockReturnValue({
      categoria: 'sin_clasificar',
      empresa_mencionada: null
    });

    extraerUrlDelMensaje.mockReturnValue(null);

    calcularScoreRiesgo.mockReturnValue({
      score_riesgo: 10,
      nivel_riesgo: 'bajo',
      detalles: ['Análisis de prueba']
    });

    HistorialAnalisis.findOneAndUpdate = jest.fn().mockResolvedValue({});
  });

  describe('crearReporte', () => {

    test('debe crear un reporte correctamente sin URL', async () => {
      const reporteGuardado = {
        toObject: () => ({
          mensaje: 'Mensaje de prueba',
          score_riesgo: 10,
          nivel_riesgo: 'bajo'
        })
      };

      Reporte.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(reporteGuardado)
      }));

      await crearReporte(req, res);

      expect(calcularScoreRiesgo).toHaveBeenCalled();
      expect(Reporte).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          guardado: true,
          score_riesgo: 10
        })
      );
    });

    test('debe inferir la categoría y empresa del mensaje', async () => {
      inferirCategoriaYEmpresa.mockReturnValue({
        categoria: 'bancario',
        empresa_mencionada: 'Banco Estado'
      });

      const reporteGuardado = {
        toObject: () => ({
          mensaje: 'Mensaje de prueba',
          categoria: 'bancario',
          empresa_mencionada: 'Banco Estado'
        })
      };

      Reporte.mockImplementation((datos) => ({
        save: jest.fn().mockResolvedValue({
          toObject: () => ({
            ...reporteGuardado.toObject(),
            ...datos
          })
        })
      }));

      await crearReporte(req, res);

      expect(inferirCategoriaYEmpresa).toHaveBeenCalledWith(
        'Mensaje de prueba'
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          categoria: 'bancario',
          empresa_mencionada: 'Banco Estado'
        })
      );
    });

    test('debe analizar una URL cuando no existe en caché', async () => {
      req.body.url = 'https://ejemplo.cl';

      desacortarUrl.mockResolvedValue({
        url_final: 'https://ejemplo.cl',
        fue_acortada: false
      });

      extraerDominio.mockReturnValue('ejemplo.cl');
      buscarEnCache.mockResolvedValue(null);

      consultarUrl.mockResolvedValue({
        maliciosos: 0,
        sospechosos: 0,
        inofensivos: 5
      });

      consultarAntiguedadDominio.mockResolvedValue({
        dominio: 'ejemplo.cl',
        dias_antiguedad: 1000
      });

      guardarEnCache.mockResolvedValue({});

      const reporteGuardado = {
        toObject: () => ({
          mensaje: 'Mensaje de prueba'
        })
      };

      Reporte.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(reporteGuardado)
      }));

      await crearReporte(req, res);

      expect(desacortarUrl).toHaveBeenCalledWith('https://ejemplo.cl');
      expect(consultarUrl).toHaveBeenCalledWith('https://ejemplo.cl');
      expect(consultarAntiguedadDominio).toHaveBeenCalled();
      expect(guardarEnCache).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('debe utilizar los resultados de la caché cuando existen', async () => {
      req.body.url = 'https://ejemplo.cl';

      desacortarUrl.mockResolvedValue({
        url_final: 'https://ejemplo.cl',
        fue_acortada: false
      });

      extraerDominio.mockReturnValue('ejemplo.cl');

      buscarEnCache.mockResolvedValue({
        resultado_virustotal: {
          maliciosos: 2,
          sospechosos: 1,
          inofensivos: 3
        },
        dias_antiguedad: 100
      });

      const reporteGuardado = {
        toObject: () => ({
          mensaje: 'Mensaje de prueba'
        })
      };

      Reporte.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(reporteGuardado)
      }));

      await crearReporte(req, res);

      expect(buscarEnCache).toHaveBeenCalledWith('ejemplo.cl');
      expect(consultarUrl).not.toHaveBeenCalled();
      expect(consultarAntiguedadDominio).not.toHaveBeenCalled();
      expect(guardarEnCache).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('debe registrar el historial cuando existe un usuario autenticado', async () => {
      req.usuario = { id: 'usuario123' };

      const reporteGuardado = {
        toObject: () => ({
          mensaje: 'Mensaje de prueba'
        })
      };

      Reporte.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(reporteGuardado)
      }));

      await crearReporte(req, res);

      expect(HistorialAnalisis.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: 'usuario123',
          mensaje: 'Mensaje de prueba'
        }),
        expect.any(Object),
        expect.objectContaining({
          upsert: true
        })
      );

      expect(Reporte).toHaveBeenCalledWith(
        expect.objectContaining({
          reportado_por: 'usuario123'
        })
      );
    });

    test('debe devolver el análisis sin guardar cuando guardar es false', async () => {
      req.body.guardar = false;

      await crearReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          guardado: false,
          detalles_analisis: ['Análisis de prueba']
        })
      );

      expect(Reporte).not.toHaveBeenCalled();
    });

    test('debe responder con error 400 si ocurre un error', async () => {
      inferirCategoriaYEmpresa.mockImplementation(() => {
        throw new Error('Error de prueba');
      });

      await crearReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de prueba'
      });
    });
  });

  describe('obtenerReportes', () => {

    test('debe devolver todos los reportes', async () => {
      const reportes = [
        { mensaje: 'Reporte 1' },
        { mensaje: 'Reporte 2' }
      ];

      Reporte.find.mockResolvedValue(reportes);

      await obtenerReportes(req, res);

      expect(Reporte.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(reportes);
    });

    test('debe responder con error 500 si falla la consulta', async () => {
      Reporte.find.mockRejectedValue(
        new Error('Error de consulta')
      );

      await obtenerReportes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de consulta'
      });
    });
  });

  describe('actualizarReporte', () => {

    test('debe actualizar un reporte correctamente', async () => {
      const reporte = {
        mensaje: 'Reporte actualizado'
      };

      Reporte.findByIdAndUpdate.mockResolvedValue(reporte);

      await actualizarReporte(req, res);

      expect(Reporte.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        req.body,
        {
          returnDocument: 'after',
          runValidators: true
        }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(reporte);
    });

    test('debe responder 404 si el reporte no existe', async () => {
      Reporte.findByIdAndUpdate.mockResolvedValue(null);

      await actualizarReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Reporte no encontrado'
      });
    });

    test('debe responder 400 si ocurre un error', async () => {
      Reporte.findByIdAndUpdate.mockRejectedValue(
        new Error('Error de actualización')
      );

      await actualizarReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de actualización'
      });
    });
  });

  describe('eliminarReporte', () => {

    test('debe eliminar un reporte correctamente', async () => {
      Reporte.findByIdAndDelete.mockResolvedValue({
        _id: '123'
      });

      await eliminarReporte(req, res);

      expect(Reporte.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Reporte eliminado correctamente'
      });
    });

    test('debe responder 404 si el reporte no existe', async () => {
      Reporte.findByIdAndDelete.mockResolvedValue(null);

      await eliminarReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Reporte no encontrado'
      });
    });

    test('debe responder 500 si ocurre un error', async () => {
      Reporte.findByIdAndDelete.mockRejectedValue(
        new Error('Error de eliminación')
      );

      await eliminarReporte(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Error de eliminación'
      });
    });
  });
});
