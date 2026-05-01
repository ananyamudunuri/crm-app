/**
 * Notes Timeline Component
 * Append-only notes with chronological display
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '../Common/UI/Toast';
import Button from '../Common/UI/Button';
import LoadingSpinner from '../Common/UI/LoadingSpinner';
import NoteItem from './NoteItem';
import AddNoteForm from './AddNoteForm';
import { getCustomerNotes, createNote } from '../../services/noteService';
import { formatRelativeTime } from '../../utils/formatters';
import './NotesTimeline.css';

const NotesTimeline = ({ customerId }) => {
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadNotes();
  }, [customerId]);
  
  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getCustomerNotes(customerId);
      setNotes(data || []);
    } catch (error) {
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddNote = async (noteText, noteType) => {
    setSubmitting(true);
    try {
      await createNote(customerId, {
        note_text: noteText,
        note_type: noteType,
      });
      addToast('Note added successfully', 'success');
      loadNotes(); // Refresh the timeline
    } catch (error) {
      addToast(error.message || 'Failed to add note', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="notes-timeline">
      <div className="notes-header">
        <h3>Activity Timeline</h3>
        <span className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
      </div>
      
      <AddNoteForm onSubmit={handleAddNote} submitting={submitting} />
      
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <p>No notes yet. Add the first note to start tracking activity.</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.note_id}
              note={note}
              relativeTime={formatRelativeTime(note.created_at)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotesTimeline;