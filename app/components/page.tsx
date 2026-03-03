"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NoteCard } from "@/components/note-card";
import { useNotes } from "@/hooks/use-notes";
import type { Note } from "@/types/note";

const demoNotes: Note[] = [
  {
    id: "demo-1",
    title: "Product brainstorm",
    content: "Outline the MVP scope, define success metrics, and list open questions.",
    tags: ["product", "mvp"],
    createdAt: new Date("2026-02-20T10:00:00Z"),
    updatedAt: new Date("2026-02-26T18:10:00Z"),
  },
  {
    id: "demo-2",
    title: "Client kickoff",
    content: "Agenda: goals, timeline, decision makers, and next steps.",
    tags: ["meeting", "client", "ops", "priority"],
    createdAt: new Date("2026-02-12T14:30:00Z"),
    updatedAt: new Date("2026-02-17T09:45:00Z"),
  },
];

export default function ComponentsPage() {
  const { allNotes, isLoading, authLoading } = useNotes();
  const notesForShowcase = allNotes.length > 0 ? allNotes.slice(0, 2) : demoNotes;
  const showSampleNotes = allNotes.length === 0;
  const totalNotes = allNotes.length;
  const uniqueTags = new Set(allNotes.flatMap((note) => note.tags ?? []));
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const notesThisWeek = allNotes.filter((note) => note.updatedAt >= weekStart).length;
  const totalRecordings = allNotes.filter(
    (note) =>
      note.title?.startsWith("Meeting ") || note.content.includes("## Transcript")
  ).length;
  const numberFormat = new Intl.NumberFormat();

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_15%_-10%,rgba(139,92,246,0.25),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(180deg,#12131a_0%,#151824_40%,#10121b_100%)] px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Component Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Reusable UI components for Blackhawk Notes.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to notes</Link>
          </Button>
        </div>

        <Separator className="my-8" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card size="lg" className="border border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle>Large Card</CardTitle>
              <CardDescription>Roomy layout for featured content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Use this when you want breathing room and emphasis.</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <Badge>Primary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </CardFooter>
          </Card>

          <Card size="sm" className="border border-border/80 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle>Compact Card</CardTitle>
              <CardDescription>Tight layout for quick information.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Keep this short. Ideal for dashboard stats or callouts.
              </p>
            </CardContent>
            <CardFooter className="justify-between text-xs text-muted-foreground">
              <span>Updated just now</span>
              <Button size="sm" variant="secondary">View</Button>
            </CardFooter>
          </Card>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-xl font-semibold">Stats Cards</h2>
          <p className="text-sm text-muted-foreground">
            Compact metrics cards for dashboards and summaries.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card size="sm" className="border border-border/80 bg-card/80 shadow-sm">
              <CardHeader className="space-y-2">
                <CardDescription>Total notes</CardDescription>
                <CardTitle className="text-3xl">
                  {authLoading || isLoading ? "—" : numberFormat.format(totalNotes)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                {authLoading || isLoading
                  ? "Loading..."
                  : `${numberFormat.format(notesThisWeek)} added in 7 days`}
              </CardContent>
            </Card>
            <Card size="sm" className="border border-border/80 bg-card/80 shadow-sm">
              <CardHeader className="space-y-2">
                <CardDescription>Total recordings</CardDescription>
                <CardTitle className="text-3xl">
                  {authLoading || isLoading
                    ? "—"
                    : numberFormat.format(totalRecordings)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                Counts notes titled “Meeting …” or containing a transcript.
              </CardContent>
            </Card>
            <Card size="sm" className="border border-border/80 bg-card/80 shadow-sm">
              <CardHeader className="space-y-2">
                <CardDescription>Tags used</CardDescription>
                <CardTitle className="text-3xl">
                  {authLoading || isLoading
                    ? "—"
                    : numberFormat.format(uniqueTags.size)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                Unique tags across all notes.
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-xl font-semibold">Button Sizes</h2>
          <p className="text-sm text-muted-foreground">
            Consistent button sizing for quick visual hierarchy.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="xs" variant="secondary">XS</Button>
            <Button size="sm" variant="secondary">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">XL</Button>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Variants
            </h3>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div>
          <h2 className="text-xl font-semibold">Note Cards</h2>
          <p className="text-sm text-muted-foreground">
            This is the reusable note card used in the note list.
            {showSampleNotes && " Showing sample notes because none are loaded yet."}
          </p>
          <div className="mt-4 grid gap-4">
            {notesForShowcase.map((note, index) => (
              <NoteCard key={note.id} note={note} isActive={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
