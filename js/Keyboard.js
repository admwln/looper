import Chord from "./Chord.js";
import Key from "./Key.js";

import {
  getProject,
  findObjectById,
  setIdCounter,
  getIdCounter,
  getCurrentChord,
} from "./helper-functions.js";

export default class Keyboard {
  constructor(startNote, keyCount) {
    this.id = "kbd" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.keyCount = keyCount;
    this.startNote = startNote;
    this.keys = [];
    // Keys array will contain Key objects, each with a midiNote property.
    for (let i = 0; i < keyCount; i++) {
      const key = new Key(startNote + i, this);
      this.keys.push(key);
    }
    this.display();
    this.listen();
  }

  display() {
    $(".keyboard-content").append(
      `
      <ul class='keyboard' id='${this.id}'>
        ${this.keys.map((key) => key.html).join("")}
      </ul>
      `
    );
  }

  listen() {
    const keyboard = this;
    // Listen for keyboard key clicks
    $(document).on("click", `.key`, function () {
      const keyId = $(this).attr("id");
      const key = findObjectById(keyboard.keys, keyId);
      key.toggle();
    });

    // Listen for save chord button click
    $(document).on("click", "#save-chord", function () {
      keyboard.saveChord();
    });
  }

  saveChord() {
    // Promt user for chord name
    const chordName = prompt("Enter chord name");
    const chord = new Chord(chordName);
    getCurrentChord().notes.forEach((note) => {
      chord.addNote(note);
    });
    // Push to project chords array
    getProject().chords.push(chord);
    console.log("saved chord", chord);
  }
}
