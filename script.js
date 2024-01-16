// Webmidi.js will be used to send midi data to DAW.
// Time-keeping will be handled by a series of self-calling, self-adjusting setTimeout() functions.
// Tone.js will not be used for time-keeping, only for audio synthesis, and possibly for converting note
// durations to seconds a la Tone.Time("4n").toSeconds()

// PHP or equivalent may be used in future to save patterns to database or local file,
// but for now patterns will be saved to localStorage. JSONs will be used to store pattern data,
// and can be imported/exported as strings as needed.

// Patterns cannot be switched mid-pattern, only queued to start after current pattern ends.
// This holds true for fills as well. Differce is that fills will queue original pattern to start after
// fill ends, while patterns will repeat indefinitely.

// Alternatively, patterns will contain one or more subpatterns. A subpattern uses its parent step position
// as a jumping-off point, and will, if queued, play for its duration, then return to parent pattern at
// parent step + subpattern duration. This will allow for more complex patterns to be created,
// and will allow for fills or alternate patterns to be queued mid-pattern.

$(document).ready(function () {
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

  // Plus and minus buttons
  $("#plus").click(function () {
    $(".step-container").append("<div class='step'></div>");
  });
  $("#minus").click(function () {
    $(".step:last-of-type").remove();
  });

  let extendDivide = "divide";
  $("input[name='divide-or-extend']").click(function () {
    extendDivide = $(this).val();
  });

  $(document).on("click", ".row-container > div", function () {
    if (extendDivide == "divide") {
      var steps = [
        "step-1n",
        "step-2n",
        "step-4n",
        "step-8n",
        "step-16n",
        "step-32n",
        "step-64n",
      ];
      for (var i = 0; i < steps.length; i++) {
        if ($(this).hasClass(steps[i])) {
          var newStep = steps[i + 1];
          $(this).removeClass(steps[i]);
          $(this).addClass(newStep);
          $(this).after("<div class='" + newStep + "'></div>");
          break;
        }
      }
    }

    if (extendDivide == "divide-tri") {
      var steps = ["step-16n", "step-8n", "step-4n", "step-2n", "step-1n"];
      for (var i = 0; i < steps.length; i++) {
        if ($(this).hasClass(steps[i])) {
          var newStep = steps[i].replace(/n$/, "t");
          $(this).removeClass(steps[i]);
          $(this).addClass(newStep);
          var cells = "";
          for (var j = 0; j < 2; j++) {
            cells += "<div class='" + newStep + "'></div>";
          }
          $(this).after(cells);
          break;
        }
      }
    }

    if (extendDivide == "extend") {
      if ($(this).hasClass("step-64n")) {
        $(this).removeClass("step-64n");
        $(this).addClass("step-32n");
        $(this).next().remove();
      } else if ($(this).hasClass("step-32n")) {
        $(this).removeClass("step-32n");
        $(this).addClass("step-16n");
        $(this).next().remove();
      } else if ($(this).hasClass("step-16n")) {
        $(this).removeClass("step-16n");
        $(this).addClass("step-8n");
        $(this).next().remove();
      } else if ($(this).hasClass("step-8n")) {
        $(this).removeClass("step-8n");
        $(this).addClass("step-4n");
        $(this).next().remove();
        $(this).next().remove();
      } else if ($(this).hasClass("step-4n")) {
        $(this).removeClass("step-4n");
        $(this).addClass("step-2n");
        for (let i = 0; i < 4; i++) {
          $(this).next().remove();
        }
      } else if ($(this).hasClass("step-2n")) {
        $(this).removeClass("step-2n");
        $(this).addClass("step-1n");
        for (let i = 0; i < 8; i++) {
          $(this).next().remove();
        }
      }
    }

    if (extendDivide == "extend-tri") {
      if ($(this).hasClass("step-16t")) {
        $(this).removeClass("step-16t");
        $(this).addClass("step-16n");
        $(this).next().remove();
        $(this).next().remove();
      } else if ($(this).hasClass("step-8t")) {
        $(this).removeClass("step-8t");
        $(this).addClass("step-8n");
        for (let i = 0; i < 2; i++) {
          $(this).next().remove();
        }
      } else if ($(this).hasClass("step-4t")) {
        $(this).removeClass("step-4t");
        $(this).addClass("step-4n");
        for (let i = 0; i < 2; i++) {
          $(this).next().remove();
        }
      } else if ($(this).hasClass("step-2t")) {
        $(this).removeClass("step-2t");
        $(this).addClass("step-2n");
        for (let i = 0; i < 2; i++) {
          $(this).next().remove();
        }
      } else if ($(this).hasClass("step-1t")) {
        $(this).removeClass("step-1t");
        $(this).addClass("step-1n");
        for (let i = 0; i < 2; i++) {
          $(this).next().remove();
        }
      }
    }
  });

  // End of document.ready()
});
