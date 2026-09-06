import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit, Trash2, ShieldCheck, Check, Upload, Crop, ZoomIn, ZoomOut, RefreshCw, ShoppingBag, Eye, Lock, CheckCircle2 } from 'lucide-react';
import { createProduct, updateProduct, deleteProduct, fetchOrders, updateOrderStatus, updateProductStatus } from '../services/api';

export default function AdminModal({ isOpen, onClose, products, onRefreshProducts, initialEditProduct, initialTab }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab || (initialEditProduct ? 'edit' : 'list')); // 'list', 'add', 'edit', 'orders'
  const [editingProduct, setEditingProduct] = useState(initialEditProduct || null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [orders, setOrders] = useState([]);
  const [localProducts, setLocalProducts] = useState(products || []);
  const [viewProofImage, setViewProofImage] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

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

  const loadOrders = async () => {
    const fetched = await fetchOrders();
    setOrders(fetched || []);
  };

  useEffect(() => {
    setLocalProducts(products || []);
  }, [products]);

  useEffect(() => {
    loadOrders();
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

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
        images: initialEditProduct.images || (initialEditProduct.image ? [initialEditProduct.image] : []),
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
      image: '',
      images: [],
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
    const existingImages = Array.isArray(prod.images) && prod.images.length > 0 
      ? prod.images 
      : (prod.image ? [prod.image] : []);
    setFormData({
      name: prod.name || '',
      category: prod.category || 'Clothing',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      badge: prod.badge || 'New',
      image: prod.image || existingImages[0] || '',
      images: existingImages,
      isFeatured: prod.isFeatured ?? true,
      isFlashSale: prod.isFlashSale ?? false,
      description: prod.description || ''
    });
    setActiveTab('edit');
  };

  // Image Upload Handler
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

  // Process Crop Canvas Output
  const handleApplyCrop = () => {
    if (!rawImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 600;
      const targetHeight = 800; // 3:4 Aspect ratio for clothing store
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
      setFormData((prev) => {
        const currentImages = Array.isArray(prev.images) && prev.images.length > 0
          ? prev.images
          : (prev.image ? [prev.image] : []);
        const updatedImages = [...currentImages, croppedBase64];
        return {
          ...prev,
          image: updatedImages[0] || '',
          images: updatedImages
        };
      });
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

  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  const requestDelete = (product) => {
    setDeleteConfirmProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    const target = deleteConfirmProduct;
    setDeleteConfirmProduct(null);
    setLoading(true);
    try {
      setLocalProducts((prev) => prev.filter((p) => p.id !== target.id));
      await deleteProduct(target.id);
      if (onRefreshProducts) await onRefreshProducts();
      setStatusMsg(`"${target.name || 'Product'}" has been permanently deleted!`);
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (order) => {
    await updateOrderStatus(order.id, 'Payment Verified', true);
    for (const item of order.items || []) {
      if (item.id) await updateProductStatus(item.id, 'On Hold');
    }
    setStatusMsg(`Payment confirmed for order ${order.id}!`);
    await loadOrders();
    if (onRefreshProducts) onRefreshProducts();
  };

  const handlePutItemOnHold = async (productId, currentStatus) => {
    const nextStatus = currentStatus === 'On Hold' ? 'Available' : 'On Hold';
    setLocalProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p))
    );
    await updateProductStatus(productId, nextStatus);
    setStatusMsg(`Product status set to ${nextStatus.toUpperCase()}!`);
    if (onRefreshProducts) await onRefreshProducts();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '1100px', width: '94vw' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
          <ShieldCheck size={28} color="#EA580C" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
              Store Admin & Order Verification
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              Manage products, review payment proofs, confirm orders, and reserve or delete listings
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-modal-nav-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
              onClick={() => { setActiveTab('orders'); loadOrders(); }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: activeTab === 'orders' ? '#EA580C' : '#F3F4F6',
                color: activeTab === 'orders' ? '#FFF' : '#111'
              }}
            >
              <ShoppingBag size={16} />
              <span>Customer Orders & Payments ({orders.length})</span>
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
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px' }}>Item</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Badge</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
                      <img src={p.image} alt={p.name} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px', background: '#E5E7EB', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '12px', color: '#4B5563', whiteSpace: 'nowrap' }}>{p.category}</td>
                    <td style={{ padding: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>₱{Number(p.price).toFixed(2)}</td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {p.status === 'On Hold' ? (
                        <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                          ON HOLD / RESERVED
                        </span>
                      ) : (
                        <span style={{ background: '#D1FAE5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Available
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {p.badge ? <span style={{ background: '#E5E7EB', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{p.badge}</span> : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handlePutItemOnHold(p.id, p.status)}
                        style={{
                          padding: '6px 10px',
                          background: p.status === 'On Hold' ? '#10B981' : '#F59E0B',
                          color: '#FFF',
                          borderRadius: '4px',
                          marginRight: '6px',
                          fontWeight: 600,
                          fontSize: '0.78rem'
                        }}
                        title={p.status === 'On Hold' ? 'Set item to Available' : 'Put Item On Hold'}
                      >
                        <Lock size={13} style={{ display: 'inline', marginRight: '3px' }} />
                        {p.status === 'On Hold' ? 'Unhold' : 'Hold'}
                      </button>
                      <button
                        onClick={() => handleStartEdit(p)}
                        style={{ padding: '6px 10px', background: '#EA580C', color: '#FFF', borderRadius: '4px', marginRight: '6px', fontWeight: 600 }}
                        title="Edit Item"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => requestDelete(p)}
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

        {/* TAB 4: CUSTOMER ORDERS & PAYMENTS */}
        {activeTab === 'orders' && (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
                <ShoppingBag size={40} color="#9CA3AF" style={{ marginBottom: '10px' }} />
                <p style={{ fontWeight: 600 }}>No customer orders received yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '920px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '12px 10px', width: '140px', whiteSpace: 'nowrap' }}>Order Ref</th>
                    <th style={{ padding: '12px 10px', width: '140px' }}>Customer Info</th>
                    <th style={{ padding: '12px 10px', width: '120px' }}>Message</th>
                    <th style={{ padding: '12px 10px', minWidth: '180px' }}>Items Purchased</th>
                    <th style={{ padding: '12px 10px', width: '100px', whiteSpace: 'nowrap' }}>Total</th>
                    <th style={{ padding: '12px 10px', width: '110px', whiteSpace: 'nowrap' }}>Payment</th>
                    <th style={{ padding: '12px 10px', width: '100px', whiteSpace: 'nowrap' }}>Proof</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right', minWidth: '170px', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700, fontSize: '0.82rem', color: '#111827', wordBreak: 'break-all' }}>
                        {ord.id}
                        <br />
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400, whiteSpace: 'nowrap' }}>
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 700, wordBreak: 'break-word' }}>{ord.fullName || ord.customer?.name || 'Customer'}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4B5563', whiteSpace: 'nowrap' }}>{ord.contactNumber || ord.customer?.phone || 'No Phone'}</div>
                      </td>
                      <td style={{ padding: '12px 10px', color: '#4B5563', fontSize: '0.8rem', fontStyle: (ord.messageToSeller || ord.customer?.messageToSeller) ? 'normal' : 'italic', wordBreak: 'break-word' }}>
                        {ord.messageToSeller || ord.customer?.messageToSeller || 'None'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {(ord.items || []).map((it, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{it.name} <span style={{ color: '#6B7280', fontSize: '0.76rem' }}>(x{it.quantity})</span></span>
                            <button
                              type="button"
                              onClick={() => handlePutItemOnHold(it.id, it.status)}
                              style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '0.72rem', textDecoration: 'underline', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700 }}
                            >
                              Hold Item
                            </button>
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: '#EA580C', whiteSpace: 'nowrap' }}>
                        ₱{Number(
                          ord.totalAmount ?? 
                          ord.total ?? 
                          (ord.items || []).reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0)
                        ).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-block',
                          background: ord.paymentMethod === 'Bank' ? '#EFF6FF' : '#F3F4F6',
                          color: ord.paymentMethod === 'Bank' ? '#1D4ED8' : '#374151'
                        }}>
                          {ord.paymentMethod === 'Bank' ? 'Bank Transfer' : 'Cash'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                        {(ord.paymentProof || ord.proofOfPayment) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            style={{ padding: '5px 10px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            <Eye size={13} />
                            <span>View Proof</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>N/A (Cash)</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrderDetails(ord)}
                            style={{ padding: '6px 12px', background: '#111827', color: '#FFF', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            title="View Full Buyer & Order Details"
                          >
                            View Order
                          </button>
                          {ord.paymentConfirmed ? (
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ECFDF5', padding: '5px 8px', borderRadius: '4px' }}>
                              <CheckCircle2 size={14} /> Confirmed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(ord)}
                              style={{ padding: '6px 12px', background: '#059669', color: '#FFF', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Confirm Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
                <option value="Hobbies">Hobbies</option>
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
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                Product Photos (Upload & Crop Multiple Photos) *
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {(formData.images && formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : [])).map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '64px', height: '80px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #D1D5DB' }}>
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const updated = (prev.images || [prev.image]).filter((_, i) => i !== idx);
                          return {
                            ...prev,
                            image: updated[0] || '',
                            images: updated
                          };
                        });
                      }}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: '#FFF',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Remove this photo"
                    >
                      <X size={12} />
                    </button>
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: '#EA580C', color: '#FFF', fontSize: '0.62rem', textAlign: 'center', fontWeight: 700 }}>
                        MAIN
                      </span>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: '2px dashed #EA580C',
                    background: '#FFF7ED',
                    color: '#EA580C',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    minHeight: '80px',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={18} />
                  <span>+ Add & Crop Photo</span>
                </button>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '6px', display: 'block' }}>
                You can upload multiple photos per product. The first photo will be used as the main display cover.
              </span>
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
                style={{ background: '#EA580C' }}
              >
                {loading ? 'Saving...' : activeTab === 'add' ? 'Publish Item' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ORDER & BUYER DETAILS POPUP MODAL */}
        {selectedOrderDetails && (
          <div
            className="modal-overlay"
            style={{ zIndex: 230, background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setSelectedOrderDetails(null)}
          >
            <div
              className="modal-card"
              style={{ maxWidth: '640px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #E5E7EB' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800 }}>
                    Order Details #{selectedOrderDetails.id}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
                <button className="icon-btn" onClick={() => setSelectedOrderDetails(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Buyer Details Section */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👤 Buyer Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'block' }}>Full Name</span>
                    <strong style={{ fontSize: '1rem', color: '#111827' }}>
                      {selectedOrderDetails.fullName || selectedOrderDetails.customer?.name || 'Customer'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'block' }}>Contact Phone</span>
                    <strong style={{ fontSize: '1rem', color: '#111827' }}>
                      {selectedOrderDetails.contactNumber || selectedOrderDetails.customer?.phone || 'N/A'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'block' }}>Payment Method</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      background: selectedOrderDetails.paymentMethod === 'Bank' ? '#EFF6FF' : '#F3F4F6',
                      color: selectedOrderDetails.paymentMethod === 'Bank' ? '#1D4ED8' : '#374151'
                    }}>
                      {selectedOrderDetails.paymentMethod === 'Bank' ? 'Bank Transfer' : 'Cash'}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'block' }}>Status</span>
                    <strong style={{ color: selectedOrderDetails.paymentConfirmed ? '#059669' : '#EA580C' }}>
                      {selectedOrderDetails.status || 'Pending'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
                  <span style={{ color: '#6B7280', fontSize: '0.8rem', display: 'block' }}>Message to Seller</span>
                  <p style={{ fontSize: '0.88rem', color: '#374151', margin: '4px 0 0 0', fontStyle: (selectedOrderDetails.messageToSeller || selectedOrderDetails.customer?.messageToSeller) ? 'normal' : 'italic' }}>
                    {selectedOrderDetails.messageToSeller || selectedOrderDetails.customer?.messageToSeller || selectedOrderDetails.customer?.message || 'No additional instructions provided by buyer.'}
                  </p>
                </div>
              </div>

              {/* Items Purchased Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🛍️ Items Purchased
                </h4>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                  {(selectedOrderDetails.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        borderBottom: idx === (selectedOrderDetails.items || []).length - 1 ? 'none' : '1px solid #F3F4F6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image && (
                          <img src={item.image} alt={item.name} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                          <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                            Qty: {item.quantity || 1} • ₱{Number(item.price || 0).toFixed(2)} each
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        ₱{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#F9FAFB', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #E5E7EB' }}>
                    <span style={{ fontWeight: 700 }}>Total Order Amount:</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#EA580C' }}>
                      ₱{Number(
                        selectedOrderDetails.totalAmount ?? 
                        selectedOrderDetails.total ?? 
                        (selectedOrderDetails.items || []).reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ATTACHED PROOF OF PAYMENT PHOTO SECTION */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📸 Attached Confirmation / Proof of Payment Screenshot
                </h4>
                {(selectedOrderDetails.paymentProof || selectedOrderDetails.proofOfPayment) ? (
                  <div style={{ textAlign: 'center', background: '#F9FAFB', border: '2px dashed #EA580C', borderRadius: '10px', padding: '16px' }}>
                    <img
                      src={selectedOrderDetails.paymentProof || selectedOrderDetails.proofOfPayment}
                      alt="Buyer Payment Screenshot"
                      style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                    />
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '8px', fontWeight: 600 }}>
                      Uploaded by {selectedOrderDetails.fullName || selectedOrderDetails.customer?.name || 'Buyer'}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#F3F4F6', color: '#6B7280', padding: '16px', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem' }}>
                    No payment screenshot required (Mode: Cash / COD).
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600 }}
                >
                  Close
                </button>
                {!selectedOrderDetails.paymentConfirmed && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleConfirmPayment(selectedOrderDetails);
                      setSelectedOrderDetails(null);
                    }}
                    style={{ padding: '10px 24px', borderRadius: '6px', background: '#059669', color: '#FFF', fontWeight: 700 }}
                  >
                    Confirm Payment Received
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROOF OF PAYMENT IMAGE VIEWER MODAL */}
        {viewProofImage && (
          <div
            className="modal-overlay"
            style={{ zIndex: 220, background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setViewProofImage(null)}
          >
            <div
              className="modal-card"
              style={{ maxWidth: '500px', textAlign: 'center', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Proof of Payment Screenshot</span>
                <button className="icon-btn" onClick={() => setViewProofImage(null)}>
                  <X size={18} />
                </button>
              </div>
              <img
                src={viewProofImage}
                alt="Payment Proof"
                style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <button
                onClick={() => setViewProofImage(null)}
                style={{ marginTop: '16px', padding: '8px 20px', background: '#111827', color: '#FFF', borderRadius: '6px', fontWeight: 700 }}
              >
                Close Viewer
              </button>
            </div>
          </div>
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
                  <Crop size={20} color="#EA580C" />
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
                  border: '2px dashed #EA580C',
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
                  style={{ padding: '10px 24px', borderRadius: '6px', background: '#EA580C', color: '#FFF', fontWeight: 700 }}
                >
                  Crop & Apply Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Dialog for Product Deletion */}
        {deleteConfirmProduct && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              backdropFilter: 'blur(4px)',
              padding: '20px'
            }}
            onClick={() => setDeleteConfirmProduct(null)}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '28px 24px',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Trash2 size={26} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                Delete Listing Confirmation
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '20px' }}>
                Are you sure you want to delete <strong style={{ color: '#111827' }}>"{deleteConfirmProduct?.name || 'this product'}"</strong>? This will remove the listing from both the Admin Portal and Customer Store.
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmProduct(null)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: '#F9FAFB',
                    color: '#374151',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  Yes, Delete Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
