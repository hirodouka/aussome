import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, ShieldCheck } from 'lucide-react';

export default function Header({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenAdmin,
  activeCategory,
  onSelectCategory,
  onOpenSearch
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Shoes', value: 'Shoes' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Hobbies', value: 'Hobbies' },
    { label: 'Sale', value: 'Sale' }
  ];

  return (
    <header className="header-wrapper" style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
      {/* Top Orange Line */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #EA580C 0%, #F97316 50%, #FB923C 100%)', width: '100%' }}></div>
      {/* Main Navbar */}
      <nav className="navbar container">
        {/* Brand Logo */}
        <a href="#" className="logo" onClick={() => onSelectCategory('All')}>
          <span style={{ color: '#EA580C' }}>Aussome</span>
          <span style={{ color: '#111827' }}>Finds</span>
        </a>

        {/* Desktop Nav Items */}
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => onSelectCategory('All')}
            >
              Home
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.value}>
              <button
                className={`nav-link ${activeCategory === cat.value ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.value)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right Header Action Icons */}
        <div className="header-actions">
          {/* Search Trigger */}
          <button className="icon-btn" onClick={onOpenSearch} title="Search Products">
            <Search size={20} />
          </button>

          {/* Cart Drawer Trigger */}
          <button className="icon-btn" onClick={onOpenCart} title="Shopping Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            className="icon-btn mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            background: '#FFF7ED',
            borderTop: '1px solid #FED7AA',
            padding: '16px 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <button
            className={`nav-link ${activeCategory === 'All' ? 'active' : ''}`}
            style={{ textAlign: 'left', fontSize: '1.05rem', padding: '10px 0' }}
            onClick={() => {
              onSelectCategory('All');
              setMobileMenuOpen(false);
            }}
          >
            Home
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`nav-link ${activeCategory === cat.value ? 'active' : ''}`}
              style={{ textAlign: 'left', fontSize: '1.05rem', padding: '10px 0' }}
              onClick={() => {
                onSelectCategory(cat.value);
                setMobileMenuOpen(false);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
