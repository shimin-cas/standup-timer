---
inclusion: always
---

# Project Structure

## Application Architecture
The standup timer follows a simple client-side architecture with clear separation of concerns:

```
standup-timer/
├── index.html              # Main HTML structure and layout
├── styles.css              # Castlery-inspired CSS styling with high-density UI
├── script.js               # Application logic and state management
└── .kiro/
    └── steering/
        ├── product.md      # Product requirements and features
        ├── tech.md         # Technology stack and build info
        └── structure.md    # This file - project organization
```

## Code Organization

### HTML Structure (`index.html`)
- **Semantic markup**: Uses proper HTML5 elements
- **Tab-based navigation**: Timer, Team, Templates, Reports
- **Large modal dialogs**: 98% width, 90% height for maximum space utilization
- **High-density forms**: Horizontal layouts with compact spacing
- **Accessibility**: Proper labels, ARIA attributes where needed

### CSS Architecture (`styles.css`)
- **Castlery Design System**: Authentic brand colors (Terracotta #844025, Maroon Velvet #3c101e, Warm Linen #f6f3e7)
- **Sanomat Sans Typography**: Primary font with system fallbacks
- **CSS Custom Properties**: Centralized theming system
- **High-Density Layouts**: Compact spacing, horizontal information display
- **Component-based**: Styles organized by UI components
- **Responsive design**: Mobile-first approach with media queries

### JavaScript Structure (`script.js`)
- **State management**: Centralized `appState` object with localStorage persistence
- **Timer logic**: Manual start, pause/resume, speaker tracking with elapsed time
- **Meeting management**: Attendance tracking, absentee management, explicit end meeting
- **CRUD operations**: Full create, read, update, delete for all entities
- **CSV operations**: Bulk import/export with preview and validation
- **Drag-and-drop**: Speaker sequence reordering in templates

## Data Models

### Team Member
```javascript
{
  id: string,           // Unique identifier
  email: string,        // Primary key, required
  name: string,         // Display name, required
  team: string,         // Optional team assignment
  createdAt: Date       // Creation timestamp
}
```

### Meeting Template
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Template name
  members: string[],    // Array of member IDs in speaking order
  createdAt: Date       // Creation timestamp
}
```

### Meeting Report
```javascript
{
  id: string,           // Unique identifier
  templateName: string, // Template used
  date: Date,           // Meeting start time
  endTime: Date,        // Meeting end time
  speakers: [{          // Speaker performance data
    id: string,
    name: string,
    email: string,
    timeSpent: number,  // Seconds
    isPresent: boolean,
    absentReason: string // Optional absence reason
  }],
  totalTime: number,    // Total meeting time in seconds
  averageTime: number,  // Average speaking time in seconds
  attendeeCount: number,// Number of present speakers
  absenteeCount: number // Number of absent speakers
}
```

### Current Meeting State
```javascript
{
  id: string,
  templateId: string,
  templateName: string,
  startTime: Date,
  speakers: Array,      // Speaker objects with real-time data
  currentSpeakerIndex: number,
  isActive: boolean
}
```

## Feature Organization

### Core Features
- **Timer Management**: Manual start, pause/resume, next speaker, explicit end meeting
- **Attendance Management**: Pre-meeting attendance configuration with absence reasons
- **Team Management**: Add, edit, delete team members with CSV import/export
- **Template Management**: Create reusable meeting configurations with drag-and-drop sequencing
- **Report Generation**: Comprehensive reports with team analytics and performance leaderboards

### Advanced UI Components
- **Unified Member Selection**: Combined checkbox selection and drag-and-drop sequencing
- **Performance Leaderboard**: Horizontal bar charts with animal emoji rankings
- **Team Analytics**: Aggregated statistics with attendance rates and time averages
- **High-Density Tables**: Compact layouts showing 20-30+ members without scrolling
- **Large Modal Dialogs**: 98% width, 90% height for maximum information density
- **Horizontal Form Layouts**: Name, email, team displayed side-by-side

### Report Features
- **End-of-Meeting Preview**: Editable report with team breakdown and leaderboard
- **Team-Level Analytics**: Total and average time by team in every report
- **Detailed Absentee Lists**: Names, teams, and absence reasons
- **Performance Variance**: Color-coded time variance from average
- **CSV Export**: Individual reports and bulk team data export

## Development Patterns

### State Management
- Single source of truth in `appState` object
- Local storage synchronization with automatic saves
- Reactive UI updates based on state changes
- Pending report state for preview and editing

### Event Handling
- Centralized event listener setup in `setupEventListeners()`
- Delegation for dynamic content
- Form validation and submission handling
- Drag-and-drop event management for sequencing

### Data Persistence
- Local storage for all data (members, templates, reports)
- JSON serialization/deserialization
- Automatic save on data changes
- CSV import/export with validation and preview

### High-Density UI Patterns
- **Horizontal Layouts**: Information displayed side-by-side instead of vertically
- **Compact Spacing**: Reduced padding and margins (32px row height)
- **Large Modals**: 98% width, 90% height for maximum space utilization
- **Unified Interfaces**: Combined selection and sequencing in single views
- **Form Alignment**: 16px top margin for proper alignment in flexbox containers

## Naming Conventions
- **Files**: kebab-case (e.g., `index.html`)
- **CSS classes**: kebab-case with BEM-like structure
- **JavaScript**: camelCase for variables and functions
- **IDs**: kebab-case for HTML elements
- **Constants**: UPPER_SNAKE_CASE for configuration values

## Key Learnings
- **Form Alignment**: Use 16px top margin for text inputs in flexbox containers
- **Information Density**: Horizontal layouts are more space-efficient than vertical
- **Manual Controls**: Explicit "Start" and "End Meeting" buttons provide better user control
- **Data Validation**: Handle undefined/null values gracefully in all calculations
- **Modal Sizing**: Large modals (98% width, 90% height) improve usability for complex operations
- **CSV Operations**: Preview and validation are essential for bulk data operations