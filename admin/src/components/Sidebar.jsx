import React from 'react';
import { LayoutDashboard, Package, Tag, ShoppingBag, Settings, ExternalLink, Shield } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'catalog', label: 'Product Catalog', icon: Package },
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'categories', label: 'Categories & Tags', icon: Tag },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag }
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        <div className="brand-header">
          <div className="brand-icon">
            <Shield size={22} />
          </div>
          <div>
            <span className="brand-title">Aussome Admin</span>
            <span className="brand-tag">Management Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
          className="store-link-btn"
        >
          <span>View Customer Site</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
}
