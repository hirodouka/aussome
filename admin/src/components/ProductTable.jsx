import React from 'react';
import { Edit3, Trash2, Zap, CheckCircle2 } from 'lucide-react';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="table-container" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No products found in catalog. Click "Add New Product" above to create one.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Selling Price</th>
            <th>Original Price</th>
            <th>Badge</th>
            <th>Flash Sale</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const badgeClass = p.badge ? `badge-${p.badge.toLowerCase()}` : 'badge-new';
            return (
              <tr key={p.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={p.image} alt={p.name} className="prod-thumb" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFF' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>ID: {p.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{p.category}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>
                    ${Number(p.price).toFixed(2)}
                  </span>
                </td>
                <td>
                  {p.originalPrice ? (
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)' }}>
                      ${Number(p.originalPrice).toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-subtle)' }}>-</span>
                  )}
                </td>
                <td>
                  {p.badge ? (
                    <span className={`badge-chip ${badgeClass}`}>{p.badge}</span>
                  ) : (
                    <span style={{ color: 'var(--text-subtle)' }}>-</span>
                  )}
                </td>
                <td>
                  {p.isFlashSale ? (
                    <span style={{ color: 'var(--accent-red)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={14} /> Active
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-subtle)' }}>No</span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="action-btn"
                    onClick={() => onEdit(p)}
                    title="Edit Product"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete(p.id)}
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
