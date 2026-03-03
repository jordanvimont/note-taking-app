 "use client";

 import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/note";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  isActive?: boolean;
  onSelect?: (id: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

 const getPreview = (content: string): string => {
   const lines = content.split("\n").filter((line) => line.trim());
   if (lines.length === 0) return "No content";
   return lines[0].substring(0, 100) + (lines[0].length > 100 ? "..." : "");
 };

export function NoteCard({
  note,
  isActive,
  onSelect,
  size = "md",
  className,
}: NoteCardProps) {
  return (
    <Card
      size={size}
      className={cn(
        "cursor-pointer border border-border bg-card/80 transition-all hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md",
        isActive && "bg-muted/40 border-primary/40 shadow-sm",
        className
      )}
      onClick={() => onSelect?.(note.id)}
    >
       <CardContent className="p-4">
         <h3 className="mb-1 line-clamp-1 text-base font-semibold">
           {note.title || "Untitled Note"}
         </h3>
         <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
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
 }
