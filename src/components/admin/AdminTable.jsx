// src/components/admin/AdminTable.jsx
import React from 'react';
import './AdminTable.css';

const AdminTable = ({ columns, data, onRowClick, actions }) => {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>{col.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={row.id || rowIdx} onClick={() => onRowClick && onRowClick(row)}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
              {actions && (
                <td className="admin-table-actions">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      className={`admin-action-btn admin-action-${action.variant || 'default'}`}
                      onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                    >
                      {typeof action.label === 'function' ? action.label(row) : action.label}
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="admin-table-empty">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;