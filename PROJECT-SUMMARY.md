# Abstract Image Generator - Project Summary

## Overview

A dual-interface application that transforms blog post content into deterministic, organic abstract images optimized for social media sharing.

**Live Demo**: https://osmeusapontamentos.com/abstract-generator/

## Project Status

**Current Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: October 25, 2025

## Architecture

### Dual Interface Design

The project has been architected to support two distinct interfaces sharing the same core generation logic:

1. **Web Interface** (`/src/web/`) - Browser-based interactive tool
2. **CLI Interface** (`/src/cli/`) - Command-line automation tool

### Shared Core (`/src/core/`)

All generation logic is shared between both interfaces:
- `contentAnalyzer.js` - Text analysis and metrics extraction (works in Node.js + Browser)
- `seedGenerator.js` - Deterministic seed generation from content metrics
- `visualGenerator.js` - p5.js-based rendering (browser only)
- `visualGeneratorNode.js` - node-canvas-based rendering (CLI only)

## Web Interface Features

### Input Methods (3 options)
1. **Paste Text** - Direct text input
2. **Upload File** - HTML, TXT file upload
3. **Load from WordPress** - Fetch content by URL (NEW!)
   - Supports post ID and slug URLs
   - Handles various WordPress URL patterns (with/without index.php, date paths)
   - Uses WordPress REST API
   - Preserves paragraph structure

### Generation Options
- **Line Thickness**: Configurable min/max stroke weight (0.1-10px)
- **Crop Mode**:
  - Direct Crop: Fast, crops from top-left of 1200×1200 master
  - Resize & Crop: Scales to fit, crops from center (better composition)

### Output Formats
- Landscape: 1200×628px (Twitter, LinkedIn, blog headers)
- Square: 1200×1200px (Instagram, general social media)

### Technology Stack (Web)
- p5.js 1.11.2 (canvas rendering)
- Vanilla JavaScript (no framework)
- HTML5/CSS3
- Fully client-side (no server required)

## CLI Tool Features

### Content Providers (3 types)
1. **FileProvider** - Single text/HTML/Markdown file
2. **DirectoryProvider** - Batch process multiple files
3. **WordPressProvider** - Fetch from WordPress REST API

### Commands
```bash
# Generate from WordPress
node src/cli/cli.js generate --source wordpress --url https://site.com --id 123
.\gen.bat --source wordpress --url https://site.com --id 123

# Generate from file
node src/cli/cli.js generate --source file --path article.txt --all
.\gen.bat --source file --path article.txt --all

# Generate from directory
node src/cli/cli.js generate --source directory --path ./posts/ --all
.\gen.bat --source directory --path ./posts/ --all

# List content
node src/cli/cli.js list --source wordpress --url https://site.com

# Show config
node src/cli/cli.js config
```

### CLI Features
- Batch processing with progress tracking
- Detailed logging to file and console
- Error handling with graceful skip
- Configurable via `config.json`
- Multiple output formats
- Two crop modes
- Works on Windows (gen.bat), Linux/Mac (direct node command)

### Technology Stack (CLI)
- node-canvas (server-side rendering)
- commander (CLI framework)
- jsdom (HTML parsing)
- marked (Markdown conversion)

## Visual Generation System

### Deterministic Algorithm
- Same content always produces identical images
- Uses seeded random number generators
- Content hash determines color palette

### Visual Parameters
Derived from content metrics:
- **Density** (0-1): Based on word count → number of visual elements
- **Complexity** (0-1): Based on character count → curve intricacy
- **Smoothness** (0-1): Based on average word length → curve smoothness
- **Layers**: Based on reading time → visual depth (max 10)
- **Shape Vertices**: Based on paragraph count → polygon complexity (3-20)
- **Palette Index**: Based on content hash → color palette (0-9)

### Visual Elements
- Gradient backgrounds (2-color lerp)
- Organic shapes: circles, stars, rectangles, polygons, noise-based blobs
- Flowing curves using Perlin noise and Bezier curves
- Layered composition with alpha transparency
- Subtle noise texture overlay

### Color Palettes (10 options)
1. Sunset Warmth
2. Ocean Depths
3. Forest Serenity
4. Purple Dream
5. Cosmic Night
6. Peachy Keen
7. Mint Fresh
8. Lavender Fields
9. Coral Reef
10. Northern Lights

## Image Generation Pipeline

### Master Image + Crop Approach
1. Generate single master image at 1200×1200px
2. Apply crop strategy based on mode:
   - **Direct Crop**: Crop top 628px for landscape (fast)
   - **Resize & Crop**: Scale to fit aspect ratio, crop from center (better fit)
3. Export multiple formats from single master

This prevents visual distortion that would occur if each format was rendered independently.

## File Structure

```
abstract-image-generator/
├── index.html                    # Web interface entry point
├── styles.css                    # All web styles
├── config.json                   # CLI configuration
├── gen.bat                       # Windows CLI wrapper
│
├── src/
│   ├── core/                     # Shared logic
│   │   ├── contentAnalyzer.js
│   │   ├── seedGenerator.js
│   │   ├── visualGenerator.js         (p5.js for browser)
│   │   └── visualGeneratorNode.js     (node-canvas for CLI)
│   │
│   ├── web/                      # Web-specific
│   │   └── app.js                     (UI orchestration)
│   │
│   └── cli/                      # CLI-specific
│       ├── cli.js                     (main CLI interface)
│       ├── imageGenerator.js          (generation orchestrator)
│       ├── logger.js                  (logging utility)
│       └── contentProviders/
│           ├── baseProvider.js
│           ├── fileProvider.js
│           ├── directoryProvider.js
│           └── wordpressProvider.js
│
├── deploy/                       # Web deployment package (gitignored)
├── generated-images/             # CLI output (gitignored)
├── generation.log                # CLI log file (gitignored)
│
├── README.md                     # Main documentation
├── CLI-README.md                 # CLI documentation
├── CLAUDE.md                     # Project guidance for AI assistants
└── PROJECT-SUMMARY.md           # This file
```

## Configuration

### Web Interface
- Configured via UI controls (stroke thickness, crop mode)
- No configuration files needed

### CLI Tool
Configuration file: `config.json`

```json
{
  "contentSource": {
    "type": "wordpress",
    "wordpress": { "siteUrl": "https://...", "postsPerBatch": 10 },
    "file": { "path": "./content/my-post.txt" },
    "directory": { "path": "./content/posts/", "extensions": [".txt", ".html", ".md"] }
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

## Deployment

### Web Interface
**Live**: https://osmeusapontamentos.com/abstract-generator/

**Deploy**: Upload files from `/deploy/` folder to any web server
- No server-side processing required
- No database needed
- Pure static HTML/CSS/JS
- Works on any hosting (Apache, Nginx, cPanel, etc.)
- Total size: ~50KB

### CLI Tool
**Requirements**: Node.js 16+
**Install**: `npm install`
**Run**: `node src/cli/cli.js` or `.\gen.bat`

## Use Cases

### Web Interface
- Quick one-off image generation
- Manual content input and tweaking
- Loading posts from WordPress for individual processing
- Testing and experimentation
- No installation needed (use live demo)

### CLI Tool
- Batch process entire blog archives
- Automated image generation pipelines
- Scheduled jobs (cron/Task Scheduler)
- Integration with publishing workflows
- Processing local content exports
- Generate images for hundreds of posts at once

## Git Repository

**Structure**:
- Main branch: All source code
- Deployment files: Generated locally, gitignored

**Ignored Files**:
- `node_modules/`
- `generated-images/`
- `generation.log`
- `deploy/`

## Development

### Web Interface
```bash
npm start              # Start dev server at localhost:8080
```

### CLI Tool
```bash
npm install            # Install dependencies
node src/cli/cli.js    # Run CLI
.\gen.bat              # Windows wrapper (faster to type)
```

## Performance

### Web Interface
- Generation time: ~1-2 seconds per post
- Runs entirely in browser
- No network requests (except WordPress loading)

### CLI Tool
- Generation time: ~0.5-1 second per post per format
- Parallel processing: Single format at a time
- Memory efficient: ~50MB per process

## Browser Compatibility

**Web Interface**:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Works (responsive)

**Requirements**:
- JavaScript enabled
- Canvas API support (all modern browsers)
- Local storage (for settings, optional)

## WordPress Integration

### REST API Requirements
- WordPress 4.7+ (REST API built-in)
- Public site (or authenticated if needed)
- Standard permalink structure supported

### URL Patterns Supported
- `?p=123` (post ID parameter)
- `/2024/12/25/post-slug/` (date-based permalinks)
- `/index.php/2024/12/25/post-slug/` (with index.php)
- `/post-slug/` (simple permalinks)
- Numeric IDs in path

### API Endpoints Used
- Direct: `/wp-json/wp/v2/posts/{id}`
- Slug query: `/wp-json/wp/v2/posts?slug={slug}`

## Known Limitations

1. **Visual Differences**: CLI and web may have minor rendering differences due to p5.js vs node-canvas
2. **Memory**: Very large content (>10MB) may slow generation
3. **Browser Cache**: May need hard refresh (Ctrl+F5) after updates
4. **WordPress CORS**: Some WordPress sites may block cross-origin requests (rare)

## Future Enhancements

Potential improvements (not yet implemented):
- Semantic text analysis (NLP)
- Additional visual styles (geometric, data-viz)
- Portrait format (1200×1500px)
- Direct WordPress media upload from CLI
- Progress bars for CLI batch operations
- Custom color palette upload
- Manual parameter overrides in UI
- Image preview before download
- Batch download as ZIP

## Support & Documentation

- **Main README**: General overview and quick start
- **CLI-README**: Detailed CLI documentation
- **DEPLOY.md**: Web deployment instructions (in /deploy folder)
- **CLAUDE.md**: AI assistant guidance for development
- **Live Demo**: https://osmeusapontamentos.com/abstract-generator/

## License

MIT License

## Credits

**Technology**:
- p5.js for browser rendering
- node-canvas for server-side rendering
- commander for CLI framework
- jsdom & marked for content parsing

**Project**: Developed as a tool for generating social media images from blog content with deterministic, content-driven abstract art.
