import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  // ✅ Use the correct model name (e.g., gemini-1.5-flash or gemini-1.5-pro)
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  // ✅ Correct API URL
  const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "Hello Gemini! Can you say Hi back?" }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error calling Gemini API:", err);
  }
}

testGemini();
