import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PromoGrid({ onSelectCategory }) {
  return (
    <section className="container" style={{ marginTop: '60px' }}>
      <div className="promo-grid">
        {/* Accessories Banner */}
        <div
          className="promo-card"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop')`
          }}
        >
          <div className="promo-content">
            <h2 className="promo-title">Browse Accessories.</h2>
            <button className="hero-btn" onClick={() => onSelectCategory('Accessories')}>
              <span>Filter Accessories</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Shoes Banner */}
        <div
          className="promo-card"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop')`
          }}
        >
          <div className="promo-content">
            <h2 className="promo-title">Browse Shoes.</h2>
            <button className="hero-btn" onClick={() => onSelectCategory('Shoes')}>
              <span>Filter Shoes</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
