import Instrument from "./Instrument.js";
import { getProject, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Section {
  constructor(name) {
    this.id = "sec" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.instruments = [];
    this.selected = true;
    this.queued = false;
    getProject().sections.push(this);
    // this.displayInstrument(instrumentIndex);
    this.displaySection();
    console.log(`Section "${this.name}" created`);
  }

  newInstrument() {
    const instrument = new Instrument("Instrument", this, this.id);
    this.instruments.push(instrument);
    return instrument;
  }

  displaySection() {
    $(".project").append(
      `
      <section class="section" id='${this.id}'>
        <div>
          <button id='add-instrument'><i class="fa-solid fa-plus"></i> Instrument</button>
        </div>
      </section>
      `
    );

    $("#add-section-tab").remove();

    $(".section-tab-row").append(
      `
      <div class="section-tab" id="${this.id}-tab">
        <button class="queue-section hide"><i class="fa-solid fa-play"></i></button>
        <div class='heading-container'>
          <h2 class="section-heading" id=${this.id}-heading'>${this.name}</h2>
          <button class='edit-heading'><i class="fa-solid fa-pencil"></i></button>
        </div>
      </div>
      <div class="section-tab" id="add-section-tab">
        <div>
          <button class='add-section'><i class="fa-solid fa-plus"></i> Section</button>
        </div>
      </div>
      `
    );

    // Hide other sections
    this.selectSection();
  }

  // Set this to queued = true
  queue() {
    this.queued = true;
    // Set all other sections to queued = false
    const project = getProject();
    const sections = project.sections;
    sections.forEach((section) => {
      if (section.id != this.id) {
        section.queued = false;
      }
    });
  }

  selectSection() {
    // Get index of tab in getProject().sections array
    const sections = getProject().sections;
    const sectionIndex = sections.findIndex((section) => section.id == this.id);

    // Select section
    sections[sectionIndex].selected = true;
    // Deselect other sections
    sections.forEach((section) => {
      if (section.id != this.id) {
        section.selected = false;
      }
    });

    // Select tab
    $("#" + this.id + "-tab").addClass("selected");

    // Select section
    $("#" + this.id).addClass("selected");

    // Deselect other tabs
    $(".section-tab:not(#" + this.id + "-tab)").removeClass("selected");

    // Deselect other sections
    $(".section:not(#" + this.id + ")").removeClass("selected");
  }

  selectNext() {
    this.selectSection();
    // Remove blink and playing from all queue-section buttons
    $(`.queue-section`).removeClass("blink").removeClass("playing");
    // Add class playing to queue-section button
    $(`#${this.id}-tab .queue-section`).addClass("playing");
  }
}
