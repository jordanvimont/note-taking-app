"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Mic, Square, Loader2 } from "lucide-react";

const MAX_DURATION_MS = 60 * 60 * 1000;
const MAX_BYTES = 24 * 1024 * 1024;
const AUDIO_BITS_PER_SECOND = 32000;

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getSupportedMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function RecordMeeting() {
  const { createNote, updateNote } = useNotes();
  const { toast } = useToast();
  const router = useRouter();
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bytesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopReasonRef = useRef<"user" | "size" | "time">("user");

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      });

      recorderRef.current = recorder;
      chunksRef.current = [];
      bytesRef.current = 0;
      stopReasonRef.current = "user";
      setElapsedMs(0);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          bytesRef.current += event.data.size;
          if (bytesRef.current >= MAX_BYTES) {
            stopReasonRef.current = "size";
            stopRecording();
          }
        }
      };

      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (blob.size === 0) {
          toast({
            title: "No audio captured",
            description: "Please try recording again.",
            variant: "destructive",
          });
          return;
        }

        await transcribeAndCreateNote(blob);
      };

      recorder.start(1000);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setElapsedMs((prev) => {
          const next = prev + 1000;
          if (next >= MAX_DURATION_MS) {
            stopReasonRef.current = "time";
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      toast({
        title: "Microphone blocked",
        description: "Allow microphone access to record meetings.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const buildNoteContent = (summary: {
    action_items?: string[];
    summary?: string;
    transcript: string;
  }) => {
    const actionItems = summary.action_items?.length
      ? summary.action_items
      : ["Review transcript for next steps."];
    const summaryText =
      summary.summary?.trim() || "Summary could not be generated.";

    return [
      "## Action Items",
      actionItems.map((item) => `- [ ] ${item}`).join("\n"),
      "",
      "## Summary",
      summaryText,
      "",
      "## Transcript",
      summary.transcript.trim(),
      "",
    ].join("\n");
  };

  const transcribeAndCreateNote = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      if (stopReasonRef.current === "size") {
        toast({
          title: "Recording stopped",
          description: "Audio reached the 24MB limit.",
        });
      } else if (stopReasonRef.current === "time") {
        toast({
          title: "Recording stopped",
          description: "Recording reached the 60-minute limit.",
        });
      }

      const file = new File([blob], `meeting-${Date.now()}.webm`, {
        type: blob.type || "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", file);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) {
        throw new Error(transcribeData?.error ?? "Transcription failed.");
      }

      const transcript = transcribeData.text as string;
      let title = `Meeting ${new Date().toLocaleString()}`;
      let action_items: string[] = [];
      let summary = "";

      const summaryRes = await fetch("/api/meeting-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) {
        title = summaryData.title || title;
        action_items = summaryData.action_items || [];
        summary = summaryData.summary || "";
      }

      const note = await createNote(title);
      const content = buildNoteContent({
        action_items,
        summary,
        transcript,
      });
      await updateNote({ ...note, content, updatedAt: new Date() });

      toast({
        title: "Meeting note created",
        description: "Your transcript and summary are ready.",
      });
      router.push(`/note/${note.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Recording failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold">
            Record meeting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Press start, talk, then stop to generate a note with action items.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Max 60 minutes · 24MB
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button variant="destructive" onClick={stopRecording}>
              <Square className="h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button onClick={startRecording} disabled={isProcessing}>
              <Mic className="h-4 w-4" />
              Start recording
            </Button>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {isRecording ? `Recording ${formatTime(elapsedMs)}` : "Not recording"}
        </div>
      </CardContent>
    </Card>
  );
}
