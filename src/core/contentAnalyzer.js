/**
 * Content Analyzer Module
 * Extracts simple metrics from text content
 */

class ContentAnalyzer {
    constructor(content) {
        this.rawContent = content;
        this.cleanContent = this.cleanText(content);
    }

    /**
     * Clean HTML and extra whitespace from content
     */
    cleanText(text) {
        // Remove HTML tags
        let cleaned = text.replace(/<[^>]*>/g, ' ');

        // Decode common HTML entities
        cleaned = cleaned
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Normalize whitespace
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        return cleaned;
    }

    /**
     * Extract all metrics
     */
    analyze() {
        const words = this.getWords();
        const characters = this.cleanContent.length;
        const wordCount = words.length;
        const avgWordLength = wordCount > 0
            ? words.reduce((sum, word) => sum + word.length, 0) / wordCount
            : 0;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min
        const paragraphCount = this.getParagraphCount();

        return {
            characters,
            wordCount,
            avgWordLength: Math.round(avgWordLength * 10) / 10,
            readingTime,
            paragraphCount,
            words,
            cleanContent: this.cleanContent
        };
    }

    /**
     * Get array of words
     */
    getWords() {
        return this.cleanContent
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .map(word => word.replace(/[^\w]/g, ''))
            .filter(word => word.length > 0);
    }

    /**
     * Count paragraphs in content
     */
    getParagraphCount() {
        // First, try to count <p> tags if HTML is present
        const htmlParagraphs = this.rawContent.match(/<p[^>]*>/gi);
        if (htmlParagraphs && htmlParagraphs.length > 0) {
            return htmlParagraphs.length;
        }

        // Otherwise, count by double line breaks in original content
        // Split by multiple newlines or carriage returns
        const paragraphs = this.rawContent
            .split(/\n\s*\n|\r\n\s*\r\n/)
            .filter(para => para.trim().length > 0);

        // Ensure at least 1 paragraph if there's content
        return Math.max(paragraphs.length, 1);
    }

    /**
     * Get content hash (simple implementation for seed generation)
     */
    getHash() {
        let hash = 0;
        const str = this.cleanContent;

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash);
    }
}

// Export for Node.js, keep available globally for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentAnalyzer;
}
