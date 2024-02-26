import DynamicInterval from "./DynamicInterval.js";
import StepNoSeq from "./StepNoSeq.js";
import StepSeq from "./StepSeq.js";
import StepNo from "./StepNo.js";
import NoteStep from "./NoteStep.js";
import ControllerStep from "./ControllerStep.js";
import DotIndicator from "./DotIndicator.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  getStepWidth,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class Group {
  constructor(parentInstrument, instrumentId) {
    this.id = "grp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    // Groups default to midi channel 1 on their respective instrument's output
    this.midiChannel = 1;
    this.sequences = [];
    this.ccVisibility = false;
    this.muted = false;
    this.dynamicInterval = {};
    this.masterGroup = false;
    this.autoScroll = true;
    this.measureLength = 16; // NB! Should be updated dynamically
    this.groupLength = 16; // NB! Should be updated dynamically
    this.dotIndicator = new DotIndicator(this);
    this.parentInstrument = parentInstrument;
    this.instrumentId = instrumentId;
    //this.sectionId = this.parentInstrument.parentSection.id;
    // Add group to instrument
    //instrument.groups.push(this);

    this.displayGroup();
    this.newStepNoSeq();
    this.newStepSeq();
    //new StepSeq(this.id, measureLength);
    console.log(`Group created`);
  }

  newStepNoSeq() {
    const stepNoSeq = new StepNoSeq(this, this.id, this.measureLength);
    this.sequences.push(stepNoSeq);
    return stepNoSeq;
  }

  newStepSeq() {
    const stepSeq = new StepSeq(this, this.measureLength);
    this.sequences.push(stepSeq);
    return stepSeq;
  }

  displayGroup() {
    $("#" + this.parentInstrument.id).append(
      `
      <section class='group' id='${this.id}'>
        <div class='scroll-container'></div>
        <div class='group-settings'>
          <div>
            <button class='scroll-group left'><i class='fa-solid fa-chevron-left'></i></button>
            <div class='dot-indicator'></div>
            <button class='scroll-group right'><i class='fa-solid fa-chevron-right'></i></button>
          </div>
          <div>
            <button class="add-step"><i class='fa-solid fa-plus'></i> Step</button>
            <button class="delete-step" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
            <button class="add-bar"><i class='fa-solid fa-plus'></i> Bar</button>
            <button class="delete-bar" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
            <button class="add-step-seq"><i class='fa-solid fa-plus'></i> Sequence</button>
            <button class="delete-step-seq" style="margin-right:24px"><i class='fa-solid fa-minus'></i></button>
            <button class="toggle-cc" style="margin-right:24px">CC</button>
            <label for="master-group-${this.id}">Master</label>
            <input type="radio" class="master-group-radio" name="master-group-section-${this.sectionId}" id="master-group-${this.id}" value="${this.id}" checked="checked" />
          </div>
        </div>
      </section>
      `
    );

    this.dotIndicator.displayDots();
  }

  scrollRight(width, current) {
    if (current)
      this.dotIndicator.setCurrentDot(this.dotIndicator.currentDot + 1);
    this.dotIndicator.displayDots();
    $(`#${this.id} .scroll-container`).animate(
      { scrollLeft: `+=${width}px` },
      125
    );
  }

  scrollLeft(width, current) {
    if (current)
      this.dotIndicator.setCurrentDot(this.dotIndicator.currentDot - 1);
    this.dotIndicator.displayDots();
    $(`#${this.id} .scroll-container`).animate(
      { scrollLeft: `-=${width}px` },
      125
    );
  }

  // Extend group by x number of steps
  extendGroup(stepsToAdd, stepCount) {
    // Extend groupLength by x number of steps
    this.groupLength += stepsToAdd;

    for (let i = 1; i <= stepsToAdd; i++) {
      // There is always just one StepNoSeq per group, add one StepNo to it
      const stepNoSeqId = this.sequences[0].id;
      const newStepNo = new StepNo("16n", 84, stepCount + i, stepNoSeqId);
      //this.sequences[0].steps.push(newStepNo);
      newStepNo.displayStepNo(stepNoSeqId);

      // How many sequences of the kind StepSeq are there in this group?
      const stepSeqs = this.sequences.filter(
        (sequence) => sequence.constructor.name === "StepSeq"
      ).length;
      for (let j = 0; j < stepSeqs; j++) {
        // For each step sequence, add a noteStep
        const stepSeqId = this.sequences[j + 1].id;
        const newNoteStep = new NoteStep("16n", 84, 1, 80, stepSeqId);
        // Find the stepSeq object in project by using stepSeqId
        const sequences = findAllNestedProps(getProject(), "sequences");
        const stepSeq = findNestedProp(sequences, stepSeqId);
        // Push newNoteStep into stepSeq.noteSteps
        newNoteStep.pushNoteStep(stepSeq);
        // Show newNoteStep in DOM
        newNoteStep.displayNoteStep(stepSeqId);
        // For each step sequence, add a controllerStep
        const newControllerStep = new ControllerStep("16n", 84, stepSeqId);
        // Push newControllerStep into stepSeq.controllerSteps
        newControllerStep.pushControllerStep(stepSeq);
        // Show newControllerStep in DOM
        newControllerStep.displayControllerStep(stepSeqId, this.id);
      }
    }
    // Update dot indicator
    this.dotIndicator.extendShorten(this);
    // Scroll right
    this.scrollRight(stepCount * getStepWidth());
    console.log(`Group extended by ${stepsToAdd} steps`);
  }

  // Shorten group by x number of steps
  shortenGroup(stepsToDelete, stepCount) {
    // Check if stepsToDelete is greater than stepCount, if so, set stepsToDelete to stepCount,
    // this in order to avoid negative values
    stepsToDelete > stepCount ? (stepsToDelete = stepCount) : null;

    // Shorten groupLength by x number of steps
    this.groupLength -= stepsToDelete;

    // How many sequences of the kind StepSeq are there in this group?
    const stepSeqs = this.sequences.filter(
      (sequence) => sequence.constructor.name === "StepSeq"
    ).length;

    for (let j = 0; j < stepSeqs; j++) {
      for (let i = 1; i <= stepsToDelete; i++) {
        // Get noteStep to remove
        // Get noteStep count of the current stepSeq
        const noteStepCount = this.sequences[j + 1].noteSteps.length;
        // For each step sequence, remove a noteStep
        // +1 to skip the first sequence, which is always a StepNoSeq
        const stepSeqId = this.sequences[j + 1].id;
        // Find the stepSeq object in project by using stepSeqId
        const sequences = findAllNestedProps(getProject(), "sequences");
        const stepSeq = findNestedProp(sequences, stepSeqId);
        // Delete last noteStep from stepSeq.noteSteps
        const noteStepToRemove = stepSeq.noteSteps[noteStepCount - 1];

        // Get controllerStep to remove
        // Get controllerStep count of the current stepSeq
        const controllerStepCount =
          this.sequences[j + 1].controllerSteps.length;
        const controllerStepToRemove =
          stepSeq.controllerSteps[controllerStepCount - 1];

        // Check if noteStepToRemove or controllerStepToRemove don't have noteName 16n, if so break the loop
        if (
          noteStepToRemove.noteName != "16n" ||
          controllerStepToRemove.noteName != "16n"
        ) {
          error = true;
          console.log("Can't delete steps w/ other value than 16n");
          break;
        }

        // Delete last noteStep from stepSeq.noteSteps
        noteStepToRemove.deleteNoteStep(stepSeqId);
        // Delete last controllerStep from stepSeq.controllerSteps
        controllerStepToRemove.deleteControllerStep(stepSeqId);

        // There is always just one StepNoSeq per group, remove one StepNo from it
        const stepNoSeqId = this.sequences[0].id;
        // Get last stepNo in stepNoSeq
        const stepNoToRemove = this.sequences[0].steps[stepCount - i];
        stepNoToRemove.deleteStepNo(stepNoSeqId);
      }
    }

    // Update dot indicator
    this.dotIndicator.extendShorten(this);
    this.dotIndicator.displayDots();

    console.log(`Group shortened by ${stepsToDelete} steps`);
  }

  deleteLastSeq(seqIndex) {
    this.sequences.pop();
    $("#" + this.id + " > div > div:eq(" + seqIndex + ")").remove();
  }

  toggleCcVisibility() {
    this.ccVisibility = !this.ccVisibility;
    // Find all controller seqs in this group
    const controllerSeqs = $("#" + this.id + " .controller-seq");
    // If ccVisibility is true, show all controller seqs
    // If ccVisibility is false, hide all controller seqs that are not on
    if (this.ccVisibility) {
      $(controllerSeqs).show();
    } else {
      $(controllerSeqs).each(function () {
        if ($(this).find(".on").length < 1) {
          $(this).hide();
        }
      });
    }
  }

  initDynamicInterval(stepNo, min, max) {
    const dynamicInterval = new DynamicInterval(
      stepNo,
      min,
      max,
      this.instrumentId
    );
    this.dynamicInterval = dynamicInterval;
    this.dynamicInterval.groupId = this.id;
    this.dynamicInterval.harvestSteps(this);
  }

  // Get section that this group belongs to
  getSection() {
    // const sectionId = this.sectionId;
    // // Get section object in project by using sectionId
    // const sections = findAllNestedProps(getProject(), "sections");
    // const section = findNestedProp(sections, sectionId);
    const section = this.parentInstrument.parentSection;
    return section;
  }

  makeMaster() {
    this.masterGroup = true;
    // Find all other groups in this section
    const section = this.parentInstrument.parentSection;
    const sectionInstruments = section.instruments;
    console.log("sectionInstruments", sectionInstruments);
    // Get all groups in this section
    const groups = [];
    sectionInstruments.forEach((instrument) => {
      groups.push(...instrument.groups);
    });
    // Set all other groups to masterGroup = false
    groups.forEach((group) => {
      if (group.id !== this.id) {
        group.masterGroup = false;
      }
    });
  }
}
