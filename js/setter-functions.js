let _project = {};

export function setProject(newProject) {
  _project = newProject;
}

export function getProject() {
  return _project;
}

let _idCounter = 0;

export function setIdCounter(newValue) {
  _idCounter = newValue;
}

export function getIdCounter() {
  return _idCounter;
}

let _repeatCounter = 0;

export function getRepeatCounter() {
  return _repeatCounter;
}

export function setRepeatCounter(newValue) {
  _repeatCounter = newValue;
}

export function increaseRepeatCounter() {
  _repeatCounter++;
}

let _loopOn = false;

export function getLoopOn() {
  return _loopOn;
}

export function setLoopOn(newValue) {
  _loopOn = newValue;
}

export function findAllNestedProps(obj, propName) {
  let results = [];
  if (obj.hasOwnProperty(propName)) {
    results.push(obj[propName]);
  }
  for (let i = 0; i < Object.keys(obj).length; i++) {
    if (typeof obj[Object.keys(obj)[i]] === "object") {
      results = results.concat(
        findAllNestedProps(obj[Object.keys(obj)[i]], propName)
      );
    }
  }
  return results;
}

export function findNestedProp(haystack, id) {
  let object = null;
  for (let i = 0; i < haystack.length; i++) {
    object = haystack[i].find((object) => object.id === id);
    if (object) break;
  }
  return object;
}

// Maybe make getNoteName() and getPixelValue() a method of Step or some
// kind of globally accessible function. This would mean that each step would
// only have to have a noteName - the pixelValue would be calculated as needed.
let noteMap = new Map([
  [21, "64n"],
  [63, "32n."],
  [42, "32n"],
  [126, "16n."],
  [84, "16n"],
  [28, "32t"],
  [252, "8n."],
  [168, "8n"],
  [56, "16t"],
  [504, "4n."],
  [336, "4n"],
  [112, "8t"],
  [1008, "2n."],
  [672, "2n"],
  [224, "4t"],
  [1344, "1n"],
]);

// original noteMap
// let noteMap = new Map([
//   [21, "64n"],
//   [63, "32n."],
//   [42, "32n"],
//   [126, "16n."],
//   [84, "16n"],
//   [28, "16t"],
//   [252, "8n."],
//   [168, "8n"],
//   [56, "8t"],
//   [504, "4n."],
//   [336, "4n"],
//   [112, "4t"],
//   [1008, "2n."],
//   [672, "2n"],
//   [224, "2t"],
//   [1344, "1n"],
//   [448, "1t"],
// ]);

export function getNoteName(pixelValue) {
  return noteMap.get(pixelValue);
}
