/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Note, ActiveTab } from './types';
import { INITIAL_NOTES } from './data/defaultNotes';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import TagsView from './components/TagsView';
import { 
  Plus, Search, FileText, Pin, Tag, Grid, List, 
  ArrowUpDown, Info, User, Menu, AlertCircle, Sparkles, Check, X
} from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom display settings
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  // Initialization: load from local storage or pre-populate defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem('quick_note_app_notes_list');
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        setNotes(INITIAL_NOTES);
        localStorage.setItem('quick_note_app_notes_list', JSON.stringify(INITIAL_NOTES));
      }
    } catch (e) {
      console.error('Failed to load storage notes', e);
      setNotes(INITIAL_NOTES);
    }
  }, []);

  // Sync to local storage
  const saveNotesToStorage = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem('quick_note_app_notes_list', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Failed to write storage notes', e);
    }
  };

  // Toast dispatch helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Actions: Toggle note pin
  const handleTogglePin = (id: string, e: React.MouseEvent<any>) => {
    e.stopPropagation(); // prevent opening the editor
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    const newPinned = !note.isPinned;
    const updated = notes.map((n) => 
      n.id === id 
        ? { ...n, isPinned: newPinned, updatedAt: new Date().toISOString() } 
        : n
    );
    saveNotesToStorage(updated);
    addToast(newPinned ? 'Note pinned securely' : 'Note unpinned', 'success');
  };

  // Actions: Delete note
  const handleDeleteNote = (id: string, e: React.MouseEvent<any>) => {
    e.stopPropagation(); // prevent opening the editor
    const noteToDelete = notes.find((n) => n.id === id);
    if (!noteToDelete) return;

    if (window.confirm(`Are you sure you want to delete "${noteToDelete.title || 'Untitled Note'}"?`)) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotesToStorage(updated);
      addToast('Note deleted successfully', 'success');
    }
  };

  // Actions: Create brand new blank Note
  const handleCreateNewNote = () => {
    const defaultTag = activeTab === 'tags' ? 'WORK' : 'IDEA';
    const newBlankNote: Note = {
      id: 'note-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: '',
      content: '',
      tags: [defaultTag],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachmentsCount: 0
    };

    // Open instantly in Editor view
    setSelectedNote(newBlankNote);
  };

  // Actions: Save edited note (either existing or new)
  const handleSaveNote = (savedNote: Note) => {
    const exists = notes.some((n) => n.id === savedNote.id);
    let updated: Note[];

    if (exists) {
      updated = notes.map((n) => (n.id === savedNote.id ? savedNote : n));
    } else {
      updated = [savedNote, ...notes];
    }

    saveNotesToStorage(updated);
    setSelectedNote(savedNote); // keep updated inside editor
    addToast('All changes saved to database', 'success');
  };

  // Extract all existing unique tags dynamic search suggestions 
  const allExistingTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  )
    .map((tag: string) => tag.toUpperCase().trim())
    .filter((tag: string) => tag.length > 0)
    .sort();

  // Core Sorting & Filtering Pipeline
  const filteredNotes = notes.filter((note) => {
    // Tab filter first
    if (activeTab === 'pinned' && !note.isPinned) return false;

    // Query text match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(query);
      const matchContent = note.content.toLowerCase().includes(query);
      const matchTags = note.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchTitle || matchContent || matchTags;
    }

    return true;
  });

  // Sort matched notes
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes bubble to top under 'all' notes tab automatically
    if (activeTab === 'all') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else {
      // updatedAt descending
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // If selectedNote is defined, switch screen directly to full Note Editor
  if (selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
        onBack={() => {
          setSelectedNote(null);
          // Sync fresh read from local data
          const stored = localStorage.getItem('quick_note_app_notes_list');
          if (stored) {
            setNotes(JSON.parse(stored));
          }
        }}
        allExistingTags={allExistingTags}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans transition-all">
      
      {/* Dynamic Header Component */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-[800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setMenuOpen(!menuOpen);
                addToast('Menu options toggled. Fully responsive.', 'info');
              }}
              className="p-1.5 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-brand-primary font-sans flex items-center gap-2">
              <span>Quick Note</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest leading-none">Status</p>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Active Sync
              </span>
            </div>

            <button 
              onClick={() => addToast('User profile metadata verified.', 'info')}
              className="p-1 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              title="Profile Settings"
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Expandable Menu options panel */}
        {menuOpen && (
          <div className="bg-slate-50 border-b border-slate-200/50 p-4 max-w-[800px] mx-auto text-xs space-y-2">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-slate-400 uppercase tracking-wider font-bold text-[9px]">Developer Control Console</span>
              <p className="text-slate-600 font-sans">You have total access over <strong className="text-slate-800">{notes.length} Active Notes</strong>. Notes are stored in your client's LocalStorage automatically, and you can reset to defaults below:</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    if (window.confirm('This will wipe your notes and reset defaults. Proceed?')) {
                      localStorage.removeItem('quick_note_app_notes_list');
                      setNotes(INITIAL_NOTES);
                      saveNotesToStorage(INITIAL_NOTES);
                      setMenuOpen(false);
                      addToast('Database reset to premium starting drafts', 'success');
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 font-semibold rounded-lg text-[10px] uppercase font-mono tracking-wide cursor-pointer transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[10px] font-sans text-slate-500 cursor-pointer"
                >
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container Area */}
      <main className="max-w-[800px] w-full mx-auto px-4 py-6 pb-28 flex-grow">
        
        {/* Render Tab Swipe swaps */}
        {activeTab === 'tags' ? (
          <TagsView
            notes={notes}
            onSelectNote={setSelectedNote}
            onTogglePinNote={handleTogglePin}
            onDeleteNote={handleDeleteNote}
            allExistingTags={allExistingTags}
          />
        ) : (
          <div className="space-y-6">
            
            {/* Search Input Subsection */}
            <section className="relative">
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  id="dashboard-search-field"
                  type="text"
                  className="w-full bg-slate-100/90 border-transparent hover:bg-slate-100 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-sans transition-all outline-hidden shadow-xs"
                  placeholder="Search your thoughts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </section>

            {/* Controls Bar Row */}
            <section className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 font-sans text-base flex items-center gap-2">
                <span>
                  {activeTab === 'all' ? 'All Notes' : 'Pinned Thoughts'}
                </span>
                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-sm font-mono text-slate-500 font-bold">
                  {filteredNotes.length}
                </span>
              </h2>

              <div className="flex gap-1">
                {/* Sorting toggle */}
                <button
                  id="sort-toggle-btn"
                  onClick={() => {
                    const nextSort = sortBy === 'updated' ? 'title' : 'updated';
                    setSortBy(nextSort);
                    addToast(nextSort === 'title' ? 'Sorted alphabetically' : 'Sorted by modification', 'info');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-150 transition-colors cursor-pointer"
                  title={`Sort toggle: current ${sortBy === 'updated' ? 'by date' : 'by title'}`}
                >
                  <ArrowUpDown size={16} />
                </button>

                {/* Grid vs list mode visual swap */}
                <button
                  id="layout-toggle-btn"
                  onClick={() => {
                    const nextLayout = layoutMode === 'grid' ? 'list' : 'grid';
                    setLayoutMode(nextLayout);
                    addToast(nextLayout === 'list' ? 'Switched to detailed list' : 'Switched to grid layout', 'info');
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-slate-150 transition-colors cursor-pointer"
                  title={layoutMode === 'grid' ? "detailed list view" : "dynamic grid layout"}
                >
                  {layoutMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
                </button>
              </div>
            </section>

            {/* Note lists layout */}
            <section>
              {sortedNotes.length > 0 ? (
                <div 
                  id="notes-card-grid"
                  className={
                    layoutMode === 'grid' 
                      ? "grid grid-cols-1 sm:grid-cols-2 gap-4" 
                      : "flex flex-col gap-3"
                  }
                >
                  {sortedNotes.map((note) => {
                    const CardComponent = NoteCard as any;
                    return (
                      <CardComponent
                        key={note.id}
                        note={note}
                        onSelect={setSelectedNote}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onTagClick={(tag: string, e: React.MouseEvent<any>) => {
                          e.stopPropagation();
                          // Swapping tabs to Tags and selecting this tag!
                          setActiveTab('tags');
                          setTimeout(() => {
                            // This triggers the tag selection directly
                            const queryElValue = document.getElementById(`tag-cloud-item-${tag}`);
                            if (queryElValue) (queryElValue as HTMLButtonElement).click();
                          }, 50);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 py-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                    <AlertCircle size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-700 text-sm font-sans">
                      {searchQuery ? 'No thoughts matched search' : 'No notes available'}
                    </p>
                    <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                      {searchQuery 
                        ? 'Try modifying your search phrasing slightly or clear filters to locate matches.' 
                        : 'Your canvas is completely silent. Launch a brand new workspace draft easily by clicking the dynamic "+" button.'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <button
                      id="empty-action-create-btn"
                      onClick={handleCreateNewNote}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      Create First Note
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Action FAB Button. SUPPRESSED on Tags search/filter views as per specification limits */}
      {activeTab !== 'tags' && (
        <button
          id="global-create-note-fab"
          onClick={handleCreateNewNote}
          className="fixed bottom-20 right-4 md:right-8 w-14 h-14 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 hover:scale-105 hover:brightness-110 transition-all z-50 animate-bounce duration-1000"
          title="Create a new note"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Persistent Bottom Tab Sticky Navbar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 bg-white border-t border-slate-200 shadow-lg px-4 z-40">
        
        {/* Tab 1: All Notes */}
        <button
          id="nav-tab-all"
          onClick={() => {
            setActiveTab('all');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 transition-all active:scale-90 ${
            activeTab === 'all' 
              ? 'text-brand-primary font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={18} fill={activeTab === 'all' ? 'rgba(0, 102, 255, 0.1)' : 'none'} />
          <span className="font-sans font-medium text-[10px]">All Notes</span>
        </button>

        {/* Tab 2: Pinned */}
        <button
          id="nav-tab-pinned"
          onClick={() => {
            setActiveTab('pinned');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 transition-all active:scale-90 ${
            activeTab === 'pinned' 
              ? 'text-brand-primary font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Pin size={18} fill={activeTab === 'pinned' ? '#0066ff' : 'none'} />
          <span className="font-sans font-medium text-[10px]">Pinned</span>
        </button>

        {/* Tab 3: Tags */}
        <button
          id="nav-tab-tags"
          onClick={() => {
            setActiveTab('tags');
            setSearchQuery('');
          }}
          className={`flex flex-col items-center justify-center gap-1 w-20 transition-all active:scale-90 ${
            activeTab === 'tags' 
              ? 'text-brand-primary font-bold' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Tag size={18} fill={activeTab === 'tags' ? 'rgba(0, 102, 255, 0.1)' : 'none'} />
          <span className="font-sans font-medium text-[10px]">Tags</span>
        </button>
      </nav>

      {/* Dynamic Toast Notifications Overlays */}
      <div id="toast-notifications-container" className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-55 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-entrance flex items-center gap-2.5 px-4.5 py-2.5 rounded-full shadow-md text-xs font-medium bg-slate-900 text-white min-w-[240px] pointer-events-auto transition-all`}
          >
            <span className="w-2 h-2 bg-brand-primary rounded-full animate-ping shrink-0" />
            <span className="flex-grow text-left">{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

