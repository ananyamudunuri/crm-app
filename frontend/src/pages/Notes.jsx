import React, { useState, useEffect } from 'react';
import './Notes.css';

function Notes() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('GENERAL');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/customers/?skip=0&limit=100`);
      const data = await response.json();
      setCustomers(data.items || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchNotes = async (customerId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/notes/customer/${customerId}`);
      const data = await response.json();
      setNotes(data.items || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    fetchNotes(customer.customer_id);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert('Please enter note text');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/notes/customer/${selectedCustomer.customer_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          note_text: noteText, 
          note_type: noteType,
          created_by: 'User'
        })
      });
      
      if (response.ok) {
        setShowForm(false);
        setNoteText('');
        setNoteType('GENERAL');
        fetchNotes(selectedCustomer.customer_id);
      } else {
        alert('Failed to add note');
      }
    } catch (err) {
      alert('Failed to add note');
    }
  };

  const getNoteTypeIcon = (type) => {
    const icons = {
      GENERAL: '📝',
      IMPORTANT: '⚠️',
      FOLLOW_UP: '🔔',
      MEETING: '🤝',
      CALL: '📞'
    };
    return icons[type] || '📝';
  };

  const getNoteTypeColor = (type) => {
    const colors = {
      GENERAL: '#6b7280',
      IMPORTANT: '#ef4444',
      FOLLOW_UP: '#f59e0b',
      MEETING: '#10b981',
      CALL: '#3b82f6'
    };
    return colors[type] || '#6b7280';
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1>Notes Management</h1>
        <p>View and manage customer notes</p>
      </div>

      <div className="notes-layout">
        {/* Left Sidebar - Customer List */}
        <div className="customer-sidebar">
          <div className="sidebar-header">
            <h3>Customers</h3>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="customer-list">
            {filteredCustomers.length === 0 ? (
              <div className="no-customers">No customers found</div>
            ) : (
              filteredCustomers.map(customer => (
                <div
                  key={customer.customer_id}
                  className={`customer-item ${selectedCustomer?.customer_id === customer.customer_id ? 'active' : ''}`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="customer-avatar">
                    {customer.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="customer-info">
                    <div className="customer-name">{customer.customer_name}</div>
                    <div className="customer-detail">{customer.email || 'No email'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Notes Timeline */}
        <div className="notes-panel">
          {!selectedCustomer ? (
            <div className="no-selection">
              <div className="no-selection-icon">📝</div>
              <h3>Select a customer</h3>
              <p>Choose a customer from the left to view their notes</p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <div>
                  <h2>{selectedCustomer.customer_name}</h2>
                  <p className="customer-info-text">
                    {selectedCustomer.email || 'No email'} | {selectedCustomer.industry || 'No industry'}
                  </p>
                </div>
                <button 
                  className="btn-add-note"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Cancel' : '+ Add Note'}
                </button>
              </div>

              {/* Add Note Form */}
              {showForm && (
                <div className="add-note-form">
                  <h3>Add New Note</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <label>Note Type</label>
                      <select 
                        value={noteType} 
                        onChange={(e) => setNoteType(e.target.value)}
                        className="note-type-select"
                      >
                        <option value="GENERAL">📝 General</option>
                        <option value="IMPORTANT">⚠️ Important</option>
                        <option value="FOLLOW_UP">🔔 Follow Up</option>
                        <option value="MEETING">🤝 Meeting</option>
                        <option value="CALL">📞 Call</option>
                      </select>
                    </div>
                    <div className="form-row">
                      <label>Note Content</label>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows="4"
                        placeholder="Enter your note here..."
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-save">Save Note</button>
                      <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notes Timeline */}
              <div className="notes-timeline">
                {loading ? (
                  <div className="loading-spinner">Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div className="no-notes">
                    <div className="no-notes-icon">📭</div>
                    <p>No notes yet</p>
                    <button className="btn-add-first" onClick={() => setShowForm(true)}>
                      Add your first note
                    </button>
                  </div>
                ) : (
                  <div className="timeline">
                    {notes.map((note, index) => (
                      <div key={note.note_id} className="timeline-item">
                        <div className="timeline-left">
                          <div className="timeline-icon" style={{ backgroundColor: getNoteTypeColor(note.note_type) }}>
                            {getNoteTypeIcon(note.note_type)}
                          </div>
                          {index < notes.length - 1 && <div className="timeline-line"></div>}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="note-type-badge" style={{ backgroundColor: getNoteTypeColor(note.note_type) }}>
                              {note.note_type}
                            </span>
                            <span className="note-date">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="timeline-body">
                            <p>{note.note_text}</p>
                          </div>
                          <div className="timeline-footer">
                            <span className="note-author">Created by: {note.created_by}</span>
                            {note.is_edited && (
                              <span className="note-edited">(Edited)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;
