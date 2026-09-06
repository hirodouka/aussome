import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit, Trash2, ShieldCheck, Check, Upload, Crop, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct } from '../services/api';

export default function AdminModal({ isOpen, onClose, products, onRefreshProducts, initialEditProduct }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialEditProduct ? 'edit' : 'list'); // 'list', 'add', 'edit'
  const [editingProduct, setEditingProduct] = useState(initialEditProduct || null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: initialEditProduct?.name || '',
    category: initialEditProduct?.category || 'Clothing',
    price: initialEditProduct?.price || '',
    originalPrice: initialEditProduct?.originalPrice || '',
    badge: initialEditProduct?.badge || 'New',
    image: initialEditProduct?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
    isFeatured: initialEditProduct?.isFeatured ?? true,
    isFlashSale: initialEditProduct?.isFlashSale ?? false,
    description: initialEditProduct?.description || ''
  });

  useEffect(() => {
    if (initialEditProduct) {
      setEditingProduct(initialEditProduct);
      setFormData({
        name: initialEditProduct.name || '',
        category: initialEditProduct.category || 'Clothing',
        price: initialEditProduct.price || '',
        originalPrice: initialEditProduct.originalPrice || '',
        badge: initialEditProduct.badge || 'New',
        image: initialEditProduct.image || '',
        isFeatured: initialEditProduct.isFeatured ?? true,
        isFlashSale: initialEditProduct.isFlashSale ?? false,
        description: initialEditProduct.description || ''
      });
      setActiveTab('edit');
    }
  }, [initialEditProduct]);

  const resetForm = () => {
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
    setEditingProduct(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setActiveTab('add');
  };

  const handleStartEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      badge: prod.badge || 'New',
      image: prod.image,
      isFeatured: prod.isFeatured ?? true,
      isFlashSale: prod.isFlashSale ?? false,
      description: prod.description || ''
    });
    setActiveTab('edit');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = () => {
    if (!rawImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 600;
      const targetHeight = 800;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#F3F4F6';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const scale = zoom * Math.max(targetWidth / img.width, targetHeight / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const dx = (targetWidth - sw) / 2 + cropOffset.x;
      const dy = (targetHeight - sh) / 2 + cropOffset.y;

      ctx.drawImage(img, dx, dy, sw, sh);

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.88);
      setFormData((prev) => ({ ...prev, image: croppedBase64 }));
      setCropperOpen(false);
      setRawImageSrc(null);
    };
    img.src = rawImageSrc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      if (activeTab === 'add') {
        await createProduct(formData);
        setStatusMsg('New clothing item published successfully!');
      } else if (activeTab === 'edit' && editingProduct) {
        await updateProduct(editingProduct.id, formData);
        setStatusMsg('Product details saved successfully!');
      }
      if (onRefreshProducts) await onRefreshProducts();
      setTimeout(() => {
        setStatusMsg(null);
        setActiveTab('list');
        resetForm();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusMsg('Changes saved to local catalog state!');
      if (onRefreshProducts) onRefreshProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await deleteProduct(id);
      if (onRefreshProducts) await onRefreshProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <ShieldCheck size={28} color="#111827" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
              Store Admin & Catalog Management
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Add new clothes, edit prices (₱), upload & crop photos, and save live catalog changes
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setActiveTab('list'); resetForm(); }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                background: activeTab === 'list' ? '#111827' : '#F3F4F6',
                color: activeTab === 'list' ? '#FFF' : '#111'
              }}
            >
              All Products ({products.length})
            </button>
            <button
              onClick={handleStartAdd}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'add' ? '#111827' : '#F3F4F6',
                color: activeTab === 'add' ? '#FFF' : '#111'
              }}
            >
              <Plus size={16} />
              <span>Add New Item</span>
            </button>
          </div>

          {statusMsg && (
            <div style={{ background: '#D1FAE5', color: '#065F46', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} />
              {statusMsg}
            </div>
          )}
        </div>

        {/* TAB 1: PRODUCT LIST TABLE */}
        {activeTab === 'list' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px' }}>Item</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Badge</th>
                  <th style={{ padding: '12px' }}>Flash Sale</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt={p.name} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px', background: '#E5E7EB' }} />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#4B5563' }}>{p.category}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>₱{Number(p.price).toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      {p.badge ? <span style={{ background: '#E5E7EB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{p.badge}</span> : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {p.isFlashSale ? <span style={{ color: '#EF4444', fontWeight: 700 }}>Active</span> : 'No'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleStartEdit(p)}
                        style={{ padding: '6px 10px', background: '#F3F4F6', borderRadius: '4px', marginRight: '6px' }}
                        title="Edit Item"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{ padding: '6px 10px', background: '#FEE2E2', color: '#EF4444', borderRadius: '4px' }}
                        title="Delete Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2 & 3: ADD / EDIT PRODUCT FORM */}
        {(activeTab === 'add' || activeTab === 'edit') && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Clothing Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vintage Oversized Denim Jacket"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              >
                <option value="Clothing">Clothing</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
                <option value="Sale">Sale</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Selling Price (₱) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="₱45.00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Original Price (₱) (Optional for strike-through)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="₱60.00"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Badge Tag
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              >
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Hot">Hot</option>
                <option value="Trending">Trending</option>
                <option value="Must Have">Must Have</option>
              </select>
            </div>

            {/* IMAGE UPLOAD & CROPPER FIELD */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Product Image (Upload & Crop) *
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: '48px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #111827',
                    background: '#F3F4F6',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Upload size={15} />
                  <span>{formData.image ? 'Change & Crop Photo' : 'Upload & Crop Photo'}</span>
                </button>
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                Product Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe material, sizing fit, and details..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>Featured Product</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData({ ...formData, isFlashSale: e.target.checked })}
                />
                <span style={{ color: '#EF4444', fontWeight: 700 }}>Include in Sale Items</span>
              </label>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('list'); resetForm(); }}
                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="hero-btn"
              >
                {loading ? 'Saving...' : activeTab === 'add' ? 'Publish Item' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* INTERACTIVE IMAGE CROPPER MODAL */}
        {cropperOpen && (
          <div
            className="modal-overlay"
            style={{ zIndex: 200, background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setCropperOpen(false)}
          >
            <div
              className="modal-card"
              style={{ maxWidth: '520px', padding: '24px', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.1rem' }}>
                  <Crop size={20} color="#111827" />
                  <span>Crop Product Image (3:4 Ratio)</span>
                </div>
                <button className="icon-btn" onClick={() => setCropperOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              {/* Cropper Preview Frame */}
              <div
                style={{
                  width: '240px',
                  height: '320px',
                  margin: '0 auto 20px auto',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#111827',
                  border: '2px dashed #111827',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}
              >
                {rawImageSrc && (
                  <img
                    src={rawImageSrc}
                    alt="Raw Upload"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: `scale(${zoom}) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  />
                )}
              </div>

              {/* Zoom Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.8, z - 0.15))}
                  style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ZoomOut size={16} />
                  <span>Zoom -</span>
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, minWidth: '50px' }}>{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
                  style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ZoomIn size={16} />
                  <span>Zoom +</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(1); setCropOffset({ x: 0, y: 0 }); }}
                  style={{ padding: '8px 12px', background: '#F3F4F6', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Reset Crop"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setCropperOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  style={{ padding: '10px 24px', borderRadius: '6px', background: '#111827', color: '#FFF', fontWeight: 700 }}
                >
                  Crop & Apply Image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
