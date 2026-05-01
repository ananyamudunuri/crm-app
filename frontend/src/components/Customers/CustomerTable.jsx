/**
 * Customer Table Component
 * Reusable table with sorting and selection
 */

import React, { useState } from 'react';
import './CustomerTable.css';

const CustomerTable = ({ 
  customers, 
  onRowClick, 
  onStatusChange,
  sortable = true,
  selectable = false,
  selectedIds = [],
  onSelectionChange 
}) => {
  const [sortField, setSortField] = useState('customer_name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  const handleSort = (field) => {
    if (!sortable) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortedCustomers = () => {
    if (!sortable) return customers;
    
    return [...customers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (aVal === undefined) aVal = '';
      if (bVal === undefined) bVal = '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };
  
  const handleSelectAll = (e) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(customers.map(c => c.customer_id));
      } else {
        onSelectionChange([]);
      }
    }
  };
  
  const handleSelectRow = (customerId, checked) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, customerId]);
      } else {
        onSelectionChange(selectedIds.filter(id => id !== customerId));
      }
    }
  };
  
  const sortedCustomers = getSortedCustomers();
  
  return (
    <div className="customer-table-wrapper">
      <table className="customer-table">
        <thead>
          <tr>
            {selectable && (
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedIds.length === customers.length && customers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            <th onClick={() => handleSort('customer_name')} className={sortable ? 'sortable' : ''}>
              Customer Name
              {sortable && sortField === 'customer_name' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => handleSort('email')} className={sortable ? 'sortable' : ''}>
              Email
              {sortable && sortField === 'email' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => handleSort('phone')} className={sortable ? 'sortable' : ''}>
              Phone
              {sortable && sortField === 'phone' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => handleSort('industry')} className={sortable ? 'sortable' : ''}>
              Industry
              {sortable && sortField === 'industry' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => handleSort('status')} className={sortable ? 'sortable' : ''}>
              Status
              {sortable && sortField === 'status' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th onClick={() => handleSort('created_at')} className={sortable ? 'sortable' : ''}>
              Created
              {sortable && sortField === 'created_at' && (
                <span className="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCustomers.map((customer) => (
            <tr key={customer.customer_id}>
              {selectable && (
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(customer.customer_id)}
                    onChange={(e) => handleSelectRow(customer.customer_id, e.target.checked)}
                  />
                </td>
              )}
              <td 
                className="customer-name-cell"
                onClick={() => onRowClick && onRowClick(customer.customer_id)}
              >
                {customer.customer_name}
              </td>
              <td>{customer.email || '-'}</td>
              <td>{customer.phone || '-'}</td>
              <td>{customer.industry || '-'}</td>
              <td>
                <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
              </td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange && onStatusChange(customer.customer_id, customer.status);
                  }}
                  className="action-btn"
                >
                  {customer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;