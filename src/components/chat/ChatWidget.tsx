"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  suggestedFollowUps?: string[];
  isError?: boolean;
};

interface ChatWidgetProps {
  intakeToken: string;
}

export function ChatWidget({ intakeToken }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your intake assistant. I can help with the registration form, insurance uploads, or arrival logistics. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customMsg?: string) => {
    const text = (customMsg || input).trim();
    if (!text || isLoading) return;

    // Optimistic user message
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Last 6 exchanges (12 messages)
      const history = messages.slice(-12).map(({ role, content }) => ({ role, content }));

      const res = await fetch(`/api/intake/${intakeToken}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            suggestedFollowUps: data.suggestedFollowUps,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to get reply");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong, try again",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
          isOpen && "hidden"
        )}
        aria-label="Open intake assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="flex h-[480px] w-[320px] flex-col rounded-xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4"
          aria-label="Chat with intake assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-primary/5">
            <h3 className="text-sm font-semibold text-foreground">Intake Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-muted"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message List */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            role="log"
            aria-live="polite"
          >
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted/50 text-foreground border border-border/50",
                    m.isError && "border-destructive/50 bg-destructive/10 text-destructive"
                  )}
                >
                  {m.content}
                </div>
                {/* Suggested Follow-ups */}
                {m.role === "assistant" && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.suggestedFollowUps.map((chip, j) => (
                      <button
                        key={j}
                        onClick={() => handleSend(chip)}
                        className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] text-primary hover:bg-primary/10 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex mr-auto items-center gap-1.5 bg-muted/50 rounded-2xl px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t p-3 bg-background">
            <div className="relative flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                maxLength={500}
                className="w-full resize-none bg-transparent py-1.5 px-3 text-sm outline-none placeholder:text-muted-foreground max-h-[100px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground text-right">
              {input.length}/500
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
