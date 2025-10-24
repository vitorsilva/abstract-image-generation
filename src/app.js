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

        // Generate images for different sizes
        this.generateLandscape();
        this.generateSquare();

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
     * Generate landscape format (1200×628)
     */
    generateLandscape() {
        const container = document.getElementById('canvas-landscape');
        container.innerHTML = ''; // Clear previous canvas

        const visualGen = new VisualGenerator(this.visualParams, 1200, 628);
        this.sketches.landscape = visualGen.generate(p5, container);
    }

    /**
     * Generate square format (1200×1200)
     */
    generateSquare() {
        const container = document.getElementById('canvas-square');
        container.innerHTML = ''; // Clear previous canvas

        const visualGen = new VisualGenerator(this.visualParams, 1200, 1200);
        this.sketches.square = visualGen.generate(p5, container);
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

        // Get the canvas from the p5 sketch
        const canvas = sketch.canvas;

        // Create filename from first few words of content
        const words = this.metrics.words.slice(0, 3).join('-');
        const filename = `abstract-${words}-${format}.png`;

        // Download using p5's saveCanvas
        sketch.saveCanvas(canvas, filename, 'png');
    }

    /**
     * Clean up previous p5 sketches
     */
    cleanupSketches() {
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
