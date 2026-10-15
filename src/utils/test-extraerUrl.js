const { extraerUrlDelMensaje } = require('./extraerUrl');

console.log(extraerUrlDelMensaje("Su paquete fue retenido, pague aquí: https://chilexpress-pago.cl/retencion"));
console.log(extraerUrlDelMensaje("Hola, tu cuenta BancoEstado fue bloqueada, verifica en wq24.online/pago"));
console.log(extraerUrlDelMensaje("Estimado cliente, su cuenta ha sido suspendida por falta de pago"));