import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class HeadingEditor {
  constructor(heading) {
    this.property = $(heading).attr("class").split("-")[0];
    this.text = heading[0].innerText;
    this.width = parseInt($(heading).width());
    this.margin = parseInt($(heading).css("margin"));
    this.fontSize = parseInt($(heading).css("font-size"));
    this.heading = heading;
  }

  edit() {
    $(this.heading).replaceWith(
      `<input type="text" class="heading-text-input" id="heading-input" value="${this.text}" style="min-width:100px;max-width:${this.width}px;font-size:${this.fontSize}px;margin:${this.margin}px" />`
    );
    $("#heading-input").select();

    // Better off not using "this" inside event listener, use object instead
    const object = this;

    // Listen for change in temporary input field
    const headingInput = document.getElementById("heading-input");
    headingInput.addEventListener("change", function () {
      const newText = $("#heading-input").val();

      if (object.property == "project") {
        $("#heading-input").replaceWith(
          `<h1 class="project-heading">${newText}</h3>`
        );
        getProject().name = newText;
      }

      if (object.property == "section") {
        let sectionId = $("#heading-input").parent().parent().attr("id");
        sectionId = sectionId.split("-")[0];
        const section = getProject().sections.find(
          (section) => section.id === sectionId
        );
        $("#heading-input").replaceWith(
          `<h2 class="section-heading" id="${sectionId}-heading">${newText}</h2>`
        );
        section.name = newText;
      }

      if (object.property == "instrument") {
        const section = getProject().sections.find(
          (section) => section.selected === true
        );
        let instrumentId = $("#heading-input").parent().parent().attr("id");
        $("#heading-input").replaceWith(
          `<h3 class="instrument-heading">${newText}</h3>`
        );

        const instruments = section.instruments;
        // Find instrument object in section.instruments array by id
        const instrument = instruments.find(
          (instrument) => instrument.id === instrumentId
        );
        instrument.name = newText;
      }
    });
  }
}
