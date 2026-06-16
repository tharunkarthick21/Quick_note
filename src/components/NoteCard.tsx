/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Note } from '../types';
import { Pin, Trash2, Paperclip, Calendar } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
  onTogglePin: (id: string, e: React.MouseEvent<any>) => void;
  onDelete: (id: string, e: React.MouseEvent<any>) => void;
  onTagClick?: (tag: string, e: React.MouseEvent<any>) => void;
}

export default function NoteCard({
  note,
  onSelect,
  onTogglePin,
  onDelete,
  onTagClick
}: NoteCardProps): React.ReactElement {
  // Format dates elegantly
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onSelect(note)}
      className="group relative cursor-pointer p-5 bg-white border border-slate-200 hover:border-slate-300 hover:-translate-y-[2px] active:translate-y-[1px] transition-all duration-200 rounded-xl flex flex-col gap-3 shadow-xs hover:shadow-sm"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-headline-md font-semibold text-slate-900 line-clamp-1 pr-6 leading-tight group-hover:text-brand-primary transition-colors">
          {note.title || <span className="text-slate-400 italic">Untitled Note</span>}
        </h3>
        
        <button
          id={`pin-btn-${note.id}`}
          onClick={(e) => onTogglePin(note.id, e)}
          className={`shrink-0 p-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-brand-primary ${
            note.isPinned 
              ? 'text-brand-primary bg-blue-50/50' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
          title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
        >
          <Pin size={16} fill={note.isPinned ? '#0066ff' : 'none'} className={note.isPinned ? '' : 'rotate-45'} />
        </button>
      </div>

      <div className="text-slate-600 font-normal text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
        {note.content || <span className="text-slate-400 italic">No content</span>}
      </div>

      <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/50">
        <div className="flex flex-wrap gap-1.5 max-w-[80%]">
          {note.tags.length > 0 ? (
            note.tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  if (onTagClick) {
                    onTagClick(tag, e);
                  }
                }}
                className="px-2.5 py-0.5 bg-slate-100/80 hover:bg-slate-200/80 hover:text-brand-primary text-slate-600 rounded-full font-mono text-[11px] font-medium tracking-wide transition-colors uppercase"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic font-mono">no tags</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {note.attachmentsCount && note.attachmentsCount > 0 ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Paperclip size={12} className="shrink-0" />
              {note.attachmentsCount}
            </span>
          ) : null}
          
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Calendar size={12} className="shrink-0" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Hover Quick Delete Action */}
      <button
        id={`delete-btn-${note.id}`}
        onClick={(e) => onDelete(note.id, e)}
        className="absolute bottom-2.5 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:opacity-100"
        title="Delete note"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
