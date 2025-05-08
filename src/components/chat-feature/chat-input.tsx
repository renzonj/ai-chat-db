/**
 * CHAT INPUT COMPONENT
 *
 * This component renders the input field and send button that allows users
 * to type and submit messages in the chat interface.
 *
 * Features:
 * - Text input field with placeholder
 * - Send button that's disabled when no text is entered
 * - Loading state handling
 * - Suggestion buttons for quick responses
 */
'use client'; // This directive indicates this is a Client Component in Next.js

import type React from 'react';
import { ChevronDown, SendHorizontal } from 'lucide-react'; // Import the send icon
import type { FormEvent } from 'react';

/**
 * Props for the ChatInput component
 *
 * @property input - Current value of the input field
 * @property handleInputChange - Function to call when input changes
 * @property handleSubmit - Function to call when form is submitted
 * @property isLoading - Boolean indicating whether a request is in progress
 * @property suggestions - Optional array of text suggestions to display
 */
interface ChatInputProps {
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  suggestions?: string[];
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  suggestions,
  isLoading,
}: ChatInputProps) {
  // Handler for when a suggestion is selected
  const handleSuggestionClick = (suggestion: string) => {
    // Create a synthetic change event to update the input
    const syntheticEvent = {
      target: { value: suggestion },
    };

    handleInputChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Dataset and model selection */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-row items-center text-sm font-medium text-neutral-700">
          <label htmlFor="dataset" className="text-primary mr-2">
            Dataset:
          </label>
          <select
            id="dataset"
            className="bg-neutral-100 border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none focus:border-primary"
            defaultValue="philvolcs"
          >
            <option value="philvolcs">Philvolcs Earthquake</option>
          </select>
        </div>
        <div className="flex flex-row items-center text-sm font-medium text-neutral-700">
          <label htmlFor="model" className="text-primary mr-2">
            Model:
          </label>
          <select
            id="model"
            className="bg-neutral-100 border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none focus:border-primary"
            defaultValue="gpt-3.5-turbo"
          >
            <option value="gpt-4o">gpt-4o</option>
          </select>
        </div>
      </div>

      {/* Suggestion buttons */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 cursor-pointer">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full text-sm transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        {/* Input field for user messages */}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Message..."
          className="w-full rounded-full py-3 px-4 pr-12 bg-neutral-100 focus:bg-white focus:border-primary border border-transparent focus:outline-none transition-colors"
          disabled={isLoading} // Disable input while loading
        />

        {/* Send button - positioned absolutely within the input */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()} // Disable when loading or input is empty
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-neutral-500 hover:text-neutral-700 disabled:opacity-50 transition-colors"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
