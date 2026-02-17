"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNotes } from "@/hooks/use-notes";
import { Note } from "@/types/note";
import { NoteEditor } from "@/components/note-editor";
import { NotePreview } from "@/components/note-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Trash2, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "use-debounce";
import { AuthCard } from "@/components/auth-card";

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { getNote, updateNote, removeNote, user, authLoading } = useNotes();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestMode, setSuggestMode] = useState<"expand" | "cleanup" | null>(
    null
  );

  const noteId = params.id as string;

  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const loadedNote = await getNote(noteId);
      if (!isMounted) return;

      if (loadedNote) {
        setNote(loadedNote);
      } else {
        toast({
          title: "Note not found",
          description: "The note you're looking for doesn't exist.",
          variant: "destructive",
        });
        router.push("/");
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      loadNote();
    }

    return () => {
      isMounted = false;
    };
  }, [noteId, getNote, router, toast, authLoading, user]);

  const debouncedSave = useDebouncedCallback(
    (updatedNote: Note) => {
      updateNote(updatedNote).catch((error) => {
        console.error(error);
        toast({
          title: "Save failed",
          description: "Could not save your changes.",
          variant: "destructive",
        });
      });
    },
    500
  );

  const handleContentChange = useCallback(
    (content: string) => {
      if (!note) return;
      const updatedNote = { ...note, content };
      setNote(updatedNote);
      debouncedSave(updatedNote);
    },
    [note, debouncedSave]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (!note) return;
      const updatedNote = { ...note, title };
      setNote(updatedNote);
      debouncedSave(updatedNote);
    },
    [note, debouncedSave]
  );

  const handleAddTag = useCallback(
    (tag: string) => {
      if (!note) return;
      const trimmedTag = tag.trim().toLowerCase();
      if (trimmedTag && !note.tags.includes(trimmedTag)) {
        const updatedNote = {
          ...note,
          tags: [...note.tags, trimmedTag],
        };
        setNote(updatedNote);
        updateNote(updatedNote).catch((error) => {
          console.error(error);
        });
        setTagInput("");
        setShowTagInput(false);
        toast({
          title: "Tag added",
          description: `Added tag "${trimmedTag}"`,
        });
      }
    },
    [note, updateNote, toast]
  );

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      if (!note) return;
      const updatedNote = {
        ...note,
        tags: note.tags.filter((tag) => tag !== tagToRemove),
      };
      setNote(updatedNote);
      updateNote(updatedNote).catch((error) => {
        console.error(error);
      });
      toast({
        title: "Tag removed",
        description: `Removed tag "${tagToRemove}"`,
      });
    },
    [note, updateNote, toast]
  );

  const handleDelete = useCallback(() => {
    if (!note) return;
    removeNote(note.id)
      .then(() => {
        toast({
          title: "Note deleted",
          description: "The note has been permanently deleted.",
        });
        router.push("/");
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Delete failed",
          description: "Could not delete the note.",
          variant: "destructive",
        });
      });
  }, [note, removeNote, router, toast]);

  const requestSuggestion = useCallback(
    async (mode: "expand" | "cleanup") => {
      if (!note) return;
      if (!note.content.trim() && !note.title.trim()) {
        toast({
          title: "Nothing to improve",
          description: "Add some content first.",
          variant: "destructive",
        });
        return;
      }

      setIsSuggesting(true);
      setSuggestMode(mode);
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            title: note.title,
            text: note.content,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to generate suggestion.");
        }

        setSuggestion(data.suggestion ?? "");
        setShowSuggestionDialog(true);
      } catch (error) {
        console.error(error);
        toast({
          title: "AI suggestion failed",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSuggesting(false);
      }
    },
    [note, toast]
  );

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(11,31,58,0.14),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(249,115,22,0.14),transparent_55%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#fff7ed_100%)]">
      <header className="border-b border-slate-200/70 bg-white/75 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Input
              value={note.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled Note"
              className="text-xl font-semibold border-slate-200 bg-white/90 focus-visible:ring-slate-300"
            />
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestSuggestion("expand")}
                disabled={isSuggesting}
              >
                Expand
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestSuggestion("cleanup")}
                disabled={isSuggesting}
              >
                Clean Up
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
            {note.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {showTagInput ? (
              <div className="flex items-center gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTag(tagInput);
                    } else if (e.key === "Escape") {
                      setShowTagInput(false);
                      setTagInput("");
                    }
                  }}
                  placeholder="Add tag..."
                  className="h-7 w-24 bg-slate-50 border-slate-200"
                  autoFocus
                />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagInput(true)}
                className="h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Tag
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-4 px-6 pb-6 pt-4 lg:grid-cols-2">
          <Card className="h-full overflow-hidden border bg-white/90 shadow-sm">
            <CardHeader className="border-b bg-slate-50/60 py-3">
              <CardTitle className="text-sm font-semibold text-slate-600">
                Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NoteEditor note={note} onChange={handleContentChange} />
            </CardContent>
          </Card>
          <Card className="h-full overflow-hidden border bg-white/90 shadow-sm">
            <CardHeader className="border-b bg-slate-50/60 py-3">
              <CardTitle className="text-sm font-semibold text-slate-600">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NotePreview note={note} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {suggestMode === "expand"
                ? "Expanded suggestion"
                : "Cleaned-up suggestion"}
            </DialogTitle>
            <DialogDescription>
              Review the AI suggestion and apply it if you like.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/20 p-3">
            <ScrollArea className="h-64">
              <pre className="whitespace-pre-wrap text-sm text-foreground">
                {suggestion || "No suggestion returned."}
              </pre>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuggestionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!suggestion) return;
                handleContentChange(suggestion);
                setShowSuggestionDialog(false);
              }}
            >
              Apply suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
