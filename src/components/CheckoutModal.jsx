import React, { useState, useRef } from 'react';
import { X, CheckCircle2, QrCode, Upload, ShieldCheck, CreditCard, DollarSign, MessageSquare, AlertCircle } from 'lucide-react';
import { placeOrder, updateProductStatus } from '../services/api';

export default function CheckoutModal({ isOpen, onClose, cartItems, totalAmount, onOrderSuccess }) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('Bank'); // 'Bank' or 'Cash'
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [messageToSeller, setMessageToSeller] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const proofInputRef = useRef(null);

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!contactNumber.trim()) {
      setErrorMsg('Please enter your contact number.');
      return;
    }
    if (paymentMethod === 'Bank' && !proofImage) {
      setErrorMsg('Proof of Payment Screenshot is required for Bank Transfer.');
      return;
    }

    setSubmitting(true);

    const orderPayload = {
      items: cartItems,
      total: totalAmount,
      totalAmount: totalAmount,
      fullName: customerName,
      contactNumber: contactNumber,
      messageToSeller: messageToSeller,
      customer: {
        name: customerName,
        phone: contactNumber,
        messageToSeller: messageToSeller
      },
      paymentMethod,
      proofOfPayment: proofImage || null,
      paymentProof: proofImage || null,
      status: paymentMethod === 'Bank' ? 'Pending Payment Verification' : 'Order Placed (Cash)',
      paymentConfirmed: false
    };

    try {
      const res = await placeOrder(orderPayload);
      const createdOrder = res.order || orderPayload;
      
      // Auto-set ordered products status to 'On Hold' for admin review
      for (const item of cartItems) {
        if (item.id) {
          await updateProductStatus(item.id, 'On Hold');
        }
      }

      setOrderResult(createdOrder);
      if (onOrderSuccess) onOrderSuccess(createdOrder);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {orderResult ? (
          /* ORDER CONFIRMATION SCREEN */
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <CheckCircle2 size={64} color="#10B981" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
              {paymentMethod === 'Bank' ? 'Payment Submitted for Verification!' : 'Order Placed Successfully!'}
            </h2>
            <p style={{ color: '#4B5563', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
              {paymentMethod === 'Bank'
                ? 'Thank you! Your proof of payment has been submitted. The seller will verify your payment and process your order.'
                : 'Thank you! Your cash order details have been sent to the seller.'}
            </p>

            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px', textOverflow: 'ellipsis', overflow: 'hidden', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Order ID:</span>
                <span style={{ fontWeight: 700 }}>#{orderResult.id || 'ORD-LOCAL'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Customer Name:</span>
                <span style={{ fontWeight: 600 }}>{customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Contact Number:</span>
                <span style={{ fontWeight: 600 }}>{contactNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: '#6B7280' }}>Status:</span>
                <span style={{ color: paymentMethod === 'Bank' ? '#EA580C' : '#10B981', fontWeight: 700 }}>
                  {orderResult.status || 'Processing'}
                </span>
              </div>
            </div>

            <button
              className="hero-btn"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done & Return to Shop
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #E5E7EB' }}>
              <ShieldCheck size={26} color="#111827" />
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                  Complete Your Order
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  Enter your details and select your preferred payment mode
                </span>
              </div>
            </div>

            {errorMsg && (
              <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0917 123 4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>

              {/* Message to Seller */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <MessageSquare size={14} />
                  <span>Message to Seller (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes, size preferences, or instructions for the seller..."
                  value={messageToSeller}
                  onChange={(e) => setMessageToSeller(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', outline: 'none' }}
                />
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                  Preferred Mode of Payment *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMethod === 'Bank' ? '2px solid #111827' : '1px solid #E5E7EB',
                      background: paymentMethod === 'Bank' ? '#F9FAFB' : '#FFF',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    <CreditCard size={18} color="#EA580C" />
                    <span>Bank Transfer / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMethod === 'Cash' ? '2px solid #111827' : '1px solid #E5E7EB',
                      background: paymentMethod === 'Cash' ? '#F9FAFB' : '#FFF',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    <DollarSign size={18} color="#10B981" />
                    <span>Cash</span>
                  </button>
                </div>
              </div>

              {/* BANK QR SECTION */}
              {paymentMethod === 'Bank' && (
                <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', padding: '16px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#9A3412', marginBottom: '12px' }}>
                    <QrCode size={20} />
                    <span>Scan Bank QR Code to Pay ₱{totalAmount.toFixed(2)}</span>
                  </div>

                  {/* QR Image Box */}
                  <div style={{ textAlign: 'center', background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid #FDBA74', marginBottom: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img
                      src="/bank_qr.png"
                      alt="Bank QR Code"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=AUSSOMEFINDS-BANK-PAYMENT';
                      }}
                      style={{ width: '100%', maxWidth: '340px', height: 'auto', maxHeight: '440px', objectFit: 'contain', margin: '0 auto', borderRadius: '8px' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#111827', marginTop: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>
                      GOTYME BANK • AUSTINE JOHN SAN MIGUEL •••••••• 7168
                    </div>
                  </div>
                </div>
              )}

              {/* PROOF OF PAYMENT UPLOAD SECTION (Available for Bank & Cash) */}
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                  {paymentMethod === 'Bank' ? 'Upload Proof of Payment Screenshot *' : 'Attach Optional Payment Receipt / Screenshot'}
                </label>
                <input
                  type="file"
                  ref={proofInputRef}
                  accept="image/*"
                  onChange={handleProofUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {proofImage && (
                    <img
                      src={proofImage}
                      alt="Proof Screenshot Preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #EA580C' }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: '1px solid #EA580C',
                      background: '#FFF7ED',
                      color: '#EA580C',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={16} />
                    <span>{proofImage ? 'Change Proof Screenshot' : 'Attach Proof Screenshot'}</span>
                  </button>
                </div>
              </div>

              {/* Order Total & Submit Button */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block' }}>Total Amount Due</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>₱{totalAmount.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{ padding: '10px 18px', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600 }}
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="hero-btn"
                  >
                    {submitting ? 'Submitting Order...' : 'Confirm & Submit Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
