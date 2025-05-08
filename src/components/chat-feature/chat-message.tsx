/**
 * CHAT MESSAGE COMPONENT
 *
 * This component renders individual chat messages from either the user or AI assistant.
 * It also handles displaying query results and insights when provided by the AI.
 *
 * Features:
 * - Different styles for user and assistant messages
 * - Support for displaying data tables from query results
 * - Support for displaying AI-generated insights about the data
 */
import type { Message, UIMessage } from 'ai';
import { CircleUserRound, Bot, Lightbulb } from 'lucide-react'; // Icons for user, bot, and insights
import { Results } from './results-table'; // Component for displaying data tables
import { Result } from '@/lib/type';

/**
 * Props for the ChatMessage component
 *
 * @property message - Basic message data (id, role, content)
 * @property results - Optional array of query results to display
 * @property columns - Column names for the results table
 * @property insights - Optional array of AI-generated insights
 */
interface ChatMessageProps {
  message: UIMessage;
  results: Result[];
  columns: string[];
  insights?: string[];
}

export function ChatMessage({ message, results, columns, insights }: ChatMessageProps) {
  // Determine if this is a user message or assistant message
  const isUser = message.role === 'user';

  // Check if we have data to display in a results table
  const hasResults = results && results.length > 0 && columns && columns.length > 0;

  // Check if we have insights to display
  const hasInsights = insights && insights.length > 0;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {/* Assistant avatar - only shown for assistant messages */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-600" />
        </div>
      )}

      {/* Message bubble with content and optional data displays */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-primary text-white rounded-tr-none' // User message styling
            : 'bg-neutral-100 text-neutral-800 rounded-tl-none' // Assistant message styling
        }`}
      >
        {isUser ? (
          // Simple text for user messages
          <p>{message.content}</p>
        ) : (
          // Complex content for assistant messages (text, results, insights)
          <div className="flex flex-col w-full gap-3">
            {/* Text response */}
            <p>{message.content}</p>

            {/* Results table (if there are results) */}
            {hasResults && (
              <div className="mt-2 w-full overflow-hidden">
                <Results results={results} columns={columns} />
              </div>
            )}

            {/* Insights section (if there are insights) */}
            {hasInsights && (
              <div className="mt-4 pt-3 border-t border-neutral-200">
                {/* Insights header */}
                <div className="flex items-center gap-2 mb-2 text-amber-600">
                  <Lightbulb className="h-4 w-4" />
                  <h3 className="font-medium text-sm">Key Insights</h3>
                </div>

                {/* Insights list */}
                <ul className="space-y-1 text-sm">
                  {insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="font-medium min-w-[20px]">{index + 1}.</span>
                      <p>{insight}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User avatar - only shown for user messages */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
          <CircleUserRound className="h-4 w-4 text-neutral-600" />
        </div>
      )}
    </div>
  );
}
