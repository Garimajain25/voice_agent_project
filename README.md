# 🎤 Voice Agent

A sophisticated real-time voice agent that combines AI conversation, image generation, and text-to-speech capabilities in a single web application.

## ✨ Features

- **🎤️ Voice Interaction**: Natural speech-to-text and text-to-speech
- **🎨 Image Generation**: Create images using DALL-E 3 via voice commands
- **🤖 AI Chat**: Powered by GPT-4o-mini for intelligent conversations
- **🎵 Multiple Voices**: Choose from 6 different AI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- **📱 Responsive Design**: Works on desktop and mobile devices
- **⚡ Real-time Processing**: Low-latency voice interactions

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
- **Generate Images**: "Create a picture of a sunset"
- **Ask Questions**: "What's the weather like?"
- **Image Requests**: "Generate a happy family picture"

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **AI Services**: OpenAI GPT-4o-mini, DALL-E 3, TTS-1
- **Speech Recognition**: Web Speech API

## 📋 Requirements

- Node.js 14+
- OpenAI API key
- Modern web browser with microphone access
- Internet connection

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

### Voice Selection

The application supports 6 different AI voices:
- **Alloy**: Clear, energetic
- **Echo**: Warm, friendly  
- **Fable**: Storyteller
- **Onyx**: Deep, rich
- **Nova**: Bright, cheerful
- **Shimmer**: Soft, gentle

## 🎨 How to Use

1. **Start Voice Chat**: Click the "Start Voice Chat" button
2. **Allow Microphone**: Grant microphone access when prompted
3. **Speak**: Say your message clearly
4. **Listen**: The AI will respond with both text and voice
5. **Generate Images**: Say "Generate image of..." or "Create a picture of..."
6. **View Images**: Click on generated images to view full-size
7. **Download**: Use the download button to save images

## 🔧 API Endpoints

- `POST /chat` - Send text messages to GPT-4o-mini
- `POST /generate-image` - Generate images using DALL-E 3
- `POST /speak` - Convert text to speech using TTS-1
- `GET /health` - Health check endpoint

## 📁 Project Structure

```
voice_agent/
├── public/
│   └── gpt-voice-agent.html    # Main frontend application
├── server.js                   # Express.js server
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables (create this)
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**: Ensure browser has microphone permissions
2. **API errors**: Check your OpenAI API key in `.env` file
3. **Images not generating**: Verify DALL-E 3 access in your OpenAI account
4. **Voice not playing**: Check browser audio settings

### Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Edge
- ✅ Firefox
- ✅ Safari

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4o-mini, DALL-E 3, and TTS-1 APIs
- Web Speech API for browser-based speech recognition
- Express.js community for the excellent framework

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Made with ❤️ by Garima Jain**