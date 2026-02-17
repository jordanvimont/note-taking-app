"use client";

import { useRouter, usePathname } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getPreview = (content: string): string => {
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return "No content";
    return lines[0].substring(0, 100) + (lines[0].length > 100 ? "..." : "");
  };

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
    <ScrollArea className="h-full">
      <div className="space-y-3 pb-6">
        {notes.map((note) => {
          const isActive = pathname === `/note/${note.id}`;
          return (
            <Card
              key={note.id}
              className={cn(
                "cursor-pointer border border-border bg-card/80 transition-all hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md",
                isActive && "bg-muted/40 border-primary/40 shadow-sm"
              )}
              onClick={() => router.push(`/note/${note.id}`)}
            >
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1 mb-1 text-base">
                  {note.title || "Untitled Note"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {getPreview(note.content)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(note.updatedAt, "MMM d")}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
