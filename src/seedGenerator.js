/**
 * Seed Generator Module
 * Creates deterministic seed values from content metrics
 */

class SeedGenerator {
    constructor(metrics) {
        this.metrics = metrics;
    }

    /**
     * Generate a deterministic seed from content
     * This ensures the same content always produces the same visuals
     */
    generateSeed() {
        const { wordCount, characters, avgWordLength } = this.metrics;

        // Combine metrics to create a unique seed
        const seed = (wordCount * 137) + (characters * 31) + (avgWordLength * 17);

        return Math.abs(Math.floor(seed));
    }

    /**
     * Generate visual parameters based on content metrics
     */
    generateVisualParams() {
        const { wordCount, characters, avgWordLength, readingTime, paragraphCount } = this.metrics;

        // Map metrics to visual parameters
        // These will be used to control the generative art

        // Density: more words = more visual elements (normalized 0-1)
        const density = Math.min(wordCount / 1000, 1);

        // Complexity: longer content = more complex curves
        const complexity = Math.min(characters / 5000, 1);

        // Smoothness: longer words = smoother curves
        const smoothness = Math.min(avgWordLength / 10, 1);

        // Layers: reading time determines depth
        const layers = Math.min(readingTime, 10);

        // Shape vertices: paragraph count determines polygon complexity
        // Range: 3 (triangle) to 20 (complex polygon)
        const shapeVertices = Math.min(Math.max(paragraphCount, 3), 20);

        // Color palette index (based on content hash)
        const contentHash = this.hashContent(this.metrics.cleanContent);
        const paletteIndex = contentHash % 10; // 10 different palettes

        return {
            seed: this.generateSeed(),
            density,
            complexity,
            smoothness,
            layers,
            shapeVertices,
            paletteIndex
        };
    }

    /**
     * Simple hash function for content
     */
    hashContent(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}
