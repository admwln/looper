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
