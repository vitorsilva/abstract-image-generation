/**
 * Visual Generator Module
 * Creates organic, flowing abstract art using p5.js
 */

class VisualGenerator {
    constructor(params, width, height) {
        this.params = params;
        this.width = width;
        this.height = height;
        this.colorPalettes = this.initColorPalettes();
    }

    /**
     * Initialize color palettes
     * Each palette has a gradient background and accent colors
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
     * Create the visual using p5.js
     */
    generate(p, containerElement) {
        const palette = this.colorPalettes[this.params.paletteIndex];
        const seed = this.params.seed;

        const sketch = (p) => {
            p.setup = () => {
                const canvas = p.createCanvas(this.width, this.height);
                canvas.parent(containerElement);
                p.randomSeed(seed);
                p.noiseSeed(seed);
                p.noLoop();
            };

            p.draw = () => {
                // Draw gradient background
                this.drawGradientBackground(p, palette.bg);

                // Draw flowing organic shapes based on content parameters
                this.drawOrganicFlows(p, palette.accents);

                // Draw noise-based texture overlay
                this.drawNoiseTexture(p);
            };
        };

        return new p5(sketch);
    }

    /**
     * Draw gradient background
     */
    drawGradientBackground(p, colors) {
        p.push();
        const c1 = p.color(colors[0]);
        const c2 = p.color(colors.length > 1 ? colors[1] : colors[0]);

        for (let y = 0; y < this.height; y++) {
            const inter = p.map(y, 0, this.height, 0, 1);
            const c = p.lerpColor(c1, c2, inter);
            p.stroke(c);
            p.line(0, y, this.width, y);
        }
        p.pop();
    }

    /**
     * Draw organic flowing shapes using Perlin noise and bezier curves
     */
    drawOrganicFlows(p, accentColors) {
        const numLayers = Math.max(3, Math.floor(this.params.layers));
        const numFlows = Math.floor(5 + this.params.density * 10);
        const noiseScale = 0.005 / (this.params.smoothness + 0.1);

        // Use paragraph count for shape vertices (already calculated in params)
        const shapeVertices = this.params.shapeVertices || 8;

        for (let layer = 0; layer < numLayers; layer++) {
            for (let flow = 0; flow < numFlows; flow++) {
                const color = accentColors[flow % accentColors.length];
                p.fill(color); // Opaque shapes
                p.noStroke();

                const x = p.random(this.width);
                const y = p.random(this.height);
                const size = 50 + p.random(150 * this.params.complexity);
                const offset = flow + layer * 100;

                // Select shape type based on smoothness and deterministic randomness
                // Different avgWordLength values produce different shape distributions
                const shapeSelector = (offset * 37 + this.params.smoothness * 100) % 100;

                if (shapeSelector < 20) {
                    // Circles (20%)
                    this.drawCircle(p, x, y, size);
                } else if (shapeSelector < 35) {
                    // Stars (15%)
                    this.drawStar(p, x, y, size, shapeVertices);
                } else if (shapeSelector < 50) {
                    // Rectangles (15%)
                    this.drawRectangle(p, x, y, size, offset);
                } else if (shapeSelector < 70) {
                    // Regular polygons (20%)
                    this.drawRegularPolygon(p, x, y, size, shapeVertices);
                } else {
                    // Organic blobs (30%)
                    this.drawOrganicBlob(p, x, y, size, shapeVertices, noiseScale, offset);
                }
            }

            // Draw flowing curves
            for (let i = 0; i < 3; i++) {
                const color = accentColors[i % accentColors.length];
                p.stroke(color); // Opaque curves
                p.strokeWeight(2 + this.params.complexity * 3);
                p.noFill();

                this.drawFlowingCurve(p, noiseScale, i + layer * 10);
            }
        }
    }

    /**
     * Draw a circle
     */
    drawCircle(p, x, y, radius) {
        p.ellipse(x, y, radius * 2, radius * 2);
    }

    /**
     * Draw a star
     */
    drawStar(p, x, y, radius, points) {
        const angle = p.TWO_PI / points;
        const halfAngle = angle / 2;

        p.beginShape();
        for (let a = -p.PI / 2; a < p.TWO_PI - p.PI / 2; a += angle) {
            // Outer point
            let sx = x + p.cos(a) * radius;
            let sy = y + p.sin(a) * radius;
            p.vertex(sx, sy);

            // Inner point
            sx = x + p.cos(a + halfAngle) * (radius * 0.5);
            sy = y + p.sin(a + halfAngle) * (radius * 0.5);
            p.vertex(sx, sy);
        }
        p.endShape(p.CLOSE);
    }

    /**
     * Draw a rectangle with rotation
     */
    drawRectangle(p, x, y, size, offset) {
        p.push();
        p.translate(x, y);
        // Rotation based on offset for variety
        p.rotate(offset * 0.1);
        const width = size * (0.8 + (offset % 10) / 20);
        const height = size * (0.8 + ((offset * 3) % 10) / 20);
        p.rectMode(p.CENTER);
        p.rect(0, 0, width, height);
        p.pop();
    }

    /**
     * Draw a regular polygon (no noise)
     */
    drawRegularPolygon(p, x, y, radius, points) {
        p.beginShape();
        for (let angle = 0; angle < p.TWO_PI; angle += p.TWO_PI / points) {
            const vx = x + p.cos(angle) * radius;
            const vy = y + p.sin(angle) * radius;
            p.vertex(vx, vy);
        }
        p.endShape(p.CLOSE);
    }

    /**
     * Draw an organic blob using Perlin noise
     */
    drawOrganicBlob(p, x, y, radius, points, noiseScale, offset) {
        p.beginShape();
        for (let angle = 0; angle < p.TWO_PI; angle += p.TWO_PI / points) {
            const xOff = p.cos(angle) * noiseScale + offset;
            const yOff = p.sin(angle) * noiseScale + offset;
            const r = radius * (0.7 + p.noise(xOff, yOff) * 0.6);

            const vx = x + p.cos(angle) * r;
            const vy = y + p.sin(angle) * r;

            if (angle === 0) {
                p.vertex(vx, vy);
            } else {
                // Use curve vertices for smooth organic shapes
                p.curveVertex(vx, vy);
            }
        }
        p.endShape(p.CLOSE);
    }

    /**
     * Draw a flowing curve from top of image using bezier curves and noise
     */
    drawFlowingCurve(p, noiseScale, offset) {
        p.beginShape();
        const steps = 50;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = t * this.width;

            // Use noise to determine how far down the curve extends from the top
            // Base depth varies, but curves start from top
            const noiseValue = p.noise(t * 5 + offset, offset * noiseScale);
            const baseDepth = p.map(offset % 5, 0, 5, 0.1, 0.6); // Different curves reach different depths
            const y = p.map(noiseValue, 0, 1, 0, this.height * baseDepth);

            if (i === 0) {
                p.vertex(x, y);
            } else {
                p.curveVertex(x, y);
            }
        }
        p.endShape();
    }

    /**
     * Add subtle noise texture overlay
     */
    drawNoiseTexture(p) {
        p.loadPixels();
        const d = p.pixelDensity();

        for (let i = 0; i < this.width; i += 2) {
            for (let j = 0; j < this.height; j += 2) {
                const noiseVal = p.noise(i * 0.01, j * 0.01) * 10;

                for (let ii = 0; ii < d; ii++) {
                    for (let jj = 0; jj < d; jj++) {
                        const index = 4 * ((j * d + jj) * this.width * d + (i * d + ii));

                        p.pixels[index] = p.constrain(p.pixels[index] + noiseVal - 5, 0, 255);
                        p.pixels[index + 1] = p.constrain(p.pixels[index + 1] + noiseVal - 5, 0, 255);
                        p.pixels[index + 2] = p.constrain(p.pixels[index + 2] + noiseVal - 5, 0, 255);
                    }
                }
            }
        }
        p.updatePixels();
    }
}
