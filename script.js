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

// TODO: Add ability to turn on individual steps, ie change its state from false to true and adding color to step.
// TODO: Add ability to turn off individual steps, ie change its state from true to false.
// TODO: Add ability to cycle througn a few velocity values for each step, changing its color/opacity.
// TODO: Divide by 2 and 3 should affect pattern object as well as DOM.

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

  // Append 32 divs to first row-container
  for (let i = 1; i <= 16; i++) {
    $(".row-container:eq(0)").append("<div class='step-no'>" + i + "</div>");
  }

  // Append 32 divs to second row-container
  // for (let i = 1; i <= 16; i++) {
  //   $(".row-container:eq(1)").append("<div class='step-16n'></div>");
  // }

  class Pattern {
    constructor(name) {
      this.name = name;
      this.steps = [];
      this.subpatterns = [];
    }
  }

  class Subpattern extends Pattern {
    constructor(name, parentStep) {
      super(name);
      this.parentStep = parentStep; // Maybe call this offset instead. Tying it to a parent step may cause problems, as the parent step may be deleted or changed
    }
  }

  // Create new pattern
  let myPattern = new Pattern("01-00");

  // Step class
  class Step {
    constructor(note, pitch, velocity) {
      this.note = note;
      this.pitch = pitch;
      this.velocity = velocity;
      this.state = false;
    }

    pushStep() {
      myPattern.steps.push(this);
    }

    appendDiv(rowIdx) {
      $(".row-container:eq(" + rowIdx + ")").append(
        `<div class="step-${this.note}"></div>`
      );
      // If no of steps exceeds length of step-no's, scroll right
      if (
        $(".row-container:eq(" + rowIdx + ") div").length >
        $(".row-container:eq(0) div").length
      ) {
        scrollRight(0);

        // If rowIdx is 1, append step-no divs to row-container 0
        if (rowIdx == 1) {
          $(".row-container:eq(0)").append(
            `<div class="step-no">${
              $(".row-container:eq(0) div").length + 1
            }</div>`
          );
        }
      }
    }
  }

  // // Plus and minus buttons
  $("#plus").click(function () {
    const step = new Step("16n", 60, 100);
    step.appendDiv(1);
    step.pushStep();
    //console.log(myPattern);
  });
  // $("#minus").click(function () {
  //   $(".step:last-of-type").remove();
  // });

  // Scroll arrows
  $(".scroll-row.right").click(function () {
    const myIndex = $(".scroll-row.right").index(this);
    scrollRight(0);
  });

  $(".scroll-row.left").click(function () {
    const myIndex = $(".scroll-row.left").index(this);
    scrollLeft(0);
  });

  function scrollRight(idx) {
    $(".row-frame:eq(" + idx + ")").animate({ scrollLeft: "+=1344px" }, 0);
  }

  function scrollLeft(idx) {
    $(".row-frame:eq(" + idx + ")").animate({ scrollLeft: "-=1344px" }, 0);
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
    const rowIdx = $(".row-container").index($(this).parent());
    const stepIdx = $(".row-container:eq(" + rowIdx + ") > div").index(this);

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
      // Console log myPattern.steps[stepIdx]
      const addendA = myPattern.steps[stepIdx].note;
      const addendB = myPattern.steps[stepIdx + 1].note;

      let rule = addRulesMatrix.find(
        (rule) => rule.addendA === addendA && rule.addendB === addendB
      );

      if (rule) {
        // Change note of clicked step to sum of addendA and addendB
        myPattern.steps[stepIdx].note = rule.sum;
        // Remove following step from myPattern.steps
        myPattern.steps.splice(stepIdx + 1, 1);
        // Update DOM to reflect changes
        $(this).removeClass("step-" + addendA);
        $(this).addClass("step-" + rule.sum);
        $(this).next().remove();
        console.log(myPattern);
      } else {
        console.log("Illegal combination!");
      }
    }
  });

  // End of document.ready()
});

// Note values, if 64n = 12
// 64n = 12
// 64t = 4
// 32n. = 36
// 32n = 24
// 32t = 8
// 16n. = 72
// 16n = 48
// 16t = 16
// 8n. = 144
// 8n = 96
// 8t = 32
// 4n. = 288
// 4n = 192
// 4t = 64
// 2n. = 576
// 2n = 384
// 2t = 128
// 1n. = 1152
// 1n = 768
// 1t = 256
