// Import modules and variables
import Project from "./Project.js";
import Player from "./Player.js";
import Instrument from "./Instrument.js";
import Section from "./Section.js";
import Group from "./Group.js";
import StepSeq from "./StepSeq.js";

import {
  getProject,
  getSectionName,
  setSectionName,
  getLoopOn,
  setLoopOn,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

// Global variables
let top = 4;
let bottom = 4;
let measureLength = (top / bottom) * 16; // Number of 16th notes in a measure
const defaultStepWidth = 84;
let measureWidth = defaultStepWidth * measureLength;

$(document).ready(function () {
  // Initialize webmidi.js and tone.js on click
  const init = document.querySelector("#audio-init");
  init.addEventListener("click", async () => {
    // If init classList doesn't include blink, return
    if (!init.classList.contains("blink")) return;

    // Remove .blink class from init button
    init.classList.remove("blink");

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
      $("#section-name").val() == ""
        ? getSectionName()
        : $("#section-name").val();
    new Section(name);
    $("#section-name").val("");
    // Increment automatic section name by one character
    setSectionName(nextChar(getSectionName()));
  });

  function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
  }

  // Click section tab
  $(document).on("click", ".section-tab-button", function () {
    let sectionId = $(this).attr("id");
    sectionId = sectionId.slice(0, -12); // Remove "-tab-button" from id
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
    const newGroup = new Group(instrumentId, measureLength);
    newGroup.makeMaster();
  });

  // Change master group
  $(document).on("change", ".master-group-radio", function () {
    const groupId = $(this).val();
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    group.makeMaster();
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
    }
  );

  // Scrollgroup arrows
  $(document).on("click", ".scroll-group", function () {
    const groupId = $(this).closest(".group").attr("id");
    // Get group object
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    console.log("group", group);
    if ($(this).hasClass("right")) {
      group.scrollRight(measureWidth, true); // true = change currentDot
    }
    if ($(this).hasClass("left")) {
      group.scrollLeft(measureWidth, true); // true = change current Dot
    }
  });

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

  // Queue section button
  $(document).on("click", ".queue-section", function () {
    // Only if loop is playing
    if (!getLoopOn()) return;
    $(this).addClass("blink");
    let sectionId = $(this).closest(".section-tab").attr("id");
    sectionId = sectionId.slice(0, -4); // Remove "-tab" from id
    // Find section object in project
    const sections = findAllNestedProps(getProject(), "sections");
    const section = findNestedProp(sections, sectionId);
    console.log("section to queue", section);
    section.queue();
  });

  // Console log project object
  $(document).on("click", "#log-project", function () {
    console.log(getProject());
  });

  // Play button
  $(document).on("click", "#play", function () {
    // Stop playback if loop is on
    if (getLoopOn()) {
      setLoopOn(false);
      // Change stop button to play button
      $(this).html('<i class="fa-solid fa-play"></i>');
      // In the DOM, remove class "playing" from all .queue-section buttons
      $(".queue-section").removeClass("playing").addClass("hide");
      return;
    }
    // Initialize player
    const player = new Player();
    player.startPlayback();
  });
  // End document.ready
});
