import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer, WebSocket as WS } from "ws";
import { createServer } from "http";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// ---- ENV & defaults --------------------------------------------------------
const API_KEY = (process.env.OPENAI_API_KEY || "").trim();
const DEFAULT_INSTRUCTIONS = process.env.DEFAULT_INSTRUCTIONS || 
  "You are a helpful, fast voice assistant. Speak quickly and efficiently with a confident, clear tone. Keep responses brief and direct. Use a fast, clear, and efficient voice. Be quick and to the point in your responses. Speak at a faster pace than normal.";

if (!API_KEY) {
  console.warn("⚠️  OPENAI_API_KEY is missing. Set it in .env (no quotes/spaces).");
  console.warn("   Create a .env file with: OPENAI_API_KEY=your_api_key_here");
} else {
  console.log("✅ API Key found (length:", API_KEY.length, "characters)");
}
console.log("Voice Agent ready with OpenAI Realtime API (Ultra-low latency)");

// ---- Static frontend --------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) =>
  res.sendFile(path.join(__dirname, "public", "realtime-voice-agent.html"))
);

app.get("/health", (_req, res) => res.send("OK"));


// ---- WebSocket connection for Realtime API --------------------------------
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  let openaiWs = null;
  let isConnected = false;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'start_session') {
        // Initialize OpenAI Realtime API connection
        await initializeOpenAIConnection(ws, data.instructions, data.voice);
      } else if (data.type === 'audio_data') {
        // Forward audio data to OpenAI
        if (openaiWs && isConnected) {
          openaiWs.send(JSON.stringify({
            type: "input_audio_buffer.append",
            audio: data.audio
          }));
        }
      } else if (data.type === 'audio_complete') {
        // Commit the audio buffer
        if (openaiWs && isConnected) {
          openaiWs.send(JSON.stringify({
            type: "input_audio_buffer.commit"
          }));
        }
      } else if (data.type === 'text_input') {
        // Text input from Web Speech API
        if (openaiWs && isConnected) {
          openaiWs.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: data.text
                }
              ]
            }
          }));
          
          // Trigger response generation
          openaiWs.send(JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["text", "audio"]
            }
          }));
        }
      } else if (data.type === 'end_session') {
        // Close OpenAI connection
        if (openaiWs) {
          openaiWs.close();
        }
      }
  } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
    if (openaiWs) {
      openaiWs.close();
    }
  });

  async function initializeOpenAIConnection(clientWs, instructions, voice = 'alloy') {
    try {
      // Map unsupported voices to supported ones
      const voiceMapping = {
        'nova': 'alloy',     // Map nova to alloy (bright, cheerful)
        'fable': 'coral',    // Map fable to coral (storyteller)
        'onyx': 'echo'       // Map onyx to echo (deep, rich)
      };
      
      const mappedVoice = voiceMapping[voice] || voice;
      console.log('Voice selection - Original:', voice, 'Mapped to:', mappedVoice);
      
      const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01';
      
      openaiWs = new WS(openaiUrl, {
      headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      openaiWs.on('open', () => {
        console.log('Connected to OpenAI Realtime API');
        isConnected = true;
        
        // Send session configuration
        openaiWs.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: instructions || DEFAULT_INSTRUCTIONS,
            voice: mappedVoice,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1",
              language: "en"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.3,
              prefix_padding_ms: 150,
              silence_duration_ms: 400
            },
            tools: [],
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        }));

        // Send response to client
        clientWs.send(JSON.stringify({ 
          type: 'session_started',
          message: 'Realtime session started successfully'
        }));
      });

      openaiWs.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'response.audio.delta') {
            // Forward audio response to client
            clientWs.send(JSON.stringify({
              type: 'audio_response',
              audio: message.delta
            }));
          } else if (message.type === 'response.text.delta') {
            // Forward text response to client
            clientWs.send(JSON.stringify({
              type: 'text_response',
              text: message.delta
            }));
          } else if (message.type === 'response.audio_transcript.delta') {
            // Forward audio transcript as assistant response
            clientWs.send(JSON.stringify({
              type: 'text_response',
              text: message.delta
            }));
          } else if (message.type === 'conversation.item.input_audio_transcription.completed') {
            // Send transcription completion
            clientWs.send(JSON.stringify({
              type: 'transcription_complete',
              text: message.transcript
            }));
          } else if (message.type === 'conversation.item.response.completed') {
            // Response completed
            clientWs.send(JSON.stringify({
              type: 'response_complete'
            }));
          } else if (message.type === 'response.done') {
            // Response done
            clientWs.send(JSON.stringify({
              type: 'response_done'
            }));
          } else if (message.type === 'session.created') {
            // Session created - no action needed
            console.log('Session created successfully');
          } else if (message.type === 'session.updated') {
            // Session updated - no action needed
            console.log('Session updated successfully');
          } else if (message.type === 'input_audio_buffer.speech_started') {
            // Speech started - forward to client
            clientWs.send(JSON.stringify({
              type: 'speech_started',
              item_id: message.item_id
            }));
          } else if (message.type === 'input_audio_buffer.speech_stopped') {
            // Speech stopped - forward to client
            clientWs.send(JSON.stringify({
              type: 'speech_stopped',
              item_id: message.item_id
            }));
          } else if (message.type === 'input_audio_buffer.committed') {
            // Audio buffer committed - forward to client
            clientWs.send(JSON.stringify({
              type: 'audio_committed',
              item_id: message.item_id
            }));
          } else if (message.type === 'conversation.item.created') {
            // Conversation item created - forward to client
            clientWs.send(JSON.stringify({
              type: 'item_created',
              item: message.item
            }));
          } else if (message.type === 'response.created') {
            // Response created - forward to client
            clientWs.send(JSON.stringify({
              type: 'response_created',
              response: message.response
            }));
          } else if (message.type === 'conversation.item.input_audio_transcription.delta') {
            // Forward transcription delta to client
            clientWs.send(JSON.stringify({
              type: 'transcription_delta',
              item_id: message.item_id,
              text: message.delta
            }));
          } else if (message.type === 'response.output_item.added') {
            // Response output item added
            clientWs.send(JSON.stringify({
              type: 'output_item_added',
              item: message.item
            }));
          } else if (message.type === 'response.content_part.added') {
            // Response content part added
            clientWs.send(JSON.stringify({
              type: 'content_part_added',
              part: message.part
            }));
          } else if (message.type === 'response.audio.done') {
            // Audio response completed
            clientWs.send(JSON.stringify({
              type: 'audio_done'
            }));
          } else if (message.type === 'response.audio_transcript.done') {
            // Audio transcript completed
            clientWs.send(JSON.stringify({
              type: 'audio_transcript_done'
            }));
          } else if (message.type === 'response.content_part.done') {
            // Content part completed
            clientWs.send(JSON.stringify({
              type: 'content_part_done'
            }));
          } else if (message.type === 'response.output_item.done') {
            // Output item completed
            clientWs.send(JSON.stringify({
              type: 'output_item_done'
            }));
          } else if (message.type === 'rate_limits.updated') {
            // Rate limits updated - no action needed
            console.log('Rate limits updated');
          } else if (message.type === 'error') {
            console.error('OpenAI Realtime API error:', message.error);
            clientWs.send(JSON.stringify({
              type: 'error',
              message: message.error.message || 'Unknown error occurred'
            }));
          } else {
            // Log unknown message types for debugging (but don't spam the console)
            if (message.type && !message.type.includes('unknown')) {
              console.log('Unhandled message type:', message.type);
            }
          }
  } catch (error) {
          console.error('Error parsing OpenAI message:', error);
        }
      });

      openaiWs.on('close', () => {
        console.log('OpenAI Realtime API connection closed');
        isConnected = false;
        clientWs.send(JSON.stringify({
          type: 'session_ended',
          message: 'Realtime session ended'
        }));
      });

      openaiWs.on('error', (error) => {
        console.error('OpenAI Realtime API error:', error);
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'OpenAI connection error'
        }));
      });

  } catch (error) {
      console.error('Error initializing OpenAI connection:', error);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize OpenAI connection'
      }));
    }
  }
});

// ---- Boot -------------------------------------------------------------------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  console.log(`🚀 Realtime Voice Agent Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time connections`);
  console.log(`🎤 Using OpenAI Realtime API for ultra-low latency`);
});


