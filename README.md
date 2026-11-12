# SMS Security — Backend

Backend del proyecto SMS Security (nombre de la app: "AntiFraude SMS"), una solución orientada a detectar mensajes SMS de estafa (smishing) en Chile, con foco en adultos mayores.

Este repositorio contiene únicamente el backend (API REST). El frontend (React Native) y el panel de administración (dashboard web) se desarrollan en repositorios separados por el resto del equipo.

## Descripción

El backend recibe un SMS reportado, extrae su URL (si tiene), verifica la reputación del enlace en VirusTotal y la antigüedad del dominio (RDAP para dominios internacionales, WHOIS para dominios .cl), y calcula un puntaje de riesgo (0-100) y un nivel de riesgo (bajo/medio/alto) mediante un algoritmo heurístico por reglas. El resultado se guarda como un reporte en MongoDB Atlas.

El acceso a la API es por número de teléfono, mediante un código OTP. El login y el registro están unificados: si el número no existe, se crea automáticamente al verificar el código.

**Nota sobre el OTP:** el envío del código es simulado (el backend lo devuelve en la respuesta en vez de enviarlo por SMS real). Esta es una decisión de diseño permanente del proyecto, tomada para evitar los costos de un proveedor externo de SMS, y no una funcionalidad pendiente.

**Nota sobre el scoring:** el análisis de riesgo es heurístico por reglas, no usa Machine Learning. Esta decisión se tomó considerando el tamaño del dataset disponible y el plazo del proyecto.

## Tecnologías

- Node.js
- Express 5
- MongoDB Atlas (vía Mongoose 9)
- JWT (jsonwebtoken) para autenticación
- Axios
- VirusTotal API (plan gratuito: 4 consultas/min, 500/día)
- RDAP (rdap.org) para dominios no .cl
- WHOIS clásico (socket TCP puerto 43 a whois.nic.cl) para dominios .cl
- Google Gemini API (`@google/generative-ai`) para el asistente educativo (chatbot)
- Jest para pruebas unitarias
- Render para el despliegue en la nube

## Despliegue

El backend está desplegado en Render y disponible en:

**`https://sms-security-backend.onrender.com`**

Al estar en el plan gratuito, el servicio se "duerme" tras 15 minutos de inactividad — la primera petición después de eso puede demorar entre 30 y 50 segundos en responder mientras se reactiva.

## Cómo ejecutar localmente

### Requisitos
- Node.js v24.x
- Una cuenta de MongoDB Atlas con un cluster disponible
- Una API Key gratuita de VirusTotal
- Una API Key de Google Gemini (para el chatbot)

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
JWT_SECRET=<cualquier string secreto, usado para firmar los tokens>
GEMINI_API_KEY=<tu api key de Google Gemini>


4. Ejecutar en modo desarrollo:
```bash
   npm run dev
```

El servidor queda disponible en `http://localhost:3000`.

### Ejecutar las pruebas unitarias

```bash
   npm test
```

## Integrantes y roles

| Integrante | Rol |
|---|---|
| Bryan Acuña | Backend (Node.js/Express), autenticación (OTP/JWT), integración de APIs externas (VirusTotal, RDAP/WHOIS), lógica de scoring, pruebas unitarias, despliegue en Render |
| Manuel Rivas | Frontend (React Native), experiencia de usuario para adultos mayores |
| Marcel Tusach | Base de datos (MongoDB), chatbot educativo (Gemini), panel de administración, Documento de Diseño |

## Metodología

El proyecto se desarrolla bajo metodología Cascada, con las etapas: Problema, Requerimientos, Modelo de Datos, Arquitectura, Interfaz, Backend, APIs, Scoring, Autenticación, Frontend, Chatbot, Panel de Administración, Pruebas, Documentación y presentación.

## Arquitectura

Modelo Cliente-Servidor de tres capas:

- **Capa de Presentación:** App Android en React Native (repositorio aparte) y panel de administración web (repositorio aparte).
- **Capa de Negocio (este repositorio):** API REST en Node.js/Express, desplegada en Render. Orquesta la autenticación por OTP/JWT, el desacortado de URL, la consulta a VirusTotal, la consulta de antigüedad de dominio (RDAP/WHOIS) y el motor de scoring.
- **Capa de Datos:** MongoDB Atlas, colecciones `Usuario`, `Reporte`, `HistorialAnalisis`, `CacheDominio` y `CodigoOtp`.

Detalle completo de arquitectura, modelo de datos y diagramas UML en el Documento de Diseño del equipo.

## Autenticación

El login y registro se unifican por número de teléfono mediante un código OTP de un solo uso:

1. `POST /api/auth/solicitar-otp` — genera y devuelve un código (simulado, válido 5 minutos).
2. `POST /api/auth/verificar-otp` — valida el código y entrega un JWT. Si el teléfono no existía, se crea el usuario automáticamente con rol `usuario_movil`.

El token no expira (queda vigente hasta que el cliente lo elimine). Existen dos roles: `usuario_movil` (la app) y `admin` (el panel de administración). Todos los endpoints salvo los de autenticación y la lectura pública de reportes requieren estar logueado, y algunos además requieren el rol `admin`.

## Contrato de la API

### `GET /`
Mensaje de estado del servidor.

### `POST /api/auth/solicitar-otp`
Solicita un código OTP para un número de teléfono.

Body: `{ "telefono": "+56912345678" }`

### `POST /api/auth/verificar-otp`
Verifica el código y entrega el JWT. Si el usuario no existía, se crea.

Body: `{ "telefono": "+56912345678", "codigo": "123456" }`

Respuesta: `{ "token": "...", "usuario": { "_id", "telefono", "rol" } }`

### `POST /api/reportes`
Analiza un mensaje y, opcionalmente, lo reporta. **Requiere autenticación** (`Authorization: Bearer <token>`): el análisis siempre queda asociado al usuario autenticado y se registra en su historial.

Recibe `mensaje` (requerido) y opcionalmente `url`, `guardar` (default `true`).

- Si no se envía `url`, el backend intenta extraerla del mensaje. Si hay URL, se consulta VirusTotal y la antigüedad del dominio, y se calcula `score_riesgo` y `nivel_riesgo` (bajo/medio/alto).
- La categoría y la empresa mencionada se infieren automáticamente del texto.
- Siempre se registra o actualiza el análisis en el historial del usuario (`HistorialAnalisis`).
- Si `guardar` es `false`, el backend realiza el análisis completo y lo devuelve (status 200), pero **no crea un Reporte público**.
- Si `guardar` es `true` (o se omite), se crea además el Reporte formal (status 201), visible para el panel de administración.

### `GET /api/reportes`
Lista todos los reportes (público, usado por el panel de administración).

### `PATCH /api/reportes/:id`
Actualiza el `estado` de un reporte (`pendiente`, `confirmado_smishing`, `falso_positivo`). Requiere token de un usuario con rol `admin`.

### `DELETE /api/reportes/:id`
Elimina un reporte. Requiere token de un usuario con rol `admin`.

### `GET /api/historial`
Devuelve el historial de análisis del usuario logueado (todos los mensajes que analizó, los haya reportado o no). Requiere token. Es la bandeja de entrada principal de la app móvil.

### `GET /api/usuarios`
Lista todos los usuarios registrados. Requiere token de un usuario con rol `admin`. Usado por el panel de administración.

### `PATCH /api/usuarios/:id`
Actualiza un usuario (por ejemplo, su `rol`). Requiere token de un usuario con rol `admin`.

### `DELETE /api/usuarios/:id`
Elimina un usuario. Requiere token de un usuario con rol `admin`.

### `POST /api/asistente/chat`
Consulta al asistente educativo (chatbot con Gemini) sobre smishing. Recibe `{ "mensajeUsuario": "..." }`.

## Niveles de riesgo

- 0-39: riesgo bajo
- 40-69: riesgo medio
- 70-100: riesgo alto

El campo `nivel_riesgo` (texto) se calcula y expone automáticamente junto al `score_riesgo` numérico.

## Estado actual

**Implementado y probado:**
- CRUD completo de reportes, protegido con roles para edición/eliminación.
- Flujo completo de análisis en `POST /api/reportes` (extracción de URL, desacortado, VirusTotal, antigüedad de dominio, scoring, nivel de riesgo), con autenticación obligatoria.
- Inferencia de categoría/empresa mencionada por reglas.
- Autenticación unificada por OTP + JWT, con roles `usuario_movil` / `admin`.
- Historial de análisis por usuario (bandeja de entrada de la app), independiente de si el mensaje fue reportado o no.
- Endpoints de gestión de usuarios para el panel de administración.
- Caché de dominios (patrón Cache-Aside, colección `CacheDominio`, TTL 24h) para reducir consultas a VirusTotal y WHOIS/RDAP.
- Asistente educativo (chatbot) vía Google Gemini, con contextualización automática del mensaje analizado cuando se accede desde su detalle.
- Despliegue en producción en Render.
- 118 pruebas unitarias con Jest, cubriendo controladores, rutas y servicios.

**Decisiones de diseño permanentes (no son pendientes):**
- El envío del código OTP es simulado, no se integra un proveedor real de SMS.
- El análisis de riesgo es heurístico por reglas, no usa Machine Learning.