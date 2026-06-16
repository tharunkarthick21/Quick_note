/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { 
  ArrowLeft, Check, X, Plus, 
  Bold, Italic, List, Link, ImageIcon, CheckSquare,
  Eye, FileText, History, Info
} from 'lucide-react';

interface NoteEditorProps {
  note: Note;
  onSave: (updatedNote: Note) => void;
  onBack: () => void;
  allExistingTags: string[];
}

type EditorSubTab = 'editor' | 'preview' | 'versions';

export default function NoteEditor({
  note,
  onSave,
  onBack,
  allExistingTags
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [subTab, setSubTab] = useState<EditorSubTab>('editor');
  
  // Tag creation states
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  
  // Versions log states
  const [versions, setVersions] = useState<Array<{ id: string; timestamp: string; label: string; content: string }>>([
    {
      id: 'v1',
      timestamp: new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ', ' + new Date(note.createdAt).toLocaleDateString(),
      label: 'Created Note',
      content: note.content
    }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  // Load and sync local draft versions if available
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setVersions([
      {
        id: 'v1',
        timestamp: new Date(note.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ', ' + new Date(note.createdAt).toLocaleDateString(),
        label: 'Original Draft',
        content: note.content
      }
    ]);
  }, [note]);

  // Handle autocomplete matching for inline tag inputs
  useEffect(() => {
    if (!newTagInput.trim()) {
      setTagSuggestions([]);
      return;
    }
    const cleanInput = newTagInput.toUpperCase().trim();
    const matches = allExistingTags.filter(
      (t) => t.toUpperCase().includes(cleanInput) && !tags.includes(t)
    );
    setTagSuggestions(matches);
  }, [newTagInput, allExistingTags, tags]);

  // Statistics calculations
  const calculateWords = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const calculateReadingTime = (text: string) => {
    const words = calculateWords(text);
    const wpm = 200; // average typing word reading limit
    const minutes = Math.ceil(words / wpm);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  };

  const wordCount = calculateWords(content);
  const charCount = content.length;

  // Insert markdown style helper at cursor location
  const insertMarkdown = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let replacement = '';
    
    switch (syntax) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'bullet':
        replacement = selectedText 
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : `- List item`;
        break;
      case 'checklist':
        replacement = selectedText
          ? selectedText.split('\n').map(line => `- [ ] ${line}`).join('\n')
          : `- [ ] Todo item`;
        break;
      case 'link':
        replacement = `[${selectedText || 'Link text'}](https://example.com)`;
        break;
      case 'image':
        replacement = `![Minimalist Workspace](https://lh3.googleusercontent.com/aida-public/AB6AXuBC6gvMKhCThJX6TERkMM2pg79y_1sKbSYWAVqIiEApPjrF-FX3gSeuS9_5_NeZ1bwQyWzm7r9I3He0dTwj3quwsOl2RdpppLpvDgtUZ_xeGz4bcGo_ZFr0_dyJ5ggciuxUu84zjJTmExM7-ovgMV1yOfI7YQBBSOlBM3AKdmyoMzQFapw1DzGng-Q3xMt6cAvm8TgKgaHMfectXEz6wn-fClt0lhGxe5v5qNi3FoBHqWnpygCRV-zWD4K6UV7p1_X_4erLE4oPU4-z)`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Re-focus and reset cursor
    setTimeout(() => {
      textarea.focus();
      const offset = replacement.length;
      textarea.setSelectionRange(start + offset, start + offset);
    }, 10);
  };

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title: title.trim() || 'Untitled Note',
      content,
      tags,
      updatedAt: new Date().toISOString()
    };

    // Add to versions list so user can see save logs
    const newVersion = {
      id: Math.random().toString(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
      label: 'Revision Saved',
      content: content
    };
    setVersions(prev => [newVersion, ...prev]);

    onSave(updatedNote);
    
    // Display quick success state
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const addTag = (tag: string) => {
    const cleaned = tag.toUpperCase().trim().replace(/[^A-Z0-9_\-]/gi, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Parsing markdown to quick beautiful pre-view HTML elements safely
  const renderPreviewHTML = () => {
    if (!content.trim()) {
      return <p className="text-slate-400 italic font-sans">No text written yet. Switch back to Editor to write.</p>;
    }

    return content.split('\n\n').map((block, bIdx) => {
      const trimmedBlock = block.trim();
      
      // Headline (e.g. ### Title or Key Principles:)
      if (trimmedBlock.startsWith('###')) {
        return <h4 key={bIdx} className="text-lg font-bold text-slate-800 mt-4 mb-2">{trimmedBlock.replace('###', '')}</h4>;
      }
      if (trimmedBlock.startsWith('##')) {
        return <h3 key={bIdx} className="text-xl font-bold text-slate-800 mt-4 mb-2">{trimmedBlock.replace('##', '')}</h3>;
      }
      
      // Render simple checklists
      if (trimmedBlock.startsWith('- [ ]') || trimmedBlock.startsWith('- [x]')) {
        return (
          <ul key={bIdx} className="space-y-1.5 my-2 pl-2">
            {trimmedBlock.split('\n').map((line, lIdx) => {
              const checked = line.includes('- [x]');
              const cleanText = line.replace(/^- \[[x ]\]\s*/i, '');
              return (
                <li key={lIdx} className="flex items-center gap-2 font-sans font-normal text-slate-700 text-sm">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-300'}`}>
                    {checked && <Check size={12} strokeWidth={3} />}
                  </div>
                  <span className={checked ? 'line-through text-slate-400' : ''}>{cleanText}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Render bullet list
      if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
        return (
          <ul key={bIdx} className="list-disc list-inside space-y-1 my-2 pl-4 text-slate-700 font-sans text-sm">
            {trimmedBlock.split('\n').map((line, lIdx) => (
              <li key={lIdx} className="leading-relaxed">{line.replace(/^[-*]\s*/, '')}</li>
            ))}
          </ul>
        );
      }

      // Render numeric lists
      if (/^\d+\.\s+/.test(trimmedBlock)) {
        return (
          <ol key={bIdx} className="list-decimal list-inside space-y-1 my-2 pl-4 text-slate-700 font-sans text-sm">
            {trimmedBlock.split('\n').map((line, lIdx) => (
              <li key={lIdx} className="leading-relaxed">{line.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }

      // Render inline images
      if (trimmedBlock.startsWith('![') && trimmedBlock.includes('](')) {
        const altStart = trimmedBlock.indexOf('[') + 1;
        const altEnd = trimmedBlock.indexOf(']');
        const urlStart = trimmedBlock.indexOf('(') + 1;
        const urlEnd = trimmedBlock.indexOf(')');
        const alt = trimmedBlock.substring(altStart, altEnd);
        const url = trimmedBlock.substring(urlStart, urlEnd);
        return (
          <div key={bIdx} className="my-4 rounded-lg overflow-hidden border border-slate-200 shadow-xs max-h-72 bg-slate-50">
            <img src={url} alt={alt} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            <span className="text-[10px] font-mono p-1 text-slate-400 block text-center uppercase tracking-wider">{alt} (preview)</span>
          </div>
        );
      }

      // Formatted text paragraphs (bold & italics)
      let renderedText = trimmedBlock;
      // Bold replace
      renderedText = renderedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Italic replace
      renderedText = renderedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // Link replace
      renderedText = renderedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-brand-primary underline hover:text-brand-primary-hover">$1</a>');

      return (
        <p 
          key={bIdx} 
          className="text-slate-700 font-sans leading-relaxed text-sm whitespace-pre-wrap mb-3"
          dangerouslySetInnerHTML={{ __html: renderedText }}
        />
      );
    });
  };

  return (
    <div id="full-note-editor" className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="w-full h-16 bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <button
              id="editor-back-btn"
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Save and Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="font-semibold text-slate-900 font-sans text-base hidden sm:inline">Editing in</span>
            <span className="font-mono text-xs px-2.5 py-0.5 bg-blue-50 text-brand-primary font-bold rounded-md">Quick Note</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="editor-save-btn"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer ${
                saveStatus === 'saved'
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-brand-primary hover:bg-brand-primary-hover text-white active:scale-95'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save</span>
                </>
              )}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/80">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase">A</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-[1000px] w-full mx-auto px-4 md:px-6 py-6 pb-28 md:grid md:grid-cols-4 md:gap-6">
        {/* Left main editor side */}
        <section className="bg-white border border-slate-200 rounded-xl px-5 py-6 shadow-xs md:col-span-3 flex flex-col gap-4">
          
          {/* Note Tags List & Add section */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            <div className="flex flex-wrap gap-1.5" id="editor-tag-container">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="tag-chip flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-mono text-xs font-medium tracking-wide uppercase transition-all hover:bg-slate-100"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="remove-tag text-slate-400 hover:text-red-500 rounded p-0.5 shrink-0 transition-colors"
                    title={`Remove ${tag} tag`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Inline inline tag fields */}
            {isAddingTag ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newTagInput.trim()) {
                    addTag(newTagInput);
                  }
                }}
                className="relative flex items-center"
              >
                <input
                  id="new-tag-input"
                  autoFocus
                  type="text"
                  placeholder="TAG NAME"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="px-2 py-0.5 max-w-[120px] bg-slate-50 border border-brand-primary placeholder:text-slate-400 text-slate-700 rounded-lg text-xs font-mono outline-hidden lowercase"
                  onBlur={() => {
                    // Timeout to let suggestions overlay click register
                    setTimeout(() => {
                      if (!newTagInput.trim()) setIsAddingTag(false);
                    }, 200);
                  }}
                />
                <button
                  type="submit"
                  className="p-1 text-brand-primary hover:text-brand-primary-hover transition-colors"
                >
                  <Check size={12} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>

                {/* Match Autosuggest Chip Row */}
                {tagSuggestions.length > 0 && (
                  <div className="absolute top-8 left-0 bg-white border border-slate-200 rounded-lg shadow-md p-1.5 z-50 flex flex-col gap-1 min-w-[140px]">
                    <span className="text-[9px] font-mono text-slate-400 px-1 uppercase tracking-wider block border-b border-slate-100 pb-0.5">Existing Tags</span>
                    {tagSuggestions.slice(0, 4).map((suggested) => (
                      <button
                        key={suggested}
                        type="button"
                        onClick={() => addTag(suggested)}
                        className="text-left py-1 px-2 border-transparent hover:bg-blue-50 hover:text-brand-primary rounded-md font-mono text-xs uppercase"
                      >
                        {suggested}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            ) : (
              <button
                id="add-tag-trigger-btn"
                onClick={() => setIsAddingTag(true)}
                className="flex items-center gap-1 text-brand-primary font-semibold text-xs py-1 px-3 bg-blue-50/50 hover:bg-blue-50 text-blue-600 rounded-full transition-colors cursor-pointer border border-transparent hover:border-blue-100"
              >
                <Plus size={12} />
                <span>Add Tag</span>
              </button>
            )}
          </div>

          {/* Title Area */}
          <div className="relative">
            <input
              id="editor-title-field"
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none p-0 font-bold font-sans text-2xl md:text-3xl focus:ring-0 placeholder:text-slate-200 text-slate-900 leading-tight focus:outline-hidden"
            />
          </div>

          {/* Rich content Formatting Toolbar */}
          <div className="flex items-center gap-1.5 py-2 border-y border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => insertMarkdown('bold')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Bold text"
            >
              <Bold size={16} />
            </button>
            
            <button
              onClick={() => insertMarkdown('italic')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Italic text"
            >
              <Italic size={16} />
            </button>

            <button
              onClick={() => insertMarkdown('bullet')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Bulleted list"
            >
              <List size={16} />
            </button>

            <button
              onClick={() => insertMarkdown('checklist')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Checklist task"
            >
              <CheckSquare size={16} />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1 shrink-0"></div>

            <button
              onClick={() => insertMarkdown('link')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Insert link"
            >
              <Link size={16} />
            </button>

            <button
              onClick={() => insertMarkdown('image')}
              className="p-1.5 h-8 w-8 text-slate-500 hover:text-brand-primary hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Insert office layout photo (hotlinked)"
            >
              <ImageIcon size={16} />
            </button>
          </div>

          {/* Sub tab contents: Code / Preview / Versions logs */}
          <div className="relative flex-grow flex flex-col min-h-[420px]">
            {subTab === 'editor' && (
              <textarea
                id="editor-body-field"
                ref={textareaRef}
                placeholder="Start writing your thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full flex-grow bg-transparent border-none p-0 font-sans text-sm md:text-base leading-relaxed text-slate-700 focus:ring-0 placeholder:text-slate-300 resize-none focus:outline-hidden min-h-[420px]"
              />
            )}

            {subTab === 'preview' && (
              <div id="markdown-preview-container" className="prose max-w-none text-slate-800 font-sans leading-relaxed py-1 min-h-[420px]">
                {renderPreviewHTML()}
              </div>
            )}

            {subTab === 'versions' && (
              <div id="versions-container" className="min-h-[420px] flex flex-col gap-4 font-sans py-1">
                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100/50">
                  <Info size={14} className="shrink-0" />
                  <span className="text-[11px] leading-tight text-blue-700 font-medium">Click on any past revision below to instantly rollback or restore that block content to your editor.</span>
                </div>

                <div className="space-y-2.5">
                  {versions.map((ver, idx) => (
                    <div 
                      key={ver.id}
                      className="group flex flex-col gap-1.5 p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:border-slate-300 hover:bg-slate-100/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-700 uppercase">Rev {versions.length - idx}</span>
                        <span className="font-mono text-[10px] text-slate-400">{ver.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans line-clamp-2 italic">
                        "{ver.content.slice(0, 100) || 'empty draft'}..."
                      </p>
                      <button
                        onClick={() => {
                          setContent(ver.content);
                          setSubTab('editor');
                          // Toast feedback
                          const notif = document.createElement('div');
                          notif.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 shadow-lg z-55';
                          notif.innerHTML = `<span>Restored version successfully</span>`;
                          document.body.appendChild(notif);
                          setTimeout(() => notif.remove(), 2500);
                        }}
                        className="mt-1 text-left inline-flex items-center gap-1 text-xs text-brand-primary font-semibold hover:underline"
                      >
                        <History size={12} />
                        <span>Restore this content</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Desktop Context Side Panel */}
        <aside className="hidden md:block col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-xs sticky top-24">
            <p className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 border-l-2 border-brand-primary mb-3">
              Note Statistics
            </p>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-sans">Words</span>
                <span className="font-mono text-xs font-bold text-slate-800">{wordCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-sans">Characters</span>
                <span className="font-mono text-xs font-bold text-slate-800">{charCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-500 font-sans">Read Estimate</span>
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 rounded-md px-1.5 py-0.5">{calculateReadingTime(content)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-slate-500 font-sans">Last Saved</span>
                <span className="font-sans text-xs text-slate-800">{new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4.5 hover:bg-blue-50 transition-colors">
            <span className="font-bold text-blue-700 font-sans text-xs flex items-center gap-1.5 mb-1.5">
              <Eye size={12} /> Live Render Engine
            </span>
            <p className="text-[11px] leading-relaxed text-blue-600/90 font-sans font-normal">
              This system supports markdown formatting rules directly in writing. Switch to the <strong>Preview tab</strong> on mobile or use formatting tools anytime to parse layouts safely.
            </p>
          </div>
        </aside>
      </main>

      {/* Persistent Bottom Tabs for Mobile (Editor/Preview/Versions) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center h-16 z-40">
        <button
          onClick={() => setSubTab('editor')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            subTab === 'editor' ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={18} />
          <span className="font-mono text-[11px]">Editor</span>
        </button>

        <button
          onClick={() => setSubTab('preview')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            subTab === 'preview' ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Eye size={18} />
          <span className="font-mono text-[11px]">Preview</span>
        </button>

        <button
          onClick={() => setSubTab('versions')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            subTab === 'versions' ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History size={18} />
          <span className="font-mono text-[11px]">Versions</span>
        </button>
      </div>
    </div>
  );
}
