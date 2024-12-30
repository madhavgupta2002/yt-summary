# YouTube Transcript Analyzer

A Chrome extension that helps you analyze YouTube video transcripts using AI. Built with React and powered by the Groq API.

## Features

- 📝 Extract and copy video transcripts
- ⏱️ Generate timeline breakdowns of video content
- 📊 Create comprehensive summaries using AI
- ✏️ Edit and customize AI-generated content
- 🎨 Clean, modern interface
- 🔄 Real-time updates

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yt-transcript-analyzer.git
cd yt-transcript-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder from your project

## Usage

1. Go to any YouTube video
2. Open the transcript panel in YouTube (click the three dots below the video and select "Show transcript")
3. Click the extension icon in your browser
4. Use the floating panel to:
   - Copy the transcript
   - Generate AI analysis
   - Edit the timeline or summary
   - Minimize the panel when not in use

## Development

- Run in watch mode:
```bash
npm run watch
```

- The extension uses:
  - React for UI components
  - Webpack for bundling
  - Groq API for AI analysis
  - Chrome Extension Manifest V3

## Configuration

The extension requires a Groq API key for AI analysis. The key is currently hardcoded for demonstration purposes, but in a production environment, you should:

1. Create a `.env` file in the root directory
2. Add your Groq API key:
```
GROQ_API_KEY=your_api_key_here
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 