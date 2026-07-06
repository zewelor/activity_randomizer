// DOM Elements
const activityInput = document.getElementById('activity-input');
const urlInput = document.getElementById('url-input');
const addBtn = document.getElementById('add-btn');
const activityList = document.getElementById('activity-list');
const randomizeBtn = document.getElementById('randomize-btn');
const activityDisplay = document.getElementById('activity-display');
const clearBtn = document.getElementById('clear-btn');
const shareBtn = document.getElementById('share-btn');
const youtubeContainer = document.getElementById('youtube-container');
const youtubePlayer = document.getElementById('youtube-player');
const themeToggle = document.getElementById('theme-toggle');
const themeToggleIcon = document.querySelector('.theme-toggle-icon');
const validationMsg = document.getElementById('validation-msg');

// Store activities
let activities = [];

// Add a variable to store the previously selected activity index
let previousIndex = -1;

// Theme management
function initTheme() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleIcon.textContent = '☀️';
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeToggleIcon.textContent = '🌙';
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            themeToggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    }
}

themeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        themeToggleIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        themeToggleIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
});

// Load activities from URL if available
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadActivitiesFromUrl();
    renderActivityList();

    // Show a random activity on page load if activities are available
    if (activities.length > 0) {
        selectRandomActivity();
    }
});

// Add activity
addBtn.addEventListener('click', () => {
    addActivity();
});

// Add activity on Enter key
activityInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        addActivity();
    }
});

urlInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        addActivity();
    }
});

// Function to stop YouTube video
function stopYoutubeVideo() {
    youtubePlayer.src = '';
    youtubeContainer.style.display = 'none';
}

// Function to select and display a random activity
function selectRandomActivity() {
    if (activities.length === 0) {
        activityDisplay.innerHTML = '<p>Please add some activities first!</p>';
        return;
    }

    // Stop any currently playing video first
    stopYoutubeVideo();

    let randomIndex;

    // If there's only one activity, we have to use it
    if (activities.length === 1) {
        randomIndex = 0;
    } else {
        // Create a list of available indices excluding the previous one
        const availableIndices = [];
        for (let i = 0; i < activities.length; i++) {
            if (i !== previousIndex) {
                availableIndices.push(i);
            }
        }

        // Select a random index from the available list
        const rand = Math.floor(Math.random() * availableIndices.length);
        randomIndex = availableIndices[rand];
    }

    // Update the previous index
    previousIndex = randomIndex;
    const activity = activities[randomIndex];

    // Check if it's a YouTube URL
    if (activity.url && isYoutubeUrl(activity.url)) {
        const videoId = extractYoutubeVideoId(activity.url);
        if (videoId) {
            // Display YouTube video
            activityDisplay.innerHTML = `<p>Playing: ${escapeHTML(activity.name)}</p>`;
            youtubeContainer.style.display = 'block';
            youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else {
            activityDisplay.innerHTML = `<p>${escapeHTML(activity.name)}</p>`;
        }
    } else if (activity.url) {
        // Display regular activity with an "Open link" link
        activityDisplay.innerHTML = `
            <p>${escapeHTML(activity.name)}</p>
            <div style="margin-top: 10px;">
                <a href="${escapeHTML(activity.url)}" target="_blank" rel="noopener noreferrer" class="activity-link">Open link 🔗</a>
            </div>
        `;
    } else {
        // Display regular activity
        activityDisplay.innerHTML = `<p>${escapeHTML(activity.name)}</p>`;
    }
}

// Get random activity
randomizeBtn.addEventListener('click', () => {
    selectRandomActivity();
});

// Clear all activities
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all activities?')) {
        activities = [];
        renderActivityList();
        updateURL();
        activityDisplay.innerHTML = '<p>Click the button to get a random activity!</p>';
        stopYoutubeVideo();
        previousIndex = -1;
        clearValidationError();
    }
});

// Share URL
shareBtn.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => {
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied! ✓';
            shareBtn.disabled = true;
            setTimeout(() => {
                shareBtn.textContent = originalText;
                shareBtn.disabled = false;
            }, 2000);
        })
        .catch(() => {
            alert('Failed to copy URL. Please copy it manually from the address bar.');
        });
});

// Clear error message when user starts typing
activityInput.addEventListener('input', () => {
    clearValidationError();
});
urlInput.addEventListener('input', () => {
    clearValidationError();
});

// Helper Functions
function showValidationError(message) {
    validationMsg.textContent = message;
    validationMsg.style.display = 'block';
    activityInput.style.borderColor = 'var(--delete-button)';
    urlInput.style.borderColor = 'var(--delete-button)';
}

function clearValidationError() {
    if (validationMsg) {
        validationMsg.textContent = '';
        validationMsg.style.display = 'none';
    }
    activityInput.style.borderColor = '';
    urlInput.style.borderColor = '';
}

function addActivity() {
    const name = activityInput.value.trim();
    const url = urlInput.value.trim();

    if (name === '') {
        showValidationError('Please enter an activity name.');
        return;
    }

    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        showValidationError('Please enter a valid URL starting with http:// or https://');
        return;
    }

    clearValidationError();
    activities.push({
        name,
        url: url || null
    });
    activityInput.value = '';
    urlInput.value = '';
    activityInput.focus();

    // Reset instruction if previous state was "Please add some activities first!"
    if (activities.length === 1 && activityDisplay.textContent.includes('Please add some activities first')) {
        activityDisplay.innerHTML = '<p>Click the button to get a random activity!</p>';
    }

    renderActivityList();
    updateURL();
}

function renderActivityList() {
    activityList.innerHTML = '';

    activities.forEach((activity, index) => {
        const li = document.createElement('li');

        // Create text content
        const displayName = activity.url ? `${activity.name} 🔗` : activity.name;
        const text = document.createTextNode(displayName);
        li.appendChild(text);

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => {
            deleteActivity(index);
        });

        li.appendChild(deleteBtn);
        activityList.appendChild(li);
    });
}

function deleteActivity(index) {
    activities.splice(index, 1);
    renderActivityList();
    updateURL();

    // Adjust previous index since elements have shifted
    if (index === previousIndex) {
        previousIndex = -1;
    } else if (index < previousIndex) {
        previousIndex--;
    }

    // Reset display if no activities remain
    if (activities.length === 0) {
        activityDisplay.innerHTML = '<p>Click the button to get a random activity!</p>';
        stopYoutubeVideo();
    }
}

function updateURL() {
    // Encode activities in URL
    const encodedActivities = encodeURIComponent(JSON.stringify(activities));
    const newUrl = `${window.location.origin}${window.location.pathname}?activities=${encodedActivities}`;
    window.history.replaceState({ activities }, document.title, newUrl);
}

function loadActivitiesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const activitiesParam = urlParams.get('activities');

    if (activitiesParam) {
        try {
            const parsed = JSON.parse(decodeURIComponent(activitiesParam));
            if (Array.isArray(parsed)) {
                activities = parsed
                    .filter(item => item && typeof item === 'object' && typeof item.name === 'string' && item.name.trim() !== '')
                    .map(item => ({
                        name: item.name.trim(),
                        url: (typeof item.url === 'string' && (item.url.startsWith('http://') || item.url.startsWith('https://'))) ? item.url : null
                    }));
            }
        } catch (e) {
            console.error('Error parsing activities from URL:', e);
        }
    }
}

function isYoutubeUrl(url) {
    // Basic check for YouTube URL
    return url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1;
}

function extractYoutubeVideoId(url) {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        const videoId = match[2];
        // Validate video ID consists only of alphanumeric, underscore, or hyphen
        if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
            return videoId;
        }
    }
    return null;
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
