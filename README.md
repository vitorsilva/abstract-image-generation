# Abstract Image Generator

Transform your blog content into beautiful, organic abstract images perfect for social media and blog headers.

## Features

- **Deterministic Generation**: Same content always produces the same image
- **Organic Visuals**: Flowing curves, gradients, and natural patterns using Perlin noise
- **Multiple Formats**: Generate images optimized for different platforms
  - Landscape: 1200×628px (Twitter/LinkedIn/Blog)
  - Square: 1200×1200px (Instagram/General)
- **Content-Driven**: Visual parameters are derived from your text metrics
- **Simple Interface**: Paste text or upload files (HTML, TXT)
- **One-Click Download**: Save images directly to your device

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

- Node.js (for running the development server)
- A modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The application will open in your browser at `http://localhost:8080`

## Usage

1. **Enter Content**: Either paste your blog post text or upload an HTML/TXT file
2. **Generate**: Click "Generate Images" button
3. **Review**: View the generated images in both landscape and square formats
4. **Download**: Click download buttons to save images to your device

## Project Structure

```
abstract-image-generator/
├── index.html                 # Main web interface
├── styles.css                 # Application styling
├── src/
│   ├── contentAnalyzer.js    # Extracts metrics from text
│   ├── seedGenerator.js      # Creates deterministic seeds and visual parameters
│   ├── visualGenerator.js    # p5.js generative art engine
│   └── app.js                # Main application logic
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

## Future Enhancements (v2)

- Semantic text analysis using NLP
- Theme and mood detection
- Manual parameter controls for fine-tuning
- CLI version for automation
- Additional visual styles
- Custom color palette upload
- Batch processing

## Technology Stack

- **p5.js**: Canvas rendering and generative art
- **Vanilla JavaScript**: No framework overhead
- **HTML5/CSS3**: Modern web interface
- **http-server**: Development server

## License

MIT
