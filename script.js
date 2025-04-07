// DOM Elements
const activityInput = document.getElementById('activity-input');
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

// Store activities
let activities = [];

// Add a variable to store the previously selected activity
let previousActivity = null;

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

    let randomActivity;

    // If there's only one activity, we have to use it
    if (activities.length === 1) {
        randomActivity = activities[0];
    } else {
        // Create a new array without the previous activity
        const availableActivities = activities.filter(activity => activity !== previousActivity);

        // Select a random activity from the filtered list
        const randomIndex = Math.floor(Math.random() * availableActivities.length);
        randomActivity = availableActivities[randomIndex];
    }

    // Update the previous activity
    previousActivity = randomActivity;

    // Check if it's a YouTube URL
    if (isYoutubeUrl(randomActivity)) {
        const videoId = extractYoutubeVideoId(randomActivity);
        if (videoId) {
            // Display YouTube video
            activityDisplay.innerHTML = `<p>Playing: ${randomActivity}</p>`;
            youtubeContainer.style.display = 'block';
            youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else {
            activityDisplay.innerHTML = `<p>${randomActivity}</p>`;
        }
    } else {
        // Display regular activity
        activityDisplay.innerHTML = `<p>${randomActivity}</p>`;
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
        previousActivity = null;
    }
});

// Share URL
shareBtn.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('URL copied to clipboard!');
        })
        .catch(() => {
            alert('Failed to copy URL. Please copy it manually from the address bar.');
        });
});

// Helper Functions
function addActivity() {
    const activity = activityInput.value.trim();

    if (activity === '') {
        alert('Please enter an activity');
        return;
    }

    // Check if input is a URL but not a YouTube URL
    if (isUrl(activity) && !isYoutubeUrl(activity)) {
        alert('Only YouTube URLs are supported. Other URLs cannot be used as activities.');
        return;
    }

    activities.push(activity);
    activityInput.value = '';
    activityInput.focus();

    renderActivityList();
    updateURL();
}

function renderActivityList() {
    activityList.innerHTML = '';

    activities.forEach((activity, index) => {
        const li = document.createElement('li');

        // Create text content
        const text = document.createTextNode(activity);
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
    const deletedActivity = activities.splice(index, 1)[0];
    renderActivityList();
    updateURL();

    // If we deleted the previous activity, reset it
    if (deletedActivity === previousActivity) {
        previousActivity = null;
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
            activities = JSON.parse(decodeURIComponent(activitiesParam));
        } catch (e) {
            console.error('Error parsing activities from URL:', e);
        }
    }
}

function isUrl(string) {
    // Basic check if the string appears to be a URL
    return string.startsWith('http://') || string.startsWith('https://');
}

function isYoutubeUrl(url) {
    // Basic check for YouTube URL
    return url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1;
}

function extractYoutubeVideoId(url) {
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
