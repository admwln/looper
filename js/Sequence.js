import { getProject, setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Sequence {
  constructor() {
    this.id = "sns" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    // On constructino, generic sequence should be populated with 16n steps * current measure length
    // We may have to pass the current measure length as an argument to the constructor
    this.steps = [];
  }
}
