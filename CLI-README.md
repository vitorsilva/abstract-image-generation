# Abstract Image Generator CLI

Command-line interface for generating abstract images from blog content.

## Features

- **Multiple Content Sources**: WordPress REST API, local files, or directories
- **Deterministic Generation**: Same content always produces the same images
- **Multiple Formats**: Landscape (1200×628) and Square (1200×1200)
- **Configurable**: Crop modes, stroke thickness, output directories
- **Batch Processing**: Process multiple posts at once
- **Logging**: Detailed logs to file and console

## Installation

The CLI is already installed with the project dependencies:

```bash
npm install
```

## Quick Reference

**Common Commands:**
```bash
# WordPress - single post
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --id 26136

# WordPress - all posts (careful, may take time!)
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --all

# Single file
.\gen.bat --source file --path article.txt --all

# Directory of files
.\gen.bat --source directory --path ./posts/ --all

# List WordPress posts
node src/cli/cli.js list --source wordpress --url https://osmeusapontamentos.com

# Use resize crop mode
.\gen.bat --source file --path test.txt --all --crop-mode resize
```

> **Windows users:** Use `.\gen.bat`
> **Linux/Mac users:** Use `node src/cli/cli.js generate`

## Quick Start

**Recommended: Use the batch file wrapper (Windows) or direct node command:**

### Generate from a Single File

```bash
# Using batch file (Windows)
.\gen.bat --source file --path test-content.txt --all

# Or direct node command (all platforms)
node src/cli/cli.js generate --source file --path test-content.txt --all
```

### Generate from WordPress

Single post:
```bash
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --id 26136

# Or direct:
node src/cli/cli.js generate --source wordpress --url https://osmeusapontamentos.com --id 26136
```

All posts (this may take a while):
```bash
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --all
```

### Generate from Directory

Process all `.txt`, `.html`, and `.md` files in a directory:
```bash
.\gen.bat --source directory --path ./content/ --all

# Or direct:
node src/cli/cli.js generate --source directory --path ./content/ --all
```

> **Note:** The `gen.bat` wrapper is provided for convenience on Windows. For Linux/Mac, use the direct node command or create a shell script alias.

## Commands

### `generate`

Generate images from content.

**Options:**
- `--source <type>` - Content source: `file`, `directory`, or `wordpress` (default: `file`)
- `--path <path>` - Path to file or directory (required for file/directory sources)
- `--url <url>` - WordPress site URL (required for wordpress source)
- `--id <id>` - Generate for a single item by ID
- `--all` - Generate for all items
- `--config <path>` - Path to custom config file
- `--crop-mode <mode>` - Crop mode: `direct` or `resize` (default: `direct`)
- `--output-dir <path>` - Custom output directory

**Examples:**

```bash
# Single file (Windows)
.\gen.bat --source file --path my-post.txt --all

# Single file (all platforms)
node src/cli/cli.js generate --source file --path my-post.txt --all

# Directory
.\gen.bat --source directory --path ./posts/ --all

# WordPress - single post
.\gen.bat --source wordpress --url https://example.com --id 123

# WordPress - all posts
.\gen.bat --source wordpress --url https://example.com --all

# With custom crop mode
.\gen.bat --source file --path my-post.txt --all --crop-mode resize

# With custom output directory
.\gen.bat --source file --path my-post.txt --all --output-dir ./my-images/
```

### `list`

List available content items without generating images.

**Examples:**

```bash
# List WordPress posts
.\gen.bat --source wordpress --url https://example.com
# Then run: node src/cli/cli.js list --source wordpress --url https://example.com

# List files in directory
node src/cli/cli.js list --source directory --path ./posts/
```

### `config`

Show current configuration.

```bash
node src/cli/cli.js config

# Or with custom config file
node src/cli/cli.js config --config my-config.json
```

## Command Line Wrappers

### Windows: gen.bat

A batch file wrapper is provided for convenience on Windows:

```bash
.\gen.bat --source wordpress --url https://osmeusapontamentos.com --id 26136
```

This is equivalent to:
```bash
node src/cli/cli.js generate --source wordpress --url https://osmeusapontamentos.com --id 26136
```

### Linux/Mac: Create a shell alias

For Linux or Mac, you can create a shell alias. Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias gen='node src/cli/cli.js generate'
```

Then use:
```bash
gen --source wordpress --url https://example.com --id 123
```

## Configuration

The default configuration is in `config.json`. You can create custom config files or override settings via command-line options.

### Config Structure

```json
{
  "contentSource": {
    "type": "wordpress",
    "wordpress": {
      "siteUrl": "https://osmeusapontamentos.com",
      "postsPerBatch": 10
    },
    "file": {
      "path": "./content/my-post.txt"
    },
    "directory": {
      "path": "./content/posts/",
      "extensions": [".txt", ".html", ".md"],
      "recursive": false
    }
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

### Crop Modes

- **`direct`** (default): Crops directly from top-left of master image. Faster, shows top portion of composition.
- **`resize`**: Scales image to fit target aspect ratio first, then crops from center. Better for centering composition.

## Content Sources

### 1. File Provider

Reads content from a single file.

**Supported formats:**
- `.txt` - Plain text
- `.html` / `.htm` - HTML (strips tags)
- `.md` / `.markdown` - Markdown (converts to text)

**Example:**
```bash
node src/cli/cli.js generate --source file --path article.md --all
```

### 2. Directory Provider

Reads content from all files in a directory.

**Configuration:**
- `extensions`: Array of file extensions to include (default: `['.txt', '.html', '.md']`)
- `recursive`: Whether to scan subdirectories (default: `false`)

**Example:**
```bash
node src/cli/cli.js generate --source directory --path ./blog-posts/ --all
```

### 3. WordPress Provider

Fetches content from WordPress REST API.

**Requirements:**
- WordPress site with REST API enabled (enabled by default in WordPress 4.7+)
- Site must be publicly accessible

**Configuration:**
- `siteUrl`: Your WordPress site URL
- `postsPerBatch`: Number of posts to fetch per API request (default: `100`)

**Example:**
```bash
node src/cli/cli.js generate --source wordpress --url https://example.com --all
```

## Output

Generated images are saved to `./generated-images/` by default.

**File naming pattern:** `{id}-{format}.png`

Examples:
- `test-content-landscape.png`
- `test-content-square.png`
- `26136-landscape.png`
- `26136-square.png`

## Logging

Logs are written to both console and `generation.log` file.

**Log levels:** `debug`, `info`, `warn`, `error`

**Example log output:**
```
[2025-10-25 14:06:35] [INFO ] Abstract Image Generator CLI
[2025-10-25 14:06:35] [INFO ] Source: wordpress
--------------------------------------------------------------------------------
[2025-10-25 14:06:35] [INFO ] Provider: WordPressProvider(https://osmeusapontamentos.com)
[2025-10-25 14:06:36] [INFO ] Found 1 item(s) to process
--------------------------------------------------------------------------------
[2025-10-25 14:06:36] [INFO ] Processing item 26136: "Tools matter…"
[2025-10-25 14:06:36] [INFO ] Generated landscape (1200×628) for item 26136
[2025-10-25 14:06:37] [INFO ] Generated square (1200×1200) for item 26136
--------------------------------------------------------------------------------
[2025-10-25 14:06:37] [INFO ] Generation Summary:
[2025-10-25 14:06:37] [INFO ]   Total items: 1
[2025-10-25 14:06:37] [INFO ]   Successful: 1
[2025-10-25 14:06:37] [INFO ]   Failed: 0
[2025-10-25 14:06:37] [INFO ]   Images generated: 2
[2025-10-25 14:06:37] [INFO ]   Duration: 0.93s
--------------------------------------------------------------------------------
```

## Use Cases

### Batch Generate for Entire Blog

```bash
# Generate images for all WordPress posts
node src/cli/cli.js generate --source wordpress --url https://your-blog.com --all

# Images will be saved to ./generated-images/
# Check generation.log for any errors
```

### Test with Local Files

```bash
# Create test content
echo "This is my blog post about AI..." > test.txt

# Generate images
node src/cli/cli.js generate --source file --path test.txt --all

# Check output
ls -lh generated-images/
```

### Export from WordPress, Generate Locally

```bash
# Export WordPress posts to local files (using WP CLI or export tool)
# Then generate from local directory
node src/cli/cli.js generate --source directory --path ./exported-posts/ --all
```

## Architecture

The CLI uses a modular provider architecture:

```
src/
├── core/                           # Shared code (browser + CLI)
│   ├── contentAnalyzer.js         # Text analysis
│   ├── seedGenerator.js           # Parameter generation
│   └── visualGeneratorNode.js    # Image generation (Node.js)
│
├── cli/                            # CLI-specific code
│   ├── cli.js                      # Main CLI interface
│   ├── imageGenerator.js          # Orchestrator
│   ├── logger.js                   # Logging utility
│   └── contentProviders/          # Pluggable content sources
│       ├── baseProvider.js         # Interface
│       ├── fileProvider.js         # Single file
│       ├── directoryProvider.js    # Multiple files
│       └── wordpressProvider.js    # WordPress REST API
│
└── web/                            # Web interface (separate)
    └── app.js
```

## Web Interface

The web interface is still available and unchanged:

```bash
npm start
```

This opens the browser interface at http://localhost:8080

Both interfaces share the same core generation logic, ensuring consistent results.

## Troubleshooting

### "File not accessible" Error

Make sure the file path is correct and the file exists:
```bash
ls test-content.txt
```

### "WordPress site not accessible" Error

Check that:
1. The site URL is correct
2. The site is publicly accessible
3. WordPress REST API is enabled (try visiting `https://your-site.com/wp-json/wp/v2/posts`)

### "Canvas" Installation Errors

If you encounter errors installing the `canvas` package:
- On Windows: Requires Visual Studio Build Tools
- On Linux: `sudo apt-get install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++`
- On macOS: Should work out of the box

### Images Look Different from Web Version

This is expected! The CLI uses node-canvas while the web uses p5.js. The visual style is the same, but minor rendering differences may occur.

## Next Steps

Future enhancements planned:
- Direct upload to WordPress media library
- Portrait format (1200×1500)
- Parallel processing for faster batch generation
- Progress bars for long operations
- More content sources (Ghost, Medium, RSS feeds)
