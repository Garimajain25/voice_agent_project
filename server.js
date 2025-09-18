// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ---- ENV & defaults --------------------------------------------------------
const API_KEY = (process.env.OPENAI_API_KEY || "").trim();
const DEFAULT_INSTRUCTIONS = process.env.DEFAULT_INSTRUCTIONS || 
  "You are a helpful, concise voice assistant. Keep responses brief and natural for voice conversation.";

if (!API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY is missing. Set it in .env (no quotes/spaces).");
  console.warn("   Create a .env file with: OPENAI_API_KEY=your_api_key_here");
} else {
  console.log("✅ API Key found (length:", API_KEY.length, "characters)");
}
console.log("Voice Agent ready with GPT-4o-mini");

// ---- Static frontend --------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "gpt-voice-agent.html"))
);
app.get("/health", (_req, res) => res.send("OK"));


// ---- Chat endpoint for gpt voice agent ----------------------------
app.post("/chat", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const { message, instructions, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation context
    const messages = [
      { role: "system", content: instructions || DEFAULT_INSTRUCTIONS },
      ...(history || []),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,  //Tells OpenAI who you are and that you're authorized
        "Content-Type": "application/json"     //Tells OpenAI what type of data you're sending
      },
      body: JSON.stringify({    //Converts: JavaScript object → JSON string
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Image Generation endpoint --------------------------------------------
app.post("/generate-image", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required" });
    }

    console.log("Generating image for prompt:", prompt);

    // an API call to OpenAI's DALL-E image generation service
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"    //Tells OpenAI we're sending JSON
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,  //The text description from user
        n: 1,  ///Number of images to generate
        size: "1024x1024",  //Image dimensions in pixels
        quality: "standard",
        style: "natural"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DALL-E API error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    //DALL-E API response
    const data = await response.json();  //Converts: JSON string → JavaScript object
    const imageUrl = data.data[0]?.url;  //Accesses the URL of the image

    if (!imageUrl) {
      return res.status(500).json({ error: "No image URL received" });
    }

    res.json({ 
      imageUrl: imageUrl,
      prompt: prompt,  //The text description from user
      revisedPrompt: data.data[0]?.revised_prompt || prompt  //Accesses the revised prompt from the API response
    });

  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Text-to-Speech endpoint ----------------------------------------------
app.post("/speak", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const { text, voice = "alloy" } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TTS API error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const audioBuffer = await response.arrayBuffer();
    
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength
    });
    
    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: error.message });
  }
});


// ---- Boot -------------------------------------------------------------------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => console.log(`Backend on http://localhost:${PORT}`));
