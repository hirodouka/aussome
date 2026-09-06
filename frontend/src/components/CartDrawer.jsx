import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 1000 || cartItems.length === 0 ? 0 : 15;
  const total = subtotal + shipping;

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const handleOrderSubmitted = () => {
    onClearCart();
    if (onOrderSuccess) onOrderSuccess();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="drawer-right" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                Shopping Cart ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)})
              </h3>
            </div>
            <button className="icon-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="drawer-body">
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                <p style={{ fontWeight: 600 }}>Your cart is currently empty</p>
                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Explore our collection to add items to your cart.
                </p>
              </div>
            ) : (
              <div>
                {/* Free Shipping Progress Indicator */}
                <div
                  style={{
                    background: '#F3F4F6',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '0.82rem'
                  }}
                >
                  {subtotal >= 1000 ? (
                    <span style={{ color: '#10B981', fontWeight: 700 }}>
                      🎉 You unlocked FREE Express Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong>₱{(1000 - subtotal).toFixed(2)}</strong> more for FREE Shipping.
                    </span>
                  )}
                </div>

                {/* Items List */}
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-img" />

                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, lineHeight: '1.2' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Size: {item.selectedSize || 'M'} | Color: {item.selectedColor || 'Default'}
                      </span>
                      <div style={{ fontWeight: 700, marginTop: '6px', fontSize: '0.95rem' }}>
                        ₱{(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>

                      {/* Quantity Adjustment Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '8px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px'
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(index, (item.quantity || 1) - 1)}
                            style={{ padding: '4px 8px', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 600 }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
                            style={{ padding: '4px 8px', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(index)}
                          style={{ color: '#EF4444' }}
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Totals & Checkout Button */}
          {cartItems.length > 0 && (
            <div className="drawer-footer">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#4B5563'
                }}
              >
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  fontSize: '0.9rem',
                  color: '#4B5563'
                }}
              >
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₱${shipping.toFixed(2)}`}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#111'
                }}
              >
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="hero-btn"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Proceed To Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        totalAmount={total}
        onOrderSuccess={handleOrderSubmitted}
      />
    </>
  );
}
