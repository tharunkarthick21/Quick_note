/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { 
  Search, X, Calendar, Paperclip, Pin, Trash2, Tag, BookOpen, AlertCircle
} from 'lucide-react';

interface TagsViewProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onTogglePinNote: (id: string, e: React.MouseEvent) => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  allExistingTags: string[];
}

export default function TagsView({
  notes,
  onSelectNote,
  onTogglePinNote,
  onDeleteNote,
  allExistingTags
}: TagsViewProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>('WORK');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Clean filter by selectedTag and searchQuery
  const filteredNotes = notes.filter((note) => {
    // 1. Tag filter
    const matchesTag = selectedTag 
      ? note.tags.some((t) => t.toUpperCase() === selectedTag.toUpperCase())
      : true;

    // 2. Query filter
    const matchesQuery = searchQuery.trim()
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return matchesTag && matchesQuery;
  });

  const handleTagToggle = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null); // Deselect if clicked again
    } else {
      setSelectedTag(tag);
    }
  };

  const handleClearAll = () => {
    setSelectedTag(null);
    setSearchQuery('');
  };

  // Hardcoded image or responsive decorative thumbs matching the image description
  const getThumbnailImage = (noteId: string) => {
    if (noteId === 'note-7') { // Workspace Redesign Concept notes
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuBC6gvMKhCThJX6TERkMM2pg79y_1sKbSYWAVqIiEApPjrF-FX3gSeuS9_5_NeZ1bwQyWzm7r9I3He0dTwj3quwsOl2RdpppLpvDgtUZ_xeGz4bcGo_ZFr0_dyJ5ggciuxUu84zjJTmExM7-ovgMV1yOfI7YQBBSOlBM3AKdmyoMzQFapw1DzGng-Q3xMt6cAvm8TgKgaHMfectXEz6wn-fClt0lhGxe5v5qNi3FoBHqWnpygCRV-zWD4K6UV7p1_X_4erLE4oPU4-z";
    }
    return null;
  };

  return (
    <div id="tags-search-browser" className="space-y-6">
      
      {/* Search Input Subsection */}
      <section className="relative">
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-400">
            <Search size={18} />
          </span>
          <input
            id="browse-tags-search-field"
            type="text"
            className="w-full bg-slate-100/80 border-transparent hover:bg-slate-100 focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 text-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm font-sans transition-all outline-hidden outline-none shadow-xs"
            placeholder="Search notes, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Browse Tags Section / Tag Cloud */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-md font-semibold text-slate-900 flex items-center gap-2 text-base">
            <Tag size={16} className="text-slate-500" />
            <span>Browse Tags</span>
          </h2>
          {(selectedTag || searchQuery) && (
            <button
              id="clear-all-tags-btn"
              onClick={handleClearAll}
              className="text-brand-primary hover:text-brand-primary-hover font-semibold text-xs font-sans hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {allExistingTags.length > 0 ? (
            allExistingTags.map((tag) => {
              const isActive = selectedTag?.toUpperCase() === tag.toUpperCase();
              return (
                <button
                  key={tag}
                  id={`tag-cloud-item-${tag}`}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-cloud-item flex items-center gap-1.5 px-4 py-2 rounded-full font-mono font-medium uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{tag}</span>
                  {isActive && <X size={12} className="shrink-0" />}
                </button>
              );
            })
          ) : (
            <div className="text-slate-400 italic font-mono text-xs p-1">No tags created across your active notes.</div>
          )}
        </div>
      </section>

      {/* Results Header block */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900 font-sans text-base">Notes with</h2>
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 rounded-md px-2 py-0.5 tracking-wide uppercase">
              #{selectedTag || 'ANY LIMIT'}
            </span>
          </div>
          <span className="text-slate-400 font-mono text-xs">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* Notes list browser */}
        <div className="space-y-2">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => {
              const thumbnail = getThumbnailImage(note.id);
              const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={note.id}
                  id={`browse-result-item-${note.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-xs duration-150 cursor-pointer"
                  onClick={() => onSelectNote(note)}
                >
                  <div className="flex flex-row gap-4 flex-1">
                    {/* Render visual image thumbnail for matched notes */}
                    {thumbnail && (
                      <div className="hidden sm:block w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                        <img 
                          className="w-full h-full object-cover" 
                          src={thumbnail} 
                          referrerPolicy="no-referrer"
                          alt="Office preview space thumbnails" 
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm mb-1 group-hover:text-brand-primary transition-colors leading-snug">
                        {note.title}
                      </h3>
                      <p className="text-slate-500 font-sans text-xs line-clamp-1 py-0.5 leading-relaxed font-normal">
                        {note.content ? note.content.slice(0, 140) : <span className="italic text-slate-300">No content notes draft</span>}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1 uppercase">
                          <Calendar size={11} className="shrink-0" />
                          {formattedDate}
                        </span>

                        {note.attachmentsCount && note.attachmentsCount > 0 ? (
                          <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1 uppercase">
                            <Paperclip size={11} className="shrink-0" />
                            {note.attachmentsCount} {note.attachmentsCount === 1 ? 'file' : 'files'}
                          </span>
                        ) : null}

                        <div className="flex items-center gap-1">
                          {note.tags.slice(0, 3).map((tg) => (
                            <span key={tg} className="text-[9px] font-mono font-medium px-1.5 py-0.2 bg-slate-50 text-slate-400 uppercase rounded">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons visible on hover / tap */}
                  <div className="mt-3 sm:mt-0 flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                    <button
                      onClick={(e) => onTogglePinNote(note.id, e)}
                      className={`p-2 rounded-lg hover:bg-slate-50 transition-colors ${
                        note.isPinned ? 'text-brand-primary bg-blue-50/50' : 'text-slate-400'
                      }`}
                      title="Toggle pin"
                    >
                      <Pin size={14} fill={note.isPinned ? '#0066ff' : 'none'} className={note.isPinned ? '' : 'rotate-45'} />
                    </button>
                    <button
                      onClick={(e) => onDeleteNote(note.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-700 text-sm font-sans">No matching notes found</p>
                <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
                  Try clearing some criteria filters, editing your search text, or select another tag chip.
                </p>
              </div>
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
