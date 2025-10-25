# Abstract Image Generator

Transform your blog content into beautiful, organic abstract images perfect for social media and blog headers.

**🎨 [Try Live Demo](https://osmeusapontamentos.com/abstract-generator/)**

**Two Ways to Use:**
- 🌐 **Web Interface**: Interactive browser-based generator
- ⚡ **CLI Tool**: Automated batch generation from WordPress, files, or directories

## Features

- **Deterministic Generation**: Same content always produces the same image
- **Organic Visuals**: Flowing curves, gradients, and natural patterns using Perlin noise
- **Multiple Formats**: Generate images optimized for different platforms
  - Landscape: 1200×628px (Twitter/LinkedIn/Blog)
  - Square: 1200×1200px (Instagram/General)
- **Content-Driven**: Visual parameters are derived from your text metrics
- **Flexible Input**: Paste text, upload files (HTML, TXT), or load directly from WordPress URLs
- **Two Crop Modes**: Direct crop (faster) or resize & crop (better composition fit)
- **One-Click Download**: Save images directly to your device
- **WordPress Integration**: Load posts directly by URL from any WordPress site with REST API

## How It Works

1. **Content Analysis**: Extracts metrics (word count, reading time, character count, average word length)
2. **Seed Generation**: Creates a deterministic seed from your content
3. **Visual Mapping**: Maps content metrics to visual parameters:
   - Word count → density of visual elements
   - Character count → curve complexity
   - Average word length → smoothness of curves
   - Reading time → number of layers
   - Content hash → color palette selection
4. **Generative Art**: Uses p5.js to render organic shapes with Perlin noise and bezier curves

## Getting Started

### Prerequisites

- Node.js (for running the development server or CLI)
- A modern web browser (for web interface)

### Installation

```bash
# Install dependencies
npm install
```

## Usage

### 🌐 Web Interface

**🎨 [Try Online Demo](https://osmeusapontamentos.com/abstract-generator/)** - No installation needed!

Or run locally:
```bash
# Start the development server
npm start
```

The application will open in your browser at `http://localhost:8080`

**How to Use:**
1. **Enter Content**: Either paste your blog post text, upload an HTML/TXT file, or load from WordPress URL
2. **Generate**: Click "Generate Images" button
3. **Review**: View the generated images in both landscape and square formats
4. **Download**: Click download buttons to save images to your device

### ⚡ CLI Tool

**Quick Start:**
```bash
# Generate from WordPress post
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --id 26136

# Generate from local file
.\gen.bat --source file --path article.txt --all

# Generate from directory
.\gen.bat --source directory --path ./posts/ --all
```

**📖 Full CLI Documentation:** See [CLI-README.md](CLI-README.md) for complete documentation.

**Features:**
- Generate images for all your WordPress posts at once
- Process local files and directories
- Batch processing with error handling
- Configurable output and logging
- Multiple content sources (WordPress REST API, files, directories)

## Project Structure

```
abstract-image-generator/
├── index.html                 # Main web interface
├── styles.css                 # Application styling
├── gen.bat                    # CLI wrapper for Windows
├── config.json                # CLI configuration
├── CLI-README.md              # CLI documentation
├── src/
│   ├── core/                  # Shared code (web + CLI)
│   │   ├── contentAnalyzer.js    # Extracts metrics from text
│   │   ├── seedGenerator.js      # Creates deterministic seeds
│   │   ├── visualGenerator.js    # p5.js generative art (web)
│   │   └── visualGeneratorNode.js # node-canvas version (CLI)
│   ├── web/
│   │   └── app.js                # Web application logic
│   └── cli/                      # CLI-specific code
│       ├── cli.js                # Main CLI interface
│       ├── imageGenerator.js     # Image generation orchestrator
│       ├── logger.js             # Logging utility
│       └── contentProviders/     # Pluggable content sources
│           ├── baseProvider.js      # Provider interface
│           ├── fileProvider.js      # Single file source
│           ├── directoryProvider.js # Directory source
│           └── wordpressProvider.js # WordPress REST API
└── package.json              # Project dependencies
```

## Color Palettes

The generator includes 10 carefully curated color palettes:
- Sunset Warmth
- Ocean Depths
- Forest Serenity
- Purple Dream
- Cosmic Night
- Peachy Keen
- Mint Fresh
- Lavender Fields
- Coral Reef
- Northern Lights

The palette is deterministically selected based on your content hash.

## Future Enhancements

- Semantic text analysis using NLP
- Theme and mood detection
- Manual parameter controls for fine-tuning in web UI
- Additional visual styles (geometric, data-viz)
- Custom color palette upload
- Direct upload to WordPress media library from CLI
- Portrait format (1200×1500px)
- Progress bars for CLI batch operations

## Technology Stack

**Web Interface:**
- **p5.js**: Canvas rendering and generative art
- **Vanilla JavaScript**: No framework overhead
- **HTML5/CSS3**: Modern web interface
- **http-server**: Development server

**CLI:**
- **node-canvas**: Server-side canvas rendering
- **commander**: CLI argument parsing
- **jsdom**: HTML parsing for content extraction
- **marked**: Markdown to HTML conversion

## License

MIT
