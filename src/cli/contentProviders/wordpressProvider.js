/**
 * WordPress Content Provider
 * Fetches content from WordPress REST API
 */

const { JSDOM } = require('jsdom');
const BaseProvider = require('./baseProvider');

class WordPressProvider extends BaseProvider {
    /**
     * @param {string} siteUrl - WordPress site URL
     * @param {number} postsPerPage - Number of posts to fetch per request (default: 100)
     */
    constructor(siteUrl, postsPerPage = 100) {
        super();
        this.siteUrl = siteUrl.replace(/\/$/, ''); // Remove trailing slash
        this.postsPerPage = postsPerPage;
        this.cachedPosts = null;
    }

    /**
     * Fetch all posts from WordPress
     * @returns {Promise<Array>}
     */
    async fetchAllPosts() {
        if (this.cachedPosts) {
            return this.cachedPosts;
        }

        const posts = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const url = `${this.siteUrl}/wp-json/wp/v2/posts?per_page=${this.postsPerPage}&page=${page}`;

            try {
                const response = await fetch(url);

                if (!response.ok) {
                    if (response.status === 400 && page > 1) {
                        // No more pages
                        hasMore = false;
                        break;
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const pagePosts = await response.json();

                if (pagePosts.length === 0) {
                    hasMore = false;
                } else {
                    posts.push(...pagePosts);
                    page++;

                    // Check if there are more pages from headers
                    const totalPages = response.headers.get('X-WP-TotalPages');
                    if (totalPages && page > parseInt(totalPages)) {
                        hasMore = false;
                    }
                }
            } catch (error) {
                throw new Error(`Failed to fetch posts from WordPress: ${error.message}`);
            }
        }

        this.cachedPosts = posts;
        return posts;
    }

    /**
     * Fetch a single post by ID
     */
    async fetchPostById(id) {
        const url = `${this.siteUrl}/wp-json/wp/v2/posts/${id}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch post ${id}: ${error.message}`);
        }
    }

    /**
     * Convert WordPress post to content item
     */
    postToItem(post) {
        // Extract plain text from HTML content
        const content = this.stripHtml(post.content.rendered);
        const title = this.stripHtml(post.title.rendered);

        return {
            id: post.id.toString(),
            title: title,
            content: content,
            slug: post.slug,
            date: post.date
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
        const posts = await this.fetchAllPosts();
        return posts.map(post => this.postToItem(post));
    }

    /**
     * Get content by ID
     * @param {string} id - Post ID
     * @returns {Promise<{id: string, title: string, content: string}>}
     */
    async getById(id) {
        const post = await this.fetchPostById(id);
        return this.postToItem(post);
    }

    /**
     * Get count of posts
     * @returns {Promise<number>}
     */
    async count() {
        const posts = await this.fetchAllPosts();
        return posts.length;
    }

    /**
     * Validate that WordPress REST API is accessible
     * @returns {Promise<boolean>}
     */
    async validate() {
        try {
            const url = `${this.siteUrl}/wp-json/wp/v2/posts?per_page=1`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            throw new Error(`WordPress site not accessible: ${this.siteUrl} - ${error.message}`);
        }
    }

    /**
     * Get provider name
     * @returns {string}
     */
    getName() {
        return `WordPressProvider(${this.siteUrl})`;
    }
}

module.exports = WordPressProvider;
