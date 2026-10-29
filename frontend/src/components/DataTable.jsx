import '../styles/DataTable.css';

export default function DataTable({ columns, rows, emptyMessage, onRowClick }) {
  if (!rows || rows.length === 0) {
    return <p className="data-table__empty">{emptyMessage || 'Sin resultados.'}</p>;
  }

  return (
    <div className="data-table__wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              style={{ animationDelay: `${i * 40}ms` }}
              className={onRowClick ? 'data-table__row--clickable' : ''}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
