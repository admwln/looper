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
    // Listen for keyboard keys
    $(document).on("click", `.key`, function () {
      const keyId = $(this).attr("id");
      const key = findObjectById(keyboard.keys, keyId);
      key.toggle();
    });

    // Listen for save chord button
    $(document).on("click", "#save-chord", function () {
      keyboard.saveChord();
    });

    // Listen for delete chord button
    $(document).on("click", "#delete-chord", function () {
      keyboard.deleteChord();
    });

    // Listen for select chord button
    $(document).on("click", ".select-chord", function () {
      const chordId = $(this).parent().attr("id");
      const chord = findObjectById(getProject().chords, chordId);
      keyboard.selectChord(chord);
    });
  }

  saveChord() {
    // Promt user for chord name
    const chordName = prompt("Enter chord name");
    const chord = new Chord(chordName);
    // Add all notes from current chord to new chord
    chord.notes = getCurrentChord().notes;
    // Push to project chords array
    getProject().chords.push(chord);
    // Update chord list
    this.updateChordList();
  }

  deleteChord() {
    const chordId = getCurrentChord().id;
    const chords = getProject().chords;
    const index = chords.findIndex((chord) => chord.id === chordId);
    chords.splice(index, 1);
    this.updateChordList();
    this.clear();
  }

  selectChord(chord) {
    this.clear();
    console.log("selecting chord", chord);
    // chord.notes.forEach((note) => {
    //   const key = findObjectById(this.keys, note);
    //   key.toggle();
    // });
  }

  clear() {
    this.keys.forEach((key) => {
      if (key.on) {
        key.toggle();
      }
    });
  }

  updateChordList() {
    const chords = getProject().chords;
    $(".chord-list").empty();
    chords.forEach((chord) => {
      $(".chord-list").append(
        `<div class='chord' id='${chord.id}'>
          <button class="select-chord">${chord.name}</button>
        </div>`
      );
    });
  }
}
