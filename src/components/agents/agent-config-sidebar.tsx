"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Bot,
  Copy,
  Maximize2,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isActive, setIsActive] = useState(false);

  const copyUuid = () => {
    navigator.clipboard.writeText(uuid);
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
      <div className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-card backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Agent UUID
        </p>
        <div className="mt-2 flex gap-2">
          <Input
            readOnly
            value={uuid}
            className="rounded-xl font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={copyUuid}
            className="shrink-0 rounded-xl"
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-card backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Mic className="size-4 text-primary" />
            <span className="text-sm font-semibold">Voice & Chat</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
            >
              <Maximize2 className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-[320px] flex-1 flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/50">
                <Bot className="size-8 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No messages yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Start chatting with your agent!
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground"
                  )}
                >
                  {msg.content}
                </motion.div>
              ))}
            </div>
          )}

          <div className="border-t border-border/40 p-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="rounded-xl"
                disabled={!isActive}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!isActive || !input.trim()}
                className="shrink-0 rounded-xl"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <Button
              onClick={handleStart}
              className={cn(
                "mt-3 w-full rounded-xl",
                isActive
                  ? "bg-emerald-600 hover:bg-emerald-600/90"
                  : "bg-emerald-600 hover:bg-emerald-600/90"
              )}
            >
              <Sparkles className="size-4" />
              {isActive ? "Session Active" : "Start"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
