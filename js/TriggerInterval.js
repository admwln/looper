import {
  setIdCounter,
  getIdCounter,
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class TriggerInterval {
  constructor(stepNo, min, max) {
    this.id = "trg" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.stepNo = stepNo;
    this.min = min;
    this.max = max;
    this.steps = [];
  }
}
