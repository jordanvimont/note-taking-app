import { Note, NoteStorage } from "@/types/note";

const STORAGE_KEY = "note-taking-app-notes";
const STORAGE_VERSION = "1.0.0";

function getStorage(): NoteStorage {
  if (typeof window === "undefined") {
    return { notes: [], version: STORAGE_VERSION };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { notes: [], version: STORAGE_VERSION };
    }

    const parsed: NoteStorage = JSON.parse(stored);
    
    // Convert date strings back to Date objects
    const notes = parsed.notes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
    }));

    return { ...parsed, notes };
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return { notes: [], version: STORAGE_VERSION };
  }
}

function saveStorage(storage: NoteStorage): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error("Storage quota exceeded. Please delete some notes.");
    }
    throw error;
  }
}

export function getNotes(): Note[] {
  const storage = getStorage();
  return storage.notes.sort((a, b) => 
    b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export function getNote(id: string): Note | null {
  const notes = getNotes();
  return notes.find((note) => note.id === id) || null;
}

export function saveNote(note: Note): void {
  const storage = getStorage();
  const existingIndex = storage.notes.findIndex((n) => n.id === note.id);

  if (existingIndex >= 0) {
    storage.notes[existingIndex] = note;
  } else {
    storage.notes.push(note);
  }

  saveStorage(storage);
}

export function deleteNote(id: string): void {
  const storage = getStorage();
  storage.notes = storage.notes.filter((note) => note.id !== id);
  saveStorage(storage);
}

export function searchNotes(query: string): Note[] {
  if (!query.trim()) {
    return getNotes();
  }

  const lowerQuery = query.toLowerCase();
  const notes = getNotes();

  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getNotesByTag(tag: string): Note[] {
  const notes = getNotes();
  return notes.filter((note) => note.tags.includes(tag));
}

export function getAllTags(): string[] {
  const notes = getNotes();
  const tagSet = new Set<string>();
  
  notes.forEach((note) => {
    note.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}
