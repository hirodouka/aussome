import React from 'react';
import { Instagram, Facebook, Twitter, Youtube, Send } from 'lucide-react';

export default function Footer({ onSelectCategory }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div>
            <h3 className="logo" style={{ marginBottom: '16px' }}>
              <span style={{ color: '#F97316' }}>Aussome</span>
              <span style={{ color: '#FFFFFF' }}>Finds</span>
            </h3>
            <p style={{ maxWidth: '300px', lineHeight: '1.6', marginBottom: '20px' }}>
              Store Administration & Live Catalog Portal. Control pricing, products, and sales across your online store.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a href="#" className="icon-btn" style={{ background: '#1F2937', color: '#FFF' }}>
                <Instagram size={18} />
              </a>
              <a href="#" className="icon-btn" style={{ background: '#1F2937', color: '#FFF' }}>
                <Facebook size={18} />
              </a>
              <a href="#" className="icon-btn" style={{ background: '#1F2937', color: '#FFF' }}>
                <Twitter size={18} />
              </a>
              <a href="#" className="icon-btn" style={{ background: '#1F2937', color: '#FFF' }}>
                <Youtube size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#" onClick={() => onSelectCategory('Clothing')}>Clothing Collection</a></li>
              <li><a href="#" onClick={() => onSelectCategory('Shoes')}>Shoes & Footwear</a></li>
              <li><a href="#" onClick={() => onSelectCategory('Accessories')}>Accessories & Goods</a></li>
              <li><a href="#" onClick={() => onSelectCategory('Hobbies')}>Hobbies & Collectibles</a></li>
              <li><a href="#" onClick={() => onSelectCategory('Sale')}>Sale Items</a></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1F2937',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.82rem'
          }}
        >
          <div>
            © 2026 <strong>AussomeFinds Admin Portal</strong>. All privileges enabled.
          </div>

          <div style={{ display: 'flex', gap: '10px', opacity: 0.7 }}>
            <span style={{ border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px' }}>ADMIN V1.0</span>
            <span style={{ border: '1px solid #374151', padding: '4px 8px', borderRadius: '4px' }}>PORT 5174</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
