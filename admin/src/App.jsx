import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import FeaturedProducts from './components/FeaturedProducts';
import PromoGrid from './components/PromoGrid';
import QuoteSection from './components/QuoteSection';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import AdminModal from './components/AdminModal';
import Footer from './components/Footer';
import { fetchProducts, deleteProduct } from './services/api';
import { Search, X, Plus } from 'lucide-react';

const INITIAL_FALLBACK_PRODUCTS = [];

export default function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  
  // Modals & Drawers State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('list'); // 'list', 'orders', 'add', 'edit'
  const [editingTargetProduct, setEditingTargetProduct] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products from backend API
  const loadProducts = async (cat = activeCategory) => {
    const params = cat !== 'All' ? { category: cat } : {};
    const apiProducts = await fetchProducts(params);
    if (apiProducts && Array.isArray(apiProducts)) {
      const valid = apiProducts.filter(p => p && p.id && p.name);
      setProducts(valid);
    }
  };

  useEffect(() => {
    loadProducts(activeCategory);

    const handleFocus = () => loadProducts(activeCategory);
    const handleStorage = () => loadProducts(activeCategory);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(() => {
      loadProducts(activeCategory);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [activeCategory]);

  const handleAddToCart = (product) => {
    setEditingTargetProduct(product);
    setAdminTab('edit');
    setIsAdminOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingTargetProduct(product);
    setAdminTab('edit');
    setIsAdminOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing from the store?')) return;
    try {
      await deleteProduct(id);
      await loadProducts(activeCategory);
    } catch (err) {
      console.error(err);
    }
  };

  const displayedProducts = (products || []).filter((p) => {
    if (!p || typeof p !== 'object' || !p.id || !p.name) return false;
    const pCategory = (p.category || '').toLowerCase();
    const actCat = activeCategory.toLowerCase();
    const matchesCategory = actCat === 'all' || pCategory === actCat;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app-root" style={{ position: 'relative' }}>
      {/* Header */}
      <Header
        cartCount={cartItems.length}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => {
          setAdminTab('orders');
          setIsAdminOpen(true);
        }}
        onOpenAdmin={(tab = 'list') => {
          setEditingTargetProduct(null);
          setAdminTab(tab);
          setIsAdminOpen(true);
        }}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Floating Add Item Quick Button */}
      <button
        onClick={() => {
          setEditingTargetProduct(null);
          setAdminTab('add');
          setIsAdminOpen(true);
        }}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 99,
          background: '#EA580C',
          color: '#FFF',
          padding: '14px 22px',
          borderRadius: '30px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.95rem'
        }}
      >
        <Plus size={20} />
        <span>Add / Edit Store Items</span>
      </button>

      {/* Main Content Sections */}
      <main>
        {activeCategory === 'All' ? (
          <>
            {/* Hero Banner Carousel */}
            <HeroBanner onShopClick={() => setActiveCategory('All')} />

            {/* Featured Products Grid with Live Admin Edit Controls */}
            <FeaturedProducts
              products={displayedProducts}
              onAddToCart={handleAddToCart}
              onQuickView={(product) => setQuickViewProduct(product)}
              onEditProduct={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />

            {/* Promotional Collections Banners */}
            <PromoGrid onSelectCategory={(cat) => setActiveCategory(cat)} />

            {/* Quote of the Day */}
            <QuoteSection />
          </>
        ) : (
          /* Category Page View */
          <div className="container" style={{ marginTop: '40px', minHeight: '60vh' }}>
            <div style={{ marginBottom: '32px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Admin Collection View
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#111827' }}>
                {activeCategory} ({displayedProducts.length} items)
              </h1>
            </div>

            <FeaturedProducts
              products={displayedProducts}
              onAddToCart={handleAddToCart}
              onQuickView={(product) => setQuickViewProduct(product)}
              onEditProduct={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onSelectCategory={(cat) => setActiveCategory(cat)} />

      {/* Quick View Product Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Store Admin Catalog & Listing Manager Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        initialTab={adminTab}
        onClose={() => {
          setIsAdminOpen(false);
          setEditingTargetProduct(null);
        }}
        products={products}
        onRefreshProducts={() => loadProducts(activeCategory)}
        initialEditProduct={editingTargetProduct}
      />

      {/* Global Search Modal */}
      {isSearchOpen && (
        <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '600px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Search size={22} color="#6B7280" />
              <input
                type="text"
                autoFocus
                placeholder="Search catalog items to edit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '1.1rem',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button className="icon-btn" onClick={() => setIsSearchOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {searchQuery && (
              <div style={{ maxHeight: '300px', overflowY: 'auto', borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '10px' }}>
                  Found {displayedProducts.length} results:
                </p>
                {displayedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      handleOpenEditProduct(p);
                      setIsSearchOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{p.category} • ${p.price}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#EA580C', fontWeight: 700 }}>Click to Edit</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
