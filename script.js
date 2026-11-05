const audio = document.getElementById("audio");

const folderInput =
    document.getElementById("folderInput");

const chooseFolder =
    document.getElementById("chooseFolder");

const searchInput =
    document.getElementById("searchInput");

const playlist =
    document.getElementById("playlist");

const songCount =
    document.getElementById("songCount");

const playlistStatus =
    document.getElementById("playlistStatus");

const songTitle =
    document.getElementById("songTitle");

const artistName =
    document.getElementById("artistName");

const playButton =
    document.getElementById("playButton");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const progress =
    document.getElementById("progress");

const progressContainer =
    document.getElementById("progressContainer");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const volumeSlider =
    document.getElementById("volumeSlider");

const volumeIcon =
    document.getElementById("volumeIcon");

const vinyl =
    document.getElementById("vinyl");


let songs = [];

let currentSongIndex = -1;

let objectURLs = [];


/* =========================
   CHOOSE SONGS
========================= */

chooseFolder.addEventListener("click", () => {

    folderInput.click();

});


/* =========================
   FILES SELECTED
========================= */

folderInput.addEventListener("change", () => {

    const files =
        Array.from(folderInput.files);

    songs = files.filter(file =>
        file.type.startsWith("audio/")
    );

    songs.sort((a, b) =>
        a.name.localeCompare(
            b.name,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        )
    );


    objectURLs.forEach(url => {
        URL.revokeObjectURL(url);
    });

    objectURLs = [];


    songs.forEach(file => {

        objectURLs.push(
            URL.createObjectURL(file)
        );

    });


    currentSongIndex = -1;


    songCount.textContent =
        `${songs.length} songs`;

    playlistStatus.textContent =
        `${songs.length} songs loaded`;


    renderPlaylist(songs);


    if (songs.length > 0) {

        loadSong(0, false);

    }

});


/* =========================
   DISPLAY PLAYLIST
========================= */

function renderPlaylist(list) {

    playlist.innerHTML = "";


    if (list.length === 0) {

        playlist.innerHTML = `

            <div class="empty-message">

                <div class="empty-icon">
                    ♪
                </div>

                <p>
                    No songs found
                </p>

                <small>
                    Try another search
                </small>

            </div>

        `;

        return;

    }


    list.forEach(song => {

        const originalIndex =
            songs.indexOf(song);


        const item =
            document.createElement("div");

        item.className =
            "song-item";


        if (
            originalIndex ===
            currentSongIndex
        ) {

            item.classList.add("active");

        }


        item.innerHTML = `

            <span class="song-number">
                ${String(
                    originalIndex + 1
                ).padStart(2, "0")}
            </span>

            <span class="song-item-name">
                ${escapeHTML(
                    removeExtension(song.name)
                )}
            </span>

            <span class="song-playing">
                ${
                    originalIndex ===
                    currentSongIndex
                        ? "●"
                        : ""
                }
            </span>

        `;


        item.addEventListener("click", () => {

            loadSong(
                originalIndex,
                true
            );

        });


        playlist.appendChild(item);

    });

}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!search) {

            renderPlaylist(songs);

            return;

        }


        const filtered =
            songs.filter(song =>
                song.name
                    .toLowerCase()
                    .includes(search)
            );


        renderPlaylist(filtered);

    }
);


/* =========================
   LOAD SONG
========================= */

function loadSong(index, autoPlay = false) {

    if (songs.length === 0) {
        return;
    }


    if (index < 0) {
        index = songs.length - 1;
    }


    if (index >= songs.length) {
        index = 0;
    }


    currentSongIndex = index;


    const song =
        songs[currentSongIndex];


    audio.src =
        objectURLs[currentSongIndex];


    songTitle.textContent =
        removeExtension(song.name);


    artistName.textContent =
        "Local music";


    currentTime.textContent =
        "0:00";

    duration.textContent =
        "0:00";

    progress.style.width =
        "0%";


    renderPlaylist(
        getSearchResults()
    );


    if (autoPlay) {

        audio.play().catch(error => {

            console.log(
                "Playback error:",
                error
            );

        });

    }

}


/* =========================
   PLAY / PAUSE
========================= */

playButton.addEventListener(
    "click",
    () => {

        if (!audio.src) {

            if (songs.length > 0) {

                loadSong(0, true);

            } else {

                folderInput.click();

            }

            return;

        }


        if (audio.paused) {

            audio.play();

        } else {

            audio.pause();

        }

    }
);


/* =========================
   PLAYING
========================= */

audio.addEventListener("play", () => {

    playButton.textContent = "Ⅱ";

    vinyl.classList.add("playing");

});


/* =========================
   PAUSED
========================= */

audio.addEventListener("pause", () => {

    playButton.textContent = "▶";

    vinyl.classList.remove("playing");

});


/* =========================
   NEXT
========================= */

nextButton.addEventListener(
    "click",
    () => {

        if (songs.length === 0) {

            folderInput.click();

            return;

        }


        loadSong(
            currentSongIndex + 1,
            true
        );

    }
);


/* =========================
   PREVIOUS
========================= */

previousButton.addEventListener(
    "click",
    () => {

        if (songs.length === 0) {

            folderInput.click();

            return;

        }


        if (audio.currentTime > 3) {

            audio.currentTime = 0;

            return;

        }


        loadSong(
            currentSongIndex - 1,
            true
        );

    }
);


/* =========================
   AUTOMATIC NEXT SONG
========================= */

audio.addEventListener("ended", () => {

    if (songs.length === 0) {
        return;
    }


    loadSong(
        currentSongIndex + 1,
        true
    );

});


/* =========================
   PROGRESS
========================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }


        const percentage =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        progress.style.width =
            `${percentage}%`;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

    }
);


/* =========================
   DURATION
========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);


/* =========================
   SEEK
========================= */

progressContainer.addEventListener(
    "click",
    event => {

        if (!audio.duration) {
            return;
        }


        const rect =
            progressContainer
                .getBoundingClientRect();


        const position =
            event.clientX -
            rect.left;


        const percentage =
            position / rect.width;


        audio.currentTime =
            percentage *
            audio.duration;

    }
);


/* =========================
   VOLUME
========================= */

volumeSlider.addEventListener(
    "input",
    () => {

        audio.volume =
            volumeSlider.value;


        if (audio.volume === 0) {

            volumeIcon.textContent = "🔇";

        } else if (audio.volume < 0.5) {

            volumeIcon.textContent = "🔉";

        } else {

            volumeIcon.textContent = "🔊";

        }

    }
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            document.activeElement ===
            searchInput
        ) {
            return;
        }


        if (event.code === "Space") {

            event.preventDefault();

            playButton.click();

        }


        if (event.code === "ArrowRight") {

            if (audio.duration) {

                audio.currentTime += 5;

            }

        }


        if (event.code === "ArrowLeft") {

            if (audio.duration) {

                audio.currentTime -= 5;

            }

        }

    }
);


/* =========================
   HELPERS
========================= */

function formatTime(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const remaining =
        Math.floor(seconds % 60);


    return (
        minutes +
        ":" +
        String(remaining).padStart(2, "0")
    );

}


function removeExtension(filename) {

    return filename.replace(
        /\.[^/.]+$/,
        ""
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


function getSearchResults() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!search) {
        return songs;
    }


    return songs.filter(song =>
        song.name
            .toLowerCase()
            .includes(search)
    );

}