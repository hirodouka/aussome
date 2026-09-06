import React from 'react';
import { Quote } from 'lucide-react';

export default function QuoteSection() {
  return (
    <section className="container">
      <div className="quote-section">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Quote size={48} color="#D1D5DB" />
        </div>
        <p className="quote-text">
          "It's true. I don't like the whole cutoff-shorts-and-T-shirt look, but I think
          you can look fantastic in casual clothes."
        </p>
        <div className="quote-author">— Catherine Zeta-Jones</div>
      </div>
    </section>
  );
}
