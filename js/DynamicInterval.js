import TriggerInterval from "./TriggerInterval.js";
import {
  setIdCounter,
  getIdCounter,
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class DynamicInterval extends TriggerInterval {
  constructor(stepNo, min, max) {
    super(stepNo, min, max);
    this.id = "dtr" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.groupId = "";
  }

  play(intervalNo) {
    console.log("Playing", this);
  }

  update(stepCount) {
    const newStepNo = this.stepNo + 1;
    if (newStepNo > stepCount) {
      this.min = 0;
      this.max = Tone.Time("16n").toMilliseconds() - 1;
      this.stepNo = 1;
      return;
    }

    const newMin = this.max + 1;
    const newMax = newMin + Tone.Time("16n").toMilliseconds() - 1;

    this.min = newMin;
    this.max = newMax;
    this.stepNo = newStepNo;
  }
}
