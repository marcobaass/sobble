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
    const progressBar = audioPlayer.querySelector('.progress-bar')

    const audio = new Audio('music.mp3')
    audio.preload = 'auto'

    playPauseButton.addEventListener('click', async () => {
        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }
        
        if (audio.paused) {
            console.log('playing', audioContext.state)
            audio.play()
            playPauseButton.textContent = 'Pause'
        } else {
            audio.pause()
            playPauseButton.textContent = 'Play'
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

    progressBar.addEventListener('input', () => {
        const inputValue = parseFloat(progressBar.value)
        if (audio.duration) {
            audio.currentTime = inputValue * audio.duration
        }
    })
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