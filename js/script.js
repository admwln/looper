// Import modules and variables
import HeadingEditor from "./HeadingEditor.js";
import Chord from "./Chord.js";
import Keyboard from "./Keyboard.js";
import Project from "./Project.js";
import Player from "./Player.js";

import {
  getProject,
  getLoopOn,
  setLoopOn,
  getCurrentChord,
  setCurrentChord,
  getKeyboard,
  setKeyboard,
  findGroupOnClick,
  findObjectById,
  findSelectedObject,
} from "./helper-functions.js";

// Global variables
let outputs;
let top = 4;
let bottom = 4;
let measureLength = (top / bottom) * 16; // Number of 16th notes in a measure
const defaultStepWidth = 84;
let measureWidth = defaultStepWidth * measureLength;

$(document).ready(function () {
  // Initialize webmidi.js and tone.js on click
  const init = document.querySelector("#audio-init");
  init.addEventListener("click", async () => {
    // Remove init button
    init.remove();

    // To save time, init new project and section
    $("#new-project").hide();
    // Create a new project
    new Project();
    // Create a new section
    getProject().newSection();

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
        outputs = WebMidi.outputs;
        console.log(outputs);
      }
    }
  });

  // New project button
  $("#new-project").click(() => {
    $("#new-project").hide();
    // Create a new project
    new Project();
    // Create a new section
    getProject().newSection();
  });

  // Edit heading button
  // Pertains to project, section and instrument headings
  $(document).on("click", ".edit-heading", function () {
    const heading = $(this).prev();
    const headingEditor = new HeadingEditor(heading);
    headingEditor.edit();
  });

  // Add section
  $(document).on("click", ".add-section", function () {
    // Create a new section
    getProject().newSection();
  });

  // Click section tab
  $(document).on("click", ".section-tab:not(#add-section-tab)", function () {
    // Return if loop is playing
    if (getLoopOn()) return;
    let sectionId = $(this).attr("id").split("-")[0];
    const sections = getProject().sections;
    const section = findObjectById(sections, sectionId);
    section.selectSection();
  });

  // Add instrument
  $(document).on("click", ".add-instrument", function () {
    //const sectionId = $(this).closest(".section").attr("id");
    const sections = getProject().sections;
    let selectedSection = findSelectedObject(sections);
    const instrument = selectedSection.newInstrument();
    // Add group to instrument
    const group = instrument.newGroup();
    group.makeMaster();
  });

  // Mute instrument
  $(document).on("click", ".mute-instrument", function () {
    // Get instrumentId and instrument object
    const instrumentId = $(this).closest(".instrument").attr("id");
    const instruments = findSelectedObject(getProject().sections).instruments;
    const instrument = findObjectById(instruments, instrumentId);
    if ($(this).hasClass("muted")) {
      $(this).removeClass("muted");
      $("#" + instrumentId + " .group").css("opacity", "1");
      instrument.unmute();
      return;
    }
    $(this).addClass("muted");
    $("#" + instrumentId + " .group").css("opacity", "0.5");
    instrument.mute();
  });

  // Add group
  $(document).on("click", ".add-group", function () {
    const instrumentId = $(this).closest(".instrument").attr("id");
    // Find instruments in selected section
    const sections = getProject().sections;
    const section = findSelectedObject(sections);
    const instruments = section.instruments;
    const instrument = findObjectById(instruments, instrumentId);
    // Add group to instrument
    const group = instrument.newGroup();
    group.makeMaster();
  });

  // Change master group
  $(document).on("change", ".master-group-radio", function () {
    const group = findGroupOnClick(this);
    group.makeMaster();
  });

  // Add step sequence to group
  $(document).on("click", ".add-step-seq", function () {
    const group = findGroupOnClick(this);
    group.newStepSeq();
  });

  // Delete last step sequence from group
  // Replace this with unique button for deleting each step sequence
  $(document).on("click", ".delete-step-seq", function () {
    const groupId = $(this).closest(".group").attr("id");
    const group = findGroupOnClick(this);
    // Find index of last seq
    const seqIndex = $("#" + groupId + " > div > div.step-seq").length;
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

      const group = findGroupOnClick(this);

      // Call method to extend group by one step or bar
      if (buttonClass == "add-step") group.extendGroup(1, stepCount);
      if (buttonClass == "add-bar") group.extendGroup(measureLength, stepCount);
      if (buttonClass == "delete-step") group.shortenGroup(1, stepCount);
      if (buttonClass == "delete-bar")
        group.shortenGroup(measureLength, stepCount);
    }
  );

  // Scrollgroup arrows
  $(document).on("click", "button.scroll-group", function () {
    const group = findGroupOnClick(this);

    if ($(this).hasClass("right")) {
      // If currentDot already is at the end of the sequence, return
      if (group.dotIndicator.currentDot == group.dotIndicator.dotCount - 1)
        return;
      group.scrollRight(measureWidth, true); // true = change currentDot
    }

    if ($(this).hasClass("left")) {
      // If currentDot already is at the beginning of the sequence, return
      if (group.dotIndicator.currentDot == 0) return;
      group.scrollLeft(measureWidth, true); // true = change current Dot
    }
  });

  // Dot indicator dots
  $(document).on("click", ".dot", function () {
    const group = findGroupOnClick(this);
    // Get index of clicked dot, and of current dot
    const clickedDotIndex = $(this).index();
    const currentDotIndex = group.dotIndicator.currentDot;

    // If clicked dot already is the current dot, return
    if (clickedDotIndex == currentDotIndex) return;

    const scrollRight = clickedDotIndex > currentDotIndex;
    const diff = Math.abs(clickedDotIndex - currentDotIndex);

    // If clicked dot is to the right of the current dot, scroll right by factor of diff
    if (scrollRight) {
      for (let i = 0; i < diff; i++) {
        group.scrollRight(measureWidth, true);
      }
      return;
    }
    // If clicked dot is to the left of the current dot, scroll left by factor of diff
    for (let i = 0; i < diff; i++) {
      group.scrollLeft(measureWidth, true);
    }
  });

  // Mute group
  $(document).on("click", ".mute-group", function () {
    // Get groupId
    const groupId = $(this).closest(".group").attr("id");
    const group = findGroupOnClick(this);
    if ($(this).hasClass("muted")) {
      $(this).removeClass("muted");
      $("#" + groupId + " .scroll-container").css("opacity", "1");
      group.unmute();
      return;
    }
    $(this).addClass("muted");
    $("#" + groupId + " .scroll-container").css("opacity", "0.5");
    group.mute();
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

    // Both NoteSteps and ControllerSteps are nested in StepSeqs
    // To find the correct step object, we need to determine the type of the parent
    let steps = [];
    const group = findGroupOnClick(this);
    const sequences = group.sequences;
    if (parentSeqType == "note-seq") {
      // Push group's note steps to steps[]
      for (let i = 1; i < sequences.length; i++) {
        sequences[i].noteSteps.forEach((step) => {
          steps.push(step);
        });
      }
    }

    if (parentSeqType == "controller-seq") {
      // Push group's controller steps to steps[]
      for (let i = 1; i < sequences.length; i++) {
        sequences[i].controllerSteps.forEach((step) => {
          steps.push(step);
        });
      }
    }

    const step = findObjectById(steps, stepId);

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
      step.edit();
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
      join(stepIndex);
    }

    function join(stepIndex, stepSeqId) {
      if (parentSeqType == "note-seq") {
        step.joinNoteStep(stepIndex);
      }
      if (parentSeqType == "controller-seq") {
        step.joinControllerStep(stepIndex);
      }
    }

    // Select wand
    if (editMode == "select") {
      step.edit();
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

    let steps = [];
    const group = findGroupOnClick(this);
    const sequences = group.sequences;

    // Push group's note steps to steps[]
    for (let i = 1; i < sequences.length; i++) {
      sequences[i].noteSteps.forEach((step) => {
        steps.push(step);
      });
    }

    const noteStep = findObjectById(steps, noteStepId);

    // Velocity
    if ($(this).hasClass("velocity-up")) {
      noteStep.velocityUp();
      noteStep.edit();
    }

    if ($(this).hasClass("velocity-down")) {
      noteStep.velocityDown();
      noteStep.edit();
    }

    // Pitch up
    if ($(this).hasClass("pitch-no")) {
      noteStep.pitchUp();
      noteStep.edit();
    }

    // Pitch down
    // if ($(this).hasClass("pitch-down")) {
    //   noteStep.pitchDown();
    //   noteStep.edit();
    // }

    // Offset up
    if ($(this).hasClass("offset-up")) {
      noteStep.offsetUp();
      noteStep.edit();
    }
  });

  // Toggle CC visibility button
  $(document).on("click", ".toggle-cc", function () {
    const group = findGroupOnClick(this);
    group.toggleCcVisibility();
  });

  // Keyboard panel
  $(document).on("click", "#keyboard-panel-arrow", function () {
    if ($(".keyboard-panel").hasClass("hidden")) {
      $(".keyboard-panel").removeClass("hidden").addClass("show");
      return;
    }
    $(".keyboard-panel").removeClass("show").addClass("hidden");
  });

  // Load keyboard
  setKeyboard(new Keyboard(36, 77));
  setCurrentChord(new Chord("Current"));
  getCurrentChord().listen();
  const currentChord = getCurrentChord();
  currentChord.notes = [60, 64, 67, 72]; // C major as default
  getKeyboard().displayCurrentChord();
  currentChord.updateKeyNos();

  // Queue section button
  $(document).on("click", ".queue-section", function () {
    // Only if loop is playing
    if (!getLoopOn()) return;
    $(this).addClass("blink");
    let sectionId = $(this).closest(".section-tab").attr("id");
    sectionId = sectionId.slice(0, -4); // Remove "-tab" from id
    // Find section object in project
    const sections = getProject().sections;
    const section = findObjectById(sections, sectionId);
    section.queue();
  });

  // Console log project object and current chord
  $(document).on("click", "#log-project", function () {
    console.log(getProject());
    console.log(getCurrentChord());
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
