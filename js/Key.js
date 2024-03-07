import {
  setIdCounter,
  getIdCounter,
  getCurrentChord,
} from "./helper-functions.js";

export default class Key {
  constructor(midiNote, parentKeyboard) {
    this.id = "key" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.midiNote = midiNote;
    this.color = this.getColor(midiNote);
    this.html = this.createHtml();
    this.on = false;
    this.parentKeyboard = parentKeyboard;
  }

  getColor(midiNote) {
    const black = [1, 3, 6, 8, 10]; // C notes are divisible by 12, so we can use the remainder to determine the color.
    const remainder = midiNote % 12;
    if (black.includes(remainder)) {
      return "black";
    }
    return "white";
  }

  createHtml() {
    return `<li class='key ${this.color}' id='${this.id}' data='${this.midiNote}'><span class="key-no"></span></li>`;
  }

  toggle() {
    $(`#${this.id}`).toggleClass("on");

    if (this.on) {
      this.on = false;
      getCurrentChord().removeNote(this.midiNote);

      return;
    }
    this.on = true;
    getCurrentChord().addNote(this.midiNote);
  }
}
