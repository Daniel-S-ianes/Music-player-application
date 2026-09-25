//Html elements
const audio = document.getElementById('audioElement');
const audioInput = document.getElementById('audioInput');
const playBtn = document.getElementById('playBtn');
const trackTitle = document.getElementById('trackTitle');
const trackStatus =document.getElementById('trackStatus');

//wait for user to choose file
audioInput.addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (file) {
        const fileURL = URL.createObjectURL(file);
        audio.src = fileURL;
        
        trackTitle.textContent = file.name.replace(/\.[^/.]+$/,"");

        audio.play();
        playBtn.textContent = "Pause";
        trackStatus.textContent = "Playing";
    }
});

//3. Play/Pause toggle function
Function togglPlay() {
    //check if audio source has been loaded
    if (!audio.src) return;

    if (audio.paused) {
        audio.play();
        playBtn.textcontent = "Pause";
        trackStatus.textContent = "Playing";
    } else {
        audio.pause();
        playBtn.textContent = "Play";
        trackStatus.textContent = "Paused";
    }
}
playBtn.addEventListener('click', togglePlay);
});