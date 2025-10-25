# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Abstract Image Generator transforms blog post content into deterministic, organic abstract images optimized for social media sharing. The tool analyzes text metrics and generates flowing, artistic visuals.

**Live Demo**: https://osmeusapontamentos.com/abstract-generator/

**Dual Interface**:
- **Web Interface**: Browser-based interactive tool (p5.js)
- **CLI Tool**: Command-line batch processing (node-canvas)

## Quick Commands

```bash
# Install dependencies
npm install

# Web Interface - Start development server (opens at http://localhost:8080)
npm start

# CLI - Generate from file
node src/cli/cli.js generate --source file --path test.txt --all
.\gen.bat --source file --path test.txt --all

# CLI - Generate from WordPress
node src/cli/cli.js generate --source wordpress --url https://osmeusapontamentos.com --id 26136
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --id 26136

# CLI - List WordPress posts
node src/cli/cli.js list --source wordpress --url https://osmeusapontamentos.com
```

## Architecture

### Dual Interface Design

The project supports two distinct interfaces sharing the same core generation logic:

**Web Interface** (`/src/web/`):
- Browser-based, interactive UI
- Uses p5.js for rendering
- No installation needed (can use live demo)
- Perfect for one-off generations

**CLI Tool** (`/src/cli/`):
- Command-line automation
- Uses node-canvas for headless rendering
- Batch processing capabilities
- Perfect for bulk operations

### Shared Core (`/src/core/`)

All generation logic is shared between both interfaces:

1. **Content Analysis** (`src/core/contentAnalyzer.js`)
   - Cleans HTML and extracts plain text
   - Preserves paragraph structure
   - Calculates metrics: word count, character count, average word length, reading time, paragraph count
   - Creates content hash for deterministic seeding
   - **Dual Environment**: Works in both Node.js and browser (uses conditional exports)

2. **Seed Generation** (`src/core/seedGenerator.js`)
   - Converts content metrics into deterministic seed value
   - Maps metrics to visual parameters:
     - `seed`: Deterministic value from content
     - `density` (0-1): Based on word count → number of visual elements
     - `complexity` (0-1): Based on character count → curve intricacy
     - `smoothness` (0-1): Based on avg word length → curve smoothness
     - `layers`: Based on reading time → visual depth (max 10)
     - `shapeVertices`: Based on paragraph count → polygon complexity (3-20)
     - `paletteIndex`: Based on content hash → color palette (0-9)
   - **Dual Environment**: Works in both Node.js and browser

3. **Visual Generation** (Two implementations)

   **Browser**: `src/core/visualGenerator.js`
   - Uses p5.js for canvas rendering
   - Instance mode to avoid global conflicts
   - Returns p5 sketch object

   **Node.js**: `src/core/visualGeneratorNode.js`
   - Uses node-canvas for server-side rendering
   - Custom seeded random number generator
   - Custom Perlin noise implementation
   - Returns canvas object

   Both produce visually similar (but not pixel-identical) results.

### Web Interface (`/src/web/`)

**Main Application** (`src/web/app.js`):
- Orchestrates the entire workflow
- Manages UI interactions
- Handles p5.js sketch lifecycle (creation, cleanup)
- Implements multi-format generation via master image + crop
- Implements download functionality

**Input Methods**:
1. **Paste Text**: Direct text input
2. **Upload File**: HTML/TXT file upload
3. **Load from WordPress**: Fetch content by URL
   - Extracts post ID or slug from URL
   - Handles various WordPress permalink structures
   - Preserves paragraph breaks when stripping HTML
   - Uses WordPress REST API

**Generation Options**:
- **Line Thickness**: Min/max stroke weight (0.1-10px)
- **Crop Mode**:
  - Direct Crop: Fast, crops from top-left
  - Resize & Crop: Scales to fit, crops from center (better composition)

### CLI Tool (`/src/cli/`)

**Main CLI** (`src/cli/cli.js`):
- Uses commander for argument parsing
- Three commands: `generate`, `list`, `config`
- Supports multiple content sources
- Configurable via command-line options or config.json

**Content Providers** (`src/cli/contentProviders/`):
- **BaseProvider**: Abstract interface all providers implement
- **FileProvider**: Reads single file (txt, html, md)
- **DirectoryProvider**: Batch processes directory of files
- **WordPressProvider**: Fetches posts via REST API

**Image Generator** (`src/cli/imageGenerator.js`):
- Orchestrates content → metrics → params → image pipeline
- Handles crop mode logic
- Saves images to disk

**Logger** (`src/cli/logger.js`):
- Logs to console and file
- Supports debug, info, warn, error levels
- Creates summary reports

### Data Flow

**Web Interface**:
```
User Input (Text/HTML/WordPress URL)
    ↓
ContentAnalyzer → metrics {wordCount, characters, avgWordLength, readingTime, paragraphCount}
    ↓
SeedGenerator → visualParams {seed, density, complexity, smoothness, layers, shapeVertices, paletteIndex}
    ↓
VisualGenerator (p5.js) → Master canvas (1200×1200)
    ↓
Canvas cropping → Multiple formats:
    - Landscape: 1200×628
    - Square: 1200×1200
    ↓
Download as PNG
```

**CLI**:
```
Content Provider → {id, title, content}
    ↓
ContentAnalyzer → metrics
    ↓
SeedGenerator → visualParams
    ↓
VisualGeneratorNode (node-canvas) → Master canvas (1200×1200)
    ↓
Crop mode logic → Multiple formats
    ↓
Save to disk (generated-images/)
```

### Key Design Decisions

**Determinism**: Uses seeded random number generators (`p5.randomSeed()` in browser, custom LCG in Node.js) and seeded Perlin noise to ensure the same content always produces consistent visuals. Critical for branding consistency.

**Dual Rendering**:
- Browser uses p5.js (easier, more features)
- CLI uses node-canvas (headless, no DOM)
- Both share same logic but have minor rendering differences

**No Build System**: Uses vanilla JS with CDN-hosted p5.js for web. CLI uses CommonJS modules. Simple and maintainable.

**Color Palettes**: 10 hardcoded palettes. Each has gradient background (2 colors) and accent colors (3 colors). Selected deterministically via content hash modulo 10.

**Master Image + Crop**:
1. Generate single 1200×1200 master image
2. Apply crop strategy:
   - **Direct Crop**: Crop directly (faster, shows top portion)
   - **Resize & Crop**: Scale to fit aspect ratio, then crop from center (better composition)
3. Prevents distortion that would occur rendering each format independently

**WordPress Integration**:
- Web: Loads via browser fetch (client-side CORS-friendly)
- CLI: Loads via node fetch (server-side, no CORS)
- Both use REST API: `/wp-json/wp/v2/posts/`
- Supports both numeric IDs and slugs

**Paragraph Preservation**: HTML stripping replaces block elements (`<p>`, `<div>`, `<br>`) with newlines to maintain structure. Important for accurate paragraph count metric.

### File References

**Core (Shared)**:
- Color palettes: `src/core/visualGenerator.js:19-70` (browser) and `src/core/visualGeneratorNode.js:18-69` (Node)
- Metric extraction: `src/core/contentAnalyzer.js:37-56`
- Visual parameter mapping: `src/core/seedGenerator.js:27-62`
- Content hash: `src/core/seedGenerator.js:67-75`

**Web Interface**:
- WordPress URL parsing: `src/web/app.js:196-232`
- WordPress content loading: `src/web/app.js:118-191`
- HTML stripping with paragraph preservation: `src/web/app.js:237-267`
- Input mode switching: `src/web/app.js:66-96`
- Master image generation: `src/web/app.js:180-198`
- Crop mode logic: `src/web/app.js:220-305`

**CLI**:
- Content provider interface: `src/cli/contentProviders/baseProvider.js:10-41`
- WordPress provider: `src/cli/contentProviders/wordpressProvider.js:17-150`
- File provider: `src/cli/contentProviders/fileProvider.js:17-142`
- Directory provider: `src/cli/contentProviders/directoryProvider.js:18-172`
- CLI command handling: `src/cli/cli.js:30-150`
- Image generation orchestrator: `src/cli/imageGenerator.js:17-174`
- Crop mode implementation: `src/cli/imageGenerator.js:101-152`

## Project Structure

```
src/
├── core/                           # Shared logic (browser + Node.js)
│   ├── contentAnalyzer.js         # Text analysis (dual environment)
│   ├── seedGenerator.js           # Seed generation (dual environment)
│   ├── visualGenerator.js         # p5.js rendering (browser only)
│   └── visualGeneratorNode.js    # node-canvas rendering (Node.js only)
│
├── web/                            # Browser-specific
│   └── app.js                     # Web UI orchestration
│
└── cli/                            # Node.js CLI-specific
    ├── cli.js                      # Main CLI interface
    ├── imageGenerator.js          # Generation orchestrator
    ├── logger.js                   # Logging utility
    └── contentProviders/
        ├── baseProvider.js         # Provider interface
        ├── fileProvider.js         # Single file
        ├── directoryProvider.js    # Directory batch
        └── wordpressProvider.js    # WordPress REST API
```

## Configuration

**Web Interface**: Configured via UI controls (no config files)

**CLI**: `config.json`
```json
{
  "contentSource": {
    "type": "wordpress",
    "wordpress": { "siteUrl": "...", "postsPerBatch": 10 },
    "file": { "path": "..." },
    "directory": { "path": "...", "extensions": [".txt", ".html", ".md"] }
  },
  "generation": {
    "cropMode": "direct",
    "minStroke": 0.5,
    "maxStroke": 1.5,
    "formats": ["landscape", "square"]
  },
  "output": {
    "directory": "./generated-images",
    "filenamePattern": "{id}-{format}.png"
  },
  "logging": {
    "logFile": "./generation.log",
    "logLevel": "info"
  }
}
```

## Visual Elements

The generator creates organic abstract art with:
- **Gradient backgrounds**: Linear gradient between 2 palette colors
- **Organic shapes** (5 types, selected based on content smoothness):
  - Circles (20%)
  - Stars (15%)
  - Rectangles (15%)
  - Regular polygons (20%)
  - Organic blobs using Perlin noise (30%)
- **Flowing curves**: Bezier curves using Perlin noise for natural flow
- **Layered composition**: Multiple layers with alpha transparency
- **Noise texture**: Subtle overlay for organic feel

Shape complexity (vertices) determined by paragraph count (3-20 vertices).

## Development Workflow

### Adding New Features to Web Interface

1. Update `src/web/app.js` for UI logic
2. Update `index.html` for UI elements
3. Update `styles.css` for styling
4. If core logic changes, update `src/core/`
5. Test in browser
6. Increment version in script tags (`?v=N`)

### Adding New Features to CLI

1. Update appropriate CLI file in `src/cli/`
2. If adding new content source, create new provider in `contentProviders/`
3. Update `cli.js` to support new options
4. Test with `node src/cli/cli.js`
5. Update CLI-README.md

### Adding Shared Features

1. Update files in `src/core/`
2. Ensure dual environment support (Node.js + browser)
3. Use conditional exports: `if (typeof module !== 'undefined' && module.exports)`
4. Test both interfaces
5. Update both READMEs

## Deployment

**Web Interface**:
- Copy files from `deploy/` folder to web server
- No server-side processing needed
- Pure static HTML/CSS/JS
- ~50KB total size

**CLI**:
- Requires Node.js installation
- Run directly: `node src/cli/cli.js`
- Windows wrapper: `gen.bat`

## Testing

**Web Interface**:
1. Start dev server: `npm start`
2. Test paste text
3. Test file upload
4. Test WordPress loading with various URL patterns
5. Test both crop modes
6. Test downloads
7. Verify metrics calculation

**CLI**:
1. Test file provider: `.\gen.bat --source file --path test.txt --all`
2. Test directory provider: `.\gen.bat --source directory --path ./posts/ --all`
3. Test WordPress provider: `.\gen.bat --source wordpress --url https://... --id 123`
4. Verify images in `generated-images/`
5. Check `generation.log` for errors
6. Test both crop modes

## Common Tasks

### Update Color Palettes
- Edit: `src/core/visualGenerator.js:19-70` (browser)
- Edit: `src/core/visualGeneratorNode.js:18-69` (Node)
- Keep both in sync

### Change Metric Calculations
- Edit: `src/core/contentAnalyzer.js:37-56`
- Changes affect both web and CLI

### Modify Visual Algorithm
- Browser: Edit `src/core/visualGenerator.js`
- CLI: Edit `src/core/visualGeneratorNode.js`
- Try to keep visual output similar

### Add New Content Provider (CLI)
1. Create `src/cli/contentProviders/newProvider.js`
2. Extend `BaseProvider`
3. Implement: `getAll()`, `getById()`, `count()`, `validate()`, `getName()`
4. Add to `src/cli/cli.js` in `createProvider()` function

## Documentation

- **README.md**: Main project overview
- **CLI-README.md**: Detailed CLI documentation
- **PROJECT-SUMMARY.md**: Comprehensive project status
- **CLAUDE.md**: This file (AI assistant guidance)
- **DEPLOY.md**: Web deployment instructions (in deploy/ folder)

## Technologies

**Web**:
- p5.js 1.11.2 (canvas rendering)
- Vanilla JavaScript
- HTML5/CSS3

**CLI**:
- Node.js 16+
- node-canvas (server-side rendering)
- commander (CLI framework)
- jsdom (HTML parsing)
- marked (Markdown conversion)

## Git Workflow

**Ignored**:
- `node_modules/`
- `generated-images/`
- `generation.log`
- `deploy/` (deployment package)

**Tracked**:
- All source code
- Documentation
- Configuration templates

## Future Enhancements

Not yet implemented, but planned:
- Semantic text analysis with NLP
- Additional visual styles (geometric, data-viz)
- Portrait format (1200×1500px)
- Direct WordPress media upload from CLI
- Progress bars for CLI
- Custom color palette upload in web UI
- Manual parameter overrides

## Support

For questions or issues:
1. Check documentation (README.md, CLI-README.md)
2. Review this file for architecture guidance
3. Check PROJECT-SUMMARY.md for comprehensive status
4. Try live demo: https://osmeusapontamentos.com/abstract-generator/
