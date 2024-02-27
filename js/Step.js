import { setIdCounter, getIdCounter } from "./helper-functions.js";

export default class Step {
  constructor(noteName, pixelValue) {
    this.id = "stp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteName = noteName;
    this.pixelValue = pixelValue;
    this.state = "off";
    this.msFromIntStart = 0;
  }

  toggleState() {
    if (this.state == "off") {
      this.state = "on";
      this.updateMsFromLoopStart();
      $("#" + this.id)
        .removeClass("off")
        .addClass("on");
    } else {
      this.state = "off";
      $("#" + this.id)
        .removeClass("on")
        .addClass("off");
    }
  }

  updateStep() {
    $("#" + this.id).css("width", this.pixelValue);
    $("#" + this.id).attr("data", this.noteName);
  }

  getMsFromIntStart(stepNo) {
    // stepNo of triggerInterval
    const msFromIntStart =
      this.msFromLoopStart - (stepNo - 1) * Tone.Time("16n").toMilliseconds();
    return msFromIntStart;
  }

  setMsFromIntStart(stepNo) {
    // stepNo of dynamicInterval
    const msFromIntStart =
      this.msFromLoopStart - (stepNo - 1) * Tone.Time("16n").toMilliseconds();
    this.msFromIntStart = msFromIntStart;
  }
}
