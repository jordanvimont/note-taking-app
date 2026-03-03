"use client";

import { useNotes } from "@/hooks/use-notes";
import { NoteList } from "@/components/note-list";
import { SearchBar } from "@/components/search-bar";
import { TagFilter } from "@/components/tag-filter";
import { CreateNoteButton } from "@/components/create-note-button";
import { RecordMeeting } from "@/components/record-meeting";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function Home() {
  const { notes, isLoading, user, authLoading, signOut, localOnly, setLocalOnly } =
    useNotes();

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

  if (!user && !localOnly) {
    return <AuthCard />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(139,92,246,0.25),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(180deg,#12131a_0%,#151824_40%,#10121b_100%)]">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="sm:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.95),rgba(59,7,100,0.95))] text-white shadow-lg shadow-purple-900/40">
                <span className="text-base font-semibold tracking-wide">B</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Blackhawk Notes
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture, organize, and sharpen your ideas.
            </p>
            <div className="mt-4 grid gap-2">
              <CreateNoteButton className="w-full" />
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/game">Play game</Link>
              </Button>
              {!localOnly && (
                <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
                  Sign out
                </Button>
              )}
            </div>
          </div>

          <div className="hidden items-center justify-between sm:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.95),rgba(59,7,100,0.95))] text-white shadow-lg shadow-purple-900/40">
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
              <Button
                variant={localOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setLocalOnly(!localOnly)}
              >
                {localOnly ? "Local-only: On" : "Local-only: Off"}
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/game">Play game</Link>
              </Button>
              {!localOnly && (
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-6">
          <div className="grid gap-3 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm">
            <SearchBar />
            <TagFilter />
          </div>
          <div className="mt-4">
            <RecordMeeting />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto md:overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Loading notes...</p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/80 p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">No notes yet</h2>
              <p className="mb-6 text-muted-foreground">
                Create your first note and start building your knowledge base.
              </p>
              <CreateNoteButton className="w-full sm:w-auto" />
            </div>
          </div>
        ) : (
          <div className="mx-auto h-full w-full max-w-6xl px-4 pb-6 sm:px-6">
            <NoteList notes={notes} />
          </div>
        )}
      </main>
    </div>
  );
}
