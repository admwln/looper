import { getProject, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Section {
  constructor(name) {
    this.id = "sec" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.instruments = [];
    this.selected = true;
    // NEW! How to use this? Should the selected section be queued until the next section is queued?
    this.queued = false;
    // Find instrument object in project.instruments array by id
    const project = getProject();
    project.sections.push(this);
    // this.displayInstrument(instrumentIndex);
    this.displaySection();
    console.log(`Section "${this.name}" created`);
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

    $(".section-tab-row").append(
      `
      <div class="section-tab" id="${this.id}-tab">
        <button class="section-tab-button" id=${this.id}-tab-button'>
          <h2>${this.name}</h2>
        </button>
        <button class="queue-section hide"><i class="fa-solid fa-play"></i></button>
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
