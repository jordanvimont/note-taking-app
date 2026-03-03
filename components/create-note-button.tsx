"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CreateNoteButton({ className }: { className?: string }) {
  const router = useRouter();
  const { createNote, user, localOnly } = useNotes();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const formatCreateError = (error: unknown) => {
    let message = "Please try again.";
    if (typeof error === "string") {
      message = error;
    } else if (error instanceof Error) {
      message = error.message || message;
    } else if (error && typeof error === "object") {
      const maybe = error as { message?: string; details?: string; hint?: string };
      message = maybe.message || maybe.details || maybe.hint || message;
    }

    const lower = message.toLowerCase();
    if (
      lower.includes("row-level security") ||
      lower.includes("permission denied") ||
      lower.includes("not authorized")
    ) {
      return "Supabase policy blocked this insert. Add an insert policy for authenticated users on the notes table.";
    }
    if (lower.includes("relation") && lower.includes("notes") && lower.includes("does not exist")) {
      return "Supabase table 'notes' is missing. Create the notes table first.";
    }

    return message;
  };

  const handleCreate = async () => {
    if (!user && !localOnly) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create notes.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const newNote = await createNote();
      router.push(`/note/${newNote.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Could not create note",
        description: formatCreateError(error),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      className={cn("w-full sm:w-auto", className)}
      disabled={isCreating}
    >
      <Plus className="h-4 w-4" />
      {isCreating ? "Creating..." : "New Note"}
    </Button>
  );
}
