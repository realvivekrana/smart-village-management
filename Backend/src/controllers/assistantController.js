const assistantService = require("../services/assistantService");
const { getActiveVillageName } = require("../utils/villageHelper");

/* POST /assistant/chat  { message, history?: [{role, content}] }  (public; login optional) */
const chat = async (req, res, next) => {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message : "";
    if (!message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .filter((m) => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }))
      : [];

    const villageName = await getActiveVillageName();
    const data = await assistantService.ask({ message, history, user: req.user || null, villageName });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* GET /assistant/suggestions */
const suggestions = (req, res) =>
  res.status(200).json({ success: true, data: { suggestions: assistantService.SUGGESTIONS } });

module.exports = { chat, suggestions };