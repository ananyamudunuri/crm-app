/**
 * Individual Note Item Component
 */

import React from 'react';
import './NoteItem.css';

const NoteItem = ({ note, relativeTime }) => {
  const getNoteTypeIcon = (type) => {
    const icons = {
      GENERAL: '📝',
      IMPORTANT: '⚠️',
      FOLLOW_UP: '🔔',
      MEETING: '🤝',
      CALL: '📞',
    };
    return icons[type] || '📝';
  };
  
  const getNoteTypeClass = (type) => {
    return `note-type-${type.toLowerCase()}`;
  };
  
  return (
    <div className="note-item">
      <div className="note-header">
        <div className="note-type">
          <span className="note-type-icon">{getNoteTypeIcon(note.note_type)}</span>
          <span className={`note-type-badge ${getNoteTypeClass(note.note_type)}`}>
            {note.note_type}
          </span>
        </div>
        <div className="note-meta">
          <span className="note-author">{note.created_by}</span>
          <span className="note-time" title={new Date(note.created_at).toLocaleString()}>
            {relativeTime}
          </span>
        </div>
      </div>
      
      <div className="note-content">
        {note.note_text}
      </div>
      
      {note.is_edited && (
        <div className="note-edited">
          Edited {new Date(note.edited_at).toLocaleString()} by {note.edited_by}
        </div>
      )}
    </div>
  );
};

export default NoteItem;