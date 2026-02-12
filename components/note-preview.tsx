"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Note } from "@/types/note";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotePreviewProps {
  note: Note;
}

export function NotePreview({ note }: NotePreviewProps) {
  if (!note.content.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Preview will appear here as you type...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="prose prose-sm dark:prose-invert max-w-none p-6 prose-headings:font-semibold prose-p:leading-relaxed prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {note.content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}
