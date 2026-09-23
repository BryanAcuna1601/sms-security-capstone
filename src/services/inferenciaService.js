const empresasConocidas = {
  encomiendas: {
    'Correos de Chile': ['correos chile', 'correoschile', 'corre0schile', 'correos'],
    'Chilexpress': ['chilexpress', 'chile express'],
    'Blue Express': ['blue express', 'blueexpress'],
    'Starken': ['starken']
  },
  banca: {
    'Banco Estado': ['banco estado', 'bancoestado', 'cuentarut', 'cuenta rut'],
    'Banco de Chile': ['banco de chile', 'banco chile', 'bch'],
    'Santander': ['santander'],
    'BCI': ['bci'],
    'CMR Falabella': ['cmr falabella', 'cmr'],
    'Scotiabank': ['scotiabank'],
    'Itaú': ['banco itau', 'itau'],
    'Visa': ['visa credito', 'visa']
  },
  gobierno: {
    'SII': ['sii', 'servicio de impuestos internos'],
    'Tesorería General': ['tesoreria', 'tgr'],
    'Registro Civil': ['registro civil'],
    'Carabineros': ['carabineros'],
    'Municipalidad': ['municipalidad', 'infraccion de transito', 'multa']
  },
  retail: {
    'Copec': ['copec', 'full copec', 'fullcopec'],
    'Falabella': ['falabella'],
    'Cencosud': ['cencosud'],
    'Lider': ['lider']
  },
  telecomunicaciones: {
    'Entel': ['entel'],
    'Movistar': ['movistar'],
    'WOM': ['wom']
  },
  peajes: {
    'TAG / Autopista': ['tag', 'autopista'],
    'Servipag': ['servipag']
  },
  otros: {
    'LATAM': ['latam']
  }
};

function inferirCategoriaYEmpresa(mensaje) {
  if (!mensaje || typeof mensaje !== 'string') {
    return { categoria: 'sin_clasificar', empresa_mencionada: 'sin_identificar' };
  }

  const texto = mensaje
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [categoria, empresas] of Object.entries(empresasConocidas)) {
    for (const [empresaCanonica, aliasList] of Object.entries(empresas)) {
      for (const alias of aliasList) {
        if (texto.includes(alias)) {
          return {
            categoria: categoria,
            empresa_mencionada: empresaCanonica
          };
        }
      }
    }
  }

  return {
    categoria: 'sin_clasificar',
    empresa_mencionada: 'sin_identificar'
  };
}

module.exports = { inferirCategoriaYEmpresa };