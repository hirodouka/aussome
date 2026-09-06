import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Flame } from 'lucide-react';

export default function FlashSales({ products, onAddToCart, onQuickView }) {
  // Live ticking countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '08',
    minutes: '05',
    seconds: '45'
  });

  useEffect(() => {
    // Set target date 2 days from now
    const targetTime = new Date().getTime() + (2 * 24 * 60 * 60 * 1000) + (8 * 3600 * 1000) + (5 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(interval);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: String(d).padStart(2, '0'),
          hours: String(h).padStart(2, '0'),
          minutes: String(m).padStart(2, '0'),
          seconds: String(s).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const flashSaleItems = products.filter((p) => p.isFlashSale || p.originalPrice > p.price);

  return (
    <section className="container">
      <div className="flash-sales-box">
        {/* Flash Sales Header & Countdown */}
        <div className="flash-sales-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame color="#EF4444" size={28} />
            <h2 className="section-title">Flash Sales</h2>
          </div>

          <div className="countdown-box">
            <span style={{ fontSize: '0.82rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ends In:
            </span>
            <div className="countdown-unit">{timeLeft.days}d</div>
            <span>:</span>
            <div className="countdown-unit">{timeLeft.hours}h</div>
            <span>:</span>
            <div className="countdown-unit">{timeLeft.minutes}m</div>
            <span>:</span>
            <div className="countdown-unit">{timeLeft.seconds}s</div>
          </div>
        </div>

        {/* Discounted Product Grid */}
        <div className="products-grid">
          {flashSaleItems.slice(0, 4).map((product) => (
            <div key={product.id} className="product-card">
              <div className="card-image-box">
                <span className="badge-tag badge-sale">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>

                <img
                  src={product.image}
                  alt={product.name}
                  className="card-img"
                  loading="lazy"
                />

                <div className="card-actions-overlay">
                  <button
                    className="action-pill-btn"
                    onClick={() => onAddToCart(product)}
                  >
                    <ShoppingCart size={14} />
                    <span>Add To Cart</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={() => onQuickView(product)}
                  >
                    <Eye size={14} />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>

              <div className="card-info">
                <span className="card-category">{product.category}</span>
                <h3 className="card-title">{product.name}</h3>

                <div className="card-price-row">
                  <span className="price-current">${Number(product.price).toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="price-original">
                      ${Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
