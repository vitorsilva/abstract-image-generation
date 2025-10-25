#!/usr/bin/env node

/**
 * Abstract Image Generator CLI
 * Command-line interface for generating abstract images from content
 */

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');
const ImageGenerator = require('./imageGenerator');
const FileProvider = require('./contentProviders/fileProvider');
const DirectoryProvider = require('./contentProviders/directoryProvider');
const WordPressProvider = require('./contentProviders/wordpressProvider');

const program = new Command();

// Load default config
const defaultConfigPath = path.join(__dirname, '../../config.json');
let defaultConfig = {};
if (fs.existsSync(defaultConfigPath)) {
    defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
}

program
    .name('abstract-image-gen')
    .description('Generate abstract images from blog content')
    .version('1.0.0');

/**
 * Generate command
 */
program
    .command('generate')
    .description('Generate images from content')
    .option('--source <type>', 'Content source type (file, directory, wordpress)', 'file')
    .option('--path <path>', 'Path to file or directory')
    .option('--url <url>', 'WordPress site URL')
    .option('--id <id>', 'Single item ID')
    .option('--all', 'Process all items')
    .option('--config <path>', 'Path to config file')
    .option('--crop-mode <mode>', 'Crop mode (direct, resize)')
    .option('--batch-size <number>', 'Batch size for processing', parseInt)
    .option('--output-dir <path>', 'Output directory')
    .action(async (options) => {
        try {
            // Load config
            const config = loadConfig(options);

            // Initialize logger
            const logger = new Logger(config);

            logger.info('Abstract Image Generator CLI');
            logger.info(`Source: ${options.source}`);
            logger.separator();

            // Create content provider
            const provider = createProvider(options, config, logger);

            // Validate provider
            await provider.validate();
            logger.info(`Provider: ${provider.getName()}`);

            // Initialize image generator
            const imageGen = new ImageGenerator(config, logger);

            // Get content items
            let items = [];
            if (options.id) {
                items = [await provider.getById(options.id)];
            } else if (options.all) {
                items = await provider.getAll();
            } else {
                logger.error('Please specify either --id or --all');
                process.exit(1);
            }

            logger.info(`Found ${items.length} item(s) to process`);
            logger.separator();

            // Generate images
            const startTime = Date.now();
            let successful = 0;
            let failed = 0;
            let imagesGenerated = 0;

            for (const item of items) {
                try {
                    const files = await imageGen.generateForItem(item);
                    successful++;
                    imagesGenerated += files.length;
                } catch (error) {
                    failed++;
                    logger.error(`Failed to process item ${item.id}: ${error.message}`);
                }
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            // Log summary
            logger.summary({
                total: items.length,
                successful,
                failed,
                imagesGenerated,
                duration: `${duration}s`
            });

            process.exit(failed > 0 ? 1 : 0);

        } catch (error) {
            console.error('Fatal error:', error.message);
            process.exit(1);
        }
    });

/**
 * List command
 */
program
    .command('list')
    .description('List available content items')
    .option('--source <type>', 'Content source type (file, directory, wordpress)', 'file')
    .option('--path <path>', 'Path to file or directory')
    .option('--url <url>', 'WordPress site URL')
    .option('--config <path>', 'Path to config file')
    .action(async (options) => {
        try {
            const config = loadConfig(options);
            const logger = new Logger(config);

            const provider = createProvider(options, config, logger);
            await provider.validate();

            const items = await provider.getAll();

            console.log(`\nFound ${items.length} item(s):\n`);
            items.forEach((item, index) => {
                console.log(`${index + 1}. [${item.id}] ${item.title}`);
                console.log(`   Content length: ${item.content.length} characters`);
                console.log();
            });

        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    });

/**
 * Config command
 */
program
    .command('config')
    .description('Show current configuration')
    .option('--config <path>', 'Path to config file')
    .action((options) => {
        const config = loadConfig(options);
        console.log('\nCurrent Configuration:\n');
        console.log(JSON.stringify(config, null, 2));
    });

/**
 * Helper: Load configuration
 */
function loadConfig(options) {
    let config = { ...defaultConfig };

    // Load custom config file if specified
    if (options.config) {
        const customConfig = JSON.parse(fs.readFileSync(options.config, 'utf-8'));
        config = { ...config, ...customConfig };
    }

    // Override with command-line options
    if (options.cropMode) {
        config.generation.cropMode = options.cropMode;
    }
    if (options.outputDir) {
        config.output.directory = options.outputDir;
    }

    return config;
}

/**
 * Helper: Create content provider
 */
function createProvider(options, config, logger) {
    const source = options.source || config.contentSource?.type || 'file';

    switch (source) {
        case 'file':
            const filePath = options.path || config.contentSource?.file?.path;
            if (!filePath) {
                throw new Error('File path required. Use --path option');
            }
            return new FileProvider(filePath);

        case 'directory':
            const dirPath = options.path || config.contentSource?.directory?.path;
            if (!dirPath) {
                throw new Error('Directory path required. Use --path option');
            }
            const extensions = config.contentSource?.directory?.extensions || ['.txt', '.html', '.md'];
            const recursive = config.contentSource?.directory?.recursive || false;
            return new DirectoryProvider(dirPath, extensions, recursive);

        case 'wordpress':
            const siteUrl = options.url || config.contentSource?.wordpress?.siteUrl;
            if (!siteUrl) {
                throw new Error('WordPress site URL required. Use --url option');
            }
            const postsPerBatch = config.contentSource?.wordpress?.postsPerBatch || 100;
            return new WordPressProvider(siteUrl, postsPerBatch);

        default:
            throw new Error(`Unknown source type: ${source}`);
    }
}

program.parse(process.argv);
