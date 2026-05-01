//@'
import React, { useState, useEffect } from 'react';
import './Pages.css';

function Affiliations() {
  const [affiliations, setAffiliations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    parent_customer_id: '',
    affiliate_customer_id: '',
    relationship_type: 'AFFILIATE',
    notes: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchAffiliations();
    fetchCustomers();
  }, []);

  const fetchAffiliations = async () => {
    try {
      const response = await fetch(`${API_URL}/affiliations/`);
      const data = await response.json();
      setAffiliations(data.items || []);
    } catch (error) {
      console.error('Error fetching affiliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers/?skip=0&limit=100`);
      const data = await response.json();
      setCustomers(data.items || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/affiliations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          parent_customer_id: '',
          affiliate_customer_id: '',
          relationship_type: 'AFFILIATE',
          notes: ''
        });
        fetchAffiliations();
      }
    } catch (err) {
      alert('Failed to create affiliation');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this affiliation?')) {
      try {
        await fetch(`${API_URL}/affiliations/${id}`, { method: 'DELETE' });
        fetchAffiliations();
      } catch (err) {
        alert('Failed to delete affiliation');
      }
    }
  };

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.customer_id === id);
    return customer ? customer.customer_name : 'Loading...';
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="affiliations-page">
      <div className="page-header">
        <h1>Affiliation Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Affiliation'}
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Affiliation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Parent Customer *</label>
                <select value={formData.parent_customer_id} onChange={(e) => setFormData({...formData, parent_customer_id: e.target.value})} required>
                  <option value="">Select Parent Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>{customer.customer_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Affiliate Customer *</label>
                <select value={formData.affiliate_customer_id} onChange={(e) => setFormData({...formData, affiliate_customer_id: e.target.value})} required>
                  <option value="">Select Affiliate Customer</option>
                  {customers.map(customer => (
                    <option key={customer.customer_id} value={customer.customer_id}>{customer.customer_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Relationship Type</label>
                <select value={formData.relationship_type} onChange={(e) => setFormData({...formData, relationship_type: e.target.value})}>
                  <option value="AFFILIATE">Affiliate</option>
                  <option value="SUBSIDIARY">Subsidiary</option>
                  <option value="PARTNER">Partner</option>
                  <option value="VENDOR">Vendor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows="3"></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Create Affiliation</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Parent Customer</th>
              <th>Affiliate Customer</th>
              <th>Relationship Type</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {affiliations.map(aff => (
              <tr key={aff.affiliation_id}>
                <td><strong>{getCustomerName(aff.parent_customer_id)}</strong></td>
                <td>{getCustomerName(aff.affiliate_customer_id)}</td>
                <td><span className="relationship-badge">{aff.relationship_type}</span></td>
                <td>{aff.notes || '-'}</td>
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(aff.affiliation_id)}>🗑️ Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {affiliations.length === 0 && (
        <div className="empty-state">
          <p>No affiliations found. Create your first affiliation!</p>
        </div>
      )}
    </div>
  );
}

export default Affiliations;
//'@ | Out-File -FilePath C:\projects\crm-app\frontend\src\pages\Affiliations.jsx -Encoding UTF8 -Force