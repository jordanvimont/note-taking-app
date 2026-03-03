"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Note, NoteRow } from "@/types/note";
import {
  getNotes as getLocalNotes,
  getNote as getLocalNote,
  saveNote as saveLocalNote,
  deleteNote as deleteLocalNote,
} from "@/lib/storage";

type NotesContextValue = {
  user: User | null;
  authLoading: boolean;
  notes: Note[];
  allNotes: Note[];
  isLoading: boolean;
  localOnly: boolean;
  setLocalOnly: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  createNote: (title?: string) => Promise<Note>;
  updateNote: (note: Note) => Promise<Note>;
  removeNote: (id: string) => Promise<void>;
  getNote: (id: string) => Promise<Note | null>;
  signInWithEmail: (email: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshNotes: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | null>(null);

const toNote = (row: NoteRow): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  tags: row.tags ?? [],
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [localOnly, setLocalOnlyState] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const notesRef = useRef<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("notes-local-only");
    setLocalOnlyState(stored === "1");
  }, []);

  const setLocalOnly = useCallback((value: boolean) => {
    setLocalOnlyState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("notes-local-only", value ? "1" : "0");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (localOnly) {
      setUser(null);
      setAuthLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const failSafe = setTimeout(() => {
      if (!isMounted) return;
      setAuthLoading(false);
    }, 4000);

    const bootstrapAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setUser(data.session?.user ?? null);
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }

      try {
        const { data } = await supabase.auth.getUser();
        if (isMounted) {
          setUser(data.user ?? null);
        }
      } catch {
        // Ignore validation errors; session state above is enough for UI.
      }
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      clearTimeout(failSafe);
      subscription.unsubscribe();
    };
  }, [localOnly]);

  const fetchNotes = useCallback(async () => {
    if (localOnly) {
      const localNotes = getLocalNotes();
      setNotes(localNotes);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading notes:", error);
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setNotes((data ?? []).map((row) => toNote(row as NoteRow)));
    setIsLoading(false);
  }, [localOnly, user]);

  useEffect(() => {
    if (!authLoading || localOnly) {
      fetchNotes();
    }
  }, [authLoading, fetchNotes, localOnly]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const refreshNotes = useCallback(async () => {
    await fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (title: string = "Untitled Note"): Promise<Note> => {
      if (localOnly) {
        const now = new Date();
        const newNote: Note = {
          id: typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          content: "",
          tags: [],
          createdAt: now,
          updatedAt: now,
        };
        saveLocalNote(newNote);
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      }

      if (!user) {
        throw new Error("You must be signed in to create notes.");
      }

      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title,
          content: "",
          tags: [],
        })
        .select("*")
        .single();

      if (error || !data) {
        if (error) {
          console.error("Error creating note:", error);
          throw new Error(error.message || "Failed to create note.");
        }
        throw new Error("Failed to create note.");
      }

      const newNote = toNote(data as NoteRow);
      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    [localOnly, user]
  );

  const updateNote = useCallback(
    async (updatedNote: Note): Promise<Note> => {
      if (localOnly) {
        const saved: Note = {
          ...updatedNote,
          updatedAt: new Date(),
        };
        saveLocalNote(saved);
        setNotes((prev) =>
          prev
            .map((note) => (note.id === saved.id ? saved : note))
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        );
        return saved;
      }

      if (!user) {
        throw new Error("You must be signed in to update notes.");
      }

      const { data, error } = await supabase
        .from("notes")
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
          tags: updatedNote.tags,
        })
        .eq("id", updatedNote.id)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Failed to update note.");
      }

      const saved = toNote(data as NoteRow);
      setNotes((prev) =>
        prev
          .map((note) => (note.id === saved.id ? saved : note))
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      );
      return saved;
    },
    [localOnly, user]
  );

  const removeNote = useCallback(
    async (id: string): Promise<void> => {
      if (localOnly) {
        deleteLocalNote(id);
        setNotes((prev) => prev.filter((note) => note.id !== id));
        return;
      }

      if (!user) {
        throw new Error("You must be signed in to delete notes.");
      }

      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) {
        throw error;
      }

      setNotes((prev) => prev.filter((note) => note.id !== id));
    },
    [localOnly, user]
  );

  const getNote = useCallback(
    async (id: string): Promise<Note | null> => {
      const cached = notesRef.current.find((note) => note.id === id);
      if (cached) return cached;
      if (localOnly) {
        return getLocalNote(id);
      }
      if (!user) return null;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return null;
      }

      return toNote(data as NoteRow);
    },
    [localOnly, user]
  );

  const signInWithEmail = useCallback(async (email: string) => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    },
    []
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) {
        throw error;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    if (localOnly) {
      setNotes([]);
      return;
    }
    await supabase.auth.signOut();
    setNotes([]);
  }, [localOnly]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (selectedTag) {
      filtered = filtered.filter((note) => note.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [notes, searchQuery, selectedTag]);

  const value = useMemo<NotesContextValue>(
    () => ({
      user,
      authLoading,
      notes: filteredNotes,
      allNotes: notes,
      isLoading,
      localOnly,
      setLocalOnly,
      searchQuery,
      setSearchQuery,
      selectedTag,
      setSelectedTag,
      createNote,
      updateNote,
      removeNote,
      getNote,
      signInWithEmail,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshNotes,
    }),
    [
      user,
      authLoading,
      filteredNotes,
      notes,
      isLoading,
      localOnly,
      setLocalOnly,
      searchQuery,
      selectedTag,
      createNote,
      updateNote,
      removeNote,
      getNote,
      signInWithEmail,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshNotes,
    ]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return ctx;
}
