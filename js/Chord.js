import { setIdCounter, getIdCounter } from "./helper-functions.js";

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
  }

  removeNote(midiNote) {
    const index = this.notes.indexOf(midiNote);
    this.notes.splice(index, 1);
  }

  sortNotes() {
    this.notes.sort((a, b) => a - b);
  }
}
