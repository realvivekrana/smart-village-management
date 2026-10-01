import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, X, MessageCircle, ChevronRight } from "lucide-react";
import { askAssistant } from "../../services/assistantService";
import { useLanguage } from "../../context/LanguageContext";

const START_SUGGESTIONS = [
  "Latest notices dikhao",
  "Upcoming events",
  "Emergency numbers",
  "Jobs available?",
  "Certificate kaise banwayein?",
  "Complaint kaise karein?",
];

export default function ChatAssistant() {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const greeting = isHi
    ? "नमस्ते! मैं गाँव का AI सहायक हूँ। नोटिस, इवेंट, नौकरी, सेवाएं या इमरजेंसी नंबर के बारे में पूछिए।"
    : "Namaste! Main gaon ka AI assistant hoon. Notices, events, jobs, services ya emergency numbers ke baare me poochiye.";

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      // Phone par auto-focus se keyboard khul kar chat dhak leta hai, isliye sirf bade screen par
      if (window.matchMedia?.("(min-width: 640px)").matches) inputRef.current?.focus();
    }
  }, [messages, loading, open]);

  const send = async (text) => {
    const message = String(text ?? input).trim();
    if (!message || loading) return;

    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askAssistant(message, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, cards: data.cards, suggestions: data.suggestions },
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (isHi ? "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।" : "Kuch gadbad ho gayi. Dobara try karein.");
      setMessages((prev) => [...prev, { role: "assistant", text: msg, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const last = messages[messages.length - 1];
  const chips = messages.length === 0 ? START_SUGGESTIONS : last?.suggestions || [];

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={isHi ? "AI सहायक खोलें" : "Open AI assistant"}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg px-4 py-3 transition"
        >
          <MessageCircle size={22} />
          <span className="hidden sm:inline text-sm font-medium">{isHi ? "AI सहायक" : "Ask AI"}</span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed z-50 bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-96 h-[85dvh] sm:h-[32rem] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between bg-primary-600 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <p className="text-sm font-semibold leading-tight">{isHi ? "गाँव सहायक" : "Village Assistant"}</p>
                <p className="text-[11px] opacity-80 leading-tight">{isHi ? "लाइव जानकारी" : "Live portal data"}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-white/20">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 dark:bg-gray-800">
            <Bubble role="assistant" text={greeting} />

            {messages.map((m, i) => (
              <div key={i} className="space-y-2">
                <Bubble role={m.role} text={m.text} error={m.error} />
                {m.cards?.map((card, ci) => (
                  <Card key={ci} card={card} isHi={isHi} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            ))}

            {loading && (
              <div className="flex gap-1 px-3 py-2 w-14 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}

            {!loading && chips.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {chips.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary-300 text-primary-700 dark:text-primary-300 dark:border-primary-700 bg-white dark:bg-gray-900 hover:bg-primary-50 dark:hover:bg-gray-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder={isHi ? "अपना सवाल लिखें…" : "Apna sawal likhein…"}
              className="flex-1 min-w-0 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send"
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full bg-primary-600 text-white disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, text, error }) {
  const mine = role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line break-words ${
          mine
            ? "bg-primary-600 text-white rounded-br-sm"
            : error
            ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Card({ card, onNavigate, isHi }) {
  return (
    <div className="rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden">
      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-gray-600">
        {card.heading}
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-600">
        {card.items.map((item, i) => {
          const body = (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              {item.lines?.map((l, li) => (
                <p key={li} className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {l}
                </p>
              ))}
            </>
          );
          return (
            <li key={i}>
              {item.link ? (
                <Link to={item.link} onClick={onNavigate} className="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600">
                  {body}
                </Link>
              ) : (
                <div className="px-3 py-2">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
      {card.link && (
        <Link
          to={card.link}
          onClick={onNavigate}
          className="flex items-center justify-end gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 border-t border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          {card.items.length ? (isHi ? "सब देखें" : "Sab dekhein") : (isHi ? "पेज खोलें" : "Page kholein")} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}