function extraerUrlDelMensaje(mensaje) {
  if (!mensaje || typeof mensaje !== 'string') return null;

  const regex = /\b((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?)\b/i;
  const match = mensaje.match(regex);

  return match ? match[0] : null;
}

module.exports = { extraerUrlDelMensaje };