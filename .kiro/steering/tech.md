---
inclusion: always
---

# Technology Stack

## Frontend Stack
- **HTML5**: Semantic markup structure with high-density layouts
- **CSS3**: Custom properties (CSS variables) for Castlery theming
- **Vanilla JavaScript**: No frameworks for simplicity and fast loading
- **Local Storage**: Client-side data persistence with JSON serialization

## Design System
- **Castlery Brand Colors**: Authentic color palette
  - Primary: Terracotta (#844025)
  - Secondary: Maroon Velvet (#3c101e) 
  - Accent: Warm Linen (#f6f3e7)
- **Typography**: Sanomat Sans with system font fallbacks
- **High-Density UI**: Optimized for 20-30+ team members without scrolling

## Build System
- **No build process required**: Direct file serving
- **Static files only**: HTML, CSS, JS
- **Browser compatibility**: Modern browsers (ES6+)
- **Zero dependencies**: No external libraries or frameworks

## Deployment Options
- **Static hosting**: Can be deployed to any web server
- **No server requirements**: Fully client-side application
- **CDN friendly**: All assets are static
- **Popular platforms**: Netlify, Vercel, GitHub Pages, AWS S3, Firebase Hosting

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
├── styles.css          # Castlery-inspired styling with high-density layouts
├── script.js           # Application logic and state management
└── .kiro/
    └── steering/       # AI assistant guidance files
```

## Key Libraries & Patterns
- **No external dependencies**: Keeps deployment simple and fast
- **Module pattern**: Organized JavaScript with clear separation of concerns
- **CSS Grid & Flexbox**: Modern layout techniques for high-density UI
- **CSS Custom Properties**: Consistent theming system with Castlery colors
- **Event delegation**: Efficient DOM event handling
- **Local Storage API**: Data persistence without backend requirements
- **Drag-and-Drop API**: Native browser API for speaker sequencing

## Browser Requirements
- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **JavaScript enabled**: Required for functionality
- **Local Storage support**: Required for data persistence
- **Drag-and-Drop support**: Required for template sequencing

## Performance Characteristics
- **Minimal payload**: No external libraries or frameworks (~50KB total)
- **Efficient DOM updates**: Targeted re-rendering of changed elements
- **CSS animations**: Hardware-accelerated transitions
- **Lazy loading**: Content loaded on demand
- **Local data**: No network requests after initial load

## Data Architecture
- **Client-side only**: All data stays in browser localStorage
- **Privacy-first**: No data sent to external servers
- **JSON storage**: Simple serialization/deserialization
- **CSV import/export**: Standard format for bulk operations
- **Backup-friendly**: Easy to export all data

## Scalability Considerations
- **Large teams**: Optimized for 30+ team members
- **High-density UI**: Minimal scrolling required
- **Efficient rendering**: Handles hundreds of reports
- **Memory management**: Proper cleanup of event listeners
- **Performance**: Smooth drag-and-drop with large lists

## Security & Privacy
- **No backend**: Eliminates server-side security concerns
- **Local storage**: Data never leaves user's browser
- **No authentication**: Simplified deployment and usage
- **Safe to open source**: No sensitive configuration or keys

## Deployment Best Practices
- **Static hosting**: Use CDN for global distribution
- **HTTPS required**: For modern browser features
- **Cache headers**: Set appropriate cache policies
- **Compression**: Enable gzip/brotli compression
- **Error pages**: Configure 404 handling for SPA behavior

## Development Workflow
- **No build step**: Direct file editing and refresh
- **Live reload**: Use development server with auto-refresh
- **Version control**: Git-friendly with no generated files
- **Testing**: Manual testing in target browsers
- **Debugging**: Browser developer tools

## Browser Storage Limits
- **localStorage**: ~5-10MB per origin (varies by browser)
- **Data estimation**: ~1KB per member, ~2KB per report
- **Capacity**: Supports thousands of members and reports
- **Cleanup**: Manual export/import for data management

## Accessibility Features
- **Semantic HTML**: Proper heading structure and landmarks
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: ARIA labels and descriptions
- **Color contrast**: Meets WCAG guidelines
- **Focus management**: Proper focus handling in modals

## Cross-Platform Compatibility
- **Desktop browsers**: Full feature support
- **Tablet devices**: Responsive design with touch support
- **Mobile browsers**: Functional but optimized for larger screens
- **Operating systems**: Works on Windows, macOS, Linux
- **Offline capability**: Functions without internet after initial load