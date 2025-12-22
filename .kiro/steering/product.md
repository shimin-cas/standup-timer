---
inclusion: always
---

# Standup Timer Web App

## Product Overview
A comprehensive, deployable web application for managing and timing team standup meetings with advanced performance tracking, reporting capabilities, and high-density information display optimized for large teams (30+ members).

## Core Features

### Team Management
- **Team Member Data**: Maintain member profiles (email as primary key, name, team assignment)
- **Bulk Operations**: CSV import/export for efficient team roster management
- **Meeting Templates**: Create reusable standup configurations with drag-and-drop speaker sequencing
- **Flexible Data Management**: Full CRUD operations on all data entities

### Meeting Operations
- **Meeting Setup**: Start meetings from templates with real-time modifications
- **Timer Control**: 
  - Manual start (not auto-start) for attendance configuration
  - Click-to-advance timing between speakers
  - Pause/resume functionality for breaks
  - Visual feedback for active speaker
  - End meeting button for explicit control
- **Absence Management**: Mark members absent with reasons before and during meetings
- **Speaker Sequencing**: Drag-and-drop reordering with visual sequence indicators

### Reporting & Analytics
- **Comprehensive Reports**: Detailed end-of-meeting reports with editable data
- **Team-Level Analytics**: Performance breakdown by team with totals and averages
- **Performance Leaderboard**: Horizontal bar chart with animal emoji rankings
- **Individual Performance**: Speaking time variance analysis with color coding
- **Historical Data**: Member and team performance trends over time
- **Export Capabilities**: CSV export for reports and team data
- **Report Management**: View, edit, and delete meeting reports

### Advanced UI Features
- **High-Density Design**: Optimized for viewing 20-30+ team members without scrolling
- **Unified Interfaces**: Combined selection and sequencing in single views
- **Compact Layouts**: Horizontal information display for maximum efficiency
- **Modal Optimization**: Large, full-screen modals for complex operations
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## Design & UI Requirements
- **Design Reference**: Authentic Castlery brand colors and typography
  - **Primary**: Castlery Terracotta (#844025)
  - **Secondary**: Maroon Velvet (#3c101e) 
  - **Accent**: Warm Linen (#f6f3e7)
  - **Typography**: Sanomat Sans with system font fallbacks
- **Information Density**: Maximized content visibility with minimal scrolling
- **Professional Appearance**: Clean, modern interface suitable for business use
- **Intuitive Interactions**: Drag-and-drop, click-to-advance, visual feedback

## Technical Requirements
- **Deployment Ready**: Static hosting compatible (Netlify, Vercel, GitHub Pages)
- **Data Persistence**: Browser localStorage with CSV backup capabilities
- **No Backend Required**: Fully client-side application
- **Privacy-First**: All data stays local to each user's browser
- **Cross-Platform**: Works on any device with a modern web browser
- **Offline Capable**: Functions without internet after initial load

## User Personas
- **Primary**: Meeting facilitators/scrum masters managing large teams
- **Secondary**: Team leads coordinating multiple team standups
- **Tertiary**: Individual contributors participating in structured meetings

## Success Metrics
- **Meeting Efficiency**: Consistent duration and improved time distribution
- **Attendance Tracking**: Accurate absence management and reporting
- **User Adoption**: Easy deployment and team member engagement
- **Data Quality**: Comprehensive reporting with actionable insights
- **Scalability**: Effective management of 30+ team members

## Key Learnings & Best Practices
- **Start Simple**: Manual timer start allows proper attendance setup
- **Visual Alignment**: Form elements require careful CSS alignment (especially in flexbox)
- **Information Density**: Horizontal layouts and compact spacing improve usability
- **Data Validation**: Handle undefined/null values gracefully in calculations
- **User Control**: Provide explicit controls (End Meeting) rather than implicit actions
- **Bulk Operations**: CSV import/export essential for large team management