# Bible Wise Words

Simple static site: enter how you feel and get a Bible verse that matches that feeling. Built as a playful demo to explore Christian values of hope, compassion, and grace.

Files:
- `index.html` — main page
- `styles.css` — styles
- `script.js` — simple feelings -> verses mapper

How to run:
1. Open `index.html` in a browser (double-click or use a local static server).

Quick local server (macOS / zsh):
```bash
cd /Users/tylerbyrd/Documents/GitHub/Bible-wise-words-
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Requirements coverage:
- Search by how you feel and return matching Bible verses: Done (fuzzy matching, synonyms).
- Show multiple verses: Done (shows up to 3 verses).
- Add images and make the site beautiful/cozy: Done (background gradients, unsplash images, rounded cards).
- Represent Christian values: Done (footer copy and verse selection emphasize hope/compassion).


Notes:
- Verses used are short paraphrases or public-domain excerpts for demo purposes. Replace with preferred translations if needed.
# Bible-wise-words-