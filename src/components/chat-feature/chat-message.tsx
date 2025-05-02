import type { Message } from "ai"
import { CircleUserRound, Bot } from "lucide-react"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser ? "bg-blue-500 text-white rounded-tr-none" : "bg-neutral-100 text-neutral-800 rounded-tl-none"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
            <div className="flex items-center gap-2">
                <p>{message.content}</p>
            </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
          <CircleUserRound className="h-4 w-4 text-neutral-600" />
        </div>
      )}
    </div>
  )
}
