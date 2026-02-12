"use client";

import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/hooks/use-notes";
import { useMemo } from "react";

export function TagFilter() {
  const { selectedTag, setSelectedTag, allNotes } = useNotes();
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    allNotes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allNotes]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedTag === null ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => setSelectedTag(null)}
      >
        All ({allNotes.length})
      </Badge>
      {tags.map((tag) => {
        const count = allNotes.filter((note) => note.tags.includes(tag)).length;
        return (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
          >
            {tag} ({count})
          </Badge>
        );
      })}
    </div>
  );
}
