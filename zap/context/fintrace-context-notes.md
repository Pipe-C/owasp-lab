# Configuración de contexto en ZAP para Fintrace

ZAP guarda los contextos en un formato binario propio (`.context`) que se
exporta desde la interfaz, no se escribe a mano de forma práctica. Sigue
estos pasos dentro de ZAP (una sola vez) y luego exporta el contexto a esta
carpeta (`Contexts → Fintrace → Export Context`) para versionarlo:

1. **Crear el contexto:** `Manual Explore` → URL `http://localhost:5173` →
   `Launch Browser`. ZAP crea el contexto "Default Context"; renómbralo a
   `fintrace`.
2. **Alcance:** incluye `http://localhost:5173.*` y
   `http://localhost:4000/api/.*`.
3. **Autenticación (para que ZAP identifique sesión vs. anónimo):**
   - Tipo: *Script-based Authentication* o, más simple para este laboratorio,
     autenticación manual: inicia sesión normalmente en el navegador lanzado
     por ZAP con `auditor@fintrace.test` / `Contable123`, y deja que el HUD
     capture la cookie `fintrace_token` en el Sites tree.
   - Indicador de sesión activa: respuesta 200 en `GET /api/auth/me`.
   - Indicador de sesión cerrada: respuesta 401 en `GET /api/auth/me`.
4. **Usuarios de contexto:** agrega los dos usuarios semilla
   (`admin@fintrace.test` / `Audit0r!2026`, rol admin; `auditor@fintrace.test`
   / `Contable123`, rol auditor) para poder alternar sesiones al probar IDOR
   (Vector 6): con la sesión del auditor, pide una factura que pertenece al
   admin.
5. Exporta el contexto resultante como `fintrace.context` en esta carpeta.
