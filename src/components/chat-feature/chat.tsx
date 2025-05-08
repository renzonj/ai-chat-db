/**
 * MAIN CHAT COMPONENT
 *
 * A simplified chat interface that connects users with AI-powered database queries.
 * This component handles user messages, AI responses, and displays data results.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Bot } from 'lucide-react';

// Import UI components
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ChatHeader } from './chat-header';

// Import helpers and constants
import { INITIAL_MESSAGE } from '@/constants/chat-const';
import { analyzeEarthquakeData } from '@/actions/ai-query';
import { Result } from '@/lib/type';
import { JSONValue } from 'ai';

// Define our enhanced message type with metadata
interface MessageMetadata {
  messageId: string;
  results?: Result[];
  columns?: string[];
  insights?: string[];
}

export function Chat() {
  // Set up chat functionality with AI SDK, leveraging all built-in features
  const { messages, input, handleInputChange, setInput, append, setMessages, data, setData } =
    useChat();

  // Add a state to track database analysis loading
  const [isLoading, setIsLoading] = useState(false);

  // Create a reference for auto-scrolling to the bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get message metadata from the data array
  const getMessageMetadata = (messageId: string): MessageMetadata => {
    // If no data exists yet, return an object with just the messageId
    if (!data) return { messageId };

    // Find the metadata item that has a matching messageId
    const metadata = data.find(item => {
      // Make sure item is an object and has a messageId property that matches
      return (
        typeof item === 'object' &&
        item !== null &&
        'messageId' in item &&
        item.messageId === messageId
      );
    });

    // Return the found metadata, or just {messageId} if nothing was found
    return (metadata as unknown as MessageMetadata) || { messageId };
  };

  // Handle sending a new message
  const handleSubmit = async () => {
    event?.preventDefault?.();

    // Don't send empty messages or submit while already loading
    if (!input.trim() || isLoading) return;

    // Save the input
    const userQuestion = input.trim();

    try {
      // First add the user message using the append method
      // Store the result which includes updated messages
      const result = await append({
        role: 'user',
        content: userQuestion,
      });

      // Now clear input after successful append
      setInput('');

      // Show loading indicator for database analysis
      setIsLoading(true);

      // Call the database with AI to analyze the query
      const analysisResult = await analyzeEarthquakeData(userQuestion);

      // Prepare the data
      const queryResults = analysisResult.results || [];
      const columns = queryResults.length > 0 ? Object.keys(queryResults[0]) : [];
      const insights = analysisResult.insights || [];

      // Create AI response with the results
      const aiMessage = {
        role: 'assistant' as const,
        content:
          queryResults.length > 0
            ? 'Here are the results of your query:'
            : 'No results found for your query.',
        id: Date.now().toString(),
      };

      // Use the most current messages state with a callback to ensure we have the latest state
      setMessages(currentMessages => [...currentMessages, aiMessage]);

      // Store the metadata using the typed setData function from useChat
      setData(currentData => [
        ...(currentData || []),
        {
          messageId: aiMessage.id,
          results: queryResults,
          columns,
          insights,
        } as unknown as JSONValue,
      ]);
    } catch (error) {
      console.error('Error processing message:', error);

      // Add a friendly error message
      setMessages(currentMessages => [
        ...currentMessages,
        {
          role: 'assistant',
          content: `Sorry, I couldn't process that query. Please try again.`,
          id: Date.now().toString(),
        },
      ]);
    } finally {
      // Always turn off analysis loading state when done
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      {/* Chat header with title */}
      <ChatHeader />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-macos">
        {messages.length === 0 ? (
          // Empty state - show welcome message
          <div className="flex h-[calc(100%-2rem)] items-center justify-center text-neutral-400">
            <p className="text-center max-w-sm">{INITIAL_MESSAGE}</p>
          </div>
        ) : (
          // List of messages
          <>
            {messages.map(message => {
              const metadata = getMessageMetadata(message.id);
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  results={metadata.results || []}
                  columns={metadata.columns || []}
                  insights={metadata.insights}
                />
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-neutral-100 rounded-2xl px-4 py-3 rounded-tl-none max-w-[80%]">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm text-neutral-500 ml-2 animate-pulse">
                      Analyzing data...'
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Invisible element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-200 p-4">
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          // suggestions={[
          //   'What are the top 5 earthquakes by magnitude?',
          //   'What is the most common time of day for earthquakes?',
          //   'What is the average magnitude of earthquakes per month?',
          //   'What is the latest earthquake data?',
          //   'What is the most common depth of earthquakes?',
          // ]}
        />
      </div>
    </div>
  );
}
