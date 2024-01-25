import { setIdCounter, getIdCounter } from "./setter-functions.js";

export default class Step {
  constructor(noteName, pixelValue) {
    this.id = "stp" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.noteName = noteName;
    this.pixelValue = pixelValue;
    this.state = "off";
  }

  toggleState() {
    if (this.state == "off") {
      this.state = "on";
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
}
