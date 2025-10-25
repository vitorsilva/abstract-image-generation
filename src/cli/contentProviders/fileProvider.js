/**
 * File Content Provider
 * Reads content from a single file (txt, html, md)
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');
const BaseProvider = require('./baseProvider');

class FileProvider extends BaseProvider {
    /**
     * @param {string} filePath - Path to the content file
     */
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.cachedContent = null;
    }

    /**
     * Read and parse the file content
     * @returns {Promise<{id: string, title: string, content: string}>}
     */
    async readFile() {
        if (this.cachedContent) {
            return this.cachedContent;
        }

        const content = await fs.readFile(this.filePath, 'utf-8');
        const ext = path.extname(this.filePath).toLowerCase();
        const basename = path.basename(this.filePath, ext);

        let plainText = '';

        switch (ext) {
            case '.txt':
                plainText = content;
                break;

            case '.html':
            case '.htm':
                plainText = this.stripHtml(content);
                break;

            case '.md':
            case '.markdown':
                // Convert markdown to HTML, then strip HTML
                const html = marked(content);
                plainText = this.stripHtml(html);
                break;

            default:
                // Treat as plain text
                plainText = content;
        }

        this.cachedContent = {
            id: basename,
            title: basename.replace(/-|_/g, ' '),
            content: plainText.trim()
        };

        return this.cachedContent;
    }

    /**
     * Strip HTML tags and get plain text
     * @param {string} html - HTML content
     * @returns {string} Plain text
     */
    stripHtml(html) {
        const dom = new JSDOM(html);
        const text = dom.window.document.body.textContent || '';

        // Clean up whitespace
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
    }

    /**
     * Get all content items (single file returns array with one item)
     * @returns {Promise<Array<{id: string, title: string, content: string}>>}
     */
    async getAll() {
        const item = await this.readFile();
        return [item];
    }

    /**
     * Get content by ID (for single file, ID is the basename)
     * @param {string} id - The content identifier
     * @returns {Promise<{id: string, title: string, content: string}>}
     */
    async getById(id) {
        const item = await this.readFile();
        if (item.id !== id) {
            throw new Error(`File ID ${item.id} does not match requested ID ${id}`);
        }
        return item;
    }

    /**
     * Get count (always 1 for single file)
     * @returns {Promise<number>}
     */
    async count() {
        return 1;
    }

    /**
     * Validate that the file exists and is readable
     * @returns {Promise<boolean>}
     */
    async validate() {
        try {
            await fs.access(this.filePath, fs.constants.R_OK);
            return true;
        } catch (error) {
            throw new Error(`File not accessible: ${this.filePath} - ${error.message}`);
        }
    }

    /**
     * Get provider name
     * @returns {string}
     */
    getName() {
        return `FileProvider(${path.basename(this.filePath)})`;
    }
}

module.exports = FileProvider;
