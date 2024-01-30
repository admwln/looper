import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Section {
  constructor(name) {
    this.id = "sec" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.instruments = [];
    this.selected = true;
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
        <input type='text' class='instrument-name' name='instrument-name' placeholder='Instrument name' />
      </section>
      `
    );

    $(".section-tab-row").append(
      `
      <button class="section-tab" id='${this.id}-tab'>
        <h2>${this.name}</h2>
      </button>
      `
    );

    // Hide other sections
    this.selectSection();
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
}
