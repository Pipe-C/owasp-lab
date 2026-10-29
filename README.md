# Fintrace — Laboratorio de Auditoría de Seguridad Web con OWASP ZAP

Aplicación web propia (gestión de facturas y gastos de una pyme ficticia)
construida para el laboratorio de **Auditoría de Seguridad Web con OWASP
ZAP** (Seguridad en Aplicaciones Web). Contiene, de forma intencional y documentada, los 6 vectores
exigidos por la guía: JWT, SSRF, CSRF, SQLi, XSS e IDOR/Mass Assignment —
cada uno conmutable entre su versión **vulnerable** y su versión **corregida**
con una sola variable de entorno, sin redesplegar ni cambiar de rama.

Lee primero `PLAN.md` (qué está hecho y qué falta) y `DESIGN.md` (la
dirección visual). El mapa técnico de cada vulnerabilidad está en
`backend/VULNERABILITIES.md`.

## Justificación del stack

Se evaluó el stack sugerido en el texto de referencia (Node/Express +
SQLite + EJS/React + Docker) y se adoptó con dos ajustes:

| Decisión | Por qué |
|---|---|
| **Node.js + Express** | Se mantiene: control total del middleware y las rutas, necesario para implementar y luego corregir los 6 fallos de forma explícita, sin que un framework "opinado" oculte el comportamiento inseguro. |
| **SQLite vía `better-sqlite3`** (no `sqlite3` async) | Se mantiene SQLite por la misma razón del texto de referencia (cero configuración de servidor externo), pero se eligió `better-sqlite3` sobre el callback-based `sqlite3`: API síncrona, sin callbacks anidados, lo que hace que el contraste "consulta concatenada vs. parametrizada" del Vector 4 (SQLi) sea mucho más legible en los snippets del informe. |
| **React (Vite) en vez de EJS** | El texto de referencia proponía EJS por simplicidad de mapeo con el HUD de ZAP. Se prefirió React porque lo pediste explícitamente (con los estilos *fuera* de los componentes, en `frontend/src/styles/`) y porque una SPA con rutas simples (sin anidamiento profundo) no complica el Manual Explore: todas las vistas son rutas de nivel superior y ZAP las mapea igual de bien. A cambio se gana una interfaz con el nivel de acabado que pediste. |
| **Docker + Docker Compose** | Se mantiene tal cual el texto de referencia: un `docker compose up` deja la app arriba para la sustentación en vivo sin depender del entorno local de cada integrante. |
| **Toggle `SECURITY_MODE` en vez de solo ramas Git** | El texto de referencia sugiere ramas `vulnerable`/`patched`. Se añadió, además de la estrategia de commits (ver abajo), un interruptor en tiempo de ejecución (`backend/.env`) porque durante la sustentación en vivo es mucho más fluido mostrar fallo → explotación → corrección → re-escaneo reiniciando un proceso que cambiando de rama y reconstruyendo contenedores frente al docente. Las ramas siguen siendo útiles para el historial de commits (ver siguiente sección) — ambas cosas no son excluyentes. |

## Requisitos

- Node.js 20+ y npm, **o** Docker + Docker Compose.
- OWASP ZAP (Zaproxy) instalado aparte, para las Fases 1–4 de la guía.

## Cómo levantar la app

### Opción A — Docker (recomendada para la sustentación)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:4000
- La base de datos vive en un volumen (`fintrace-db`) y se siembra sola al
  arrancar el contenedor `api` la primera vez.
- Por defecto `SECURITY_MODE=vulnerable`. Para levantar en modo corregido:
  `SECURITY_MODE=patched docker compose up --build`.

### Opción B — Node local

```bash
./scripts/setup.sh      # instala dependencias y siembra la BD
cd backend  && npm run dev    # terminal 1 — API en :4000
cd frontend && npm run dev    # terminal 2 — web en :5173
```

Para alternar el modo sin Docker, edita `SECURITY_MODE` en `backend/.env` y
reinicia `npm run dev` del backend.

### Credenciales de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| `admin@fintrace.test` | `Audit0r!2026` | admin |
| `auditor@fintrace.test` | `Contable123` | auditor |

## Estructura

```
backend/    API Express + SQLite — los 6 vectores viven en src/routes/
frontend/   SPA React (Vite) — estilos en src/styles/, nunca en los .jsx
zap/        Plan de automatización y notas de contexto de ZAP
docs/informe/   Carpeta de trabajo para el informe final en PDF (numeral 8 de la guía)
scripts/    setup.sh, reset-db.sh
PRODUCT.md, DESIGN.md, PLAN.md   Documentos de producto, diseño y progreso
```
