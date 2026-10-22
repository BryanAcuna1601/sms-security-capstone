function calcularNivelRiesgo(score) {
  if (score < 40) return 'bajo';
  if (score < 70) return 'medio';
  return 'alto';
}

function calcularScoreRiesgo({ coincideConDataset, resultadoVirusTotal, resultadoDominio }) {
  let score = 0;
  const detalles = [];

  if (coincideConDataset) {
    score += 30;
    detalles.push('El mensaje coincide con un patrón conocido de smishing chileno (+30)');
  }

  if (resultadoVirusTotal) {
    if (resultadoVirusTotal.maliciosos > 0) {
      score += 40;
      detalles.push(`VirusTotal detectó ${resultadoVirusTotal.maliciosos} motores que marcan la URL como maliciosa (+40)`);
    } else if (resultadoVirusTotal.sospechosos > 0) {
      score += 15;
      detalles.push(`VirusTotal detectó ${resultadoVirusTotal.sospechosos} motores que marcan la URL como sospechosa (+15)`);
    }
  }

  if (resultadoDominio && resultadoDominio.dias_antiguedad !== null) {
    if (resultadoDominio.dias_antiguedad < 30) {
      score += 25;
      detalles.push(`El dominio tiene solo ${resultadoDominio.dias_antiguedad} días de antigüedad (+25)`);
    } else if (resultadoDominio.dias_antiguedad < 90) {
      score += 10;
      detalles.push(`El dominio tiene ${resultadoDominio.dias_antiguedad} días de antigüedad, relativamente nuevo (+10)`);
    }
  }

  if (resultadoVirusTotal && resultadoVirusTotal.fue_acortada) {
    score += 5;
    detalles.push('El enlace estaba acortado, técnica común en smishing (+5)');
  }

  const scoreFinal = Math.min(score, 100);

  return {
    score_riesgo: scoreFinal,
    nivel_riesgo: calcularNivelRiesgo(scoreFinal),
    detalles
  };
}

module.exports = { calcularScoreRiesgo, calcularNivelRiesgo };