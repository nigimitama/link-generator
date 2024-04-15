function init(url, title) {
  setupEditForm(url, title);
  createLinkDivs(url, title);
}

function setupEditForm(url, title) {
  let currentUrl = document.getElementById("currentUrl");
  let currentTitle = document.getElementById("currentTitle");
  currentUrl.value = url;
  currentTitle.value = title;
  currentUrl.addEventListener("input", updateContents);
  currentTitle.addEventListener("input", updateContents);
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
      const isHtml = format["format"] == null;
      if (isHtml) {
        linkDiv = addLinkHtml(linkDiv, url, title, format);
        linkDiv = addCopyButton(linkDiv, format, isHtml);
      } else {
        linkDiv = addLinkText(linkDiv, url, title, format);
        linkDiv = addCopyButton(linkDiv, format, isHtml);
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
      const isHtml = format["format"] == null;
      if (isHtml) {
        addLinkHtml(linkDiv, url, title, format);
      } else {
        addLinkText(linkDiv, url, title, format);
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

function addCopyButton(linkDiv, format, isHtml) {
  const name = format["name"];
  // add copy button
  let button = linkDiv.querySelector(".lg-copy-button");
  button.addEventListener("click", (e) => {
    copyToClipboard(name, e.target, isHtml);
  });
  // NOTE: CSPの関係上onclickは許可されないが、addEventListenerは許可される
  return linkDiv;
}

function addLinkHtml(linkDiv, url, title, format) {
  // create a-tag
  let a = document.createElement("a");
  a.href = url;
  a.innerText = title;
  a.id = format["name"];
  // insert
  let linkOutputArea = linkDiv.querySelector(".linkOutputArea");
  linkOutputArea.replaceChildren(a);
  return linkDiv;
}

function formatLinkText(format, url, title) {
  const link = format.replace("%title%", title).replace("%url%", url);
  return link;
}

function genClipboardItems(target, isHtml) {
  if (isHtml) {
    console.log(target);
    const htmlBlob = new Blob([target.outerHTML], { type: "text/html" });
    const plainBlob = new Blob([target.href], { type: "text/plain" });
    const data = [new ClipboardItem({ "text/html": htmlBlob, "text/plain": plainBlob })];
    return data;
  } else {
    const plainBlob = new Blob([target.value], { type: "text/plain" });
    const data = [new ClipboardItem({ "text/plain": plainBlob })];
    return data;
  }
}

function copyToClipboard(name, button, isHtml) {
  const target = document.getElementById(name);
  const data = genClipboardItems(target, isHtml);

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

      console.log(`copy failed. (details: ${msg})`);
    }
  );
}

// get current tab when this extension is clicked
window.onload = async function onLoad() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  init(tab.url, tab.title);
};
