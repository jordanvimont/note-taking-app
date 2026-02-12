"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/types/note";

interface NoteEditorProps {
  note: Note;
  onChange: (content: string) => void;
}

export function NoteEditor({ note, onChange }: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note.content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      // Auto-save is handled by parent component
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Textarea
        ref={textareaRef}
        value={note.content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start writing your note in Markdown..."
        className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 text-base leading-relaxed"
      />
      <div className="text-xs text-muted-foreground px-4 py-2 border-t bg-slate-50">
        {note.content.length} characters • Press Ctrl+S to save
      </div>
    </div>
  );
}
