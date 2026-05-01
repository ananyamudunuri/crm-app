/**
 * Form validation utilities
 */

export const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
  return phoneRegex.test(phone);
};

export const validateWebsite = (website) => {
  if (!website) return true;
  try {
    new URL(website);
    return true;
  } catch {
    return false;
  }
};

export const validateCustomer = (data) => {
  const errors = {};
  
  if (!data.customer_name || !data.customer_name.trim()) {
    errors.customer_name = 'Customer name is required';
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (data.website && !validateWebsite(data.website)) {
    errors.website = 'Please enter a valid URL (include http:// or https://)';
  }
  
  if (data.established_year) {
    const year = parseInt(data.established_year);
    const currentYear = new Date().getFullYear();
    if (year < 1800 || year > currentYear) {
      errors.established_year = `Year must be between 1800 and ${currentYear}`;
    }
  }
  
  if (data.no_of_employees && parseInt(data.no_of_employees) < 0) {
    errors.no_of_employees = 'Number of employees cannot be negative';
  }
  
  return errors;
};