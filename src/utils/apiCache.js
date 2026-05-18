/**
 * Simple in-memory cache for API responses
 * Cache is cleared on page refresh
 */
class ApiCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get cached data for a key
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null if not found
     */
    get(key) {
        return this.cache.get(key) || null;
    }

    /**
     * Set cached data for a key
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    set(key, data) {
        this.cache.set(key, data);
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Clear specific cache entry
     * @param {string} key - Cache key
     */
    clear(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clearAll() {
        this.cache.clear();
    }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Cache keys constants
export const CACHE_KEYS = {
    TASKS: 'tasks',
    WORKLOGS: 'worklogs',
};

// Made with Bob
