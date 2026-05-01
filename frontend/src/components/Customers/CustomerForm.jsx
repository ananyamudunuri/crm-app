/**
 * Add/Edit Customer Form with Validation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../Common/UI/Toast';
import Button from '../Common/UI/Button';
import Input from '../Common/UI/Input';
import ConfirmationDialog from '../Common/UI/ConfirmationDialog';
import { createCustomer, updateCustomer, getCustomer, deleteCustomer } from '../../services/customerService';
import { validateCustomer } from '../../utils/validators';
import './CustomerForm.css';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    location: '',
    industry: '',
    website: '',
    no_of_employees: '',
    established_year: '',
    status: 'ACTIVE',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  useEffect(() => {
    if (isEditMode) {
      loadCustomer();
    }
  }, [id]);
  
  const loadCustomer = async () => {
    try {
      const data = await getCustomer(id);
      setFormData({
        customer_name: data.customer_name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        industry: data.industry || '',
        website: data.website || '',
        no_of_employees: data.no_of_employees || '',
        established_year: data.established_year || '',
        status: data.status || 'ACTIVE',
      });
    } catch (error) {
      addToast('Failed to load customer data', 'error');
      navigate('/customers');
    } finally {
      setInitialLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const validationErrors = validateCustomer(formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the validation errors', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode) {
        await updateCustomer(id, formData);
        addToast('Customer updated successfully', 'success');
      } else {
        await createCustomer(formData);
        addToast('Customer created successfully', 'success');
      }
      navigate('/customers');
    } catch (error) {
      addToast(error.message || `Failed to ${isEditMode ? 'update' : 'create'} customer`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await deleteCustomer(id);
      addToast('Customer deactivated successfully', 'success');
      navigate('/customers');
    } catch (error) {
      addToast('Failed to deactivate customer', 'error');
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };
  
  if (initialLoading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  return (
    <div className="customer-form-container">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</h1>
        {isEditMode && (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
            Deactivate Customer
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <Input
            label="Customer Name"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            error={errors.customer_name}
            placeholder="Enter customer name"
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="customer@example.com"
          />
          
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+1 (555) 000-0000"
          />
          
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, State, Country"
          />
        </div>
        
        <div className="form-section">
          <h3>Business Information</h3>
          
          <Input
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g., Information Technology"
          />
          
          <Input
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            error={errors.website}
            placeholder="https://example.com"
          />
          
          <Input
            label="Number of Employees"
            name="no_of_employees"
            type="number"
            value={formData.no_of_employees}
            onChange={handleChange}
            placeholder="e.g., 1000"
          />
          
          <Input
            label="Established Year"
            name="established_year"
            type="number"
            value={formData.established_year}
            onChange={handleChange}
            placeholder="e.g., 1995"
          />
        </div>
        
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/customers')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEditMode ? 'Update Customer' : 'Create Customer'}
          </Button>
        </div>
      </form>
      
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Customer"
        message="Are you sure you want to deactivate this customer? This action can be reverted later."
        confirmText="Deactivate"
        confirmVariant="danger"
      />
    </div>
  );
};

export default CustomerForm;