import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ onShopClick }) {
  return (
    <section className="container">
      <div className="hero-section">
        <div className="hero-grid">
          {/* Left Content */}
          <div className="hero-content" style={{ padding: '50px 60px 40px 60px', textAlign: 'left' }}>

            {/* Serif Headline */}
            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '2.5rem',
              fontWeight: '600',
              lineHeight: '1.18',
              color: '#111827',
              marginBottom: '28px',
              letterSpacing: '-0.3px'
            }}>
              Branded fashion you’ll love,<br />
              Pre-loved prices you’ll adore.
            </h1>

            {/* Designer Brand Logos */}
            <img
              src="/brands_logos_grid.png"
              alt="Featured Brand Logos"
              style={{ width: '100%', maxWidth: '540px', objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }}
            />
          </div>

          {/* Right Image */}
          <div className="hero-image-container">
            <img
              src="/aussome_finds_logo.png"
              alt="Aussome Finds Logo"
              className="hero-img"
              style={{ objectFit: 'contain', padding: '30px', mixBlendMode: 'multiply' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
