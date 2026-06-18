import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useApp();

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!summary) {
    return <div className="empty-state">Unable to load dashboard data.</div>;
  }

  return (
    <div className="dashboard">
      <h2 className="page-title">Dashboard</h2>
      <p className="page-subtitle">Overview of your inventory and orders</p>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{summary.total_products}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{summary.total_customers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{summary.total_orders}</span>
        </div>
        <div className="stat-card stat-card-warning">
          <span className="stat-label">Low Stock Items</span>
          <span className="stat-value">{summary.low_stock_products.length}</span>
        </div>
      </div>

      <section className="card">
        <h3>Low Stock Products</h3>
        <p className="card-desc">
          Products with {summary.low_stock_threshold} or fewer units in stock
        </p>
        {summary.low_stock_products.length === 0 ? (
          <p className="empty-message">All products are well stocked!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {summary.low_stock_products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td><code>{product.sku}</code></td>
                    <td>
                      <span className={`badge ${product.quantity_in_stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {product.quantity_in_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
