//Html elements
const audio = document.getElementById('audioElement');
const audioInput = document.getElementById('audioInput');

//wait for user to choose file
audioInput.addEventListener('change', function(e) {
    const file = e.target.files[0];

    if (file) {
        const fileURL = URL.createObjectURL(file);

        audio.src = fileURL;
        audio.play();

        console.log("Now Playing:", file.name);
    }
});