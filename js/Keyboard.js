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
      keyboard.selectChord(this);
      keyboard.selectChordButton(this);
    });
  }

  saveChord() {
    const chordName = prompt("Enter chord name");
    const chord = new Chord(chordName);
    const currentChordNotes = [...getCurrentChord().notes]; // Using spread operator for shallow copy
    currentChordNotes.forEach((note) => {
      chord.notes.push(note);
    });
    getProject().chords.push(chord);
    this.updateChordList();
    this.selectChordButton($(`#${chord.id} .select-chord`));
  }

  deleteChord() {
    this.clear();
    // Remove all notes from current chord
    getCurrentChord().notes = [];
    const chordName = getCurrentChord().name;
    const chords = getProject().chords;
    const index = chords.findIndex((chord) => chord.name === chordName);
    chords.splice(index, 1);
    this.updateChordList();
    getCurrentChord().updateKeyNos();
    getCurrentChord().name = "Current";
  }

  selectChord(element) {
    const chordId = $(element).parent().attr("id");
    const chord = findObjectById(getProject().chords, chordId);
    this.clear();
    // Set current chord to selected chord
    const currentChord = getCurrentChord();
    currentChord.notes = [];
    // Copy of selected chord notes
    const selectedChordNotes = [...chord.notes];
    selectedChordNotes.forEach((note) => {
      currentChord.notes.push(note);
    });
    currentChord.name = chord.name;
    // Update keyboard
    this.keys.forEach((key) => {
      if (currentChord.notes.includes(key.midiNote)) {
        key.on = true;
        $(`#${key.id}`).addClass("on");
      }
    });
    currentChord.updateKeyNos();
  }

  selectChordButton(element) {
    $(element).parent().addClass("selected");
    $(element).parent().siblings().removeClass("selected");
  }

  clear() {
    this.keys.forEach((key) => {
      if (key.on) {
        key.on = false;
        $(`#${key.id}`).removeClass("on");
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
