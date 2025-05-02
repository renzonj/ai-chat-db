"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { useChat } from "@ai-sdk/react"
import { INITIAL_MESSAGE } from "@/constants/chat-const"

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[80vh] rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-macos">
        {messages.length === 0 ? (
          <div className="flex h-[calc(100%-2rem)] items-center justify-center text-neutral-400">
            <p className="text-center max-w-sm">{INITIAL_MESSAGE}</p>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-200 p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={status === "streaming"}
        />
      </div>
    </div>
  )
}
