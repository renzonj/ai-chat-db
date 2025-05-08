/**
 * CHAT HEADER COMPONENT
 *
 * This component displays the header section of the chat interface.
 * It includes decorative elements like the colored dots (mimicking macOS window controls)
 * and the application name.
 */
import { APP_NAME } from '@/constants/chat-const';
import { CircleUserRound } from 'lucide-react'; // Import the user icon from Lucide icons library

export function ChatHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-gradient-to-b from-white/90 to-white/70">
      {/* Left section with decorative window controls (red, yellow, green circles) */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" /> {/* Close button */}
          <div className="w-3 h-3 rounded-full bg-yellow-500" /> {/* Minimize button */}
          <div className="w-3 h-3 rounded-full bg-green-500" /> {/* Maximize button */}
        </div>
      </div>

      {/* Center section with app name */}
      <div className="text-sm font-medium text-neutral-700">{APP_NAME}</div>

      {/* Right section with user icon */}
      <div className="flex items-center gap-2">
        <CircleUserRound className="h-5 w-5 text-neutral-500" />
      </div>
    </div>
  );
}
