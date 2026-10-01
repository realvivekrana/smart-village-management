import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  X,
  MessageCircle,
  ChevronRight,
  Minimize2,
} from "lucide-react";

import { askAssistant } from "../../services/assistantService";
import { useLanguage } from "../../context/LanguageContext";

/*
|--------------------------------------------------------------------------
| Default Suggestions
|--------------------------------------------------------------------------
*/

const START_SUGGESTIONS = [
  "Latest notices dikhao",
  "Upcoming events",
  "Emergency numbers",
  "Jobs available?",
  "Certificate kaise banwayein?",
  "Complaint kaise karein?",
];

/*
|--------------------------------------------------------------------------
| Chat Assistant
|--------------------------------------------------------------------------
*/

export default function ChatAssistant() {
  const { language } = useLanguage();

  const isHi = language === "hi";

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Greeting
  |--------------------------------------------------------------------------
  */

  const greeting = isHi
    ? "नमस्ते! मैं AI सहायक हूँ। नोटिस, इवेंट, नौकरी, सेवाएं या इमरजेंसी नंबर के बारे में पूछिए।"
    : "Namaste! Main AI assistant hoon. Notices, events, jobs, services ya emergency numbers ke baare me poochiye.";

  /*
  |--------------------------------------------------------------------------
  | Scroll to latest message
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages, loading, open]);

  /*
  |--------------------------------------------------------------------------
  | Desktop auto focus only
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) return;

    const isDesktop =
      window.matchMedia?.("(min-width: 768px)")
        .matches;

    if (isDesktop) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [open]);

  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  const send = async (text) => {
    const message = String(
      text ?? input
    ).trim();

    if (!message || loading) return;

    /*
    |--------------------------------------------------------------------------
    | Chat history
    |--------------------------------------------------------------------------
    */

    const history = messages
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.text,
      }));

    /*
    |--------------------------------------------------------------------------
    | Add user message
    |--------------------------------------------------------------------------
    */

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | Ask backend AI
      |--------------------------------------------------------------------------
      */

      const data = await askAssistant(
        message,
        history
      );

      /*
      |--------------------------------------------------------------------------
      | Add assistant response
      |--------------------------------------------------------------------------
      */

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data?.reply ||
            "Sorry, mujhe response nahi mila.",

          cards: Array.isArray(data?.cards)
            ? data.cards
            : [],

          suggestions: Array.isArray(
            data?.suggestions
          )
            ? data.suggestions
            : [],

          error: data?.error || false,
        },
      ]);
    } catch (err) {
      console.error(
        "Chat Assistant Error:",
        err
      );

      const msg =
        err?.response?.data?.message ||
        (isHi
          ? "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।"
          : "Kuch gadbad ho gayi. Dobara try karein.");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: msg,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Current suggestions
  |--------------------------------------------------------------------------
  */

  const last =
    messages[messages.length - 1];

  const chips =
    messages.length === 0
      ? START_SUGGESTIONS
      : last?.suggestions || [];

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      {/* ================================================================
          FLOATING AI BUTTON
          ================================================================ */}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={
            isHi
              ? "AI सहायक खोलें"
              : "Open AI assistant"
          }
          className="
            fixed
            right-3
            bottom-[calc(4.5rem+env(safe-area-inset-bottom))]
            sm:right-5
            sm:bottom-5

            z-40

            h-11
            w-11
            sm:h-auto
            sm:w-auto

            sm:px-4
            sm:py-3

            flex
            items-center
            justify-center
            gap-2

            rounded-full

            bg-primary-600
            hover:bg-primary-700

            active:scale-95

            text-white

            shadow-lg
            hover:shadow-xl

            transition-all
            duration-200
          "
        >
          <MessageCircle
            size={20}
            className="sm:w-[22px] sm:h-[22px]"
          />

          <span
            className="
              hidden
              sm:inline
              text-sm
              font-medium
            "
          >
            {isHi
              ? "AI सहायक"
              : "Ask AI"}
          </span>
        </button>
      )}

      {/* ================================================================
          CHAT WINDOW
          ================================================================ */}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="AI assistant"
          className="
            fixed

            z-40

            right-3
            left-3

            bottom-[calc(4.5rem+env(safe-area-inset-bottom))]

            sm:left-auto
            sm:right-5
            sm:bottom-5

            w-auto
            sm:w-[380px]

            h-[60dvh]
            min-h-[390px]
            max-h-[600px]

            sm:h-[560px]

            flex
            flex-col

            overflow-hidden

            rounded-2xl
            sm:rounded-2xl

            border
            border-gray-200
            dark:border-gray-700

            bg-white
            dark:bg-gray-900

            shadow-2xl

            animate-[fadeIn_.2s_ease-out]
          "
        >
          {/* ============================================================
              HEADER
              ============================================================ */}

          <div
            className="
              shrink-0

              flex
              items-center
              justify-between

              bg-primary-600
              text-white

              px-3
              sm:px-4

              py-2.5
              sm:py-3
            "
          >
            {/* Assistant information */}

            <div
              className="
                min-w-0
                flex
                items-center
                gap-2
              "
            >
              <div
                className="
                  h-8
                  w-8
                  shrink-0

                  rounded-full

                  bg-white/15

                  flex
                  items-center
                  justify-center
                "
              >
                <Bot size={18} />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-semibold
                    leading-tight
                    truncate
                  "
                >
                  {isHi
                    ? "गाँव सहायक"
                    : "Village Assistant"}
                </p>

                <p
                  className="
                    text-[10px]
                    sm:text-[11px]

                    opacity-80

                    leading-tight
                  "
                >
                  {isHi
                    ? "लाइव जानकारी"
                    : "Live portal data"}
                </p>
              </div>
            </div>

            {/* Header buttons */}

            <div className="flex items-center gap-1">
              {/* Minimize */}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimize AI assistant"
                title="Minimize"
                className="
                  h-8
                  w-8

                  flex
                  items-center
                  justify-center

                  rounded-full

                  hover:bg-white/20
                  active:bg-white/30

                  transition
                "
              >
                <Minimize2 size={16} />
              </button>

              {/* Close */}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close AI assistant"
                title="Close"
                className="
                  h-8
                  w-8

                  flex
                  items-center
                  justify-center

                  rounded-full

                  hover:bg-white/20
                  active:bg-white/30

                  transition
                "
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ============================================================
              CHAT BODY
              ============================================================ */}

          <div
            className="
              flex-1

              min-h-0

              overflow-y-auto
              overscroll-contain

              px-2.5
              sm:px-3

              py-2.5
              sm:py-3

              space-y-2.5
              sm:space-y-3

              bg-gray-50
              dark:bg-gray-800
            "
          >
            {/* Greeting */}

            <Bubble
              role="assistant"
              text={greeting}
            />

            {/* Messages */}

            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className="space-y-2"
              >
                <Bubble
                  role={m.role}
                  text={m.text}
                  error={m.error}
                />

                {/* Cards */}

                {Array.isArray(m.cards) &&
                  m.cards.map(
                    (card, ci) => (
                      <Card
                        key={`${i}-${ci}`}
                        card={card}
                        isHi={isHi}
                        onNavigate={() =>
                          setOpen(false)
                        }
                      />
                    )
                  )}
              </div>
            ))}

            {/* Loading */}

            {loading && (
              <div
                className="
                  flex
                  gap-1

                  px-3
                  py-2

                  w-fit

                  rounded-2xl
                  rounded-bl-sm

                  bg-white
                  dark:bg-gray-700

                  border
                  border-gray-200
                  dark:border-gray-600
                "
              >
                {[0, 150, 300].map(
                  (delay) => (
                    <span
                      key={delay}
                      className="
                        h-1.5
                        w-1.5

                        sm:h-2
                        sm:w-2

                        rounded-full

                        bg-gray-400

                        animate-bounce
                      "
                      style={{
                        animationDelay: `${delay}ms`,
                      }}
                    />
                  )
                )}
              </div>
            )}

            {/* Suggestions */}

            {!loading &&
              chips.length > 0 && (
                <div
                  className="
                    flex
                    flex-wrap
                    gap-1.5

                    pt-1
                  "
                >
                  {chips.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() =>
                        send(suggestion)
                      }
                      className="
                        max-w-full

                        text-[11px]
                        sm:text-xs

                        px-2.5
                        sm:px-3

                        py-1.5

                        rounded-full

                        border
                        border-primary-300

                        text-primary-700
                        dark:text-primary-300

                        dark:border-primary-700

                        bg-white
                        dark:bg-gray-900

                        hover:bg-primary-50
                        dark:hover:bg-gray-700

                        active:scale-[0.98]

                        transition

                        break-words
                      "
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

            <div ref={endRef} />
          </div>

          {/* ============================================================
              INPUT
              ============================================================ */}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="
              shrink-0

              flex
              items-center
              gap-2

              p-2.5
              sm:p-3

              pb-[max(0.625rem,env(safe-area-inset-bottom))]

              border-t
              border-gray-200
              dark:border-gray-700

              bg-white
              dark:bg-gray-900
            "
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              maxLength={500}
              autoComplete="off"
              enterKeyHint="send"
              placeholder={
                isHi
                  ? "अपना सवाल लिखें…"
                  : "Apna sawal likhein…"
              }
              className="
                flex-1
                min-w-0

                h-10

                rounded-full

                border
                border-gray-300
                dark:border-gray-600

                bg-white
                dark:bg-gray-800

                text-gray-900
                dark:text-gray-100

                px-3.5

                text-sm

                focus:outline-none
                focus:ring-2
                focus:ring-primary-500

                placeholder:text-gray-400
              "
            />

            <button
              type="submit"
              disabled={
                !input.trim() ||
                loading
              }
              aria-label="Send message"
              title="Send"
              className="
                h-10
                w-10

                shrink-0

                flex
                items-center
                justify-center

                rounded-full

                bg-primary-600
                hover:bg-primary-700

                text-white

                disabled:opacity-40
                disabled:cursor-not-allowed

                active:scale-95

                transition
              "
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

/*
|--------------------------------------------------------------------------
| Message Bubble
|--------------------------------------------------------------------------
*/

function Bubble({
  role,
  text,
  error,
}) {
  const mine = role === "user";

  return (
    <div
      className={`flex ${
        mine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[88%]
          sm:max-w-[85%]

          rounded-2xl

          px-3
          py-2

          text-[13px]
          sm:text-sm

          leading-relaxed

          whitespace-pre-line
          break-words

          ${
            mine
              ? "bg-primary-600 text-white rounded-br-sm"
              : error
              ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-sm"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Assistant Data Card
|--------------------------------------------------------------------------
*/

function Card({
  card,
  onNavigate,
  isHi,
}) {
  if (!card) return null;

  const items = Array.isArray(
    card.items
  )
    ? card.items
    : [];

  return (
    <div
      className="
        rounded-xl

        bg-white
        dark:bg-gray-700

        border
        border-gray-200
        dark:border-gray-600

        overflow-hidden

        shadow-sm
      "
    >
      {/* Card Heading */}

      <div
        className="
          px-3
          py-1.5

          text-[10px]
          sm:text-xs

          font-semibold

          uppercase
          tracking-wide

          text-primary-700
          dark:text-primary-300

          bg-primary-50
          dark:bg-gray-600
        "
      >
        {card.heading}
      </div>

      {/* Card Items */}

      {items.length > 0 && (
        <ul
          className="
            divide-y
            divide-gray-100
            dark:divide-gray-600
          "
        >
          {items.map(
            (item, i) => {
              const body = (
                <>
                  <p
                    className="
                      text-[13px]
                      sm:text-sm

                      font-medium

                      text-gray-900
                      dark:text-gray-100

                      break-words
                    "
                  >
                    {item.title}
                  </p>

                  {Array.isArray(
                    item.lines
                  ) &&
                    item.lines.map(
                      (line, li) => (
                        <p
                          key={li}
                          className="
                            text-[11px]
                            sm:text-xs

                            text-gray-600
                            dark:text-gray-300

                            mt-0.5

                            break-words
                          "
                        >
                          {line}
                        </p>
                      )
                    )}
                </>
              );

              return (
                <li key={i}>
                  {item.link ? (
                    <Link
                      to={item.link}
                      onClick={onNavigate}
                      className="
                        block

                        px-3
                        py-2.5

                        hover:bg-gray-50
                        dark:hover:bg-gray-600

                        active:bg-gray-100
                        dark:active:bg-gray-500

                        transition
                      "
                    >
                      {body}
                    </Link>
                  ) : (
                    <div
                      className="
                        px-3
                        py-2.5
                      "
                    >
                      {body}
                    </div>
                  )}
                </li>
              );
            }
          )}
        </ul>
      )}

      {/* Card Footer */}

      {card.link && (
        <Link
          to={card.link}
          onClick={onNavigate}
          className="
            flex
            items-center
            justify-end
            gap-1

            px-3
            py-2

            text-[11px]
            sm:text-xs

            font-medium

            text-primary-700
            dark:text-primary-300

            border-t
            border-gray-100
            dark:border-gray-600

            hover:bg-gray-50
            dark:hover:bg-gray-600

            transition
          "
        >
          {items.length
            ? isHi
              ? "सब देखें"
              : "Sab dekhein"
            : isHi
            ? "पेज खोलें"
            : "Page kholein"}

          <ChevronRight
            size={14}
          />
        </Link>
      )}
    </div>
  );
}