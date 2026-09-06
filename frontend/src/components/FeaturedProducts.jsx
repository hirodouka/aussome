import React from 'react';
import { Eye, ShoppingCart, Heart, ArrowRight, Edit } from 'lucide-react';

export default function FeaturedProducts({
  products,
  onAddToCart,
  onQuickView,
  onToggleWishlist,
  wishlistIds,
  onEditProduct
}) {
  return (
    <section className="container" style={{ marginTop: '60px' }}>
      <div className="section-header">
        <h2 className="section-title">Featured Products</h2>
        <a href="#all-products" className="section-link">
          <span>View All Products</span>
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="products-grid">
        {products.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);
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

                {/* Main Product Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img"
                  loading="lazy"
                />

                {/* Card Hover Action Buttons Overlay */}
                <div className="card-actions-overlay">
                  {product.status === 'On Hold' ? (
                    <button
                      className="action-pill-btn"
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed', background: '#9CA3AF' }}
                    >
                      <span>Reserved</span>
                    </button>
                  ) : (
                    <button
                      className="action-pill-btn"
                      onClick={() => onAddToCart(product)}
                      title="Add to Cart"
                    >
                      <ShoppingCart size={14} />
                      <span>Add To Cart</span>
                    </button>
                  )}

                  <button
                    className="action-pill-btn"
                    onClick={() => onQuickView(product)}
                    title="Quick View"
                  >
                    <Eye size={14} />
                    <span>Quick View</span>
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
