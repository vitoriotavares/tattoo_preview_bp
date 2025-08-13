"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Copy, Check } from "lucide-react";

const STARTER_PROMPT = `I'm working with a Next.js boilerplate project that includes authentication, database integration, and AI capabilities. Here's what's already set up:

## Current Boilerplate Structure
- **Authentication**: Better Auth with Google OAuth integration
- **Database**: Drizzle ORM with PostgreSQL setup  
- **AI Integration**: Vercel AI SDK with OpenAI integration
- **UI**: shadcn/ui components with Tailwind CSS
- **Current Routes**:
  - \`/\` - Home page with setup instructions and feature overview
  - \`/dashboard\` - Protected dashboard page (requires authentication)
  - \`/chat\` - AI chat interface (requires OpenAI API key)

## Important Context
This is a **boilerplate/starter template** - all existing pages and components are meant to be examples and should be **replaced or heavily modified** to build the actual application. Don't hesitate to:

- Override existing pages completely
- Modify or replace components  
- Change the routing structure
- Update the database schema as needed
- Customize the authentication flow
- Adapt the AI integration for specific use cases

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Better Auth for authentication
- Drizzle ORM + PostgreSQL
- Vercel AI SDK
- shadcn/ui components
- Lucide React icons

## What I Want to Build
[PROJECT_DESCRIPTION]

## Request
Please help me transform this boilerplate into my actual application. Feel free to modify, replace, or completely rewrite any existing code to match my project requirements. The current implementation is just a starting point - treat it as scaffolding that can be changed as needed.`;

export function StarterPromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const finalPrompt = projectDescription.trim()
      ? STARTER_PROMPT.replace(
          "[PROJECT_DESCRIPTION]",
          projectDescription.trim()
        )
      : STARTER_PROMPT.replace("\n[PROJECT_DESCRIPTION]\n", "");

    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <Copy className="w-4 h-4 mr-2" />
          Get AI Starter Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate AI Starter Prompt</DialogTitle>
          <DialogDescription>
            Create a comprehensive prompt to help AI agents create your project
            for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="project-description"
              className="text-sm font-medium mb-2 block"
            >
              Describe your project (optional)
            </label>
            <textarea
              id="project-description"
              placeholder="e.g., A task management app for teams with real-time collaboration, project timelines, and AI-powered task prioritization..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full h-24 px-3 py-2 border rounded-md resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional: Add details about your project to get a more tailored
              prompt
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopy} className="flex-1">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Starter Prompt
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-3">
            <strong>How to use:</strong> Copy this prompt and paste it into
            Claude Code, Cursor, or any AI coding assistant to get started with
            your project.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
