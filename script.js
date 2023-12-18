// Webmidi.js will be used to send midi data to DAW.
// Time-keeping will be handled by a series of self-calling, self-adjusting setTimeout() functions.
// Tone.js will not be used for time-keeping, only for audio synthesis, and possibly for converting note durations to seconds
// a la Tone.Time("4n").toSeconds()
// Patterns cannot be switched mid-pattern, only queued to start after current pattern ends.
// This holds true for fills as well. Differce is that fills will queue original pattern to start after fill ends,
// while patterns will repeat indefinitely.
// PHP may be used in future to save patterns to database or local file, but for now patterns will be saved to localStorage.

// Initialize webmidi.js and tone.js on click
const init = document.querySelector("#audio-init");
init.addEventListener("click", async () => {
  // Tone.js initialization
  await Tone.start();
  console.log("Tone.js enabled!");

  // Webmidi.js initialization
  // Enable WEBMIDI.js and trigger the onEnabled() function when ready
  WebMidi.enable()
    .then(onEnabled)
    .catch((err) => alert(err));

  // Function triggered when WEBMIDI.js is ready
  function onEnabled() {
    console.log("WebMidi.js enabled!");
    // Display available MIDI output devices
    if (WebMidi.outputs.length < 1) {
      console.log("No device detected.");
    }

    if (WebMidi.outputs.length > 0) {
      const outputs = WebMidi.outputs;
      console.log(outputs);
    }
  }
});
