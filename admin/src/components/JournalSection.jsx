import React from 'react';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export default function JournalSection() {
  const articles = [
    {
      id: "j-1",
      title: "10 Essential Pieces for a Timeless Capsule Wardrobe",
      date: "Aug 28, 2026",
      readTime: "5 min read",
      author: "Jane Vance",
      category: "Fashion Tips",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "j-2",
      title: "The Denim Revival: Styling Denim for Modern Casual Looks",
      date: "Aug 20, 2026",
      readTime: "4 min read",
      author: "Marcella Thorne",
      category: "Trends",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "j-3",
      title: "Eco-Friendly Fabrics: Why Sustainable Cotton Matters",
      date: "Aug 12, 2026",
      readTime: "6 min read",
      author: "Oliver Bennett",
      category: "Sustainability",
      image: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <section className="container" style={{ marginTop: '60px' }}>
      <div className="section-header">
        <h2 className="section-title">Our Journal</h2>
        <a href="#journal" className="section-link">
          <span>Read All Articles</span>
          <ArrowRight size={16} />
        </a>
      </div>

      <div className="journal-grid">
        {articles.map((article) => (
          <article key={article.id} className="journal-card">
            <img src={article.image} alt={article.title} className="journal-img" />
            <div className="journal-content">
              <div className="journal-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {article.date}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {article.readTime}
                </span>
              </div>
              <h3 className="journal-title">{article.title}</h3>
              <a href="#" className="section-link" style={{ fontSize: '0.82rem' }}>
                Read Story →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
