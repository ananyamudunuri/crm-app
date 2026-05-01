import React, { useState, useEffect, useCallback } from 'react';
import './Customers.css';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    website: '',
    no_of_employees: '',
    established_year: '',
    status: 'ACTIVE'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
  const pageSize = 10;

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/customers/?skip=${(currentPage - 1) * pageSize}&limit=${pageSize}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data.items || []);
      setTotalCustomers(data.total);
      setTotalPages(Math.ceil(data.total / pageSize));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, API_URL, pageSize]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer_name.trim()) {
      alert('Customer name is required');
      return;
    }
    
    try {
      let response;
      if (editingCustomer) {
        // Update existing customer - send only the fields that changed
        const updateData = {};
        for (let key in formData) {
          if (formData[key] !== editingCustomer[key]) {
            updateData[key] = formData[key];
          }
        }
        
        response = await fetch(`${API_URL}/customers/${editingCustomer.customer_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new customer
        response = await fetch(`${API_URL}/customers/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, created_by: 'SYSTEM' })
        });
      }
      
      if (response.ok) {
        alert(editingCustomer ? 'Customer updated successfully!' : 'Customer created successfully!');
        setShowForm(false);
        setEditingCustomer(null);
        setFormData({
          customer_name: '',
          email: '',
          phone: '',
          location: '',
          industry: '',
          website: '',
          no_of_employees: '',
          established_year: '',
          status: 'ACTIVE'
        });
        fetchCustomers();
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to save customer');
      }
    } catch (err) {
      alert('Error saving customer: ' + err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      location: customer.location || '',
      industry: customer.industry || '',
      website: customer.website || '',
      no_of_employees: customer.no_of_employees || '',
      established_year: customer.established_year || '',
      status: customer.status || 'ACTIVE'
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({
      customer_name: '',
      email: '',
      phone: '',
      location: '',
      industry: '',
      website: '',
      no_of_employees: '',
      established_year: '',
      status: 'ACTIVE'
    });
  };

  const handleQuickDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this customer?')) {
      try {
        const response = await fetch(`${API_URL}/customers/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Customer deactivated successfully');
          fetchCustomers();
        } else {
          const errorData = await response.json();
          alert(errorData.detail || 'Failed to deactivate customer');
        }
      } catch (err) {
        alert('Error deactivating customer: ' + err.message);
      }
    }
  };

  const handleQuickActivate = async (id) => {
    if (window.confirm('Reactivate this customer?')) {
      try {
        const getResponse = await fetch(`${API_URL}/customers/${id}`);
        if (!getResponse.ok) throw new Error('Failed to fetch customer');
        
        const customer = await getResponse.json();
        
        const updateResponse = await fetch(`${API_URL}/customers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...customer, status: 'ACTIVE' })
        });
        
        if (updateResponse.ok) {
          alert('Customer reactivated successfully!');
          fetchCustomers();
        } else {
          const errorData = await updateResponse.json();
          alert(errorData.detail || 'Failed to reactivate customer');
        }
      } catch (err) {
        alert('Error reactivating customer: ' + err.message);
      }
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers-container">
      <div className="customers-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage your customer database</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm(true)}>
          + Add New Customer
        </button>
      </div>

      {/* Modal Form for Add/Edit */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
              <button className="modal-close" onClick={handleCancel}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Number of Employees</label>
                  <input
                    type="number"
                    value={formData.no_of_employees}
                    onChange={(e) => setFormData({...formData, no_of_employees: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Established Year</label>
                  <input
                    type="number"
                    value={formData.established_year}
                    onChange={(e) => setFormData({...formData, established_year: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="🔍 Search by name, email, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button type="button" className="clear-search" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>
        
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Results Info */}
      {searchTerm && (
        <div className="search-info">
          Showing results for: "{searchTerm}"
          <button onClick={handleClearSearch} className="clear-search-text">Clear search</button>
        </div>
      )}

      <div className="results-count">
        {totalCustomers === 0 ? 'No customers found' : `Showing ${customers.length} of ${totalCustomers} customers`}
      </div>

      {/* Customers Table */}
      {error && <div className="error-message">Error: {error}</div>}

      {customers.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No customers found</h3>
          <p>{searchTerm ? 'No customers match your search' : 'Get started by adding your first customer'}</p>
          {!searchTerm && (
            <button className="btn-add-empty" onClick={() => setShowForm(true)}>
              Add Your First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.customer_id} className={customer.status === 'INACTIVE' ? 'inactive-row' : ''}>
                  <td className="customer-name">{customer.customer_name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.location || '-'}</td>
                  <td>{customer.industry || '-'}</td>
                  <td>
                    <span className={`status-badge status-${customer.status?.toLowerCase()}`}>
                      {customer.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(customer)}>✏️ Edit</button>
                    {customer.status === 'ACTIVE' ? (
                      <button className="btn-deactivate" onClick={() => handleQuickDeactivate(customer.customer_id)}>🔴 Deactivate</button>
                    ) : (
                      <button className="btn-reactivate" onClick={() => handleQuickActivate(customer.customer_id)}>🟢 Reactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
        </div>
      )}
    </div>
  );
}

export default Customers;
