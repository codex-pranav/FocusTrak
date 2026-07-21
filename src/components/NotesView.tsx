import React, { useState, useEffect } from 'react';
import { Note, Task } from '../types';
import { 
  Plus, 
  Search, 
  FileText, 
  CheckSquare, 
  Edit3, 
  Eye, 
  Trash2, 
  Link as LinkIcon, 
  Sparkles, 
  Save, 
  Calendar,
  Check
} from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  tasks: Task[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export default function NotesView({
  notes,
  tasks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: NotesViewProps) {
  const [search, setSearch] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  
  // Note edit state
  const [editMode, setEditMode] = useState<'edit' | 'preview'>('edit');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [taskLinkId, setTaskLinkId] = useState<string>('');
  
  // Checklist input helper
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const activeNote = notes.find(n => n.id === selectedNoteId);

  // Sync inputs on note selection
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      setContent(activeNote.content);
      setIsChecklist(activeNote.isChecklist);
      setChecklistItems(activeNote.checklistItems || []);
      setTaskLinkId(activeNote.taskLinkId || '');
    } else if (notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    } else {
      setSelectedNoteId(null);
      setTitle('');
      setContent('');
      setIsChecklist(false);
      setChecklistItems([]);
      setTaskLinkId('');
    }
  }, [selectedNoteId, activeNote, notes]);

  // Handle autosave simulation or explicit save
  const handleSave = () => {
    if (!selectedNoteId || !title.trim()) return;
    
    onUpdateNote({
      id: selectedNoteId,
      title,
      content,
      isChecklist,
      checklistItems,
      taskLinkId: taskLinkId || undefined,
      createdAt: activeNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  // Auto-save on change with short delay simulation
  useEffect(() => {
    if (!selectedNoteId) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 1500); // 1.5s autosave timeout
    return () => clearTimeout(timer);
  }, [title, content, isChecklist, checklistItems, taskLinkId]);

  const handleCreateNote = () => {
    const freshNoteTitle = 'Untitled Note';
    onAddNote({
      title: freshNoteTitle,
      content: 'Start writing your rich documentation or plan outline here...',
      isChecklist: false,
      checklistItems: [],
    });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const item = {
      id: String(Date.now()),
      text: newChecklistItem.trim(),
      completed: false
    };
    setChecklistItems([...checklistItems, item]);
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (id: string) => {
    const updated = checklistItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updated);
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) || 
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[550px]">
      
      {/* Column 1: Sidebar notes catalog */}
      <div className="lg:col-span-1 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-800 dark:text-sophisticated-text uppercase tracking-wider font-mono">
            My Documents
          </h3>
          <button 
            onClick={handleCreateNote}
            className="p-1 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-sophisticated-active dark:hover:bg-sophisticated-bg text-indigo-600 dark:text-sophisticated-text transition-all cursor-pointer"
            title="Create Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Notes */}
        <div className="flex items-center bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-2 py-1">
          <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
          <input
            type="text"
            className="bg-transparent text-[11px] text-gray-800 dark:text-sophisticated-text placeholder-gray-400 dark:placeholder-sophisticated-muted outline-none w-full"
            placeholder="Search docs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[400px] lg:max-h-none">
          {filteredNotes.length === 0 ? (
            <div className="text-center text-[10px] text-gray-400 py-10 dark:text-sophisticated-muted">No notes found.</div>
          ) : (
            filteredNotes.map(n => (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all border text-left ${
                  selectedNoteId === n.id 
                    ? 'bg-indigo-50/30 dark:bg-sophisticated-active/80 border-indigo-200 dark:border-sophisticated-border' 
                    : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-sophisticated-bg/40'
                }`}
              >
                <h4 className="text-xs font-semibold text-gray-800 dark:text-sophisticated-text truncate">{n.title || 'Untitled Note'}</h4>
                <p className="text-[10px] text-gray-400 dark:text-sophisticated-muted mt-1 line-clamp-2 leading-relaxed">
                  {n.isChecklist ? `[Checklist with ${n.checklistItems?.length} items]` : n.content}
                </p>
                <div className="flex justify-between items-center mt-2 text-[8px] font-mono text-gray-400">
                  <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                  {n.taskLinkId && <span className="text-sophisticated-accent font-bold">Linked</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 2: Document Editor */}
      <div className="lg:col-span-3 bg-white dark:bg-sophisticated-sidebar border border-gray-100 dark:border-sophisticated-border rounded-xl p-5 flex flex-col gap-4 relative text-gray-900 dark:text-sophisticated-text">
        {selectedNoteId && activeNote ? (
          <>
            {/* Toolbar row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 dark:border-sophisticated-border pb-3">
              <input
                type="text"
                className="text-sm font-bold text-gray-800 dark:text-sophisticated-text bg-transparent outline-none w-full sm:max-w-md border-b border-transparent hover:border-gray-200 focus:border-sophisticated-accent"
                placeholder="Enter note title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <div className="flex items-center gap-2">
                {/* Autosave badge */}
                <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Auto Saved
                </span>

                <button
                  onClick={() => setEditMode(editMode === 'edit' ? 'preview' : 'edit')}
                  className="p-1.5 border border-gray-100 dark:border-sophisticated-border hover:bg-gray-50 dark:hover:bg-sophisticated-active rounded text-xs font-semibold text-gray-600 dark:text-sophisticated-text flex items-center gap-1 cursor-pointer"
                >
                  {editMode === 'edit' ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{editMode === 'edit' ? 'Preview' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => onDeleteNote(selectedNoteId)}
                  className="p-1.5 border border-transparent hover:border-rose-100 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 rounded cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Note parameters: checklist or linked task */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-sophisticated-bg px-2.5 py-1 rounded-lg border border-gray-100 dark:border-sophisticated-border">
                <input
                  type="checkbox"
                  id="toggle-checklist"
                  checked={isChecklist}
                  onChange={e => setIsChecklist(e.target.checked)}
                  className="w-3.5 h-3.5 text-sophisticated-accent"
                />
                <label htmlFor="toggle-checklist" className="text-[10px] font-semibold text-gray-600 dark:text-sophisticated-text cursor-pointer flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-sophisticated-accent" /> Structure as checklist
                </label>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-sophisticated-bg px-2.5 py-1 rounded-lg border border-gray-100 dark:border-sophisticated-border">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={taskLinkId}
                  onChange={e => setTaskLinkId(e.target.value)}
                  className="bg-transparent text-[10px] font-semibold text-gray-600 dark:text-sophisticated-text outline-none cursor-pointer dark:[color-scheme:dark]"
                >
                  <option value="">Link to task...</option>
                  {tasks.filter(t => !t.recentlyDeleted).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Editor Workspace */}
            {isChecklist ? (
              <div className="space-y-4 flex-1">
                {/* Add item to Checklist */}
                <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-gray-50 dark:bg-sophisticated-bg border border-gray-100 dark:border-sophisticated-border rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-sophisticated-text outline-none focus:border-sophisticated-accent"
                    placeholder="Add checklist item... press Enter"
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Add
                  </button>
                </form>

                {/* Items List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {checklistItems.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-10 dark:text-sophisticated-muted">Add items to populate the note checklist.</div>
                  ) : (
                    checklistItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-sophisticated-bg/40 border border-gray-50 dark:border-sophisticated-border rounded-lg">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-gray-700 dark:text-sophisticated-text">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(item.id)}
                            className="w-4 h-4 text-sophisticated-accent rounded cursor-pointer"
                          />
                          <span className={item.completed ? 'line-through text-gray-400 dark:text-sophisticated-muted' : ''}>{item.text}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="text-gray-400 hover:text-rose-500 text-xs font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {editMode === 'edit' ? (
                  <textarea
                    className="w-full flex-1 min-h-[300px] bg-gray-50/50 dark:bg-sophisticated-bg/40 border border-gray-100 dark:border-sophisticated-border rounded-xl p-4 text-xs text-gray-800 dark:text-sophisticated-text outline-none font-sans leading-relaxed resize-none focus:border-sophisticated-accent transition-colors"
                    placeholder="Start typing markdown styled docs... support for # headers, * bullets, etc."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  />
                ) : (
                  /* Beautifully parsed/designed Markdown preview simulator */
                  <div className="w-full flex-1 min-h-[300px] bg-gray-50/30 dark:bg-sophisticated-bg/10 border border-gray-50 dark:border-sophisticated-border rounded-xl p-5 text-xs text-gray-800 dark:text-sophisticated-text leading-relaxed overflow-y-auto max-h-[350px]">
                    <h1 className="text-sm font-bold border-b border-gray-100 dark:border-sophisticated-border pb-1.5 mb-3">{title || 'Untitled note'}</h1>
                    <div className="space-y-3 font-sans">
                      {content.split('\n').map((line, idx) => {
                        if (line.startsWith('# ')) {
                          return <h2 key={idx} className="text-xs font-bold text-gray-900 dark:text-sophisticated-text pt-2">{line.substring(2)}</h2>;
                        }
                        if (line.startsWith('## ')) {
                          return <h3 key={idx} className="text-[11px] font-bold text-gray-800 dark:text-sophisticated-text pt-1">{line.substring(3)}</h3>;
                        }
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return <li key={idx} className="ml-4 list-disc text-gray-600 dark:text-sophisticated-muted">{line.substring(2)}</li>;
                        }
                        return <p key={idx} className="text-gray-600 dark:text-sophisticated-muted">{line || '\u00A0'}</p>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 py-20 text-gray-400">
            <FileText className="w-12 h-12 text-gray-300 dark:text-zinc-700 mb-3" />
            <h4 className="text-xs font-bold text-gray-700 dark:text-sophisticated-text">No document active</h4>
            <p className="text-[10px] text-gray-400 max-w-xs mt-1 dark:text-sophisticated-muted">Select an existing note from the panel catalog, or tap plus to draft new outlines.</p>
            <button
              onClick={handleCreateNote}
              className="mt-4 px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Draft Outline
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
