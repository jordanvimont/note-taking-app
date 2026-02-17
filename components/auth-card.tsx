"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/use-notes";
import { useToast } from "@/hooks/use-toast";

export function AuthCard() {
  const { signInWithEmail, signInWithPassword, signUpWithPassword, authLoading } =
    useNotes();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeAction, setActiveAction] = useState<
    null | "signin" | "signup" | "magic"
  >(null);

  const isBusy = authLoading || activeAction !== null;
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const handleSignIn = async () => {
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Enter your email to receive a magic link.",
        variant: "destructive",
      });
      return;
    }

    setActiveAction("magic");
    try {
      await signInWithEmail(trimmedEmail);
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
      setActiveAction(null);
    }
  };

  const handlePasswordSignIn = async () => {
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Enter your email to sign in.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setActiveAction("signin");
    try {
      await signInWithPassword(trimmedEmail, trimmedPassword);
      toast({
        title: "Signed in",
        description: "Welcome back!",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign-in failed",
        description: "Check your email and password, then try again.",
        variant: "destructive",
      });
    } finally {
      setActiveAction(null);
    }
  };

  const handlePasswordSignUp = async () => {
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Enter your email to create an account.",
        variant: "destructive",
      });
      return;
    }
    if (trimmedPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setActiveAction("signup");
    try {
      await signUpWithPassword(trimmedEmail, trimmedPassword);
      toast({
        title: "Account created",
        description:
          "You can sign in now. If confirmations are required, check your email.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Sign-up failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(139,92,246,0.25),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(180deg,#12131a_0%,#151824_40%,#10121b_100%)] px-6">
      <Card className="w-full max-w-md border border-border/80 bg-card/90 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.95),rgba(59,7,100,0.95))] text-white shadow-lg shadow-purple-900/40">
              <span className="text-sm font-semibold tracking-wide">B</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Blackhawk Notes
              </p>
              <CardTitle className="text-2xl font-semibold">
                Welcome back
              </CardTitle>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in with email and password, or use a magic link.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBusy}
            className="bg-muted/40 border-border"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBusy}
            className="bg-muted/40 border-border"
          />
          <Button
            onClick={handlePasswordSignIn}
            disabled={isBusy}
            className="w-full"
          >
            {activeAction === "signin" ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            onClick={handlePasswordSignUp}
            disabled={isBusy}
            variant="outline"
            className="w-full"
          >
            {activeAction === "signup" ? "Creating account..." : "Create account"}
          </Button>
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Prefer email only?
            </p>
            <Button
              onClick={handleSignIn}
              disabled={isBusy}
              variant="secondary"
              className="w-full"
            >
              {activeAction === "magic" ? "Sending link..." : "Send magic link"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
