# SMS Security — Backend

Backend del proyecto **SMS Security** (nombre de la app: "AntiFraude SMS"), una solución orientada a detectar mensajes SMS de estafa (*smishing*) en Chile, con foco en adultos mayores.

Este repositorio contiene únicamente el **backend** (API REST). El frontend (React Native) y el panel de monitoreo/chatbot se desarrollan en repositorios separados por el resto del equipo.

## Descripción

El backend recibe un SMS reportado, extrae su URL (si tiene), verifica la reputación del enlace en VirusTotal y la antigüedad del dominio (RDAP para dominios internacionales, WHOIS para dominios `.cl`), y calcula un puntaje de riesgo (0-100) mediante un algoritmo heurístico por reglas. El resultado se guarda como un reporte en MongoDB Atlas.

> Nota: el análisis es heurístico por reglas, no usa Machine Learning. Esta decisión se tomó considerando el tamaño del dataset disponible y el plazo del proyecto.

## Tecnologías

- Node.js
- Express 5
- MongoDB Atlas (vía Mongoose 9)
- Axios
- VirusTotal API (plan gratuito: 4 consultas/min, 500/día)
- RDAP (rdap.org) para dominios no `.cl`
- WHOIS clásico (socket TCP puerto 43 a `whois.nic.cl`) para dominios `.cl`

## Cómo ejecutar

### Requisitos
- Node.js v24.x
- Una cuenta de MongoDB Atlas con un cluster disponible
- Una API Key gratuita de VirusTotal

### Pasos

1. Clonar el repositorio:
```bash
   git clone https://github.com/BryanAcuna1601/sms-security-capstone.git
   cd sms-security-capstone
```

2. Instalar dependencias:
```bash
   npm install
```

3. Crear un archivo `.env` en la raíz con las siguientes variables:

PORT=3000
MONGODB_URI=<tu cadena de conexión de MongoDB Atlas>
VIRUSTOTAL_API_KEY=<tu api key de VirusTotal>

4. Ejecutar en modo desarrollo:
```bash
   npm run dev
```

   El servidor queda disponible en `http://localhost:3000`.

## Integrantes y roles

| Integrante | Rol |
|---|---|
| Bryan Acuña | Backend (Node.js/Express), integración de APIs externas (VirusTotal, RDAP/WHOIS), lógica de scoring |
| Manuel Rivas | Frontend (React Native), experiencia de usuario para adultos mayores |
| Marcel Tusach | Base de datos (MongoDB), chatbot educativo (Gemini), panel de monitoreo interno, Documento de Diseño |

## Metodología

El proyecto se desarrolla bajo metodología **Cascada**, con las etapas: Problema, Requerimientos, Modelo de Datos, Arquitectura, Interfaz, Backend, APIs, Scoring, Frontend, Chatbot, Panel, Pruebas, Documentación y presentación.

## Arquitectura

Modelo Cliente-Servidor de tres capas:

- **Capa de Presentación**: App Android en React Native (repositorio aparte).
- **Capa de Negocio** (este repositorio): API REST en Node.js/Express. Orquesta el desacortado de URL, la consulta a VirusTotal, la consulta de antigüedad de dominio (RDAP/WHOIS) y el motor de scoring.
- **Capa de Datos**: MongoDB Atlas, colección `Reporte`.

Detalle completo de arquitectura, modelo de datos y diagramas UML en el Documento de Diseño del equipo.

## Contrato de la API

### `GET /`
Mensaje de estado del servidor.

### `POST /api/reportes`
Crea un nuevo reporte. Recibe `mensaje` (requerido) y opcionalmente `url`, `categoria`, `empresa_mencionada`, `reportado_por`.

Si no se envía `categoria`/`empresa_mencionada`, se infieren automáticamente del texto. Si no se envía `url`, el backend intenta extraerla del mensaje. Si hay URL (enviada o extraída), se consulta VirusTotal y la antigüedad del dominio, y se calcula `score_riesgo`.

**Ejemplo de request:**
```json
{
  "mensaje": "Hola, tu cuenta BancoEstado fue bloqueada, verifica en wq24.online/pago"
}
```

**Ejemplo de respuesta (201):**
```json
{
  "mensaje": "Hola, tu cuenta BancoEstado fue bloqueada, verifica en wq24.online/pago",
  "remitente_tecnico": "desconocido",
  "empresa_mencionada": "Banco Estado",
  "url": "wq24.online/pago",
  "categoria": "banca",
  "estado": "pendiente",
  "score_riesgo": 40,
  "analisis": {
    "virustotal_maliciosos": 0,
    "dominio_dias_antiguedad": 54,
    "coincide_patron_dataset": true
  },
  "reportado_por": "usuario_anonimo",
  "_id": "6ad02b986328c33dd2521104",
  "fecha_reporte": "2026-10-15T01:25:44.702Z",
  "detalles_analisis": [
    "El mensaje coincide con un patrón conocido de smishing chileno (+30)",
    "El dominio tiene 54 días de antigüedad, relativamente nuevo (+10)"
  ]
}
```

**Ejemplo sin URL en el mensaje** (el score solo puede subir por coincidencia con el dataset, máximo 30 puntos):
```json
{
  "mensaje": "Estimado cliente, su cuenta en Banco Estado presenta un movimiento irregular"
}
```
```json
{
  "score_riesgo": 30,
  "analisis": {
    "virustotal_maliciosos": null,
    "dominio_dias_antiguedad": null,
    "coincide_patron_dataset": true
  },
  "detalles_analisis": [
    "El mensaje coincide con un patrón conocido de smishing chileno (+30)"
  ]
}
```

### `GET /api/reportes`
Lista todos los reportes.

### `PATCH /api/reportes/:id`
Actualiza campos de un reporte existente (por ejemplo, el `estado`, que solo debe cambiarse manualmente desde el panel de monitoreo).

### `DELETE /api/reportes/:id`
Elimina un reporte.

### Niveles de riesgo (definidos en el Documento de Diseño)
- 0-39: riesgo bajo
- 40-69: riesgo medio
- 70-100: riesgo alto

> El campo `nivel_riesgo` (texto) aún no se calcula en el backend; solo se expone el valor numérico `score_riesgo`. Pendiente de implementar.

## Estado actual / pendientes conocidos

Implementado y probado:
- CRUD completo de reportes.
- Flujo completo de análisis en `POST /api/reportes` (extracción de URL, desacortado, VirusTotal, antigüedad de dominio, scoring).
- Inferencia de categoría/empresa mencionada por reglas.

Pendiente (no implementado aún):
- Caché de dominios (patrón Cache-Aside, TTL 24h) para no exceder el límite gratuito de VirusTotal.
- Cálculo del campo `nivel_riesgo` como texto.
- Autenticación por teléfono (OTP).
- Despliegue en Render.
- Integración del chatbot (Gemini) — desarrollado en otro repositorio.