import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const emptyForm = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const { showMessage, showError } = useApp();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (form.quantity_in_stock === '' || parseInt(form.quantity_in_stock) < 0) {
      newErrors.quantity_in_stock = 'Quantity must be 0 or greater';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setShowForm(true);
    setErrors({});
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    try {
      if (editingId) {
        await api.updateProduct(editingId, payload);
        showMessage('Product updated successfully');
      } else {
        await api.createProduct(payload);
        showMessage('Product created successfully');
      }
      cancelForm();
      loadProducts();
    } catch (err) {
      showError(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      showMessage('Product deleted successfully');
      loadProducts();
    } catch (err) {
      showError(err);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>{editingId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU / Code *</label>
                <input id="sku" name="sku" value={form.sku} onChange={handleChange} className={errors.sku ? 'error' : ''} />
                {errors.sku && <span className="field-error">{errors.sku}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price ($) *</label>
                <input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} className={errors.price ? 'error' : ''} />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="quantity_in_stock">Quantity in Stock *</label>
                <input id="quantity_in_stock" name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleChange} className={errors.quantity_in_stock ? 'error' : ''} />
                {errors.quantity_in_stock && <span className="field-error">{errors.quantity_in_stock}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <p className="empty-message">No products yet. Add your first product!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td><code>{product.sku}</code></td>
                    <td>${parseFloat(product.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.quantity_in_stock <= 10 ? 'badge-warning' : 'badge-success'}`}>
                        {product.quantity_in_stock}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="btn btn-sm btn-secondary" onClick={() => startEdit(product)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
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
