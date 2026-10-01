import api from "./api";

/* POST /assistant/chat -> { reply, cards[], suggestions[] } */
export const askAssistant = async (message, history = []) => {
  const res = await api.post("/assistant/chat", { message, history });
  return res.data.data;
};

export const getAssistantSuggestions = async () => {
  const res = await api.get("/assistant/suggestions");
  return res.data.data.suggestions;
};