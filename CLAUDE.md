# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Abstract Image Generator transforms blog post content into deterministic, organic abstract images optimized for social media sharing. The tool analyzes text metrics and generates flowing, artistic visuals using p5.js.

## Commands

```bash
# Install dependencies
npm install

# Start development server (opens at http://localhost:8080)
npm start
```

## Architecture

### High-Level Design

The application follows a modular architecture with clear separation of concerns:

1. **Content Analysis Layer** (`src/contentAnalyzer.js`)
   - Cleans HTML and extracts plain text
   - Calculates metrics: word count, character count, average word length, reading time
   - Creates a content hash for deterministic seeding

2. **Seed Generation Layer** (`src/seedGenerator.js`)
   - Converts content metrics into a deterministic seed value
   - Maps metrics to visual parameters:
     - `density` (0-1): Based on word count, controls number of visual elements
     - `complexity` (0-1): Based on character count, controls curve intricacy
     - `smoothness` (0-1): Based on avg word length, controls curve smoothness
     - `layers`: Based on reading time, controls visual depth
     - `paletteIndex`: Based on content hash, selects from 10 color palettes

3. **Visual Generation Layer** (`src/visualGenerator.js`)
   - Core generative art engine using p5.js
   - Renders organic visuals using:
     - Gradient backgrounds (2-color lerp)
     - Perlin noise for natural flow patterns
     - Bezier curves for smooth organic shapes
     - Layered composition with alpha transparency
     - Subtle noise texture overlay
   - Supports multiple output sizes (1200×628, 1200×1200)

4. **Application Layer** (`src/app.js`)
   - Orchestrates the entire workflow
   - Manages UI interactions
   - Handles p5.js sketch lifecycle (creation, cleanup)
   - Implements download functionality

### Data Flow

```
User Input (Text/HTML)
    ↓
ContentAnalyzer → metrics {wordCount, characters, avgWordLength, readingTime}
    ↓
SeedGenerator → visualParams {seed, density, complexity, smoothness, layers, paletteIndex}
    ↓
VisualGenerator → p5.js sketch → Canvas rendering
    ↓
Download as PNG
```

### Key Design Decisions

**Determinism**: Uses `p5.randomSeed()` and `p5.noiseSeed()` to ensure the same content always produces identical visuals. This is critical for branding consistency.

**No Build System**: Currently uses vanilla JS with CDN-hosted p5.js for simplicity. Consider adding Vite/Webpack if the project grows significantly.

**Color Palettes**: 10 hardcoded palettes in `visualGenerator.js`. Each palette has gradient background colors and 3 accent colors. Selected deterministically via content hash modulo 10.

**p5.js Instance Mode**: Uses p5.js instance mode (not global mode) to support multiple canvases on the same page without conflicts.

### File References

- Color palettes defined: `src/visualGenerator.js:21-85`
- Metric extraction: `src/contentAnalyzer.js:37-54`
- Visual parameter mapping: `src/seedGenerator.js:23-51`
- Organic blob rendering: `src/visualGenerator.js:159-181`
- Noise-based curves: `src/visualGenerator.js:186-203`

## Future Development (v2)

Planned enhancements include:
- Semantic text analysis with NLP libraries (sentiment, themes, keywords)
- Additional visual styles (geometric, data-viz)
- CLI version for automation
- Manual parameter controls in UI
- Portrait format (1200×1500px)

## Technologies

- **p5.js 1.11.2**: Canvas-based generative art library
- **http-server**: Simple dev server
- **Vanilla JS**: No framework dependencies
