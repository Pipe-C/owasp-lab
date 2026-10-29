// Sanitización mínima para el modo parcheado del Vector 5 (XSS). En un
// proyecto real se preferiría una librería madura (DOMPurify en el cliente,
// sanitize-html en el servidor); aquí se implementa a mano para que el
// snippet "antes/después" del informe sea legible y autocontenido.
export function stripHtml(input) {
  return String(input)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
