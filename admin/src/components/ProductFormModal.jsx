import React, { useState, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, onSave, initialData }) {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Clothing',
    price: '',
    originalPrice: '',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
    isFeatured: true,
    isFlashSale: false,
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Clothing',
        price: initialData.price || '',
        originalPrice: initialData.originalPrice || '',
        badge: initialData.badge || 'New',
        image: initialData.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
        isFeatured: initialData.isFeatured ?? true,
        isFlashSale: initialData.isFlashSale ?? false,
        description: initialData.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Clothing',
        price: '',
        originalPrice: '',
        badge: 'New',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
        isFeatured: true,
        isFlashSale: false,
        description: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3 className="modal-title">
              {isEditMode ? 'Edit Product' : 'Add New Clothing Product'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {isEditMode
                ? 'Update pricing, images, and description'
                : 'Publish a new item to the storefront catalog'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group full">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Minimalist Linen Cover Shirt"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-control"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Clothing">Clothing</option>
              <option value="Shoes">Shoes</option>
              <option value="Accessories">Accessories</option>
              <option value="Sale">Sale</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Badge Tag</label>
            <select
              className="form-control"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            >
              <option value="New">New</option>
              <option value="Sale">Sale</option>
              <option value="Hot">Hot</option>
              <option value="Trending">Trending</option>
              <option value="Must Have">Must Have</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Selling Price ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              className="form-control"
              placeholder="45.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Original Price ($) (Optional)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="60.00"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-control"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div className="form-group full">
            <label className="form-label">Product Description</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Provide sizing details, fabric information..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group full" style={{ flexDirection: 'row', gap: '24px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              />
              <span>Featured on Homepage</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--accent-red)' }}>
              <input
                type="checkbox"
                checked={formData.isFlashSale}
                onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
              />
              <strong>Include in Flash Sales</strong>
            </label>
          </div>

          <div className="form-group full" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="action-btn"
              onClick={onClose}
              style={{ padding: '10px 20px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-btn"
            >
              <Check size={16} />
              <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
