/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import Home from './components/Home';
import NoteEditor from './components/NoteEditor';
import { Note, Folder } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Mathematics', color: '#ff4444' },
    { id: '2', name: 'Science', color: '#44ff44' },
    { id: '3', name: 'History', color: '#4444ff' },
  ]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('digischool_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNote = (note: Note) => {
    const updatedNotes = notes.some(n => n.id === note.id)
      ? notes.map(n => n.id === note.id ? note : n)
      : [...notes, note];
    
    setNotes(updatedNotes);
    localStorage.setItem('digischool_notes', JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untilted Note',
      folderId: null,
      content: JSON.stringify([]),
      updatedAt: Date.now(),
    };
    setActiveNote(newNote);
    setCurrentView('editor');
  };

  const handleOpenNote = (note: Note) => {
    setActiveNote(note);
    setCurrentView('editor');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveNote(null);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen flex flex-col"
        >
          {currentView === 'home' ? (
            <Home 
              notes={notes} 
              folders={folders} 
              onCreateNote={handleCreateNote} 
              onOpenNote={handleOpenNote}
            />
          ) : (
            activeNote && (
              <NoteEditor 
                note={activeNote} 
                onSave={saveNote} 
                onBack={handleBackToHome} 
              />
            )
          )}
        </motion.main>
      )}
    </div>
  );
}

