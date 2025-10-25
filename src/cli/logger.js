/**
 * Logger Utility
 * Handles logging to console and file
 */

const fs = require('fs');
const path = require('path');

class Logger {
    constructor(config) {
        this.config = config;
        this.logFile = config.logging.logFile;
        this.logLevel = this.parseLogLevel(config.logging.logLevel);

        // Create log file directory if it doesn't exist
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Clear or create log file
        fs.writeFileSync(this.logFile, '');
    }

    parseLogLevel(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level.toLowerCase()] || 1;
    }

    shouldLog(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        return levels[level] >= this.logLevel;
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}`;
    }

    log(level, message) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message);

        // Write to console
        if (level === 'error') {
            console.error(formatted);
        } else if (level === 'warn') {
            console.warn(formatted);
        } else {
            console.log(formatted);
        }

        // Append to file
        fs.appendFileSync(this.logFile, formatted + '\n');
    }

    debug(message) {
        this.log('debug', message);
    }

    info(message) {
        this.log('info', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    error(message) {
        this.log('error', message);
    }

    /**
     * Log a separator line (useful for batch operations)
     */
    separator() {
        const line = '-'.repeat(80);
        console.log(line);
        fs.appendFileSync(this.logFile, line + '\n');
    }

    /**
     * Log a summary of results
     */
    summary(stats) {
        this.separator();
        this.info('Generation Summary:');
        this.info(`  Total items: ${stats.total}`);
        this.info(`  Successful: ${stats.successful}`);
        this.info(`  Failed: ${stats.failed}`);
        this.info(`  Images generated: ${stats.imagesGenerated}`);
        if (stats.duration) {
            this.info(`  Duration: ${stats.duration}`);
        }
        this.separator();
    }
}

module.exports = Logger;
