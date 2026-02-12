"use client";

import { useNotes } from "@/hooks/use-notes";
import { NoteList } from "@/components/note-list";
import { SearchBar } from "@/components/search-bar";
import { TagFilter } from "@/components/tag-filter";
import { CreateNoteButton } from "@/components/create-note-button";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth-card";

export default function Home() {
  const { notes, isLoading, user, authLoading, signOut } = useNotes();

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthCard />;
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
              <p className="text-sm text-muted-foreground">
                Capture ideas, refine thoughts, and keep everything organized.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateNoteButton />
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-6 pb-6">
          <div className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm">
            <SearchBar />
            <TagFilter />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Loading notes...</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-7 w-7 text-slate-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No notes yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first note and start building your knowledge base.
              </p>
              <CreateNoteButton />
            </div>
          </div>
        ) : (
          <div className="mx-auto h-full w-full max-w-6xl px-6 pb-6">
            <NoteList notes={notes} />
          </div>
        )}
      </main>
    </div>
  );
}
