"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useNotes();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-9 bg-muted/40 border-border focus-visible:ring-primary/40"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
