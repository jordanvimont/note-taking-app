"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";

export function AuthCard() {
  const { signInWithEmail, authLoading } = useNotes();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSignIn = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast({
        title: "Email required",
        description: "Enter your email to receive a magic link.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await signInWithEmail(trimmed);
      toast({
        title: "Magic link sent",
        description: "Check your email to finish signing in.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign-in failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <Card className="w-full max-w-md border bg-white/90 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold">
            Welcome back
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in with a magic link to keep your notes private.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authLoading || isSending}
            className="bg-slate-50 border-slate-200"
          />
          <Button
            onClick={handleSignIn}
            disabled={authLoading || isSending}
            className="w-full"
          >
            {isSending ? "Sending link..." : "Send magic link"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
