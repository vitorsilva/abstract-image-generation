/**
 * Base Content Provider Interface
 * All content providers must implement this interface
 */

class BaseProvider {
    /**
     * Get all content items
     * @returns {Promise<Array<{id: string, title: string, content: string}>>}
     */
    async getAll() {
        throw new Error('getAll() must be implemented by subclass');
    }

    /**
     * Get a single content item by ID
     * @param {string} id - The content item identifier
     * @returns {Promise<{id: string, title: string, content: string}>}
     */
    async getById(id) {
        throw new Error('getById() must be implemented by subclass');
    }

    /**
     * Get total count of content items
     * @returns {Promise<number>}
     */
    async count() {
        throw new Error('count() must be implemented by subclass');
    }

    /**
     * Validate that the provider is properly configured
     * @returns {Promise<boolean>}
     */
    async validate() {
        throw new Error('validate() must be implemented by subclass');
    }

    /**
     * Get a descriptive name for this provider
     * @returns {string}
     */
    getName() {
        return 'BaseProvider';
    }
}

module.exports = BaseProvider;
