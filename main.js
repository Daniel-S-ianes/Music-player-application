//UI elements
const audio = document.getElementById('audioElement');
const audioInput = document.getElementById('audioInput');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const trackTitle = document.getElementById('trackTitle');
const trackStatus = document.getElementById('trackStatus');
const seekBar = document.getElementById('seekBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationTimeDisplay = document.getElementById('durationTime');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const playlistUI = document.getElementById('playlist');

//Playlist State
let playlist = []; // Array storing track objects: { file, title, url }
let currentTrackIndex = -1;
let lastVolume = 1;

//Helper: Format seconds to MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

//Load Multiple Local Files
audioInput.addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    playlist.forEach(item => URL.revokeObjectURL(item.url));
    
    playlist = files.map(file => ({
        file: file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file)
    }));

    renderPlaylist();
    loadTrack(0); // Load and play first track automatically
});

// Render Queue UI
function renderPlaylist() {
    playlistUI.innerHTML = "";
    
    playlist.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `playlist-item ${index === currentTrackIndex ? 'active' : ''}`;
        li.textContent = `${index + 1}. ${item.title}`;
        li.addEventListener('click', () => loadTrack(index));
        playlistUI.appendChild(li);
    });
}

//Load track by index
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;

    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];

    audio.src = track.url;
    trackTitle.textContent = track.title;
    
    audio.play();
    playBtn.textContent = "Pause";
    trackStatus.textContent = "Playing";

    renderPlaylist();
    setupMediaSession(track.title);
}

//Play/Pause toggle
function togglePlay() {
    if (!audio.src) return;

    if (audio.paused) {
        audio.play();
        playBtn.textContent = "Pause";
        trackStatus.textContent = "Playing";
    } else {
        audio.pause();
        playBtn.textContent = "Play";
        trackStatus.textContent = "Paused";
    }
}

//Next / Previous Handlers
function nextTrack() {
    if (playlist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) nextIndex = 0;
    loadTrack(nextIndex);
}

function prevTrack() {
    if (playlist.length === 0) return;
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = playlist.length - 1;
    loadTrack(prevIndex);
}

//Audio Event Listeners
audio.addEventListener('loadedmetadata', () => {
    seekBar.max = Math.floor(audio.duration);
    durationTimeDisplay.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
    seekBar.value = Math.floor(audio.currentTime);
    currentTimeDisplay.textContent = formatTime(audio.currentTime);
});

seekBar.addEventListener('input', () => {
    audio.currentTime = seekBar.value;
});

//Auto-advance queue on track completion
audio.addEventListener('ended', () => {
    if (currentTrackIndex < playlist.length - 1) {
        nextTrack();
    } else {
        playBtn.textContent = "Play";
        trackStatus.textContent = "Queue Ended";
        seekBar.value = 0;
        currentTimeDisplay.textContent = "00:00";
    }
});

//Volume Adjustment & Mute
volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    audio.muted = false;
    updateMuteIcon();
});

function toggleMute() {
    if (audio.muted) {
        audio.muted = false;
        audio.volume = lastVolume > 0 ? lastVolume : 1;
        volumeSlider.value = audio.volume;
    } else {
        lastVolume = audio.volume;
        audio.muted = true;
        volumeSlider.value = 0;
    }
    updateMuteIcon();
}

function updateMuteIcon() {
    if (audio.muted || audio.volume === 0) {
        muteBtn.textContent = "🔇";
    } else if (audio.volume < 0.5) {
        muteBtn.textContent = "🔉";
    } else {
        muteBtn.textContent = "🔊";
    }
}

//Android MediaSession Integration
function setupMediaSession(songTitle) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: songTitle,
            artist: "Offline Library",
            album: "My Music Player"
        });

        navigator.mediaSession.setActionHandler('play', () => { togglePlay(); });
        navigator.mediaSession.setActionHandler('pause', () => { togglePlay(); });
        navigator.mediaSession.setActionHandler('previoustrack', () => { prevTrack(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { nextTrack(); });
    }
}

//Attach UI listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
muteBtn.addEventListener('click', toggleMute);