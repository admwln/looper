import Key from "./Key.js";

import {
  getProject,
  findObjectById,
  setIdCounter,
  getIdCounter,
  getCurrentChord,
  getKeyboard,
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
      getCurrentChord().save();
    });

    // Listen for delete chord button
    $(document).on("click", "#delete-chord", function () {
      getCurrentChord().delete();
    });

    // Listen for select chord button
    $(document).on("click", ".select-chord", function () {
      const chordId = $(this).parent().attr("id");
      const chord = findObjectById(getProject().chords, chordId);
      chord.select();
      chord.selectButton();
    });
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
