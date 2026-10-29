import '../styles/StatusStamp.css';

const VARIANTS = {
  aprobada: { label: 'Aprobada', tone: 'ok' },
  pendiente: { label: 'Pendiente', tone: 'warn' },
  observada: { label: 'Observada', tone: 'risk' },
  vulnerable: { label: 'Vulnerable', tone: 'risk' },
  corregida: { label: 'Corregida', tone: 'ok' },
};

export default function StatusStamp({ status }) {
  const variant = VARIANTS[status] || { label: status, tone: 'warn' };
  return (
    <span className={`status-stamp status-stamp--${variant.tone}`}>
      <svg
        className="status-stamp__ring"
        viewBox="0 0 120 40"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M4 20 C 6 6, 18 3, 30 4 C 50 1, 72 2, 92 4 C 108 2, 116 10, 116 20
             C 116 32, 108 38, 92 37 C 70 39, 48 38, 28 37 C 14 38, 4 32, 4 20 Z"
        />
      </svg>
      <span className="status-stamp__label">{variant.label}</span>
    </span>
  );
}
