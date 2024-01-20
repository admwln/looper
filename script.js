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
// TODO: Step number can be clicked to highlight group of steps, which can then be manipulated

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

  // Global variables
  let tempo = 120;
  let top = 4;
  let bottom = 4;
  let measureLength = (top / bottom) * 16; // Number of 16th notes in a measure
  const defaultStepWidth = 84;
  let measureWidth = defaultStepWidth * measureLength;

  // Change scrollgroup width to accomodate measure length, will have to be done on a
  // scrollgroup-by-scrollgroup basis later
  $(".scrollgroup").css("width", measureWidth);

  let noteMap = new Map([
    [21, "64n"],
    [63, "32n."],
    [42, "32n"],
    [126, "16n."],
    [84, "16n"],
    [28, "16t"],
    [252, "8n."],
    [168, "8n"],
    [56, "8t"],
    [504, "4n."],
    [336, "4n"],
    [112, "4t"],
    [1008, "2n."],
    [672, "2n"],
    [224, "2t"],
    [1344, "1n"],
    [448, "1t"],
  ]);

  function getNoteName(pixelValue) {
    return noteMap.get(pixelValue);
  }

  // Class definitions

  class stepNoIndicator {
    constructor() {
      this.stepNos = [];
    }
    initStepNoIndicator() {
      for (let i = 1; i <= measureLength; i++) {
        this.stepNos.push(i);
        $(".step-no-indicator:eq(0)").append(
          "<div class='step-no'>" + i + "</div>"
        );
      }
    }

    addStepNo() {
      this.stepNos.push($(".step-no-indicator:eq(0) > div").length + 1);
      $(".step-no-indicator:eq(0)").append(
        "<div class='step-no'>" +
          ($(".step-no-indicator:eq(0) > div").length + 1) +
          "</div>"
      );
      console.log(scrollgroup);
    }
  }

  class Scrollgroup {
    constructor() {
      this.stepNoIndicator = new stepNoIndicator();
      this.patterns = [];
    }
  }

  class Pattern {
    constructor(name) {
      this.name = name;
      this.steps = [];
      //this.subpatterns = [];
    }
    pushPattern(scrollgroup) {
      scrollgroup.patterns.push(this);
    }

    initSteps() {
      for (let i = 1; i <= measureLength; i++) {
        const step = new Step("16n", 84, 60, 100, "off");
        step.pushStep(this);
        step.drawNewStep();
      }
    }
  }

  class Step {
    constructor(noteName, pixelValue, pitch, velocity, state) {
      // eg. "16n", 84, 60, 100, "on"
      this.noteName = noteName;
      this.pixelValue = pixelValue;
      this.pitch = pitch;
      this.velocity = velocity;
      this.state = state;
    }

    pushStep(pattern) {
      pattern.steps.push(this);
    }

    drawNewStep() {
      $(".pattern:eq(0)").append(
        `<div class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
      );
    }

    insertNewStep(stepIndex) {
      $(".pattern:eq(0) > div:eq(" + stepIndex + ")").after(
        `<div class="step ${this.state}" data="${this.noteName}" style="width:${this.pixelValue}px;"></div>`
      );
    }

    updateStep(stepIndex) {
      $(".step:eq(" + stepIndex + ")").css("width", this.pixelValue);
      $(".step:eq(" + stepIndex + ")").attr("data", this.noteName);
    }

    splitStep(stepIndex, splitBy) {
      // Calculate pixel value for new steps
      this.pixelValue = this.pixelValue / splitBy;
      // Get note name for new steps
      this.noteName = getNoteName(this.pixelValue);
      this.updateStep(stepIndex);
      console.log(this.state);

      // Create new step(s)
      for (let i = 1; i < splitBy; i++) {
        const newStep = new Step(
          this.noteName,
          this.pixelValue,
          this.pitch,
          this.velocity,
          this.state
        );
        // Insert new step into pattern.steps array
        pattern.steps.splice(stepIndex + 1, 0, newStep);
        // Insert new step into DOM
        newStep.insertNewStep(stepIndex);
      }
    }

    joinStep(stepIndex) {
      // Get pixel value of subsequent step
      const nextStepPixelValue = pattern.steps[stepIndex + 1].pixelValue;
      // Calculate pixel value for extended step
      this.pixelValue = this.pixelValue + nextStepPixelValue;
      // Get note name for extended step
      this.noteName = getNoteName(this.pixelValue);
      // Update step in DOM
      this.updateStep(stepIndex);
      // Remove subsequent step from pattern.steps array
      pattern.steps.splice(stepIndex + 1, 1);
      // Remove subsequent step from DOM
      $(".step:eq(" + (stepIndex + 1) + ")").remove();
    }
  }

  const scrollgroup = new Scrollgroup();
  scrollgroup.stepNoIndicator.initStepNoIndicator();
  const pattern = new Pattern("percussion");
  pattern.initSteps();
  pattern.pushPattern(scrollgroup);

  $("#plus").click(function () {
    const step = new Step("16n", 84, 60, 100, "off");
    step.pushStep(pattern);
    step.drawNewStep();
    scrollgroup.stepNoIndicator.addStepNo();
    // Scroll right if necessary
    // If number of steps is greater than number of 16th notes in a measure, scroll right
    if (scrollgroup.stepNoIndicator.stepNos.length > measureLength) {
      scrollRight(0);
    }
  });

  $("#minus").click(function () {
    console.log(scrollgroup);
  });

  let editMode = "pencil";
  $("input[name='edit-mode']").click(function () {
    editMode = $(this).val();
  });

  $(document).on("click", ".pattern:eq(0) > div", function () {
    // Get index of clicked step relative to its parent row-container
    const stepIndex = $(".pattern:eq(0) > div").index($(this));
    const step = pattern.steps[stepIndex];

    // Pencil
    if (editMode == "pencil") {
      // Toggle step state TODO: make into step method
      if (step.state == "off") {
        step.state = "on";
        $(this).removeClass("off").addClass("on");
      } else {
        step.state = "off";
        $(this).removeClass("on").addClass("off");
      }
    }

    // Split by 2
    if (editMode == "split") {
      step.splitStep(stepIndex, 2);
    }

    // Split by 3
    if (editMode == "split-3") {
      step.splitStep(stepIndex, 3);
    }

    // Split by 3
    if (editMode == "split-4") {
      step.splitStep(stepIndex, 4);
    }

    // Join step
    if (editMode == "join") {
      step.joinStep(stepIndex);
    }
  });

  // Scrollgroup arrows
  $(".scroll-row.right").click(function () {
    const myIndex = $(".scroll-row.right").index(this);
    scrollRight(0);
  });

  $(".scroll-row.left").click(function () {
    const myIndex = $(".scroll-row.left").index(this);
    scrollLeft(0);
  });

  function scrollRight(idx) {
    $(".scrollgroup:eq(" + idx + ")").animate(
      { scrollLeft: `+=${measureWidth}px` },
      0
    );
  }

  function scrollLeft(idx) {
    $(".scrollgroup:eq(" + idx + ")").animate(
      { scrollLeft: `-=${measureWidth}px` },
      0
    );
  }

  // End document.ready
});
