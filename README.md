# Note Taking App

A clean, modern note-taking application built with Next.js 14+, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- ✨ **Clean UI** - Modern, intuitive interface built with shadcn/ui
- 📝 **Markdown Support** - Write notes in Markdown with live preview
- 🏷️ **Tags System** - Organize notes with tags and filter by them
- 🔍 **Search** - Quickly find notes by title, content, or tags
- 💾 **Auto-save** - Notes are automatically saved as you type
- 🌓 **Dark Mode** - Built-in dark mode support
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Fast** - Built with Next.js App Router for optimal performance

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Create a note**: Click the "New Note" button
- **Edit notes**: Click on any note to open the editor
- **Add tags**: Click "Add Tag" in the note editor
- **Search**: Use the search bar to find notes
- **Filter by tag**: Click on any tag badge to filter notes
- **Delete notes**: Click the trash icon in the note editor

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Markdown**: react-markdown + remark-gfm
- **Storage**: Browser Local Storage
- **Icons**: Lucide React

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard/home page
│   ├── note/[id]/         # Individual note pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── note-list.tsx     # Note list component
│   ├── note-editor.tsx   # Markdown editor
│   ├── note-preview.tsx  # Markdown preview
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   ├── use-notes.tsx     # Note management hook
│   └── use-toast.ts      # Toast notifications
├── lib/                  # Utility functions
│   ├── storage.ts        # Local storage utilities
│   └── utils.ts          # General utilities
└── types/                # TypeScript types
    └── note.ts           # Note type definitions
```

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
