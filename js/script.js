// Import modules and variables
import Project from "./Project.js";
import Instrument from "./Instrument.js";
import Section from "./Section.js";
import Group from "./Group.js";
import StepSeq from "./StepSeq.js";

import {
  getProject,
  getLoopOn,
  setLoopOn,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

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
    WebMidi.enable({ sysex: true })
      .then(onEnabled)
      .then(() => console.log("WebMidi with sysex enabled!"))
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

  // New project button
  $("#new-project").click(() => {
    const name =
      $("#new-project-name").val() == ""
        ? "untitled project"
        : $("#new-project-name").val();
    // Create a new project
    new Project(name);
  });

  // Add section
  $(document).on("click", ".add-section", function () {
    const name =
      $("#section-name").val() == "" ? "section" : $("#section-name").val();
    new Section(name);
    $("#section-name").val("");
  });

  // Click section tab
  $(document).on("click", ".section-tab", function () {
    let sectionId = $(this).attr("id");
    sectionId = sectionId.slice(0, -4); // Remove "-tab" from id
    // Find section object in project
    const sections = findAllNestedProps(getProject(), "sections");
    const section = findNestedProp(sections, sectionId);
    section.selectSection();
  });

  // Add instrument
  $(document).on("click", "#add-instrument", function () {
    const sectionId = $(this).closest(".section").attr("id");
    const name =
      $("#" + sectionId + " .instrument-name").val() == ""
        ? "instrument"
        : $("#" + sectionId + " .instrument-name").val();
    new Instrument(name, sectionId);
    $("#" + sectionId + " .instrument-name").val("");
  });

  // Add group
  $(document).on("click", ".add-group", function () {
    const instrumentId = $(this).closest(".instrument").attr("id");
    new Group(instrumentId, measureLength);
  });

  // Add step sequence to group
  $(document).on("click", ".add-step-seq", function () {
    const groupId = $(this).closest(".group").attr("id");
    const sequenceLength = $("#" + groupId + " .step-no-seq > .step").length;
    new StepSeq(groupId, sequenceLength);
  });

  // Delete last step sequence from group
  // Replace this with unique button for deleting each step sequence
  $(document).on("click", ".delete-step-seq", function () {
    const groupId = $(this).closest(".group").attr("id");
    // Find group object in project
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    // Find index of last seq
    const seqIndex = $("#" + groupId + " > div > div")
      .last()
      .index();
    group.deleteLastSeq(seqIndex);
  });

  // Extend group with (x) step(s)
  $(document).on(
    "click",
    ".add-step, .delete-step, .add-bar, .delete-bar",
    function () {
      // Get class of button
      const buttonClass = $(this).attr("class");
      const groupId = $(this).closest(".group").attr("id");
      // How many steps are there in this group?
      const stepCount = $("#" + groupId + " .step-no-seq > .step").length;
      // Find group object in project
      const groups = findAllNestedProps(getProject(), "groups");
      const group = findNestedProp(groups, groupId);

      // Call method to extend group by one step or bar
      if (buttonClass == "add-step") group.extendGroup(1, stepCount);
      if (buttonClass == "add-bar") group.extendGroup(measureLength, stepCount);
      if (buttonClass == "delete-step") group.shortenGroup(1, stepCount);
      if (buttonClass == "delete-bar")
        group.shortenGroup(measureLength, stepCount);

      // If number of steps is greater than number of 16th notes in a measure, scroll righ
      // nota bene: only have desired effect if group is scrolled all the way to the right
      // when expand button is clicked
      if (group.sequences[0].steps.length > measureLength) {
        const group = $("#" + groupId + " .scroll-container");
        scrollRight(group);
      }
    }
  );

  // Scrollgroup arrows
  $(document).on("click", ".scroll-group", function () {
    const groupId = $(this).closest(".group").attr("id");
    const group = $("#" + groupId + " .scroll-container");
    if ($(this).hasClass("right")) scrollRight(group);
    if ($(this).hasClass("left")) scrollLeft(group);
  });

  function scrollRight(group) {
    $(group).animate({ scrollLeft: `+=${measureWidth}px` }, 0);
  }

  function scrollLeft(group) {
    $(group).animate({ scrollLeft: `-=${measureWidth}px` }, 0);
  }

  // Edit
  let editMode = "pencil";
  $("input[name='edit-mode']").click(function () {
    editMode = $(this).val();
  });

  // Click noteStep or controllerStep (not stepNo)
  // Not if noteStepBtnHover is true
  $(document).on("click", ".step-seq .step", function () {
    if (noteStepBtnHover) return;

    const stepId = $(this).attr("id");
    // Get class of parent to $(this)
    const parentSeqType = $(this).parent().attr("class");

    // Both StepNos and NoteSteps are nested in StepSeqs
    // To find the correct step object, we need to determine the type of the parent
    let steps;
    if (parentSeqType == "note-seq") {
      steps = findAllNestedProps(getProject(), "noteSteps");
    }
    if (parentSeqType == "controller-seq") {
      steps = findAllNestedProps(getProject(), "controllerSteps");
    }
    const step = findNestedProp(steps, stepId);

    // Pencil
    if (editMode == "pencil") {
      if (parentSeqType == "note-seq") {
        // Check if step is on/off
        if (step.state == "off") {
          // Play note
          step.displayActiveNoteStep();
        } else {
          step.removeActiveNoteStep();
        }
      }
      // Toggle step state
      step.toggleState();
    }

    // Split
    if (editMode > 0 && editMode < 5) {
      split(editMode, parentSeqType);
    }

    function split(editMode, parentSeqType) {
      if (parentSeqType == "note-seq") {
        step.splitNoteStep(editMode);
      }
      if (parentSeqType == "controller-seq") {
        step.splitControllerStep(editMode);
      }
    }

    // Join step
    if (editMode == "join") {
      // Get index of clicked step, relative to its siblings
      const stepIndex = $(this).index();
      const stepSeqId = $(this).parent().parent().attr("id");
      join(stepIndex, stepSeqId);
    }

    function join(stepIndex, stepSeqId) {
      if (parentSeqType == "note-seq") {
        step.joinNoteStep(stepIndex, stepSeqId);
      }
      if (parentSeqType == "controller-seq") {
        step.joinControllerStep(stepIndex, stepSeqId);
      }
    }
  });

  // Change noteStepBtnHover state on mouseover
  let noteStepBtnHover = false;
  $(document).on("mouseover", ".note-step-btn", function () {
    noteStepBtnHover = true;
  });
  $(document).on("mouseout", ".note-step-btn", function () {
    noteStepBtnHover = false;
  });

  // Note step buttons
  $(document).on("click", ".note-step-btn", function () {
    const noteStepId = $(this).closest(".step").attr("id");
    // Find noteStep object in project
    const noteSteps = findAllNestedProps(getProject(), "noteSteps");
    const noteStep = findNestedProp(noteSteps, noteStepId);

    // Velocity
    if ($(this).hasClass("velocity-btn")) {
      noteStep.changeVelocity();
    }

    // Pitch up
    if ($(this).hasClass("pitch-up")) {
      noteStep.pitchUp();
    }

    // Pitch down
    if ($(this).hasClass("pitch-down")) {
      noteStep.pitchDown();
    }
  });

  // Toggle CC visibility button
  $(document).on("click", ".toggle-cc", function () {
    const groupId = $(this).closest(".group").attr("id");
    const controllerSeqs = $("#" + groupId + " .controller-seq");
    // Find group object in project
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);

    group.toggleCcVisibility();
  });

  // Console log project object
  $(document).on("click", "#log-project", function () {
    console.log(getProject());
  });

  let storedId; // Tone.Transport.scheduleRepeat id

  // Play button
  $(document).on("click", "#play", function () {
    if (getLoopOn()) {
      //clearInterval(loopOn);
      setLoopOn(false);
      Tone.Transport.stop();
      Tone.Transport.clear(storedId);
      // In the DOM, remove class "to-flash" from all stepNos
      $(".step-no-seq .step").removeClass("to-flash");
      return;
    } else {
      Tone.Transport.bpm.value = 120;
      Tone.Transport.seconds = 0;

      // In the DOM, add class "to-flash" first steps in  "step-no-seq"
      $(".step-no-seq").each(function () {
        $(this).children().first().addClass("to-flash");
      });

      const stepNoSeqs = getProject().getStepNoSeqs();

      // Tone loop
      let id = Tone.Transport.scheduleRepeat(
        (time) => {
          Tone.Draw.schedule(function () {
            stepNoSeqs.forEach((stepNoSeq) => {
              stepNoSeq.flashStepNo(time); // 0 is the index of the stepNo to flash
            });
            //do drawing or DOM manipulation here
            // $("#flasher").animate({ opacity: 1 }, 0, () => {
            //   $("#flasher").animate(
            //     { opacity: 0 },
            //     Tone.Time("32n").toSeconds()
            //   );
            // });
          }, time);
        },
        "16n",
        "+" + "0.005"
      );
      storedId = id;
      Tone.Transport.start();
      setLoopOn(true);
    }

    const loopStartPromise = new Promise((resolve) => {
      Tone.Transport.on("start", () => {
        let loopStart = performance.now() + 50;
        resolve(loopStart);
      });
    });

    loopStartPromise.then((updatedLoopStart) => {
      console.log(updatedLoopStart);

      // Find section object with selected property set to true
      const sections = getProject().sections;
      const section = sections.find((section) => section.selected == true);
      // In section, find all instruments
      const instruments = section.instruments;
      // In instrument, find all groups
      instruments.forEach((instrument) => {
        const groups = instrument.groups;
        // In group, find all sequences
        groups.forEach((group) => {
          // Find all stepSeqs in group
          const sequences = group.sequences;
          // Find all stepSeqs in sequences
          const stepSeqs = sequences.filter(
            (sequence) => sequence.constructor.name === "StepSeq"
          );
          stepSeqs.forEach((stepSeq) => {
            // If stepSeq has any noteSteps with state == "on", play noteSeq
            if (stepSeq.noteSteps.some((noteStep) => noteStep.state == "on")) {
              stepSeq.playNoteSeq(updatedLoopStart, group);
            }
          });
        });
      });
    });
  });

  // End document.ready
});
