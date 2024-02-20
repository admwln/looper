import { getProject, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Instrument {
  constructor(name, sectionId) {
    this.id = "ins" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.midiOut = WebMidi.outputs[0].name;
    this.midiChannel = 1;
    this.groups = [];
    this.muted = false;
    this.sectionId = sectionId;
    const project = getProject();
    // Find section object in project.sections array by id
    const section = project.sections.find(
      (section) => section.id === sectionId
    );
    // Add instrument to section.instruments array
    section.instruments.push(this);
    this.displayInstrument(sectionId);
    console.log(`Instrument "${this.name}" created`);
  }

  displayInstrument(sectionId) {
    $("#" + sectionId).append(
      `
      <section class="instrument" id='${this.id}'>
        <div class='heading-container'>
          <h3 class="instrument-heading">${this.name}</h3>
          <button class='edit-heading'><i class="fa-solid fa-pencil"></i></button>
        </div>
      </section>`
    );

    // Display midi output options in select dropdown
    const outputOptions = WebMidi.outputs.map(
      (output) => `<option value='${output.name}'>${output.name}</option>`
    );

    const selectOutputs = `
      <select class='outputs'>
        <option value=''>Select Output</option>
        ${outputOptions}
      </select>
      <div><button class='add-group'><i class="fa-solid fa-plus"></i> Group</button></div>
      `;

    $("#" + this.id).append(selectOutputs);

    // Select this.midiOut in dropdown as default
    $("#" + this.id + " .outputs").val(this.midiOut);

    // Add event listener for changing midi output
    $("#" + this.id + " .outputs").on("change", (e) => {
      this.midiOut = e.target.value;
      console.log(`Midi output for ${this.name} changed to ${this.midiOut}`);
    });
  }
}
