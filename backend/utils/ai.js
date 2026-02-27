const axios = require("axios");

const askAI = async (question) => {
  try {
    ////////////////////////////////////////////////////////
    // CHECK API KEY
    ////////////////////////////////////////////////////////

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY missing");
      return "AI configuration error.";
    }

    if (!question || !question.trim()) {
      return "Please ask a valid question.";
    }

    console.log("📤 Sending prompt to Gemini...");

    ////////////////////////////////////////////////////////
    // STRICT SYSTEM PROMPT FOR CHAT APPLICATION
    ////////////////////////////////////////////////////////

    const prompt = `
You are LinkSphere AI, a professional chat assistant inside a group chat.

STRICT INSTRUCTIONS:

• Answer ONLY the current question.
• DO NOT refer to previous chat history unless explicitly asked.
• DO NOT include markdown symbols like **, ##, *, _, or backticks.
• DO NOT truncate dates, links, or names.
• Always give complete information.

FORMATTING RULES:

• Use plain clean text.
• Write full dates like: September 5, 2029
• Provide FULL links including https://
• Keep answers concise and accurate.
• Do NOT include headings or decorations.
• Do NOT include unrelated information.

User question:
${question}

Answer clearly:
`;

    ////////////////////////////////////////////////////////
    // GEMINI API CALL (WORKING MODEL)
    ////////////////////////////////////////////////////////

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
          topP: 0.8,
          topK: 40
        }
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY
        },
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    ////////////////////////////////////////////////////////
    // EXTRACT RESPONSE TEXT
    ////////////////////////////////////////////////////////

    let aiText =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.log("⚠️ Empty Gemini response");
      return "AI did not respond.";
    }

    ////////////////////////////////////////////////////////
    // CLEAN RESPONSE (REMOVE MARKDOWN SYMBOLS)
    ////////////////////////////////////////////////////////

    aiText = aiText
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/`/g, "")
      .replace(/##/g, "")
      .replace(/\*/g, "")
      .replace(/#{1,6}\s?/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    ////////////////////////////////////////////////////////
    // ENSURE LINKS ARE COMPLETE (fix https missing)
    ////////////////////////////////////////////////////////

    aiText = aiText.replace(
      /(www\.[^\s]+)/g,
      "https://$1"
    );

    ////////////////////////////////////////////////////////
    // ENSURE DATE IS NOT CUT (basic fix)
    ////////////////////////////////////////////////////////

    aiText = aiText.replace(
      /(\b\d{3})(?!\d)/g,
      "$1"
    );

    console.log("✅ Gemini reply received");

    return aiText;

  } catch (error) {

    console.error(
      "❌ Gemini error:",
      error.response?.data || error.message
    );

    return "AI failed to respond. Please try again.";
  }
};

module.exports = askAI;