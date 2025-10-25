/**
 * Main Application Logic
 * Handles UI interactions and orchestrates the image generation process
 */

class App {
    constructor() {
        this.currentSketch = null;
        this.sketches = {};
        this.metrics = null;
        this.visualParams = null;

        this.initEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // Input mode toggle
        document.getElementById('pasteBtn').addEventListener('click', () => {
            this.switchInputMode('paste');
        });

        document.getElementById('uploadBtn').addEventListener('click', () => {
            this.switchInputMode('upload');
        });

        document.getElementById('wordpressBtn').addEventListener('click', () => {
            this.switchInputMode('wordpress');
        });

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // WordPress load button
        document.getElementById('loadWordpressBtn').addEventListener('click', () => {
            this.loadFromWordPress();
        });

        // Allow Enter key in WordPress URL input
        document.getElementById('wordpressUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.loadFromWordPress();
            }
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateImages();
        });

        // Download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.downloadImage(e.target.dataset.format);
            });
        });
    }

    /**
     * Switch between paste, upload, and wordpress input modes
     */
    switchInputMode(mode) {
        const pasteBtn = document.getElementById('pasteBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const wordpressBtn = document.getElementById('wordpressBtn');
        const textArea = document.getElementById('contentInput');
        const fileInput = document.getElementById('fileInput');
        const wordpressInput = document.getElementById('wordpressInput');

        // Reset all buttons
        pasteBtn.classList.remove('active');
        uploadBtn.classList.remove('active');
        wordpressBtn.classList.remove('active');

        // Hide all inputs
        fileInput.style.display = 'none';
        wordpressInput.style.display = 'none';

        if (mode === 'paste') {
            pasteBtn.classList.add('active');
            textArea.style.display = 'block';
        } else if (mode === 'upload') {
            uploadBtn.classList.add('active');
            textArea.style.display = 'none';
            fileInput.style.display = 'block';
            fileInput.click();
        } else if (mode === 'wordpress') {
            wordpressBtn.classList.add('active');
            textArea.style.display = 'block';
            wordpressInput.style.display = 'block';
        }
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            document.getElementById('contentInput').value = text;
            this.switchInputMode('paste');
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        }
    }

    /**
     * Load content from WordPress post URL
     */
    async loadFromWordPress() {
        const urlInput = document.getElementById('wordpressUrl');
        const statusDiv = document.getElementById('wordpressStatus');
        const loadBtn = document.getElementById('loadWordpressBtn');
        const url = urlInput.value.trim();

        // Clear previous status
        statusDiv.className = 'status-message';
        statusDiv.textContent = '';

        if (!url) {
            statusDiv.className = 'status-message error';
            statusDiv.textContent = 'Please enter a WordPress post URL';
            return;
        }

        try {
            // Extract post ID or slug from URL
            const postInfo = this.parseWordPressUrl(url);

            // Show loading state
            statusDiv.className = 'status-message loading';
            statusDiv.textContent = 'Loading content from WordPress...';
            loadBtn.disabled = true;

            let post;

            // If identifier is numeric, fetch by ID directly
            if (postInfo.isId) {
                const apiUrl = `${postInfo.siteUrl}/wp-json/wp/v2/posts/${postInfo.identifier}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
                }

                post = await response.json();
            } else {
                // For slugs, use query parameter
                const apiUrl = `${postInfo.siteUrl}/wp-json/wp/v2/posts?slug=${postInfo.identifier}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
                }

                const posts = await response.json();

                if (!posts || posts.length === 0) {
                    throw new Error('Post not found');
                }

                post = posts[0]; // Get first match
            }

            // Extract and clean content
            const content = this.stripHtml(post.content.rendered);
            const title = this.stripHtml(post.title.rendered);

            // Populate textarea
            document.getElementById('contentInput').value = content;

            // Show success
            statusDiv.className = 'status-message success';
            statusDiv.textContent = `✓ Loaded: "${title}" (${content.length} characters)`;

        } catch (error) {
            console.error('WordPress load error:', error);
            statusDiv.className = 'status-message error';
            statusDiv.textContent = `Error: ${error.message}`;
        } finally {
            loadBtn.disabled = false;
        }
    }

    /**
     * Parse WordPress URL to extract site URL and post identifier
     */
    parseWordPressUrl(url) {
        try {
            const urlObj = new URL(url);
            const siteUrl = `${urlObj.protocol}//${urlObj.host}`;

            // Try to extract post ID from URL patterns
            // Pattern 1: ?p=123
            const pMatch = url.match(/[?&]p=(\d+)/);
            if (pMatch) {
                return { siteUrl, identifier: pMatch[1], isId: true };
            }

            // Pattern 2: Extract from path
            const pathParts = urlObj.pathname.split('/').filter(p => p);

            // Remove common WordPress path segments
            const filteredParts = pathParts.filter(part =>
                part !== 'index.php' &&
                !part.match(/^\d{4}$/) && // Year (2024)
                !part.match(/^\d{2}$/)    // Month/Day (10, 20)
            );

            // Get the last meaningful part (should be the slug)
            const lastPart = filteredParts[filteredParts.length - 1];

            // Check if it's a numeric ID
            if (/^\d+$/.test(lastPart)) {
                return { siteUrl, identifier: lastPart, isId: true };
            }

            // Otherwise it's a slug
            return { siteUrl, identifier: lastPart, isId: false };

        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    /**
     * Strip HTML tags from content while preserving paragraph structure
     */
    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Replace block elements with newlines before getting text
        const blockElements = temp.querySelectorAll('p, div, br, h1, h2, h3, h4, h5, h6, li, tr');
        blockElements.forEach(el => {
            if (el.tagName === 'BR') {
                el.replaceWith('\n');
            } else {
                // Add double newline after block elements to create paragraph separation
                const text = el.textContent || '';
                if (text.trim()) {
                    el.replaceWith(text + '\n\n');
                }
            }
        });

        // Get text content
        let text = temp.textContent || temp.innerText || '';

        // Clean up excessive whitespace while preserving paragraph breaks
        text = text
            .replace(/[ \t]+/g, ' ')           // Multiple spaces/tabs → single space
            .replace(/\n\n\n+/g, '\n\n')       // Multiple blank lines → double newline
            .replace(/\n /g, '\n')             // Remove spaces at start of lines
            .replace(/ \n/g, '\n')             // Remove spaces at end of lines
            .trim();

        return text;
    }

    /**
     * Generate images from content
     */
    generateImages() {
        const content = document.getElementById('contentInput').value.trim();

        if (!content) {
            alert('Please enter some content first!');
            return;
        }

        // Clean up previous sketches
        this.cleanupSketches();

        // Analyze content
        const analyzer = new ContentAnalyzer(content);
        this.metrics = analyzer.analyze();

        // Generate visual parameters
        const seedGen = new SeedGenerator(this.metrics);
        this.visualParams = seedGen.generateVisualParams();

        // Get user-defined stroke parameters
        const minStroke = parseFloat(document.getElementById('minStroke').value) || 0.5;
        const maxStroke = parseFloat(document.getElementById('maxStroke').value) || 1.5;

        // Add stroke parameters to visual params
        this.visualParams.minStroke = minStroke;
        this.visualParams.maxStroke = maxStroke;

        // Display metrics
        this.displayMetrics();

        // Generate master image at maximum size (1200×1200)
        // Then crop it to different formats
        this.generateMasterImage();

        // Show output section
        document.getElementById('outputSection').style.display = 'block';

        // Scroll to output
        document.getElementById('outputSection').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    /**
     * Display content metrics
     */
    displayMetrics() {
        const metricsDisplay = document.getElementById('metricsDisplay');

        metricsDisplay.innerHTML = `
            <div class="metric-item">
                <div class="metric-value">${this.metrics.wordCount}</div>
                <div class="metric-label">Words</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${this.metrics.paragraphCount}</div>
                <div class="metric-label">Paragraphs</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${this.metrics.characters}</div>
                <div class="metric-label">Characters</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${this.metrics.avgWordLength}</div>
                <div class="metric-label">Avg Word Length</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${this.metrics.readingTime} min</div>
                <div class="metric-label">Reading Time</div>
            </div>
        `;
    }

    /**
     * Generate master image and create cropped versions
     */
    generateMasterImage() {
        // Create a temporary container for the master image
        const tempContainer = document.createElement('div');
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);

        // Generate master image at maximum size (1200×1200)
        const visualGen = new VisualGenerator(this.visualParams, 1200, 1200);
        this.sketches.master = visualGen.generate(p5, tempContainer);

        // Wait for the sketch to finish drawing
        // p5 noLoop() means it draws once, so we can access it immediately
        // But we'll use a small timeout to be safe
        setTimeout(() => {
            this.createCroppedVersions();
            // Clean up temp container
            document.body.removeChild(tempContainer);
        }, 100);
    }

    /**
     * Create cropped versions from master image
     */
    createCroppedVersions() {
        const masterCanvas = this.sketches.master.canvas;

        // Get selected crop mode
        const cropMode = document.querySelector('input[name="cropMode"]:checked').value;

        // Create landscape version (1200×628)
        this.createCroppedCanvas(
            masterCanvas,
            'canvas-landscape',
            1200,
            628,
            'landscape',
            cropMode
        );

        // Create square version (1200×1200) - use full image
        this.createCroppedCanvas(
            masterCanvas,
            'canvas-square',
            1200,
            1200,
            'square',
            cropMode
        );
    }

    /**
     * Create a cropped canvas from master image
     */
    createCroppedCanvas(sourceCanvas, containerId, width, height, formatName, cropMode = 'direct') {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous canvas

        // Create new canvas for the cropped version
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;

        const ctx = croppedCanvas.getContext('2d');

        if (cropMode === 'resize') {
            // Resize + Crop mode: Scale to fit target aspect ratio, then crop
            this.resizeAndCrop(ctx, sourceCanvas, width, height);
        } else {
            // Direct Crop mode: Crop directly from top-left (faster, current behavior)
            ctx.drawImage(
                sourceCanvas,
                0, 0, width, height,  // Source rectangle (crop from top-left)
                0, 0, width, height   // Destination rectangle
            );
        }

        // Add to container
        container.appendChild(croppedCanvas);

        // Store reference for download
        this.sketches[formatName] = {
            canvas: croppedCanvas
        };
    }

    /**
     * Resize and crop image to fit target dimensions
     * Scales the source to cover the target while maintaining aspect ratio,
     * then crops from center
     */
    resizeAndCrop(ctx, sourceCanvas, targetWidth, targetHeight) {
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;

        // Calculate aspect ratios
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = targetWidth / targetHeight;

        let scaleWidth, scaleHeight;
        let sourceX = 0, sourceY = 0;
        let drawWidth, drawHeight;

        // Scale to cover the target dimensions while maintaining aspect ratio
        if (sourceAspect > targetAspect) {
            // Source is wider - fit to height
            scaleHeight = targetHeight;
            scaleWidth = sourceWidth * (targetHeight / sourceHeight);
            sourceX = (scaleWidth - targetWidth) / 2;
            drawWidth = scaleWidth;
            drawHeight = scaleHeight;
        } else {
            // Source is taller or equal - fit to width
            scaleWidth = targetWidth;
            scaleHeight = sourceHeight * (targetWidth / sourceWidth);
            sourceY = (scaleHeight - targetHeight) / 2;
            drawWidth = scaleWidth;
            drawHeight = scaleHeight;
        }

        // Create a temporary canvas for the resized image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = drawWidth;
        tempCanvas.height = drawHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the scaled image to temp canvas
        tempCtx.drawImage(
            sourceCanvas,
            0, 0, sourceWidth, sourceHeight,
            0, 0, drawWidth, drawHeight
        );

        // Draw the cropped portion from temp canvas to final canvas
        ctx.drawImage(
            tempCanvas,
            sourceX, sourceY, targetWidth, targetHeight,  // Source rectangle (crop from center)
            0, 0, targetWidth, targetHeight               // Destination rectangle
        );
    }

    /**
     * Download image
     */
    downloadImage(format) {
        const sketch = this.sketches[format];
        if (!sketch) {
            alert('Image not generated yet!');
            return;
        }

        // Get the canvas
        const canvas = sketch.canvas;

        // Create filename from first few words of content
        const words = this.metrics.words.slice(0, 3).join('-');
        const filename = `abstract-${words}-${format}.png`;

        // Create download link
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    /**
     * Clean up previous p5 sketches
     */
    cleanupSketches() {
        // Remove p5 sketches (master sketch has a remove method)
        Object.values(this.sketches).forEach(sketch => {
            if (sketch && sketch.remove) {
                sketch.remove();
            }
        });
        this.sketches = {};

        // Clear containers
        document.getElementById('canvas-landscape').innerHTML = '';
        document.getElementById('canvas-square').innerHTML = '';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
