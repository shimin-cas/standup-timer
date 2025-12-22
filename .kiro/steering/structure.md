---
inclusion: always
---

# Project Structure

## Application Architecture
The standup timer follows a simple client-side architecture with clear separation of concerns:

```
standup-timer/
├── index.html              # Main HTML structure and layout
├── styles.css              # Castlery-inspired CSS styling
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
- **Modal dialogs**: For adding/editing members and templates
- **Accessibility**: Proper labels, ARIA attributes where needed

### CSS Architecture (`styles.css`)
- **CSS Custom Properties**: Centralized theming system
- **Component-based**: Styles organized by UI components
- **Responsive design**: Mobile-first approach with media queries
- **Castlery aesthetic**: Clean, modern, minimalist styling

### JavaScript Structure (`script.js`)
- **State management**: Centralized `appState` object
- **Local storage**: Persistent data without backend
- **Event handling**: Organized event listeners and handlers
- **Timer logic**: Real-time updates and speaker tracking
- **CRUD operations**: Create, read, update, delete for all entities

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
  members: string[],    // Array of member IDs
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
    isPresent: boolean
  }],
  totalTime: number,    // Total meeting time in seconds
  averageTime: number   // Average speaking time in seconds
}
```

## Feature Organization

### Core Features
- **Timer Management**: Start, pause, resume, next speaker
- **Team Management**: Add, edit, delete team members
- **Template Management**: Create reusable meeting configurations
- **Report Generation**: Track and export meeting data

### UI Components
- **Navigation tabs**: Switch between main sections
- **Timer display**: Large, readable time format
- **Speaker queue**: Visual representation of speaking order
- **Modal dialogs**: Forms for data entry
- **List views**: Display teams, templates, and reports

## Development Patterns

### State Management
- Single source of truth in `appState` object
- Local storage synchronization
- Reactive UI updates based on state changes

### Event Handling
- Centralized event listener setup
- Delegation for dynamic content
- Form validation and submission handling

### Data Persistence
- Local storage for all data
- JSON serialization/deserialization
- Automatic save on data changes

## Naming Conventions
- **Files**: kebab-case (e.g., `index.html`)
- **CSS classes**: kebab-case with BEM-like structure
- **JavaScript**: camelCase for variables and functions
- **IDs**: kebab-case for HTML elements
- **Constants**: UPPER_SNAKE_CASE for configuration values