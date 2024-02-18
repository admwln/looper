import {
  getProject,
  findAllNestedProps,
  findNestedProp,
} from "./helper-functions.js";

export default class Editor {
  static editHeading(heading) {
    // Get class of heading element and remove '-heading' to get property name
    const property = $(heading).attr("class").split("-")[0];
    const propertyId = $(heading).parent().parent().attr("id");
    // Get text, width, padding and font size of heading
    const headingText = heading[0].innerText;
    const width = parseInt($(heading).width());
    const margin = parseInt($(heading).css("margin"));
    const fontSize = parseInt($(heading).css("font-size"));
    // Replace heading with input element
    $(heading).replaceWith(
      `<input type="text" class="heading-text-input" id="heading-input" value="${headingText}" style="width:${width}px;font-size:${fontSize}px;margin:${margin}px" />`
    );
    $("#heading-input").focus().select();

    // On focus out, replace input with heading with new text content
    $(document).on("focusout", "#heading-input", function () {
      const newText = $(this).val();

      if (property === "project") {
        $("#heading-input").replaceWith(
          `<h1 class="${property}-heading">${newText}</h3>`
        );
        getProject().name = newText;
      }

      if (property === "instrument") {
        $("#heading-input").replaceWith(
          `<h3 class="${property}-heading">${newText}</h3>`
        );
        const section = getProject().sections.find(
          (section) => section.selected === true
        );

        const instruments = section.instruments;
        // Find instrument object in section.instruments array by id
        const instrument = instruments.find(
          (instrument) => instrument.id === propertyId
        );
        instrument.name = newText;
      }
    });
  }
}
