// Import modules and variables
import Project from "./Project.js";
import Instrument from "./Instrument.js";
import Section from "./Section.js";
import Group from "./Group.js";
import StepSeq from "./StepSeq.js";
import NoteStep from "./NoteStep.js";
import {
  getProject,
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

  // Maybe make getNoteName() and getPixelValue() a method of Step or some
  // kind of globally accessible function. This would mean that each step would
  // only have to have a noteName - the pixelValue would be calculated as needed.
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

  // Add section
  $(document).on("click", ".add-section", function () {
    const name =
      $("#section-name").val() == "" ? "section" : $("#section-name").val();
    new Section(name);
    $("#section-name").val("");
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

  // Extend group with (x) step(s)
  $(document).on("click", ".add-step", function () {
    const groupId = $(this).closest(".group").attr("id");
    // How many steps are there in this group?
    const stepCount = $("#" + groupId + " .step-no-seq > .step").length;
    // Find group object in project
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    // Call method to extend group by one step
    group.extendGroup(16, stepCount);
    // If number of steps is greater than number of 16th notes in a measure, scroll right
    // sequences[0] is always the StepNoSeq
    if (group.sequences[0].steps.length > measureLength) {
      const group = $("#" + groupId + " .scroll-container");
      scrollRight(group);
    }
  });

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
  $(document).on("click", ".step-seq .step", function () {
    // // Get index of clicked step, relative to its siblings
    // const stepIndex = $(this).index();
    // // Global index of clicked step, relative to all steps
    // const globalStepIndex = $(".step").index(this);
    // // Get data attribute of parent of clicked step, ie the pattern name or controller track name
    // const parentName = $(this).parent().attr("data");
    // // Find corresponding pattern or controller track object
    // const stepContainer = scrollgroup.patterns.find((pattern) => {
    //   return pattern.name == parentName;
    // });

    //const step = stepContainer.steps[stepIndex];
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
      // Toggle step state
      step.toggleState();
    }

    // Split by 2
    if (editMode == "split-2") {
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
      step.joinStep(stepContainer, stepIndex);
    }
  });

  $(document).on("click", "#log-project", function () {
    console.log(getProject());
  });

  // End document.ready
});
