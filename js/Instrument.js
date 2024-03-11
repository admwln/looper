import Group from "./Group.js";
import {
  getProject,
  getCurrentChord,
  setIdCounter,
  getIdCounter,
} from "./helper-functions.js";

export default class Instrument {
  constructor(name, parentSection, sectionId) {
    this.id = "ins" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.midiOut = WebMidi.outputs[0].name;
    this.midiChannel = 1;
    this.groups = [];
    this.muted = false;
    this.parentSection = parentSection;
    this.sectionId = sectionId;
    this.lockedChord = null;
    this.displayInstrument(this.parentSection.id);
    this.listen();
    console.log(`Instrument "${this.name}" created`);
  }

  newGroup() {
    const group = new Group(this);
    this.groups.push(group);
    return group;
  }

  displayInstrument(sectionId) {
    // Remove .add-instrument button from section
    $("#" + sectionId + " .add-instrument").remove();

    $("#" + sectionId).append(
      `
      <section class="instrument" id='${this.id}'>
        <div class='instrument-tool-row'>
          <div class='heading-container'>
            <h3 class="instrument-heading">${this.name}</h3>
            <button class='edit-heading'><i class="fa-solid fa-pencil"></i></button>
          </div>
        </div>
      </section>
      <div>
        <button class='add-instrument'><i class="fa-solid fa-plus"></i> Instrument</button>
      </div>
      `
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
      <button class='mute-instrument' style='margin-left: 12px;'><i class="fa-solid fa-volume-mute"></i></button>
      <div>
        <button class='add-group'><i class="fa-solid fa-plus"></i> Group</button>
      </div>
      <div class="lock-chord">
        <button class='lock-chord-btn'><i class="fa-solid fa-lock"></i></button> <span class='locked-chord-name'></span>
      </div>
      `;

    $("#" + this.id + " .instrument-tool-row").append(selectOutputs);

    // Select this.midiOut in dropdown as default
    $("#" + this.id + " .outputs").val(this.midiOut);

    // Add event listener for changing midi output
    $("#" + this.id + " .outputs").on("change", (e) => {
      this.midiOut = e.target.value;
      console.log(`Midi output for ${this.name} changed to ${this.midiOut}`);
    });
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  listen() {
    $("#" + this.id + " .lock-chord-btn").on("click", () => {
      const currentChord = getCurrentChord();
      if (currentChord && !this.lockedChord) {
        this.lockChord();
        return;
      }
      this.unlockChord();
    });
  }

  lockChord() {
    const currentChord = getCurrentChord();
    // Find chord in project chords by id
    const projectChords = getProject().chords;
    const lockedChord = projectChords.find(
      (chord) => chord.id === currentChord.id
    );
    this.lockedChord = lockedChord;
    $("#" + this.id + " .locked-chord-name").text(lockedChord.name);
    $("#" + this.id + " .lock-chord-btn").toggleClass("locked");
  }

  unlockChord() {
    this.lockedChord = null;
    $("#" + this.id + " .locked-chord-name").text("");
    $("#" + this.id + " .lock-chord-btn").toggleClass("locked");
  }
}
