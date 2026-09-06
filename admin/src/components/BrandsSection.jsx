import React from 'react';

export default function BrandsSection() {
  return (
    <section className="container" style={{ marginTop: '30px', marginBottom: '40px' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '36px 40px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}
      >
        {/* LEFT SIDE: BRAND LOGOS PICTURE */}
        <div style={{ textAlign: 'center', paddingRight: '20px', borderRight: '1px solid #F3F4F6' }}>
          <img
            src="/brands_logos_grid.png"
            alt="Featured Brand Logos"
            style={{
              width: '100%',
              maxHeight: '260px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* RIGHT SIDE: AUSSOME FINDS COMPANY LOGO PICTURE */}
        <div style={{ textAlign: 'center', paddingLeft: '20px' }}>
          <img
            src="/aussome_finds_logo.png"
            alt="Aussome Finds Logo & Tagline"
            style={{
              width: '100%',
              maxWidth: '320px',
              maxHeight: '300px',
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        </div>
      </div>
    </section>
  );
}
