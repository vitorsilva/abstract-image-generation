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

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e);
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
     * Switch between paste and upload input modes
     */
    switchInputMode(mode) {
        const pasteBtn = document.getElementById('pasteBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const textArea = document.getElementById('contentInput');
        const fileInput = document.getElementById('fileInput');

        if (mode === 'paste') {
            pasteBtn.classList.add('active');
            uploadBtn.classList.remove('active');
            textArea.style.display = 'block';
            fileInput.style.display = 'none';
        } else {
            uploadBtn.classList.add('active');
            pasteBtn.classList.remove('active');
            textArea.style.display = 'none';
            fileInput.style.display = 'block';
            fileInput.click();
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

        // Create landscape version (1200×628) - crop from top-left
        this.createCroppedCanvas(
            masterCanvas,
            'canvas-landscape',
            1200,
            628,
            'landscape'
        );

        // Create square version (1200×1200) - use full image
        this.createCroppedCanvas(
            masterCanvas,
            'canvas-square',
            1200,
            1200,
            'square'
        );
    }

    /**
     * Create a cropped canvas from master image
     */
    createCroppedCanvas(sourceCanvas, containerId, width, height, formatName) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous canvas

        // Create new canvas for the cropped version
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;

        // Get context and draw cropped portion from master
        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(
            sourceCanvas,
            0, 0, width, height,  // Source rectangle (crop from top-left)
            0, 0, width, height   // Destination rectangle
        );

        // Add to container
        container.appendChild(croppedCanvas);

        // Store reference for download
        this.sketches[formatName] = {
            canvas: croppedCanvas
        };
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
