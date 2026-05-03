import React from 'react';
import { Note, Folder } from '../types';
import { Plus, Folder as FolderIcon, FileText, Search, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  notes: Note[];
  folders: Folder[];
  onCreateNote: () => void;
  onOpenNote: (note: Note) => void;
}

export default function Home({ notes, folders, onCreateNote, onOpenNote }: HomeProps) {
  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl">
             <svg viewBox="0 0 24 24" className="w-8 h-8 fill-black">
              <path d="M12,2C10.89,2 10,2.89 10,4C10,5.11 10.89,6 12,6C13.11,6 14,5.11 14,4C14,2.89 13.11,2 12,2M12,8C9.79,8 8,9.79 8,12C8,14.21 9.79,16 12,16C14.21,16 16,14.21 16,12C16,9.79 14.21,8 12,8M12,18C10.34,18 9,19.34 9,21C9,22.66 10.34,24 12,24C13.66,24 15,22.66 15,21C15,19.34 13.66,18 12,18Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">My DigiSchool</h1>
        </div>
        <button 
          onClick={onCreateNote}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
        >
          <Plus size={20} /> New Note
        </button>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <FolderIcon size={20} className="text-gray-400" /> Folders
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <motion.div
              key={folder.id}
              whileHover={{ y: -5 }}
              className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg mb-4" style={{ backgroundColor: folder.color }} />
              <p className="font-medium">{folder.name}</p>
            </motion.div>
          ))}
          <div className="border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center p-6 cursor-pointer hover:bg-zinc-900 transition-colors">
            <Plus className="text-zinc-600" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock size={20} className="text-gray-400" /> Recent Notes
          </h2>
          <div className="flex bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
            <Search size={18} className="text-zinc-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-zinc-950 rounded-3xl border border-zinc-900">
            <FileText size={48} className="text-zinc-800 mb-4" />
            <p className="text-zinc-500">No notes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.sort((a,b) => b.updatedAt - a.updatedAt).map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => onOpenNote(note)}
                className="bg-zinc-900 p-1 rounded-2xl border border-zinc-800 cursor-pointer overflow-hidden group"
              >
                <div className="h-40 bg-zinc-950 rounded-xl mb-4 overflow-hidden relative">
                  {note.previewImage ? (
                    <img src={note.previewImage} alt={note.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full canvas-container opacity-20" />
                  )}
                </div>
                <div className="px-5 pb-5">
                  <h3 className="font-semibold mb-1">{note.title}</h3>
                  <p className="text-xs text-zinc-500">Last updated {new Date(note.updatedAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
