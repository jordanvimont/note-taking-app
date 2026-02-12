"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function CreateNoteButton() {
  const router = useRouter();
  const { createNote, user } = useNotes();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) {
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
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      className="w-full sm:w-auto"
      disabled={isCreating}
    >
      <Plus className="h-4 w-4" />
      {isCreating ? "Creating..." : "New Note"}
    </Button>
  );
}
