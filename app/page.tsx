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
    <div className="flex min-h-screen flex-col bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(11,31,58,0.14),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(249,115,22,0.14),transparent_55%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#fff7ed_100%)]">
      <header className="border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.95),rgba(11,31,58,0.95))] text-white shadow-lg shadow-orange-200/40">
              <span className="text-base font-semibold tracking-wide">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Blackhawk Notes
              </h1>
              <p className="text-sm text-muted-foreground">
                Capture, organize, and sharpen your ideas.
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
          <div className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
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
            <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <FileText className="h-7 w-7 text-slate-500" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No notes yet</h2>
              <p className="mb-6 text-muted-foreground">
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
