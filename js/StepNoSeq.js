import StepNo from "./StepNo.js";
import {
  getProject,
  setIdCounter,
  getIdCounter,
  findAllNestedProps,
  findNestedProp,
} from "./setter-functions.js";

export default class StepNoSeq {
  constructor(groupId, measureLength) {
    this.id = "sns" + (getIdCounter() + 1);
    setIdCounter(getIdCounter() + 1);
    this.steps = [];
    const groups = findAllNestedProps(getProject(), "groups");
    const group = findNestedProp(groups, groupId);
    // Add step no sequence to group
    group.sequences.push(this);
    this.initStepNoSeq(groupId, measureLength);
  }

  initStepNoSeq(groupId, measureLength) {
    // Create div to contain steps
    $("#" + groupId + " .scroll-container").append(
      `<div class="step-no-seq" id="${this.id}"></div>`
    );

    for (let i = 1; i <= measureLength; i++) {
      const stepNo = new StepNo("16n", 84, i, this.id);
      //this.steps.push(stepNo);
      stepNo.displayStepNo(this.id);
    }

    console.log(`Step no seq created`);
  }

  flashStepNo(time) {
    // time = time * 1000;
    // console.log(`Flashing step no at: ${time}`);
    // Find index of step to flash
    const index = $("#" + this.id + " .to-flash").index();
    //console.log(`Index of step to flash: ${index}`);
    const stepNoId = this.steps[index].id;

    $("#" + stepNoId).animate({ opacity: 1 }, 0, () => {
      $("#" + stepNoId)
        //.css("color", "rgb(255,105,180)")
        .css("border-color", "rgb(65, 173, 255)");
      $("#" + stepNoId).animate(
        { opacity: 1 },
        Tone.Time("8n").toSeconds(),
        () => {
          $("#" + stepNoId)
            //.css("color", "rgb(65, 173, 255)")
            .css("border-color", "#3a4a5e");
        }
      );
    });

    $("#" + this.id + " .to-flash").removeClass("to-flash");
    // The percentage is used to find the next step to flash by adding 1
    // to the index and taking the remainder of the length of the steps array
    const nextStepNoId = this.steps[(index + 1) % this.steps.length].id;
    // Add class to flash next step
    $("#" + nextStepNoId).addClass("to-flash");
  }
}
