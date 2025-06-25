// Activity Randomizer Module
const ActivityApp = (() => {
    const els = {
        activityInput: document.getElementById('activity-input'),
        addBtn: document.getElementById('add-btn'),
        activityList: document.getElementById('activity-list'),
        randomizeBtn: document.getElementById('randomize-btn'),
        activityDisplay: document.getElementById('activity-display'),
        clearBtn: document.getElementById('clear-btn'),
        shareBtn: document.getElementById('share-btn'),
        youtubeContainer: document.getElementById('youtube-container'),
        youtubePlayer: document.getElementById('youtube-player'),
        themeToggle: document.getElementById('theme-toggle'),
        themeToggleIcon: document.querySelector('.theme-toggle-icon'),
    };

    let activities = [];
    let previousActivity = null;

    const init = () => {
        initTheme();
        loadActivitiesFromUrl();
        bindEvents();
        renderActivityList();
        if (activities.length) selectRandomActivity();
    };

    const bindEvents = () => {
        els.addBtn.addEventListener('click', addActivity);
        els.activityInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') addActivity();
        });
        els.randomizeBtn.addEventListener('click', selectRandomActivity);
        els.clearBtn.addEventListener('click', clearActivities);
        els.shareBtn.addEventListener('click', copyShareUrl);
        els.activityList.addEventListener('click', handleListClick);
        els.themeToggle.addEventListener('click', toggleTheme);
    };

    const handleListClick = e => {
        if (e.target.dataset.index) {
            deleteActivity(parseInt(e.target.dataset.index, 10));
        }
    };

    const stopYoutubeVideo = () => {
        els.youtubePlayer.src = '';
        els.youtubeContainer.style.display = 'none';
    };

    const selectRandomActivity = () => {
        if (!activities.length) {
            els.activityDisplay.innerHTML = '<p>Please add some activities first!</p>';
            return;
        }

        stopYoutubeVideo();

        let randomActivity;
        if (activities.length === 1) {
            randomActivity = activities[0];
        } else {
            const available = activities.filter(a => a !== previousActivity);
            randomActivity = available[Math.floor(Math.random() * available.length)];
        }
        previousActivity = randomActivity;

        if (isYoutubeUrl(randomActivity)) {
            const videoId = extractYoutubeVideoId(randomActivity);
            if (videoId) {
                els.activityDisplay.innerHTML = `<p>Playing: ${randomActivity}</p>`;
                els.youtubeContainer.style.display = 'block';
                els.youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                return;
            }
        }
        els.activityDisplay.innerHTML = `<p>${randomActivity}</p>`;
    };

    const clearActivities = () => {
        if (!confirm('Are you sure you want to clear all activities?')) return;
        activities = [];
        previousActivity = null;
        renderActivityList();
        updateURL();
        els.activityDisplay.innerHTML = '<p>Click the button to get a random activity!</p>';
        stopYoutubeVideo();
    };

    const copyShareUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => alert('URL copied to clipboard!'))
            .catch(() => alert('Failed to copy URL. Please copy it manually from the address bar.'));
    };

    const addActivity = () => {
        const activity = els.activityInput.value.trim();
        if (!activity) {
            alert('Please enter an activity');
            return;
        }
        if (isUrl(activity) && !isYoutubeUrl(activity)) {
            alert('Only YouTube URLs are supported. Other URLs cannot be used as activities.');
            return;
        }
        activities.push(activity);
        els.activityInput.value = '';
        els.activityInput.focus();
        renderActivityList();
        updateURL();
    };

    const renderActivityList = () => {
        els.activityList.innerHTML = '';
        activities.forEach((activity, index) => {
            const li = document.createElement('li');
            li.textContent = activity;
            const del = document.createElement('button');
            del.textContent = '×';
            del.dataset.index = index;
            li.appendChild(del);
            els.activityList.appendChild(li);
        });
    };

    const deleteActivity = index => {
        const deleted = activities.splice(index, 1)[0];
        if (deleted === previousActivity) previousActivity = null;
        renderActivityList();
        updateURL();
    };

    const updateURL = () => {
        const encoded = encodeURIComponent(JSON.stringify(activities));
        const newUrl = `${window.location.origin}${window.location.pathname}?activities=${encoded}`;
        window.history.replaceState({ activities }, document.title, newUrl);
    };

    const loadActivitiesFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const activitiesParam = params.get('activities');
        if (activitiesParam) {
            try {
                activities = JSON.parse(decodeURIComponent(activitiesParam));
            } catch (e) {
                console.error('Error parsing activities from URL:', e);
            }
        }
    };

    const toggleTheme = () => {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.remove('dark-mode');
            els.themeToggleIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            els.themeToggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    };

    const initTheme = () => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.body.classList.add('dark-mode');
            els.themeToggleIcon.textContent = '☀️';
        } else if (saved === 'light') {
            document.body.classList.remove('dark-mode');
            els.themeToggleIcon.textContent = '🌙';
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            els.themeToggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    };

    const isUrl = str => str.startsWith('http://') || str.startsWith('https://');

    const isYoutubeUrl = url => url.includes('youtube.com') || url.includes('youtu.be');

    const extractYoutubeVideoId = url => {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', ActivityApp.init);
