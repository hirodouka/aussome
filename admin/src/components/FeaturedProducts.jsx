import React from 'react';
import { Eye, ShoppingCart, ArrowRight, Edit3, Trash2 } from 'lucide-react';

export default function FeaturedProducts({
  products,
  onAddToCart,
  onQuickView,
  onEditProduct,
  onDeleteProduct
}) {
  return (
    <section className="container" style={{ marginTop: '60px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Store Products Catalog</h2>
          <p style={{ fontSize: '0.88rem', color: '#6B7280' }}>
            Click "Edit Item" on any product card below to change price, image, or details.
          </p>
        </div>
      </div>

      <div className="products-grid">
        {products.map((product) => {
          return (
            <div key={product.id} className="product-card">
              <div className="card-image-box">
                {/* Badge Tag */}
                {product.status === 'On Hold' ? (
                  <span className="badge-tag" style={{ background: '#D97706', color: '#FFF' }}>
                    ON HOLD
                  </span>
                ) : product.badge ? (
                  <span
                    className={`badge-tag ${
                      product.badge.toLowerCase() === 'sale'
                        ? 'badge-sale'
                        : product.badge.toLowerCase() === 'hot'
                        ? 'badge-hot'
                        : 'badge-new'
                    }`}
                  >
                    {product.badge}
                  </span>
                ) : null}

                {/* Direct Edit Button Badge on Card Top Right */}
                <button
                  className="admin-edit-card-btn"
                  onClick={() => onEditProduct(product)}
                  title="Edit Product Details"
                >
                  <Edit3 size={14} />
                  <span>Edit Item</span>
                </button>

                {/* Main Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img"
                  loading="lazy"
                />

                {/* Hover Action Overlay */}
                <div className="card-actions-overlay">
                  <button
                    className="action-pill-btn"
                    onClick={() => onEditProduct(product)}
                    title="Edit Item Details"
                    style={{ background: '#EA580C', color: '#FFF' }}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={() => onDeleteProduct(product)}
                    title="Delete Product"
                    style={{ background: '#FEE2E2', color: '#EF4444' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={() => onQuickView(product)}
                    title="Quick View"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="card-info">
                <span className="card-category">{product.category}</span>
                <h3 className="card-title">{product.name}</h3>

                <div className="card-price-row">
                  <span className="price-current">₱{Number(product.price).toFixed(2)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="price-original">
                      ₱{Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
