/**
 * Image Generator Orchestrator
 * Coordinates the entire image generation pipeline
 */

const fs = require('fs').promises;
const path = require('path');
const ContentAnalyzer = require('../core/contentAnalyzer');
const SeedGenerator = require('../core/seedGenerator');
const VisualGeneratorNode = require('../core/visualGeneratorNode');

class ImageGenerator {
    /**
     * @param {Object} config - Generation configuration
     * @param {Logger} logger - Logger instance
     */
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    /**
     * Generate images for a content item
     * @param {Object} item - Content item {id, title, content}
     * @returns {Promise<Array<string>>} Array of generated file paths
     */
    async generateForItem(item) {
        this.logger.info(`Processing item ${item.id}: "${item.title}"`);

        try {
            // Validate content
            if (!item.content || item.content.trim().length === 0) {
                this.logger.warn(`Skipping item ${item.id}: empty content`);
                return [];
            }

            // Step 1: Analyze content
            this.logger.debug(`Analyzing content for item ${item.id}`);
            const analyzer = new ContentAnalyzer(item.content);
            const metrics = analyzer.analyze();

            this.logger.debug(`Metrics: ${metrics.wordCount} words, ${metrics.characters} chars, ${metrics.paragraphCount} paragraphs`);

            // Step 2: Generate visual parameters
            const seedGen = new SeedGenerator(metrics);
            const visualParams = seedGen.generateVisualParams();

            // Add user-defined stroke parameters
            visualParams.minStroke = this.config.generation.minStroke;
            visualParams.maxStroke = this.config.generation.maxStroke;

            this.logger.debug(`Visual params: seed=${visualParams.seed}, density=${visualParams.density.toFixed(2)}, palette=${visualParams.paletteIndex}`);

            // Step 3: Generate images for each format
            const generatedFiles = [];
            const formats = this.getFormats();

            for (const format of formats) {
                try {
                    const filePath = await this.generateFormat(item, visualParams, format);
                    generatedFiles.push(filePath);
                    this.logger.info(`Generated ${format.name} (${format.width}×${format.height}) for item ${item.id}`);
                } catch (error) {
                    this.logger.error(`Failed to generate ${format.name} for item ${item.id}: ${error.message}`);
                }
            }

            return generatedFiles;

        } catch (error) {
            this.logger.error(`Failed to process item ${item.id}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generate a specific format
     */
    async generateFormat(item, visualParams, format) {
        // Generate master image at maximum size
        const masterSize = 1200;
        const masterCanvas = this.generateMasterImage(visualParams, masterSize);

        // Apply cropping strategy
        const finalCanvas = this.applyCropMode(masterCanvas, format.width, format.height);

        // Save to file
        const fileName = this.getFileName(item.id, format.name);
        const outputPath = path.join(this.config.output.directory, fileName);

        // Ensure output directory exists
        await fs.mkdir(this.config.output.directory, { recursive: true });

        // Save as PNG
        const buffer = finalCanvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);

        return outputPath;
    }

    /**
     * Generate master image at full size
     */
    generateMasterImage(visualParams, size) {
        const generator = new VisualGeneratorNode(visualParams, size, size);
        return generator.generate();
    }

    /**
     * Apply crop mode to canvas
     */
    applyCropMode(sourceCanvas, targetWidth, targetHeight) {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(targetWidth, targetHeight);
        const ctx = canvas.getContext('2d');

        if (this.config.generation.cropMode === 'resize') {
            // Resize + Crop mode
            this.resizeAndCrop(ctx, sourceCanvas, targetWidth, targetHeight);
        } else {
            // Direct Crop mode (default)
            ctx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
        }

        return canvas;
    }

    /**
     * Resize and crop image to fit target dimensions
     */
    resizeAndCrop(ctx, sourceCanvas, targetWidth, targetHeight) {
        const { createCanvas } = require('canvas');
        const sourceWidth = sourceCanvas.width;
        const sourceHeight = sourceCanvas.height;

        // Calculate aspect ratios
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = targetWidth / targetHeight;

        let scaleWidth, scaleHeight;
        let sourceX = 0, sourceY = 0;

        // Scale to cover the target dimensions
        if (sourceAspect > targetAspect) {
            // Source is wider - fit to height
            scaleHeight = targetHeight;
            scaleWidth = sourceWidth * (targetHeight / sourceHeight);
            sourceX = (scaleWidth - targetWidth) / 2;
        } else {
            // Source is taller - fit to width
            scaleWidth = targetWidth;
            scaleHeight = sourceHeight * (targetWidth / sourceWidth);
            sourceY = (scaleHeight - targetHeight) / 2;
        }

        // Create temp canvas for resized image
        const tempCanvas = createCanvas(scaleWidth, scaleHeight);
        const tempCtx = tempCanvas.getContext('2d');

        // Draw scaled image
        tempCtx.drawImage(sourceCanvas, 0, 0, sourceWidth, sourceHeight, 0, 0, scaleWidth, scaleHeight);

        // Draw cropped portion to final canvas
        ctx.drawImage(tempCanvas, sourceX, sourceY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
    }

    /**
     * Get formats to generate
     */
    getFormats() {
        const formatMap = {
            'landscape': { name: 'landscape', width: 1200, height: 628 },
            'square': { name: 'square', width: 1200, height: 1200 }
        };

        return this.config.generation.formats.map(name => formatMap[name]);
    }

    /**
     * Get file name for output
     */
    getFileName(id, format) {
        const pattern = this.config.output.filenamePattern;
        return pattern.replace('{id}', id).replace('{format}', format);
    }
}

module.exports = ImageGenerator;
