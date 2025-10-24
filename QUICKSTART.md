# Quick Start Guide

## First Time Setup

```bash
# Already done, but if starting fresh:
npm install
```

## Running the Application

```bash
npm start
```

Your browser will open to `http://localhost:8080`

## First Test

1. **Paste sample content** - Try this:

```
The Art of Software Development

Software development is both a science and an art. It requires logical thinking,
problem-solving skills, and creativity. Good developers don't just write code that
works; they write code that is maintainable, scalable, and elegant.

In today's fast-paced world, agile methodologies have become the norm. Developers
work in sprints, continuously iterating and improving their products. The key is
to balance speed with quality, delivering value while maintaining code excellence.

Testing is crucial. Unit tests, integration tests, and end-to-end tests all play
important roles in ensuring software reliability. Automated testing pipelines help
catch bugs early, saving time and reducing costs in the long run.
```

2. **Click "Generate Images"**

3. **Review the outputs:**
   - Check the metrics display (words, characters, etc.)
   - View both landscape and square images
   - Verify colors and organic shapes appear

4. **Download images:**
   - Click download buttons to save

5. **Test determinism:**
   - Generate again with same content
   - Images should be identical

## Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 8080, or specify different port:
npx http-server -p 3000
```

### Images Not Generating
- Check browser console (F12) for errors
- Ensure p5.js CDN is accessible
- Verify all .js files are in src/ folder

### Download Not Working
- Check browser's download permissions
- Try different browser if issues persist

## Project Structure Reference

```
abstract-image-generator/
│
├── index.html                    # Main web page
├── styles.css                    # Styling
│
├── src/
│   ├── contentAnalyzer.js       # Analyzes text, extracts metrics
│   ├── seedGenerator.js         # Creates deterministic parameters
│   ├── visualGenerator.js       # p5.js art generator (10 color palettes)
│   └── app.js                   # Main app logic, UI handlers
│
├── package.json                  # npm configuration
├── README.md                     # User documentation
├── CLAUDE.md                     # Developer/AI documentation
├── PROJECT_STATUS.md            # Current state & next steps
└── QUICKSTART.md                # This file
```

## Key Files to Edit

### To Change Visuals
- **Color palettes:** `src/visualGenerator.js` (lines 21-85)
- **Drawing algorithms:** `src/visualGenerator.js` (lines 87-203)
- **Curve complexity:** `src/visualGenerator.js` (line 139)

### To Adjust Metric Mappings
- **Content analysis:** `src/contentAnalyzer.js` (lines 37-54)
- **Visual parameters:** `src/seedGenerator.js` (lines 23-51)

### To Modify Output Sizes
- **Image dimensions:** `src/app.js` (lines 165, 175)

## Next Steps

See `PROJECT_STATUS.md` for:
- What's been completed
- What needs testing
- Future enhancements (v2 features)
- Technical decisions made

## Need Help?

1. Check `README.md` for detailed documentation
2. Review `CLAUDE.md` for architecture overview
3. Read `PROJECT_STATUS.md` for current state
4. All code is well-commented - read the source!