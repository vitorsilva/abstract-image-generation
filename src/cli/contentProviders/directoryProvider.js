/**
 * Directory Content Provider
 * Reads content from multiple files in a directory
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const { marked } = require('marked');
const BaseProvider = require('./baseProvider');

class DirectoryProvider extends BaseProvider {
    /**
     * @param {string} directoryPath - Path to the directory
     * @param {Array<string>} extensions - File extensions to include (default: ['.txt', '.html', '.md'])
     * @param {boolean} recursive - Whether to search recursively (default: false)
     */
    constructor(directoryPath, extensions = ['.txt', '.html', '.md'], recursive = false) {
        super();
        this.directoryPath = directoryPath;
        this.extensions = extensions;
        this.recursive = recursive;
        this.cachedFiles = null;
    }

    /**
     * Get all files in the directory
     * @returns {Promise<Array<string>>}
     */
    async getFiles() {
        if (this.cachedFiles) {
            return this.cachedFiles;
        }

        const files = await this.scanDirectory(this.directoryPath);
        this.cachedFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return this.extensions.includes(ext);
        });

        return this.cachedFiles;
    }

    /**
     * Recursively scan directory for files
     */
    async scanDirectory(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (this.recursive) {
                    const subFiles = await this.scanDirectory(fullPath);
                    files.push(...subFiles);
                }
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Read and parse a file
     */
    async readFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath).toLowerCase();
        const basename = path.basename(filePath, ext);

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
                const html = marked(content);
                plainText = this.stripHtml(html);
                break;

            default:
                plainText = content;
        }

        return {
            id: basename,
            title: basename.replace(/-|_/g, ' '),
            content: plainText.trim(),
            filePath: filePath
        };
    }

    /**
     * Strip HTML tags
     */
    stripHtml(html) {
        const dom = new JSDOM(html);
        const text = dom.window.document.body.textContent || '';

        return text
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
    }

    /**
     * Get all content items
     * @returns {Promise<Array<{id: string, title: string, content: string}>>}
     */
    async getAll() {
        const files = await this.getFiles();
        const items = [];

        for (const file of files) {
            try {
                const item = await this.readFile(file);
                items.push(item);
            } catch (error) {
                console.warn(`Warning: Failed to read file ${file}: ${error.message}`);
            }
        }

        return items;
    }

    /**
     * Get content by ID (file basename)
     * @param {string} id - The content identifier (filename without extension)
     * @returns {Promise<{id: string, title: string, content: string}>}
     */
    async getById(id) {
        const files = await this.getFiles();

        for (const file of files) {
            const basename = path.basename(file, path.extname(file));
            if (basename === id) {
                return await this.readFile(file);
            }
        }

        throw new Error(`File with ID ${id} not found in directory`);
    }

    /**
     * Get count of files
     * @returns {Promise<number>}
     */
    async count() {
        const files = await this.getFiles();
        return files.length;
    }

    /**
     * Validate that directory exists and is readable
     * @returns {Promise<boolean>}
     */
    async validate() {
        try {
            const stats = await fs.stat(this.directoryPath);
            if (!stats.isDirectory()) {
                throw new Error(`Path is not a directory: ${this.directoryPath}`);
            }
            return true;
        } catch (error) {
            throw new Error(`Directory not accessible: ${this.directoryPath} - ${error.message}`);
        }
    }

    /**
     * Get provider name
     * @returns {string}
     */
    getName() {
        return `DirectoryProvider(${this.directoryPath})`;
    }
}

module.exports = DirectoryProvider;
