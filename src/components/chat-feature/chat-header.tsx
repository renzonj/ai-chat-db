import { APP_NAME } from "@/constants/chat-const"
import { CircleUserRound } from "lucide-react"

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-b from-white/90 to-white/70">
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>

      <div className="text-sm font-medium text-neutral-700">{APP_NAME}</div>

      <div className="flex items-center gap-2">
        <CircleUserRound className="h-5 w-5 text-neutral-500" />
      </div>
    </div>
  )
}
