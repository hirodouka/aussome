import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, User, Menu, X, ShieldCheck, Plus, ExternalLink } from 'lucide-react';

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
      {/* Top Admin Status Banner */}
      <div className="admin-mode-banner">
        <div className="container bar-inner" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} />
            <span>ADMIN PORTAL — Manage store items, verify customer payments & orders</span>
          </div>
        </div>
      </div>

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
              All Items
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
          {/* View Customer Orders & Verification */}
          <button
            className="admin-pill-btn desktop-only-btn"
            onClick={() => onOpenAdmin && onOpenAdmin('orders')}
            title="View Customer Orders & Proofs of Payment"
            style={{ background: '#111827', color: '#FFF' }}
          >
            <ShoppingBag size={16} color="#EA580C" />
            <span>Customer Orders</span>
            {cartCount > 0 && (
              <span className="badge-count" style={{ background: '#EA580C', color: '#FFF', position: 'relative', top: 'auto', right: 'auto', marginLeft: '4px' }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Manage Catalog Button */}
          <button 
            className="admin-pill-btn desktop-only-btn" 
            onClick={() => onOpenAdmin && onOpenAdmin('list')}
            title="Open Catalog Manager"
            style={{ background: '#EA580C' }}
          >
            <ShieldCheck size={16} />
            <span>Manage Catalog</span>
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
            className="admin-pill-btn"
            onClick={() => {
              onOpenAdmin && onOpenAdmin('orders');
              setMobileMenuOpen(false);
            }}
            style={{ background: '#111827', color: '#FFF', padding: '12px 16px', borderRadius: '8px', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            <ShoppingBag size={18} color="#EA580C" />
            <span>View Customer Orders ({cartCount || 0})</span>
          </button>

          <button
            className="admin-pill-btn"
            onClick={() => {
              onOpenAdmin && onOpenAdmin('list');
              setMobileMenuOpen(false);
            }}
            style={{ background: '#EA580C', color: '#FFF', padding: '12px 16px', borderRadius: '8px', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            <ShieldCheck size={18} />
            <span>Manage Store Catalog</span>
          </button>

          <div style={{ height: '1px', background: '#FED7AA', margin: '4px 0' }}></div>

          <button
            className={`nav-link ${activeCategory === 'All' ? 'active' : ''}`}
            style={{ textAlign: 'left', fontSize: '1.05rem', padding: '10px 0' }}
            onClick={() => {
              onSelectCategory('All');
              setMobileMenuOpen(false);
            }}
          >
            All Items
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
