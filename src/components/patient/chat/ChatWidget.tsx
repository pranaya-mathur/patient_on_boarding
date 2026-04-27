"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  isGuardrail?: boolean;
  suggestedFollowUps?: string[];
};

export function ChatWidget({ token }: { token: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I can help with questions about this form, insurance uploads, or what to expect at your visit. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef(crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/intake/${token}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });

      const json = await res.json();
      if (json.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: json.data.message,
            isGuardrail: json.data.isGuardrail,
            suggestedFollowUps: json.data.suggestedFollowUps,
          },
        ]);
      } else {
        throw new Error("Failed to chat");
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble right now. Please contact the clinic directly.",
          isGuardrail: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#01696f] text-white shadow-lg transition-transform hover:scale-110 active:scale-95",
          isOpen && "hidden"
        )}
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[420px] w-[300px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#01696f] px-4 py-3 text-white">
            <span className="text-sm font-semibold">Intake Assistant</span>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "ml-auto bg-[#01696f] text-white"
                      : m.isGuardrail
                      ? "mr-auto bg-amber-50 border border-amber-200 text-amber-800"
                      : "mr-auto bg-gray-100 text-gray-800"
                  )}
                >
                  {m.content}
                </div>
                {m.role === "assistant" && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.suggestedFollowUps.map((f, j) => (
                      <button
                        key={j}
                        onClick={() => handleSend(f)}
                        className="rounded-full border border-[#01696f] px-3 py-1 text-[10px] text-[#01696f] hover:bg-[#01696f]/5 transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto bg-gray-100 text-gray-800 rounded-xl px-3 py-2 max-w-[80%] text-sm">
                <div className="flex gap-1">
                  <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce" />
                  <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1 w-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center border-t p-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-2 text-sm outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-1 text-[#01696f] disabled:opacity-40"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
