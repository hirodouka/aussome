import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import FeaturedProducts from './components/FeaturedProducts';
import PromoGrid from './components/PromoGrid';
import QuoteSection from './components/QuoteSection';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import { fetchProducts } from './services/api';
import { Search, X } from 'lucide-react';

const INITIAL_FALLBACK_PRODUCTS = [];

export default function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  
  // Modals & Drawers State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products from backend on mount & category change
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

    // Auto sync on tab focus or storage change
    const handleFocus = () => loadProducts(activeCategory);
    const handleStorage = () => loadProducts(activeCategory);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    // Live polling interval (every 4 seconds)
    const interval = setInterval(() => {
      loadProducts(activeCategory);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [activeCategory]);

  // Cart operations
  const handleAddToCart = (product) => {
    if (product.status === 'On Hold') {
      return;
    }
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (product.quantity || 1);
        return updated;
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
    } else {
      setCartItems((prev) => {
        const updated = [...prev];
        updated[index].quantity = newQty;
        return updated;
      });
    }
  };

  const handleRemoveCartItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleWishlist = (productId) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Filtered products list by active category & search query safely
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
    <div className="app-root">
      {/* Header */}
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* Render Home Page Elements ONLY on Home ('All') */}
        {activeCategory === 'All' ? (
          <>
            {/* Hero Banner Carousel */}
            <HeroBanner onShopClick={() => setActiveCategory('All')} />

            {/* Featured Products Grid */}
            <FeaturedProducts
              products={displayedProducts}
              onAddToCart={handleAddToCart}
              onQuickView={(product) => setQuickViewProduct(product)}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
            />

            {/* Promotional Collections Banners */}
            <PromoGrid onSelectCategory={(cat) => setActiveCategory(cat)} />

            {/* Quote of the Day */}
            <QuoteSection />
          </>
        ) : (
          /* Category Page View (Clothing, Shoes, Accessories, Sale) */
          <div className="container" style={{ marginTop: '40px', minHeight: '60vh' }}>
            <div style={{ marginBottom: '32px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Category Collection
              </span>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: '#111827' }}>
                {activeCategory} ({displayedProducts.length})
              </h1>
            </div>

            <FeaturedProducts
              products={displayedProducts}
              onAddToCart={handleAddToCart}
              onQuickView={(product) => setQuickViewProduct(product)}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
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

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderSuccess={() => loadProducts(activeCategory)}
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
                placeholder="Search shirts, pants, hoodies, shoes..."
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
                      setQuickViewProduct(p);
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
