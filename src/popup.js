// get current tab when this extension is clicked
window.onload = async function onLoad() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  init(tab.url, tab.title);
};

function init(url, title) {
  setupEditForm(url, title);
  createLinkDivs(url, title);
}

function setupEditForm(url, title) {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  currentUrl.value = url;
  currentTitle.value = title;
  currentUrl.addEventListener("input", function () {
    updateContents();
  });
  currentTitle.addEventListener("input", function () {
    updateContents();
  });
}

function createLinkDivs(url, title) {
  var linksDiv = document.getElementById("linksDiv");
  chrome.storage.sync.get(["formats"], (storage) => {
    var formats = storage.formats;
    for (let i = 0; i < formats.length; i++) {
      let format = formats[i];
      let name = format["name"];
      // add new div
      let linkDiv = createLinkDiv();
      linkDiv.id = `link-${i}`;
      // add header
      let header = linkDiv.querySelector(".lg-header");
      header.innerText = name;
      // add link text
      const asText = format["format"] != null;
      if (asText) {
        linkDiv = addLinkText(linkDiv, url, title, format);
        linkDiv = addCopyButton(linkDiv, format);
      } else {
        linkDiv = addLinkHtml(linkDiv, url, title);
      }
      linksDiv.appendChild(linkDiv);
    }
  });
}

function createLinkDiv() {
  let linkDiv = document.getElementById("contentTemplate").cloneNode(true);
  linkDiv.removeAttribute("id");
  linkDiv.classList.add("lg-link-div");
  linkDiv.hidden = false;
  return linkDiv;
}

function updateContents() {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  updateLinkDivs(currentUrl.value, currentTitle.value);
}

function updateLinkDivs(url, title) {
  chrome.storage.sync.get(["formats"], (storage) => {
    var formats = storage.formats;
    for (let i = 0; i < formats.length; i++) {
      let format = formats[i];
      // get linkDiv
      let linkDiv = document.getElementById(`link-${i}`);
      // update link text
      const asText = format["format"] != null;
      if (asText) {
        addLinkText(linkDiv, url, title, format);
      } else {
        addLinkHtml(linkDiv, url, title);
      }
    }
  });
}

function addLinkText(linkDiv, url, title, format) {
  const name = format["name"];
  const link = formatLinkText(format["format"], url, title);
  // add link text
  let linkTexts = linkDiv.querySelectorAll(".lg-link-text");
  const isMultiLines = format["format"].includes("\n");
  let linkText = isMultiLines ? linkTexts[1] : linkTexts[0];
  linkText.value = link;
  linkText.id = name;
  linkText.hidden = false;
  return linkDiv;
}

function addCopyButton(linkDiv, format) {
  const name = format["name"];
  // add copy button
  let button = linkDiv.querySelector(".lg-copy-button");
  button.addEventListener("click", function (e) {
    copyToClipboard(name, e.target);
  });
  // NOTE: CSPの関係上onclickは許可されないが、addEventListenerは許可される
  return linkDiv;
}

function addLinkHtml(linkDiv, url, title) {
  let containerDiv = linkDiv.querySelector(".container");
  linkDiv.removeChild(containerDiv);
  // add a-tag
  let a = document.createElement("a");
  a.href = url;
  a.innerText = title;
  a.classList.add("container");
  linkDiv.appendChild(a);
  return linkDiv;
}

function formatLinkText(format, url, title) {
  const link = format.replace("%title%", title).replace("%url%", url);
  return link;
}

function copyToClipboard(name, button) {
  let target = document.getElementById(name);
  const plainBlob = new Blob([target.value], { type: "text/plain" });
  const data = [new ClipboardItem({ "text/plain": plainBlob })];

  const btn_default = "btn-outline-secondary";
  const btn_success = "btn-outline-success";
  const btn_failure = "btn-outline-danger";

  navigator.clipboard.write(data).then(
    () => {
      /* success */
      button.classList.remove(btn_default);
      button.classList.remove(btn_failure);
      button.classList.add(btn_success);
      button.innerText = "copied";
    },
    (msg) => {
      /* failure */
      button.classList.remove(btn_default);
      button.classList.remove(btn_success);
      button.classList.add(btn_failure);
      button.innerText = "failed";

      console.log(`copy failed. message: ${msg}`);

      target.select();
      document.execCommand("copy");
    }
  );
}
