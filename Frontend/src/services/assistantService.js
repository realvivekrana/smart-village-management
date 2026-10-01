import api from "./api";

/*
|--------------------------------------------------------------------------
| Smart Village Management
| Assistant Service - FRONTEND
|--------------------------------------------------------------------------
|
| Ye file backend ke AI Assistant API ko call karti hai.
|
| Backend:
| POST /assistant/chat
| GET  /assistant/suggestions
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Default Suggestions
|--------------------------------------------------------------------------
*/

export const DEFAULT_SUGGESTIONS = [
  "Latest notices dikhao",
  "Upcoming events",
  "Emergency numbers",
  "Jobs available?",
  "Certificate kaise banwayein?",
  "Complaint kaise karein?",
];

/*
|--------------------------------------------------------------------------
| Helper: Normalize Assistant Response
|--------------------------------------------------------------------------
*/

const normalizeResponse = (response) => {
  const body = response?.data;

  /*
   * Expected backend format:
   *
   * {
   *   success: true,
   *   data: {
   *     reply: "...",
   *     cards: [],
   *     suggestions: []
   *   }
   * }
   */

  const data = body?.data || body || {};

  return {
    reply:
      typeof data.reply === "string" && data.reply.trim()
        ? data.reply
        : "Sorry, mujhe abhi response nahi mila.",

    cards: Array.isArray(data.cards)
      ? data.cards
      : [],

    suggestions: Array.isArray(data.suggestions)
      ? data.suggestions
      : [],
  };
};

/*
|--------------------------------------------------------------------------
| Ask Assistant
|--------------------------------------------------------------------------
|
| Usage:
|
| const result = await askAssistant(
|   "Latest notices dikhao",
|   history
| );
|
|--------------------------------------------------------------------------
*/

export const askAssistant = async (
  message,
  history = []
) => {
  const cleanMessage = String(message || "").trim();

  /*
  |--------------------------------------------------------------------------
  | Empty message
  |--------------------------------------------------------------------------
  */

  if (!cleanMessage) {
    return {
      reply: "Kuch poochhiye, main madad karunga.",
      cards: [],
      suggestions: DEFAULT_SUGGESTIONS,
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Prepare chat history
  |--------------------------------------------------------------------------
  */

  const cleanHistory = Array.isArray(history)
    ? history
        .filter((item) => {
          return (
            item &&
            typeof item.content === "string" &&
            item.content.trim() &&
            (item.role === "user" ||
              item.role === "assistant")
          );
        })
        .slice(-6)
        .map((item) => ({
          role: item.role,
          content: item.content.trim().slice(0, 1000),
        }))
    : [];

  try {
    /*
    |--------------------------------------------------------------------------
    | Send request to backend
    |--------------------------------------------------------------------------
    */

    const response = await api.post(
      "/assistant/chat",
      {
        message: cleanMessage.slice(0, 500),
        history: cleanHistory,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Normalize response
    |--------------------------------------------------------------------------
    */

    return normalizeResponse(response);
  } catch (error) {
    console.error(
      "Assistant API Error:",
      error?.response?.data || error
    );

    /*
    |--------------------------------------------------------------------------
    | Get backend error message
    |--------------------------------------------------------------------------
    */

    const status = error?.response?.status;

    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data?.data?.message;

    /*
    |--------------------------------------------------------------------------
    | Friendly error messages
    |--------------------------------------------------------------------------
    */

    let messageText =
      "Assistant se connect nahi ho pa raha hai. Kripya thodi der baad dobara try karein.";

    if (status === 401) {
      messageText =
        "Assistant use karne ke liye login required ho sakta hai.";
    } else if (status === 403) {
      messageText =
        "Aapko assistant use karne ki permission nahi hai.";
    } else if (status === 404) {
      messageText =
        "Assistant API endpoint nahi mila. Backend route check karein.";
    } else if (status >= 500) {
      messageText =
        "Server par assistant me problem aa rahi hai. Thodi der baad try karein.";
    } else if (backendMessage) {
      messageText = backendMessage;
    }

    /*
    |--------------------------------------------------------------------------
    | Return safe response
    |--------------------------------------------------------------------------
    |
    | Isse UI blank/crash nahi hogi.
    |--------------------------------------------------------------------------
    */

    return {
      reply: messageText,
      cards: [],
      suggestions: DEFAULT_SUGGESTIONS,
      error: true,
      status,
    };
  }
};

/*
|--------------------------------------------------------------------------
| Get Assistant Suggestions
|--------------------------------------------------------------------------
*/

export const getAssistantSuggestions = async () => {
  try {
    const response = await api.get(
      "/assistant/suggestions"
    );

    const body = response?.data;

    const suggestions =
      body?.data?.suggestions ||
      body?.suggestions;

    if (Array.isArray(suggestions)) {
      return suggestions;
    }

    return DEFAULT_SUGGESTIONS;
  } catch (error) {
    console.error(
      "Assistant Suggestions Error:",
      error?.response?.data || error
    );

    return DEFAULT_SUGGESTIONS;
  }
};

/*
|--------------------------------------------------------------------------
| Format History
|--------------------------------------------------------------------------
|
| Agar ChatAssistant me history ka format different hai,
| ye helper usko backend-compatible format me convert karega.
|--------------------------------------------------------------------------
*/

export const formatAssistantHistory = (
  messages = []
) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((item) => {
      return (
        item &&
        (item.content ||
          item.message ||
          item.text)
      );
    })
    .map((item) => {
      const role =
        item.role === "assistant" ||
        item.sender === "assistant"
          ? "assistant"
          : "user";

      const content =
        item.content ||
        item.message ||
        item.text ||
        "";

      return {
        role,
        content: String(content).trim(),
      };
    })
    .filter((item) => item.content)
    .slice(-6);
};

/*
|--------------------------------------------------------------------------
| Get a single assistant response safely
|--------------------------------------------------------------------------
*/

export const getAssistantReply = async (
  message,
  history = []
) => {
  const result = await askAssistant(
    message,
    history
  );

  return result?.reply || "";
};

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

const assistantService = {
  askAssistant,
  getAssistantSuggestions,
  formatAssistantHistory,
  getAssistantReply,
};

export default assistantService;