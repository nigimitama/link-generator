var idNumber = 0;

function init() {
  setupButtons();
  renderSettingsDiv();
}

function setupButtons() {
  let saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", saveSettings);
  let addButton = document.getElementById("addButton");
  addButton.addEventListener("click", addForm);
  let restoreButton = document.getElementById("restoreButton");
  restoreButton.addEventListener("click", restoreSettings);
}

function addForm() {
  let formDiv = createFormDiv();
  const isMultiLines = true;
  getFormatInput(formDiv, isMultiLines);
  let nameHeader = formDiv.querySelectorAll(".lg-name")[0];
  nameHeader.innerText = "(new format)";
  let settingsDiv = document.getElementById("settingsDiv");
  settingsDiv.appendChild(formDiv);
}

function deleteForm(id) {
  let div = document.getElementById(id);
  div.hidden = true;
}

function renderSettingsDiv() {
  let settingsDiv = document.getElementById("settingsDiv");
  chrome.storage.sync.get(["formats"], (storage) => {
    var formats = storage.formats;
    for (const format of formats) {
      let formDiv = createFormDiv();
      let nameElements = formDiv.querySelectorAll(".lg-name");
      let nameHeader = nameElements[0];
      nameHeader.innerText = format["name"];
      let nameInput = nameElements[1];
      nameInput.value = format["name"];
      const isTextFormat = format["format"] != null;
      if (isTextFormat) {
        const isMultiLines = format["format"].includes("\n");
        let formatInput = getFormatInput(formDiv, isMultiLines);
        formatInput.value = format["format"];
      }
      settingsDiv.appendChild(formDiv);
    }
  });
}

function clearSettingDiv() {
  let settingsDiv = document.getElementById("settingsDiv");
  var child;
  while (settingsDiv.children.length > 0) {
    child = settingsDiv.children[0];
    settingsDiv.removeChild(child);
  }
}

function getFormatInput(formDiv, isMultiLines) {
  const inputs = formDiv.querySelectorAll(".lg-format");
  let formatInput = isMultiLines ? inputs[1] : inputs[0];
  formatInput.hidden = false;
  return formatInput;
}

function createFormDiv() {
  // clone template div
  let div = document.getElementById("formTemplate").cloneNode(true);
  div.removeAttribute("id");
  div.hidden = false;
  // setup delete button
  const id = `form${idNumber}`;
  div.id = id;
  idNumber += 1;
  let deleteButton = div.querySelector(".lg-delete-button");
  deleteButton.addEventListener("click", () => {
    deleteForm(id);
  });
  return div;
}

function receiveInputs() {
  var formats = [];
  for (let i = 0; i <= idNumber; i++) {
    let formDiv = document.getElementById(`form${i}`);
    if (formDiv != null && !formDiv.hidden) {
      let name = formDiv.querySelectorAll(".lg-name")[1].value;
      let formatTags = formDiv.querySelectorAll(".lg-format");
      var format = null;
      for (let formatTag of formatTags) {
        if (!formatTag.hidden) {
          format = formatTag.value;
          break;
        }
      }
      format = format == "" ? null : format;
      const allNull = name == "" && format == null;
      if (!allNull) {
        formats.push({ name: name, format: format });
      }
    }
  }
  return formats;
}

function saveSettings() {
  const formats = receiveInputs();
  chrome.storage.sync.set({ formats: formats });
  let notice = document.getElementById("saveNotice");
  notice.hidden = false;
  clearSettingDiv();
  renderSettingsDiv();
}

function restoreSettings() {
  const defaultFormats = [
    { name: "HTML (rendered)", format: null },
    { name: "Markdown", format: "[%title%](%url%)" },
    { name: "Plain Text", format: "%title%\n%url%" },
  ];
  chrome.storage.sync.set({ formats: defaultFormats });
  clearSettingDiv();
  renderSettingsDiv();
  let notice = document.getElementById("restoreNotice");
  notice.hidden = false;
}

init();
