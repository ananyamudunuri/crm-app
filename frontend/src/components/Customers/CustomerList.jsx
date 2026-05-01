/**
 * Customer List Page with Table, Search, Filter, and Pagination
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Common/UI/Toast';
import Button from '../Common/UI/Button';
import LoadingSpinner from '../Common/UI/LoadingSpinner';
import EmptyState from '../Common/UI/EmptyState';
import Pagination from '../Common/UI/Pagination';
import { getAllCustomers, updateCustomerStatus } from '../../services/customerService';
import { formatDate, formatPhone } from '../../utils/formatters';
import './CustomerList.css';

const CustomerList = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deactivatingId, setDeactivatingId] = useState(null);
  
  const pageSize = 10;
  
  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm, statusFilter]);
  
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      
      setCustomers(data.items || []);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (error) {
      addToast(error.message || 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };
  
  const handleStatusToggle = async (customerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';
    
    if (action === 'deactivate') {
      const confirm = window.confirm('Are you sure you want to deactivate this customer?');
      if (!confirm) return;
    }
    
    try {
      setDeactivatingId(customerId);
      await updateCustomerStatus(customerId, newStatus);
      addToast(`Customer ${action}d successfully`, 'success');
      loadCustomers();
    } catch (error) {
      addToast(error.message || `Failed to ${action} customer`, 'error');
    } finally {
      setDeactivatingId(null);
    }
  };
  
  const handleRowClick = (customerId) => {
    navigate(`/customers/${customerId}`);
  };
  
  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="customer-list-container">
      <div className="list-header">
        <h1>Customers</h1>
        <Button variant="primary" onClick={() => navigate('/customers/new')}>
          + Add Customer
        </Button>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by name, email, or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      
      {/* Results Count */}
      <div className="results-count">
        Showing {customers.length} of {total} customer{total !== 1 ? 's' : ''}
      </div>
      
      {/* Customer Table */}
      {customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No customers found"
          description={searchTerm ? 'Try adjusting your search' : 'Get started by adding your first customer'}
          action={!searchTerm && <Button onClick={() => navigate('/customers/new')}>Add Customer</Button>}
        />
      ) : (
        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customer_id} onClick={() => handleRowClick(customer.customer_id)}>
                  <td className="customer-name">{customer.customer_name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{formatPhone(customer.phone) || '-'}</td>
                  <td>{customer.industry || '-'}</td>
                  <td>
                    <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{formatDate(customer.created_at)}</td>
                  <td className="actions-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(customer.customer_id, customer.status);
                      }}
                      className={`action-btn ${customer.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}
                      disabled={deactivatingId === customer.customer_id}
                    >
                      {deactivatingId === customer.customer_id ? (
                        <span className="btn-spinner-small"></span>
                      ) : customer.status === 'ACTIVE' ? (
                        'Deactivate'
                      ) : (
                        'Activate'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default CustomerList;