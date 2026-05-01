/**
 * Add Note Form Component
 */

import React, { useState } from 'react';
import Button from '../Common/UI/Button';
import './AddNoteForm.css';

const AddNoteForm = ({ onSubmit, submitting }) => {
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('GENERAL');
  
  const noteTypes = [
    { value: 'GENERAL', label: 'General', icon: '📝' },
    { value: 'IMPORTANT', label: 'Important', icon: '⚠️' },
    { value: 'FOLLOW_UP', label: 'Follow Up', icon: '🔔' },
    { value: 'MEETING', label: 'Meeting', icon: '🤝' },
    { value: 'CALL', label: 'Call', icon: '📞' },
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      alert('Please enter note text');
      return;
    }
    onSubmit(noteText.trim(), noteType);
    setNoteText('');
    setNoteType('GENERAL');
  };
  
  return (
    <form onSubmit={handleSubmit} className="add-note-form">
      <div className="note-type-selector">
        {noteTypes.map(type => (
          <button
            key={type.value}
            type="button"
            className={`note-type-btn ${noteType === type.value ? 'active' : ''}`}
            onClick={() => setNoteType(type.value)}
          >
            <span>{type.icon}</span> {type.label}
          </button>
        ))}
      </div>
      
      <div className="note-input-group">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a note... (max 1000 characters)"
          className="note-textarea"
          rows="3"
          maxLength="1000"
        />
        <div className="note-input-actions">
          <span className="character-count">{noteText.length}/1000</span>
          <Button type="submit" variant="primary" size="sm" loading={submitting}>
            Add Note
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddNoteForm;