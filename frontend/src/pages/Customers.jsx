import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';

const emptyForm = { full_name: '', email: '', phone_number: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const { showMessage, showError } = useApp();

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });
      showMessage('Customer created successfully');
      setForm(emptyForm);
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      showError(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.deleteCustomer(id);
      showMessage('Customer deleted successfully');
      loadCustomers();
    } catch (err) {
      showError(err);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Customer
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h3>New Customer</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="full_name">Full Name *</label>
              <input id="full_name" name="full_name" value={form.full_name} onChange={handleChange} className={errors.full_name ? 'error' : ''} />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number *</label>
                <input id="phone_number" name="phone_number" value={form.phone_number} onChange={handleChange} className={errors.phone_number ? 'error' : ''} />
                {errors.phone_number && <span className="field-error">{errors.phone_number}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}); }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <p className="empty-message">No customers yet. Add your first customer!</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.full_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone_number}</td>
                    <td className="actions">
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer.id)}>Delete</button>
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
