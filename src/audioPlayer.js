let audioContext
let analyser
let dataArray
let smoothedLevel = 0
let isReady = false

/**
 * function initAudioPlayer(options)
 * called on domloaded
 * create an <audio> element with a play/pause button, a song url input, and a volume input
 */

export function initAudioPlayer(options) {
    const audioPlayer = document.querySelector('.audio-player')
    const playPauseButton = audioPlayer.querySelector('.play-pause')
    const stopButton = audioPlayer.querySelector('.stop')
    const progressBarContainer = audioPlayer.querySelector('.progress-bar-container')
    const progressBar = progressBarContainer.querySelector('.progress-bar')
    const trackUpload = audioPlayer.querySelector('.track-upload')
    const nextTrackButton = audioPlayer.querySelector('.next-track')
    const previousTrackButton = audioPlayer.querySelector('.previous-track')
    const playlistList = audioPlayer.querySelector('.playlist-list')
    const playlistItems = playlistList.querySelectorAll('.playlist-item')
    const deleteTrackButtons = playlistList.querySelectorAll('.delete-track')

    
    const audio = new Audio('music.mp3')
    audio.preload = 'auto'
    let currentObjectUrl = null
    const tracks = [{ name: 'music.mp3', url: 'music.mp3' }]
    let currentTrackIndex = 0

    function loadTrackAt(index) {
        if (index < 0 || index >= tracks.length) return

        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl)
        }

        currentObjectUrl = null

        const track = tracks[index]
        if (!track) return
        
        if (track.file) {
            currentObjectUrl = URL.createObjectURL(track.file)
            audio.src = currentObjectUrl
        } else {
            currentObjectUrl = null
            audio.src = track.url
        }
        currentTrackIndex = index
        progressBarContainer.value = 0


        
        return audio.play().then(() => {
            updateNowPlaying(index)
            playPauseButton.innerHTML = '&#9646;&#9646;'
        }).catch(error => {
            console.error('Error playing audio:', error)
            playPauseButton.innerHTML = '&#9654;'
            throw error
        })
    }

    function updateNowPlaying(index) {
        const rows = playlistList.querySelectorAll('.playlist-item')
        if (!rows[index]) return
        rows.forEach(row => {
            row.classList.remove('is-playing')
        })
        rows[index].classList.add('is-playing')
    }
    
    playPauseButton.addEventListener('click', async () => {
        if (tracks.length === 0) return
        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }
        
        if (audio.paused) {
            console.log('playing', audioContext.state)
            audio.play()
            playPauseButton.innerHTML = '&#9646;&#9646;'
        } else {
            audio.pause()
            playPauseButton.innerHTML = '&#9654;'
        }
    })

    if (!audioContext) {
        audioContext = new AudioContext()
    }
    const source = audioContext.createMediaElementSource(audio)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 32
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    source.connect(analyser)
    analyser.connect(audioContext.destination)
    isReady = true

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.value = audio.currentTime / audio.duration
        }
    })

    stopButton.addEventListener('click', () => {	
        audio.pause()
        audio.currentTime = 0
        progressBar.value = 0
        playPauseButton.innerHTML = '&#9654;'
    })

    progressBar.addEventListener('input', () => {
        const inputValue = parseFloat(progressBar.value)
        if (audio.duration) {
            audio.currentTime = inputValue * audio.duration
        }
    })

    trackUpload.addEventListener('change', async (event) => {
        if (!event.target || !event.target.files || event.target.files.length === 0) return

        const file = event.target.files[0]

        if (!file) return

        tracks.push({ name: file.name, file })
        
        const newTrack = document.createElement('li')
        newTrack.textContent = file.name
        newTrack.classList.add('playlist-item')
        newTrack.innerHTML += `<button class="delete-track">x</button>`
        playlistList.appendChild(newTrack)

        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }

        loadTrackAt(tracks.length - 1)
        .catch(error => {
            tracks.pop()
            newTrack.remove()
            console.error('Error loading track:', error)
            throw error
        })
    })

    nextTrackButton.addEventListener('click', () => {
        let nextIndex = currentTrackIndex
        nextIndex++
        nextIndex  = Math.min(nextIndex, tracks.length - 1)
        if (nextIndex === currentTrackIndex) return
        loadTrackAt(nextIndex)
    })

    previousTrackButton.addEventListener('click', () => {
        let nextIndex = currentTrackIndex
        nextIndex--
        nextIndex  = Math.max(nextIndex, 0)
        if (nextIndex === currentTrackIndex) return
        loadTrackAt(nextIndex)
    })
    
    playlistList.addEventListener('click', (async (event) => {       
        const playlistItem = event.target.closest('.playlist-item')
        const playlistItems = playlistList.querySelectorAll('.playlist-item')
        const clickedIndex = Array.from(playlistItems).indexOf(playlistItem)
        const deleteButton = event.target.closest('.delete-track')

        if (deleteButton) {
            const trackToDelete = event.target.closest('.playlist-item')
            if (!trackToDelete) return
            const deletedIndex = Array.from(playlistItems).indexOf(trackToDelete)
            if (deletedIndex === -1) return

            tracks.splice(deletedIndex, 1)
            trackToDelete.remove()
            if (tracks.length === 0) {
                audio.pause()
                audio.currentTime = 0
                progressBar.value = 0
                playPauseButton.innerHTML = '&#9654;'
                const playlistItems = playlistList.querySelectorAll('.playlist-item')
                playlistItems.forEach(item => {
                    item.classList.remove('is-playing')
                })
                currentTrackIndex = -1
                return
            }
            if (deletedIndex === currentTrackIndex) {
                audio.pause()
                audio.currentTime = 0
                progressBar.value = 0
                playPauseButton.innerHTML = '&#9654;'
                const playlistItems = playlistList.querySelectorAll('.playlist-item')
                playlistItems.forEach(item => {
                    item.classList.remove('is-playing')
                })
                currentTrackIndex = Math.min(deletedIndex, tracks.length - 1)
                loadTrackAt(currentTrackIndex)
                audio.pause()
                playPauseButton.innerHTML = '&#9654;'
            } else {
                if (deletedIndex < currentTrackIndex) {
                    currentTrackIndex--
                }                
            }
            return
        }
        if (!playlistItem || !playlistList.contains(playlistItem)) return

        if (clickedIndex === -1) return
        if (clickedIndex === currentTrackIndex) return
        if (audioContext.state === 'suspended') await audioContext.resume()
        loadTrackAt(clickedIndex).catch(error => {
            console.error('Error loading track:', error)
            throw error
        })
    }))
}

/**
 * function getCurrentAudioLevel()
 * called from tick()
 * returns a number between 0 and 1
 */

export function getCurrentAudioLevel() {
    if (!isReady || !analyser || !dataArray) return 0;

    analyser.getByteFrequencyData(dataArray)
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
    }
    const avg = sum / dataArray.length
    const level = avg / 255
    const smoothing = 0.04
    smoothedLevel = smoothedLevel + (level - smoothedLevel) * smoothing
    return smoothedLevel
}

export function getFrequencyBands() {
    if (!isReady || !analyser || !dataArray) return { bass: 0, mid: 0, high: 0 }
    analyser.getByteFrequencyData(dataArray)

    const n = dataArray.length
    const third = Math.floor(n/3)
    const twoThirds = Math.floor(2*n/3)

    const bassSlice = dataArray.slice(0, third)
    const midSlice = dataArray.slice(third, twoThirds)
    const highSlice = dataArray.slice(twoThirds, n)

    const bass = bassSlice.reduce((acc, curr) => acc + curr, 0) / bassSlice.length
    const mid = midSlice.reduce((acc, curr) => acc + curr, 0) / midSlice.length
    const high = highSlice.reduce((acc, curr) => acc + curr, 0) / highSlice.length

    const bassLevel = bass / 255
    const midLevel = mid / 255
    const highLevel = high / 255
    return { bassLevel, midLevel, highLevel }
}