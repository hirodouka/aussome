import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const imageList = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : 'Default');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const activeImage = imageList[activeImageIndex] || product.image;

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const handleAdd = () => {
    onAddToCart({
      ...product,
      image: activeImage,
      selectedColor,
      quantity: 1
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'flex-start' }}>
          {/* Image Gallery Column */}
          <div>
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#F3F4F6', aspectRatio: '3/4', marginBottom: '12px' }}>
              <img
                src={activeImage}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Navigation Arrows for Photos */}
              <button
                type="button"
                onClick={handlePrevPhoto}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  color: '#111827',
                  zIndex: 5
                }}
                title="Previous Photo"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={handleNextPhoto}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  color: '#111827',
                  zIndex: 5
                }}
                title="Next Photo"
              >
                <ChevronRight size={24} />
              </button>

              {/* Photo Counter Badge */}
              <span style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(17, 24, 39, 0.8)',
                color: '#FFF',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '12px',
                zIndex: 5
              }}>
                {activeImageIndex + 1} / {imageList.length}
              </span>
            </div>

            {/* Thumbnail Row */}
            {imageList.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {imageList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '60px',
                      height: '75px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: activeImageIndex === idx ? '2px solid #EA580C' : '1px solid #E5E7EB',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px' }}>
              {product.category}
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 12px 0' }}>
              {product.name}
            </h2>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>₱{Number(product.price).toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '1.1rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                  ₱{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-line' }}>
              {(product.description || 'High quality soft organic cotton fabric designed for luxury and everyday comfort.')
                .split(/\s*-\s+/)
                .filter(Boolean)
                .map((item, idx, arr) => (arr.length > 1 ? `• ${item.trim()}` : item.trim()))
                .join('\n')}
            </div>

            {/* Add to Cart Button */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleAdd}
                className="hero-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {addedAnimation ? (
                  <>
                    <Check size={18} />
                    <span>Added To Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add To Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
