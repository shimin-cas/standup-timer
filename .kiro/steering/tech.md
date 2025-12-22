---
inclusion: always
---

# Technology Stack

## Frontend Stack
- **HTML5**: Semantic markup structure
- **CSS3**: Custom properties (CSS variables) for theming
- **Vanilla JavaScript**: No frameworks for simplicity and fast loading
- **Local Storage**: Client-side data persistence

## Build System
- **No build process required**: Direct file serving
- **Static files only**: HTML, CSS, JS
- **Browser compatibility**: Modern browsers (ES6+)

## Deployment
- **Static hosting**: Can be deployed to any web server
- **No server requirements**: Fully client-side application
- **CDN friendly**: All assets are static

## Development Commands
```bash
# Serve locally (any static server)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000

# Open in browser
open http://localhost:8000
```

## File Structure
```
/
├── index.html          # Main application entry point
├── styles.css          # Castlery-inspired styling
├── script.js           # Application logic and state management
└── .kiro/
    └── steering/       # AI assistant guidance files
```

## Key Libraries & Patterns
- **No external dependencies**: Keeps deployment simple
- **Module pattern**: Organized JavaScript with clear separation
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Custom Properties**: Consistent theming system
- **Event delegation**: Efficient DOM event handling
- **Local Storage API**: Data persistence without backend

## Browser Requirements
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript enabled**: Required for functionality
- **Local Storage support**: Required for data persistence

## Performance Considerations
- **Minimal payload**: No external libraries or frameworks
- **Efficient DOM updates**: Targeted re-rendering
- **CSS animations**: Hardware-accelerated transitions
- **Lazy loading**: Content loaded on demand