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
  let project = {};

  // Change scrollgroup width to accomodate measure length, will have to be done on a
  // scrollgroup-by-scrollgroup basis later
  //$(".scrollgroup").css("width", measureWidth);

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
  class Project {
    constructor(name) {
      this.name = name;
      this.instruments = [];
      this.displayProject();
      console.log(this);
    }

    displayProject() {
      $("body").append(
        `<main class='project'><h1>${this.name}</h1><div><button id='add-instrument'><i class="fa-solid fa-guitar"></i> Add instrument</button></div><input type='text' id='instrument-name' name='instrument-name' placeholder='Instrument name' /></main>`
      );
    }
  }

  class Instrument {
    constructor(name) {
      this.name = name;
      this.output = "midi output goes here";
      this.sections = [];
      project.instruments.push(this);
      this.displayInstrument();
      console.log(project);
    }

    displayInstrument() {
      $(".project").append(
        `<section class="instrument"><h2>${this.name}</h2><div><button class='add-section'><i class="fa-solid fa-puzzle-piece"></i> Add section</button></div><input type='text' class='section-name' name='section-name' placeholder='Section name' /></section>`
      );
    }
  }

  class Section {
    constructor(name, instrumentIndex) {
      this.name = name;
      this.groups = [];
      project.instruments[instrumentIndex].sections.push(this);
      this.displayInstrument(instrumentIndex);
      console.log(project);
    }

    displayInstrument(instrumentIndex) {
      $(".instrument:eq(" + instrumentIndex + ")").append(
        `<section class="section"><h3>${this.name}</h3><div><button class='add-group'><i class="fa-solid fa-plus"></i> Add group</button></div></section>`
      );
    }
  }

  class Group {
    constructor(instrumentIndex, sectionIndex) {
      this.stepNoIndicator = []; // new StepNoIndicator();
      this.patterns = []; // new Pattern();
      project.instruments[instrumentIndex].sections[sectionIndex].groups.push(
        this
      );
      this.displayGroup(instrumentIndex, sectionIndex);
      console.log(project);
    }

    displayGroup(instrumentIndex, sectionIndex) {
      $(
        ".instrument:eq(" +
          instrumentIndex +
          ") > .section:eq(" +
          sectionIndex +
          ")"
      ).append(`<section class='group'>This is a group</section>`);
    }
  }

  // New project button
  $("#new-project").click(() => {
    const name =
      $("#new-project-name").val() == ""
        ? "untitled project"
        : $("#new-project-name").val();
    // Create a new project
    project = new Project(name);
  });

  // Add instrument
  let instrumentCount = 1;
  $(document).on("click", "#add-instrument", function () {
    const name =
      $("#instrument-name").val() == ""
        ? "instrument " + instrumentCount
        : $("#instrument-name").val();
    new Instrument(name);
    instrumentCount++;
  });

  // Add section
  let sectionCount = 1;
  $(document).on("click", ".add-section", function () {
    const instrumentIndex = $(".instrument").index(
      $(this).closest(".instrument")
    );
    //TODO make sure name is picked from correct input field
    const name =
      $(".section-name").val() == ""
        ? "section " + instrumentCount
        : $(".section-name").val();
    new Section(name, instrumentIndex);
    sectionCount++;
  });

  // Add group
  $(document).on("click", ".add-group", function () {
    const closestInstrument = $(this).closest(".instrument");
    const instrumentIndex = $(".instrument").index(closestInstrument);
    const sectionIndex = $(
      ".instrument:eq(" + instrumentIndex + ") .section"
    ).index($(this).closest(".section"));
    console.log("sectionIndex", sectionIndex);
    new Group(instrumentIndex, sectionIndex);
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
