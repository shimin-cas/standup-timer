// Application State
let appState = {
    members: JSON.parse(localStorage.getItem('standupMembers') || '[]'),
    templates: JSON.parse(localStorage.getItem('standupTemplates') || '[]'),
    reports: JSON.parse(localStorage.getItem('standupReports') || '[]'),
    currentMeeting: null,
    timer: {
        startTime: null,
        elapsed: 0,
        isRunning: false,
        currentSpeaker: null,
        speakerTimes: {}
    }
};

// Timer functionality
let timerInterval = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderTeamList();
    renderTemplateList();
    renderReportsList();
    updateTemplateSelect();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Timer controls
    document.getElementById('start-meeting').addEventListener('click', startMeeting);
    document.getElementById('pause-btn').addEventListener('click', toggleTimer);
    document.getElementById('next-btn').addEventListener('click', nextSpeaker);
    document.getElementById('end-meeting').addEventListener('click', endMeeting);
    document.getElementById('manage-attendance').addEventListener('click', openAttendanceModal);

    // Modal triggers
    document.getElementById('add-member-btn').addEventListener('click', () => openMemberModal());
    document.getElementById('add-template-btn').addEventListener('click', () => openTemplateModal());
    document.getElementById('import-csv-btn').addEventListener('click', openCsvImportModal);
    document.getElementById('export-csv-btn').addEventListener('click', exportTeamCsv);

    // Form submissions
    document.getElementById('member-form').addEventListener('submit', saveMember);
    document.getElementById('template-form').addEventListener('submit', saveTemplate);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
}

// Navigation
function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Timer Functions
function startMeeting() {
    const templateId = document.getElementById('template-select').value;
    if (!templateId) {
        alert('Please select a template first');
        return;
    }

    const template = appState.templates.find(t => t.id === templateId);
    if (!template) return;

    // Initialize meeting
    appState.currentMeeting = {
        id: Date.now().toString(),
        templateId: templateId,
        templateName: template.name,
        startTime: new Date(),
        speakers: template.members.map(memberId => {
            const member = appState.members.find(m => m.id === memberId);
            return {
                id: memberId,
                name: member.name,
                email: member.email,
                team: member.team || 'No Team',
                timeSpent: 0,
                isPresent: true
            };
        }),
        currentSpeakerIndex: 0,
        isActive: true
    };

    // Reset timer state - don't start automatically
    appState.timer = {
        startTime: null,
        elapsed: 0,
        isRunning: false,
        currentSpeaker: appState.currentMeeting.speakers[0].id,
        speakerTimes: {}
    };

    // Update UI
    document.getElementById('speakers-queue').style.display = 'block';
    document.getElementById('meeting-management').style.display = 'block';
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('pause-btn').textContent = 'Start';
    document.getElementById('next-btn').disabled = true;
    document.getElementById('start-meeting').disabled = true;

    renderSpeakerQueue();
    // Don't start timer automatically - wait for user to click Start
}

function getCurrentSpeaker() {
    if (!appState.currentMeeting) return null;
    return appState.currentMeeting.speakers[appState.currentMeeting.currentSpeakerIndex] || null;
}

function syncCurrentSpeakerElapsed() {
    const speaker = getCurrentSpeaker();
    if (!speaker) return;

    if (appState.timer.isRunning && appState.timer.startTime !== null) {
        appState.timer.elapsed = Date.now() - appState.timer.startTime;
    }

    speaker.timeSpent = Math.floor(appState.timer.elapsed / 1000);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (appState.timer.isRunning && appState.currentMeeting) {
            appState.timer.elapsed = Date.now() - appState.timer.startTime;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const elapsed = Math.floor(appState.timer.elapsed / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    const btn = document.getElementById('pause-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (appState.timer.isRunning) {
        syncCurrentSpeakerElapsed();
        appState.timer.isRunning = false;
        btn.textContent = 'Resume';
    } else {
        const currentSpeaker = getCurrentSpeaker();
        if (!currentSpeaker || !currentSpeaker.isPresent) {
            alert('Please select a present speaker before starting the timer.');
            return;
        }

        appState.timer.elapsed = (currentSpeaker.timeSpent || 0) * 1000;
        appState.timer.startTime = Date.now() - appState.timer.elapsed;
        appState.timer.isRunning = true;
        startTimer();
        btn.textContent = 'Pause';
        nextBtn.disabled = false;
    }

    renderSpeakerQueue();
}

function nextSpeaker() {
    if (!appState.currentMeeting) return;

    syncCurrentSpeakerElapsed();

    const speakers = appState.currentMeeting.speakers;
    const currentIndex = appState.currentMeeting.currentSpeakerIndex;

    // Find next present speaker after the current index
    let nextIndex = -1;
    for (let i = currentIndex + 1; i < speakers.length; i++) {
        if (speakers[i].isPresent) {
            nextIndex = i;
            break;
        }
    }

    if (nextIndex >= 0) {
        appState.currentMeeting.currentSpeakerIndex = nextIndex;
        const nextSpkr = speakers[nextIndex];

        appState.timer.elapsed = (nextSpkr.timeSpent || 0) * 1000;
        appState.timer.startTime = appState.timer.isRunning ? Date.now() - appState.timer.elapsed : null;
        appState.timer.currentSpeaker = nextSpkr.id;

        renderSpeakerQueue();
    } else {
        // No more present speakers — meeting finished
        finishMeeting();
    }
}

function endMeeting() {
    if (!appState.currentMeeting) return;
    
    if (confirm('Are you sure you want to end the meeting?')) {
        finishMeeting();
    }
}

function finishMeeting() {
    if (!appState.currentMeeting) return;

    // Record final speaker time if meeting is active
    syncCurrentSpeakerElapsed();

    // Stop timer
    appState.timer.isRunning = false;
    clearInterval(timerInterval);

    // Calculate team-level analytics
    const presentSpeakers = appState.currentMeeting.speakers.filter(s => s.isPresent);
    const totalTime = presentSpeakers.reduce((sum, s) => sum + s.timeSpent, 0);
    const averageTime = presentSpeakers.length > 0 ? Math.round(totalTime / presentSpeakers.length) : 0;

    // Create report
    const report = {
        id: appState.currentMeeting.id,
        templateName: appState.currentMeeting.templateName,
        date: appState.currentMeeting.startTime,
        endTime: new Date(),
        speakers: appState.currentMeeting.speakers,
        totalTime: totalTime,
        averageTime: averageTime,
        attendeeCount: presentSpeakers.length,
        absenteeCount: appState.currentMeeting.speakers.length - presentSpeakers.length
    };

    // Show report preview instead of immediately saving
    showReportPreview(report);
}

function showReportPreview(report) {
    appState.pendingReport = report;
    
    const modal = document.getElementById('report-preview-modal');
    const content = document.getElementById('report-preview-content');
    
    const presentSpeakers = report.speakers.filter(s => s.isPresent);
    const absentSpeakers = report.speakers.filter(s => !s.isPresent);
    
    // Calculate team statistics
    const teamStats = {};
    presentSpeakers.forEach(speaker => {
        const member = appState.members.find(m => m.id === speaker.id);
        const team = member?.team || 'No Team';
        
        if (!teamStats[team]) {
            teamStats[team] = {
                attendees: 0,
                totalTime: 0
            };
        }
        
        teamStats[team].attendees++;
        teamStats[team].totalTime += speaker.timeSpent;
    });
    
    // Calculate totals
    const totalAttendees = Object.values(teamStats).reduce((sum, team) => sum + team.attendees, 0);
    const totalTeamTime = Object.values(teamStats).reduce((sum, team) => sum + team.totalTime, 0);
    
    content.innerHTML = `
        <div class="report-summary">
            <h4>Meeting Summary - ${report.templateName}</h4>
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-value">${Math.floor(report.totalTime / 60)}:${(report.totalTime % 60).toString().padStart(2, '0')}</div>
                    <div class="stat-label">Total Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.floor(report.averageTime / 60)}:${(report.averageTime % 60).toString().padStart(2, '0')}</div>
                    <div class="stat-label">Average Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${report.attendeeCount}</div>
                    <div class="stat-label">Present</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${report.absenteeCount}</div>
                    <div class="stat-label">Absent</div>
                </div>
            </div>
        </div>
        
        <div class="team-breakdown">
            <h4>Team Breakdown</h4>
            <table class="compact-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>Attendees</th>
                        <th>Team Time</th>
                        <th>Avg Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(teamStats).map(([team, stats]) => {
                        const avgTime = Math.round(stats.totalTime / stats.attendees);
                        return `
                            <tr>
                                <td><strong>${team}</strong></td>
                                <td>${stats.attendees}</td>
                                <td>${Math.floor(stats.totalTime / 60)}:${(stats.totalTime % 60).toString().padStart(2, '0')}</td>
                                <td>${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, '0')}</td>
                            </tr>
                        `;
                    }).join('')}
                    <tr class="total-row">
                        <td><strong>Total</strong></td>
                        <td><strong>${totalAttendees}</strong></td>
                        <td><strong>${Math.floor(totalTeamTime / 60)}:${(totalTeamTime % 60).toString().padStart(2, '0')}</strong></td>
                        <td><strong>${Math.floor(report.averageTime / 60)}:${(report.averageTime % 60).toString().padStart(2, '0')}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        ${absentSpeakers.length > 0 ? `
            <div class="absentee-list">
                <h4>Absentees (${absentSpeakers.length})</h4>
                <table class="compact-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${absentSpeakers.map(speaker => {
                            const member = appState.members.find(m => m.id === speaker.id);
                            return `
                                <tr>
                                    <td>${speaker.name}</td>
                                    <td>${member?.team || 'No Team'}</td>
                                    <td class="absent-reason">${speaker.absentReason || 'No reason provided'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}
        
        <div class="performance-leaderboard">
            <h4>Speaking Time Leaderboard</h4>
            <div class="leaderboard-bars">
                ${presentSpeakers
                    .sort((a, b) => b.timeSpent - a.timeSpent)
                    .map((speaker, index) => {
                        const member = appState.members.find(m => m.id === speaker.id);
                        const maxTime = Math.max(...presentSpeakers.map(s => s.timeSpent));
                        const barWidth = maxTime > 0 ? (speaker.timeSpent / maxTime) * 100 : 0;
                        
                        // Animal emojis for top 3
                        const topEmojis = ['🦁', '🐯', '🐻'];
                        const emoji = index < 3 ? topEmojis[index] : '';
                        
                        return `
                            <div class="leaderboard-bar-item ${index < 3 ? 'top-performer' : ''}">
                                <div class="bar-left">
                                    <span class="rank-emoji">${emoji}</span>
                                    <span class="speaker-name">${speaker.name}</span>
                                </div>
                                <div class="bar-container">
                                    <div class="time-bar" style="width: ${barWidth}%"></div>
                                    <div class="time-label">
                                        <input type="text" class="time-input-mini" 
                                               data-speaker-id="${speaker.id}" 
                                               data-field="timeSpent" 
                                               value="${Math.floor(speaker.timeSpent / 60)}:${(speaker.timeSpent % 60).toString().padStart(2, '0')}" 
                                               placeholder="MM:SS">
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
            </div>
        </div>
        
        ${absentSpeakers.length > 0 ? `
            <div class="detailed-absentees">
                <h4>Detailed Absentee List (${absentSpeakers.length})</h4>
                <div class="absentee-grid">
                    ${absentSpeakers.map(speaker => {
                        const member = appState.members.find(m => m.id === speaker.id);
                        return `
                            <div class="absentee-item">
                                <div class="absentee-info">
                                    <div class="absentee-name">${speaker.name}</div>
                                    <div class="absentee-details">
                                        <span class="team-badge">${member?.team || 'No Team'}</span>
                                        <span class="email">${speaker.email}</span>
                                    </div>
                                </div>
                                <div class="absence-reason">
                                    <strong>Reason:</strong> ${speaker.absentReason || 'No reason provided'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
    
    // Add event listeners for time inputs
    setTimeout(() => {
        const timeInputs = document.querySelectorAll('.time-input');
        timeInputs.forEach(input => {
            input.addEventListener('input', updateTimeAndVariance);
            input.addEventListener('blur', validateTimeFormat);
        });
    }, 100);
}

function updateTimeAndVariance(e) {
    const speakerId = e.target.dataset.speakerId;
    const timeValue = e.target.value;
    
    // Parse time input (MM:SS format)
    const timeParts = timeValue.split(':');
    if (timeParts.length === 2) {
        const minutes = parseInt(timeParts[0]) || 0;
        const seconds = parseInt(timeParts[1]) || 0;
        const totalSeconds = minutes * 60 + seconds;
        
        // Update speaker time in pending report
        const speaker = appState.pendingReport.speakers.find(s => s.id === speakerId);
        if (speaker) {
            speaker.timeSpent = totalSeconds;
            
            // Recalculate averages and variance
            const presentSpeakers = appState.pendingReport.speakers.filter(s => s.isPresent);
            const totalTime = presentSpeakers.reduce((sum, s) => sum + s.timeSpent, 0);
            const averageTime = Math.round(totalTime / presentSpeakers.length);
            appState.pendingReport.totalTime = totalTime;
            appState.pendingReport.averageTime = averageTime;
            
            // Update variance display
            const variance = totalSeconds - averageTime;
            const varianceText = variance >= 0 ? 
                `+${Math.floor(Math.abs(variance) / 60)}:${(Math.abs(variance) % 60).toString().padStart(2, '0')}` : 
                `-${Math.floor(Math.abs(variance) / 60)}:${(Math.abs(variance) % 60).toString().padStart(2, '0')}`;
            const varianceClass = variance > 30 ? 'over-time' : variance < -30 ? 'under-time' : 'on-time';
            
            const varianceCell = document.getElementById(`variance-${speakerId}`);
            if (varianceCell) {
                varianceCell.textContent = varianceText;
                varianceCell.className = varianceClass;
            }
            
            // Update summary stats
            updateSummaryStats();
        }
    }
}

function validateTimeFormat(e) {
    const timeValue = e.target.value;
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = timeValue.match(timeRegex);
    
    if (!match) {
        // Reset to valid format if invalid
        const speakerId = e.target.dataset.speakerId;
        const speaker = appState.pendingReport.speakers.find(s => s.id === speakerId);
        if (speaker) {
            e.target.value = `${Math.floor(speaker.timeSpent / 60)}:${(speaker.timeSpent % 60).toString().padStart(2, '0')}`;
        }
        alert('Please enter time in MM:SS format (e.g., 1:30 for 1 minute 30 seconds)');
    } else {
        // Ensure seconds are valid (0-59)
        const seconds = parseInt(match[2]);
        if (seconds > 59) {
            alert('Seconds must be between 00 and 59');
            e.target.focus();
        }
    }
}

function updateSummaryStats() {
    const presentSpeakers = appState.pendingReport.speakers.filter(s => s.isPresent);
    const totalTime = presentSpeakers.reduce((sum, s) => sum + s.timeSpent, 0);
    const averageTime = Math.round(totalTime / presentSpeakers.length);
    
    // Update summary display
    const summaryStats = document.querySelector('.summary-stats');
    if (summaryStats) {
        const totalStat = summaryStats.children[0].querySelector('.stat-value');
        const avgStat = summaryStats.children[1].querySelector('.stat-value');
        
        if (totalStat) {
            totalStat.textContent = `${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`;
        }
        if (avgStat) {
            avgStat.textContent = `${Math.floor(averageTime / 60)}:${(averageTime % 60).toString().padStart(2, '0')}`;
        }
    }
    
    // Update team breakdown table
    updateTeamBreakdown();
}

function updateTeamBreakdown() {
    const presentSpeakers = appState.pendingReport.speakers.filter(s => s.isPresent);
    const teamStats = {};
    
    presentSpeakers.forEach(speaker => {
        const member = appState.members.find(m => m.id === speaker.id);
        const team = member?.team || 'No Team';
        
        if (!teamStats[team]) {
            teamStats[team] = { attendees: 0, totalTime: 0 };
        }
        
        teamStats[team].attendees++;
        teamStats[team].totalTime += speaker.timeSpent;
    });
    
    const teamTable = document.querySelector('.team-breakdown tbody');
    if (teamTable) {
        const totalAttendees = Object.values(teamStats).reduce((sum, team) => sum + team.attendees, 0);
        const totalTeamTime = Object.values(teamStats).reduce((sum, team) => sum + team.totalTime, 0);
        
        teamTable.innerHTML = Object.entries(teamStats).map(([team, stats]) => {
            const avgTime = Math.round(stats.totalTime / stats.attendees);
            return `
                <tr>
                    <td><strong>${team}</strong></td>
                    <td>${stats.attendees}</td>
                    <td>${Math.floor(stats.totalTime / 60)}:${(stats.totalTime % 60).toString().padStart(2, '0')}</td>
                    <td>${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, '0')}</td>
                </tr>
            `;
        }).join('') + `
            <tr class="total-row">
                <td><strong>Total</strong></td>
                <td><strong>${totalAttendees}</strong></td>
                <td><strong>${Math.floor(totalTeamTime / 60)}:${(totalTeamTime % 60).toString().padStart(2, '0')}</strong></td>
                <td><strong>${Math.floor(appState.pendingReport.averageTime / 60)}:${(appState.pendingReport.averageTime % 60).toString().padStart(2, '0')}</strong></td>
            </tr>
        `;
    }
}

function editReport() {
    // Allow editing of the report data
    const inputs = document.querySelectorAll('#report-preview-content .editable-field');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const speakerId = e.target.dataset.speakerId;
            const field = e.target.dataset.field;
            const speaker = appState.pendingReport.speakers.find(s => s.id === speakerId);
            if (speaker) {
                speaker[field] = e.target.value;
            }
        });
    });
    
    alert('You can now edit the notes in the table. Click "Save Report" when done.');
}

function saveReport() {
    if (!appState.pendingReport) return;
    
    // Save the report
    appState.reports.unshift(appState.pendingReport);
    saveToStorage('standupReports', appState.reports);
    
    // Reset UI
    resetMeetingUI();
    
    // Clear pending report
    appState.pendingReport = null;
    
    // Close modal and refresh reports
    closeModal('report-preview-modal');
    renderReportsList();
    
    alert('Meeting report saved successfully!');
}

function resetMeetingUI() {
    document.getElementById('current-speaker-name').textContent = 'Select a template to start';
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('speakers-queue').style.display = 'none';
    document.getElementById('meeting-management').style.display = 'none';
    document.getElementById('pause-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    document.getElementById('start-meeting').disabled = false;
    
    // Clear current meeting
    appState.currentMeeting = null;
}

function getTeamColor(teamName) {
    const teamColors = [
        '#2563eb', // blue
        '#7c3aed', // purple
        '#059669', // green
        '#dc2626', // red
        '#d97706', // amber
        '#0891b2'  // cyan
    ];

    if (!teamName) return '#6b7280';

    const normalized = teamName.toLowerCase();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }

    return teamColors[Math.abs(hash) % teamColors.length];
}

function toggleSpeakerAttendance(index) {
    if (!appState.currentMeeting) return;

    const speaker = appState.currentMeeting.speakers[index];
    if (!speaker) return;

    speaker.isPresent = !speaker.isPresent;
    speaker.absentReason = speaker.isPresent ? '' : 'Marked absent';

    if (!speaker.isPresent) {
        speaker.timeSpent = 0;
    }

    renderSpeakerQueue();
}

function renderSpeakerQueue() {
    if (!appState.currentMeeting) return;

    const container = document.getElementById('speaker-list');
    const currentIndex = appState.currentMeeting.currentSpeakerIndex;
    
    container.innerHTML = appState.currentMeeting.speakers.map((speaker, index) => {
        let className = 'speaker-card';
        if (!speaker.isPresent) {
            className += ' absent';
        } else if (index === currentIndex) {
            className += ' active';
        } else if (speaker.timeSpent > 0) {
            className += ' completed';
        }

        let timeText;
        if (!speaker.isPresent) {
            timeText = speaker.absentReason || 'Absent';
        } else if (speaker.timeSpent > 0) {
            timeText = `${Math.floor(speaker.timeSpent / 60)}:${(speaker.timeSpent % 60).toString().padStart(2, '0')}`;
        } else {
            timeText = 'Not started';
        }

        const clickHandler = speaker.isPresent ? `onclick="jumpToSpeaker(${index})"` : '';
        const teamName = speaker.team || 'No Team';

        return `
            <div class="${className}" ${clickHandler}>
                <div class="speaker-top-row">
                    <button class="attendance-toggle-btn ${speaker.isPresent ? 'present' : 'absent'}"
                            onclick="event.stopPropagation(); toggleSpeakerAttendance(${index})"
                            title="${speaker.isPresent ? 'Mark absent' : 'Mark present'}">
                        ${speaker.isPresent ? 'Present' : 'Absent'}
                    </button>
                    <div class="speaker-time">${timeText}</div>
                </div>
                <div class="speaker-name">${speaker.name}</div>
                <div class="speaker-team" style="color: ${getTeamColor(teamName)}">${teamName}</div>
            </div>
        `;
    }).join('');

    // Update current speaker name
    const currentSpeaker = appState.currentMeeting.speakers[currentIndex];
    document.getElementById('current-speaker-name').textContent = currentSpeaker ? currentSpeaker.name : 'Meeting Completed';
}

function jumpToSpeaker(index) {
    if (!appState.currentMeeting) return;

    const selectedSpeaker = appState.currentMeeting.speakers[index];
    if (!selectedSpeaker || !selectedSpeaker.isPresent) return;

    syncCurrentSpeakerElapsed();

    if (appState.currentMeeting.currentSpeakerIndex === index) {
        renderSpeakerQueue();
        return;
    }

    appState.currentMeeting.currentSpeakerIndex = index;
    appState.timer.currentSpeaker = selectedSpeaker.id;
    appState.timer.elapsed = (selectedSpeaker.timeSpent || 0) * 1000;

    if (appState.timer.isRunning) {
        appState.timer.startTime = Date.now() - appState.timer.elapsed;
    } else {
        appState.timer.startTime = null;
        document.getElementById('pause-btn').textContent = selectedSpeaker.timeSpent > 0 ? 'Resume' : 'Start';
    }

    updateTimerDisplay();
    renderSpeakerQueue();
}

// Attendance Management
function openAttendanceModal() {
    if (!appState.currentMeeting) return;
    
    const modal = document.getElementById('attendance-modal');
    const container = document.getElementById('attendance-list');
    
    container.innerHTML = appState.currentMeeting.speakers.map(speaker => `
        <div class="attendance-item">
            <div class="attendance-info">
                <h4>${speaker.name}</h4>
                <p>${speaker.email}</p>
            </div>
            <div class="attendance-controls">
                <div class="attendance-status">
                    <label>
                        <input type="radio" name="attendance-${speaker.id}" value="present" 
                               ${speaker.isPresent ? 'checked' : ''}>
                        Present
                    </label>
                    <label>
                        <input type="radio" name="attendance-${speaker.id}" value="absent" 
                               ${!speaker.isPresent ? 'checked' : ''}>
                        Absent
                    </label>
                </div>
                <input type="text" class="attendance-reason" 
                       placeholder="Reason..." 
                       value="${speaker.absentReason || ''}"
                       data-speaker-id="${speaker.id}"
                       ${speaker.isPresent ? 'disabled' : ''}>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for attendance changes
    container.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const speakerId = e.target.name.replace('attendance-', '');
            const reasonInput = container.querySelector(`input[data-speaker-id="${speakerId}"]`);
            
            if (e.target.value === 'present') {
                reasonInput.disabled = true;
                reasonInput.value = '';
            } else {
                reasonInput.disabled = false;
                reasonInput.focus();
            }
        });
    });
    
    modal.classList.add('active');
}

function saveAttendance() {
    if (!appState.currentMeeting) return;
    
    const container = document.getElementById('attendance-list');
    
    appState.currentMeeting.speakers.forEach(speaker => {
        const presentRadio = container.querySelector(`input[name="attendance-${speaker.id}"][value="present"]`);
        const reasonInput = container.querySelector(`input[data-speaker-id="${speaker.id}"]`);
        
        speaker.isPresent = presentRadio.checked;
        speaker.absentReason = reasonInput.value || '';
        
        // Reset time for absent speakers
        if (!speaker.isPresent) {
            speaker.timeSpent = 0;
        }
    });

    if (appState.timer.isRunning && appState.timer.startTime !== null) {
        syncCurrentSpeakerElapsed();
    }

    const currentSpeaker = getCurrentSpeaker();
    if (!currentSpeaker || !currentSpeaker.isPresent) {
        const firstPresentIndex = appState.currentMeeting.speakers.findIndex(speaker => speaker.isPresent);
        if (firstPresentIndex >= 0) {
            appState.currentMeeting.currentSpeakerIndex = firstPresentIndex;
            appState.timer.currentSpeaker = appState.currentMeeting.speakers[firstPresentIndex].id;
            appState.timer.elapsed = (appState.currentMeeting.speakers[firstPresentIndex].timeSpent || 0) * 1000;
            appState.timer.startTime = appState.timer.isRunning ? Date.now() - appState.timer.elapsed : null;
        } else {
            appState.timer.isRunning = false;
            appState.timer.startTime = null;
            appState.timer.elapsed = 0;
            document.getElementById('pause-btn').textContent = 'Start';
            document.getElementById('next-btn').disabled = true;
        }
    }

    if (!appState.timer.isRunning) {
        document.getElementById('pause-btn').textContent = (getCurrentSpeaker()?.timeSpent || 0) > 0 ? 'Resume' : 'Start';
    }

    updateTimerDisplay();
    
    // Update speaker queue display
    renderSpeakerQueue();
    
    closeModal('attendance-modal');
    alert('Attendance updated successfully!');
}

// Team Management
function openMemberModal(member = null) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('member-modal-title');
    const form = document.getElementById('member-form');

    if (member) {
        title.textContent = 'Edit Team Member';
        document.getElementById('member-email').value = member.email;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-team').value = member.team || '';
        form.dataset.editId = member.id;
    } else {
        title.textContent = 'Add Team Member';
        form.reset();
        delete form.dataset.editId;
    }

    modal.classList.add('active');
}

function saveMember(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = document.getElementById('member-email').value;
    const name = document.getElementById('member-name').value;
    const team = document.getElementById('member-team').value;

    // Check for duplicate email
    const existingMember = appState.members.find(m => m.email === email && m.id !== form.dataset.editId);
    if (existingMember) {
        alert('A member with this email already exists');
        return;
    }

    const member = {
        id: form.dataset.editId || Date.now().toString(),
        email,
        name,
        team,
        createdAt: new Date()
    };

    if (form.dataset.editId) {
        const index = appState.members.findIndex(m => m.id === form.dataset.editId);
        appState.members[index] = member;
    } else {
        appState.members.push(member);
    }

    saveToStorage('standupMembers', appState.members);
    renderTeamList();
    updateTemplateSelect();
    closeModal('member-modal');
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        appState.members = appState.members.filter(m => m.id !== id);
        saveToStorage('standupMembers', appState.members);
        renderTeamList();
        updateTemplateSelect();
    }
}

function renderTeamList() {
    const container = document.getElementById('team-list');
    
    if (appState.members.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No team members added yet.</p>';
        return;
    }

    // Group by team for better organization
    const membersByTeam = {};
    appState.members.forEach(member => {
        const team = member.team || 'No Team';
        if (!membersByTeam[team]) membersByTeam[team] = [];
        membersByTeam[team].push(member);
    });

    container.innerHTML = `
        <table class="compact-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Team</th>
                    <th>Added</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${appState.members.map(member => `
                    <tr>
                        <td><strong>${member.name}</strong></td>
                        <td>${member.email}</td>
                        <td>${member.team || '<em>No Team</em>'}</td>
                        <td>${new Date(member.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn-small btn-secondary" onclick="openMemberModal(${JSON.stringify(member).replace(/"/g, '&quot;')})">Edit</button>
                            <button class="btn-small btn-secondary" onclick="deleteMember('${member.id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Template Management
function openTemplateModal(template = null) {
    const modal = document.getElementById('template-modal');
    const title = document.getElementById('template-modal-title');
    const form = document.getElementById('template-form');

    // Render unified member list
    renderUnifiedMemberList(template?.members || []);

    if (template) {
        title.textContent = 'Edit Template';
        document.getElementById('template-name').value = template.name;
        form.dataset.editId = template.id;
    } else {
        title.textContent = 'Create Template';
        form.reset();
        delete form.dataset.editId;
    }

    modal.classList.add('active');
}

function renderUnifiedMemberList(selectedMembers = []) {
    const container = document.getElementById('unified-member-list');
    
    if (appState.members.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No team members available. Add members first.</p>';
        return;
    }

    // Separate selected and unselected members
    const selected = selectedMembers.map(id => appState.members.find(m => m.id === id)).filter(Boolean);
    const unselected = appState.members.filter(m => !selectedMembers.includes(m.id));
    
    container.innerHTML = `
        ${selected.length > 0 ? `
            <div class="selected-members">
                <h5>Selected Members (${selected.length})</h5>
                <div class="selected-list">
                    ${selected.map((member, index) => `
                        <div class="unified-member-item selected" data-member-id="${member.id}" draggable="true">
                            <div class="member-checkbox">
                                <input type="checkbox" value="${member.id}" checked onchange="toggleMemberSelection('${member.id}')">
                            </div>
                            <div class="sequence-number">${index + 1}</div>
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-email">${member.email}</div>
                                <div class="member-team">${member.team || 'No Team'}</div>
                            </div>
                            <div class="drag-handle">⋮⋮</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        ${unselected.length > 0 ? `
            <div class="unselected-members">
                <h5>Available Members (${unselected.length})</h5>
                <div class="unselected-list">
                    ${unselected.map(member => `
                        <div class="unified-member-item unselected" data-member-id="${member.id}">
                            <div class="member-checkbox">
                                <input type="checkbox" value="${member.id}" onchange="toggleMemberSelection('${member.id}')">
                            </div>
                            <div class="member-info">
                                <div class="member-name">${member.name}</div>
                                <div class="member-email">${member.email}</div>
                                <div class="member-team">${member.team || 'No Team'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
    
    // Add drag and drop functionality to selected items
    addDragAndDropToUnifiedList();
}

function toggleMemberSelection(memberId) {
    const container = document.getElementById('unified-member-list');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    
    renderUnifiedMemberList(selectedIds);
}

function addDragAndDropToUnifiedList() {
    const selectedItems = document.querySelectorAll('.unified-member-item.selected');
    
    selectedItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.memberId);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = item.dataset.memberId;
            
            if (draggedId !== targetId) {
                reorderUnifiedSequence(draggedId, targetId);
            }
        });
    });
}

function reorderUnifiedSequence(draggedId, targetId) {
    const container = document.getElementById('unified-member-list');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    const currentOrder = Array.from(checkboxes).map(cb => cb.value);
    
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    
    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);
    
    renderUnifiedMemberList(currentOrder);
}

function addDragAndDropToSequence() {
    const container = document.getElementById('speaker-sequence-list');
    const items = container.querySelectorAll('.sequence-item');
    
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.memberId);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = item.dataset.memberId;
            
            if (draggedId !== targetId) {
                reorderSequence(draggedId, targetId);
            }
        });
    });
}

function reorderSequence(draggedId, targetId) {
    const container = document.getElementById('speaker-sequence-list');
    const items = Array.from(container.querySelectorAll('.sequence-item'));
    const currentOrder = items.map(item => item.dataset.memberId);
    
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    
    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1);
    currentOrder.splice(targetIndex, 0, draggedId);
    
    renderSpeakerSequence(currentOrder);
}

function saveTemplate(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = document.getElementById('template-name').value;
    
    // Get sequence from the unified list
    const selectedItems = document.querySelectorAll('.unified-member-item.selected');
    const orderedMembers = Array.from(selectedItems).map(item => item.dataset.memberId);

    if (orderedMembers.length === 0) {
        alert('Please select at least one team member');
        return;
    }

    const template = {
        id: form.dataset.editId || Date.now().toString(),
        name,
        members: orderedMembers, // Use the ordered sequence
        createdAt: new Date()
    };

    if (form.dataset.editId) {
        const index = appState.templates.findIndex(t => t.id === form.dataset.editId);
        appState.templates[index] = template;
    } else {
        appState.templates.push(template);
    }

    saveToStorage('standupTemplates', appState.templates);
    renderTemplateList();
    updateTemplateSelect();
    closeModal('template-modal');
}

function deleteTemplate(id) {
    if (confirm('Are you sure you want to delete this template?')) {
        appState.templates = appState.templates.filter(t => t.id !== id);
        saveToStorage('standupTemplates', appState.templates);
        renderTemplateList();
        updateTemplateSelect();
    }
}

function renderTemplateList() {
    const container = document.getElementById('template-list');
    
    if (appState.templates.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No templates created yet.</p>';
        return;
    }

    container.innerHTML = `
        <table class="compact-table">
            <thead>
                <tr>
                    <th>Template Name</th>
                    <th>Members</th>
                    <th>Teams</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${appState.templates.map(template => {
                    const members = template.members.map(id => {
                        const member = appState.members.find(m => m.id === id);
                        return member ? { name: member.name, team: member.team } : null;
                    }).filter(Boolean);
                    
                    const memberNames = members.map(m => m.name).join(', ');
                    const teams = [...new Set(members.map(m => m.team || 'No Team'))].join(', ');
                    
                    return `
                        <tr>
                            <td><strong>${template.name}</strong></td>
                            <td>
                                <span class="member-count">${template.members.length}</span>
                                <div class="member-list">${memberNames}</div>
                            </td>
                            <td>${teams}</td>
                            <td>${new Date(template.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn-small btn-secondary" onclick="openTemplateModal(${JSON.stringify(template).replace(/"/g, '&quot;')})">Edit</button>
                                <button class="btn-small btn-secondary" onclick="deleteTemplate('${template.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function updateTemplateSelect() {
    const select = document.getElementById('template-select');
    select.innerHTML = '<option value="">Select a template</option>' +
        appState.templates.map(template => 
            `<option value="${template.id}">${template.name}</option>`
        ).join('');
}

// Reports
function renderReportsList() {
    renderTeamAnalytics();
    
    const container = document.getElementById('reports-list');
    
    if (appState.reports.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No meeting reports yet.</p>';
        return;
    }

    container.innerHTML = `
        <table class="compact-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Template</th>
                    <th>Duration</th>
                    <th>Avg Time</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${appState.reports.map(report => {
                    const date = new Date(report.date);
                    const dateStr = date.toLocaleDateString();
                    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    
                    // Handle undefined/null values
                    const totalTime = report.totalTime || 0;
                    const averageTime = report.averageTime || 0;
                    const attendeeCount = report.attendeeCount !== undefined ? report.attendeeCount : 
                        (report.speakers ? report.speakers.filter(s => s.isPresent).length : 0);
                    const absenteeCount = report.absenteeCount !== undefined ? report.absenteeCount : 
                        (report.speakers ? report.speakers.filter(s => !s.isPresent).length : 0);
                    
                    return `
                        <tr>
                            <td>
                                <div class="date-time">
                                    <strong>${dateStr}</strong>
                                    <div class="time-small">${timeStr}</div>
                                </div>
                            </td>
                            <td><strong>${report.templateName || 'Unknown'}</strong></td>
                            <td>${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}</td>
                            <td>${Math.floor(averageTime / 60)}:${(averageTime % 60).toString().padStart(2, '0')}</td>
                            <td><span class="attendance-badge present">${attendeeCount}</span></td>
                            <td><span class="attendance-badge absent">${absenteeCount}</span></td>
                            <td>
                                <button class="btn-small btn-secondary" onclick="viewFullReport('${report.id}')">View</button>
                                <button class="btn-small btn-secondary" onclick="exportReport('${report.id}')">Export</button>
                                <button class="btn-small btn-danger" onclick="deleteReport('${report.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function renderTeamAnalytics() {
    const container = document.getElementById('team-analytics');
    
    if (appState.reports.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    // Calculate team-level statistics with proper null/undefined handling
    const totalMeetings = appState.reports.length;
    const validReports = appState.reports.filter(r => r.attendeeCount !== undefined && r.totalTime !== undefined);
    
    const totalAttendees = validReports.reduce((sum, r) => sum + (r.attendeeCount || 0), 0);
    const totalTime = validReports.reduce((sum, r) => sum + (r.totalTime || 0), 0);
    
    const avgMeetingTime = validReports.length > 0 ? Math.round(totalTime / validReports.length) : 0;
    const avgAttendeesPerMeeting = validReports.length > 0 ? Math.round(totalAttendees / validReports.length) : 0;
    const avgTimePerAttendee = totalAttendees > 0 ? Math.round(totalTime / totalAttendees) : 0;
    
    // Calculate individual member statistics
    const memberStats = {};
    appState.reports.forEach(report => {
        if (report.speakers && Array.isArray(report.speakers)) {
            report.speakers.forEach(speaker => {
                if (speaker.email) {
                    if (!memberStats[speaker.email]) {
                        memberStats[speaker.email] = {
                            name: speaker.name,
                            totalTime: 0,
                            meetingsAttended: 0,
                            totalMeetings: 0
                        };
                    }
                    
                    memberStats[speaker.email].totalMeetings++;
                    if (speaker.isPresent) {
                        memberStats[speaker.email].totalTime += (speaker.timeSpent || 0);
                        memberStats[speaker.email].meetingsAttended++;
                    }
                }
            });
        }
    });
    
    const totalPossibleAttendances = totalMeetings * Object.keys(memberStats).length;
    const attendanceRate = totalPossibleAttendances > 0 ? (totalAttendees / totalPossibleAttendances) * 100 : 0;
    
    container.innerHTML = `
        <h3>Team Analytics</h3>
        <div class="analytics-grid">
            <div class="analytics-card">
                <h4>Total Meetings</h4>
                <div class="analytics-value">${totalMeetings}</div>
                <div class="analytics-label">Completed</div>
            </div>
            <div class="analytics-card">
                <h4>Average Meeting Time</h4>
                <div class="analytics-value">${Math.floor(avgMeetingTime / 60)}:${(avgMeetingTime % 60).toString().padStart(2, '0')}</div>
                <div class="analytics-label">Per Meeting</div>
            </div>
            <div class="analytics-card">
                <h4>Average Time per Person</h4>
                <div class="analytics-value">${Math.floor(avgTimePerAttendee / 60)}:${(avgTimePerAttendee % 60).toString().padStart(2, '0')}</div>
                <div class="analytics-label">Per Attendee</div>
            </div>
            <div class="analytics-card">
                <h4>Attendance Rate</h4>
                <div class="analytics-value">${Math.round(attendanceRate)}%</div>
                <div class="analytics-label">Overall</div>
            </div>
            <div class="analytics-card">
                <h4>Average Attendees</h4>
                <div class="analytics-value">${avgAttendeesPerMeeting}</div>
                <div class="analytics-label">Per Meeting</div>
            </div>
            <div class="analytics-card">
                <h4>Team Members</h4>
                <div class="analytics-value">${Object.keys(memberStats).length}</div>
                <div class="analytics-label">Total</div>
            </div>
        </div>
    `;
}

function viewFullReport(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;

    // Show the same detailed report as end-of-meeting
    showReportPreview(report);
}

function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this meeting report? This action cannot be undone.')) {
        appState.reports = appState.reports.filter(r => r.id !== reportId);
        saveToStorage('standupReports', appState.reports);
        renderReportsList();
    }
}

function viewReport(reportId) {
    // Keep the old simple view for backward compatibility
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;

    const speakers = report.speakers || [];
    const details = speakers.map(speaker => 
        `${speaker.name}: ${speaker.isPresent ? 
            `${Math.floor((speaker.timeSpent || 0) / 60)}:${((speaker.timeSpent || 0) % 60).toString().padStart(2, '0')}` : 
            'Absent'}`
    ).join('\n');

    const totalTime = report.totalTime || 0;
    const averageTime = report.averageTime || 0;

    alert(`Meeting Report: ${report.templateName || 'Unknown'}\nDate: ${new Date(report.date).toLocaleString()}\n\nSpeaker Times:\n${details}\n\nTotal Time: ${Math.floor(totalTime / 60)} minutes\nAverage Time: ${Math.floor(averageTime / 60)}:${(averageTime % 60).toString().padStart(2, '0')}`);
}

function exportReport(reportId) {
    const report = appState.reports.find(r => r.id === reportId);
    if (!report) return;

    const csvContent = [
        'Name,Email,Time Spent (seconds),Time Spent (formatted)',
        ...report.speakers.map(speaker => 
            `"${speaker.name}","${speaker.email}",${speaker.timeSpent},"${Math.floor(speaker.timeSpent / 60)}:${(speaker.timeSpent % 60).toString().padStart(2, '0')}"`
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standup-report-${new Date(report.date).toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// CSV Import/Export Functions
function exportTeamCsv() {
    if (appState.members.length === 0) {
        alert('No team members to export');
        return;
    }
    
    const csvContent = [
        'Name,Email,Team',
        ...appState.members.map(member => 
            `"${member.name}","${member.email}","${member.team || ''}"`
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function openCsvImportModal() {
    const modal = document.getElementById('csv-import-modal');
    const fileInput = document.getElementById('csv-file-input');
    const fileName = document.getElementById('file-name');
    const preview = document.getElementById('csv-preview');
    const confirmBtn = document.getElementById('import-csv-confirm');
    
    // Reset modal state
    fileInput.value = '';
    fileName.textContent = '';
    preview.style.display = 'none';
    confirmBtn.disabled = true;
    
    // Add file input listener
    fileInput.onchange = handleCsvFileSelect;
    
    modal.classList.add('active');
}

function handleCsvFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileName = document.getElementById('file-name');
    const preview = document.getElementById('csv-preview');
    const previewContent = document.getElementById('csv-preview-content');
    const confirmBtn = document.getElementById('import-csv-confirm');
    
    fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            alert('CSV file must have at least a header row and one data row');
            return;
        }
        
        // Parse CSV
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const expectedHeaders = ['Name', 'Email', 'Team'];
        
        // Validate headers
        const hasRequiredHeaders = expectedHeaders.slice(0, 2).every(header => 
            headers.some(h => h.toLowerCase() === header.toLowerCase())
        );
        
        if (!hasRequiredHeaders) {
            alert('CSV must have at least "Name" and "Email" columns');
            return;
        }
        
        // Parse data rows
        const members = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length >= 2 && values[0] && values[1]) {
                const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
                const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
                const teamIndex = headers.findIndex(h => h.toLowerCase() === 'team');
                
                members.push({
                    name: values[nameIndex] || '',
                    email: values[emailIndex] || '',
                    team: teamIndex >= 0 ? values[teamIndex] || '' : ''
                });
            }
        }
        
        if (members.length === 0) {
            alert('No valid member data found in CSV');
            return;
        }
        
        // Show preview
        previewContent.innerHTML = `
            <table class="compact-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Team</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(member => {
                        const existing = appState.members.find(m => m.email === member.email);
                        const status = existing ? 'Will Update' : 'New';
                        const statusClass = existing ? 'update-status' : 'new-status';
                        
                        return `
                            <tr>
                                <td>${member.name}</td>
                                <td>${member.email}</td>
                                <td>${member.team}</td>
                                <td><span class="${statusClass}">${status}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div class="import-summary">
                <p><strong>${members.length}</strong> members will be imported</p>
            </div>
        `;
        
        preview.style.display = 'block';
        confirmBtn.disabled = false;
        
        // Store parsed data for import
        window.pendingCsvImport = members;
    };
    
    reader.readAsText(file);
}

function confirmCsvImport() {
    if (!window.pendingCsvImport) return;
    
    const members = window.pendingCsvImport;
    let newCount = 0;
    let updateCount = 0;
    
    members.forEach(memberData => {
        const existingIndex = appState.members.findIndex(m => m.email === memberData.email);
        
        if (existingIndex >= 0) {
            // Update existing member
            appState.members[existingIndex] = {
                ...appState.members[existingIndex],
                name: memberData.name,
                team: memberData.team
            };
            updateCount++;
        } else {
            // Add new member
            appState.members.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                email: memberData.email,
                name: memberData.name,
                team: memberData.team,
                createdAt: new Date()
            });
            newCount++;
        }
    });
    
    saveToStorage('standupMembers', appState.members);
    renderTeamList();
    updateTemplateSelect();
    closeModal('csv-import-modal');
    
    alert(`Import completed!\n${newCount} new members added\n${updateCount} existing members updated`);
    
    // Clean up
    delete window.pendingCsvImport;
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
