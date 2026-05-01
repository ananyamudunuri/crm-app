/**
 * Note Filter Component
 * Filter notes by type, date range, and author
 */

import React, { useState } from 'react';
import './NoteFilter.css';

const NoteFilter = ({ onFilterChange, availableTypes = [] }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');
  const [author, setAuthor] = useState('');
  
  const noteTypes = [
    { value: 'ALL', label: 'All Types', icon: '📋' },
    { value: 'GENERAL', label: 'General', icon: '📝' },
    { value: 'IMPORTANT', label: 'Important', icon: '⚠️' },
    { value: 'FOLLOW_UP', label: 'Follow Up', icon: '🔔' },
    { value: 'MEETING', label: 'Meeting', icon: '🤝' },
    { value: 'CALL', label: 'Call', icon: '📞' }
  ];
  
  const dateRanges = [
    { value: 'ALL', label: 'All Time', days: null },
    { value: 'TODAY', label: 'Today', days: 1 },
    { value: 'WEEK', label: 'Last 7 Days', days: 7 },
    { value: 'MONTH', label: 'Last 30 Days', days: 30 },
    { value: 'YEAR', label: 'Last Year', days: 365 }
  ];
  
  const handleFilterChange = (type, value) => {
    const newFilters = { filterType, dateRange, author };
    
    if (type === 'type') {
      newFilters.filterType = value;
      setFilterType(value);
    } else if (type === 'date') {
      newFilters.dateRange = value;
      setDateRange(value);
    } else if (type === 'author') {
      newFilters.author = value;
      setAuthor(value);
    }
    
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  
  const handleClearFilters = () => {
    setFilterType('ALL');
    setDateRange('ALL');
    setAuthor('');
    
    if (onFilterChange) {
      onFilterChange({
        filterType: 'ALL',
        dateRange: 'ALL',
        author: ''
      });
    }
  };
  
  const hasActiveFilters = filterType !== 'ALL' || dateRange !== 'ALL' || author !== '';
  
  return (
    <div className="note-filter-container">
      <div className="filter-group">
        <label className="filter-label">Note Type</label>
        <div className="filter-buttons">
          {noteTypes.map(type => (
            <button
              key={type.value}
              className={`filter-btn ${filterType === type.value ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', type.value)}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Date Range</label>
        <div className="filter-buttons">
          {dateRanges.map(range => (
            <button
              key={range.value}
              className={`filter-btn ${dateRange === range.value ? 'active' : ''}`}
              onClick={() => handleFilterChange('date', range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-group">
        <label className="filter-label">Author</label>
        <input
          type="text"
          placeholder="Filter by author..."
          value={author}
          onChange={(e) => handleFilterChange('author', e.target.value)}
          className="filter-input"
        />
      </div>
      
      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default NoteFilter;