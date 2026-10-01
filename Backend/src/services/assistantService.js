const Village = require("../models/Village");
const Notice = require("../models/Notice");
const Event = require("../models/Event");
const Service = require("../models/Service");
const Job = require("../models/Job");
const Business = require("../models/Business");
const EmergencyContact = require("../models/EmergencyContact");
const GovernmentContact = require("../models/GovernmentContact");
const VillageFeature = require("../models/VillageFeature");
const Complaint = require("../models/Complaint");
const escapeRegex = require("../utils/escapeRegex");
const { APPROVED_ONLY, notExpired } = require("../utils/publicVisibility");

/*
| AI Assistant (live data)
| Sawal -> intent -> sirf public, approved data DB se -> jawab + links.
| ANTHROPIC_API_KEY set ho to jawab LLM se aur natural banta hai,
| warna ye rule-based engine bina kisi paid key ke chalta hai.
*/

const LIMIT = 4;

const INTENTS = [
  { key: "emergency", words: ["emergency", "ambulance", "police", "fire", "sos", "helpline", "hospital", "doctor", "आपातकाल", "एम्बुलेंस", "पुलिस", "अस्पताल", "इमरजेंसी", "दमकल"] },
  { key: "notice", words: ["notice", "notices", "announcement", "suchna", "सूचना", "नोटिस", "घोषणा"] },
  { key: "event", words: ["event", "events", "mela", "program", "festival", "utsav", "कार्यक्रम", "मेला", "उत्सव", "इवेंट"] },
  { key: "job", words: ["job", "jobs", "naukri", "vacancy", "rozgar", "work", "hiring", "नौकरी", "रोजगार", "रोज़गार", "वैकेंसी", "काम"] },
  { key: "business", words: ["business", "shop", "dukan", "store", "market", "vyapar", "दुकान", "व्यापार", "बाजार", "कारोबार"] },
  { key: "service", words: ["service", "certificate", "apply", "document", "documents", "fee", "license", "praman", "सेवा", "प्रमाण", "आवेदन", "दस्तावेज", "सर्टिफिकेट", "लाइसेंस"] },
  { key: "scheme", words: ["scheme", "yojana", "subsidy", "scholarship", "pension", "mandi", "kisan", "farmer", "योजना", "छात्रवृत्ति", "पेंशन", "मंडी", "किसान"] },
  { key: "government", words: ["government", "officer", "bdo", "tehsil", "panchayat", "sarkari", "department", "सरकारी", "अधिकारी", "पंचायत", "तहसील", "विभाग"] },
  { key: "complaint", words: ["complaint", "complain", "shikayat", "problem", "issue", "grievance", "शिकायत", "समस्या"] },
  { key: "village", words: ["village", "gaon", "population", "sarpanch", "about", "history", "facilities", "reach", "गाँव", "गांव", "आबादी", "सरपंच", "इतिहास", "सुविधा"] },
];

const GREETINGS = ["hi", "hello", "hey", "namaste", "namaskar", "नमस्ते", "नमस्कार", "हेलो", "हाय"];

const STOP = new Set([
  "latest", "upcoming", "available", "new", "all", "list", "dikhao", "chahiye", "hain",
  "the", "a", "an", "is", "are", "of", "in", "for", "me", "my", "to", "and", "or", "what", "how", "where", "when",
  "show", "tell", "about", "please", "ka", "ki", "ke", "hai", "hain", "kya", "mujhe", "batao", "bataiye", "dikhao",
  "kaise", "kahan", "kab", "mein", "me", "se", "ko", "ek", "koi", "है", "का", "की", "के", "में", "क्या", "मुझे", "बताओ", "बताइए", "कैसे", "कहाँ",
]);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

const detectIntents = (tokens, raw) => {
  const lower = String(raw).toLowerCase();
  const found = [];
  for (const intent of INTENTS) {
    const hit = intent.words.some((w) => tokens.includes(w) || (w.length > 3 && lower.includes(w)));
    if (hit) found.push(intent.key);
  }
  return found;
};

const keywordRegex = (tokens) => {
  const kws = tokens.filter((t) => t.length > 2).slice(0, 6);
  return kws.length ? new RegExp(kws.map(escapeRegex).join("|"), "i") : null;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/* ---------- Data fetchers: har ek { title, lines[], link } wale cards deta hai ---------- */

const fetchers = {
  async emergency(rx) {
    const filter = { isActive: true };
    if (rx) filter.$or = [{ name: rx }, { designation: rx }, { category: rx }, { description: rx }];
    let rows = await EmergencyContact.find(filter).sort({ order: 1 }).limit(8).lean();
    if (!rows.length && rx) rows = await EmergencyContact.find({ isActive: true }).sort({ order: 1 }).limit(8).lean();
    return {
      heading: "Emergency contacts",
      link: "/emergency",
      items: rows.map((r) => ({
        title: r.name,
        lines: [r.designation, r.phone && `📞 ${r.phone}`, r.address].filter(Boolean),
      })),
    };
  },

  async notice(rx) {
    const filter = { isActive: true, ...APPROVED_ONLY, ...notExpired() };
    if (rx) filter.$and = [{ $or: [{ title: rx }, { content: rx }, { category: rx }] }];
    const rows = await Notice.find(filter).sort({ publishedAt: -1 }).limit(LIMIT).lean();
    return {
      heading: "Latest notices",
      link: "/notices",
      items: rows.map((n) => ({
        title: n.title,
        lines: [`${n.category} • ${fmtDate(n.publishedAt)}`, String(n.content).slice(0, 110) + (n.content.length > 110 ? "…" : "")],
        link: `/notices/${n._id}`,
      })),
    };
  },

  async event(rx) {
    const filter = { isActive: true, ...APPROVED_ONLY, endDate: { $gte: new Date() } };
    if (rx) filter.$or = [{ title: rx }, { description: rx }, { category: rx }, { location: rx }];
    const rows = await Event.find(filter).sort({ startDate: 1 }).limit(LIMIT).lean();
    return {
      heading: "Upcoming events",
      link: "/events",
      items: rows.map((e) => ({
        title: e.title,
        lines: [`📅 ${fmtDate(e.startDate)}`, `📍 ${e.location}`],
        link: `/events/${e._id}`,
      })),
    };
  },

  async job(rx) {
    const filter = { isActive: true, applyBy: { $gte: new Date() } };
    if (rx) filter.$or = [{ title: rx }, { company: rx }, { category: rx }, { description: rx }];
    const rows = await Job.find(filter).sort({ applyBy: 1 }).limit(LIMIT).lean();
    return {
      heading: "Open jobs",
      link: "/jobs",
      items: rows.map((j) => {
        const s = j.salary || {};
        const pay = s.min || s.max ? `₹${[s.min, s.max].filter(Boolean).join(" - ")} ${String(s.period || "").replace("_", " ")}` : "";
        return {
          title: j.title,
          lines: [j.company, pay, `Apply by ${fmtDate(j.applyBy)}`].filter(Boolean),
          link: `/jobs/${j._id}`,
        };
      }),
    };
  },

  async business(rx) {
    const filter = { isActive: true, ...APPROVED_ONLY, status: "approved" };
    if (rx) filter.$or = [{ name: rx }, { category: rx }, { description: rx }];
    const rows = await Business.find(filter).sort({ isFeatured: -1, createdAt: -1 }).limit(LIMIT).lean();
    return {
      heading: "Local businesses",
      link: "/businesses",
      items: rows.map((b) => ({
        title: b.name,
        lines: [b.category, b.phone && `📞 ${b.phone}`].filter(Boolean),
        link: `/businesses/${b._id}`,
      })),
    };
  },

  async service(rx) {
    const filter = { isActive: true };
    if (rx) filter.$or = [{ name: rx }, { description: rx }, { category: rx }];
    const rows = await Service.find(filter).sort({ isFeatured: -1 }).limit(3).lean();
    return {
      heading: "Services",
      link: "/services",
      items: rows.map((s) => ({
        title: s.name,
        lines: [
          s.fees?.isFree === false ? `Fee: ₹${s.fees.amount}` : "Free",
          s.processingTime && `⏱ ${s.processingTime}`,
          s.requiredDocuments?.length && `Documents: ${s.requiredDocuments.slice(0, 4).join(", ")}`,
          s.howToApply && `How to apply: ${String(s.howToApply).slice(0, 140)}`,
        ].filter(Boolean),
        link: `/services/${s._id}`,
      })),
    };
  },

  async scheme(rx) {
    const filter = { isPublished: true, status: "active" };
    if (rx) filter.$or = [{ title: rx }, { schemeName: rx }, { shortDescription: rx }, { category: rx }];
    const rows = await VillageFeature.find(filter).sort({ createdAt: -1 }).limit(LIMIT).lean();
    return {
      heading: "Schemes & village services",
      link: "/village-services",
      items: rows.map((f) => ({
        title: f.schemeName || f.title,
        lines: [
          f.shortDescription,
          f.eligibility && `Eligibility: ${String(f.eligibility).slice(0, 120)}`,
          f.helplineNumber && `📞 ${f.helplineNumber}`,
          f.lastDate && `Last date: ${fmtDate(f.lastDate)}`,
        ].filter(Boolean),
      })),
    };
  },

  async government(rx) {
    const filter = {};
    if (rx) filter.$or = [{ name: rx }, { designation: rx }, { department: rx }, { office: rx }];
    const rows = await GovernmentContact.find(filter).limit(LIMIT).lean();
    return {
      heading: "Government contacts",
      link: "/government-contacts",
      items: rows.map((g) => ({
        title: g.name,
        lines: [`${g.designation}, ${g.department}`, g.phone && `📞 ${g.phone}`, g.office].filter(Boolean),
      })),
    };
  },

  async complaint() {
    return {
      heading: "File a complaint",
      link: "/citizen/complaints/create",
      items: [
        {
          title: "Complaint kaise karein",
          lines: [
            "1. Login karein (citizen account).",
            "2. 'Complaints' → 'Create' par jaayein.",
            "3. Category (road, water, electricity…) chunein, problem likhein.",
            "4. Submit karein aur 'My Complaints' me status track karein.",
          ],
          link: "/citizen/complaints/create",
        },
      ],
    };
  },

  async village() {
    const v = await Village.findOne({ isActive: true }).lean();
    if (!v) return { heading: "Village", link: "/about", items: [] };
    return {
      heading: v.name,
      link: "/about",
      items: [
        {
          title: `${v.name}${v.localName ? ` (${v.localName})` : ""}`,
          lines: [
            [v.block, v.district, v.state].filter(Boolean).join(", "),
            v.population && `👥 Population: ${v.population}`,
            v.sarpanch?.name && `Sarpanch: ${v.sarpanch.name}${v.sarpanch.phone ? ` (${v.sarpanch.phone})` : ""}`,
            v.facilities?.length && `Facilities: ${v.facilities.slice(0, 8).join(", ")}`,
            v.description && String(v.description).slice(0, 200),
          ].filter(Boolean),
        },
      ],
    };
  },
};

/* ---------- Complaint status (sirf logged-in user ke apne) ---------- */

const myComplaints = async (user) => {
  const rows = await Complaint.find({ submittedBy: user._id }).sort({ createdAt: -1 }).limit(LIMIT).lean();
  return {
    heading: "Your recent complaints",
    link: "/citizen/complaints",
    items: rows.map((c) => ({ title: c.title, lines: [`Status: ${c.status}`, `Priority: ${c.priority}`] })),
  };
};

const SUGGESTIONS = [
  "Latest notices dikhao",
  "Upcoming events",
  "Emergency numbers",
  "Jobs available?",
  "Certificate kaise banwayein?",
  "Complaint kaise karein?",
];

/* ---------- Optional LLM polish ---------- */

const callLLM = async ({ question, cards, villageName, history }) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || typeof fetch !== "function") return null;

  const context = cards
    .map((c) => `## ${c.heading}\n` + c.items.map((i) => `- ${i.title}: ${i.lines.join(" | ")}`).join("\n"))
    .join("\n\n");

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: process.env.ASSISTANT_MODEL || "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system:
          `You are the helpful assistant of the ${villageName} village portal. Answer ONLY from the DATA given. ` +
          `If the data does not have the answer, say so and suggest the relevant portal page. ` +
          `Reply in the same language/script the user wrote in (Hindi, Hinglish or English). Be short (max 5 lines), friendly, no markdown tables.`,
        messages: [
          ...history.slice(-4),
          { role: "user", content: `DATA:\n${context || "(no matching data)"}\n\nQUESTION: ${question}` },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.find((b) => b.type === "text")?.text?.trim() || null;
  } catch (e) {
    return null;
  }
};

const isHindiText = (s) => /[\u0900-\u097F]/.test(s);

const ask = async ({ message, history = [], user = null, villageName = "Village" }) => {
  const text = String(message || "").trim().slice(0, 500);
  const tokens = tokenize(text);
  const hi = isHindiText(text);

  if (!text) return { reply: "Kuch poochhiye, main madad karunga.", cards: [], suggestions: SUGGESTIONS };

  if (tokens.length && tokens.every((t) => GREETINGS.includes(t))) {
    return {
      reply: hi
        ? `नमस्ते! मैं ${villageName} का सहायक हूँ। नोटिस, इवेंट, नौकरी, सेवाएं, इमरजेंसी नंबर, कुछ भी पूछिए।`
        : `Namaste! Main ${villageName} ka assistant hoon. Notices, events, jobs, services, emergency numbers — kuch bhi poochiye.`,
      cards: [],
      suggestions: SUGGESTIONS,
    };
  }

  let intents = detectIntents(tokens, text);
  const isMyComplaintQuery =
    intents.includes("complaint") && /(my|meri|mera|status|track|मेरी|स्थिति)/i.test(text);

  const intentWords = new Set(INTENTS.flatMap((i) => i.words));
  const rx = keywordRegex(tokens.filter((t) => !intentWords.has(t)));

  intents = intents.slice(0, 2);
  const cards = [];

  for (const key of intents) {
    try {
      if (key === "complaint" && isMyComplaintQuery && user) {
        cards.push(await myComplaints(user));
        continue;
      }
      // pehle keyword se filter, khali mile to bina filter ke latest
      let card = await fetchers[key](rx);
      if (!card.items.length && rx) card = await fetchers[key](null);
      if (card.items.length) cards.push(card);
    } catch (e) {
      /* ek fetcher fail ho to baaki chalte rahen */
    }
  }

  // Koi intent nahi mila: poore portal me keyword search
  if (!cards.length && !intents.length && rx) {
    for (const key of ["service", "scheme", "notice", "event", "job", "business"]) {
      try {
        const card = await fetchers[key](rx);
        if (card.items.length) cards.push(card);
        if (cards.length >= 2) break;
      } catch (e) {}
    }
  }

  if (isMyComplaintQuery && !user) {
    return {
      reply: "Apni complaints ka status dekhne ke liye pehle login karein.",
      cards: [{ heading: "Login", link: "/login", items: [] }],
      suggestions: SUGGESTIONS,
    };
  }

  if (!cards.length) {
    return {
      reply: hi
        ? "माफ़ कीजिए, इस बारे में मुझे अभी जानकारी नहीं मिली। नीचे दिए सवाल आज़मा सकते हैं, या Contact पेज से संपर्क करें।"
        : "Sorry, is baare me mujhe abhi koi jaankari nahi mili. Neeche diye sawal try karein, ya Contact page se sampark karein.",
      cards: [],
      suggestions: SUGGESTIONS,
    };
  }

  const llm = await callLLM({ question: text, cards, villageName, history });
  const reply =
    llm ||
    (hi
      ? `ये रहा आपके सवाल का जवाब (${cards.map((c) => c.heading).join(", ")}):`
      : `Ye rahi aapke sawal se judi jaankari (${cards.map((c) => c.heading).join(", ")}):`);

  return { reply, cards, suggestions: [] };
};

module.exports = { ask, SUGGESTIONS };