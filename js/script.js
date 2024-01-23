// Import modules and variables
import Project from "./Project.js";
import Instrument from "./Instrument.js";
import Section from "./Section.js";
import Group from "./Group.js";

// Global variables
let tempo = 120;
let top = 4;
let bottom = 4;
let measureLength = (top / bottom) * 16; // Number of 16th notes in a measure
const defaultStepWidth = 84;
let measureWidth = defaultStepWidth * measureLength;

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

  // class Project {
  //   constructor(name) {
  //     this.name = name;
  //     this.instruments = [];
  //     this.displayProject();
  //     console.log(this);
  //   }

  //   displayProject() {
  //     projectElement = `<main class='project'><h1>${this.name}</h1><div><button id='add-instrument'><i class="fa-solid fa-plus"></i> Instrument</button></div><input type='text' id='instrument-name' name='instrument-name' placeholder='Instrument name' /></main>`;
  //     $("body").append(projectElement);
  //     projectElement = $(".project");
  //   }
  // }

  // class Instrument {
  //   constructor(name) {
  //     this.id = "ins" + idCounter++;
  //     this.name = name;
  //     this.output = "midi output goes here";
  //     this.sections = [];
  //     project.instruments.push(this);
  //     this.displayInstrument();
  //     console.log(project);
  //   }

  //   displayInstrument() {
  //     $(".project").append(
  //       `<section class="instrument" id='${this.id}'><h2>${this.name}</h2><div><button class='add-section'><i class="fa-solid fa-plus"></i> Section</button></div><input type='text' class='section-name' name='section-name' placeholder='Section name' /></section>`
  //     );
  //   }
  // }

  // class Section {
  //   // constructor(name, instrumentIndex) {
  //   constructor(name, instrumentId) {
  //     this.id = "sec" + idCounter++;
  //     this.name = name;
  //     this.groups = [];
  //     //project.instruments[instrumentIndex].sections.push(this);
  //     // Find instrument object in project.instruments array by id
  //     const instrument = project.instruments.find(
  //       (instrument) => instrument.id === instrumentId
  //     );
  //     instrument.sections.push(this);
  //     // this.displayInstrument(instrumentIndex);
  //     this.displaySection(SectionId);
  //     console.log(project);
  //   }

  //   displaySection(instrumentId) {
  //     $("#" + instrumentId).append(
  //       `<section class="section" id='${this.id}'><h3>${this.name}</h3><div><button class='add-group'><i class="fa-solid fa-plus"></i> Group</button></div></section>`
  //     );
  //   }
  // }

  // class Group {
  //   constructor(sectionId) {
  //     this.id = "grp" + idCounter++;
  //     this.sequences = []; // As default, create a new NoteNoSequence, NoteSequence and ControllerSequence
  //     // project.instruments[instrumentIndex].sections[sectionIndex].groups.push(
  //     //   this
  //     // );
  //     // Find section object in project.instruments array by id
  //     const section = project.instruments
  //       .map((instrument) => instrument.sections)
  //       .flat()
  //       .find((section) => section.id === sectionId);
  //     section.groups.push(this);

  //     this.displayGroup(sectionId);
  //     console.log(project);
  //   }

  //   displayGroup(sectionId) {
  //     $("#" + sectionId).append(
  //       `<section class='group' id='${this.id}'><div class='scroll-container'></div><div><button class='scroll-row left'><i class='fa-solid fa-chevron-left'></i></button><button class='scroll-row right'><i class='fa-solid fa-chevron-right'></i></button></div></section>`
  //     );
  //   }
  // }

  // Create main class Sequence and extend it to NoteSequence, ControllerSequence, NoteNoSequence?
  // Create main class Step and extend it to NoteStep, ControllerStep, NoteNoStep?

  // New project button
  $("#new-project").click(() => {
    const name =
      $("#new-project-name").val() == ""
        ? "untitled project"
        : $("#new-project-name").val();
    // Create a new project
    new Project(name);
  });

  // Add instrument
  $(document).on("click", "#add-instrument", function () {
    const name =
      $("#instrument-name").val() == ""
        ? "instrument"
        : $("#instrument-name").val();
    new Instrument(name);
  });

  // Add section
  $(document).on("click", ".add-section", function () {
    // const instrumentIndex = $(".instrument").index(
    //   $(this).closest(".instrument")
    // );
    const instrumentId = $(this).closest(".instrument").attr("id");
    const name =
      $("#" + instrumentId + " .section-name").val() == ""
        ? "section"
        : $("#" + instrumentId + " .section-name").val();
    // new Section(name, instrumentIndex);
    new Section(name, instrumentId);
  });

  // Add group
  $(document).on("click", ".add-group", function () {
    const sectionId = $(this).closest(".section").attr("id");
    // const closestInstrument = $(this).closest(".instrument");
    // const instrumentIndex = $(".instrument").index(closestInstrument);
    // const sectionIndex = $(
    //   ".instrument:eq(" + instrumentIndex + ") .section"
    // ).index($(this).closest(".section"));
    // new Group(instrumentIndex, sectionIndex);
    new Group(sectionId);
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
