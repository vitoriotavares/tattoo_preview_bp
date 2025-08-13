"use client"

import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/components/auth/user-profile"
import { useSession } from "@/lib/auth-client"

export default function ChatPage() {
  const { data: session, isPending } = useSession()
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  if (isPending) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <UserProfile />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Welcome, {session.user.name}!
          </span>
          <UserProfile />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground">
            Start a conversation with AI
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                : "bg-muted max-w-[80%]"
            }`}
          >
            <div className="text-sm font-medium mb-1">
              {message.role === "user" ? "You" : "AI"}
            </div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}