# Plantilla del informe final (numeral 8 de la guía)

Completa esta plantilla a medida que avances en las Fases 1–4 (`PLAN.md`), y
conviértela a PDF al final (Word, Google Docs, o pídeme ayuda para
convertirla). Sigue exactamente la estructura exigida por la guía.

## 1. Portada oficial

- Integrantes:
- Fecha de entrega:
- Asignatura: Seguridad en Aplicaciones Web / Seguridad Informática
- Docente: Cristian Lopera Villa
- Tipo de aplicación auditada: **Propia** (Fintrace)
- URL del repositorio Git:

## 2. Resumen ejecutivo

Tabla comparativa de alertas iniciales vs. finales por severidad (se llena
con los dos reportes exportados de ZAP en `docs/informe/zap-reports/`):

| Severidad | Alertas iniciales (vulnerable) | Alertas finales (corregido) |
|---|---|---|
| Alta |  |  |
| Media |  |  |
| Baja |  |  |

## 3. Desarrollo por vulnerabilidad (6 secciones)

Repite esta estructura para cada uno de los 6 vectores. El payload exacto y
la ruta de cada uno están en `backend/VULNERABILITIES.md`.

### 3.1 JWT — Autenticación rota
- **Diagnóstico en ZAP:** _(captura de la alerta)_
- **Evidencia de explotación:** _(captura de la petición/respuesta)_
- **Código vulnerable vs. corregido:** ver `backend/src/utils/jwt.js`
- **Verificación:** _(captura del re-escaneo)_

### 3.2 SSRF
- **Diagnóstico en ZAP:**
- **Evidencia de explotación:**
- **Código vulnerable vs. corregido:** ver `backend/src/routes/webhooks.routes.js` y `backend/src/utils/ssrfGuard.js`
- **Verificación:**

### 3.3 CSRF
- **Diagnóstico en ZAP:**
- **Evidencia de explotación:**
- **Código vulnerable vs. corregido:** ver `backend/src/middleware/csrf.js`
- **Verificación:**

### 3.4 Inyección SQL (SQLi)
- **Diagnóstico en ZAP:**
- **Evidencia de explotación:**
- **Código vulnerable vs. corregido:** ver `backend/src/routes/auth.routes.js`
- **Verificación:**

### 3.5 XSS (almacenado y reflejado)
- **Diagnóstico en ZAP:**
- **Evidencia de explotación:**
- **Código vulnerable vs. corregido:** ver `backend/src/routes/comments.routes.js`, `backend/src/routes/search.routes.js`
- **Verificación:**

### 3.6 IDOR / Mass Assignment
- **Diagnóstico en ZAP:**
- **Evidencia de explotación:**
- **Código vulnerable vs. corregido:** ver `backend/src/routes/invoices.routes.js`, `backend/src/routes/users.routes.js`
- **Verificación:**

## 4. Anexos

- Reportes HTML/PDF originales de ZAP → `docs/informe/zap-reports/`
