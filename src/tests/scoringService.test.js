const {calcularScoreRiesgo, calcularNivelRiesgo} = require('../services/scoringService');

describe('Pruebas de calcularScoreRiesgo', () => {

  test('Debe asignar 30 puntos cuando coincide con el dataset', () => {

    const resultado = calcularScoreRiesgo({
      coincideConDataset: true,
      resultadoVirusTotal: null,
      resultadoDominio: null
    });

    expect(resultado.score_riesgo).toBe(30);
    expect(resultado.nivel_riesgo).toBe('bajo');

  });

  test('Debe asignar 40 puntos cuando VirusTotal detecta una URL maliciosa', () => {
    const resultado = calcularScoreRiesgo({
      coincideConDataset: false,
      resultadoVirusTotal: {
        maliciosos: 1,
        sospechosos: 0,
        fue_acortada: false
      },
      resultadoDominio: null
    });

    expect(resultado.score_riesgo).toBe(40);
    expect(resultado.nivel_riesgo).toBe('medio');
  });

  test('Debe asignar 25 puntos cuando el dominio tiene menos de 30 días', () => {
    const resultado = calcularScoreRiesgo({
      coincideConDataset: false,
      resultadoVirusTotal: null,
      resultadoDominio: {
        dias_antiguedad: 15
      }
    });

    expect(resultado.score_riesgo).toBe(25);
    expect(resultado.nivel_riesgo).toBe('bajo');
  });

  test('El puntaje nunca debe superar los 100 puntos', () => {
    const resultado = calcularScoreRiesgo({
      coincideConDataset: true,
      resultadoVirusTotal: {
        maliciosos: 5,
        sospechosos: 0,
        fue_acortada: true
      },
      resultadoDominio: {
        dias_antiguedad: 10
      }
    });

    expect(resultado.score_riesgo).toBe(100);
    expect(resultado.nivel_riesgo).toBe('alto');
  });

});

describe('Pruebas de calcularNivelRiesgo', () => {

  test('Debe retornar bajo cuando el puntaje es 30', () => {
    expect(calcularNivelRiesgo(30)).toBe('bajo');
  });

  test('Debe retornar medio cuando el puntaje es 50', () => {
    expect(calcularNivelRiesgo(50)).toBe('medio');
  });

  test('Debe retornar alto cuando el puntaje es 80', () => {
    expect(calcularNivelRiesgo(80)).toBe('alto');
  });

});
