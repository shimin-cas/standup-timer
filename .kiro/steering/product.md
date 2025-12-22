---
inclusion: always
---

# Standup Timer Web App

## Product Overview
A simple, deployable web application for managing and timing team standup meetings with performance tracking and reporting capabilities.

## Core Features

### Team Management
- **Team Member Data**: Maintain member profiles (email as primary key, name, team assignment)
- **Meeting Templates**: Create reusable standup configurations with member sequences
- **Flexible Data Management**: Full CRUD operations on all data entities

### Meeting Operations
- **Meeting Setup**: Start meetings from templates with real-time modifications
- **Timer Control**: 
  - Click-to-advance timing between speakers
  - Pause/resume functionality for breaks
  - Visual feedback for active speaker
- **Absence Management**: Mark members absent with reasons

### Reporting & Analytics
- **Session Reports**: Time spent per member, averages, attendance tracking
- **Performance Ratings**: Subjective scoring system for meeting participation
- **Historical Data**: Member and team performance trends over time
- **Export Capabilities**: Save and share meeting summaries

## Design & UI Requirements
- **Design Reference**: Follow Castlery's design aesthetic (https://www.castlery.com/sg)
  - Clean, modern, minimalist interface
  - Warm, approachable color palette
  - Generous whitespace and typography
  - Subtle shadows and rounded corners
  - Professional yet friendly visual tone

## Technical Requirements
- **Deployment Ready**: Simple setup and deployment process
- **Data Persistence**: Local storage or lightweight database
- **Responsive Design**: Works on desktop and tablet devices
- **Real-time Updates**: Live timer and status updates
- **Data Export**: JSON/CSV export for reports

## User Personas
- **Primary**: Meeting facilitators/scrum masters
- **Secondary**: Team leads managing multiple teams

## Success Metrics
- Meeting duration consistency
- Improved speaking time distribution
- Attendance tracking accuracy
- User adoption and retention