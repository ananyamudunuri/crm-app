import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Pages.css';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [affiliations, setAffiliations] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      const [customerRes, affiliationsRes, notesRes] = await Promise.all([
        fetch(`${API_URL}/customers/${id}`),
        fetch(`${API_URL}/affiliations/`),
        fetch(`${API_URL}/notes/customer/${id}`)
      ]);
      
      const customerData = await customerRes.json();
      const allAffiliations = await affiliationsRes.json();
      const notesData = await notesRes.json();
      
      setCustomer(customerData);
      
      // Filter affiliations for this customer
      const customerAffiliations = (allAffiliations.items || []).filter(
        aff => aff.parent_customer_id === id || aff.affiliate_customer_id === id
      );
      setAffiliations(customerAffiliations);
      setNotes(notesData.items || []);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!customer) {
    return <div className="empty-state">Customer not found</div>;
  }

  return (
    <div className="customer-detail">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>← Back</button>
        <h1>{customer.customer_name}</h1>
        <span className={`status-badge status-${customer.status?.toLowerCase()}`}>
          {customer.status || 'ACTIVE'}
        </span>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3>Contact Information</h3>
          <div className="info-row">
            <strong>Email:</strong> {customer.email || '—'}
          </div>
          <div className="info-row">
            <strong>Phone:</strong> {customer.phone || '—'}
          </div>
          <div className="info-row">
            <strong>Location:</strong> {customer.location || '—'}
          </div>
          <div className="info-row">
            <strong>Website:</strong> {customer.website || '—'}
          </div>
        </div>

        <div className="card">
          <h3>Business Information</h3>
          <div className="info-row">
            <strong>Industry:</strong> {customer.industry || '—'}
          </div>
          <div className="info-row">
            <strong>Employees:</strong> {customer.no_of_employees || '—'}
          </div>
          <div className="info-row">
            <strong>Established:</strong> {customer.established_year || '—'}
          </div>
          <div className="info-row">
            <strong>Customer Since:</strong> {new Date(customer.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Affiliations</h3>
        {affiliations.length === 0 ? (
          <p>No affiliations</p>
        ) : (
          <div className="affiliations-list">
            {affiliations.map(aff => (
              <div key={aff.affiliation_id} className="affiliation-item">
                <span className="relationship-badge">{aff.relationship_type}</span>
                <span>
                  {aff.parent_customer_id === id ? '→' : '←'} 
                  {' '}Related Customer
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Recent Notes</h3>
        {notes.length === 0 ? (
          <p>No notes</p>
        ) : (
          <div className="notes-preview">
            {notes.slice(0, 5).map(note => (
              <div key={note.note_id} className="note-preview">
                <div className="note-preview-header">
                  <span className="note-type-badge">{note.note_type}</span>
                  <span className="note-date">{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
                <div className="note-preview-text">{note.note_text.substring(0, 150)}...</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerDetail;
