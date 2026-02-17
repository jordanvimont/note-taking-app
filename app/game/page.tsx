"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Obstacle = {
  x: number;
  w: number;
  h: number;
};

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let lastTime = 0;
    let elapsedSinceSpawn = 0;
    let isGameOver = false;
    let currentScore = 0;
    let best = bestScore;

    const colors = {
      sky: "#12131a",
      ground: "#1b1d28",
      groundLine: "#2c2f3f",
      player: "#a855f7",
      playerShadow: "#6d28d9",
      obstacle: "#14b8a6",
      obstacleTop: "#0f766e",
      text: "#f1f5f9",
      muted: "#94a3b8",
    };

    let width = 0;
    let height = 0;

    const player = {
      x: 64,
      y: 0,
      w: 34,
      h: 44,
      vy: 0,
      onGround: false,
    };

    let obstacles: Obstacle[] = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      width = Math.max(320, container.clientWidth);
      height = 260;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resetGame();
    };

    const resetGame = () => {
      const groundY = height - 32;
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
      obstacles = [];
      elapsedSinceSpawn = 0;
      isGameOver = false;
      currentScore = 0;
      setScore(0);
      setIsRunning(true);
      lastTime = performance.now();
    };

    const spawnObstacle = () => {
      const minH = 28;
      const maxH = 56;
      const h = Math.floor(minH + Math.random() * (maxH - minH));
      const w = Math.floor(18 + Math.random() * 18);
      obstacles.push({ x: width + 30, w, h });
    };

    const jump = () => {
      if (!player.onGround || isGameOver) return;
      player.vy = -460;
      player.onGround = false;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        jump();
      }
      if (event.code === "KeyR") {
        event.preventDefault();
        resetGame();
      }
    };

    const handlePointerDown = () => {
      jump();
    };

    const update = (dt: number) => {
      const gravity = 1400;
      const groundY = height - 32;
      const speed = 260 + Math.min(220, currentScore * 2);

      player.vy += gravity * dt;
      player.y += player.vy * dt;
      if (player.y + player.h >= groundY) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.onGround = true;
      }

      elapsedSinceSpawn += dt;
      const spawnDelay = 1.1 + Math.random() * 0.7;
      if (elapsedSinceSpawn >= spawnDelay) {
        spawnObstacle();
        elapsedSinceSpawn = 0;
      }

      obstacles = obstacles
        .map((obs) => ({ ...obs, x: obs.x - speed * dt }))
        .filter((obs) => obs.x + obs.w > -20);

      const hit = obstacles.some((obs) => {
        const obsY = groundY - obs.h;
        return (
          player.x < obs.x + obs.w &&
          player.x + player.w > obs.x &&
          player.y < obsY + obs.h &&
          player.y + player.h > obsY
        );
      });

      if (hit) {
        isGameOver = true;
        setIsRunning(false);
        if (currentScore > best) {
          best = currentScore;
          setBestScore(best);
        }
      }

      currentScore += dt * 10;
      setScore(Math.floor(currentScore));
    };

    const draw = () => {
      const groundY = height - 32;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = colors.sky;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = colors.ground;
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = colors.groundLine;
      ctx.fillRect(0, groundY, width, 2);

      ctx.fillStyle = colors.playerShadow;
      ctx.fillRect(player.x + 4, player.y + 6, player.w, player.h);
      ctx.fillStyle = colors.player;
      ctx.fillRect(player.x, player.y, player.w, player.h);

      obstacles.forEach((obs) => {
        const obsY = groundY - obs.h;
        ctx.fillStyle = colors.obstacleTop;
        ctx.fillRect(obs.x, obsY, obs.w, obs.h);
        ctx.fillStyle = colors.obstacle;
        ctx.fillRect(obs.x, obsY + 8, obs.w, obs.h - 8);
      });

      ctx.fillStyle = colors.text;
      ctx.font = "600 16px Sora, system-ui, sans-serif";
      ctx.fillText(`Score: ${Math.floor(currentScore)}`, 16, 26);
      ctx.fillStyle = colors.muted;
      ctx.font = "500 13px Sora, system-ui, sans-serif";
      ctx.fillText(`Best: ${Math.floor(best)}`, 16, 46);

      if (isGameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = colors.text;
        ctx.font = "700 24px Sora, system-ui, sans-serif";
        ctx.fillText("Game Over", width / 2 - 70, height / 2 - 8);
        ctx.fillStyle = colors.muted;
        ctx.font = "500 14px Sora, system-ui, sans-serif";
        ctx.fillText("Press R to restart", width / 2 - 70, height / 2 + 18);
      }
    };

    const loop = (time: number) => {
      const dt = Math.min(0.032, (time - lastTime) / 1000);
      lastTime = time;
      if (!isGameOver) {
        update(dt);
      }
      draw();
      animationId = requestAnimationFrame(loop);
    };

    resizeCanvas();
    animationId = requestAnimationFrame(loop);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationId);
    };
  }, [bestScore]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Blackhawk Notes
            </p>
            <h1 className="text-3xl font-semibold">Runner Mini Game</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Press Space (or click) to jump. Avoid the blocks.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">Back to notes</Link>
            </Button>
            <Button
              onClick={() => setIsRunning(true)}
              className="bg-primary text-primary-foreground"
            >
              {isRunning ? "Running" : "Start"}
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="rounded-3xl border border-border/80 bg-card/80 p-4 shadow-lg"
        >
          <canvas ref={canvasRef} className="w-full rounded-2xl" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Score: {score}</span>
            <span>Best: {bestScore}</span>
            <span>Tip: Press R to restart</span>
          </div>
        </div>
      </div>
    </div>
  );
}
