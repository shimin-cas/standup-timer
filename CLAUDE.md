# CLAUDE.md — Standup Timer

This file provides guidance for AI assistants working with this codebase.

## Project Overview

A self-contained web application for running timed team standup meetings. It handles speaker queues, attendance, meeting templates, and historical reporting. All data is stored in the browser via `localStorage`; there is no backend, no build step, and no external dependencies.

**Live demo**: https://shimin-cas.github.io/standup-timer/

---

## Repository Structure

```
standup-timer/
├── index.html        # All HTML markup; defines 4 tabs and all modal dialogs
├── script.js         # All application logic (~1 600 lines, ~57 functions)
├── styles.css        # All styling (~1 500 lines, Castlery design system)
├── README.md         # User-facing documentation
└── .kiro/
    └── steering/
        ├── product.md    # Product requirements and feature specs
        ├── tech.md       # Technology stack reference
        └── structure.md  # Architecture and data models
```

There is no `package.json`, no build tooling, no test runner, and no `.gitignore`. All three source files are loaded directly by the browser.

---

## Technology Stack

| Layer | Choice |
|-------|--------|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 with custom properties |
| Logic | Vanilla JavaScript (ES6+) |
| Persistence | Browser `localStorage` (JSON) |
| Drag & drop | Native HTML5 Drag-and-Drop API |
| File I/O | Native File API (CSV import/export) |
| Dependencies | **None** |
| Build step | **None** |

**Browser targets**: Chrome 80+, Firefox 74+, Safari 13.1+, Edge 80+.
(The codebase uses optional chaining `?.` which sets these as the true minimums.)

---

## Running Locally

No installation required. Serve the directory with any static server:

```bash
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Then open `http://localhost:8000`.

---

## Design System (Castlery Brand)

All colours and typography are defined as CSS custom properties at the top of `styles.css`.

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-color` | `#844025` (Terracotta) | Buttons, active states, headings |
| `--secondary-color` | `#3c101e` (Maroon Velvet) | Header background, dark accents |
| `--accent-color` | `#f6f3e7` (Warm Linen) | Page background, card backgrounds |
| Font | Sanomat Sans → system fallback | All text |

Do not introduce new colour literals. Always reference the CSS custom properties.

---

## Application Architecture

### State

A single global `appState` object in `script.js` is the source of truth:

```javascript
appState = {
  members: [],          // Team member profiles
  templates: [],        // Reusable meeting configs
  reports: [],          // Completed meeting reports
  currentMeeting: null, // Active meeting (null when idle)
  timer: {
    startTime, elapsed, isRunning,
    currentSpeaker, speakerTimes
  }
}
```

Every write to `appState` must be followed by a `saveToStorage()` call. UI renders are triggered manually after state changes, not reactively.

### Tabs

`index.html` defines four tabs rendered inside `<div class="tab-content">`:

1. **Timer** — meeting control, speaker queue display, live timer
2. **Team** — CRUD for team members, CSV import/export
3. **Templates** — create/edit reusable meeting configurations with drag-and-drop sequencing
4. **Reports** — historical report list, team analytics, leaderboards

Tab switching is handled by `switchTab(tabName)`.

### Modals

All modals live in `index.html` as hidden `<div>` overlays. They are shown/hidden via CSS class toggles. `closeModal(modalId)` is the standard way to dismiss any modal.

---

## Data Models

### Team Member
```javascript
{
  id: string,        // crypto.randomUUID() or Date.now() string
  email: string,     // Primary key — must be unique
  name: string,
  team: string,      // Optional team label
  createdAt: Date
}
```

### Meeting Template
```javascript
{
  id: string,
  name: string,
  members: string[], // Ordered array of member IDs
  createdAt: Date
}
```

### Meeting Report
```javascript
{
  id: string,
  templateName: string,
  date: Date,        // Meeting start
  endTime: Date,
  speakers: [{
    id, name, email, team,
    timeSpent: number,   // seconds
    isPresent: boolean,
    absentReason: string // empty string if present
  }],
  totalTime: number,
  averageTime: number,
  attendeeCount: number,
  absenteeCount: number
}
```

### Current Meeting State (`appState.currentMeeting`)
```javascript
{
  id: string,
  templateId: string,
  templateName: string,
  startTime: Date,
  speakers: Array,             // Enriched speaker objects with live data
  currentSpeakerIndex: number,
  isActive: boolean
}
```

---

## Key Functions Reference

### Initialization
| Function | Purpose |
|----------|---------|
| `initializeApp()` | Entry point called on `DOMContentLoaded` |
| `setupEventListeners()` | Binds all static DOM event listeners |
| `switchTab(name)` | Shows the requested tab pane |

### Timer & Meeting Flow
| Function | Purpose |
|----------|---------|
| `startMeeting()` | Initialises `currentMeeting` from the selected template |
| `toggleTimer()` | Starts or pauses the interval timer |
| `nextSpeaker()` | Advances `currentSpeakerIndex`, updates elapsed time |
| `jumpToSpeaker(index)` | Selects a specific speaker directly |
| `endMeeting()` / `finishMeeting()` | Stops timer, builds report, shows preview |
| `startTimer()` | Manages `setInterval` for the running clock |
| `updateTimerDisplay()` | Refreshes the on-screen time digits |
| `syncCurrentSpeakerElapsed()` | Keeps `speakerTimes` in sync during intervals |

### Attendance
| Function | Purpose |
|----------|---------|
| `openAttendanceModal()` | Shows pre-meeting attendance dialog |
| `toggleSpeakerAttendance(index)` | Flips present/absent for a speaker |
| `saveAttendance()` | Persists attendance changes to `currentMeeting` |

### Team Management (CRUD)
| Function | Purpose |
|----------|---------|
| `openMemberModal(member?)` | Opens add/edit dialog (pass `null` for add) |
| `saveMember(e)` | Validates and persists a team member |
| `deleteMember(id)` | Removes member and saves |
| `renderTeamList()` | Re-renders the team member list |

### Template Management
| Function | Purpose |
|----------|---------|
| `openTemplateModal(template?)` | Opens add/edit dialog |
| `saveTemplate(e)` | Validates and persists a template |
| `deleteTemplate(id)` | Removes template and saves |
| `renderUnifiedMemberList()` | Renders combined checkbox + sequence list |
| `toggleMemberSelection(memberId)` | Checks or unchecks a member in template editor |
| `addDragAndDropToUnifiedList()` | Wires drag events for sequencing |

### Reports & Analytics
| Function | Purpose |
|----------|---------|
| `showReportPreview(report)` | Opens the post-meeting editable preview modal |
| `renderReportsList()` | Re-renders the saved reports list |
| `renderTeamAnalytics()` | Computes and renders aggregated team stats |
| `viewReport(reportId)` | Opens a saved report in the preview modal |
| `editReport()` | Switches preview modal to edit mode |
| `saveReport()` | Persists edits back to `appState.reports` |
| `exportReport(reportId)` | Downloads report as CSV |
| `updateTimeAndVariance(e)` | Recalculates variance when editing times |
| `updateSummaryStats()` | Refreshes aggregate stats in the preview |

### CSV Operations
| Function | Purpose |
|----------|---------|
| `exportTeamCsv()` | Downloads team roster as CSV |
| `openCsvImportModal()` | Shows CSV import dialog |
| `handleCsvFileSelect(e)` | Reads file, generates import preview |
| `confirmCsvImport()` | Merges parsed rows into `appState.members` |

### Utilities
| Function | Purpose |
|----------|---------|
| `saveToStorage(key, data)` | Serialises to `localStorage` |
| `closeModal(modalId)` | Hides a modal overlay |
| `getTeamColor(teamName)` | Deterministic colour for a team label |
| `validateTimeFormat(e)` | Input validator for `MM:SS` fields |
| `resetMeetingUI()` | Clears meeting-related DOM state |

---

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| JS functions & variables | camelCase | `startMeeting`, `appState` |
| JS constants | UPPER_SNAKE_CASE | `STORAGE_KEY` |
| HTML element IDs | kebab-case | `current-speaker-name` |
| CSS classes | kebab-case (BEM-like) | `speaker-card--active` |
| Files | kebab-case | `index.html`, `script.js` |

---

## CSS Conventions

- All custom properties live in `:root` at the top of `styles.css`.
- Sections are delimited by block comments: `/* ========== SECTION NAME ========== */`.
- High-density UI targets 32 px row height for list items.
- Large modals use `width: 98%; height: 90%` to maximise information density.
- The single responsive breakpoint is `@media (max-width: 768px)`.
- Do not introduce utility-class patterns; keep styles component-scoped.

---

## Data Persistence

- **Storage keys**: `standupMembers`, `standupTemplates`, `standupReports` — each saved under its own `localStorage` key via `saveToStorage()`. `currentMeeting` is held only in memory and is **not** persisted to `localStorage`.
- **Capacity**: ~5–10 MB per origin. Estimates: ~1 KB/member, ~2 KB/report.
- **No sync**: Data is local to the browser; there is no cloud sync.
- **Backup**: Users export/import via CSV; there is no automatic backup mechanism.

---

## Development Workflow

### Making changes
1. Edit `index.html`, `script.js`, or `styles.css` directly.
2. Hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) to pick up changes.
3. Use browser DevTools for debugging; `console.log` is acceptable during development.

### No linter or formatter is configured. Follow the existing code style:
- 2-space indentation in all three files.
- Single quotes for JS strings.
- No trailing commas in function parameters.
- Group related functions together; add a section comment when introducing a new logical group.

### Testing
There is no automated test suite. Test changes manually in the browser. Key scenarios to cover:
- Adding/editing/deleting a team member
- Creating and editing a template (including drag-and-drop reorder)
- Full meeting flow: start → attendance → timer → next speaker → end → report preview → save
- CSV import with valid and invalid data
- Report editing and export

### Git workflow
- Work on feature branches off `master`.
- Commit messages should be imperative and descriptive (e.g., `Fix timer resume after attendance save`).
- There are no pre-commit hooks or CI pipelines.

---

## Common Gotchas

- **Timer resume after attendance**: The timer state must be re-synced after attendance changes. `syncCurrentSpeakerElapsed()` must be called before resuming. (See PR #2 fix.)
- **Absent speakers in queue**: Absent speakers appear in the queue with a visual indicator but are skipped during normal advancement. Check `isPresent` before recording time.
- **Form alignment in flexbox**: Text inputs inside flex rows need `margin-top: 16px` for correct vertical alignment with labels.
- **Undefined/null in calculations**: `averageTime`, `totalTime`, and variance calculations must guard against empty speaker arrays and zero denominators.
- **Template member ordering**: `template.members` is an ordered array of IDs, not a set. Preserve insertion order when saving.
- **localStorage size**: Avoid storing large blobs. Meeting data is small by nature, but report arrays can grow over time — consider warning users if storage nears capacity.

---

## File Size Reference (approximate)

| File | Lines | Notes |
|------|-------|-------|
| `index.html` | ~180 | Markup only; no inline scripts |
| `script.js` | ~1 620 | ~57 named functions |
| `styles.css` | ~1 520 | 40+ section blocks |
