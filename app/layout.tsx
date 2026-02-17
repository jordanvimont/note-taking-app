import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NotesProvider } from "@/hooks/use-notes";

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blackhawk Notes",
  description: "Capture, organize, and sharpen your ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.className} bg-background text-foreground antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NotesProvider>{children}</NotesProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
