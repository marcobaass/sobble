[x] player
[x] Improve the audio reactivity /  respond differently to bass vs highs
[ ] Add user track uploads
[ ] styling player
[ ] Visual polish / composition / tweak material (bloom, stronger IBL, maybe a second small light)

Minimal player with a single built‑in track

Add an <audio> element and play/pause button.
Wire Web Audio AnalyserNode to it.
Confirm wobble reacts to that.
Add upload

File input for user songs.
When user selects a file, create a blob URL and set audio.src to it.
Keep analysing the same element.
Add playlist

Maintain an array of tracks and a “current index”.
Next/previous buttons just move the index and set audio.src accordingly.
Optional: clickable list in the UI.