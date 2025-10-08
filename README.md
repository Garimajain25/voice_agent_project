# 🎤 Voice Agent

A real-time voice agent powered by OpenAI's Realtime API with ultra-low latency voice conversations. Features natural speech-to-speech interactions, interruptible conversations, and real-time audio processing. Built with Node.js, Express.js, and WebSocket connections for seamless voice interactions.

## 🎤 Voice Agent

A sophisticated real-time voice agent that enables natural, interruptible conversations with AI through OpenAI's cutting-edge Realtime API. Experience truly real-time voice interactions with sub-second response times.

## ✨ Features

- **🎤 Voice Interaction**: Natural speech-to-speech conversations with ultra-low latency
- **⚡ Real-time Processing**: Sub-second response times using OpenAI Realtime API
- **🔄 Interrupt-Friendly**: You can interrupt the AI anytime during responses
- **📡 WebSocket Connection**: Persistent real-time connection for instant communication
- **🎯 Voice Activity Detection**: Automatic turn-taking with server-side VAD
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔊 High-Quality Audio**: 16kHz PCM audio for crisp voice quality
- **📊 Latency Monitoring**: Real-time latency display and optimization

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Garimajain25/voice_agent.git
   cd voice_agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your OpenAI API key**
   Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## 🎯 Voice Commands

- **Chat**: "Hello, how are you?"
- **Ask Questions**: "What's the weather like?"
- **General Conversation**: "Tell me a joke"
- **Interrupt Anytime**: You can break in during AI responses
- **Natural Speech**: Just talk normally - no special commands needed

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **AI Services**: OpenAI Realtime API (GPT-4o Realtime Preview)
- **Real-time Communication**: WebSocket connections
- **Audio Processing**: Web Audio API, PCM16 encoding
- **Speech Recognition**: OpenAI Realtime API with server-side VAD

## 📋 Requirements

- **Node.js 16+** (for WebSocket support)
- **OpenAI API key** with Realtime API access
- **Modern web browser** with WebSocket and Web Audio API support
- **Stable internet connection** for real-time streaming
- **Microphone access** for voice input

## ⚙️ Configuration

Create a `.env` file with your OpenAI API key:

```
OPENAI_API_KEY=your_api_key_here
```

### Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox
- ✅ Safari


## 🙏 Acknowledgments

- OpenAI for providing the revolutionary Realtime API
- Web Audio API for browser-based audio processing
- Express.js and WebSocket communities for excellent frameworks

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ by Garima Jain**