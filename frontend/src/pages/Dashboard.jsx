import React, { useState, useEffect } from 'react';
import './Pages.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalAffiliations: 0,
    totalNotes: 0
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchAllCustomers = async () => {
    // Fetch customers in batches of 100 until we get all
    let allCustomers = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await fetch(`${API_URL}/customers/?skip=${skip}&limit=${limit}`);
        if (!response.ok) break;
        
        const data = await response.json();
        const customers = data.items || [];
        allCustomers = [...allCustomers, ...customers];
        
        hasMore = customers.length === limit;
        skip += limit;
      } catch (err) {
        console.error('Error fetching customers batch:', err);
        hasMore = false;
      }
    }
    
    return allCustomers;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch all customers using pagination
      console.log('Fetching all customers...');
      const customers = await fetchAllCustomers();
      
      const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
      const inactiveCustomers = customers.filter(c => c.status === 'INACTIVE').length;
      
      console.log(`Found ${customers.length} customers`);
      
      // 2. Fetch affiliations count from first page (it has total)
      console.log('Fetching affiliations...');
      const affiliationsRes = await fetch(`${API_URL}/affiliations/?skip=0&limit=1`);
      let totalAffiliations = 0;
      
      if (affiliationsRes.ok) {
        const affiliationsData = await affiliationsRes.json();
        totalAffiliations = affiliationsData.total || 0;
        console.log(`Found ${totalAffiliations} affiliations`);
      }
      
      // 3. Fetch notes for all customers (limit to first 20 for performance)
      console.log('Fetching notes...');
      let totalNotes = 0;
      const recentNotesList = [];
      
      for (const customer of customers.slice(0, 20)) {
        try {
          const notesRes = await fetch(`${API_URL}/notes/customer/${customer.customer_id}?skip=0&limit=100`);
          if (notesRes.ok) {
            const notesData = await notesRes.json();
            const customerNotes = notesData.items || [];
            totalNotes += notesData.total || customerNotes.length;
            
            // Add recent notes to list
            customerNotes.slice(0, 3).forEach(note => {
              recentNotesList.push({
                ...note,
                customer_name: customer.customer_name,
                customer_id: customer.customer_id
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching notes for customer ${customer.customer_name}:`, err);
        }
      }
      
      // Sort recent notes by date and take latest 10
      const sortedRecentNotes = recentNotesList
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      
      console.log(`Total notes found: ${totalNotes}`);
      
      setStats({
        totalCustomers: customers.length,
        activeCustomers: activeCustomers,
        inactiveCustomers: inactiveCustomers,
        totalAffiliations: totalAffiliations,
        totalNotes: totalNotes
      });
      
      setRecentCustomers(customers.slice(0, 5));
      setRecentNotes(sortedRecentNotes);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
        <p style={{ marginLeft: '10px' }}>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button onClick={fetchDashboardData} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to your CRM Platform Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-detail">
            <span style={{ color: '#48bb78' }}>🟢 Active: {stats.activeCustomers}</span><br />
            <span style={{ color: '#f56565' }}>🔴 Inactive: {stats.inactiveCustomers}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalAffiliations}</div>
          <div className="stat-label">Total Affiliations</div>
          <div className="stat-detail">Business relationships</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalNotes}</div>
          <div className="stat-label">Total Notes</div>
          <div className="stat-detail">Activity records</div>
        </div>
      </div>

      {/* Recent Customers Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Recent Customers</h2>
          <a href="/customers" className="btn-link">View All →</a>
        </div>
        
        {recentCustomers.length === 0 ? (
          <div className="empty-state">
            <p>No customers yet. <a href="/customers">Add your first customer!</a></p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Industry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map(customer => (
                  <tr key={customer.customer_id}>
                    <td><strong>{customer.customer_name}</strong></td>
                    <td>{customer.email || '-'}</td>
                    <td>
                      <span className={`status-badge ${customer.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`}>
                        {customer.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>{customer.industry || '-'}</td>
                    <td>
                      <a href={`/customers/${customer.customer_id}`} className="btn-link-small">View Details</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {recentNotes.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Recent Activity</h2>
            <a href="/notes" className="btn-link">View All Notes →</a>
          </div>
          
          <div className="activity-list">
            {recentNotes.map(note => (
              <div key={note.note_id} className="activity-item">
                <div className="activity-icon">
                  {note.note_type === 'IMPORTANT' ? '⚠️' : 
                   note.note_type === 'FOLLOW_UP' ? '🔔' :
                   note.note_type === 'MEETING' ? '🤝' :
                   note.note_type === 'CALL' ? '📞' : '📝'}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{note.customer_name}</strong> - {note.note_text.substring(0, 150)}
                    {note.note_text.length > 150 && '...'}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-type">{note.note_type}</span>
                    <span className="activity-time">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                    <span className="activity-author">by {note.created_by}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginTop: '24px' }}>
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/customers" className="btn btn-primary">➕ Add New Customer</a>
          <a href="/affiliations" className="btn btn-secondary">🔗 Manage Affiliations</a>
          <a href="/notes" className="btn btn-secondary">📝 View All Notes</a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
