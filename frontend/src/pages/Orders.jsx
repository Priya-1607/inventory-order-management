import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
  const [errors, setErrors] = useState({});
  const { showMessage, showError } = useApp();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1 }],
    }));
  }

  function removeItem(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function updateItem(index, field, value) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function validate() {
    const newErrors = {};
    if (!form.customer_id) newErrors.customer_id = 'Customer is required';

    const itemErrors = form.items.map((item) => {
      const err = {};
      if (!item.product_id) err.product_id = 'Product is required';
      if (!item.quantity || parseInt(item.quantity) <= 0) err.quantity = 'Quantity must be greater than 0';
      return err;
    });

    if (form.items.length === 0) newErrors.items = 'At least one item is required';
    setErrors({ ...newErrors, itemErrors });
    return Object.keys(newErrors).length === 0 && itemErrors.every((e) => Object.keys(e).length === 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      customer_id: parseInt(form.customer_id, 10),
      items: form.items.map((item) => ({
        product_id: parseInt(item.product_id, 10),
        quantity: parseInt(item.quantity, 10),
      })),
    };

    try {
      await api.createOrder(payload);
      showMessage('Order created successfully');
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      setShowForm(false);
      loadData();
    } catch (err) {
      showError(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await api.deleteOrder(id);
      showMessage('Order cancelled successfully');
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      showError(err);
    }
  }

  async function viewOrder(id) {
    try {
      const order = await api.getOrder(id);
      setSelectedOrder(order);
    } catch (err) {
      showError(err);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">Create and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Create Order
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>New Order</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="customer_id">Customer *</label>
              <select
                id="customer_id"
                value={form.customer_id}
                onChange={(e) => setForm((prev) => ({ ...prev, customer_id: e.target.value }))}
                className={errors.customer_id ? 'error' : ''}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
              {errors.customer_id && <span className="field-error">{errors.customer_id}</span>}
            </div>

            <div className="order-items-section">
              <div className="section-header">
                <h4>Order Items</h4>
                <button type="button" className="btn btn-sm btn-secondary" onClick={addItem}>+ Add Item</button>
              </div>
              {form.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="form-group flex-2">
                    <label>Product *</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className={errors.itemErrors?.[index]?.product_id ? 'error' : ''}
                    >
                      <option value="">Select a product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${parseFloat(p.price).toFixed(2)} (Stock: {p.quantity_in_stock})
                        </option>
                      ))}
                    </select>
                    {errors.itemErrors?.[index]?.product_id && (
                      <span className="field-error">{errors.itemErrors[index].product_id}</span>
                    )}
                  </div>
                  <div className="form-group flex-1">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className={errors.itemErrors?.[index]?.quantity ? 'error' : ''}
                    />
                    {errors.itemErrors?.[index]?.quantity && (
                      <span className="field-error">{errors.itemErrors[index].quantity}</span>
                    )}
                  </div>
                  {form.items.length > 1 && (
                    <button type="button" className="btn btn-sm btn-danger remove-item-btn" onClick={() => removeItem(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Order</button>
            </div>
          </form>
        </div>
      )}

      {selectedOrder && (
        <div className="card order-detail-card">
          <div className="order-detail-header">
            <h3>Order #{selectedOrder.id}</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
          <div className="order-detail-info">
            <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
            <p><strong>Total:</strong> ${parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td>${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <p className="empty-message">No orders yet. Create your first order!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.items.length} item(s)</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => viewOrder(order.id)}>View</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.id)}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
