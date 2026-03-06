"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface VisionChatProps {
  businessName: string;
  onComplete: (visionSummary: string) => void;
}

export default function VisionChat({ businessName, onComplete }: VisionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Start conversation on mount (only once)
  useEffect(() => {
    if (!hasStarted && businessName) {
      setHasStarted(true);
      startConversation();
    }
  }, [businessName, hasStarted]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    console.log("Starting conversation for:", businessName);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          businessName,
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error("API error:", errText);
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      const messageId = `msg-${Date.now()}`;

      // Add empty assistant message
      setMessages([{
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }]);

      // Stream the response
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              setMessages(prev => 
                prev.map(m => m.id === messageId ? { ...m, content: assistantMessage } : m)
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // If no message was received, show fallback
      if (!assistantMessage) {
        setMessages([{
          id: messageId,
          role: "assistant",
          content: `Hey! Welcome to AI Monetizations Live! I'm so excited to learn about ${businessName}. Tell me — what does your business do, and who are the people you serve?`,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError("Connection issue — using offline mode");
      setMessages([{
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Hey there! Welcome to AI Monetizations Live! I'm excited to learn about ${businessName}. What does your business do, and who do you help?`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [businessName]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          businessName,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      const messageId = `msg-${Date.now()}-assistant`;

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }]);

      // Stream the response
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              setMessages(prev => 
                prev.map(m => m.id === messageId ? { ...m, content: assistantMessage } : m)
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Check if conversation is complete
      const lowerMsg = assistantMessage.toLowerCase();
      if (lowerMsg.includes("revenue planner") || 
          lowerMsg.includes("continue to") ||
          lowerMsg.includes("click") ||
          lowerMsg.includes("ready to choose") ||
          messages.length >= 8) {
        setIsComplete(true);
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "I apologize, I had a brief connection issue. Could you repeat that?",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Extract vision summary from conversation
  const extractVisionSummary = () => {
    return messages
      .map(m => `${m.role === "user" ? "User" : "COO"}: ${m.content}`)
      .join("\n\n");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0B0F19",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7B61FF, #FF4EDB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}>
            🤖
          </div>
          <div>
            <div style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#10B981",
              fontFamily: "'Orbitron', monospace",
              marginBottom: 2,
            }}>
              PHASE 1 — VISION INTAKE
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#F5F7FA",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              COO Agent
            </div>
            <div style={{
              fontSize: 12,
              color: "#8A8F98",
            }}>
              Building the blueprint for {businessName}
            </div>
          </div>
        </div>
        {error && (
          <div style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: 6,
            fontSize: 12,
            color: "#FBBf24",
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {messages.length === 0 && isLoading && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
            color: "#8A8F98",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <div>Connecting to COO Agent...</div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "70%",
              padding: "14px 18px",
              borderRadius: message.role === "user" 
                ? "18px 18px 4px 18px" 
                : "18px 18px 18px 4px",
              background: message.role === "user"
                ? "linear-gradient(135deg, #2F80FF, #7B61FF)"
                : "rgba(255,255,255,0.08)",
              color: "#F5F7FA",
              fontSize: 15,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {message.content || (
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "14px 18px",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Continue Button (shows when conversation is complete OR after enough messages) */}
      {(isComplete || messages.length >= 6) && (
        <div style={{
          padding: "16px 24px",
          background: "linear-gradient(135deg, #10B98120, #10B98110)",
          borderTop: "1px solid #10B981",
          display: "flex",
          justifyContent: "center",
        }}>
          <button
            onClick={() => onComplete(extractVisionSummary())}
            style={{
              padding: "16px 40px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              borderRadius: 10,
              border: "none",
              color: "#FFF",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Orbitron', monospace",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            ✅ Continue to Revenue Planner
          </button>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "16px 24px 24px",
        background: "#111624",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              padding: "14px 18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#F5F7FA",
              fontSize: 15,
              resize: "none",
              minHeight: 50,
              maxHeight: 120,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              padding: "14px 24px",
              background: input.trim() && !isLoading
                ? "linear-gradient(135deg, #FF4EDB, #7B61FF)"
                : "rgba(255,255,255,0.1)",
              borderRadius: 12,
              border: "none",
              color: input.trim() && !isLoading ? "#FFF" : "#6B7186",
              fontSize: 15,
              fontWeight: 600,
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>
        </div>
        <p style={{
          fontSize: 11,
          color: "#6B7186",
          marginTop: 10,
          textAlign: "center",
        }}>
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8A8F98;
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}
