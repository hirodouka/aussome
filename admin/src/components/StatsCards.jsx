import React from 'react';
import { Package, Zap, DollarSign, Layers } from 'lucide-react';

export default function StatsCards({ products }) {
  const totalProducts = products.length;
  const flashSaleCount = products.filter((p) => p.isFlashSale).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;
  const avgPrice = totalProducts > 0
    ? (products.reduce((acc, p) => acc + Number(p.price || 0), 0) / totalProducts).toFixed(2)
    : '0.00';

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      bg: 'rgba(56, 189, 248, 0.15)',
      color: '#38BDF8'
    },
    {
      label: 'Flash Sale Items',
      value: flashSaleCount,
      icon: Zap,
      bg: 'rgba(248, 113, 113, 0.15)',
      color: '#F87171'
    },
    {
      label: 'Active Categories',
      value: categoriesCount,
      icon: Layers,
      bg: 'rgba(167, 139, 250, 0.15)',
      color: '#A78BFA'
    },
    {
      label: 'Avg Catalog Price',
      value: `$${avgPrice}`,
      icon: DollarSign,
      bg: 'rgba(52, 211, 153, 0.15)',
      color: '#34D399'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: stat.bg, color: stat.color }}>
              <Icon size={24} />
            </div>
            <div>
              <div className="stat-val">{stat.value}</div>
              <div className="stat-lbl">{stat.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
