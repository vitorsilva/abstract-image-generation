/**
 * Visual Generator Module for Node.js
 * Creates organic, flowing abstract art using node-canvas
 * This is the Node.js version that doesn't rely on p5.js
 */

const { createCanvas } = require('canvas');

class VisualGeneratorNode {
    constructor(params, width, height) {
        this.params = params;
        this.width = width;
        this.height = height;
        this.colorPalettes = this.initColorPalettes();

        // Initialize seeded random number generator
        this.rng = new SeededRandom(params.seed);
        this.noise = new PerlinNoise(params.seed);
    }

    /**
     * Initialize color palettes (same as browser version)
     */
    initColorPalettes() {
        return [
            // Sunset warmth
            {
                bg: ['#FF6B6B', '#FFE66D'],
                accents: ['#4ECDC4', '#FF6B9D', '#C44569']
            },
            // Ocean depths
            {
                bg: ['#667eea', '#764ba2'],
                accents: ['#f093fb', '#4facfe', '#43e97b']
            },
            // Forest serenity
            {
                bg: ['#134E5E', '#71B280'],
                accents: ['#A8E6CF', '#DCEDC1', '#FFD3B6']
            },
            // Purple dream
            {
                bg: ['#A770EF', '#CF8BF3'],
                accents: ['#FDB99B', '#E8D5B7', '#B8E1DD']
            },
            // Cosmic night
            {
                bg: ['#0F2027', '#203A43', '#2C5364'],
                accents: ['#F857A6', '#FF5858', '#FFC371']
            },
            // Peachy keen
            {
                bg: ['#FFA07A', '#FF6B9D'],
                accents: ['#C44569', '#8B4367', '#1F4068']
            },
            // Mint fresh
            {
                bg: ['#56CCF2', '#2F80ED'],
                accents: ['#6FCF97', '#F2C94C', '#EB5757']
            },
            // Lavender fields
            {
                bg: ['#D4A5A5', '#9A86A4'],
                accents: ['#6C9A8B', '#E9B384', '#F4F2DE']
            },
            // Coral reef
            {
                bg: ['#FF9A8B', '#FF6A88'],
                accents: ['#FF99AC', '#FFEAA7', '#74B9FF']
            },
            // Northern lights
            {
                bg: ['#00B4DB', '#0083B0'],
                accents: ['#74EBD5', '#ACB6E5', '#86A8E7']
            }
        ];
    }

    /**
     * Generate the canvas
     * @returns {Canvas} node-canvas Canvas object
     */
    generate() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        const palette = this.colorPalettes[this.params.paletteIndex];

        // Draw gradient background
        this.drawGradientBackground(ctx, palette.bg);

        // Draw flowing organic shapes
        this.drawOrganicFlows(ctx, palette.accents);

        // Draw noise texture overlay
        this.drawNoiseTexture(ctx);

        return canvas;
    }

    /**
     * Draw gradient background
     */
    drawGradientBackground(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors.length > 1 ? colors[1] : colors[0]);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draw organic flowing shapes
     */
    drawOrganicFlows(ctx, accentColors) {
        const numLayers = Math.max(3, Math.floor(this.params.layers));
        const numFlows = Math.floor(5 + this.params.density * 10);
        const noiseScale = 0.005 / (this.params.smoothness + 0.1);
        const shapeVertices = this.params.shapeVertices || 8;

        for (let layer = 0; layer < numLayers; layer++) {
            for (let flow = 0; flow < numFlows; flow++) {
                const color = accentColors[flow % accentColors.length];
                ctx.fillStyle = color;

                const x = this.rng.random() * this.width;
                const y = this.rng.random() * this.height;
                const size = 50 + this.rng.random() * (150 * this.params.complexity);
                const offset = flow + layer * 100;

                // Select shape type
                const shapeSelector = (offset * 37 + this.params.smoothness * 100) % 100;

                if (shapeSelector < 20) {
                    this.drawCircle(ctx, x, y, size);
                } else if (shapeSelector < 35) {
                    this.drawStar(ctx, x, y, size, shapeVertices);
                } else if (shapeSelector < 50) {
                    this.drawRectangle(ctx, x, y, size, offset);
                } else if (shapeSelector < 70) {
                    this.drawRegularPolygon(ctx, x, y, size, shapeVertices);
                } else {
                    this.drawOrganicBlob(ctx, x, y, size, shapeVertices, noiseScale, offset);
                }
            }

            // Draw flowing curves
            for (let i = 0; i < 3; i++) {
                const color = accentColors[i % accentColors.length];
                ctx.strokeStyle = color;

                const minStroke = this.params.minStroke || 0.5;
                const maxStroke = this.params.maxStroke || 1.5;
                ctx.lineWidth = minStroke + this.params.complexity * (maxStroke - minStroke);

                this.drawFlowingCurve(ctx, noiseScale, i + layer * 10);
            }
        }
    }

    /**
     * Draw a circle
     */
    drawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw a star
     */
    drawStar(ctx, x, y, radius, points) {
        const angle = (Math.PI * 2) / points;
        const halfAngle = angle / 2;

        ctx.beginPath();
        for (let a = -Math.PI / 2; a < Math.PI * 2 - Math.PI / 2; a += angle) {
            // Outer point
            let sx = x + Math.cos(a) * radius;
            let sy = y + Math.sin(a) * radius;
            ctx.lineTo(sx, sy);

            // Inner point
            sx = x + Math.cos(a + halfAngle) * (radius * 0.5);
            sy = y + Math.sin(a + halfAngle) * (radius * 0.5);
            ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw a rectangle with rotation
     */
    drawRectangle(ctx, x, y, size, offset) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(offset * 0.1);
        const width = size * (0.8 + (offset % 10) / 20);
        const height = size * (0.8 + ((offset * 3) % 10) / 20);
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
    }

    /**
     * Draw a regular polygon
     */
    drawRegularPolygon(ctx, x, y, radius, points) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / points) {
            const vx = x + Math.cos(angle) * radius;
            const vy = y + Math.sin(angle) * radius;
            if (angle === 0) {
                ctx.moveTo(vx, vy);
            } else {
                ctx.lineTo(vx, vy);
            }
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw an organic blob using Perlin noise
     */
    drawOrganicBlob(ctx, x, y, radius, points, noiseScale, offset) {
        ctx.beginPath();
        let firstX, firstY;

        for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / points) {
            const xOff = Math.cos(angle) * noiseScale + offset;
            const yOff = Math.sin(angle) * noiseScale + offset;
            const r = radius * (0.7 + this.noise.get(xOff, yOff) * 0.6);

            const vx = x + Math.cos(angle) * r;
            const vy = y + Math.sin(angle) * r;

            if (angle === 0) {
                ctx.moveTo(vx, vy);
                firstX = vx;
                firstY = vy;
            } else {
                ctx.lineTo(vx, vy);
            }
        }

        ctx.lineTo(firstX, firstY);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw a flowing curve
     */
    drawFlowingCurve(ctx, noiseScale, offset) {
        ctx.beginPath();
        const steps = 50;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * this.width;

            const noiseValue = this.noise.get(t * 5 + offset, offset * noiseScale);
            const baseDepth = ((offset % 5) / 5) * 0.5 + 0.1;
            const y = this.map(noiseValue, 0, 1, 0, this.height * baseDepth);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    /**
     * Add subtle noise texture overlay
     */
    drawNoiseTexture(ctx) {
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const pixels = imageData.data;

        for (let i = 0; i < this.width; i += 2) {
            for (let j = 0; j < this.height; j += 2) {
                const noiseVal = this.noise.get(i * 0.01, j * 0.01) * 10;
                const index = (j * this.width + i) * 4;

                if (index < pixels.length) {
                    pixels[index] = this.constrain(pixels[index] + noiseVal - 5, 0, 255);
                    pixels[index + 1] = this.constrain(pixels[index + 1] + noiseVal - 5, 0, 255);
                    pixels[index + 2] = this.constrain(pixels[index + 2] + noiseVal - 5, 0, 255);
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Utility: Map a value from one range to another
     */
    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }

    /**
     * Utility: Constrain value between min and max
     */
    constrain(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

/**
 * Seeded Random Number Generator
 */
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
        this.current = seed;
    }

    random() {
        // Linear congruential generator
        this.current = (this.current * 1664525 + 1013904223) % 4294967296;
        return this.current / 4294967296;
    }
}

/**
 * Simple Perlin Noise Implementation
 */
class PerlinNoise {
    constructor(seed) {
        this.seed = seed;
        this.permutation = this.generatePermutation(seed);
    }

    generatePermutation(seed) {
        const p = [];
        for (let i = 0; i < 256; i++) {
            p[i] = i;
        }

        // Fisher-Yates shuffle with seeded random
        const rng = new SeededRandom(seed);
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(rng.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }

        // Duplicate
        return [...p, ...p];
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(a, b, t) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    get(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const aa = this.permutation[this.permutation[X] + Y];
        const ab = this.permutation[this.permutation[X] + Y + 1];
        const ba = this.permutation[this.permutation[X + 1] + Y];
        const bb = this.permutation[this.permutation[X + 1] + Y + 1];

        const res = this.lerp(
            this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u),
            this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u),
            v
        );

        return (res + 1) / 2; // Normalize to 0-1
    }
}

module.exports = VisualGeneratorNode;
