import { getKeyboard, setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Chord {
  constructor(name) {
    this.id = "crd" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.name = name;
    this.notes = [];
  }

  setName(newName) {
    this.name = newName;
  }

  addNote(midiNote) {
    this.notes.push(midiNote);
    this.sortNotes();
    this.updateKeyNos();
  }

  removeNote(midiNote) {
    const index = this.notes.indexOf(midiNote);
    this.notes.splice(index, 1);
    this.updateKeyNos();
  }

  sortNotes() {
    this.notes.sort((a, b) => a - b);
  }

  updateKeyNos() {
    const keyboard = getKeyboard();
    const keys = keyboard.keys;
    // Find all keys with keys.on
    const currentKeys = keys.filter((key) => key.on);
    // For each key, find its index in currentKeys, and update the key-no span in the DOM
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const index = currentKeys.indexOf(key);

      if (index > -1) {
        $(`#${key.id} .key-no`).text(index + 1);
        continue;
      }
      $(`#${key.id} .key-no`).text("");
    }
  }
}
