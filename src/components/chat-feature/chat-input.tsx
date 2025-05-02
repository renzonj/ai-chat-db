"use client"

import type React from "react"

import { SendHorizontal } from "lucide-react"
import type { FormEvent } from "react"

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Message..."
        className="w-full rounded-full py-3 px-4 pr-12 bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 focus:outline-none transition-colors"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-neutral-500 hover:text-neutral-700 disabled:opacity-50 transition-colors"
      >
        <SendHorizontal className="h-5 w-5" />
      </button>
    </form>
  )
}
