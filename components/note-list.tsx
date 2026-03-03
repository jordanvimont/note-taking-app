"use client";

import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types/note";
import { NoteCard } from "@/components/note-card";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (notes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <p className="text-lg font-medium">No notes found</p>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 pb-8 md:hidden">
        {notes.map((note) => {
          const isActive = pathname === `/note/${note.id}`;
          return (
            <NoteCard
              key={note.id}
              note={note}
              size="lg"
              isActive={isActive}
              onSelect={(id) => router.push(`/note/${id}`)}
            />
          );
        })}
      </div>
      <ScrollArea className="hidden h-full md:block">
        <div className="space-y-3 pb-6">
          {notes.map((note) => {
            const isActive = pathname === `/note/${note.id}`;
            return (
              <NoteCard
                key={note.id}
                note={note}
                size="md"
                isActive={isActive}
                onSelect={(id) => router.push(`/note/${id}`)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}
