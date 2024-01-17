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

  // // Plus and minus buttons
  // $("#plus").click(function () {
  //   $(".step-container").append("<div class='step'></div>");
  // });
  // $("#minus").click(function () {
  //   $(".step:last-of-type").remove();
  // });

  // Append 32 divs to first row-container
  for (let i = 1; i <= 16; i++) {
    $(".row-container:eq(0)").append("<div class='step-no'>" + i + "</div>");
  }

  // Append 32 divs to second row-container
  for (let i = 1; i <= 16; i++) {
    $(".row-container:eq(1)").append("<div class='step-16n'></div>");
  }

  // Matrix of legal note combinations
  const addRulesMatrix = [
    { addendA: "2n", addendB: "2n", sum: "1n" },
    { addendA: "2n", addendB: "4n", sum: "2n-dot" },
    { addendA: "4n", addendB: "2n", sum: "2n-dot" },
    { addendA: "2n-dot", addendB: "4n", sum: "1n" },
    { addendA: "4n", addendB: "2n-dot", sum: "1n" },

    { addendA: "4n", addendB: "4n", sum: "2n" },
    { addendA: "4n", addendB: "8n", sum: "4n-dot" },
    { addendA: "8n", addendB: "4n", sum: "4n-dot" },
    { addendA: "4n-dot", addendB: "8n", sum: "2n" },
    { addendA: "8n", addendB: "4n-dot", sum: "2n" },

    { addendA: "8n", addendB: "8n", sum: "4n" },
    { addendA: "8n", addendB: "16n", sum: "8n-dot" },
    { addendA: "16n", addendB: "8n", sum: "8n-dot" },
    { addendA: "8n-dot", addendB: "16n", sum: "4n" },
    { addendA: "16n", addendB: "8n-dot", sum: "4n" },

    { addendA: "16n", addendB: "16n", sum: "8n" },
    { addendA: "16n", addendB: "32n", sum: "16n-dot" },
    { addendA: "32n", addendB: "16n", sum: "16n-dot" },
    { addendA: "16n-dot", addendB: "32n", sum: "8n" },
    { addendA: "32n", addendB: "16n-dot", sum: "8n" },

    { addendA: "32n", addendB: "32n", sum: "16n" },
    { addendA: "32n", addendB: "64n", sum: "32n-dot" },
    { addendA: "64n", addendB: "32n", sum: "32n-dot" },
    { addendA: "32n-dot", addendB: "64n", sum: "16n" },
    { addendA: "64n", addendB: "32n-dot", sum: "16n" },
    { addendA: "64n", addendB: "64n", sum: "32n" },

    { addendA: "1t", addendB: "1t", sum: "1t2" },
    { addendA: "1t2", addendB: "1t", sum: "1n" },
    { addendA: "1t", addendB: "1t2", sum: "1n" },
    { addendA: "2t", addendB: "2t", sum: "1t" },
    { addendA: "2t", addendB: "1t", sum: "2n" },
    { addendA: "1t", addendB: "2t", sum: "2n" },
    { addendA: "4t", addendB: "4t", sum: "2t" },
    { addendA: "4t", addendB: "2t", sum: "4n" },
    { addendA: "2t", addendB: "4t", sum: "4n" },
    { addendA: "8t", addendB: "8t", sum: "4t" },
    { addendA: "8t", addendB: "4t", sum: "8n" },
    { addendA: "4t", addendB: "8t", sum: "8n" },
    { addendA: "16t", addendB: "16t", sum: "8t" },
    { addendA: "16t", addendB: "8t", sum: "16n" },
    { addendA: "8t", addendB: "16t", sum: "16n" },
  ];

  let extendDivide = "extend";
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
      for (var i = 0; i < steps.length - 1; i++) {
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
      const steps = ["step-16n", "step-8n", "step-4n", "step-2n", "step-1n"];
      const dotSteps = [
        "step-32n-dot",
        "step-16n-dot",
        "step-8n-dot",
        "step-4n-dot",
        "step-2n-dot",
      ];
      for (let i = 0; i < steps.length; i++) {
        if ($(this).hasClass(steps[i])) {
          let newStep = steps[i].replace(/n$/, "t");
          $(this).removeClass(steps[i]);
          $(this).addClass(newStep);
          let divs = "";
          for (let j = 0; j < 2; j++) {
            divs += "<div class='" + newStep + "'></div>";
          }
          $(this).after(divs);
          break;
        } else if ($(this).hasClass(dotSteps[i])) {
          let newStep = dotSteps[i].replace(/^step-/, "").replace(/n-dot$/, "");
          newStep = parseInt(newStep * 2);
          newStep = "step-" + newStep + "n";
          console.log(newStep);
          $(this).removeClass(dotSteps[i]);
          $(this).addClass(newStep);
          let divs = "";
          for (let j = 0; j < 2; j++) {
            divs += "<div class='" + newStep + "'></div>";
          }
          $(this).after(divs);
          break;
        }
      }
    }

    if (extendDivide == "extend") {
      // Get class of clicked div and remove "step-" from class name
      let clickedDivClass = $(this).attr("class");
      clickedDivClass = clickedDivClass.replace("step-", "");
      // Get class of next div and remove "step-" from class name
      let nextDivClass = $(this).next().attr("class");
      nextDivClass = nextDivClass.replace("step-", "");

      let rule = addRulesMatrix.find(
        (rule) =>
          rule.addendA === clickedDivClass && rule.addendB === nextDivClass
      );

      if (rule) {
        $(this).removeClass("step-" + clickedDivClass);
        $(this).addClass("step-" + rule.sum);
        $(this).next().remove();
      } else {
        console.log("Illegal combination!");
      }
    }
  });

  // End of document.ready()
});
