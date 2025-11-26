# Sketchbook

3D playground built on three.js and cannon.js with AI-powered content generation.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:8080 in your browser.

## Running Tests

To test the application:

1. Start the development server: `npm run dev`
2. Open http://localhost:8080 in your browser
3. Use the controls to interact with the 3D world:
   - **WASD** - Movement
   - **Shift** - Run
   - **Space** - Jump
   - **F** - Enter vehicle
   - **G** - Enter as passenger
   - **X** - Switch seat
   - **E** - Interact
   - **Alt + ←** - Undo
   - **Alt + →** - Redo
   - **Shift + C** - Free camera

## LLM API Keys Configuration

LLM keys are configured in `localSettings.js`. Create this file in the project root if it doesn't exist:

```javascript
// localSettings.js
settings.model.selected = "anthropic/claude-3-haiku";  // or your preferred model
settings.apiUrl = "https://openrouter.ai/api/v1/chat/completions";  // API endpoint
settings.apiKey = "your-api-key-here";  // Your API key
```

### Supported API Providers

- **OpenRouter**: Use OpenRouter API keys with their endpoint
- **Gemini**: Built-in support for Gemini models (gemini-1.5-flash-latest, gemini-1.5-pro-latest)
- **Hugging Face**: Use keys starting with `hf_` for Hugging Face Inference endpoints

Default models available in `src/settings.js`:
- `gemini-1.5-pro-exp-0801`
- `gemini-1.5-pro-latest`
- `gemini-1.5-flash-latest`
- `gpt-4o-mini`

## Build

```bash
# Production build
npm run build
```

## License

License: TBD

No license is granted yet. I will choose an open-source license later.

