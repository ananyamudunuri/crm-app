/**
 * Custom Hook for Notes Management
 */

import { useState, useCallback } from 'react';
import { useToast } from '../components/Common/UI/Toast';
import { getCustomerNotes, createNote, updateNote } from '../services/noteService';

export const useNotes = (customerId) => {
  const { addToast } = useToast();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    dateRange: 'ALL',
    author: ''
  });
  
  // Fetch all notes for a customer
  const fetchNotes = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerNotes(customerId);
      setNotes(data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [customerId, addToast]);
  
  // Add new note
  const addNote = useCallback(async (noteData) => {
    try {
      setLoading(true);
      const newNote = await createNote(customerId, noteData);
      addToast('Note added successfully', 'success');
      await fetchNotes(); // Refresh list
      return newNote;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId, addToast, fetchNotes]);
  
  // Update note (only type, text is immutable)
  const editNote = useCallback(async (noteId, updateData) => {
    try {
      setLoading(true);
      const updated = await updateNote(customerId, noteId, updateData);
      addToast('Note updated successfully', 'success');
      await fetchNotes(); // Refresh list
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [customerId, addToast, fetchNotes]);
  
  // Filter notes based on current filters
  const getFilteredNotes = useCallback(() => {
    let filtered = [...notes];
    
    // Filter by type
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(note => note.note_type === filters.type);
    }
    
    // Filter by date range
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      let daysAgo;
      switch (filters.dateRange) {
        case 'TODAY': daysAgo = 1; break;
        case 'WEEK': daysAgo = 7; break;
        case 'MONTH': daysAgo = 30; break;
        case 'YEAR': daysAgo = 365; break;
        default: daysAgo = null;
      }
      
      if (daysAgo) {
        const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
        filtered = filtered.filter(note => new Date(note.created_at) >= cutoffDate);
      }
    }
    
    // Filter by author
    if (filters.author) {
      filtered = filtered.filter(note => 
        note.created_by.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    return filtered;
  }, [notes, filters]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      type: 'ALL',
      dateRange: 'ALL',
      author: ''
    });
  }, []);
  
  // Initial fetch
  useState(() => {
    if (customerId) {
      fetchNotes();
    }
  }, [customerId, fetchNotes]);
  
  const filteredNotes = getFilteredNotes();
  
  return {
    notes: filteredNotes,
    allNotes: notes,
    loading,
    error,
    filters,
    fetchNotes,
    addNote,
    editNote,
    updateFilters,
    clearFilters,
    totalNotes: notes.length,
    filteredCount: filteredNotes.length
  };
};