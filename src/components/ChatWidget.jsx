import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RobotAvatar from "./RobotAvatar";
import "./ChatWidget.css";

const API_BASE = import.meta.env.VITE_CHATBOT_API || "http://localhost:8000";
const SESSION_KEY = "chat-session-id";
const OFFLINE_TEXT =
  "The assistant is waking up or offline — try again in a moment.";

const SUGGESTIONS = [
  "Who is Akshay?",
  "His projects?",
  "Skills?",
  "Contact info?",
];

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Convert markdown links [text](url) and bare URLs into clickable anchors.
 * Line breaks are preserved via `white-space: pre-wrap` in CSS.
 */
function linkify(text) {
  if (!text) return null;
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;
  const nodes = [];
  let last = 0;
  let key = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const label = match[1] || match[3];
    const href = match[2] || match[3];
    nodes.push(
      <a key={`l${key++}`} href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Focus the composer when the panel opens; close on Escape.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Abort any in-flight stream on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);

  async function sendMessage(raw) {
    const content = raw.trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);

    const botId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: content },
      { id: botId, role: "assistant", text: "", pending: true },
    ]);

    const patchBot = (updater) =>
      setMessages((prev) =>
        prev.map((msg) => (msg.id === botId ? updater(msg) : msg))
      );

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: getSessionId(), message: content }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        streamDone = done;
        if (value) buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the trailing partial line unless the stream has ended.
        buffer = streamDone ? "" : lines.pop();
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          let event;
          try {
            event = JSON.parse(line.slice(5).trim());
          } catch {
            continue;
          }
          if (event.type === "token" && event.content) {
            patchBot((msg) => ({
              ...msg,
              pending: false,
              text: msg.text + event.content,
            }));
          } else if (event.type === "done") {
            patchBot((msg) => ({
              ...msg,
              pending: false,
              sources: Array.isArray(event.sources) ? event.sources : [],
            }));
          } else if (event.type === "error") {
            patchBot((msg) => ({
              ...msg,
              pending: false,
              text:
                msg.text ||
                event.message ||
                "Something went wrong — please try again.",
            }));
          }
        }
      }

      // Stream ended without producing any text.
      patchBot((msg) =>
        msg.text ? { ...msg, pending: false } : { ...msg, pending: false, text: OFFLINE_TEXT }
      );
    } catch (err) {
      if (err?.name !== "AbortError") {
        patchBot((msg) => ({
          ...msg,
          pending: false,
          text: msg.text || OFFLINE_TEXT,
        }));
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Drive the mascot's animation from the conversation state.
  const lastMsg = messages[messages.length - 1];
  const mascotState = !busy
    ? "idle"
    : lastMsg && lastMsg.role === "assistant" && lastMsg.text
      ? "talking"
      : "thinking";

  return (
    <>
      <motion.button
        type="button"
        className={`chat-fab ${open ? "is-open" : ""}`}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -3, scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
      >
        {open ? (
          <svg
            width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <RobotAvatar size={40} state={mascotState} className="chat-fab-robot" />
        )}
        <span className="chat-fab-dot" aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="chat-panel"
            role="dialog"
            aria-label="AI assistant chat"
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
          >
            <header className="chat-head">
              <div className="chat-head-badge">
                <RobotAvatar size={38} state={mascotState} />
              </div>
              <div className="chat-head-titles">
                <span className="chat-head-title">Ask about Akshay</span>
                <span className="chat-head-sub">
                  <span className="chat-head-status" />
                  {mascotState === "thinking"
                    ? "thinking…"
                    : mascotState === "talking"
                      ? "typing…"
                      : "AI assistant · online"}
                </span>
              </div>
              <button
                type="button"
                className="chat-close"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="chat-scroll" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="chat-empty">
                  <p className="chat-empty-hi">
                    Hi! I can answer questions about Akshay&apos;s work,
                    projects and background.
                  </p>
                  <div className="chat-chips">
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="chat-chip"
                        onClick={() => sendMessage(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`chat-msg ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="chat-msg-avatar">
                      <RobotAvatar
                        size={30}
                        state={msg.pending && !msg.text ? "thinking" : "idle"}
                      />
                    </div>
                  )}
                  <div className="chat-msg-body">
                  {msg.pending && !msg.text ? (
                    <span className="chat-typing" aria-label="Assistant is typing">
                      <span />
                      <span />
                      <span />
                    </span>
                  ) : (
                    <div className="chat-msg-text">{linkify(msg.text)}</div>
                  )}
                  </div>
                </div>
              ))}
            </div>

            <form className="chat-composer" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Ask me anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Type your question"
              />
              <button
                type="submit"
                className="chat-send"
                aria-label="Send message"
                disabled={busy || !input.trim()}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
