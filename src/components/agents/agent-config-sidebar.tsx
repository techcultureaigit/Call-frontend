"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bot,
  Check,
  Copy,
  Maximize2,
  MessageSquare,
  Mic,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/agent";

interface AgentConfigSidebarProps {
  uuid: string;
  agentName: string;
}

export function AgentConfigSidebar({
  uuid,
  agentName,
}: AgentConfigSidebarProps) {
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUuid = () => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("UUID copied");
  };

  const handleStart = () => {
    setIsActive(true);
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "agent",
          content: `Hi! I'm ${agentName || "your agent"}. How can I help you test today?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    toast.success("Session started");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          content:
            "Thanks for your message! This is a preview response from your configured agent.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 600);
  };

  return (
    <aside className="space-y-4 lg:sticky lg:top-4">
      {/* UUID card */}
      <div className="rounded-[6px] border border-border/70 bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Agent UUID
          </p>
          <span className="size-2 rounded-full bg-brand/40 ring-4 ring-brand/10" />
        </div>
        <div className="mt-2.5 flex gap-2">
          <code
            suppressHydrationWarning
            className="flex h-10 min-w-0 flex-1 items-center truncate rounded-lg border border-border/70 bg-muted/40 px-3 font-mono text-xs text-muted-foreground"
          >
            {uuid}
          </code>
          <Button
            variant="outline"
            size="icon"
            onClick={copyUuid}
            className="size-10 shrink-0"
            aria-label="Copy UUID"
          >
            {copied ? (
              <Check className="size-3.5 text-brand" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Voice & Chat preview */}
      <div className="flex flex-col overflow-hidden rounded-[6px] border border-border/70 bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-inset ring-brand/15">
              <Mic className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Voice &amp; Chat</p>
              <p className="text-[11px] text-muted-foreground">Live preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Preview mode"
              className="inline-flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5"
            >
              {(
                [
                  { id: "voice", label: "Voice", icon: Mic },
                  { id: "chat", label: "Chat", icon: MessageSquare },
                ] as const
              ).map((opt) => {
                const isSelected = mode === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setMode(opt.id)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      isSelected
                        ? "text-brand"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="vc-mode-toggle"
                        className="absolute inset-0 rounded-md bg-card shadow-subtle ring-1 ring-inset ring-border/70"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon className="relative size-3.5" />
                    <span className="relative">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Expand"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[340px] flex-1 flex-col bg-dotted">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 animate-pulse rounded-[6px] bg-brand/10 blur-xl" />
                <div className="relative flex size-16 items-center justify-center rounded-[6px] border border-border/70 bg-card shadow-elevated">
                  <Bot className="size-8 text-brand/70" />
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Ready to test
              </p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                Start a session to chat with your configured agent in real time.
              </p>
            </div>
          ) : (
            <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[90%] rounded-[6px] px-3.5 py-2 text-sm shadow-subtle",
                    msg.role === "user"
                      ? "ml-auto rounded-br-md brand-gradient text-brand-foreground"
                      : "rounded-bl-md border border-border/60 bg-card text-foreground"
                  )}
                >
                  {msg.content}
                </motion.div>
              ))}
            </div>
          )}

          <div className="border-t border-border/50 bg-card/80 p-3 backdrop-blur">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  mode === "voice"
                    ? "Speak or type to test..."
                    : "Type your message..."
                }
                disabled={!isActive}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!isActive || !input.trim()}
                className="size-10 shrink-0"
                aria-label="Send"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <Button
              onClick={handleStart}
              variant={isActive ? "outline" : "default"}
              className="mt-3 w-full"
            >
              {isActive ? (
                <>
                  <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                  Session Active
                </>
              ) : (
                <>
                  <Phone className="size-4" />
                  Start test session
                  <Sparkles className="size-3.5 opacity-70" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
