import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Section {
  constructor(name) {
    this.id = "sec" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.instruments = [];
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
        <h2>${this.name}</h2>
        <div>
          <button id='add-instrument'><i class="fa-solid fa-plus"></i> Instrument</button>
          </div>
        <input type='text' class='instrument-name' name='instrument-name' placeholder='Instrument name' />
      </section>
      `
    );
  }
}
