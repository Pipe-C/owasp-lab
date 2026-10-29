# Mapa de vulnerabilidades — Fintrace

Los 6 vectores exigidos por la guía, cada uno con: dónde vive, cómo
reproducirlo con ZAP (Requester/Resend) en `SECURITY_MODE=vulnerable`, y qué
cambia en `SECURITY_MODE=patched`. Usa esta tabla como columna vertebral de
la sección "Desarrollo por Vulnerabilidad (6 secciones)" del informe final.

Cambia el modo editando `backend/.env` (`SECURITY_MODE=vulnerable` o
`SECURITY_MODE=patched`) y reinicia `npm start` / `docker compose restart api`.

## 1. JWT — Autenticación rota

- **Archivo:** `src/utils/jwt.js` (`verifyTokenVulnerable` / `verifyTokenPatched`),
  usado por `src/middleware/auth.js`.
- **Explotar:** inicia sesión normalmente, copia tu token, y en el Requester de
  ZAP reemplázalo por uno forjado: header `{"alg":"none","typ":"JWT"}` +
  payload `{"sub":1,"role":"admin"}`, ambos en Base64URL, unidos por `.` y un
  tercer segmento vacío (`header.payload.`). Envíalo como
  `Authorization: Bearer <token>` a `GET /api/auth/me`.
- **Parche:** `jwt.verify` exige `HS256` y la firma correcta; además el rol
  efectivo se lee siempre de la base de datos, nunca del payload del token.

## 2. SSRF

- **Archivo:** `src/routes/webhooks.routes.js`, `src/utils/ssrfGuard.js`.
- **Explotar:** `POST /api/webhooks/fetch-logo` con
  `{"url":"http://169.254.169.254/latest/meta-data/"}` o
  `{"url":"http://127.0.0.1:4000/api/health"}`.
- **Parche:** `isUrlAllowed()` bloquea `127.*`, `10.*`, `172.16-31.*`,
  `192.168.*`, `169.254.*` y esquemas distintos de `http`/`https`.

## 3. CSRF

- **Archivo:** `src/routes/users.routes.js`, `src/middleware/csrf.js`.
- **Explotar:** inicia sesión, copia solo la cookie `fintrace_token`, y desde
  ZAP Requester envía `PUT /api/users/profile` con esa cookie pero **sin**
  el encabezado `X-CSRF-Token` — en modo vulnerable igual se procesa.
- **Parche:** patrón double-submit cookie: el login entrega `fintrace_csrf`
  (cookie legible por JS) y el cliente debe repetir el mismo valor en el
  encabezado `X-CSRF-Token`; sin ambos, 403.

## 4. Inyección SQL (SQLi)

- **Archivo:** `src/routes/auth.routes.js`.
- **Explotar:** `POST /api/auth/login` con
  `{"email":"admin@fintrace.test' OR '1'='1' --","password":"x"}`.
- **Parche:** consulta parametrizada (`?`) y verificación con `scrypt` sobre
  el hash real, nunca concatenación ni comparación en SQL.

## 5. XSS (almacenado y reflejado)

- **Archivos:** `src/routes/comments.routes.js` (almacenado),
  `src/routes/search.routes.js` (reflejado), `src/utils/sanitize.js`.
- **Explotar (almacenado):** en el detalle de una factura, agrega una nota con
  `<img src=x onerror="alert(document.cookie)">`.
- **Explotar (reflejado):** `GET /api/search?q=<script>alert(1)</script>` y
  observa el eco en el frontend (barra de búsqueda).
- **Parche:** `stripHtml()` escapa `<`/`>` antes de guardar o de devolver el
  eco.

## 6. IDOR / Mass Assignment

- **Archivos:** `src/routes/invoices.routes.js` (IDOR),
  `src/routes/users.routes.js` (Mass Assignment).
- **Explotar IDOR:** autenticado como `auditor@fintrace.test`, pide
  `GET /api/invoices/1` (factura que pertenece al admin).
- **Explotar Mass Assignment:** `PUT /api/users/profile` con
  `{"name":"Felipe","email":"felipe@fintrace.test","role":"admin"}`.
- **Parche:** IDOR exige `owner_id = req.user.id` (o rol admin); Mass
  Assignment usa una allowlist que ignora cualquier `role` del body.
